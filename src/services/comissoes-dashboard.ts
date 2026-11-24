import { supabase } from '@/lib/supabase/client'
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns'
import type { FaixaBase } from '@/services/comissoes'
import { fetchAjustesAtivosMap, type ComissaoAjuste } from '@/services/comissao-ajustes'

export interface ComissaoVenda {
  id: string
  paciente_nome: string
  data_fechamento: string | null
  valor_tratamento: number
  valor_entrada: number
  percentual_entrada: number
  dentista_avaliador: string | null
  dentista_nome: string | null
  crc: string | null
  crc_nome: string | null
  percentual_comissao_dentista: number
  valor_comissao_dentista: number
  percentual_comissao_crc: number
  valor_comissao_crc: number
  status_comissao: string | null
  ajuste?: ComissaoAjuste | null
}

export interface DashboardTotals {
  totalComissaoDentista: number
  totalComissaoCRC: number
  totalVendas: number
  totalEntries: number
  /** Média dos totais do grupo (só o painel de total usa; cartões são isolados). */
  pctMedioDentista?: number
  taxaDentista?: number
  pctMedioCRC?: number
  taxaCRC?: number
}

export interface ProfessionalSummary {
  id: string
  nome: string
  tipo: 'Dentista' | 'CRC'
  /** Volume do período — TODAS as vendas. É a base do % de entrada. */
  totalVendas: number
  totalEntries: number
  entryPercentage: number
  commissionRate: number
  totalComissao: number
  qtdeVendas: number
  comissaoAberta: number
  comissaoPaga: number
  /** Vendas sem entrada no período: aparecem à parte e NÃO comissionam. */
  qtdSemEntrada?: number
  valorSemEntrada?: number
  /** Vendas com pagamento adiado (ajuste ativo): fora deste fechamento. */
  qtdAdiada?: number
  valorAdiada?: number
  /** Volume que efetivamente recebe comissão (período − sem entrada). */
  baseComissionavel?: number
}

/**
 * Linha da RPC `comissao_resumo_periodo` — a FONTE ÚNICA do resumo por
 * profissional (qtd, volume, % de entrada, taxa e comissão saem juntos, da
 * mesma consulta). Antes, taxa e valor vinham de caminhos diferentes e
 * divergiam: no print de 23/11/2026 o Dr. Leandro aparecia com "Taxa 0,0%"
 * e comissão de R$ 4.694,37 ao mesmo tempo, porque a taxa era lida de UMA
 * venda sem entrada e o valor somado de TODAS.
 */
export interface ResumoProfissional {
  tipo: string
  ref_id: string
  nome: string
  qtd_vendas: number
  qtd_sem_entrada: number
  qtd_adiada: number
  volume_periodo: number
  valor_sem_entrada: number
  valor_adiada: number
  volume_comissionavel: number
  entradas: number
  pct_entrada: number
  taxa: number
  comissao: number
}

function mapResumo(r: any): ProfessionalSummary {
  return {
    id: r.ref_id,
    nome: r.nome,
    tipo: r.tipo === 'CRC' ? 'CRC' : 'Dentista',
    qtdeVendas: Number(r.qtd_vendas) || 0,
    // totalVendas = VOLUME DO PERÍODO (todas as vendas), porque é a base da
    // conta que o Leandro confere à mão: 58.924,30 / 132.783,30 = 44,4%.
    totalVendas: Number(r.volume_periodo) || 0,
    totalEntries: Number(r.entradas) || 0,
    entryPercentage: Number(r.pct_entrada) || 0,
    commissionRate: Number(r.taxa) || 0,
    totalComissao: Number(r.comissao) || 0,
    comissaoAberta: Number(r.comissao) || 0,
    comissaoPaga: 0,
    qtdSemEntrada: Number(r.qtd_sem_entrada) || 0,
    valorSemEntrada: Number(r.valor_sem_entrada) || 0,
    qtdAdiada: Number(r.qtd_adiada) || 0,
    valorAdiada: Number(r.valor_adiada) || 0,
    baseComissionavel: Number(r.volume_comissionavel) || 0,
  }
}

function getPercentual(faixas: FaixaBase[], percEntrada: number): number {
  const f = faixas.find(
    (x) =>
      percEntrada >= (x.faixa_entrada_minima || 0) &&
      percEntrada <= (x.faixa_entrada_maxima || 100),
  )
  return f?.percentual_comissao || 0
}

/**
 * Faixa de comissão do profissional, aplicada sobre o VOLUME DO PERÍODO.
 *
 * Regra do Leandro (23/11/2026), confirmada com o exemplo dele:
 *   "< 20% de entrada: 2% ... de 20 a 29,99%: 3% ... > 30%: 4%
 *    Ex.: 100.000 de vendas, 20.000 de entradas => 20% => 3% => 3.000"
 *
 * Ou seja: o percentual sai do % de entrada MÉDIO do período e incide sobre o
 * total vendido. Vendas SEM entrada não entram na base (não geram comissão).
 *
 * Um somatório "venda a venda" daria outro número (o percentual de uma venda
 * isolada pode cair numa faixa diferente da média). O valor oficial é o da
 * média, como ele definiu; a venda a venda fica na tabela só como referência.
 */
function resumoPorMedia(
  vendas: ComissaoVenda[],
  campoComissao: 'dentista' | 'crc',
  faixas: FaixaBase[],
): { taxa: number; base: number; total: number } {
  const comEntrada = vendas.filter(
    (v) => (v.valor_entrada || 0) > 0 && (v.valor_tratamento || 0) > 0,
  )
  if (comEntrada.length === 0) return { taxa: 0, base: 0, total: 0 }

  const base = comEntrada.reduce((s, v) => s + v.valor_tratamento, 0)
  const entradas = comEntrada.reduce((s, v) => s + v.valor_entrada, 0)
  const pctEntrada = base > 0 ? (entradas / base) * 100 : 0
  const taxa = getPercentual(faixas, pctEntrada)

  return { taxa, base, total: (base * taxa) / 100 }
}

/**
 * Reaplica a TAXA DO PROFISSIONAL em cada linha da tabela venda a venda.
 *
 * A RPC `calcular_comissao_periodo` calcula a faixa venda a venda (é o que a
 * tabela mostrava), o que diverge do valor oficial quando alguma venda isolada
 * cai numa faixa diferente da média do período. Aqui a coluna de comissão da
 * tabela passa a usar a taxa do profissional, e a soma das linhas bate com o
 * cartão. A tabela continua mostrando 0 nas vendas sem entrada.
 */
export function alinharVendasComTaxaDoProfissional(
  vendas: ComissaoVenda[],
  profissionais: ProfessionalSummary[],
): ComissaoVenda[] {
  const taxaDent = new Map<string, number>()
  const taxaCrc = new Map<string, number>()
  for (const p of profissionais) {
    if (p.tipo === 'Dentista') taxaDent.set(p.id, p.commissionRate)
    else taxaCrc.set(p.id, p.commissionRate)
  }
  return vendas.map((v) => {
    // A comissão é VOLUME x TAXA (regra do Leandro, 23/11 23:15): TODA venda do
    // período entra na base, inclusive as sem entrada — elas continuam no
    // denominador do % e ele multiplica o volume inteiro pela taxa.
    // Antes eu zerava as vendas sem entrada aqui, e o rodapé da tabela somava
    // R$ 8.290,59 enquanto a regra dava R$ 8.745,75.
    const td = v.dentista_avaliador ? taxaDent.get(v.dentista_avaliador) : 0
    const tc = v.crc ? taxaCrc.get(v.crc) : 0
    const pctD = td ?? v.percentual_comissao_dentista
    const pctC = tc ?? v.percentual_comissao_crc
    return {
      ...v,
      percentual_comissao_dentista: pctD,
      valor_comissao_dentista: (v.valor_tratamento * pctD) / 100,
      percentual_comissao_crc: pctC,
      valor_comissao_crc: (v.valor_tratamento * pctC) / 100,
    }
  })
}

function buildProfessionalSummaries(
  vendas: ComissaoVenda[],
  faixasDent: FaixaBase[] = [],
  faixasCrc: FaixaBase[] = [],
): ProfessionalSummary[] {
  const map = new Map<string, ProfessionalSummary>()
  const grupos = new Map<
    string,
    { tipo: 'Dentista' | 'CRC'; vendas: ComissaoVenda[]; nome: string }
  >()

  for (const v of vendas) {
    if (v.dentista_avaliador && v.dentista_nome) {
      const key = `dentista-${v.dentista_avaliador}`
      const g = grupos.get(key) || { tipo: 'Dentista' as const, vendas: [], nome: v.dentista_nome }
      g.vendas.push(v)
      grupos.set(key, g)
      if (!map.has(key)) {
        map.set(key, {
          id: v.dentista_avaliador,
          nome: v.dentista_nome,
          tipo: 'Dentista',
          totalVendas: 0,
          totalEntries: 0,
          entryPercentage: 0,
          commissionRate: 0,
          totalComissao: 0,
          qtdeVendas: 0,
          comissaoAberta: 0,
          comissaoPaga: 0,
        })
      }
    }
    if (v.crc && v.crc_nome) {
      const key = `crc-${v.crc}`
      const g = grupos.get(key) || { tipo: 'CRC' as const, vendas: [], nome: v.crc_nome }
      g.vendas.push(v)
      grupos.set(key, g)
      if (!map.has(key)) {
        map.set(key, {
          id: v.crc,
          nome: v.crc_nome,
          tipo: 'CRC',
          totalVendas: 0,
          totalEntries: 0,
          entryPercentage: 0,
          commissionRate: 0,
          totalComissao: 0,
          qtdeVendas: 0,
          comissaoAberta: 0,
          comissaoPaga: 0,
        })
      }
    }
  }

  for (const [key, g] of grupos) {
    const s = map.get(key)!
    // Base = vendas COM entrada. Venda sem entrada não comissiona, então ela
    // não pode entrar no valor vendido nem no % de entrada do cartão —
    // senão a "Performance" exibida não bate com a faixa usada no cálculo.
    // O que fica de fora aparece em `qtdSemEntrada`/`valorSemEntrada`.
    const comEntrada = g.vendas.filter((v) => (v.valor_entrada || 0) > 0)
    s.qtdeVendas = comEntrada.length
    s.totalVendas = comEntrada.reduce((a, v) => a + (v.valor_tratamento || 0), 0)
    s.totalEntries = comEntrada.reduce((a, v) => a + (v.valor_entrada || 0), 0)
    s.entryPercentage = s.totalVendas > 0 ? (s.totalEntries / s.totalVendas) * 100 : 0

    const semEntrada = g.vendas.filter((v) => (v.valor_entrada || 0) <= 0)
    s.qtdSemEntrada = semEntrada.length
    s.valorSemEntrada = semEntrada.reduce((a, v) => a + (v.valor_tratamento || 0), 0)

    const r = resumoPorMedia(
      g.vendas,
      g.tipo === 'Dentista' ? 'dentista' : 'crc',
      g.tipo === 'Dentista' ? faixasDent : faixasCrc,
    )
    // Sem faixas carregadas, mantém o que veio da RPC (que já aplica a regra).
    const usaRpc = (g.tipo === 'Dentista' ? faixasDent : faixasCrc).length === 0
    const totalRpc = g.vendas.reduce(
      (a, v) => a + (g.tipo === 'Dentista' ? v.valor_comissao_dentista : v.valor_comissao_crc),
      0,
    )
    s.commissionRate = usaRpc
      ? g.vendas.find((v) =>
          g.tipo === 'Dentista' ? v.percentual_comissao_dentista : v.percentual_comissao_crc,
        )?.[g.tipo === 'Dentista' ? 'percentual_comissao_dentista' : 'percentual_comissao_crc'] || 0
      : r.taxa
    s.totalComissao = usaRpc ? totalRpc : r.total

    const pagos = g.vendas.filter((v) => v.status_comissao === 'pago')
    const totalPago = pagos.reduce(
      (a, v) => a + (g.tipo === 'Dentista' ? v.valor_comissao_dentista : v.valor_comissao_crc),
      0,
    )
    s.comissaoPaga = totalPago
    s.comissaoAberta = s.totalComissao - totalPago
  }

  return Array.from(map.values()).sort((a, b) => b.totalComissao - a.totalComissao)
}

function mapRpcData(rpcData: any[]): ComissaoVenda[] {
  return rpcData.map((v) => ({
    id: v.id,
    paciente_nome: v.paciente_nome || '',
    data_fechamento: v.data_fechamento,
    valor_tratamento: Number(v.valor_tratamento) || 0,
    valor_entrada: Number(v.valor_entrada) || 0,
    percentual_entrada: Number(v.percentual_entrada) || 0,
    dentista_avaliador: v.dentista_avaliador || null,
    dentista_nome: v.dentista_nome || null,
    crc: v.crc || null,
    crc_nome: v.crc_nome || null,
    percentual_comissao_dentista: Number(v.percentual_comissao_dentista) || 0,
    valor_comissao_dentista: Number(v.valor_comissao_dentista) || 0,
    percentual_comissao_crc: Number(v.percentual_comissao_crc) || 0,
    valor_comissao_crc: Number(v.valor_comissao_crc) || 0,
    status_comissao: v.status_comissao || null,
  }))
}

function computeTotals(vendas: ComissaoVenda[]): DashboardTotals {
  return vendas.reduce(
    (acc, v) => {
      acc.totalComissaoDentista += v.valor_comissao_dentista
      acc.totalComissaoCRC += v.valor_comissao_crc
      acc.totalVendas += v.valor_tratamento
      acc.totalEntries += v.valor_entrada
      return acc
    },
    { totalComissaoDentista: 0, totalComissaoCRC: 0, totalVendas: 0, totalEntries: 0 },
  )
}

function buildVendasFromFallback(
  vendasRes: any[],
  faixasD: FaixaBase[],
  faixasC: FaixaBase[],
): ComissaoVenda[] {
  const dentistaAgg = new Map<string, { sales: number; entries: number }>()
  const crcAgg = new Map<string, { sales: number; entries: number }>()

  for (const v of vendasRes) {
    if (v.dentista_avaliador) {
      const agg = dentistaAgg.get(v.dentista_avaliador) || { sales: 0, entries: 0 }
      agg.sales += Number(v.valor_tratamento) || 0
      agg.entries += Number(v.valor_entrada) || 0
      dentistaAgg.set(v.dentista_avaliador, agg)
    }
    if (v.crc) {
      const agg = crcAgg.get(v.crc) || { sales: 0, entries: 0 }
      agg.sales += Number(v.valor_tratamento) || 0
      agg.entries += Number(v.valor_entrada) || 0
      crcAgg.set(v.crc, agg)
    }
  }

  const dentistaRate = new Map<string, number>()
  for (const [id, agg] of dentistaAgg) {
    const pct = agg.sales > 0 ? (agg.entries / agg.sales) * 100 : 0
    dentistaRate.set(id, getPercentual(faixasD, pct))
  }

  const crcRate = new Map<string, number>()
  for (const [id, agg] of crcAgg) {
    const pct = agg.sales > 0 ? (agg.entries / agg.sales) * 100 : 0
    crcRate.set(id, getPercentual(faixasC, pct))
  }

  return vendasRes.map((v: any) => {
    const percD = v.dentista_avaliador ? dentistaRate.get(v.dentista_avaliador) || 0 : 0
    const percC = v.crc ? crcRate.get(v.crc) || 0 : 0
    const valorTrat = Number(v.valor_tratamento) || 0
    return {
      id: v.id,
      paciente_nome: v.paciente_nome || '',
      data_fechamento: v.data_fechamento,
      valor_tratamento: valorTrat,
      valor_entrada: Number(v.valor_entrada) || 0,
      percentual_entrada: valorTrat > 0 ? (Number(v.valor_entrada) / valorTrat) * 100 : 0,
      dentista_avaliador: v.dentista_avaliador || null,
      dentista_nome: v.dentistas_avaliadores?.nome || null,
      crc: v.crc || null,
      crc_nome: v.crc_comercial?.nome || null,
      percentual_comissao_dentista: percD,
      valor_comissao_dentista: (valorTrat * percD) / 100,
      percentual_comissao_crc: percC,
      valor_comissao_crc: (valorTrat * percC) / 100,
      status_comissao: v.status_comissao || null,
    }
  })
}

export async function fetchComissoesPeriodo(mesAno: string): Promise<{
  vendas: ComissaoVenda[]
  totals: DashboardTotals
  profissionais: ProfessionalSummary[]
  ajustesAtivosMap: Map<string, ComissaoAjuste>
}> {
  const dataInicio = parseISO(`${mesAno}-01`)
  const inicioStr = format(startOfMonth(dataInicio), 'yyyy-MM-dd')
  const fimStr = format(endOfMonth(dataInicio), 'yyyy-MM-dd')

  // Carrega mapa de ajustes ativos (cancelados ou programados) de forma resiliente
  const ajustesAtivosMap = await fetchAjustesAtivosMap()

  const chamarRpc = () =>
    supabase.rpc('calcular_comissao_periodo', {
      p_data_inicio: inicioStr,
      p_data_fim: fimStr,
    })

  let { data: rpcData, error: rpcError } = await chamarRpc()

  /**
   * 401 aqui significa sessão inválida/expirada, NÃO ausência de dados.
   *
   * Medido em 23/11/2026 nos logs do Supabase durante a sessão do Leandro:
   *   POST /rpc/calcular_comissao_periodo  -> 401
   *   GET  /vendas_confirmadas?data_fechamento=...outubro -> 200 (0 linhas)
   * A aba ficou aberta por dias, o refresh token morreu e toda consulta passou
   * a correr como `anon`: a RPC devolve 401 e as tabelas devolvem 200 vazio,
   * porque o RLS do anon não enxerga nada. A tela então pintava R$ 0,00 —
   * parecendo dado apagado, quando era sessão caída.
   * Antes de aceitar o zero, renovamos a sessão e tentamos de novo.
   */
  const ehFalhaDeSessao = (err: any) =>
    !!err &&
    (err.code === 'PGRST301' ||
      err.status === 401 ||
      /jwt|token|expired|permission denied/i.test(String(err.message || '')))

  if (rpcError && ehFalhaDeSessao(rpcError)) {
    const { error: refreshError } = await supabase.auth.refreshSession()
    if (!refreshError) {
      const retry = await chamarRpc()
      rpcData = retry.data
      rpcError = retry.error
    }
  }

  // Sessão morta e não renovável: é erro de acesso, não "sem comissões".
  if (rpcError && ehFalhaDeSessao(rpcError)) {
    throw new Error(
      'Sua sessão expirou. Entre novamente no sistema para ver as comissões — os dados estão salvos.',
    )
  }

  let todasVendas: ComissaoVenda[] = []

  // As faixas são necessárias nos DOIS caminhos: o resumo por profissional
  // aplica o percentual sobre o volume do período (regra do Leandro).
  const [faixasDRes, faixasCRes] = await Promise.all([
    supabase.from('referencias_comissao_dentista').select('*').eq('status', 'ativo'),
    supabase.from('referencias_comissao_crc').select('*').eq('status', 'ativo'),
  ])
  const faixasD = (faixasDRes.data || []) as FaixaBase[]
  const faixasC = (faixasCRes.data || []) as FaixaBase[]

  if (!rpcError && rpcData) {
    todasVendas = mapRpcData(rpcData as any[])
  } else {
    const vendasRes = await supabase
      .from('vendas_confirmadas')
      .select(
        '*, dentistas_avaliadores!vendas_confirmadas_dentista_avaliador_fkey(nome), crc_comercial!vendas_confirmadas_crc_fkey(nome)',
      )
      .gte('data_fechamento', inicioStr)
      .lte('data_fechamento', fimStr)
      .order('data_fechamento', { ascending: false })

    // O fallback só é confiável com sessão válida: com anon o PostgREST
    // responde 200 e zero linhas, e zerar a tela mentiria sobre o dado.
    if (vendasRes.error && ehFalhaDeSessao(vendasRes.error)) {
      throw new Error(
        'Sua sessão expirou. Entre novamente no sistema para ver as comissões — os dados estão salvos.',
      )
    }
    if (!vendasRes.error && (vendasRes.data || []).length === 0) {
      const { data: quem } = await supabase.auth.getUser()
      if (!quem?.user) {
        throw new Error(
          'Sua sessão expirou. Entre novamente no sistema para ver as comissões — os dados estão salvos.',
        )
      }
    }

    todasVendas = buildVendasFromFallback(vendasRes.data || [], faixasD, faixasC)
  }

  // Filtrar comissões que NÃO têm ajuste ativo (cancelada ou programada)
  // Comissões com ajuste ativo saem dos cards de Visão Geral, das tabelas DENTISTAS/CRC e do dash por vendedor
  const vendasAtivas = todasVendas.filter((v) => !ajustesAtivosMap.has(v.id))

  // ---- Resumo por profissional: FONTE ÚNICA no banco ----
  // `comissao_resumo_periodo` devolve, na mesma consulta e para cada
  // profissional, a quantidade de vendas, o volume, as entradas, o % de
  // entrada, a taxa da faixa E a comissão. Assim taxa e valor nunca mais podem
  // divergir, e a regra (média do período sobre o volume com entrada, faixas
  // 2/3/4% do dentista e 0,6/0,8/1% do CRC, venda sem entrada não comissiona)
  // fica num lugar só, em vez de reimplementada em cada tela.
  let profissionais: ProfessionalSummary[] = []
  let resumoOk = false
  try {
    const { data: resumo, error: erroResumo } = await supabase.rpc('comissao_resumo_periodo', {
      p_inicio: inicioStr,
      p_fim: fimStr,
    })
    if (erroResumo && ehFalhaDeSessao(erroResumo)) {
      throw new Error(
        'Sua sessão expirou. Entre novamente no sistema para ver as comissões — os dados estão salvos.',
      )
    }
    if (!erroResumo && Array.isArray(resumo) && resumo.length > 0) {
      profissionais = (resumo as any[]).map(mapResumo)

      // Pago / em aberto: a comissão paga segue a MESMA taxa do profissional,
      // aplicada só ao volume das vendas já marcadas como pagas.
      for (const p of profissionais) {
        const campo = p.tipo === 'Dentista' ? 'dentista_avaliador' : 'crc'
        const meu = vendasAtivas.filter(
          (v) =>
            (v as any)[campo] === p.id &&
            v.status_comissao === 'pago' &&
            (v.valor_entrada || 0) > 0,
        )
        const basePaga = meu.reduce((a, v) => a + (v.valor_tratamento || 0), 0)
        p.comissaoPaga = (basePaga * p.commissionRate) / 100
        p.comissaoAberta = Math.max(0, p.totalComissao - p.comissaoPaga)
      }
      profissionais.sort((a, b) => b.totalComissao - a.totalComissao)
      resumoOk = true
    }
  } catch (e: any) {
    if (/sess[ãa]o expirou/i.test(String(e?.message || ''))) throw e
    // cai no cálculo local abaixo
  }

  // NUNCA cair num cálculo alternativo em silêncio.
  //
  // Até 23/11/2026, se a RPC falhasse (por exemplo durante os segundos em que ela
  // estava sendo recriada no banco), a tela caía em `buildProfessionalSummaries`
  // — que usa OUTRA base de cálculo e lia a taxa de UMA venda, exibindo
  // "Taxa 0,0%" ao lado de uma comissão cheia. O número parecia resultado, mas
  // vinha de uma regra diferente. Melhor falhar visivelmente do que mentir.
  if (!resumoOk) {
    throw new Error(
      'Não foi possível calcular as comissões agora (a consulta de resumo falhou). ' +
        'Os dados estão salvos — recarregue a página. Se persistir, avise o suporte.',
    )
  }

  // ---- TOTAIS DO TOPO: média dos totais ----
  //
  // Decisão do Leandro (23/11/2026 23:24): os CARTÕES são individuais e
  // isolados — cada vendedor na sua própria faixa. Só o painel de TOTAL é
  // calculado pela média do grupo:
  //   pct = soma das entradas ÷ soma das vendas  |  comissão = volume × taxa
  // Hoje os dois caminhos coincidem (todos na mesma faixa), mas num mês
  // misto o total deixa de ser a soma dos cartões — e é assim que ele quer.
  const volume = computeTotals(vendasAtivas)
  const totaisPorMedia = new Map<string, { pct: number; taxa: number; comissao: number }>()
  try {
    const { data: tot } = await supabase.rpc('comissao_totais_periodo', {
      p_inicio: inicioStr,
      p_fim: fimStr,
    })
    for (const r of (tot as any[]) || []) {
      totaisPorMedia.set(String(r.grupo), {
        pct: Number(r.pct_medio) || 0,
        taxa: Number(r.taxa) || 0,
        comissao: Number(r.comissao) || 0,
      })
    }
  } catch {
    /* mantém o cálculo por soma abaixo */
  }

  const somaDent = profissionais
    .filter((p) => p.tipo === 'Dentista')
    .reduce((a, p) => a + p.totalComissao, 0)
  const somaCrc = profissionais
    .filter((p) => p.tipo === 'CRC')
    .reduce((a, p) => a + p.totalComissao, 0)

  const totals: DashboardTotals = {
    totalComissaoDentista: totaisPorMedia.get('DENTISTA')?.comissao ?? somaDent,
    totalComissaoCRC: totaisPorMedia.get('CRC')?.comissao ?? somaCrc,
    totalVendas: volume.totalVendas,
    totalEntries: volume.totalEntries,
    pctMedioDentista: totaisPorMedia.get('DENTISTA')?.pct,
    taxaDentista: totaisPorMedia.get('DENTISTA')?.taxa,
    pctMedioCRC: totaisPorMedia.get('CRC')?.pct,
    taxaCRC: totaisPorMedia.get('CRC')?.taxa,
  }

  return {
    vendas: alinharVendasComTaxaDoProfissional(vendasAtivas, profissionais),
    totals,
    profissionais,
    ajustesAtivosMap,
  }
}

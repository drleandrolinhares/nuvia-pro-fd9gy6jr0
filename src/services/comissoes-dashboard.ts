import { supabase } from '@/lib/supabase/client'
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns'
import type { FaixaBase } from '@/services/comissoes'

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
}

export interface DashboardTotals {
  totalComissaoDentista: number
  totalComissaoCRC: number
  totalVendas: number
  totalEntries: number
}

export interface ProfessionalSummary {
  id: string
  nome: string
  tipo: 'Dentista' | 'CRC'
  totalVendas: number
  totalEntries: number
  entryPercentage: number
  commissionRate: number
  totalComissao: number
  qtdeVendas: number
  comissaoAberta: number
  comissaoPaga: number
}

function getPercentual(faixas: FaixaBase[], percEntrada: number): number {
  const f = faixas.find(
    (x) =>
      percEntrada >= (x.faixa_entrada_minima || 0) &&
      percEntrada <= (x.faixa_entrada_maxima || 100),
  )
  return f?.percentual_comissao || 0
}

function buildProfessionalSummaries(vendas: ComissaoVenda[]): ProfessionalSummary[] {
  const map = new Map<string, ProfessionalSummary>()

  for (const v of vendas) {
    if (v.dentista_avaliador && v.dentista_nome) {
      const key = `dentista-${v.dentista_avaliador}`
      const existing = map.get(key) || {
        id: v.dentista_avaliador,
        nome: v.dentista_nome,
        tipo: 'Dentista' as const,
        totalVendas: 0,
        totalEntries: 0,
        entryPercentage: 0,
        commissionRate: 0,
        totalComissao: 0,
        qtdeVendas: 0,
        comissaoAberta: 0,
        comissaoPaga: 0,
      }
      existing.totalVendas += v.valor_tratamento
      existing.totalEntries += v.valor_entrada
      existing.commissionRate = v.percentual_comissao_dentista
      existing.totalComissao += v.valor_comissao_dentista
      existing.qtdeVendas += 1
      if (v.status_comissao === 'pago') existing.comissaoPaga += v.valor_comissao_dentista
      else existing.comissaoAberta += v.valor_comissao_dentista
      existing.entryPercentage =
        existing.totalVendas > 0 ? (existing.totalEntries / existing.totalVendas) * 100 : 0
      map.set(key, existing)
    }

    if (v.crc && v.crc_nome) {
      const key = `crc-${v.crc}`
      const existing = map.get(key) || {
        id: v.crc,
        nome: v.crc_nome,
        tipo: 'CRC' as const,
        totalVendas: 0,
        totalEntries: 0,
        entryPercentage: 0,
        commissionRate: 0,
        totalComissao: 0,
        qtdeVendas: 0,
        comissaoAberta: 0,
        comissaoPaga: 0,
      }
      existing.totalVendas += v.valor_tratamento
      existing.totalEntries += v.valor_entrada
      existing.commissionRate = v.percentual_comissao_crc
      existing.totalComissao += v.valor_comissao_crc
      existing.qtdeVendas += 1
      if (v.status_comissao === 'pago') existing.comissaoPaga += v.valor_comissao_crc
      else existing.comissaoAberta += v.valor_comissao_crc
      existing.entryPercentage =
        existing.totalVendas > 0 ? (existing.totalEntries / existing.totalVendas) * 100 : 0
      map.set(key, existing)
    }
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
}> {
  const dataInicio = parseISO(`${mesAno}-01`)
  const inicioStr = format(startOfMonth(dataInicio), 'yyyy-MM-dd')
  const fimStr = format(endOfMonth(dataInicio), 'yyyy-MM-dd')

  const { data: rpcData, error: rpcError } = await supabase.rpc('calcular_comissao_periodo', {
    p_data_inicio: inicioStr,
    p_data_fim: fimStr,
  })

  if (!rpcError && rpcData && rpcData.length >= 0) {
    const vendas = mapRpcData(rpcData as any[])
    const totals = computeTotals(vendas)
    return { vendas, totals, profissionais: buildProfessionalSummaries(vendas) }
  }

  const [vendasRes, faixasDRes, faixasCRes] = await Promise.all([
    supabase
      .from('vendas_confirmadas')
      .select('*, dentistas_avaliadores(nome), crc_comercial(nome)')
      .gte('data_fechamento', inicioStr)
      .lte('data_fechamento', fimStr)
      .order('data_fechamento', { ascending: false }),
    supabase.from('referencias_comissao_dentista').select('*').eq('status', 'ativo'),
    supabase.from('referencias_comissao_crc').select('*').eq('status', 'ativo'),
  ])

  const faixasD = (faixasDRes.data || []) as FaixaBase[]
  const faixasC = (faixasCRes.data || []) as FaixaBase[]
  const vendas = buildVendasFromFallback(vendasRes.data || [], faixasD, faixasC)
  const totals = computeTotals(vendas)

  return { vendas, totals, profissionais: buildProfessionalSummaries(vendas) }
}

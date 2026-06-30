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
}

function getPercentual(faixas: FaixaBase[], percEntrada: number): number {
  const f = faixas.find(
    (x) =>
      percEntrada >= (x.faixa_entrada_minima || 0) &&
      percEntrada <= (x.faixa_entrada_maxima || 100),
  )
  return f?.percentual_comissao || 0
}

export async function fetchComissoesPeriodo(
  mesAno: string,
): Promise<{ vendas: ComissaoVenda[]; totals: DashboardTotals }> {
  const dataInicio = parseISO(`${mesAno}-01`)
  const inicioStr = format(startOfMonth(dataInicio), 'yyyy-MM-dd')
  const fimStr = format(endOfMonth(dataInicio), 'yyyy-MM-dd')

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

  const vendas: ComissaoVenda[] = (vendasRes.data || []).map((v: any) => {
    const percEntrada = v.valor_tratamento > 0 ? (v.valor_entrada / v.valor_tratamento) * 100 : 0
    const percD = getPercentual(faixasD, percEntrada)
    const percC = getPercentual(faixasC, percEntrada)
    return {
      id: v.id,
      paciente_nome: v.paciente_nome || '',
      data_fechamento: v.data_fechamento,
      valor_tratamento: Number(v.valor_tratamento) || 0,
      valor_entrada: Number(v.valor_entrada) || 0,
      percentual_entrada: percEntrada,
      dentista_avaliador: v.dentista_avaliador || null,
      dentista_nome: v.dentistas_avaliadores?.nome || null,
      crc: v.crc || null,
      crc_nome: v.crc_comercial?.nome || null,
      percentual_comissao_dentista: percD,
      valor_comissao_dentista: ((Number(v.valor_tratamento) || 0) * percD) / 100,
      percentual_comissao_crc: percC,
      valor_comissao_crc: ((Number(v.valor_tratamento) || 0) * percC) / 100,
      status_comissao: v.status_comissao || null,
    }
  })

  const totals: DashboardTotals = vendas.reduce(
    (acc, v) => {
      acc.totalComissaoDentista += v.valor_comissao_dentista
      acc.totalComissaoCRC += v.valor_comissao_crc
      acc.totalVendas += v.valor_tratamento
      return acc
    },
    { totalComissaoDentista: 0, totalComissaoCRC: 0, totalVendas: 0 },
  )

  return { vendas, totals }
}

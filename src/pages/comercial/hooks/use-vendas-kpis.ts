import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  startOfDay,
  endOfDay,
  subDays,
  startOfMonth,
  endOfMonth,
  parseISO,
  format,
  differenceInDays,
  subMonths,
} from 'date-fns'
import { VendasFiltersState } from '../types'

export interface KPIData {
  avaliacoesRealizadas: number
  valorTotalOportunidades: number
  ticketMedio: number
  vendasConcretizadas: number
  valorTotalVendido: number
  taxaConversao: number
  pacientesFollowUp: number
  leadsQuentes: number
  leadsMornos: number
  leadsFrios: number
  cicloMedioVendas: number
}

export function useVendasKPIs(filters: VendasFiltersState, debouncedValorRange: number[]) {
  const [kpis, setKpis] = useState<KPIData | null>(null)
  const [trends, setTrends] = useState<Record<keyof KPIData, number> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const fetchKPIs = async () => {
      setLoading(true)
      try {
        let sd: Date | null = null
        let ed: Date | null = null
        let psd: Date | null = null
        let ped: Date | null = null
        const today = new Date()

        switch (filters.periodo) {
          case 'hoje':
            sd = startOfDay(today)
            ed = endOfDay(today)
            psd = startOfDay(subDays(today, 1))
            ped = endOfDay(subDays(today, 1))
            break
          case 'ontem':
            sd = startOfDay(subDays(today, 1))
            ed = endOfDay(subDays(today, 1))
            psd = startOfDay(subDays(today, 2))
            ped = endOfDay(subDays(today, 2))
            break
          case 'ultimos_7':
            sd = startOfDay(subDays(today, 6))
            ed = endOfDay(today)
            psd = startOfDay(subDays(today, 13))
            ped = endOfDay(subDays(today, 7))
            break
          case 'ultimos_15':
            sd = startOfDay(subDays(today, 14))
            ed = endOfDay(today)
            psd = startOfDay(subDays(today, 29))
            ped = endOfDay(subDays(today, 15))
            break
          case 'mes_atual':
            sd = startOfMonth(today)
            ed = endOfMonth(today)
            psd = startOfMonth(subMonths(today, 1))
            ped = endOfMonth(subMonths(today, 1))
            break
          case 'personalizado':
            if (filters.dataInicio && filters.dataFim) {
              sd = startOfDay(parseISO(filters.dataInicio))
              ed = endOfDay(parseISO(filters.dataFim))
              const diff = differenceInDays(ed, sd) + 1
              psd = startOfDay(subDays(sd, diff))
              ped = endOfDay(subDays(ed, diff))
            }
            break
        }

        const buildQuery = (start: Date | null, end: Date | null) => {
          let selectStr = `id, status, temperatura_lead, valor_orcamento, data_avaliacao, orcamentos ( valor ), vendas_concretizadas ( valor_total_tratamento, data_concretizacao )`
          if (filters.search) selectStr += `, pacientes!inner(nome)`

          let q = supabase.from('avaliacoes').select(selectStr)

          if (filters.search) q = q.ilike('pacientes.nome', `%${filters.search}%`)
          if (filters.status !== 'todos') q = q.eq('status', filters.status)
          if (filters.temperatura !== 'todas') q = q.eq('temperatura_lead', filters.temperatura)
          if (filters.dentista !== 'todos') q = q.eq('dentista_avaliador_id', filters.dentista)
          if (filters.crc !== 'todos') q = q.eq('crc_comercial_id', filters.crc)
          if (filters.tratamento !== 'todos') q = q.eq('tipo_tratamento', filters.tratamento)

          if (start) q = q.gte('data_avaliacao', format(start, 'yyyy-MM-dd'))
          if (end) q = q.lte('data_avaliacao', format(end, 'yyyy-MM-dd'))

          q = q
            .gte('valor_orcamento', debouncedValorRange[0])
            .lte('valor_orcamento', debouncedValorRange[1])
          return q
        }

        const [currRes, prevRes] = await Promise.all([
          buildQuery(sd, ed),
          sd ? buildQuery(psd, ped) : Promise.resolve({ data: [] as any[] }),
        ])

        if (currRes.error) throw currRes.error
        if (prevRes.error) throw prevRes.error

        const calc = (data: any[]): KPIData => {
          let valorTotalOportunidades = 0
          let vendasConcretizadas = 0
          let valorTotalVendido = 0
          let pacientesFollowUp = 0
          let leadsQuentes = 0
          let leadsMornos = 0
          let leadsFrios = 0
          let cicloDiasTotal = 0
          let qtdVendasCiclo = 0

          data.forEach((item) => {
            const maxOrcamento =
              item.orcamentos?.length > 0
                ? Math.max(...item.orcamentos.map((o: any) => o.valor))
                : item.valor_orcamento || 0
            valorTotalOportunidades += maxOrcamento

            const isVenda =
              item.status === 'venda_concretizada' ||
              (item.vendas_concretizadas && item.vendas_concretizadas.length > 0)
            if (isVenda) {
              vendasConcretizadas++
              if (item.vendas_concretizadas?.length > 0) {
                item.vendas_concretizadas.forEach((v: any) => {
                  valorTotalVendido += v.valor_total_tratamento || 0

                  if (item.data_avaliacao && v.data_concretizacao) {
                    const dInicio = parseISO(item.data_avaliacao)
                    const dFim = parseISO(v.data_concretizacao)
                    let diff = differenceInDays(dFim, dInicio)
                    if (diff < 0) diff = 0
                    cicloDiasTotal += diff
                    qtdVendasCiclo++
                  }
                })
              }
            }

            if (item.status === 'follow_up') pacientesFollowUp++
            if (item.temperatura_lead === 'quente') leadsQuentes++
            if (item.temperatura_lead === 'morno') leadsMornos++
            if (item.temperatura_lead === 'frio') leadsFrios++
          })

          return {
            avaliacoesRealizadas: data.length,
            valorTotalOportunidades,
            ticketMedio: data.length > 0 ? valorTotalOportunidades / data.length : 0,
            vendasConcretizadas,
            valorTotalVendido,
            taxaConversao: data.length > 0 ? (vendasConcretizadas / data.length) * 100 : 0,
            pacientesFollowUp,
            leadsQuentes,
            leadsMornos,
            leadsFrios,
            cicloMedioVendas: qtdVendasCiclo > 0 ? Math.round(cicloDiasTotal / qtdVendasCiclo) : 0,
          }
        }

        const currKpis = calc(currRes.data || [])
        const prevKpis = calc(prevRes.data || [])

        const calcTrend = (curr: number, prev: number) => {
          if (prev === 0) return curr > 0 ? 100 : 0
          return ((curr - prev) / prev) * 100
        }

        const newTrends: Record<keyof KPIData, number> = {} as any
        Object.keys(currKpis).forEach((k) => {
          const key = k as keyof KPIData
          newTrends[key] = sd ? calcTrend(currKpis[key], prevKpis[key]) : 0
        })

        if (isMounted) {
          setKpis(currKpis)
          setTrends(newTrends)
        }
      } catch (error) {
        console.error('Error fetching KPIs', error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchKPIs()
    return () => {
      isMounted = false
    }
  }, [filters, debouncedValorRange])

  return { kpis, trends, loading }
}

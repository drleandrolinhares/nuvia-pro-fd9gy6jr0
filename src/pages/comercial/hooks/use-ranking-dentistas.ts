import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, format } from 'date-fns'

export interface RankingDentista {
  id: string
  nome: string
  avaliacoes: number
  fechamentos: number
  conversao: number
  ticketOportunidade: number
  ticketConversao: number
  criativos: number
  metaMensalCriativos: number
}

export function useRankingDentistas(periodo: string) {
  const [ranking, setRanking] = useState<RankingDentista[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const refetch = () => setRefreshTrigger((prev) => prev + 1)

  useEffect(() => {
    const channel = supabase
      .channel('ranking_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'avaliacoes' }, () => {
        setRefreshTrigger((prev) => prev + 1)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vendas_confirmadas' }, () => {
        setRefreshTrigger((prev) => prev + 1)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'criativos_gerados' }, () => {
        setRefreshTrigger((prev) => prev + 1)
      })
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'dentistas_avaliadores' },
        () => {
          setRefreshTrigger((prev) => prev + 1)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function fetchRanking() {
      setLoading(true)
      try {
        let sd, ed
        const today = new Date()
        switch (periodo) {
          case 'hoje':
            sd = startOfDay(today)
            ed = endOfDay(today)
            break
          case 'ontem':
            sd = startOfDay(subDays(today, 1))
            ed = endOfDay(subDays(today, 1))
            break
          case 'ultimos_7':
            sd = startOfDay(subDays(today, 7))
            ed = endOfDay(today)
            break
          case 'ultimos_15':
            sd = startOfDay(subDays(today, 15))
            ed = endOfDay(today)
            break
          case 'mes_atual':
            sd = startOfMonth(today)
            ed = endOfMonth(today)
            break
        }

        const dateFilterStr =
          sd && ed ? { start: format(sd, 'yyyy-MM-dd'), end: format(ed, 'yyyy-MM-dd') } : null

        const { data: dentistas } = await supabase
          .from('dentistas_avaliadores')
          .select('id, nome, meta_mensal_criativos')
          .eq('status', 'ativo')
        if (!dentistas) return

        let avaliacoesQuery = supabase
          .from('avaliacoes')
          .select('id, dentista_avaliador_id, valor_orcamento, data_avaliacao')
        if (dateFilterStr) {
          avaliacoesQuery = avaliacoesQuery
            .gte('data_avaliacao', dateFilterStr.start)
            .lte('data_avaliacao', dateFilterStr.end)
        }
        const { data: avaliacoes } = await avaliacoesQuery

        let vendasQuery = supabase
          .from('vendas_confirmadas')
          .select('id, dentista_avaliador, valor_tratamento, data_fechamento')
        if (dateFilterStr) {
          vendasQuery = vendasQuery
            .gte('data_fechamento', dateFilterStr.start)
            .lte('data_fechamento', dateFilterStr.end)
        }
        const { data: vendas } = await vendasQuery

        let criativosQuery = supabase
          .from('criativos_gerados')
          .select('id, dentista_avaliador_id, data_criacao')
        if (dateFilterStr) {
          criativosQuery = criativosQuery
            .gte('data_criacao', dateFilterStr.start)
            .lte('data_criacao', dateFilterStr.end)
        }
        const { data: criativos } = await criativosQuery

        const dados: RankingDentista[] = dentistas.map((d) => {
          const avs = avaliacoes?.filter((a) => a.dentista_avaliador_id === d.id) || []
          const vds = vendas?.filter((v) => v.dentista_avaliador === d.id) || []
          const crs = criativos?.filter((c) => c.dentista_avaliador_id === d.id) || []

          const qtdAvaliacoes = avs.length
          const qtdFechamentos = vds.length
          const conversao = qtdAvaliacoes > 0 ? (qtdFechamentos / qtdAvaliacoes) * 100 : 0

          const valorTotalOportunidade = avs.reduce(
            (acc, curr) => acc + (curr.valor_orcamento || 0),
            0,
          )
          const ticketOportunidade = qtdAvaliacoes > 0 ? valorTotalOportunidade / qtdAvaliacoes : 0

          const valorTotalConversao = vds.reduce(
            (acc, curr) => acc + (curr.valor_tratamento || 0),
            0,
          )
          const ticketConversao = qtdFechamentos > 0 ? valorTotalConversao / qtdFechamentos : 0

          return {
            id: d.id,
            nome: d.nome,
            avaliacoes: qtdAvaliacoes,
            fechamentos: qtdFechamentos,
            conversao,
            ticketOportunidade,
            ticketConversao,
            criativos: crs.length,
            metaMensalCriativos: d.meta_mensal_criativos || 0,
          }
        })

        if (isMounted) {
          setRanking(dados)
        }
      } catch (err) {
        console.error(err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchRanking()

    return () => {
      isMounted = false
    }
  }, [periodo, refreshTrigger])

  return { ranking, loading, refetch }
}

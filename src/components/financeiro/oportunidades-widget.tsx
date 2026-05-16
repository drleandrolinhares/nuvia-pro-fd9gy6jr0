import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, format } from 'date-fns'
import { Target } from 'lucide-react'

interface Props {
  periodo?: string
  dataInicio?: string
  dataFim?: string
  refreshKey?: number
}

export function OportunidadesWidget({
  periodo = 'mes_atual',
  dataInicio,
  dataFim,
  refreshKey,
}: Props = {}) {
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData(isInitial = false) {
      try {
        let sd, ed
        const todayDate = new Date()

        switch (periodo) {
          case 'hoje':
            sd = startOfDay(todayDate)
            ed = endOfDay(todayDate)
            break
          case 'ontem':
            sd = startOfDay(subDays(todayDate, 1))
            ed = endOfDay(subDays(todayDate, 1))
            break
          case 'ultimos_7':
            sd = startOfDay(subDays(todayDate, 7))
            ed = endOfDay(todayDate)
            break
          case 'ultimos_15':
            sd = startOfDay(subDays(todayDate, 15))
            ed = endOfDay(todayDate)
            break
          case 'mes_atual':
            sd = startOfMonth(todayDate)
            ed = endOfMonth(todayDate)
            break
          case 'personalizado':
            if (dataInicio) {
              const [y, m, d] = dataInicio.split('-').map(Number)
              sd = startOfDay(new Date(y, m - 1, d))
            }
            if (dataFim) {
              const [y, m, d] = dataFim.split('-').map(Number)
              ed = endOfDay(new Date(y, m - 1, d))
            }
            break
          case 'todos':
            break
          default:
            if (periodo && periodo.match(/^\d{4}-\d{2}$/)) {
              const [y, m] = periodo.split('-').map(Number)
              const parsedDate = new Date(y, m - 1, 1)
              sd = startOfMonth(parsedDate)
              ed = endOfMonth(parsedDate)
            }
            break
        }

        let query = supabase
          .from('avaliacoes')
          .select('valor_orcamento')
          .not('status', 'eq', 'Fechada em Comercial')
          .not('status', 'eq', 'Fechada em Avaliação')
          .not('status', 'eq', 'venda_concretizada')
          .not('status', 'eq', 'venda-fechada')

        if (sd) query = query.gte('data_avaliacao', format(sd, 'yyyy-MM-dd'))
        if (ed) query = query.lte('data_avaliacao', format(ed, 'yyyy-MM-dd'))

        const { data, error } = await query

        if (error) throw error

        let sum = 0
        if (data) {
          sum = data.reduce((acc, curr) => acc + (Number(curr.valor_orcamento) || 0), 0)
        }
        setTotal(sum)
      } catch (err) {
        console.error(err)
      } finally {
        if (isInitial) setLoading(false)
      }
    }

    fetchData(true)

    const channel = supabase
      .channel(`oportunidades-widget-${Math.random()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'avaliacoes' }, () =>
        fetchData(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [periodo, dataInicio, dataFim, refreshKey])

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex flex-col justify-center min-w-[160px] shadow-sm relative group">
      <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
        <Target className="w-3.5 h-3.5 text-blue-400" />
        Oportunidades (Abertas)
      </div>
      <div className="text-lg font-bold text-blue-400 leading-tight">
        {loading
          ? '...'
          : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
      </div>
      <span className="text-[9px] text-slate-500 mt-1 leading-tight">
        Soma de avaliações (em aberto)
        <br />
        realizadas no período
      </span>
    </div>
  )
}

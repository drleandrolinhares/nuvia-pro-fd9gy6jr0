import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, format } from 'date-fns'
import { useCache } from '@/hooks/use-cache'

interface Props {
  periodo?: string
  dataInicio?: string
  dataFim?: string
}

export function QuantidadeVendasWidget({ periodo = 'mes_atual', dataInicio, dataFim }: Props = {}) {
  const [totalVendas, setTotalVendas] = useState(0)
  const [loading, setLoading] = useState(true)
  const { dataVersion } = useCache()

  useEffect(() => {
    const fetchVendas = async (isInitial = false) => {
      if (isInitial) setLoading(true)

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

      let query = supabase.from('vendas_confirmadas').select('*', { count: 'exact', head: true })

      if (sd) query = query.gte('data_fechamento', format(sd, 'yyyy-MM-dd'))
      if (ed) query = query.lte('data_fechamento', format(ed, 'yyyy-MM-dd'))

      const { count } = await query

      setTotalVendas(count || 0)
      if (isInitial) setLoading(false)
    }
    fetchVendas(true)

    const channel = supabase
      .channel(`quantidade-vendas-${Math.random()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vendas_confirmadas' }, () => {
        fetchVendas()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [dataVersion, periodo, dataInicio, dataFim])

  return (
    <div className="bg-slate-950 p-4 py-3 rounded-lg border border-slate-800 flex flex-col justify-center min-w-[160px] sm:min-w-[180px]">
      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">
        Total de Vendas (Mês)
      </span>
      <span className="text-lg font-bold text-amber-500 leading-tight">
        {loading ? '...' : String(totalVendas).padStart(2, '0')}
      </span>
      <span className="text-[9px] text-slate-500 mt-1 leading-tight">
        Vendas realizadas no período
      </span>
    </div>
  )
}

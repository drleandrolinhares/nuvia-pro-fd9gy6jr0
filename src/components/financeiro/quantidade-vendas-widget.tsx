import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { startOfMonth, endOfMonth, format } from 'date-fns'
import { useCache } from '@/hooks/use-cache'

export function QuantidadeVendasWidget() {
  const [totalVendas, setTotalVendas] = useState(0)
  const [loading, setLoading] = useState(true)
  const { dataVersion } = useCache()

  useEffect(() => {
    const fetchVendas = async (isInitial = false) => {
      if (isInitial) setLoading(true)
      const todayDate = new Date()
      const startOfMonthStr = format(startOfMonth(todayDate), 'yyyy-MM-dd')
      const endOfMonthStr = format(endOfMonth(todayDate), 'yyyy-MM-dd')

      const { count } = await supabase
        .from('vendas_confirmadas')
        .select('*', { count: 'exact', head: true })
        .gte('data_fechamento', startOfMonthStr)
        .lte('data_fechamento', endOfMonthStr)

      setTotalVendas(count || 0)
      if (isInitial) setLoading(false)
    }
    fetchVendas(true)

    const channel = supabase
      .channel('quantidade-vendas')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vendas_confirmadas' }, () => {
        fetchVendas()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [dataVersion])

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

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { startOfMonth, endOfMonth, format } from 'date-fns'
import { Target } from 'lucide-react'

export function OportunidadesWidget() {
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const today = new Date()
        const start = format(startOfMonth(today), 'yyyy-MM-dd')
        const end = format(endOfMonth(today), 'yyyy-MM-dd')

        const { data, error } = await supabase
          .from('avaliacoes')
          .select('valor_orcamento')
          .gte('data_avaliacao', start)
          .lte('data_avaliacao', end)
          .not('status', 'eq', 'Fechada em Comercial')
          .not('status', 'eq', 'Fechada em Avaliação')
          .not('status', 'eq', 'venda_concretizada')

        if (error) throw error

        let sum = 0
        if (data) {
          sum = data.reduce((acc, curr) => acc + (Number(curr.valor_orcamento) || 0), 0)
        }
        setTotal(sum)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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

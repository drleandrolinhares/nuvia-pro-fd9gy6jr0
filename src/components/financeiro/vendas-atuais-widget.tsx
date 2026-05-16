import { useState, useEffect } from 'react'
import { Plus, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, format } from 'date-fns'
import { useCache } from '@/hooks/use-cache'
import { HistoricoVendasModal } from './historico-vendas-modal'

interface Props {
  periodo?: string
  dataInicio?: string
  dataFim?: string
  refreshKey?: number
}

export function VendasAtuaisWidget({
  periodo = 'mes_atual',
  dataInicio,
  dataFim,
  refreshKey,
}: Props = {}) {
  const [historyOpen, setHistoryOpen] = useState(false)
  const [totalVendasMes, setTotalVendasMes] = useState(0)
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

      let query = supabase.from('vendas_confirmadas').select('valor_tratamento')

      if (sd) query = query.gte('data_fechamento', format(sd, 'yyyy-MM-dd'))
      if (ed) query = query.lte('data_fechamento', format(ed, 'yyyy-MM-dd'))

      const { data } = await query

      let total = 0
      if (data) {
        total += data.reduce((acc, curr) => acc + Number(curr.valor_tratamento || 0), 0)
      }

      setTotalVendasMes(total)
      if (isInitial) setLoading(false)
    }
    fetchVendas(true)

    const channel = supabase
      .channel(`vendas-atuais-${Math.random()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vendas_confirmadas' }, () => {
        fetchVendas()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [dataVersion, periodo, dataInicio, dataFim, refreshKey])

  return (
    <>
      <div className="bg-slate-950 p-4 py-3 rounded-lg border border-slate-800 flex flex-col justify-center relative group min-w-[200px] sm:min-w-[240px]">
        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">
          Vendas Atuais (Mês)
        </span>
        <span className="text-lg font-bold text-emerald-400 leading-tight">
          {loading
            ? '...'
            : `R$ ${totalVendasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
        </span>
        <span className="text-[9px] text-slate-500 mt-1 leading-tight">
          Vendas finalizadas no período
          <br />
          (independente da data da avaliação)
        </span>
        <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
          <Button
            onClick={() => setHistoryOpen(true)}
            size="icon"
            variant="ghost"
            className="h-6 w-6 text-slate-400 hover:bg-slate-800 hover:text-white rounded-md transition-colors"
            title="Consultar Histórico"
          >
            <History className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <HistoricoVendasModal open={historyOpen} onOpenChange={setHistoryOpen} />
    </>
  )
}

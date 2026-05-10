import { useState, useEffect } from 'react'
import { Plus, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import { startOfMonth, endOfMonth, format } from 'date-fns'
import { useCache } from '@/hooks/use-cache'
import { HistoricoVendasModal } from './historico-vendas-modal'

export function VendasAtuaisWidget() {
  const [historyOpen, setHistoryOpen] = useState(false)
  const [totalVendasMes, setTotalVendasMes] = useState(0)
  const [loading, setLoading] = useState(true)
  const { dataVersion } = useCache()

  useEffect(() => {
    const fetchVendas = async () => {
      setLoading(true)
      const todayDate = new Date()
      const startOfMonthStr = format(startOfMonth(todayDate), 'yyyy-MM-dd')
      const endOfMonthStr = format(endOfMonth(todayDate), 'yyyy-MM-dd')

      // Agora lemos apenas vendas_confirmadas pois a tabela está unificada com as vendas_diarias via banco
      const { data } = await supabase
        .from('vendas_confirmadas')
        .select('valor_tratamento')
        .gte('data_fechamento', startOfMonthStr)
        .lte('data_fechamento', endOfMonthStr)

      let total = 0
      if (data) {
        total += data.reduce((acc, curr) => acc + Number(curr.valor_tratamento || 0), 0)
      }

      setTotalVendasMes(total)
      setLoading(false)
    }
    fetchVendas()
  }, [dataVersion])

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

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import { startOfMonth, endOfMonth, format } from 'date-fns'
import { useCache } from '@/hooks/use-cache'
import { GestaoReceitasModal } from './gestao-receitas-modal'

export function VendasAtuaisWidget() {
  const [modalOpen, setModalOpen] = useState(false)
  const [totalVendasMes, setTotalVendasMes] = useState(0)
  const [loading, setLoading] = useState(true)
  const { dataVersion } = useCache()

  useEffect(() => {
    const fetchVendas = async () => {
      setLoading(true)
      const todayDate = new Date()
      const startOfMonthStr = format(startOfMonth(todayDate), 'yyyy-MM-dd')
      const endOfMonthStr = format(endOfMonth(todayDate), 'yyyy-MM-dd')

      const [resConfirmadas, resDiarias] = await Promise.all([
        supabase
          .from('vendas_confirmadas')
          .select('valor_tratamento')
          .gte('data_fechamento', startOfMonthStr)
          .lte('data_fechamento', endOfMonthStr),
        supabase
          .from('vendas_diarias')
          .select('valor')
          .gte('data_venda', startOfMonthStr)
          .lte('data_venda', endOfMonthStr),
      ])

      let total = 0
      if (resConfirmadas.data) {
        total += resConfirmadas.data.reduce(
          (acc, curr) => acc + Number(curr.valor_tratamento || 0),
          0,
        )
      }
      if (resDiarias.data) {
        total += resDiarias.data.reduce((acc, curr) => acc + Number(curr.valor || 0), 0)
      }

      setTotalVendasMes(total)
      setLoading(false)
    }
    fetchVendas()
  }, [dataVersion])

  return (
    <>
      <div className="bg-slate-950 p-4 py-3 rounded-lg border border-slate-800 flex flex-col justify-center relative group min-w-[200px]">
        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">
          Vendas Atuais (Mês)
        </span>
        <span className="text-lg font-bold text-emerald-400 leading-tight">
          {loading
            ? '...'
            : `R$ ${totalVendasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
        </span>
        <Button
          onClick={() => setModalOpen(true)}
          size="icon"
          className="absolute top-1.5 right-1.5 h-6 w-6 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-slate-950 rounded-md transition-colors"
          title="Gestão de Receitas"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
      <GestaoReceitasModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  )
}

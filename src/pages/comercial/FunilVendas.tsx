import { useState, useEffect } from 'react'
import { format, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { supabase } from '@/lib/supabase/client'
import { FunilDashboard } from '@/components/comercial/funil/funil-dashboard'
import { GerenciarOrigensDialog } from '@/components/comercial/funil/gerenciar-origens-dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Settings, Filter, BarChart3, KanbanSquare } from 'lucide-react'
import { GestaoLeadsKanban } from '@/components/comercial/funil/gestao-leads-kanban'
import { cn } from '@/lib/utils'

export default function FunilVendas() {
  const [view, setView] = useState<'dashboard' | 'kanban'>('dashboard')
  const [mesReferencia, setMesReferencia] = useState(format(new Date(), 'yyyy-MM'))
  const [loading, setLoading] = useState(true)
  const [origens, setOrigens] = useState<any[]>([])
  const [dadosMensais, setDadosMensais] = useState<any[]>([])

  const fetchData = async () => {
    setLoading(true)
    const { data: origensData } = await supabase.from('funil_origens').select('*').order('ordem')
    setOrigens(origensData || [])

    const { data: dadosData } = await supabase
      .from('funil_dados_mensais')
      .select('*')
      .eq('mes_referencia', mesReferencia)
    setDadosMensais(dadosData || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [mesReferencia])

  const mesesOptions = Array.from({ length: 12 }).map((_, i) => {
    const date = subMonths(new Date(), i)
    return {
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM yyyy', { locale: ptBR }).toUpperCase(),
    }
  })

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-lg hidden sm:block">
            <BarChart3 className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Funil de Vendas</h2>
            <p className="text-sm text-slate-400 mt-1">
              Análise e controle de captação de leads e conversão
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="flex bg-slate-950/50 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setView('dashboard')}
              className={cn(
                'px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2',
                view === 'dashboard'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900',
              )}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <button
              onClick={() => setView('kanban')}
              className={cn(
                'px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2',
                view === 'kanban'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900',
              )}
            >
              <KanbanSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Gestão de Leads</span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-1 sm:flex-none">
            <Filter className="w-4 h-4 text-slate-400 hidden lg:block" />
            <Select value={mesReferencia} onValueChange={setMesReferencia}>
              <SelectTrigger className="w-full sm:w-[200px] bg-slate-950 border-slate-700 text-white font-medium focus:ring-amber-500">
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-white">
                {mesesOptions.map((m) => (
                  <SelectItem
                    key={m.value}
                    value={m.value}
                    className="focus:bg-slate-800 focus:text-white"
                  >
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <GerenciarOrigensDialog origens={origens} onUpdate={fetchData}>
            <Button
              variant="outline"
              className="bg-slate-950 border-slate-700 text-white hover:bg-slate-800 hover:text-white font-medium whitespace-nowrap"
            >
              <Settings className="w-4 h-4 mr-2 text-slate-400" />
              Origens
            </Button>
          </GerenciarOrigensDialog>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 bg-slate-900/50 rounded-lg border border-slate-800">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : view === 'dashboard' ? (
        <FunilDashboard
          origens={origens}
          dados={dadosMensais}
          mesReferencia={mesReferencia}
          onUpdate={fetchData}
        />
      ) : (
        <GestaoLeadsKanban origens={origens} mesReferencia={mesReferencia} onUpdate={fetchData} />
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { format, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { supabase } from '@/lib/supabase/client'
import { FunilDashboard } from '@/components/comercial/funil/funil-dashboard'
import { FunilConfiguracoes } from '@/components/comercial/funil/funil-configuracoes'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Filter, BarChart3 } from 'lucide-react'
import { GestaoLeadsKanban } from '@/components/comercial/funil/gestao-leads-kanban'
import { cn } from '@/lib/utils'

export default function FunilVendas() {
  const [view, setView] = useState<'kanban' | 'dashboard' | 'configuracoes'>('dashboard')
  const [mesReferencia, setMesReferencia] = useState(format(new Date(), 'yyyy-MM'))
  const [loading, setLoading] = useState(true)
  const [origens, setOrigens] = useState<any[]>([])
  const [etapas, setEtapas] = useState<any[]>([])
  const [temperaturas, setTemperaturas] = useState<any[]>([])
  const [dadosMensais, setDadosMensais] = useState<any[]>([])
  const [avaliacoesMes, setAvaliacoesMes] = useState<any[]>([])

  const fetchData = async () => {
    setLoading(true)
    const { data: origensData } = await supabase.from('funil_origens').select('*').order('ordem')
    setOrigens(origensData || [])

    const { data: etapasData } = await supabase.from('funil_etapas').select('*').order('ordem')
    setEtapas(etapasData || [])

    const { data: tempData } = await supabase.from('funil_temperaturas').select('*').order('ordem')
    setTemperaturas(tempData || [])

    const { data: dadosData } = await supabase
      .from('funil_dados_mensais')
      .select('*')
      .eq('mes_referencia', mesReferencia)

    const [ano, mes] = mesReferencia.split('-')
    const dataInicio = `${mesReferencia}-01`
    const ultimoDia = new Date(Number(ano), Number(mes), 0).getDate()
    const dataFim = `${mesReferencia}-${ultimoDia}`

    const { data: vendasData } = await supabase
      .from('vendas_confirmadas')
      .select('id, valor_tratamento, oportunidade_id, avaliacoes!inner(origem_id)')
      .gte('data_fechamento', dataInicio)
      .lte('data_fechamento', dataFim)

    const { data: avaliacoesData } = await supabase
      .from('avaliacoes')
      .select('id, origem_id')
      .gte('data_avaliacao', dataInicio)
      .lte('data_avaliacao', dataFim)

    const allOrigensIds = [
      ...new Set([
        ...(dadosData || []).map((d: any) => d.origem_id),
        ...(vendasData || []).map((v: any) => v.avaliacoes?.origem_id).filter(Boolean),
      ]),
    ]

    const finalDados = allOrigensIds.map((oId: any) => {
      const existing = (dadosData || []).find((d: any) => d.origem_id === oId)

      const vendasOrigem = (vendasData || []).filter((v: any) => v.avaliacoes?.origem_id === oId)
      const qtdeVendas = vendasOrigem.length
      const valorVendas = vendasOrigem.reduce(
        (acc: number, curr: any) => acc + Number(curr.valor_tratamento || 0),
        0,
      )

      if (existing) {
        return {
          ...existing,
          fechamentos_qtde_realizado: qtdeVendas,
          fechamentos_valor_realizado: valorVendas,
        }
      }

      return {
        origem_id: oId,
        mes_referencia: mesReferencia,
        investimento: 0,
        meta_leads: 0,
        leads_realizado: 0,
        meta_agendamentos_qtde: 0,
        meta_agendamentos_perc: 0,
        agendamentos_realizado: 0,
        meta_comparecimentos_qtde: 0,
        meta_comparecimentos_perc: 0,
        comparecimentos_realizado: 0,
        meta_fechamento_valor: 0,
        ticket_medio_esperado: 0,
        fechamentos_qtde_realizado: qtdeVendas,
        fechamentos_valor_realizado: valorVendas,
      }
    })

    setDadosMensais(finalDados)
    setAvaliacoesMes(avaliacoesData || [])
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
        </div>
      </div>

      <div className="inline-flex flex-wrap items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-lg shadow-sm">
        <button
          onClick={() => setView('dashboard')}
          className={cn(
            'px-4 py-2 text-sm font-semibold transition-all rounded-md uppercase tracking-wider flex items-center gap-2',
            view === 'dashboard'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800',
          )}
        >
          Dashboard
        </button>
        <button
          onClick={() => setView('kanban')}
          className={cn(
            'px-4 py-2 text-sm font-semibold transition-all rounded-md uppercase tracking-wider flex items-center gap-2',
            view === 'kanban'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800',
          )}
        >
          Gestão de Leads
        </button>
        <button
          onClick={() => setView('configuracoes')}
          className={cn(
            'px-4 py-2 text-sm font-semibold transition-all rounded-md uppercase tracking-wider flex items-center gap-2',
            view === 'configuracoes'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800',
          )}
        >
          Configurações
        </button>
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
          avaliacoes={avaliacoesMes}
          onUpdate={fetchData}
        />
      ) : view === 'configuracoes' ? (
        <FunilConfiguracoes
          origens={origens}
          etapas={etapas}
          temperaturas={temperaturas}
          onUpdate={fetchData}
        />
      ) : (
        <GestaoLeadsKanban
          origens={origens}
          etapas={etapas}
          temperaturas={temperaturas}
          mesReferencia={mesReferencia}
          onUpdate={fetchData}
        />
      )}
    </div>
  )
}

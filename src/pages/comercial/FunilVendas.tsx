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
import { BussolaComercial } from '@/components/comercial/funil/bussola-comercial'
import { SemaforoConversao } from '@/components/comercial/funil/semaforo-conversao'
import { AgendaComercial } from '@/components/comercial/funil/agenda-comercial'
import { VendasConcretizadasLista } from '@/pages/comercial/components/VendasConcretizadasLista'
import { cn } from '@/lib/utils'

export default function FunilVendas() {
  const [view, setView] = useState<
    | 'kanban'
    | 'dashboard'
    | 'configuracoes'
    | 'bussola'
    | 'semaforo'
    | 'agenda'
    | 'vendas_concretizadas'
  >('dashboard')
  const [mesReferencia, setMesReferencia] = useState(format(new Date(), 'yyyy-MM'))
  const [loading, setLoading] = useState(true)
  const [origens, setOrigens] = useState<any[]>([])
  const [etapas, setEtapas] = useState<any[]>([])
  const [temperaturas, setTemperaturas] = useState<any[]>([])
  const [dadosMensais, setDadosMensais] = useState<any[]>([])
  const [avaliacoesMes, setAvaliacoesMes] = useState<any[]>([])
  const [leadsMes, setLeadsMes] = useState<any[]>([])
  const [vendasMes, setVendasMes] = useState<any[]>([])

  const fetchData = async (showLoader = true) => {
    if (showLoader) setLoading(true)
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

    const { data: leadsData } = await supabase
      .from('funil_leads')
      .select('*')
      .eq('mes_referencia', mesReferencia)

    const { data: vendasData } = await supabase
      .from('vendas_confirmadas')
      .select(
        'id, paciente_nome, valor_tratamento, oportunidade_id, origem_id, avaliacoes(origem_id)',
      )
      .gte('data_fechamento', dataInicio)
      .lte('data_fechamento', dataFim)

    const { data: avaliacoesData } = await supabase
      .from('avaliacoes')
      .select('id, origem_id, valor_orcamento, status, pacientes(nome)')
      .gte('data_avaliacao', dataInicio)
      .lte('data_avaliacao', dataFim)

    const validOrigensSet = new Set(
      (origensData || []).filter((o: any) => o.ativo !== false).map((o: any) => o.id),
    )
    const normalizeNome = (nome: any) => {
      if (!nome) return ''
      return String(nome)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ')
    }

    const aggregatedLeads: Record<string, any> = {}

    const uniqueLeads = (leadsData || []).filter((lead: any) => {
      const oId = lead.origem_id
      if (!oId || !validOrigensSet.has(oId)) return false

      if (!lead.nome || String(lead.nome).trim() === '') return false

      return true
    })

    uniqueLeads.forEach((lead: any) => {
      const oId = lead.origem_id

      if (!aggregatedLeads[oId]) {
        aggregatedLeads[oId] = { leads: 0, agendamentos: 0, comparecimentos: 0, faltas: 0 }
      }

      aggregatedLeads[oId].leads++

      const status = (lead.status || '').toLowerCase()
      const isAgendado =
        [
          'agendado',
          'reagendado',
          'atendido',
          'faltou',
          'negociacao',
          'venda-fechada',
          'venda_concretizada',
          'venda-perdida',
          'avaliacao',
          'fechamento',
          'em_follow_up',
        ].includes(status) || (lead.qtd_agendamentos || 0) > 0

      const isCompareceu = [
        'atendido',
        'negociacao',
        'venda-fechada',
        'venda_concretizada',
        'venda-perdida',
        'avaliacao',
        'fechamento',
        'em_follow_up',
      ].includes(status)

      const isFaltante = status === 'faltou' || (lead.qtd_faltas || 0) > 0

      if (isAgendado) aggregatedLeads[oId].agendamentos++
      if (isCompareceu) aggregatedLeads[oId].comparecimentos++
      if (isFaltante) aggregatedLeads[oId].faltas++
    })

    const allOrigensIds = [
      ...new Set([
        ...(origensData || []).map((o: any) => o.id),
        ...(dadosData || []).map((d: any) => d.origem_id),
        ...(leadsData || []).map((l: any) => l.origem_id),
        ...(vendasData || [])
          .map((v: any) => v.origem_id || v.avaliacoes?.origem_id)
          .filter(Boolean),
      ]),
    ].filter(Boolean)

    const finalDados = allOrigensIds
      .map((oId: any) => {
        const existing = (dadosData || []).find((d: any) => d.origem_id === oId)

        const vendasOrigem = (vendasData || []).filter((v: any) => {
          const matched = (v.origem_id || v.avaliacoes?.origem_id) === oId
          if (!matched) return false
          return true
        })

        const qtdeVendas = vendasOrigem.length
        const valorVendas = vendasOrigem.reduce(
          (acc: number, curr: any) => acc + Number(curr.valor_tratamento || 0),
          0,
        )

        const aggLeads = aggregatedLeads[oId] || {
          leads: 0,
          agendamentos: 0,
          comparecimentos: 0,
          faltas: 0,
        }

        if (existing) {
          return {
            ...existing,
            leads_realizado: aggLeads.leads,
            agendamentos_realizado: aggLeads.agendamentos,
            comparecimentos_realizado: aggLeads.comparecimentos,
            faltas_realizado: aggLeads.faltas,
            fechamentos_qtde_realizado: qtdeVendas,
            fechamentos_valor_realizado: valorVendas,
          }
        }

        return {
          origem_id: oId,
          mes_referencia: mesReferencia,
          investimento: 0,
          meta_leads: 0,
          leads_realizado: aggLeads.leads,
          meta_agendamentos_qtde: 0,
          meta_agendamentos_perc: 0,
          agendamentos_realizado: aggLeads.agendamentos,
          meta_comparecimentos_qtde: 0,
          meta_comparecimentos_perc: 0,
          comparecimentos_realizado: aggLeads.comparecimentos,
          faltas_realizado: aggLeads.faltas,
          meta_fechamento_valor: 0,
          ticket_medio_esperado: 0,
          fechamentos_qtde_realizado: qtdeVendas,
          fechamentos_valor_realizado: valorVendas,
        }
      })
      .filter((d: any) => {
        const origem = (origensData || []).find((o: any) => o.id === d.origem_id)
        return origem && origem.ativo !== false
      })

    const avaliacoesFiltradas = (avaliacoesData || []).filter((av: any) => {
      const oId = av.origem_id
      if (!oId || !validOrigensSet.has(oId)) return false

      if (!av.pacientes?.nome || String(av.pacientes.nome).trim() === '') return false

      return true
    })

    const vendasGlobaisFiltradas = (vendasData || []).filter((v: any) => {
      const oId = v.origem_id || v.avaliacoes?.origem_id
      if (!oId || !validOrigensSet.has(oId)) return false
      if (!v.paciente_nome) return false
      return true
    })

    setDadosMensais(finalDados)
    setAvaliacoesMes(avaliacoesFiltradas)
    setLeadsMes(leadsData || [])
    setVendasMes(vendasGlobaisFiltradas)
    if (showLoader) setLoading(false)
  }

  useEffect(() => {
    fetchData(true)

    const channel = supabase
      .channel(`funil-vendas-${Math.random()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'funil_dados_mensais' }, () =>
        fetchData(false),
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'funil_leads' }, () =>
        fetchData(false),
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'avaliacoes' }, () =>
        fetchData(false),
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vendas_confirmadas' }, () =>
        fetchData(false),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
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
              <SelectTrigger className="w-full sm:w-[200px] bg-slate-950 border-slate-800 text-white font-medium focus:ring-amber-500">
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-white">
                {mesesOptions.map((m) => (
                  <SelectItem key={m.value} value={m.value} className="focus:bg-slate-800">
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="inline-flex flex-wrap items-center gap-2 bg-slate-900/80 p-2 rounded-xl shadow-sm border border-slate-800">
        <button
          onClick={() => {
            setView('dashboard')
            fetchData(true)
          }}
          className={cn(
            'px-5 py-2.5 text-sm font-bold transition-all rounded-lg uppercase tracking-wider flex items-center gap-2',
            view === 'dashboard'
              ? 'bg-amber-500 text-amber-950 shadow-md ring-1 ring-amber-500/50'
              : 'text-slate-300 hover:text-white hover:bg-slate-800',
          )}
        >
          Dashboard
        </button>
        <button
          onClick={() => setView('kanban')}
          className={cn(
            'px-5 py-2.5 text-sm font-bold transition-all rounded-lg uppercase tracking-wider flex items-center gap-2',
            view === 'kanban'
              ? 'bg-amber-500 text-amber-950 shadow-md ring-1 ring-amber-500/50'
              : 'text-slate-300 hover:text-white hover:bg-slate-800',
          )}
        >
          Gestão de Leads
        </button>
        <button
          onClick={() => setView('semaforo')}
          className={cn(
            'px-5 py-2.5 text-sm font-bold transition-all rounded-lg uppercase tracking-wider flex items-center gap-2',
            view === 'semaforo'
              ? 'bg-amber-500 text-amber-950 shadow-md ring-1 ring-amber-500/50'
              : 'text-slate-300 hover:text-white hover:bg-slate-800',
          )}
        >
          Central de Conversão
        </button>
        <button
          onClick={() => setView('vendas_concretizadas')}
          className={cn(
            'px-5 py-2.5 text-sm font-bold transition-all rounded-lg uppercase tracking-wider flex items-center gap-2',
            view === 'vendas_concretizadas'
              ? 'bg-amber-500 text-amber-950 shadow-md ring-1 ring-amber-500/50'
              : 'text-slate-300 hover:text-white hover:bg-slate-800',
          )}
        >
          Vendas Concretizadas
        </button>
        <button
          onClick={() => setView('agenda')}
          className={cn(
            'px-5 py-2.5 text-sm font-bold transition-all rounded-lg uppercase tracking-wider flex items-center gap-2',
            view === 'agenda'
              ? 'bg-amber-500 text-amber-950 shadow-md ring-1 ring-amber-500/50'
              : 'text-slate-300 hover:text-white hover:bg-slate-800',
          )}
        >
          Agenda
        </button>
        <button
          onClick={() => setView('configuracoes')}
          className={cn(
            'px-5 py-2.5 text-sm font-bold transition-all rounded-lg uppercase tracking-wider flex items-center gap-2',
            view === 'configuracoes'
              ? 'bg-amber-500 text-amber-950 shadow-md ring-1 ring-amber-500/50'
              : 'text-slate-300 hover:text-white hover:bg-slate-800',
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
          leads={leadsMes}
          vendas={vendasMes}
          etapas={etapas}
          temperaturas={temperaturas}
          onUpdate={() => fetchData(false)}
        />
      ) : view === 'bussola' ? (
        <BussolaComercial origens={origens} dados={dadosMensais} mesReferencia={mesReferencia} />
      ) : view === 'semaforo' ? (
        <SemaforoConversao
          mesReferencia={mesReferencia}
          origens={origens}
          dados={dadosMensais}
          avaliacoes={avaliacoesMes}
          leads={leadsMes}
          vendas={vendasMes}
        />
      ) : view === 'vendas_concretizadas' ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 shadow-sm overflow-hidden">
          <VendasConcretizadasLista
            periodo={mesReferencia}
            dataInicio={`${mesReferencia}-01`}
            dataFim={`${mesReferencia}-${new Date(Number(mesReferencia.split('-')[0]), Number(mesReferencia.split('-')[1]), 0).getDate()}`}
            onRevertSuccess={() => fetchData(true)}
          />
        </div>
      ) : view === 'agenda' ? (
        <AgendaComercial origens={origens} etapas={etapas} temperaturas={temperaturas} />
      ) : view === 'configuracoes' ? (
        <FunilConfiguracoes
          origens={origens}
          etapas={etapas}
          temperaturas={temperaturas}
          onUpdate={() => fetchData(true)}
        />
      ) : (
        <GestaoLeadsKanban
          origens={origens}
          etapas={etapas}
          temperaturas={temperaturas}
          mesReferencia={mesReferencia}
          vendas={vendasMes}
          onUpdate={(showLoader = true) => fetchData(showLoader)}
          onOpenAgenda={() => setView('agenda')}
        />
      )}
    </div>
  )
}

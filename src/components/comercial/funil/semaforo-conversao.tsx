import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Loader2, Users, CalendarCheck, CheckSquare, DollarSign, TrafficCone } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SemaforoConversaoProps {
  mesReferencia: string
}

export function SemaforoConversao({ mesReferencia }: SemaforoConversaoProps) {
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState({
    total: 0,
    agendados: 0,
    compareceram: 0,
    fechados: 0,
  })

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true)

      const [ano, mes] = mesReferencia.split('-')
      const dataInicio = `${mesReferencia}-01`
      const ultimoDia = new Date(Number(ano), Number(mes), 0).getDate()
      const dataFim = `${mesReferencia}-${ultimoDia}`

      const [{ data: leads }, { data: vendas }] = await Promise.all([
        supabase.from('funil_leads').select('*').eq('mes_referencia', mesReferencia),
        supabase
          .from('vendas_confirmadas')
          .select('paciente_nome, oportunidade_id')
          .gte('data_fechamento', dataInicio)
          .lte('data_fechamento', dataFim),
      ])

      const vendasDiretasNomes = new Set(
        vendas
          ?.filter((v) => !v.oportunidade_id)
          .map((v) => v.paciente_nome.toLowerCase().trim()) || [],
      )

      let total = 0
      let agendados = 0
      let compareceram = 0
      let fechados = 0

      leads?.forEach((lead) => {
        const nome = lead.nome.toLowerCase().trim()
        const status = lead.status

        // Vamos desconsiderar COMPLETAMENTE qualquer lead cujo nome esteja em vendas diretas
        // Isso garante que o paciente não será contabilizado no Semáforo, independentemente do status atual
        const isVendaDireta = vendasDiretasNomes.has(nome)

        if (isVendaDireta) {
          return
        }

        total++

        const isAgendado = [
          'agendado',
          'reagendado',
          'atendido',
          'faltou',
          'negociacao',
          'venda-fechada',
          'venda-perdida',
          'avaliacao',
          'fechamento',
        ].includes(status || '')
        const isCompareceu = [
          'atendido',
          'negociacao',
          'venda-fechada',
          'venda-perdida',
          'avaliacao',
          'fechamento',
        ].includes(status || '')
        const isFechado = ['fechamento', 'venda-fechada'].includes(status || '')

        if (isAgendado) agendados++
        if (isCompareceu) compareceram++
        if (isFechado) fechados++
      })

      setMetrics({ total, agendados, compareceram, fechados })
      setLoading(false)
    }

    fetchMetrics()
  }, [mesReferencia])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-900/50 rounded-lg border border-slate-800">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    )
  }

  const percAgendamento =
    metrics.total > 0 ? Math.round((metrics.agendados / metrics.total) * 100) : 0
  const percComparecimento =
    metrics.agendados > 0 ? Math.round((metrics.compareceram / metrics.agendados) * 100) : 0
  const percFechamento =
    metrics.compareceram > 0 ? Math.round((metrics.fechados / metrics.compareceram) * 100) : 0

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-500/10 rounded-lg">
            <TrafficCone className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              Semáforo de Conversão de Novos Pacientes
            </h3>
            <p className="text-sm text-slate-400">
              Análise de eficiência do funil (Cálculo em cascata etapa a etapa)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-6 rounded-xl border border-slate-700 bg-slate-800/50 flex flex-col items-center text-center shadow-lg">
            <div className="p-4 bg-slate-900 rounded-full mb-4 ring-1 ring-blue-500/20">
              <Users className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold mb-1 uppercase tracking-wider text-slate-200">
              Total de Leads
            </h3>
            <div className="text-4xl font-bold mb-2 text-white">{metrics.total}</div>
            <p className="text-sm text-slate-400 font-medium">100% da base filtrada</p>
          </div>

          <SemaforoCard
            title="Agendamentos"
            value={metrics.agendados}
            percentage={percAgendamento}
            type="agendamento"
            icon={CalendarCheck}
            subtitle={`% sobre Total de Leads`}
          />
          <SemaforoCard
            title="Comparecimentos"
            value={metrics.compareceram}
            percentage={percComparecimento}
            type="comparecimento"
            icon={CheckSquare}
            subtitle={`% sobre Agendados`}
          />
          <SemaforoCard
            title="Fechamentos"
            value={metrics.fechados}
            percentage={percFechamento}
            type="fechamento"
            icon={DollarSign}
            subtitle={`% sobre Comparecimentos`}
          />
        </div>
      </div>
    </div>
  )
}

function SemaforoCard({ title, value, percentage, type, icon: Icon, subtitle }: any) {
  let colorClass = 'text-slate-400 bg-slate-800/50 border-slate-700'
  let indicator = 'bg-slate-500'
  let iconColor = 'text-slate-400'

  if (type === 'agendamento') {
    if (percentage >= 40) {
      colorClass = 'bg-emerald-500/5 border-emerald-500/20'
      indicator = 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]'
      iconColor = 'text-emerald-500'
    } else if (percentage >= 20) {
      colorClass = 'bg-yellow-500/5 border-yellow-500/20'
      indicator = 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.8)]'
      iconColor = 'text-yellow-500'
    } else {
      colorClass = 'bg-rose-500/5 border-rose-500/20'
      indicator = 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]'
      iconColor = 'text-rose-500'
    }
  } else if (type === 'comparecimento') {
    if (percentage >= 50) {
      colorClass = 'bg-emerald-500/5 border-emerald-500/20'
      indicator = 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]'
      iconColor = 'text-emerald-500'
    } else if (percentage >= 30) {
      colorClass = 'bg-yellow-500/5 border-yellow-500/20'
      indicator = 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.8)]'
      iconColor = 'text-yellow-500'
    } else {
      colorClass = 'bg-rose-500/5 border-rose-500/20'
      indicator = 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]'
      iconColor = 'text-rose-500'
    }
  } else if (type === 'fechamento') {
    if (percentage >= 30) {
      colorClass = 'bg-emerald-500/5 border-emerald-500/20'
      indicator = 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]'
      iconColor = 'text-emerald-500'
    } else if (percentage >= 15) {
      colorClass = 'bg-yellow-500/5 border-yellow-500/20'
      indicator = 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.8)]'
      iconColor = 'text-yellow-500'
    } else {
      colorClass = 'bg-rose-500/5 border-rose-500/20'
      indicator = 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]'
      iconColor = 'text-rose-500'
    }
  }

  return (
    <div
      className={cn(
        'p-6 rounded-xl border flex flex-col items-center text-center relative overflow-hidden transition-all duration-300 shadow-lg hover:shadow-xl',
        colorClass,
      )}
    >
      <div
        className={cn('absolute top-4 right-4 w-3 h-3 rounded-full animate-pulse', indicator)}
      ></div>
      <div className={cn('p-4 bg-slate-900 rounded-full mb-4 ring-1', `ring-${iconColor}/20`)}>
        <Icon className={cn('w-8 h-8', iconColor)} />
      </div>
      <h3 className="text-lg font-semibold mb-1 uppercase tracking-wider text-slate-200">
        {title}
      </h3>
      <div className={cn('text-4xl font-bold mb-2', iconColor)}>{percentage}%</div>
      <div className="flex flex-col gap-1 items-center mt-auto pt-2">
        <span className="text-sm font-semibold text-white bg-slate-800/80 px-3 py-1 rounded-md">
          {value} leads
        </span>
        <span className="text-xs font-medium text-slate-400 mt-1">{subtitle}</span>
      </div>
    </div>
  )
}

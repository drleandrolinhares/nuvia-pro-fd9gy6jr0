import { useMemo } from 'react'
import {
  Users,
  CalendarCheck,
  CheckSquare,
  DollarSign,
  TrafficCone,
  Target,
  TrendingUp,
  Percent,
  Activity,
  UserMinus,
  Megaphone,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SemaforoConversaoProps {
  mesReferencia: string
  origens?: any[]
  dados?: any[]
  avaliacoes?: any[]
}

interface FunilMetrics {
  total: number
  agendados: number
  compareceram: number
  fechados: number
  faltantes: number
  qtdeVendas: number
  valorVendas: number
}

export function SemaforoConversao({
  mesReferencia,
  origens = [],
  dados = [],
  avaliacoes = [],
}: SemaforoConversaoProps) {
  const metrics = useMemo(() => {
    const isClassico = (origemId: string) => {
      const origem = origens?.find((o: any) => o.id === origemId)
      if (!origem) return false
      const nome = origem.nome?.toLowerCase() || ''
      return nome.includes('facebook') || nome.includes('instagram')
    }

    const isIgnorado = (origemId: string) => {
      const origem = origens?.find((o: any) => o.id === origemId)
      if (!origem) return true
      const nome = origem.nome?.toLowerCase() || ''
      return nome.includes('recorrente')
    }

    const isSecundario = (origemId: string) => !isClassico(origemId) && !isIgnorado(origemId)

    const calcGroup = (filterFn: (oId: string) => boolean) => {
      return dados
        .filter((d) => filterFn(d.origem_id))
        .reduce(
          (acc, curr) => ({
            total: acc.total + Number(curr.leads_realizado || 0),
            agendados: acc.agendados + Number(curr.agendamentos_realizado || 0),
            compareceram: acc.compareceram + Number(curr.comparecimentos_realizado || 0),
            fechados: acc.fechados + Number(curr.fechamentos_qtde_realizado || 0),
            faltantes: acc.faltantes + Number(curr.faltas_realizado || 0),
            qtdeVendas: acc.qtdeVendas + Number(curr.fechamentos_qtde_realizado || 0),
            valorVendas: acc.valorVendas + Number(curr.fechamentos_valor_realizado || 0),
          }),
          {
            total: 0,
            agendados: 0,
            compareceram: 0,
            fechados: 0,
            faltantes: 0,
            qtdeVendas: 0,
            valorVendas: 0,
          },
        )
    }

    const globalMetrics = calcGroup((oId) => !isIgnorado(oId))
    const classicoMetrics = calcGroup(isClassico)
    const secundarioMetrics = calcGroup(isSecundario)

    const avaliacoesFiltered = avaliacoes.filter((a: any) => !isIgnorado(a.origem_id))
    const valorOportunidades = avaliacoesFiltered.reduce(
      (acc, curr) => acc + (Number(curr.valor_orcamento) || 0),
      0,
    )
    const pacientesAtendidos = avaliacoesFiltered.length

    return {
      global: globalMetrics,
      classico: classicoMetrics,
      secundario: secundarioMetrics,
      valorOportunidades,
      valorVendas: globalMetrics.valorVendas,
      qtdeVendas: globalMetrics.qtdeVendas,
      pacientesAtendidos,
    }
  }, [dados, origens, avaliacoes])

  const conversaoFinanceira =
    metrics.valorOportunidades > 0 ? (metrics.valorVendas / metrics.valorOportunidades) * 100 : 0
  const ticketMedio = metrics.qtdeVendas > 0 ? metrics.valorVendas / metrics.qtdeVendas : 0
  const conversaoQuantitativa =
    metrics.pacientesAtendidos > 0 ? (metrics.qtdeVendas / metrics.pacientesAtendidos) * 100 : 0

  const formatBrl = (v: number) =>
    Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      {/* BLOCO 1: FUNIL POR OPORTUNIDADES GERADAS EM R$ */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-500/10 rounded-lg">
            <Target className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white uppercase tracking-wide">
              Funil por Oportunidades Geradas em R$
            </h3>
            <p className="text-sm text-slate-400">
              Análise de performance baseada no valor financeiro gerado e convertido
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="p-6 rounded-xl border border-slate-700 bg-slate-800/50 flex flex-col items-center text-center shadow-lg">
            <div className="p-4 bg-slate-900 rounded-full mb-4 ring-1 ring-blue-500/20">
              <Target className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-sm font-semibold mb-1 uppercase tracking-wider text-slate-200">
              Oportunidades Geradas
            </h3>
            <div className="text-2xl font-bold mb-2 text-blue-400">
              {formatBrl(metrics.valorOportunidades)}
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-1">
              Soma de avaliações realizadas no período
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-700 bg-slate-800/50 flex flex-col items-center text-center shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
            <div className="p-4 bg-slate-900 rounded-full mb-4 ring-1 ring-emerald-500/20">
              <DollarSign className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-sm font-semibold mb-1 uppercase tracking-wider text-slate-200">
              Total de Vendas
            </h3>
            <div className="text-2xl font-bold mb-2 text-emerald-400">
              {formatBrl(metrics.valorVendas)}
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-1">
              Vendas finalizadas no período (independente da data da avaliação)
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-700 bg-slate-800/50 flex flex-col items-center text-center shadow-lg">
            <div className="p-4 bg-slate-900 rounded-full mb-4 ring-1 ring-cyan-500/20">
              <Percent className="w-8 h-8 text-cyan-500" />
            </div>
            <h3 className="text-sm font-semibold mb-1 uppercase tracking-wider text-slate-200">
              Conversão Total
            </h3>
            <div className="text-3xl font-bold mb-2 text-cyan-400">
              {conversaoFinanceira.toFixed(1)}%
            </div>
            <p className="text-xs text-slate-400 font-medium">Vendas / Oportunidades</p>
          </div>

          <div className="p-6 rounded-xl border border-slate-700 bg-slate-800/50 flex flex-col items-center text-center shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-violet-500"></div>
            <div className="p-4 bg-slate-900 rounded-full mb-4 ring-1 ring-violet-500/20">
              <CheckSquare className="w-8 h-8 text-violet-500" />
            </div>
            <h3 className="text-sm font-semibold mb-1 uppercase tracking-wider text-slate-200">
              Fechamentos
            </h3>
            <div className="text-3xl font-bold mb-2 text-violet-400">{metrics.qtdeVendas}</div>
            <p className="text-xs text-slate-400 font-medium">Quantidade de vendas</p>
          </div>

          <div className="p-6 rounded-xl border border-slate-700 bg-slate-800/50 flex flex-col items-center text-center shadow-lg">
            <div className="p-4 bg-slate-900 rounded-full mb-4 ring-1 ring-purple-500/20">
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="text-sm font-semibold mb-1 uppercase tracking-wider text-slate-200">
              Ticket Médio
            </h3>
            <div className="text-2xl font-bold mb-2 text-white">{formatBrl(ticketMedio)}</div>
            <p className="text-xs text-slate-400 font-medium">Por fechamento</p>
          </div>
        </div>
      </div>

      {/* BLOCO 2: FUNIL CLÁSSICO */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-500/10 rounded-lg">
            <TrafficCone className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white uppercase tracking-wide">
              Funil Clássico (Tráfego Pago)
            </h3>
            <p className="text-sm text-slate-400">Facebook e Instagram</p>
          </div>
        </div>

        <FunilMetricsBlock metrics={metrics.classico} />
      </div>

      {/* BLOCO 3: FUNIL SECUNDÁRIO */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-emerald-500/10 rounded-lg">
            <Megaphone className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white uppercase tracking-wide">
              Funil Secundário (Orgânico e Outros)
            </h3>
            <p className="text-sm text-slate-400">
              Indicações, Google, Sorriso dos Sonhos e Campanhas
            </p>
          </div>
        </div>

        <FunilMetricsBlock metrics={metrics.secundario} />
      </div>

      {/* BLOCO 4: CONVERSÃO DE OPORTUNIDADES QUANTITATIVAS */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-emerald-500/10 rounded-lg">
            <Activity className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white uppercase tracking-wide">
              Conversão de Oportunidades Quantitativas
            </h3>
            <p className="text-sm text-slate-400">
              Análise de performance por volume de pacientes atendidos e convertidos
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 rounded-xl border border-slate-700 bg-slate-800/50 flex flex-col items-center text-center shadow-lg">
            <div className="p-4 bg-slate-900 rounded-full mb-4 ring-1 ring-blue-500/20">
              <Users className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-sm font-semibold mb-1 uppercase tracking-wider text-slate-200">
              Pacientes Atendidos
            </h3>
            <div className="text-4xl font-bold mb-2 text-white">{metrics.pacientesAtendidos}</div>
            <p className="text-xs text-slate-400 font-medium">Total de avaliações no período</p>
          </div>

          <div className="p-6 rounded-xl border border-slate-700 bg-slate-800/50 flex flex-col items-center text-center shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
            <div className="p-4 bg-slate-900 rounded-full mb-4 ring-1 ring-emerald-500/20">
              <CheckSquare className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-sm font-semibold mb-1 uppercase tracking-wider text-slate-200">
              Total de Fechamentos
            </h3>
            <div className="text-4xl font-bold mb-2 text-emerald-400">{metrics.qtdeVendas}</div>
            <p className="text-xs text-slate-400 font-medium">Vendas concretizadas</p>
          </div>

          <div className="p-6 rounded-xl border border-slate-700 bg-slate-800/50 flex flex-col items-center text-center shadow-lg">
            <div className="p-4 bg-slate-900 rounded-full mb-4 ring-1 ring-cyan-500/20">
              <Percent className="w-8 h-8 text-cyan-500" />
            </div>
            <h3 className="text-sm font-semibold mb-1 uppercase tracking-wider text-slate-200">
              Conversão Quantitativa
            </h3>
            <div className="text-4xl font-bold mb-2 text-cyan-400">
              {conversaoQuantitativa.toFixed(1)}%
            </div>
            <p className="text-xs text-slate-400 font-medium">Fechamentos / Atendidos</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function FunilMetricsBlock({ metrics }: { metrics: FunilMetrics }) {
  const percAgendamento =
    metrics.total > 0 ? Math.round((metrics.agendados / metrics.total) * 100) : 0
  const percComparecimento =
    metrics.agendados > 0 ? Math.round((metrics.compareceram / metrics.agendados) * 100) : 0
  const percFaltantes =
    metrics.agendados > 0 ? Math.round((metrics.faltantes / metrics.agendados) * 100) : 0
  const percFechamento =
    metrics.compareceram > 0 ? Math.round((metrics.qtdeVendas / metrics.compareceram) * 100) : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
        title="Faltantes"
        value={metrics.faltantes}
        percentage={percFaltantes}
        type="faltante"
        icon={UserMinus}
        subtitle={`% sobre Agendados`}
      />
      <SemaforoCard
        title="Fechamentos"
        value={metrics.qtdeVendas}
        percentage={percFechamento}
        type="fechamento"
        icon={DollarSign}
        subtitle={`% sobre Comparecimentos`}
      />
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
  } else if (type === 'faltante') {
    if (percentage >= 30) {
      colorClass = 'bg-rose-500/5 border-rose-500/20'
      indicator = 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]'
      iconColor = 'text-rose-500'
    } else if (percentage >= 15) {
      colorClass = 'bg-yellow-500/5 border-yellow-500/20'
      indicator = 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.8)]'
      iconColor = 'text-yellow-500'
    } else {
      colorClass = 'bg-emerald-500/5 border-emerald-500/20'
      indicator = 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]'
      iconColor = 'text-emerald-500'
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

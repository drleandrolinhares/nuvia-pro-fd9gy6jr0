import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EditarDadosDialog } from './editar-dados-dialog'
import { ArrowRight, Users, Calendar, CheckSquare, DollarSign, Target } from 'lucide-react'

export function OrigemCard({ origem, dado, mesReferencia, onUpdate }: any) {
  const d = dado || {
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
    fechamentos_qtde_realizado: 0,
    fechamentos_valor_realizado: 0,
  }

  const cpl = d.leads_realizado ? d.investimento / d.leads_realizado : 0
  const taxaAgendamento = d.leads_realizado
    ? (d.agendamentos_realizado / d.leads_realizado) * 100
    : 0
  const taxaComparecimento = d.agendamentos_realizado
    ? (d.comparecimentos_realizado / d.agendamentos_realizado) * 100
    : 0
  const taxaFechamento = d.comparecimentos_realizado
    ? (d.fechamentos_qtde_realizado / d.comparecimentos_realizado) * 100
    : 0
  const ticketMedio = d.fechamentos_qtde_realizado
    ? d.fechamentos_valor_realizado / d.fechamentos_qtde_realizado
    : 0

  const formatBrl = (v: number) =>
    Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <Card className="bg-slate-900 border-slate-800 shadow-md relative overflow-hidden transition-all hover:border-slate-700 group">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-400 to-amber-600"></div>

      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-800/80 bg-slate-900/50 pl-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800 rounded-md">
            <Target className="w-5 h-5 text-amber-500" />
          </div>
          <CardTitle className="text-xl font-bold text-white tracking-wide">
            {origem.nome}
          </CardTitle>
        </div>
        <div className="opacity-100 transition-opacity">
          <EditarDadosDialog
            origem={origem}
            dado={dado}
            mesReferencia={mesReferencia}
            onUpdate={onUpdate}
          />
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-8 pl-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center relative">
          {/* Connector lines for desktop */}
          <div className="hidden md:block absolute top-1/2 left-[12.5%] right-[12.5%] h-[2px] bg-slate-800 -z-10 -translate-y-4"></div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner relative group-hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-center mb-2">
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
              Leads
            </p>
            <p className="text-3xl font-bold text-white my-1">{d.leads_realizado}</p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <span className="text-[11px] font-medium text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                Meta: {d.meta_leads}
              </span>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner relative group-hover:border-slate-700 transition-colors">
            <div className="hidden md:flex absolute -left-5 top-1/2 -translate-y-4 items-center justify-center bg-slate-900 border border-slate-800 rounded-full w-6 h-6">
              <ArrowRight className="w-3 h-3 text-slate-500" />
            </div>
            <div className="flex items-center justify-center mb-2">
              <Calendar className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-xs font-semibold text-blue-400 mb-1 uppercase tracking-wider">
              Agend.
            </p>
            <p className="text-3xl font-bold text-white my-1">{d.agendamentos_realizado}</p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <span className="text-[11px] font-medium text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                {taxaAgendamento.toFixed(1)}% conv.
              </span>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner relative group-hover:border-slate-700 transition-colors">
            <div className="hidden md:flex absolute -left-5 top-1/2 -translate-y-4 items-center justify-center bg-slate-900 border border-slate-800 rounded-full w-6 h-6">
              <ArrowRight className="w-3 h-3 text-slate-500" />
            </div>
            <div className="flex items-center justify-center mb-2">
              <CheckSquare className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-xs font-semibold text-purple-400 mb-1 uppercase tracking-wider">
              Comp.
            </p>
            <p className="text-3xl font-bold text-white my-1">{d.comparecimentos_realizado}</p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <span className="text-[11px] font-medium text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                {taxaComparecimento.toFixed(1)}% conv.
              </span>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner relative group-hover:border-emerald-900/50 transition-colors">
            <div className="hidden md:flex absolute -left-5 top-1/2 -translate-y-4 items-center justify-center bg-slate-900 border border-slate-800 rounded-full w-6 h-6">
              <ArrowRight className="w-3 h-3 text-slate-500" />
            </div>
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-xs font-semibold text-emerald-400 mb-1 uppercase tracking-wider">
              Fecham.
            </p>
            <p className="text-3xl font-bold text-emerald-400 my-1">
              {d.fechamentos_qtde_realizado}
            </p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <span className="text-[11px] font-medium text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                {taxaFechamento.toFixed(1)}% conv.
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-800/30 p-5 rounded-xl border border-slate-800/60">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Target className="w-3.5 h-3.5" />
              Métricas de Aquisição
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Investimento Total</span>
                <span className="text-white font-bold">{formatBrl(d.investimento)}</span>
              </div>
              <div className="h-px w-full bg-slate-800/50"></div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Custo por Lead (CPL)</span>
                <span className="text-amber-400 font-bold">{formatBrl(cpl)}</span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-950/20 p-5 rounded-xl border border-emerald-900/30">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <DollarSign className="w-3.5 h-3.5" />
              Resultado de Vendas
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Receita Gerada</span>
                <span className="text-emerald-400 font-bold text-base">
                  {formatBrl(d.fechamentos_valor_realizado)}
                </span>
              </div>
              <div className="h-px w-full bg-emerald-900/30"></div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Ticket Médio</span>
                <span className="text-white font-bold">{formatBrl(ticketMedio)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

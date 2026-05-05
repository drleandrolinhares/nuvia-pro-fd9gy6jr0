import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EditarDadosDialog } from './editar-dados-dialog'

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
    <Card className="bg-slate-900/50 border-slate-800 relative overflow-hidden backdrop-blur-sm shadow-xl">
      <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-800/50">
        <CardTitle className="text-lg font-bold text-white">{origem.nome}</CardTitle>
        <EditarDadosDialog
          origem={origem}
          dado={dado}
          mesReferencia={mesReferencia}
          onUpdate={onUpdate}
        />
      </CardHeader>
      <CardContent className="pt-4 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/50 shadow-inner">
            <p className="text-xs text-slate-400 mb-1 uppercase">Leads</p>
            <p className="text-2xl font-bold text-white">{d.leads_realizado}</p>
            <p className="text-[10px] text-slate-500 mt-1">Meta: {d.meta_leads}</p>
          </div>
          <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/50 shadow-inner relative">
            <p className="text-xs text-slate-400 mb-1 uppercase">Agend.</p>
            <p className="text-2xl font-bold text-blue-400">{d.agendamentos_realizado}</p>
            <p className="text-[10px] text-blue-400/70 mt-1">{taxaAgendamento.toFixed(1)}% conv.</p>
          </div>
          <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/50 shadow-inner">
            <p className="text-xs text-slate-400 mb-1 uppercase">Comp.</p>
            <p className="text-2xl font-bold text-purple-400">{d.comparecimentos_realizado}</p>
            <p className="text-[10px] text-purple-400/70 mt-1">
              {taxaComparecimento.toFixed(1)}% conv.
            </p>
          </div>
          <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/50 shadow-inner">
            <p className="text-xs text-slate-400 mb-1 uppercase">Fecham.</p>
            <p className="text-2xl font-bold text-emerald-400">{d.fechamentos_qtde_realizado}</p>
            <p className="text-[10px] text-emerald-400/70 mt-1">
              {taxaFechamento.toFixed(1)}% conv.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 bg-slate-950/30 p-4 rounded-lg border border-slate-800/50">
          <div className="space-y-2">
            <div className="flex justify-between text-sm border-b border-slate-800/50 pb-1">
              <span className="text-slate-400">Investimento:</span>
              <span className="text-white font-medium">{formatBrl(d.investimento)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Custo por Lead (CPL):</span>
              <span className="text-white font-medium">{formatBrl(cpl)}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm border-b border-slate-800/50 pb-1">
              <span className="text-slate-400">Receita Total:</span>
              <span className="text-emerald-400 font-medium">
                {formatBrl(d.fechamentos_valor_realizado)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Ticket Médio:</span>
              <span className="text-white font-medium">{formatBrl(ticketMedio)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

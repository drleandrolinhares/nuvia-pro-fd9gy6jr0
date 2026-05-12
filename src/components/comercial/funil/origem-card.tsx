import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EditarDadosDialog } from './editar-dados-dialog'
import {
  ArrowRight,
  Users,
  Calendar,
  CheckSquare,
  DollarSign,
  Target,
  UserMinus,
  Loader2,
  Edit,
  BarChart3,
} from 'lucide-react'
import { EditarLeadModal } from './editar-lead-modal'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase/client'

export function OrigemCard({ origem, dado, mesReferencia, etapas, temperaturas, onUpdate }: any) {
  const [open, setOpen] = useState(false)
  const [openAnalise, setOpenAnalise] = useState(false)
  const [modalType, setModalType] = useState<string | null>(null)
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [leadEditando, setLeadEditando] = useState<any>(null)

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
    faltas_realizado: 0,
    meta_fechamento_valor: 0,
    ticket_medio_esperado: 0,
    meta_fechamentos_perc: 0,
    fechamentos_qtde_realizado: 0,
    fechamentos_valor_realizado: 0,
  }

  const cpl = d.leads_realizado ? d.investimento / d.leads_realizado : 0
  const ticketMedio = d.fechamentos_qtde_realizado
    ? d.fechamentos_valor_realizado / d.fechamentos_qtde_realizado
    : 0

  const formatBrl = (v: number) =>
    Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const fetchLeads = async () => {
    setLoading(true)
    const [ano, mes] = mesReferencia.split('-')
    const dataInicio = `${mesReferencia}-01`
    const ultimoDia = new Date(Number(ano), Number(mes), 0).getDate()
    const dataFim = `${mesReferencia}-${ultimoDia}`

    const { data: leadsData } = await supabase
      .from('funil_leads')
      .select('*')
      .eq('origem_id', origem.id)
      .eq('mes_referencia', mesReferencia)
      .order('criado_em', { ascending: false })

    const { data: avaliacoesData } = await supabase
      .from('avaliacoes')
      .select(
        'id, origem_id, valor_orcamento, status, data_avaliacao, criado_em, pacientes(nome, telefone)',
      )
      .eq('origem_id', origem.id)
      .gte('data_avaliacao', dataInicio)
      .lte('data_avaliacao', dataFim)

    const { data: vendasData } = await supabase
      .from('vendas_confirmadas')
      .select(
        'id, paciente_nome, telefone, data_fechamento, criado_em, origem_id, avaliacoes(origem_id)',
      )
      .gte('data_fechamento', dataInicio)
      .lte('data_fechamento', dataFim)

    const { data: pastVendas } = await supabase
      .from('vendas_confirmadas')
      .select('paciente_nome')
      .lt('data_fechamento', dataInicio)

    const pacientesRecorrentes = new Set(
      (pastVendas || []).map((v) => v.paciente_nome?.toLowerCase().trim()).filter(Boolean),
    )

    const isRecorrenteOrigem = origem.nome?.toLowerCase().includes('recorrente')

    const vendasOrigem = (vendasData || []).filter((v: any) => {
      const matched = (v.origem_id || v.avaliacoes?.origem_id) === origem.id
      if (!matched) return false
      return true
    })

    const processado = new Set<string>()
    const unifiedLeads: any[] = []

    ;(leadsData || []).forEach((lead: any) => {
      const nome = lead.nome?.toLowerCase().trim()

      if (nome) processado.add(nome)
      unifiedLeads.push(lead)
    })

    ;(avaliacoesData || []).forEach((av: any) => {
      const nome = av.pacientes?.nome?.toLowerCase().trim()

      if (nome && processado.has(nome)) return
      if (nome) processado.add(nome)

      unifiedLeads.push({
        _key: `av-${av.id}`,
        id: '',
        nome: av.pacientes?.nome || 'Sem nome',
        telefone: av.pacientes?.telefone || '',
        status: 'avaliacao',
        temperatura: 'quente',
        criado_em: av.data_avaliacao || av.criado_em,
        origem_id: av.origem_id,
        mes_referencia: mesReferencia,
        qtd_agendamentos:
          origem.nome?.toLowerCase().includes('recorrente') ||
          (nome && pacientesRecorrentes.has(nome))
            ? 0
            : 1,
        qtd_faltas: 0,
        isRecorrente: nome ? pacientesRecorrentes.has(nome) : false,
      })
    })

    ;(vendasOrigem || []).forEach((v: any) => {
      const nome = v.paciente_nome?.toLowerCase().trim()

      if (nome && processado.has(nome)) return
      if (nome) processado.add(nome)

      unifiedLeads.push({
        _key: `vd-${v.id}`,
        id: '',
        nome: v.paciente_nome || 'Sem nome',
        telefone: v.telefone || '',
        status: 'venda-fechada',
        temperatura: 'quente',
        criado_em: v.data_fechamento || v.criado_em,
        origem_id: v.origem_id || v.avaliacoes?.origem_id,
        mes_referencia: mesReferencia,
        qtd_agendamentos:
          origem.nome?.toLowerCase().includes('recorrente') ||
          (nome && pacientesRecorrentes.has(nome))
            ? 0
            : 1,
        qtd_faltas: 0,
        isRecorrente: nome ? pacientesRecorrentes.has(nome) : false,
      })
    })

    unifiedLeads.forEach((lead) => {
      if (lead.isRecorrente === undefined) {
        const nome = lead.nome?.toLowerCase().trim()
        lead.isRecorrente = nome ? pacientesRecorrentes.has(nome) : false
      }
    })

    unifiedLeads.sort(
      (a, b) => new Date(b.criado_em || 0).getTime() - new Date(a.criado_em || 0).getTime(),
    )

    setLeads(unifiedLeads)
    setLoading(false)
  }

  const handleOpenLeads = (type: string) => {
    setModalType(type)
    setOpen(true)
    fetchLeads()
  }

  const leadsFiltrados = useMemo(() => {
    if (modalType === 'leads') return leads
    if (modalType === 'agendamentos') {
      return leads.filter((l) => {
        if (origem.nome?.toLowerCase().includes('recorrente') || l.isRecorrente) return false
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
          'em_follow_up',
        ].includes(l.status)
        return isAgendado || l.qtd_agendamentos > 0
      })
    }
    if (modalType === 'comparecimentos') {
      return leads.filter((l) => {
        if (origem.nome?.toLowerCase().includes('recorrente') || l.isRecorrente) return false
        return [
          'atendido',
          'negociacao',
          'venda-fechada',
          'venda-perdida',
          'avaliacao',
          'fechamento',
          'em_follow_up',
        ].includes(l.status)
      })
    }
    if (modalType === 'faltas') {
      return leads.filter((l) => {
        if (origem.nome?.toLowerCase().includes('recorrente') || l.isRecorrente) return false
        return l.status === 'faltou' || l.qtd_faltas > 0
      })
    }
    return []
  }, [leads, modalType, origem.nome])

  return (
    <>
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
          <div className="opacity-100 transition-opacity flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpenAnalise(true)}
              className="h-8 px-3 bg-slate-800 border-slate-700 text-white hover:bg-amber-500/10 hover:text-amber-500 hover:border-amber-500/50 transition-all shadow-sm"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              ANÁLISE
            </Button>
            <EditarDadosDialog
              open={openAnalise}
              onOpenChange={setOpenAnalise}
              origem={origem}
              dado={dado}
              mesReferencia={mesReferencia}
              onUpdate={onUpdate}
            />
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-8 pl-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center relative">
            <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-[2px] bg-slate-800 -z-10 -translate-y-1/2"></div>

            <div
              className="bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-inner relative hover:border-slate-700 hover:bg-slate-900 transition-colors flex flex-col items-center justify-center cursor-pointer"
              onClick={() => handleOpenLeads('leads')}
            >
              <div className="flex items-center justify-center mb-3">
                <Users className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                Leads
              </p>
              <p className="text-4xl font-bold text-white mt-1">{d.leads_realizado}</p>
            </div>

            <div
              className="bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-inner relative hover:border-slate-700 hover:bg-slate-900 transition-colors flex flex-col items-center justify-center cursor-pointer"
              onClick={() => handleOpenLeads('agendamentos')}
            >
              <div className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 items-center justify-center bg-slate-900 border border-slate-800 rounded-full w-6 h-6">
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </div>
              <div className="flex items-center justify-center mb-3">
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-sm font-semibold text-blue-400 mb-1 uppercase tracking-wider">
                Agend.
              </p>
              <p className="text-4xl font-bold text-white mt-1">{d.agendamentos_realizado}</p>
            </div>

            <div
              className="bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-inner relative hover:border-slate-700 hover:bg-slate-900 transition-colors flex flex-col items-center justify-center cursor-pointer"
              onClick={() => handleOpenLeads('comparecimentos')}
            >
              <div className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 items-center justify-center bg-slate-900 border border-slate-800 rounded-full w-6 h-6">
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </div>
              <div className="flex items-center justify-center mb-3">
                <CheckSquare className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-sm font-semibold text-purple-400 mb-1 uppercase tracking-wider">
                Comp.
              </p>
              <p className="text-4xl font-bold text-white mt-1">{d.comparecimentos_realizado}</p>
            </div>

            <div
              className="bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-inner relative hover:border-rose-900/50 hover:bg-slate-900 transition-colors flex flex-col items-center justify-center cursor-pointer"
              onClick={() => handleOpenLeads('faltas')}
            >
              <div className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 items-center justify-center bg-slate-900 border border-slate-800 rounded-full w-6 h-6">
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </div>
              <div className="flex items-center justify-center mb-3">
                <UserMinus className="w-5 h-5 text-rose-500" />
              </div>
              <p className="text-sm font-semibold text-rose-400 mb-1 uppercase tracking-wider">
                Falt.
              </p>
              <p className="text-4xl font-bold text-white mt-1">{d.faltas_realizado}</p>
            </div>

            <div
              className="bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-inner relative hover:border-emerald-900/50 hover:bg-slate-900 transition-colors flex flex-col items-center justify-center cursor-pointer"
              onClick={() => setOpenAnalise(true)}
            >
              <div className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 items-center justify-center bg-slate-900 border border-slate-800 rounded-full w-6 h-6">
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </div>
              <div className="flex items-center justify-center mb-3">
                <DollarSign className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-sm font-semibold text-emerald-400 mb-1 uppercase tracking-wider">
                Fecham.
              </p>
              <p className="text-4xl font-bold text-emerald-400 mt-1">
                {d.fechamentos_qtde_realizado}
              </p>
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl bg-slate-900 border-slate-800 text-slate-200">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Listagem de Pacientes -{' '}
              {modalType === 'leads'
                ? 'Todos os Leads'
                : modalType === 'agendamentos'
                  ? 'Agendamentos'
                  : modalType === 'comparecimentos'
                    ? 'Comparecimentos'
                    : 'Faltas'}{' '}
              - {origem.nome} ({mesReferencia})
            </DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
          ) : (
            <div className="space-y-6 mt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-slate-300">
                  Total Encontrado: {leadsFiltrados.length}
                </h3>
              </div>

              <div className="border border-slate-800 rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader className="bg-slate-950 sticky top-0 z-10">
                    <TableRow className="border-slate-800">
                      <TableHead className="text-slate-400">Paciente</TableHead>
                      <TableHead className="text-slate-400">Telefone</TableHead>
                      <TableHead className="text-slate-400 text-center">Status</TableHead>
                      <TableHead className="text-slate-400 text-center">Temperatura</TableHead>
                      <TableHead className="text-slate-400 text-center">Data</TableHead>
                      <TableHead className="text-slate-400 w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leadsFiltrados.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                          Nenhum paciente encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      leadsFiltrados.map((l, idx) => (
                        <TableRow
                          key={l.id || l._key || idx}
                          className="border-slate-800 hover:bg-slate-800/50"
                        >
                          <TableCell className="font-medium text-slate-200">{l.nome}</TableCell>
                          <TableCell className="text-slate-400">{l.telefone || '-'}</TableCell>
                          <TableCell className="text-center">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                              {etapas?.find((e: any) => e.slug === l.status)?.nome ||
                                l.status ||
                                '-'}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                              {temperaturas?.find((t: any) => t.slug === l.temperatura)?.nome ||
                                l.temperatura ||
                                '-'}
                            </span>
                          </TableCell>
                          <TableCell className="text-center text-slate-400">
                            {l.criado_em ? format(new Date(l.criado_em), 'dd/MM/yyyy') : '-'}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setLeadEditando(l)}
                              className="h-8 w-8 text-slate-400 hover:text-amber-500 hover:bg-amber-500/10"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {leadEditando && (
        <EditarLeadModal
          open={!!leadEditando}
          onOpenChange={(isOpen: boolean) => !isOpen && setLeadEditando(null)}
          lead={leadEditando}
          etapas={etapas}
          temperaturas={temperaturas}
          onSaved={() => {
            fetchLeads()
            onUpdate()
          }}
        />
      )}
    </>
  )
}

import { useState, useEffect } from 'react'
import { format, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar } from '@/components/ui/calendar'
import { supabase } from '@/lib/supabase/client'
import {
  Loader2,
  Phone,
  User,
  Clock,
  Edit2,
  Plus,
  Calendar as CalendarIcon,
  CheckCircle2,
  CalendarCheck,
  AlertCircle,
  RotateCcw,
  Ban,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { LeadDialog } from './lead-dialog'
import { Button } from '@/components/ui/button'
import { CompromissoComercialModal } from './compromisso-comercial-modal'
import { getCompromissos, getUsuarios } from '@/services/compromissos'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

export function AgendaComercial({ origens, etapas, temperaturas }: any) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [leads, setLeads] = useState<any[]>([])
  const [compromissos, setCompromissos] = useState<any[]>([])
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingLead, setEditingLead] = useState<any>(null)

  const [activeTab, setActiveTab] = useState<'crc_lead' | 'crc_comercial'>('crc_lead')
  const [isComercialModalOpen, setIsComercialModalOpen] = useState(false)
  const [editingEvento, setEditingEvento] = useState<any>(null)
  const [isFuturosDialogOpen, setIsFuturosDialogOpen] = useState(false)
  const [dialogTab, setDialogTab] = useState<'crc_lead' | 'crc_comercial'>('crc_comercial')

  const { toast } = useToast()

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: leadsData } = await supabase
        .from('funil_leads')
        .select('*')
        .not('data_proximo_contato', 'is', null)
        .order('data_proximo_contato', { ascending: true })

      const compData = await getCompromissos('comercial')
      const usersData = await getUsuarios()

      setLeads(leadsData || [])
      setCompromissos(compData || [])
      setUsuarios(usersData || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const leadsDoDia = leads.filter(
    (l) => l.data_proximo_contato && date && isSameDay(new Date(l.data_proximo_contato), date),
  )

  const compromissosDoDia = compromissos.filter((c) => {
    if (!date) return false
    if (activeTab === 'crc_comercial' && c.tipo_compromisso !== 'acao_comercial') return false
    const start = new Date(c.data_inicio + 'T00:00:00')
    const end = new Date(c.data_fim + 'T23:59:59')
    const checkDate = new Date(date)
    checkDate.setHours(12, 0, 0, 0)
    return checkDate >= start && checkDate <= end
  })

  const compromissosComerciaisDoDia = compromissosDoDia.filter(
    (c) => c.tipo_compromisso === 'acao_comercial',
  )

  const diasComCompromisso: Date[] = []
  if (activeTab === 'crc_lead') {
    leads.forEach((l) => {
      if (l.data_proximo_contato) diasComCompromisso.push(new Date(l.data_proximo_contato))
    })
  } else {
    compromissos.forEach((c) => {
      if (c.tipo_compromisso === 'acao_comercial' && c.data_inicio && c.data_fim) {
        // Se cancelado, não destaca na cor dourada de compromisso ativo do calendário
        if (c.status_acao === 'cancelado') return
        const start = new Date(c.data_inicio + 'T00:00:00')
        const end = new Date(c.data_fim + 'T00:00:00')
        let curr = new Date(start)
        while (curr <= end) {
          diasComCompromisso.push(new Date(curr))
          curr.setDate(curr.getDate() + 1)
        }
      }
    })
  }

  // REGRA CONFIRMADA PELO USUÁRIO (Dr. Leandro):
  // Conta TUDO de hoje em diante, INCLUINDO hoje; apenas o que já passou sai da conta.
  // Exemplo validado: ações no dia 25, 26 e duas no 29 -> "4 compromissos agendados".
  // Desconsidera apenas ações canceladas.
  const hojeZero = new Date()
  hojeZero.setHours(0, 0, 0, 0)
  const hojeZeroTime = hojeZero.getTime()

  // Agendamentos comerciais de hoje em diante (excluindo cancelados), ordenados por data/hora crescente
  const agendamentosComerciaisFuturos = compromissos
    .filter((c) => {
      if (c.tipo_compromisso !== 'acao_comercial') return false
      if (c.status_acao === 'cancelado') return false
      if (!c.data_inicio) return false

      // Interpretar a data da ação em horário local para comparar por dia
      const [ano, mes, dia] = c.data_inicio.split('-').map(Number)
      if (!ano || !mes || !dia) return false
      const dataAcaoZero = new Date(ano, mes - 1, dia, 0, 0, 0, 0).getTime()

      // De hoje em diante, INCLUINDO hoje
      return dataAcaoZero >= hojeZeroTime
    })
    .sort((a, b) => {
      if (a.data_inicio !== b.data_inicio) {
        return a.data_inicio.localeCompare(b.data_inicio)
      }
      const horaA = a.hora_inicio || '00:00:00'
      const horaB = b.hora_inicio || '00:00:00'
      return horaA.localeCompare(horaB)
    })

  const agendamentosFuturosContagem = agendamentosComerciaisFuturos.length

  // Leads futuros (data_proximo_contato >= hoje), ordenados por data/hora crescente
  const leadsFuturos = leads
    .filter((l) => {
      if (!l.data_proximo_contato) return false
      const d = new Date(l.data_proximo_contato)
      const leadZero = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0).getTime()
      return leadZero >= hojeZeroTime
    })
    .sort((a, b) => {
      return new Date(a.data_proximo_contato).getTime() - new Date(b.data_proximo_contato).getTime()
    })

  const leadsFuturosContagem = leadsFuturos.length

  const totalFuturosExibicao =
    activeTab === 'crc_comercial' ? agendamentosFuturosContagem : leadsFuturosContagem

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in-up">
      <div className="md:col-span-4 lg:col-span-3 flex flex-col gap-4">
        {/* Bloco do Calendário */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col items-center shadow-sm">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            locale={ptBR}
            className="rounded-md border-slate-800 bg-slate-950 text-slate-300 w-full"
            modifiers={{
              booked: diasComCompromisso,
            }}
            modifiersClassNames={{
              booked: 'text-amber-500 font-bold border border-amber-500/50 bg-amber-500/10',
            }}
          />
        </div>

        {/* 1. CONTADOR DE AGENDAMENTOS FUTUROS (Abaixo do Calendário) */}
        {/* Card corrigido: fundo 100% opaco em slate-900 com overflow-hidden para eliminar artefatos/sobras claras */}
        <div className="bg-slate-900 p-5 rounded-xl border border-amber-500/30 shadow-md shadow-black/40 relative overflow-hidden group">
          {/* Brilho dourado interno e contido */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5">
                <CalendarCheck className="w-4 h-4 text-amber-400" />
                Agendamentos Futuros
              </span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                Hoje em diante
              </span>
            </div>

            {/* Contador clicável com gatilho para o modal de compromissos futuros */}
            <button
              type="button"
              onClick={() => {
                setDialogTab(activeTab)
                setIsFuturosDialogOpen(true)
              }}
              className="mt-3 flex flex-col text-left group/btn cursor-pointer p-1.5 -m-1.5 rounded-lg hover:bg-amber-500/10 focus:outline-none focus:ring-1 focus:ring-amber-500/40 transition-all w-full"
              title="Clique para ver a lista de compromissos futuros"
            >
              <div className="flex items-baseline gap-2">
                <span className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight font-mono group-hover/btn:text-amber-400 transition-colors">
                  {totalFuturosExibicao}
                </span>
                <span className="text-sm font-medium text-amber-200/80 group-hover/btn:text-amber-300 transition-colors flex items-center gap-1.5">
                  {totalFuturosExibicao === 1 ? 'compromisso agendado' : 'compromissos agendados'}
                  <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover/btn:opacity-100 group-hover/btn:translate-x-0.5 transition-all text-amber-400" />
                </span>
              </div>
              <span className="text-[11px] text-amber-400/80 font-medium mt-1 flex items-center gap-1 group-hover/btn:text-amber-300 transition-colors">
                Ver lista completa →
              </span>
            </button>

            <p className="text-[11px] text-slate-400 mt-2.5 flex items-center gap-1 leading-snug">
              <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
              <span>Inclui ações de hoje e datas futuras (atualizado em tempo real).</span>
            </p>
          </div>
        </div>
      </div>
      <div className="md:col-span-8 lg:col-span-9 bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm flex flex-col min-h-[500px]">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              {activeTab === 'crc_lead' ? 'Contatos' : 'Ações Comerciais'} Agendadas para{' '}
              {date ? format(date, "dd 'de' MMMM", { locale: ptBR }) : ''}
            </h3>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 xl:pb-0 hide-scrollbar">
            <Button
              variant={activeTab === 'crc_lead' ? 'default' : 'outline'}
              className={cn(
                activeTab === 'crc_lead'
                  ? 'bg-amber-600 hover:bg-amber-700 text-white border-transparent'
                  : 'border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white',
              )}
              onClick={() => setActiveTab('crc_lead')}
            >
              CRC LEAD
            </Button>
            <Button
              variant={activeTab === 'crc_comercial' ? 'default' : 'outline'}
              className={cn(
                activeTab === 'crc_comercial'
                  ? 'bg-amber-600 hover:bg-amber-700 text-white border-transparent'
                  : 'border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white',
              )}
              onClick={() => setActiveTab('crc_comercial')}
            >
              CRC COMERCIAL
            </Button>

            {activeTab === 'crc_comercial' && (
              <Button
                type="button"
                onClick={() => {
                  setEditingEvento(null)
                  setIsComercialModalOpen(true)
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white whitespace-nowrap ml-2 shadow-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Ação
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex justify-center items-center">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : activeTab === 'crc_lead' ? (
          leadsDoDia.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-50 py-12">
              <Clock className="w-16 h-16 mb-4" />
              <p className="text-lg font-medium">Nenhum lead agendado para este dia.</p>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
              {leadsDoDia.map((lead) => {
                const statusObj = etapas?.find((e: any) => e.slug === lead.status)
                return (
                  <div
                    key={lead.id}
                    className="bg-slate-950 p-5 rounded-lg border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-all group shadow-sm"
                  >
                    <div>
                      <h4 className="font-bold text-slate-200 text-base flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        {lead.nome}
                      </h4>
                      <div className="flex items-center gap-4 mt-2">
                        {lead.telefone && (
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {lead.telefone}
                          </p>
                        )}
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: statusObj?.cor ? `${statusObj.cor}20` : '#334155',
                            color: statusObj?.cor || '#94a3b8',
                          }}
                        >
                          {statusObj?.nome || 'Desconhecido'}
                        </span>
                        <div className="text-xs text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(lead.data_proximo_contato), 'HH:mm')}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setEditingLead(lead)}
                      className="p-2.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-amber-500 hover:text-amber-950 transition-colors shadow-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          )
        ) : compromissosComerciaisDoDia.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-50 py-12">
            <CalendarIcon className="w-16 h-16 mb-4" />
            <p className="text-lg font-medium">Nenhuma ação comercial agendada para este dia.</p>
          </div>
        ) : (
          <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
            {compromissosComerciaisDoDia.map((comp) => {
              const isConcluido = comp.status_acao === 'concluido'
              const isCancelado = comp.status_acao === 'cancelado'
              const isReagendado = !!comp.reagendado

              const carimboCriadoEm = comp.criado_em
                ? (() => {
                    try {
                      return format(new Date(comp.criado_em), "dd/MM 'às' HH:mm", { locale: ptBR })
                    } catch {
                      return ''
                    }
                  })()
                : ''

              return (
                <div
                  key={comp.id}
                  className={cn(
                    'p-5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all group shadow-sm',
                    isCancelado
                      ? 'bg-red-950/20 border-red-900/40 opacity-75'
                      : isConcluido
                        ? 'bg-slate-900 border-slate-800 opacity-70'
                        : 'bg-slate-950 border-slate-700 hover:border-amber-500/50',
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4
                        className={cn(
                          'font-bold text-base flex items-center gap-2',
                          isCancelado
                            ? 'text-red-400 line-through'
                            : isConcluido
                              ? 'text-slate-400'
                              : 'text-amber-500',
                        )}
                      >
                        {isCancelado ? (
                          <Ban className="w-4 h-4 text-red-400 shrink-0" />
                        ) : isConcluido ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                        ) : (
                          <Clock className="w-4 h-4 shrink-0" />
                        )}
                        <span>Ação Comercial</span>
                      </h4>

                      {/* Selos de Status / Indicadores Carimbados */}
                      {isCancelado && (
                        <Badge
                          variant="outline"
                          className="bg-red-500/15 text-red-400 border-red-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                        >
                          <Ban className="w-3 h-3" />
                          Cancelado
                        </Badge>
                      )}

                      {isReagendado && (
                        <Badge
                          variant="outline"
                          className="bg-blue-500/15 text-blue-300 border-blue-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Reagendado
                        </Badge>
                      )}

                      {/* Selo Discreto do Carimbo de Criação Imutável */}
                      {carimboCriadoEm && (
                        <span
                          title="Carimbo imutável gravado pelo banco"
                          className="text-[10px] font-mono font-medium text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded flex items-center gap-1"
                        >
                          <Clock className="w-2.5 h-2.5 text-amber-500/80" />
                          criado em {carimboCriadoEm}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1 mt-2">
                      <p
                        className={cn(
                          'text-sm font-semibold truncate',
                          isCancelado
                            ? 'text-slate-400 line-through'
                            : isConcluido
                              ? 'text-slate-400'
                              : 'text-slate-200',
                        )}
                      >
                        {comp.paciente?.nome || comp.lead?.nome || 'Contato não especificado'}
                      </p>
                      <p className="text-xs text-slate-400 truncate max-w-md">
                        {comp.descricao || 'Sem descrição'}
                      </p>
                      {comp.motivo_cancelamento && isCancelado && (
                        <p className="text-xs text-red-400/90 italic">
                          Motivo cancelamento: {comp.motivo_cancelamento}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2">
                        <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                          <User className="w-3 h-3" />
                          {comp.usuario?.nome || 'Desconhecido'}
                        </p>
                        <div
                          className={cn(
                            'text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1',
                            isCancelado
                              ? 'bg-red-500/10 text-red-400'
                              : isConcluido
                                ? 'bg-slate-800 text-slate-400'
                                : 'bg-amber-500/10 text-amber-500',
                          )}
                        >
                          <Clock className="w-3 h-3" />
                          {comp.eh_dia_inteiro
                            ? 'Dia Inteiro'
                            : `${comp.hora_inicio?.substring(0, 5) || ''}`}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setEditingEvento(comp)
                      setIsComercialModalOpen(true)
                    }}
                    title="Ver detalhes e histórico carimbado"
                    className="p-2.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-amber-500 hover:text-amber-950 transition-colors shadow-sm self-end sm:self-center shrink-0"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {editingLead && (
        <LeadDialog
          open={!!editingLead}
          onOpenChange={(op: boolean) => !op && setEditingLead(null)}
          leadData={editingLead}
          origens={origens}
          etapas={etapas}
          temperaturas={temperaturas}
          onSaved={() => {
            fetchData()
            setEditingLead(null)
          }}
        />
      )}

      {isComercialModalOpen && (
        <CompromissoComercialModal
          isOpen={isComercialModalOpen}
          onClose={() => {
            setIsComercialModalOpen(false)
            setEditingEvento(null)
          }}
          onSave={() => {
            setIsComercialModalOpen(false)
            setEditingEvento(null)
            fetchData()
          }}
          evento={editingEvento}
        />
      )}

      {/* DIALOG DE AGENDAMENTOS FUTUROS (CONTADOR CLICÁVEL) */}
      <Dialog open={isFuturosDialogOpen} onOpenChange={setIsFuturosDialogOpen}>
        <DialogContent className="max-w-2xl bg-slate-900 border-slate-800 text-slate-200 p-6 shadow-2xl">
          <DialogHeader className="border-b border-slate-800 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <DialogTitle className="text-xl flex items-center gap-2 text-white">
                  <CalendarCheck className="w-5 h-5 text-amber-400" />
                  Agendamentos Futuros
                  <Badge
                    variant="outline"
                    className="bg-amber-500/15 text-amber-300 border-amber-500/30 text-xs font-mono ml-1"
                  >
                    {dialogTab === 'crc_comercial'
                      ? agendamentosComerciaisFuturos.length
                      : leadsFuturos.length}{' '}
                    {dialogTab === 'crc_comercial'
                      ? agendamentosComerciaisFuturos.length === 1
                        ? 'compromisso'
                        : 'compromissos'
                      : leadsFuturos.length === 1
                        ? 'lead'
                        : 'leads'}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400 mt-1">
                  Compromissos agendados de hoje em diante ordenados por data e horário.
                </DialogDescription>
              </div>

              {/* Alternar abas dentro do diálogo */}
              <div className="flex items-center gap-1.5 self-start sm:self-center bg-slate-950 p-1 rounded-lg border border-slate-800">
                <Button
                  size="sm"
                  type="button"
                  variant="ghost"
                  onClick={() => setDialogTab('crc_comercial')}
                  className={cn(
                    'text-xs font-semibold h-7 px-3 rounded-md transition-all',
                    dialogTab === 'crc_comercial'
                      ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800',
                  )}
                >
                  CRC Comercial ({agendamentosComerciaisFuturos.length})
                </Button>
                <Button
                  size="sm"
                  type="button"
                  variant="ghost"
                  onClick={() => setDialogTab('crc_lead')}
                  className={cn(
                    'text-xs font-semibold h-7 px-3 rounded-md transition-all',
                    dialogTab === 'crc_lead'
                      ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800',
                  )}
                >
                  CRC Lead ({leadsFuturos.length})
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* LISTAGEM DOS ITENS QUE COMPÕEM A CONTAGEM */}
          <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-3 custom-scrollbar mt-4">
            {dialogTab === 'crc_comercial' ? (
              agendamentosComerciaisFuturos.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <CalendarCheck className="w-12 h-12 mx-auto mb-3 opacity-40 text-amber-500" />
                  <p className="text-base font-medium text-slate-300">
                    Nenhum compromisso comercial agendado de hoje em diante.
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Novas ações comerciais criadas aparecerão aqui automaticamente.
                  </p>
                </div>
              ) : (
                agendamentosComerciaisFuturos.map((comp) => {
                  const isConcluido = comp.status_acao === 'concluido'
                  const isReagendado = !!comp.reagendado

                  // Interpretar a data da ação
                  const [ano, mes, dia] = (comp.data_inicio || '').split('-').map(Number)
                  const dataObj = ano && mes && dia ? new Date(ano, mes - 1, dia) : null
                  const isHoje = dataObj ? isSameDay(dataObj, new Date()) : false

                  const dataFormatada = dataObj
                    ? isHoje
                      ? `Hoje (${format(dataObj, "dd 'de' MMMM", { locale: ptBR })})`
                      : format(dataObj, "dd/MM/yyyy '('EEEE')'", { locale: ptBR })
                    : comp.data_inicio

                  const carimboCriadoEm = comp.criado_em
                    ? (() => {
                        try {
                          return format(new Date(comp.criado_em), "dd/MM 'às' HH:mm", {
                            locale: ptBR,
                          })
                        } catch {
                          return ''
                        }
                      })()
                    : ''

                  return (
                    <div
                      key={comp.id}
                      onClick={() => {
                        setIsFuturosDialogOpen(false)
                        setEditingEvento(comp)
                        setIsComercialModalOpen(true)
                      }}
                      className={cn(
                        'p-4 rounded-lg border flex items-start justify-between gap-4 transition-all group shadow-sm cursor-pointer',
                        isConcluido
                          ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700 opacity-80'
                          : 'bg-slate-950 border-slate-800 hover:border-amber-500/60 hover:bg-slate-950/90',
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              'text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1',
                              isHoje
                                ? 'bg-amber-500 text-slate-950 font-black'
                                : 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
                            )}
                          >
                            <CalendarIcon className="w-3 h-3" />
                            {dataFormatada}
                          </span>

                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            {comp.eh_dia_inteiro
                              ? 'Dia Inteiro'
                              : comp.hora_inicio?.substring(0, 5) || 'Sem horário'}
                          </span>

                          <Badge
                            variant="outline"
                            className="bg-amber-500/10 text-amber-300 border-amber-500/20 text-[10px] font-semibold"
                          >
                            Ação Comercial
                          </Badge>

                          {isReagendado && (
                            <Badge
                              variant="outline"
                              className="bg-blue-500/15 text-blue-300 border-blue-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                            >
                              <RotateCcw className="w-3 h-3" />
                              Reagendado
                            </Badge>
                          )}

                          {isConcluido && (
                            <Badge
                              variant="outline"
                              className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              Concluído
                            </Badge>
                          )}

                          {carimboCriadoEm && (
                            <span
                              title="Carimbo imutável gravado pelo banco"
                              className="text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded flex items-center gap-1"
                            >
                              <Clock className="w-2.5 h-2.5 text-amber-500/80" />
                              criado em {carimboCriadoEm}
                            </span>
                          )}
                        </div>

                        <div className="mt-2.5 space-y-1">
                          <p className="text-sm font-bold text-slate-100 flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-amber-400" />
                            <span>
                              {comp.paciente?.nome || comp.lead?.nome || 'Contato não especificado'}
                            </span>
                          </p>

                          {comp.descricao && (
                            <p className="text-xs text-slate-400 leading-relaxed pl-5">
                              {comp.descricao}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1 pl-5">
                            <span className="flex items-center gap-1">
                              <span className="text-slate-500">Responsável:</span>
                              <strong className="text-slate-300 font-medium">
                                {comp.usuario?.nome || 'CRC Comercial'}
                              </strong>
                            </span>

                            <span className="text-[11px] font-medium text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              CRC Comercial
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="self-center shrink-0 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  )
                })
              )
            ) : leadsFuturos.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <CalendarCheck className="w-12 h-12 mx-auto mb-3 opacity-40 text-amber-500" />
                <p className="text-base font-medium text-slate-300">
                  Nenhum lead agendado de hoje em diante.
                </p>
              </div>
            ) : (
              leadsFuturos.map((lead) => {
                const statusObj = etapas?.find((e: any) => e.slug === lead.status)
                const d = new Date(lead.data_proximo_contato)
                const isHoje = isSameDay(d, new Date())

                return (
                  <div
                    key={lead.id}
                    onClick={() => {
                      setIsFuturosDialogOpen(false)
                      setEditingLead(lead)
                    }}
                    className="p-4 rounded-lg border bg-slate-950 border-slate-800 hover:border-amber-500/60 hover:bg-slate-950/90 flex items-start justify-between gap-4 transition-all group shadow-sm cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            'text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1',
                            isHoje
                              ? 'bg-amber-500 text-slate-950 font-black'
                              : 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
                          )}
                        >
                          <CalendarIcon className="w-3 h-3" />
                          {isHoje
                            ? `Hoje (${format(d, "dd 'de' MMMM", { locale: ptBR })})`
                            : format(d, "dd/MM/yyyy '('EEEE')'", { locale: ptBR })}
                        </span>

                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          {format(d, 'HH:mm')}
                        </span>

                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: statusObj?.cor ? `${statusObj.cor}20` : '#334155',
                            color: statusObj?.cor || '#94a3b8',
                          }}
                        >
                          {statusObj?.nome || 'Contato Lead'}
                        </span>

                        <Badge
                          variant="outline"
                          className="bg-blue-500/10 text-blue-300 border-blue-500/20 text-[10px] font-semibold"
                        >
                          CRC Lead
                        </Badge>
                      </div>

                      <div className="mt-2.5 space-y-1">
                        <p className="text-sm font-bold text-slate-100 flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-amber-400" />
                          <span>{lead.nome}</span>
                        </p>

                        {lead.telefone && (
                          <p className="text-xs text-slate-400 flex items-center gap-1 pl-5">
                            <Phone className="w-3 h-3 text-slate-500" />
                            <span>{lead.telefone}</span>
                          </p>
                        )}

                        {lead.observacoes && (
                          <p className="text-xs text-slate-400 leading-relaxed pl-5">
                            {lead.observacoes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="self-center shrink-0 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

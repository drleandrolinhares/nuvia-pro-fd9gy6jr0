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
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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

  const agendamentosFuturosContagem = compromissos.filter((c) => {
    if (c.tipo_compromisso !== 'acao_comercial') return false
    if (c.status_acao === 'cancelado') return false
    if (!c.data_inicio) return false

    // Interpretar a data da ação em horário local para comparar por dia
    const [ano, mes, dia] = c.data_inicio.split('-').map(Number)
    if (!ano || !mes || !dia) return false
    const dataAcaoZero = new Date(ano, mes - 1, dia, 0, 0, 0, 0).getTime()

    // De hoje em diante, INCLUINDO hoje
    return dataAcaoZero >= hojeZeroTime
  }).length

  // Contagem para leads futuros (data_proximo_contato >= hoje)
  const leadsFuturosContagem = leads.filter((l) => {
    if (!l.data_proximo_contato) return false
    const d = new Date(l.data_proximo_contato)
    const leadZero = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0).getTime()
    return leadZero >= hojeZeroTime
  }).length

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
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 p-5 rounded-xl border border-amber-500/30 shadow-lg shadow-black/40 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all duration-500" />

          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5">
              <CalendarCheck className="w-4 h-4 text-amber-400" />
              Agendamentos Futuros
            </span>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
              Hoje em diante
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight drop-shadow-sm font-mono">
              {totalFuturosExibicao}
            </span>
            <span className="text-sm font-medium text-amber-200/80">
              {totalFuturosExibicao === 1 ? 'compromisso agendado' : 'compromissos agendados'}
            </span>
          </div>

          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1 leading-snug">
            <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
            <span>Inclui ações de hoje e datas futuras (atualizado em tempo real).</span>
          </p>
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
    </div>
  )
}

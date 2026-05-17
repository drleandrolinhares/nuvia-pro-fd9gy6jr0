import { useState, useEffect } from 'react'
import { format, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar } from '@/components/ui/calendar'
import { supabase } from '@/lib/supabase/client'
import { Loader2, Phone, User, Clock, Edit2, Plus, Calendar as CalendarIcon } from 'lucide-react'
import { LeadDialog } from './lead-dialog'
import { Button } from '@/components/ui/button'
import { EventoModal } from '@/pages/operacional/components/EventoModal'
import {
  getCompromissos,
  createCompromisso,
  updateCompromisso,
  getUsuarios,
} from '@/services/compromissos'
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
  const [isEventoModalOpen, setIsEventoModalOpen] = useState(false)
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
    const start = new Date(c.data_inicio + 'T00:00:00')
    const end = new Date(c.data_fim + 'T23:59:59')
    const checkDate = new Date(date)
    checkDate.setHours(12, 0, 0, 0)
    return checkDate >= start && checkDate <= end
  })

  const diasComCompromisso: Date[] = []
  if (activeTab === 'crc_lead') {
    leads.forEach((l) => {
      if (l.data_proximo_contato) diasComCompromisso.push(new Date(l.data_proximo_contato))
    })
  } else {
    compromissos.forEach((c) => {
      if (c.data_inicio && c.data_fim) {
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

  const handleSaveEvento = async (evento: any) => {
    try {
      const eventoComercial = { ...evento, setor: 'comercial' }
      if (editingEvento && editingEvento.id) {
        await updateCompromisso(editingEvento.id, eventoComercial)
        toast({ title: 'Compromisso atualizado com sucesso!' })
      } else {
        await createCompromisso(eventoComercial)
        toast({ title: 'Compromisso criado com sucesso!' })
      }
      setIsEventoModalOpen(false)
      setEditingEvento(null)
      fetchData()
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in-up">
      <div className="md:col-span-4 lg:col-span-3 bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col items-center shadow-sm">
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
      <div className="md:col-span-8 lg:col-span-9 bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm flex flex-col min-h-[500px]">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              {activeTab === 'crc_lead' ? 'Contatos' : 'Compromissos'} Agendados para{' '}
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
                  setIsEventoModalOpen(true)
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white whitespace-nowrap ml-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo
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
        ) : compromissosDoDia.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-50 py-12">
            <CalendarIcon className="w-16 h-16 mb-4" />
            <p className="text-lg font-medium">Nenhum compromisso agendado para este dia.</p>
          </div>
        ) : (
          <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
            {compromissosDoDia.map((comp) => {
              return (
                <div
                  key={comp.id}
                  className="bg-slate-950 p-5 rounded-lg border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-all group shadow-sm"
                >
                  <div>
                    <h4 className="font-bold text-slate-200 text-base flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-slate-400" />
                      {comp.tipo_compromisso?.replace('_', ' ').toUpperCase()}
                    </h4>
                    <div className="flex flex-col gap-1 mt-2">
                      <p className="text-sm text-slate-300 font-medium">
                        {comp.descricao || 'Sem descrição'}
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {comp.usuario?.nome || 'Desconhecido'}
                        </p>
                        <div className="text-xs text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {comp.eh_dia_inteiro
                            ? 'Dia Inteiro'
                            : `${comp.hora_inicio?.substring(0, 5) || ''} às ${comp.hora_fim?.substring(0, 5) || ''}`}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setEditingEvento(comp)
                      setIsEventoModalOpen(true)
                    }}
                    className="p-2.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-emerald-500 hover:text-emerald-950 transition-colors shadow-sm"
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

      {isEventoModalOpen && (
        <EventoModal
          isOpen={isEventoModalOpen}
          onClose={() => {
            setIsEventoModalOpen(false)
            setEditingEvento(null)
          }}
          onSave={handleSaveEvento}
          evento={editingEvento}
          usuarios={usuarios}
        />
      )}
    </div>
  )
}

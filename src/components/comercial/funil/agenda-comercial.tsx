import { useState, useEffect } from 'react'
import { format, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar } from '@/components/ui/calendar'
import { supabase } from '@/lib/supabase/client'
import { Loader2, Phone, User, Clock, Edit2 } from 'lucide-react'
import { LeadDialog } from './lead-dialog'

export function AgendaComercial({ origens, etapas, temperaturas }: any) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingLead, setEditingLead] = useState<any>(null)

  const fetchLeads = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('funil_leads')
      .select('*')
      .not('data_proximo_contato', 'is', null)
      .order('data_proximo_contato', { ascending: true })
    setLeads(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchLeads()
  }, [])

  const leadsDoDia = leads.filter(
    (l) => l.data_proximo_contato && date && isSameDay(new Date(l.data_proximo_contato), date),
  )
  const diasComCompromisso = leads.map((l) => new Date(l.data_proximo_contato))

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
        <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
          <div className="p-3 bg-amber-500/10 rounded-lg">
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Contatos Agendados para {date ? format(date, "dd 'de' MMMM", { locale: ptBR }) : ''}
          </h3>
        </div>

        {loading ? (
          <div className="flex-1 flex justify-center items-center">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : leadsDoDia.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-50 py-12">
            <Clock className="w-16 h-16 mb-4" />
            <p className="text-lg font-medium">Nenhum contato agendado para este dia.</p>
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
            fetchLeads()
            setEditingLead(null)
          }}
        />
      )}
    </div>
  )
}

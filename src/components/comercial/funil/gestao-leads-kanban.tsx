import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import {
  Loader2,
  Plus,
  Phone,
  Tag,
  Trash2,
  Edit2,
  DollarSign,
  Users,
  CalendarIcon,
  Clock,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { VendasModal } from '@/pages/comercial/components/VendasModal'
import { format } from 'date-fns'
import { LeadDialog } from './lead-dialog'

const ContatosBadge = ({ contatos }: { contatos: number }) => {
  return (
    <div className="flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded border tracking-wider bg-slate-50 text-slate-600 border-slate-200 shadow-sm">
      <Phone className="w-3 h-3 text-slate-400" />
      {contatos} {contatos === 1 ? 'Contato' : 'Contatos'}
    </div>
  )
}

export function GestaoLeadsKanban({
  mesReferencia,
  origens,
  etapas,
  temperaturas,
  onUpdate,
  onOpenAgenda,
}: any) {
  const { user } = useAuth()
  const [leads, setLeads] = useState<any[]>([])
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [loading, setLoading] = useState(true)

  const [leadDialogLead, setLeadDialogLead] = useState<any>(null)
  const [vendasModalOpen, setVendasModalOpen] = useState(false)
  const [selectedLeadForVenda, setSelectedLeadForVenda] = useState<any>(null)

  const fetchLeads = async (showLoader = true) => {
    if (showLoader) setLoading(true)
    const { data } = await supabase
      .from('funil_leads')
      .select('*')
      .eq('mes_referencia', mesReferencia)
      .order('criado_em', { ascending: false })
    setLeads(data || [])
    if (showLoader) setLoading(false)
  }

  useEffect(() => {
    fetchLeads(true)
  }, [mesReferencia])

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('leadId', leadId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const saveEditing = async (lead: any) => {
    const novoNome = editName.trim()
    if (novoNome && novoNome !== lead.nome) {
      const oldName = lead.nome
      setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, nome: novoNome } : l)))
      supabase
        .from('funil_leads')
        .update({ nome: novoNome })
        .eq('id', lead.id)
        .then(async ({ error }) => {
          if (!error) {
            await Promise.all([
              supabase.from('pacientes').update({ nome: novoNome }).eq('nome', oldName),
              supabase
                .from('vendas_confirmadas')
                .update({ paciente_nome: novoNome })
                .eq('paciente_nome', oldName),
              supabase
                .from('vendas_diarias')
                .update({ paciente_nome: novoNome })
                .eq('paciente_nome', oldName),
            ])
            if (user) {
              await supabase.from('funil_leads_historico').insert([
                {
                  lead_id: lead.id,
                  usuario_id: user.id,
                  acao: 'Atualização de Nome',
                  detalhes: `Nome alterado de "${lead.nome}" para "${novoNome}"`,
                },
              ])
            }
          }
        })
    }
    setEditingLeadId(null)
  }

  const handleDrop = async (e: React.DragEvent, statusId: string) => {
    e.preventDefault()
    const leadId = e.dataTransfer.getData('leadId')
    if (!leadId) return

    const lead = leads.find((l) => l.id === leadId)
    if (!lead || lead.status === statusId) return

    if (statusId === 'fechamento') {
      setSelectedLeadForVenda(lead)
      setVendasModalOpen(true)
      return
    }

    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: statusId } : l)))

    const { error } = await supabase
      .from('funil_leads')
      .update({ status: statusId })
      .eq('id', leadId)
    if (error) {
      toast.error('Erro ao atualizar status do lead')
      fetchLeads(false)
    } else {
      if (user) {
        const oldStatusName = etapas.find((et: any) => et.slug === lead.status)?.nome || lead.status
        const newStatusName = etapas.find((et: any) => et.slug === statusId)?.nome || statusId
        await supabase.from('funil_leads_historico').insert([
          {
            lead_id: leadId,
            usuario_id: user.id,
            acao: 'Mudança de Etapa',
            detalhes: `Movido de "${oldStatusName}" para "${newStatusName}"`,
          },
        ])
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este lead?')) return
    setLeads((prev) => prev.filter((l) => l.id !== id))

    supabase
      .from('funil_leads')
      .delete()
      .eq('id', id)
      .then(({ error }) => {
        if (error) {
          toast.error('Erro ao excluir')
          fetchLeads(false)
        } else {
          toast.success('Lead excluído')
        }
      })
  }

  const openNew = () => {
    setLeadDialogLead({ mes_referencia: mesReferencia })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm gap-4 mb-2">
        <Button
          onClick={openNew}
          className="bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold px-6 shadow-md"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Lead
        </Button>
        <Button
          onClick={onOpenAgenda}
          variant="outline"
          className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700 font-bold px-6 shadow-sm"
        >
          <CalendarIcon className="w-4 h-4 mr-2 text-slate-400" />
          Agenda
        </Button>
        <div className="hidden sm:flex items-center gap-4 bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 shadow-inner">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            Leads Totais:
          </span>
          <span className="text-lg font-black text-amber-500 leading-none">{leads.length}</span>
        </div>
        <div className="hidden lg:flex items-center gap-3 ml-auto">
          <div className="p-2.5 bg-amber-500/10 rounded-lg">
            <Users className="w-5 h-5 text-amber-500" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">Gestão de Leads</h3>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 bg-slate-900/50 rounded-lg border border-slate-800">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 pt-2 snap-x hide-scrollbar min-h-[600px] h-[calc(100vh-280px)]">
          {etapas
            .filter((e: any) => e.ativo)
            .map((col: any) => {
              const colLeads = leads.filter((l) => l.status === col.slug)
              return (
                <div
                  key={col.slug}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, col.slug)}
                  className="flex flex-col min-w-[280px] max-w-[280px] rounded-xl bg-slate-100 border border-slate-200 p-3 snap-start transition-colors shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4 px-1">
                    <h4 className="font-bold text-slate-800 uppercase tracking-tight text-sm flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: col.cor || '#cbd5e1' }}
                      ></span>
                      {col.nome}
                    </h4>
                    <span className="text-xs bg-white text-slate-600 px-2.5 py-0.5 rounded-full font-bold shadow-sm border border-slate-200">
                      {colLeads.length}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                    {colLeads.map((lead) => {
                      const origemNome =
                        origens.find((o: any) => o.id === lead.origem_id)?.nome || 'Desconhecida'
                      return (
                        <div
                          key={lead.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, lead.id)}
                          className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm cursor-grab active:cursor-grabbing hover:border-slate-300 transition-all group relative overflow-hidden"
                          style={{ borderLeftColor: col.cor || '#cbd5e1', borderLeftWidth: '4px' }}
                        >
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white/90 rounded-md p-0.5 border border-slate-100 shadow-sm z-10 backdrop-blur-sm">
                            <button
                              onClick={() => {
                                setSelectedLeadForVenda(lead)
                                setVendasModalOpen(true)
                              }}
                              className="p-1 hover:text-emerald-500 text-slate-400 transition-colors"
                              title="Gerar Venda/Avaliação"
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setLeadDialogLead(lead)}
                              className="p-1 hover:text-amber-500 text-slate-400 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(lead.id)}
                              className="p-1 hover:text-red-500 text-slate-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex justify-between items-start mb-3 pr-10 min-h-[20px]">
                            {editingLeadId === lead.id ? (
                              <input
                                autoFocus
                                className="font-semibold text-slate-900 text-sm bg-slate-50 border border-amber-500 rounded px-1 w-full outline-none"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                onBlur={() => saveEditing(lead)}
                                onKeyDown={(e) => e.key === 'Enter' && saveEditing(lead)}
                              />
                            ) : (
                              <span
                                className="font-bold text-slate-800 text-sm cursor-text hover:text-amber-600 transition-colors"
                                onDoubleClick={() => {
                                  setEditingLeadId(lead.id)
                                  setEditName(lead.nome)
                                }}
                              >
                                {lead.nome}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between mb-3">
                            <ContatosBadge contatos={lead.quantidade_contatos || 0} />
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                              <Tag className="w-3 h-3 text-slate-400" />
                              <span className="truncate max-w-[90px]">{origemNome}</span>
                            </div>
                          </div>

                          {lead.data_agendamento && lead.status === 'agendado' && (
                            <div className="flex items-center gap-1.5 mb-2 bg-amber-50 p-1.5 rounded-md border border-amber-200/50 text-[11px] font-semibold text-amber-700">
                              <CalendarIcon className="w-3 h-3" />
                              {format(new Date(lead.data_agendamento), "dd/MM 'às' HH:mm")}
                            </div>
                          )}

                          {lead.telefone && (
                            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 bg-slate-50 p-1.5 rounded-md border border-slate-100/50">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <span className="font-medium">{lead.telefone}</span>
                            </div>
                          )}

                          {lead.data_proximo_contato && (
                            <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-100 text-xs font-semibold text-amber-600">
                              <Clock className="w-3.5 h-3.5" />
                              {format(new Date(lead.data_proximo_contato), "dd/MM 'às' HH:mm")}
                            </div>
                          )}
                        </div>
                      )
                    })}
                    {colLeads.length === 0 && (
                      <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-300 rounded-lg">
                        <span className="text-xs text-slate-500 font-medium">Solte cards aqui</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
        </div>
      )}

      {leadDialogLead && (
        <LeadDialog
          open={!!leadDialogLead}
          onOpenChange={(op: boolean) => !op && setLeadDialogLead(null)}
          leadData={leadDialogLead}
          mesReferencia={mesReferencia}
          origens={origens}
          etapas={etapas}
          temperaturas={temperaturas}
          onSaved={(newLead?: any) => {
            if (newLead?.id && leadDialogLead?.id) {
              setLeads((prev) => prev.map((l) => (l.id === newLead.id ? { ...l, ...newLead } : l)))
            } else {
              fetchLeads(false)
              onUpdate(false)
            }
            setLeadDialogLead(null)
          }}
        />
      )}

      <VendasModal
        open={vendasModalOpen}
        onOpenChange={(open) => {
          setVendasModalOpen(open)
          if (!open) setSelectedLeadForVenda(null)
        }}
        prefilledData={
          selectedLeadForVenda
            ? {
                telefone: selectedLeadForVenda.telefone,
                nome: selectedLeadForVenda.nome,
                origem_id: selectedLeadForVenda.origem_id,
                lead_id: selectedLeadForVenda.id,
                tipo_lancamento: 'venda_concretizada',
              }
            : undefined
        }
        onSuccess={() => {
          fetchLeads(false)
          onUpdate(false)
        }}
      />
    </div>
  )
}

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Loader2, Plus, Phone, Tag, Trash2, Edit2, DollarSign } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { VendasModal } from '@/pages/comercial/components/VendasModal'

const TemperaturaBadge = ({
  tempSlug,
  temperaturas,
}: {
  tempSlug: string
  temperaturas: any[]
}) => {
  const temp = temperaturas.find((t: any) => t.slug === tempSlug)
  if (!temp) return null
  return (
    <span
      className={cn(
        'text-[10px] px-1.5 py-0.5 rounded border uppercase font-bold tracking-wider',
        temp.cor || 'bg-slate-500/10 text-slate-500 border-slate-500/20',
      )}
    >
      {temp.nome}
    </span>
  )
}

export function GestaoLeadsKanban({ mesReferencia, origens, etapas, temperaturas, onUpdate }: any) {
  const [leads, setLeads] = useState<any[]>([])
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [vendasModalOpen, setVendasModalOpen] = useState(false)
  const [selectedLeadForVenda, setSelectedLeadForVenda] = useState<any>(null)

  const [formData, setFormData] = useState({
    id: '',
    nome: '',
    telefone: '',
    origem_id: '',
    descricao: '',
    temperatura: 'frio',
    status: 'novo',
  })
  const [saving, setSaving] = useState(false)

  const fetchLeads = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('funil_leads')
      .select('*')
      .eq('mes_referencia', mesReferencia)
      .order('criado_em', { ascending: false })
    setLeads(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchLeads()
  }, [mesReferencia])

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('leadId', leadId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const saveEditing = async (lead: any) => {
    if (editName.trim() && editName !== lead.nome) {
      setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, nome: editName.trim() } : l)))
      await supabase.from('funil_leads').update({ nome: editName.trim() }).eq('id', lead.id)
    }
    setEditingLeadId(null)
  }

  const handleDrop = async (e: React.DragEvent, statusId: string) => {
    e.preventDefault()
    const leadId = e.dataTransfer.getData('leadId')
    if (!leadId) return

    const lead = leads.find((l) => l.id === leadId)
    if (!lead || lead.status === statusId) return

    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: statusId } : l)))

    const { error } = await supabase
      .from('funil_leads')
      .update({ status: statusId })
      .eq('id', leadId)
    if (error) {
      toast.error('Erro ao atualizar status do lead')
      fetchLeads()
    } else {
      onUpdate()
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nome || !formData.origem_id) {
      toast.error('Nome e Origem são obrigatórios')
      return
    }

    setSaving(true)
    try {
      const payload = {
        nome: formData.nome,
        telefone: formData.telefone,
        origem_id: formData.origem_id,
        descricao: formData.descricao,
        temperatura: formData.temperatura || temperaturas[0]?.slug || 'frio',
        status: formData.status || etapas[0]?.slug || 'novo',
        mes_referencia: mesReferencia,
      }

      if (formData.id) {
        await supabase.from('funil_leads').update(payload).eq('id', formData.id)
        toast.success('Lead atualizado')
      } else {
        await supabase.from('funil_leads').insert([payload])
        toast.success('Lead criado')
      }

      setDialogOpen(false)
      fetchLeads()
      onUpdate()
    } catch (err: any) {
      toast.error('Erro: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este lead?')) return
    await supabase.from('funil_leads').delete().eq('id', id)
    fetchLeads()
    onUpdate()
    toast.success('Lead excluído')
  }

  const openNew = () => {
    setFormData({
      id: '',
      nome: '',
      telefone: '',
      origem_id: origens.filter((o: any) => o.ativo)[0]?.id || '',
      descricao: '',
      temperatura: temperaturas.filter((t: any) => t.ativo)[0]?.slug || 'frio',
      status: etapas.filter((e: any) => e.ativo)[0]?.slug || 'novo',
    })
    setDialogOpen(true)
  }

  const openEdit = (lead: any) => {
    setFormData({
      id: lead.id,
      nome: lead.nome,
      telefone: lead.telefone || '',
      origem_id: lead.origem_id,
      descricao: lead.descricao || '',
      temperatura: lead.temperatura,
      status: lead.status,
    })
    setDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          Gestão de Leads
        </h3>
        <Button
          onClick={openNew}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Lead
        </Button>
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
                              onClick={() => openEdit(lead)}
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
                            <TemperaturaBadge
                              tempSlug={lead.temperatura}
                              temperaturas={temperaturas}
                            />
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                              <Tag className="w-3 h-3 text-slate-400" />
                              <span className="truncate max-w-[90px]">{origemNome}</span>
                            </div>
                          </div>

                          {lead.telefone && (
                            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 bg-slate-50 p-1.5 rounded-md border border-slate-100/50">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <span className="font-medium">{lead.telefone}</span>
                            </div>
                          )}

                          {lead.descricao && (
                            <p className="text-xs text-slate-600 line-clamp-2 mt-2 pt-2 border-t border-slate-100 leading-relaxed">
                              {lead.descricao}
                            </p>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{formData.id ? 'Editar Lead' : 'Novo Lead'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Nome do Lead *</Label>
              <Input
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="bg-slate-950 border-slate-800 focus-visible:ring-amber-500 font-medium"
                placeholder="Ex: João Silva"
              />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                className="bg-slate-950 border-slate-800 focus-visible:ring-amber-500"
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Origem *</Label>
                <Select
                  value={formData.origem_id}
                  onValueChange={(v) => setFormData({ ...formData, origem_id: v })}
                >
                  <SelectTrigger className="bg-slate-950 border-slate-800 focus:ring-amber-500">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    {origens
                      .filter((o: any) => o.ativo)
                      .map((o: any) => (
                        <SelectItem key={o.id} value={o.id}>
                          {o.nome}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Temperatura</Label>
                <Select
                  value={formData.temperatura}
                  onValueChange={(v) => setFormData({ ...formData, temperatura: v })}
                >
                  <SelectTrigger className="bg-slate-950 border-slate-800 focus:ring-amber-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    {temperaturas
                      .filter((t: any) => t.ativo)
                      .map((t: any) => (
                        <SelectItem key={t.slug} value={t.slug}>
                          {t.nome}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v })}
              >
                <SelectTrigger className="bg-slate-950 border-slate-800 focus:ring-amber-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                  {etapas
                    .filter((e: any) => e.ativo)
                    .map((col: any) => (
                      <SelectItem key={col.slug} value={col.slug}>
                        {col.nome}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Descrição / Notas</Label>
              <Textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                className="bg-slate-950 border-slate-800 min-h-[80px] focus-visible:ring-amber-500"
                placeholder="Detalhes sobre o interesse, tratamentos..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDialogOpen(false)}
                className="hover:bg-slate-800 hover:text-white"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving || !formData.nome || !formData.origem_id}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6"
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Salvar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
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
              }
            : undefined
        }
        onSuccess={() => {
          fetchLeads()
          onUpdate()
        }}
      />
    </div>
  )
}

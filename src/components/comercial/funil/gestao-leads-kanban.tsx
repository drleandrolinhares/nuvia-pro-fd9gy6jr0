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
import { Loader2, Plus, Phone, Tag, Trash2, Edit2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const COLUMNS = [
  { id: 'novo', title: 'Novos', color: 'bg-slate-800/50 border-slate-700' },
  { id: 'nao_responde', title: 'Não Responde', color: 'bg-slate-800/50 border-slate-700' },
  { id: 'agendado', title: 'Agendado', color: 'bg-blue-900/20 border-blue-800/50' },
  { id: 'faltou', title: 'Faltou', color: 'bg-red-900/20 border-red-800/50' },
  { id: 'atendido', title: 'Atendido', color: 'bg-emerald-900/20 border-emerald-800/50' },
  { id: 'demitido', title: 'Demitido', color: 'bg-slate-900/50 border-slate-800' },
]

const TemperaturaBadge = ({ temp }: { temp: string }) => {
  const colors: Record<string, string> = {
    quente: 'bg-red-500/10 text-red-500 border-red-500/20',
    morno: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    frio: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  }
  return (
    <span
      className={cn(
        'text-[10px] px-1.5 py-0.5 rounded border uppercase font-bold tracking-wider',
        colors[temp] || colors.frio,
      )}
    >
      {temp}
    </span>
  )
}

export function GestaoLeadsKanban({ mesReferencia, origens, onUpdate }: any) {
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
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
        temperatura: formData.temperatura,
        status: formData.status,
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
      temperatura: 'frio',
      status: 'novo',
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
          {COLUMNS.map((col) => {
            const colLeads = leads.filter((l) => l.status === col.id)
            return (
              <div
                key={col.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
                className={cn(
                  'flex flex-col min-w-[280px] max-w-[280px] rounded-xl border p-3 snap-start transition-colors',
                  col.color,
                )}
              >
                <div className="flex items-center justify-between mb-4 px-1">
                  <h4 className="font-semibold text-slate-200">{col.title}</h4>
                  <span className="text-xs bg-slate-950 text-slate-400 px-2.5 py-0.5 rounded-full font-medium shadow-sm">
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
                        className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 shadow-sm cursor-grab active:cursor-grabbing hover:border-slate-600 transition-all group relative"
                      >
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-slate-900/90 rounded-md p-0.5 border border-slate-800 shadow-sm">
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

                        <div className="flex justify-between items-start mb-3 pr-10">
                          <span className="font-semibold text-white text-sm">{lead.nome}</span>
                        </div>

                        <div className="flex items-center justify-between mb-3">
                          <TemperaturaBadge temp={lead.temperatura} />
                          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
                            <Tag className="w-3 h-3 text-slate-500" />
                            <span className="truncate max-w-[100px]">{origemNome}</span>
                          </div>
                        </div>

                        {lead.telefone && (
                          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2 bg-slate-900/50 p-1.5 rounded-md">
                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                            <span>{lead.telefone}</span>
                          </div>
                        )}

                        {lead.descricao && (
                          <p className="text-xs text-slate-500 line-clamp-2 mt-2 pt-2 border-t border-slate-800/50 leading-relaxed">
                            {lead.descricao}
                          </p>
                        )}
                      </div>
                    )
                  })}
                  {colLeads.length === 0 && (
                    <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-800/50 rounded-lg">
                      <span className="text-xs text-slate-600 font-medium">Solte cards aqui</span>
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
                    <SelectItem value="quente">Quente</SelectItem>
                    <SelectItem value="morno">Morno</SelectItem>
                    <SelectItem value="frio">Frio</SelectItem>
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
                  {COLUMNS.map((col) => (
                    <SelectItem key={col.id} value={col.id}>
                      {col.title}
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
    </div>
  )
}

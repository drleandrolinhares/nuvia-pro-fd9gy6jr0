import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'

export function EditarLeadModal({
  open,
  onOpenChange,
  lead,
  etapas,
  temperaturas,
  origens,
  onSaved,
}: any) {
  const [loading, setLoading] = useState(false)
  const [localOrigens, setLocalOrigens] = useState<any[]>(origens || [])
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    origem_id: '',
    status: '',
    quantidade_contatos: 0,
    data_agendamento: '',
    descricao: '',
    criado_em: new Date().toISOString(),
  })

  useEffect(() => {
    if (lead) {
      setFormData({
        nome: lead.nome || '',
        telefone: lead.telefone || '',
        email: lead.email || '',
        origem_id: lead.origem_id || '',
        status: lead.status || '',
        quantidade_contatos: lead.quantidade_contatos || 0,
        data_agendamento: lead.data_agendamento ? lead.data_agendamento.substring(0, 16) : '',
        descricao: lead.descricao || '',
        criado_em: lead.criado_em || new Date().toISOString(),
      })
    }
  }, [lead])

  useEffect(() => {
    supabase
      .from('funil_origens')
      .select('*')
      .order('ordem')
      .then(({ data }) => {
        if (data) setLocalOrigens(data)
      })
  }, [])

  const handleSave = async () => {
    if (!formData.nome) {
      toast({ title: 'Erro', description: 'O nome é obrigatório.', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('funil_leads')
        .update({
          nome: formData.nome,
          telefone: formData.telefone,
          email: formData.email,
          origem_id: formData.origem_id,
          status: formData.status,
          quantidade_contatos: formData.quantidade_contatos,
          data_agendamento: formData.data_agendamento
            ? new Date(formData.data_agendamento).toISOString()
            : null,
          descricao: formData.descricao,
          atualizado_em: new Date().toISOString(),
        })
        .eq('id', lead.id)

      if (error) throw error

      toast({ title: 'Sucesso', description: 'Paciente atualizado com sucesso.' })
      onSaved({ id: lead.id, ...formData, atualizado_em: new Date().toISOString() })
      onOpenChange(false)
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-slate-200">
        <DialogHeader>
          <DialogTitle>Editar Paciente</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Data de Inclusão:</span>
            <span className="text-sm font-bold text-white">
              {format(new Date(formData.criado_em), 'dd/MM/yyyy HH:mm')}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Origem</Label>
              <Select
                value={formData.origem_id}
                onValueChange={(val) => setFormData({ ...formData, origem_id: val })}
              >
                <SelectTrigger className="bg-slate-950 border-slate-800 text-white">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                  {localOrigens
                    ?.filter((o: any) => o.ativo || o.id === formData.origem_id)
                    .map((o: any) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.nome} {!o.ativo && '(Inativa)'}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                className="bg-slate-950 border-slate-800 text-white"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="bg-slate-950 border-slate-800 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="bg-slate-950 border-slate-800 text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status (Etapa)</Label>
              <Select
                value={formData.status}
                onValueChange={(val) => setFormData({ ...formData, status: val })}
              >
                <SelectTrigger className="bg-slate-950 border-slate-800 text-white">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                  {etapas?.map((etapa: any) => (
                    <SelectItem key={etapa.slug} value={etapa.slug}>
                      {etapa.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Qtd. Contatos</Label>
              <Select
                value={formData.quantidade_contatos.toString()}
                onValueChange={(val) =>
                  setFormData({ ...formData, quantidade_contatos: parseInt(val) })
                }
              >
                <SelectTrigger className="bg-slate-950 border-slate-800 text-white">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? 'Contato' : 'Contatos'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {formData.status === 'agendado' && (
              <div className="space-y-2">
                <Label className="text-amber-500 font-bold">Data/Hora Agendamento</Label>
                <Input
                  type="datetime-local"
                  value={formData.data_agendamento}
                  onChange={(e) => setFormData({ ...formData, data_agendamento: e.target.value })}
                  className="bg-amber-500/10 border-amber-500/30 text-white focus-visible:ring-amber-500"
                />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="bg-slate-950 border-slate-800 text-white min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-amber-500 hover:bg-amber-600 text-amber-950"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

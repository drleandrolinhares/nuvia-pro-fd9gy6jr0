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
    temperatura: '',
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
        temperatura: lead.temperatura || '',
        descricao: lead.descricao || '',
        criado_em: lead.criado_em || new Date().toISOString(),
      })
    }
  }, [lead])

  useEffect(() => {
    if (!origens || origens.length === 0) {
      supabase
        .from('funil_origens')
        .select('*')
        .eq('ativo', true)
        .order('ordem')
        .then(({ data }) => {
          if (data) setLocalOrigens(data)
        })
    } else {
      setLocalOrigens(origens)
    }
  }, [origens])

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
          temperatura: formData.temperatura,
          descricao: formData.descricao,
          atualizado_em: new Date().toISOString(),
        })
        .eq('id', lead.id)

      if (error) throw error

      toast({ title: 'Sucesso', description: 'Paciente atualizado com sucesso.' })
      onSaved()
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
                  {localOrigens?.map((o: any) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.nome}
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
              <Label>Temperatura</Label>
              <Select
                value={formData.temperatura}
                onValueChange={(val) => setFormData({ ...formData, temperatura: val })}
              >
                <SelectTrigger className="bg-slate-950 border-slate-800 text-white">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                  {temperaturas?.map((temp: any) => (
                    <SelectItem key={temp.slug} value={temp.slug}>
                      {temp.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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

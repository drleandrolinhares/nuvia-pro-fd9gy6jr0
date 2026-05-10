import { useState, useEffect } from 'react'
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

export function EditarLeadModal({ open, onOpenChange, lead, etapas, temperaturas, onSaved }: any) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    status: '',
    temperatura: '',
    descricao: '',
  })

  useEffect(() => {
    if (lead) {
      setFormData({
        nome: lead.nome || '',
        telefone: lead.telefone || '',
        status: lead.status || '',
        temperatura: lead.temperatura || '',
        descricao: lead.descricao || '',
      })
    }
  }, [lead])

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
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="bg-slate-950 border-slate-800 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
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

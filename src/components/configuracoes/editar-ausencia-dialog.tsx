import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export function EditarAusenciaDialog({ open, onOpenChange, absence, onSuccess, usuarios }: any) {
  const [saving, setSaving] = useState(false)
  const [usuarioId, setUsuarioId] = useState('todos')
  const [descricao, setDescricao] = useState('')
  const [horaInicio, setHoraInicio] = useState('')
  const [horaFim, setHoraFim] = useState('')

  useEffect(() => {
    if (absence && open) {
      setUsuarioId(absence.usuario_id || 'todos')
      setDescricao(absence.descricao || '')
      setHoraInicio(absence.hora_inicio || '')
      setHoraFim(absence.hora_fim || '')
    }
  }, [absence, open])

  const handleSave = async () => {
    if (!descricao) {
      toast.error('A descrição é obrigatória.')
      return
    }

    setSaving(true)
    try {
      const updates = {
        usuario_id: usuarioId === 'todos' ? null : usuarioId,
        descricao,
        hora_inicio: horaInicio || null,
        hora_fim: horaFim || null,
      }

      const { error } = await supabase.from('ausencias').update(updates).in('id', absence.ids)
      if (error) throw error

      toast.success('Atualizado com sucesso!')
      onSuccess()
      onOpenChange(false)
    } catch (e: any) {
      toast.error('Erro ao atualizar: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Ausência / Exceção</DialogTitle>
          <DialogDescription>
            Altere as informações e aplique a todos os dias deste registro.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Colaborador / Alvo</Label>
            <Select value={usuarioId} onValueChange={setUsuarioId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">🌎 Todos (Feriado/Recesso Global)</SelectItem>
                {usuarios.map((u: any) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Descrição / Motivo</Label>
            <Input
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Férias, Atestado..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Hora Início (Opcional)</Label>
              <Input
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Hora Fim (Opcional)</Label>
              <Input type="time" value={horaFim} onChange={(e) => setHoraFim(e.target.value)} />
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Deixe os horários vazios para bloqueio de dia inteiro.
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

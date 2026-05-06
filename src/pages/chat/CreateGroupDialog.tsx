import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function CreateGroupDialog({ isOpen, onClose, usuarios, onSuccess }: any) {
  const { user } = useAuth()
  const [nome, setNome] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    if (!nome.trim()) return toast.error('Digite um nome para o grupo')
    if (selected.length === 0) return toast.error('Selecione pelo menos um participante')

    setLoading(true)
    try {
      const { data: newGroup, error: groupErr } = await supabase
        .from('chat_conversas')
        .insert({ tipo: 'grupo', nome, criado_por: user?.id })
        .select()
        .single()

      if (groupErr) throw groupErr

      const participantes = [...selected, user?.id]
        .filter((v, i, a) => a.indexOf(v) === i)
        .map((uid) => ({
          conversa_id: newGroup.id,
          usuario_id: uid,
        }))

      await supabase.from('chat_participantes').insert(participantes)

      toast.success('Grupo criado com sucesso')
      onSuccess()
      onClose()
      setNome('')
      setSelected([])
    } catch (error: any) {
      toast.error('Erro ao criar grupo: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Grupo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome do Grupo</label>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Setor Financeiro"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Participantes</label>
            <ScrollArea className="h-60 border border-slate-800 rounded-md p-2">
              {usuarios
                .filter((u: any) => u.id !== user?.id)
                .map((u: any) => (
                  <div
                    key={u.id}
                    className="flex items-center space-x-3 p-2 hover:bg-slate-800/50 rounded-lg"
                  >
                    <Checkbox
                      id={`user-${u.id}`}
                      checked={selected.includes(u.id)}
                      onCheckedChange={(c) => {
                        if (c) setSelected([...selected, u.id])
                        else setSelected(selected.filter((id) => id !== u.id))
                      }}
                    />
                    <label
                      htmlFor={`user-${u.id}`}
                      className="flex items-center gap-2 cursor-pointer flex-1"
                    >
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={u.avatar_url} />
                        <AvatarFallback>{u.nome.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-slate-200">{u.nome}</span>
                    </label>
                  </div>
                ))}
            </ScrollArea>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={loading} type="button">
            Criar Grupo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

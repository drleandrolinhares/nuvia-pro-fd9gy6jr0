import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'
import { Trash2, Edit2, Check, X, Loader2, Plus } from 'lucide-react'
import { RoteiroSetor } from '@/hooks/use-roteiros'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  setores: RoteiroSetor[]
  onSuccess: () => void
}

export function SetoresManager({ open, onOpenChange, setores, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [nome, setNome] = useState('')

  const startEdit = (setor: RoteiroSetor) => {
    setEditingId(setor.id)
    setNome(setor.nome)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setNome('')
  }

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!nome.trim()) return
    setLoading(true)
    try {
      if (editingId) {
        await supabase
          .from('roteiros_setores' as any)
          .update({ nome })
          .eq('id', editingId)
        toast({ title: 'Setor atualizado' })
      } else {
        await supabase.from('roteiros_setores' as any).insert({ nome, ordem: setores.length + 1 })
        toast({ title: 'Setor adicionado' })
      }
      cancelEdit()
      onSuccess()
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        'Deseja realmente excluir este setor e todos os seus roteiros? Esta ação não pode ser desfeita.',
      )
    )
      return
    setLoading(true)
    try {
      await supabase
        .from('roteiros_setores' as any)
        .delete()
        .eq('id', id)
      toast({ title: 'Setor removido' })
      onSuccess()
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Gerenciar Setores</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 my-2">
          <form onSubmit={handleSave} className="flex gap-2">
            <Input
              placeholder="Nome do setor..."
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              disabled={loading}
            />
            {editingId ? (
              <>
                <Button type="submit" disabled={loading || !nome.trim()} className="w-10 px-0">
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelEdit}
                  disabled={loading}
                  className="w-10 px-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button
                type="submit"
                disabled={loading || !nome.trim()}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Adicionar
              </Button>
            )}
          </form>

          <div className="border border-slate-700 rounded-md divide-y divide-slate-700 max-h-[300px] overflow-y-auto">
            {setores.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-300 bg-slate-900/40">
                Nenhum setor cadastrado.
              </div>
            ) : (
              setores.map((setor) => (
                <div
                  key={setor.id}
                  className="flex items-center justify-between p-3 bg-slate-900/80 hover:bg-slate-800 transition-colors"
                >
                  <span
                    className={`text-sm font-medium ${editingId === setor.id ? 'opacity-50 text-slate-400' : 'text-white'}`}
                  >
                    {setor.nome}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-300 hover:text-white hover:bg-slate-700"
                      onClick={() => startEdit(setor)}
                      disabled={loading || editingId !== null}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-300 hover:text-red-400 hover:bg-red-500/10"
                      onClick={() => handleDelete(setor.id)}
                      disabled={loading || editingId !== null}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

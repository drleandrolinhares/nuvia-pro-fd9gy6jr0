import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Trash2, Plus, Loader2 } from 'lucide-react'
import { Switch } from '@/components/ui/switch'

export function GerenciarOrigensDialog({ children, origens, onUpdate }: any) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newNome, setNewNome] = useState('')

  const handleAdd = async () => {
    if (!newNome.trim()) return
    setLoading(true)
    try {
      const { error } = await supabase
        .from('funil_origens')
        .insert([{ nome: newNome.trim(), ordem: origens.length + 1 }])
      if (error) throw error
      setNewNome('')
      onUpdate()
      toast.success('Origem adicionada com sucesso')
    } catch (e: any) {
      toast.error('Erro ao adicionar: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (id: string, ativo: boolean) => {
    try {
      const { error } = await supabase.from('funil_origens').update({ ativo }).eq('id', id)
      if (error) throw error
      onUpdate()
    } catch (e: any) {
      toast.error('Erro ao atualizar: ' + e.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        'Deseja realmente excluir esta origem? Todos os dados associados serão perdidos e não poderão ser recuperados.',
      )
    )
      return
    try {
      const { error } = await supabase.from('funil_origens').delete().eq('id', id)
      if (error) throw error
      onUpdate()
      toast.success('Origem excluída com sucesso')
    } catch (e: any) {
      toast.error('Erro ao excluir: ' + e.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>Configurações de Origens de Leads</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="flex gap-2">
            <Input
              value={newNome}
              onChange={(e) => setNewNome(e.target.value)}
              placeholder="Nova origem (ex: TikTok Ads)"
              className="bg-slate-950 border-slate-700 focus-visible:ring-amber-500"
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <Button
              onClick={handleAdd}
              disabled={loading || !newNome.trim()}
              className="bg-amber-500 text-slate-950 hover:bg-amber-600"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
            </Button>
          </div>

          <div className="space-y-2 mt-6 max-h-[60vh] overflow-y-auto pr-2">
            {origens.map((origem: any) => (
              <div
                key={origem.id}
                className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 transition-colors hover:bg-slate-800"
              >
                <span className="font-medium text-sm">{origem.nome}</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 w-10 text-right">
                      {origem.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                    <Switch
                      checked={origem.ativo}
                      onCheckedChange={(c) => handleToggle(origem.id, c)}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(origem.id)}
                    className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {origens.length === 0 && (
              <p className="text-center text-slate-500 py-4 text-sm">Nenhuma origem cadastrada.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

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
import { Trash2, Plus, Loader2, AlertCircle } from 'lucide-react'
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
      toast.success(ativo ? 'Origem ativada' : 'Origem inativada')
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
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-slate-800 bg-slate-900/50">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            Configuração de Origens
          </DialogTitle>
          <p className="text-sm text-slate-400 mt-1">Gerencie os canais de captação do seu funil</p>
        </DialogHeader>

        <div className="p-6 space-y-6">
          <div className="flex gap-2">
            <Input
              value={newNome}
              onChange={(e) => setNewNome(e.target.value)}
              placeholder="Nova origem (ex: TikTok Ads)"
              className="bg-slate-950 border-slate-700 focus-visible:ring-amber-500 font-medium text-white"
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <Button
              onClick={handleAdd}
              disabled={loading || !newNome.trim()}
              className="bg-amber-500 text-slate-950 hover:bg-amber-600 font-bold px-4"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
            </Button>
          </div>

          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
            {origens.length > 0 ? (
              origens.map((origem: any) => (
                <div
                  key={origem.id}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    origem.ativo
                      ? 'bg-slate-800/60 border-slate-700/50 hover:border-slate-600'
                      : 'bg-slate-950/50 border-slate-800/80 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex flex-col">
                    <span
                      className={`font-semibold ${origem.ativo ? 'text-white' : 'text-slate-400'}`}
                    >
                      {origem.nome}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mt-0.5">
                      {origem.ativo ? 'Monitorando' : 'Pausado'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <Switch
                      checked={origem.ativo}
                      onCheckedChange={(c) => handleToggle(origem.id, c)}
                      className="data-[state=checked]:bg-amber-500"
                    />
                    <div className="w-px h-6 bg-slate-700"></div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(origem.id)}
                      className="h-8 w-8 p-0 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      title="Excluir origem"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed gap-3">
                <AlertCircle className="w-8 h-8 text-slate-600" />
                <p className="text-sm">Nenhuma origem cadastrada.</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

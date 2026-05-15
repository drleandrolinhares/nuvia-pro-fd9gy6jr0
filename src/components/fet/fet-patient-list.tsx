import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Search, Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export function FETPatientList({
  status,
  selectedId,
  onSelect,
}: {
  status: string
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'
  const [patients, setPatients] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [newNome, setNewNome] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchPatients = async () => {
    const { data } = await supabase
      .from('fet_pacientes')
      .select('*')
      .eq('status', status)
      .order('nome')
    if (data) setPatients(data.sort((a, b) => a.nome.localeCompare(b.nome)))
  }

  useEffect(() => {
    fetchPatients()

    const channel = supabase
      .channel(`fet_pacientes_changes_${status}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fet_pacientes' }, () => {
        fetchPatients()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [status])

  const handleEditStart = (p: any, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingId(p.id)
    setEditName(p.nome)
  }

  const handleEditSave = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!editName.trim()) return

    const { error } = await supabase.from('fet_pacientes').update({ nome: editName }).eq('id', id)
    if (error) {
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' })
    } else {
      setPatients(
        patients
          .map((p) => (p.id === id ? { ...p, nome: editName } : p))
          .sort((a, b) => a.nome.localeCompare(b.nome)),
      )
      setEditingId(null)

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('usuarios')
          .select('id')
          .eq('id', user.id)
          .single()
        if (profile) {
          await supabase.from('fet_historico').insert({
            paciente_id: id,
            usuario_id: profile.id,
            acao: 'Edição de Paciente',
            detalhes: `Nome alterado para ${editName}`,
          })
        }
      }
    }
  }

  const handleEditCancel = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingId(null)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingId) return
    const { error } = await supabase.from('fet_pacientes').delete().eq('id', deletingId)
    if (error) {
      toast({ title: 'Erro ao remover', description: error.message, variant: 'destructive' })
    } else {
      setPatients(patients.filter((p) => p.id !== deletingId))
      if (selectedId === deletingId) onSelect('')
    }
    setDeletingId(null)
  }

  const handleAdd = async () => {
    if (!newNome.trim()) return
    const { data, error } = await supabase
      .from('fet_pacientes')
      .insert([{ nome: newNome, status: 'ativo' }])
      .select()
    if (error) {
      toast({ title: 'Erro ao criar paciente', description: error.message, variant: 'destructive' })
    } else if (data) {
      if (status === 'ativo') {
        setPatients([...patients, data[0]].sort((a, b) => a.nome.localeCompare(b.nome)))
      }
      setNewNome('')
      onSelect(data[0].id)

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('usuarios')
          .select('id')
          .eq('id', user.id)
          .single()
        if (profile) {
          await supabase.from('fet_historico').insert({
            paciente_id: data[0].id,
            usuario_id: profile.id,
            acao: 'Criação de Ficha',
            detalhes: `Ficha criada para o paciente ${newNome}`,
          })
        }
      }
    }
  }

  const filtered = patients.filter((p) => p.nome.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-slate-800 bg-slate-950/50 space-y-3">
        <h2 className="text-lg font-bold text-white">
          {status === 'ativo' ? 'Tratamentos Ativos' : 'Tratamentos Finalizados'}
        </h2>
        {status === 'ativo' && (
          <div className="flex gap-2">
            <Input
              placeholder="Novo paciente..."
              value={newNome}
              onChange={(e) => setNewNome(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="h-9 bg-slate-900 border-slate-800 text-white focus-visible:ring-amber-500 text-sm"
            />
            <Button
              onClick={handleAdd}
              size="icon"
              className="h-9 w-9 bg-amber-500 hover:bg-amber-600 text-slate-950 shrink-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        )}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <Input
            placeholder="Buscar paciente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-9 bg-slate-900 border-slate-800 text-white focus-visible:ring-amber-500 text-sm"
          />
        </div>
      </div>
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
          {filtered.map((p) => (
            <div key={p.id} className="relative group/patient flex items-center">
              {editingId === p.id ? (
                <div className="flex w-full items-center gap-1.5 px-2 py-1.5 bg-slate-800 rounded-lg border border-slate-700">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleEditSave(p.id)
                      if (e.key === 'Escape') handleEditCancel(e as any)
                    }}
                    autoFocus
                    className="h-7 text-sm font-bold bg-slate-950 border-slate-700 text-white focus-visible:ring-amber-500 px-2"
                  />
                  <div className="flex shrink-0 gap-0.5">
                    <button
                      onClick={(e) => handleEditSave(p.id, e)}
                      className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/20 rounded-md transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleEditCancel}
                      className="p-1.5 text-slate-400 hover:text-slate-300 hover:bg-slate-700 rounded-md transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => onSelect(p.id)}
                  className={cn(
                    'w-full text-left px-3 py-2.5 text-sm rounded-lg transition-all border border-transparent pr-16',
                    selectedId === p.id
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:border-slate-700',
                  )}
                >
                  <span className="truncate block font-bold">{p.nome}</span>
                </button>
              )}

              {isAdmin && editingId !== p.id && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover/patient:opacity-100 transition-opacity bg-slate-900/80 backdrop-blur-sm p-1 rounded-md">
                  <button
                    onClick={(e) => handleEditStart(p, e)}
                    className="p-1 text-slate-400 hover:text-amber-500 hover:bg-amber-500/20 rounded transition-colors"
                    title="Editar"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeletingId(p.id)
                    }}
                    className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-500/20 rounded transition-colors"
                    title="Remover"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center p-4 text-slate-500 text-sm font-medium">
              Nenhum paciente encontrado.
            </div>
          )}
        </div>
      </ScrollArea>

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Paciente?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Tem certeza que deseja excluir este paciente e toda a sua ficha de evolução? Esta ação
              não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 text-white hover:bg-slate-700 border-slate-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

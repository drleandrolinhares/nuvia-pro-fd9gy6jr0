import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Plus, Edit, Trash2, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

export default function DentistasProTab() {
  const [dentistas, setDentistas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)

  const [nome, setNome] = useState('')
  const [status, setStatus] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('pro_agenda_dentistas').select('*').order('nome')
    if (error) {
      toast.error('Erro ao buscar dentistas: ' + error.message)
    } else {
      setDentistas(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleOpen = (dentista: any = null) => {
    if (dentista) {
      setEditing(dentista)
      setNome(dentista.nome)
      setStatus(dentista.status === 'ativo')
    } else {
      setEditing(null)
      setNome('')
      setStatus(true)
    }
    setOpen(true)
  }

  const handleSave = async () => {
    if (!nome.trim()) {
      toast.error('Nome é obrigatório')
      return
    }

    setSaving(true)
    try {
      const payload = {
        nome,
        status: status ? 'ativo' : 'inativo',
        atualizado_em: new Date().toISOString(),
      }

      if (editing) {
        const { error } = await supabase
          .from('pro_agenda_dentistas')
          .update(payload)
          .eq('id', editing.id)
        if (error) throw error
        toast.success('Dentista atualizado com sucesso!')
      } else {
        const { error } = await supabase.from('pro_agenda_dentistas').insert(payload)
        if (error) throw error
        toast.success('Dentista criado com sucesso!')
      }
      setOpen(false)
      fetchData()
    } catch (error: any) {
      toast.error('Erro ao salvar: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        'Deseja realmente excluir este dentista? Todas as configurações de tempo dele no Pro Agenda serão apagadas.',
      )
    )
      return

    try {
      const { error } = await supabase.from('pro_agenda_dentistas').delete().eq('id', id)
      if (error) throw error
      toast.success('Dentista excluído!')
      fetchData()
    } catch (error: any) {
      toast.error('Erro ao excluir: ' + error.message)
    }
  }

  return (
    <Card className="border-0 rounded-none shadow-none bg-transparent">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 pt-6">
        <div>
          <CardTitle className="text-xl font-bold">Dentistas Pro Agenda</CardTitle>
          <CardDescription className="mt-1">
            Gerencie os dentistas e especialistas que aparecerão na aba Pro Agenda.
          </CardDescription>
        </div>
        <Button
          onClick={() => handleOpen()}
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-md w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Dentista
        </Button>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-4">
        {loading ? (
          <div className="flex justify-center p-8 bg-muted/30 rounded-lg border border-border">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : dentistas.length === 0 ? (
          <div className="text-center p-12 bg-muted/30 rounded-lg border border-border text-muted-foreground">
            Nenhum dentista cadastrado no Pro Agenda.
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden bg-background shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="p-4 text-left font-semibold text-muted-foreground">
                    Nome do Dentista
                  </th>
                  <th className="p-4 text-left font-semibold text-muted-foreground w-32">Status</th>
                  <th className="p-4 text-right font-semibold text-muted-foreground w-32">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {dentistas.map((d) => (
                  <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 text-foreground font-medium">{d.nome}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${d.status === 'ativo' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20'}`}
                      >
                        {d.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpen(d)}
                          className="text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10 h-8 w-8"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(d.id)}
                          className="text-muted-foreground hover:text-red-600 hover:bg-red-500/10 h-8 w-8"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Dentista' : 'Novo Dentista'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label>Nome do Dentista</Label>
              <Input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Dr. João Silva"
                className="focus-visible:ring-amber-500"
              />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
              <div className="space-y-1">
                <Label className="font-semibold">Status do Dentista</Label>
                <div className="text-xs text-muted-foreground">
                  Define se ele aparecerá no filtro do Pro Agenda
                </div>
              </div>
              <Switch checked={status} onCheckedChange={setStatus} />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={saving}
              className="rounded-full"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-full"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {saving ? 'Salvando...' : 'Salvar Dentista'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

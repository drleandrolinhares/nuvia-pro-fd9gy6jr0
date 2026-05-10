import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { PacienteDashboard } from './components/paciente/PacienteDashboard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/components/ui/use-toast'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Search, Users, Pencil, Trash, Loader2 } from 'lucide-react'

function formatarDataLocal(dataStr: string | null) {
  if (!dataStr) return '-'
  const str = dataStr.substring(0, 10)
  const partes = str.split('-')
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }
  return str
}

export default function Pacientes() {
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id')

  if (id) {
    return <PacienteDashboard id={id} />
  }

  return <PacientesList />
}

function PacientesList() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { toast } = useToast()
  const isAdmin = profile?.role === 'admin'

  const [pacientes, setPacientes] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const PAGE_SIZE = 50

  const [editingPatient, setEditingPatient] = useState<any>(null)
  const [deletingPatient, setDeletingPatient] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({ nome: '', telefone: '', email: '' })

  const observer = useRef<IntersectionObserver | null>(null)

  const lastElementRef = useCallback(
    (node: HTMLTableRowElement | null) => {
      if (loading) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1)
        }
      })
      if (node) observer.current.observe(node)
    },
    [loading, hasMore],
  )

  const fetchPacientes = async (
    currentPage: number,
    currentSearch: string,
    isNewSearch: boolean,
  ) => {
    try {
      setLoading(true)
      let q = supabase.from('pacientes').select('*', { count: 'exact' }).order('nome')
      if (currentSearch) q = q.ilike('nome', `%${currentSearch}%`)

      const from = currentPage * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      const { data, count, error } = await q.range(from, to)

      if (error) throw error

      if (data) {
        if (isNewSearch) {
          setPacientes(data)
        } else {
          setPacientes((prev) => {
            const newPacientes = [...prev]
            data.forEach((d) => {
              if (!newPacientes.find((p) => p.id === d.id)) {
                newPacientes.push(d)
              }
            })
            return newPacientes
          })
        }

        if (count !== null) {
          setHasMore((currentPage + 1) * PAGE_SIZE < count)
        } else {
          setHasMore(data.length === PAGE_SIZE)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Effect for search changes
  useEffect(() => {
    setPage(0)
    setHasMore(true)
    const t = setTimeout(() => {
      fetchPacientes(0, search, true)
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  // Effect for pagination
  useEffect(() => {
    if (page > 0) {
      fetchPacientes(page, search, false)
    }
  }, [page])

  const handleEditClick = (e: React.MouseEvent, paciente: any) => {
    e.stopPropagation()
    setEditingPatient(paciente)
    setEditForm({
      nome: paciente.nome || '',
      telefone: paciente.telefone || '',
      email: paciente.email || '',
    })
  }

  const handleSaveEdit = async () => {
    if (!editingPatient) return
    setSaving(true)
    const { error } = await supabase
      .from('pacientes')
      .update({
        nome: editForm.nome,
        telefone: editForm.telefone,
        email: editForm.email,
      })
      .eq('id', editingPatient.id)

    setSaving(false)
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
      return
    }

    toast({ title: 'Sucesso', description: 'Paciente atualizado com sucesso.' })
    setPacientes((prev) =>
      prev.map((p) => (p.id === editingPatient.id ? { ...p, ...editForm } : p)),
    )
    setEditingPatient(null)
  }

  const handleDeleteClick = (e: React.MouseEvent, paciente: any) => {
    e.stopPropagation()
    setDeletingPatient(paciente)
  }

  const handleConfirmDelete = async () => {
    if (!deletingPatient) return
    setSaving(true)
    const { error } = await supabase.from('pacientes').delete().eq('id', deletingPatient.id)

    setSaving(false)
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
      return
    }

    toast({ title: 'Sucesso', description: 'Paciente removido.' })
    setPacientes((prev) => prev.filter((p) => p.id !== deletingPatient.id))
    setDeletingPatient(null)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-slate-900 p-6 rounded-xl border-l-4 border-amber-500 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-800 rounded-lg">
            <Users className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white uppercase">Pacientes</h1>
            <p className="text-slate-400 mt-1 text-sm uppercase tracking-wider font-medium">
              Gestão de Pacientes da Clínica
            </p>
          </div>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Buscar Paciente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 max-w-sm">
            <Input
              placeholder="Nome do paciente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button
              variant="outline"
              size="icon"
              className="bg-slate-200 text-slate-700 hover:bg-amber-500 hover:text-white transition-all shadow-sm border-transparent"
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Data Cadastro</TableHead>
                  {isAdmin && <TableHead className="w-[100px] text-right">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {pacientes.length === 0 && !loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={isAdmin ? 5 : 4}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Nenhum paciente encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  pacientes.map((p, index) => {
                    const isLast = index === pacientes.length - 1
                    return (
                      <TableRow
                        key={p.id}
                        ref={isLast ? lastElementRef : null}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/comercial/pacientes?id=${p.id}`)}
                      >
                        <TableCell className="font-medium">{p.nome}</TableCell>
                        <TableCell>{p.telefone || '-'}</TableCell>
                        <TableCell>{p.email || '-'}</TableCell>
                        <TableCell>{formatarDataLocal(p.data_cadastro)}</TableCell>
                        {isAdmin && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-100/50"
                                onClick={(e) => handleEditClick(e, p)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-100/50"
                                onClick={(e) => handleDeleteClick(e, p)}
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    )
                  })
                )}
                {loading && (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 5 : 4} className="text-center py-8">
                      <div className="flex justify-center items-center gap-2 text-muted-foreground">
                        <span className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></span>
                        Carregando...
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editingPatient} onOpenChange={(open) => !open && setEditingPatient(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Paciente</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nome</Label>
              <Input
                value={editForm.nome}
                onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Telefone</Label>
              <Input
                value={editForm.telefone}
                onChange={(e) => setEditForm({ ...editForm, telefone: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPatient(null)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingPatient} onOpenChange={(open) => !open && setDeletingPatient(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover Paciente</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-slate-600">
            Tem certeza que deseja remover o paciente <strong>{deletingPatient?.nome}</strong>? Esta
            ação não poderá ser desfeita.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingPatient(null)} disabled={saving}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

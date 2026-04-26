import { useState, useEffect } from 'react'
import { Plus, Trash2, Calendar as CalendarIcon, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { format } from 'date-fns'

type Ausencia = {
  id: string
  data: string
  descricao: string
  tipo: string
  usuario_id: string | null
  usuarios?: { nome: string } | null
}

export default function FeriadosAusencias() {
  const [ausencias, setAusencias] = useState<Ausencia[]>([])
  const [usuarios, setUsuarios] = useState<{ id: string; nome: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [data, setData] = useState('')
  const [descricao, setDescricao] = useState('')
  const [tipo, setTipo] = useState('feriado')
  const [usuarioId, setUsuarioId] = useState('todos')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: users } = await supabase
        .from('usuarios')
        .select('id, nome')
        .eq('status', 'ativo')
        .order('nome')
      if (users) setUsuarios(users)

      const { data: aus, error } = await supabase
        .from('ausencias')
        .select('*, usuarios(nome)')
        .order('data', { ascending: false })

      if (error) throw error
      setAusencias(aus || [])
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar ausências')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!data || !descricao) {
      toast.error('Preencha a data e a descrição')
      return
    }

    setSaving(true)
    try {
      const payload = {
        data,
        descricao,
        tipo,
        usuario_id: usuarioId === 'todos' ? null : usuarioId,
      }

      const { error } = await supabase.from('ausencias').insert(payload)
      if (error) throw error

      toast.success('Registro adicionado com sucesso')
      setData('')
      setDescricao('')
      setTipo('feriado')
      setUsuarioId('todos')
      fetchData()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('ausencias').delete().eq('id', id)
      if (error) throw error
      toast.success('Removido com sucesso')
      fetchData()
    } catch (error: any) {
      toast.error('Erro ao remover')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="bg-slate-900 border-l-4 border-primary p-4 sm:p-6 rounded-lg shadow-sm mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight uppercase">
          Feriados e Ausências
        </h1>
        <p className="text-slate-400 uppercase text-sm sm:text-base font-medium tracking-wider mt-1">
          Gerencie datas em que as rotinas não devem ser cobradas
        </p>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle>Adicionar Exceção</CardTitle>
          <CardDescription>
            Registre um feriado geral ou a ausência de um colaborador específico.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="space-y-2">
              <Label>Data</Label>
              <Input type="date" value={data} onChange={(e) => setData(e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Descrição / Motivo</Label>
              <Input
                placeholder="Ex: Feriado Nacional, Atestado Médico..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="feriado">Feriado / Recesso</SelectItem>
                  <SelectItem value="ausencia">Ausência / Atestado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Aplicar a</Label>
              <Select value={usuarioId} onValueChange={setUsuarioId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos (Geral)</SelectItem>
                  {usuarios.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleAdd} disabled={saving} className="w-full md:w-auto">
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Adicionar Registro
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle>Histórico de Exceções</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : ausencias.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
              Nenhum registro encontrado.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Alvo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ausencias.map((a) => {
                    const dt = new Date(a.data + 'T12:00:00')
                    return (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">{format(dt, 'dd/MM/yyyy')}</TableCell>
                        <TableCell>{a.descricao}</TableCell>
                        <TableCell className="capitalize">{a.tipo}</TableCell>
                        <TableCell>
                          {a.usuario_id ? (
                            <span className="text-blue-600 dark:text-blue-400 font-medium">
                              👤{' '}
                              {Array.isArray(a.usuarios) ? a.usuarios[0]?.nome : a.usuarios?.nome}
                            </span>
                          ) : (
                            <span className="text-amber-600 dark:text-amber-400 font-bold">
                              🌎 Todos
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(a.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

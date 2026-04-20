import { useState, useEffect, useMemo, useRef } from 'react'
import { Plus, Trash2, Edit2, Copy, Save, Info, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'

type Task = {
  id: string
  descricao_tarefa: string
  horario_inicio: string
  horario_fim: string | null
  peso_percentual: number
  numero_sequencia: number
}

type User = {
  id: string
  nome: string
  role: string | null
}

export default function ConfiguracaoRotinas() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [targetDuplicateUser, setTargetDuplicateUser] = useState<string>('')
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false)

  // Form state
  const [editId, setEditId] = useState<string | null>(null)
  const [descricao, setDescricao] = useState('')
  const [horarioInicio, setHorarioInicio] = useState('')
  const [horarioFim, setHorarioFim] = useState('')
  const [peso, setPeso] = useState<number>(5)
  const [numeroSequencia, setNumeroSequencia] = useState<number>(1)

  const [currentTasks, setCurrentTasks] = useState<Task[]>([])
  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!editId) {
      setNumeroSequencia(currentTasks.length + 1)
    }
  }, [currentTasks, editId])
  const [loadingTasks, setLoadingTasks] = useState(false)
  const [savingTask, setSavingTask] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    if (selectedUser) {
      loadRoutine(selectedUser)
      resetForm()
    } else {
      setCurrentTasks([])
    }
  }, [selectedUser])

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('usuarios').select('id, nome, role').order('nome')

    if (error) {
      toast({
        title: 'Erro ao carregar usuários',
        description: error.message,
        variant: 'destructive',
      })
      return
    }

    const filtered = data.filter((u) => {
      const role = u.role?.toLowerCase() || ''
      return !role.includes('ceo') && !role.includes('socia')
    })

    setUsers(filtered)
  }

  const loadRoutine = async (userId: string) => {
    setLoadingTasks(true)
    try {
      const { data: routine } = await supabase
        .from('rotinas_usuarios')
        .select('id')
        .eq('usuario_id', userId)
        .maybeSingle()

      if (routine) {
        const { data: tasks } = await supabase
          .from('tarefas_rotina')
          .select('*')
          .eq('rotina_id', routine.id)
          .order('numero_sequencia', { ascending: true })

        setCurrentTasks(tasks || [])
      } else {
        setCurrentTasks([])
      }
    } finally {
      setLoadingTasks(false)
    }
  }

  const totalWeight = useMemo(() => {
    return currentTasks.reduce((sum, task) => sum + Number(task.peso_percentual), 0)
  }, [currentTasks])

  const resetForm = () => {
    setEditId(null)
    setDescricao('')
    setHorarioInicio('')
    setHorarioFim('')
    setPeso(5)
    setNumeroSequencia(currentTasks.length + 1)
  }

  const handleAddOrUpdateTask = async () => {
    if (!descricao || !horarioInicio || peso <= 0) {
      toast({
        title: 'Campos inválidos',
        description: 'Preencha os campos obrigatórios corretamente.',
        variant: 'destructive',
      })
      return
    }

    setSavingTask(true)
    try {
      let routineId = null
      const { data: routine } = await supabase
        .from('rotinas_usuarios')
        .select('id')
        .eq('usuario_id', selectedUser)
        .maybeSingle()

      if (!routine) {
        const { data: newRoutine } = await supabase
          .from('rotinas_usuarios')
          .insert({ usuario_id: selectedUser, ativa: true })
          .select('id')
          .single()
        if (newRoutine) routineId = newRoutine.id
      } else {
        routineId = routine.id
      }

      if (!routineId) throw new Error('Não foi possível criar rotina')

      const taskData = {
        rotina_id: routineId,
        descricao_tarefa: descricao,
        horario_inicio: horarioInicio,
        horario_fim: horarioFim || null,
        peso_percentual: peso,
        numero_sequencia: numeroSequencia,
        ativa: true,
      }

      if (editId) {
        const { error } = await supabase.from('tarefas_rotina').update(taskData).eq('id', editId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('tarefas_rotina').insert(taskData)
        if (error) throw error
      }

      await loadRoutine(selectedUser)
      resetForm()
      toast({ description: 'Tarefa salva com sucesso!' })
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } finally {
      setSavingTask(false)
    }
  }

  const handleEditTask = (task: Task) => {
    setEditId(task.id)
    setDescricao(task.descricao_tarefa)
    setHorarioInicio(task.horario_inicio.substring(0, 5))
    setHorarioFim(task.horario_fim ? task.horario_fim.substring(0, 5) : '')
    setPeso(Number(task.peso_percentual))
    setNumeroSequencia(task.numero_sequencia)

    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      document.getElementById('input-descricao')?.focus()
    }, 100)
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase.from('tarefas_rotina').delete().eq('id', taskId)
      if (error) throw error
      await loadRoutine(selectedUser)
      toast({ description: 'Tarefa excluída com sucesso!' })
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    }
  }

  const handleSaveRoutine = () => {
    if (totalWeight !== 100) {
      toast({
        title: 'Validação Falhou',
        description: `A soma dos pesos deve ser exatamente 100%. Atualmente está em ${totalWeight}%.`,
        variant: 'destructive',
      })
      return
    }

    toast({
      title: 'Rotina Salva',
      description: 'A configuração de rotina foi salva e validada com sucesso!',
    })
  }

  const handleDuplicate = async () => {
    if (!targetDuplicateUser) {
      toast({
        title: 'Selecione um destino',
        description: 'Você precisa escolher para qual usuário deseja copiar a rotina.',
        variant: 'destructive',
      })
      return
    }

    try {
      let { data: targetRoutine } = await supabase
        .from('rotinas_usuarios')
        .select('id')
        .eq('usuario_id', targetDuplicateUser)
        .maybeSingle()

      if (!targetRoutine) {
        const { data: newRoutine, error } = await supabase
          .from('rotinas_usuarios')
          .insert({ usuario_id: targetDuplicateUser, ativa: true })
          .select('id')
          .single()
        if (error) throw error
        targetRoutine = newRoutine
      }

      if (!targetRoutine) throw new Error('Erro ao encontrar rotina de destino')

      await supabase.from('tarefas_rotina').delete().eq('rotina_id', targetRoutine.id)

      const tasksToInsert = currentTasks.map((t) => ({
        rotina_id: targetRoutine!.id,
        descricao_tarefa: t.descricao_tarefa,
        horario_inicio: t.horario_inicio,
        horario_fim: t.horario_fim,
        peso_percentual: Number(t.peso_percentual),
        numero_sequencia: t.numero_sequencia,
        ativa: true,
      }))

      if (tasksToInsert.length > 0) {
        const { error } = await supabase.from('tarefas_rotina').insert(tasksToInsert)
        if (error) throw error
      }

      setIsDuplicateDialogOpen(false)
      setTargetDuplicateUser('')
      toast({
        title: 'Rotina Duplicada',
        description: 'A rotina foi copiada com sucesso para o usuário selecionado.',
      })
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground uppercase">
          Configuração de Rotinas
        </h1>
        <p className="text-muted-foreground uppercase text-sm font-medium tracking-wider mt-1">
          Gerenciamento de tarefas diárias por colaborador
        </p>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="uppercase tracking-wider">Selecionar Colaborador</CardTitle>
              <CardDescription>
                Escolha o usuário para visualizar ou editar sua rotina diária.
              </CardDescription>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className="w-full sm:w-[300px]">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedUser && currentTasks.length > 0 && (
                <Dialog open={isDuplicateDialogOpen} onOpenChange={setIsDuplicateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="shrink-0">
                      <Copy className="size-4 mr-2" />
                      Duplicar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Duplicar Rotina</DialogTitle>
                      <DialogDescription>
                        Copie a rotina atual para outro colaborador. As tarefas existentes do
                        destino serão sobrescritas.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Label className="mb-2 block">Selecione o colaborador destino:</Label>
                      <Select value={targetDuplicateUser} onValueChange={setTargetDuplicateUser}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o destino..." />
                        </SelectTrigger>
                        <SelectContent>
                          {users
                            .filter((u) => u.id !== selectedUser)
                            .map((u) => (
                              <SelectItem key={u.id} value={u.id}>
                                {u.nome}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDuplicateDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleDuplicate}>Confirmar Duplicação</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {selectedUser && (
        <div className="space-y-6 animate-fade-in">
          <Card ref={formRef} className="border-border/50 shadow-sm transition-all duration-300">
            <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
              <CardTitle className="text-lg uppercase tracking-wider flex items-center gap-2">
                {editId ? (
                  <Edit2 className="size-5 text-primary" />
                ) : (
                  <Plus className="size-5 text-primary" />
                )}
                {editId ? 'Editar Tarefa' : 'Adicionar Nova Tarefa'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-1 space-y-2">
                  <Label>Ordem</Label>
                  <Input
                    type="number"
                    min="1"
                    value={numeroSequencia}
                    onChange={(e) => setNumeroSequencia(Number(e.target.value))}
                  />
                </div>
                <div className="md:col-span-4 space-y-2">
                  <Label>Descrição da Tarefa</Label>
                  <Input
                    id="input-descricao"
                    placeholder="Ex: Conferência de estoque"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Início (HH:MM)</Label>
                  <Input
                    type="time"
                    value={horarioInicio}
                    onChange={(e) => setHorarioInicio(e.target.value)}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Fim (HH:MM) - Opcional</Label>
                  <Input
                    type="time"
                    value={horarioFim}
                    onChange={(e) => setHorarioFim(e.target.value)}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Peso (%)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={peso}
                    onChange={(e) => setPeso(Number(e.target.value))}
                  />
                </div>
                <div className="md:col-span-1 flex gap-2">
                  <Button onClick={handleAddOrUpdateTask} disabled={savingTask} className="w-full">
                    {savingTask ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : editId ? (
                      <Save className="size-4" />
                    ) : (
                      <Plus className="size-4" />
                    )}
                  </Button>
                  {editId && (
                    <Button
                      variant="outline"
                      onClick={resetForm}
                      disabled={savingTask}
                      className="w-full px-0"
                    >
                      X
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="uppercase tracking-wider flex justify-between items-center">
                <span>Checklist do Colaborador</span>
                <Badge
                  variant={totalWeight === 100 ? 'default' : 'destructive'}
                  className="text-sm px-3 py-1"
                >
                  Peso Total: {totalWeight}%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingTasks ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-center">
                  <Loader2 className="size-8 animate-spin mb-4" />
                  <p className="text-sm font-medium">Carregando tarefas...</p>
                </div>
              ) : currentTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-center">
                  <Info className="size-12 mb-3 opacity-20" />
                  <p className="text-lg font-medium">Nenhuma tarefa configurada</p>
                  <p className="text-sm">Adicione tarefas acima para montar a rotina.</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Seq.</TableHead>
                        <TableHead>Descrição da Tarefa</TableHead>
                        <TableHead>Horário</TableHead>
                        <TableHead className="text-right">Peso</TableHead>
                        <TableHead className="text-right w-[120px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentTasks
                        .sort((a, b) => a.numero_sequencia - b.numero_sequencia)
                        .map((task, idx) => (
                          <TableRow key={task.id}>
                            <TableCell className="font-medium">{task.numero_sequencia}</TableCell>
                            <TableCell>{task.descricao_tarefa}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-mono">
                                {task.horario_inicio.substring(0, 5)}
                                {task.horario_fim ? ` - ${task.horario_fim.substring(0, 5)}` : ''}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {task.peso_percentual}%
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10"
                                  onClick={() => handleEditTask(task)}
                                >
                                  <Edit2 className="size-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => handleDeleteTask(task.id)}
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold uppercase tracking-wider"
                  onClick={handleSaveRoutine}
                  disabled={currentTasks.length === 0 || loadingTasks}
                >
                  <Save className="size-4 mr-2" />
                  Salvar Rotina
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

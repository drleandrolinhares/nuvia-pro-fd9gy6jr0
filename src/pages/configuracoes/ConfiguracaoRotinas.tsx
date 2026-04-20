import { useState, useEffect, useMemo, useRef } from 'react'
import { Plus, Trash2, Edit2, Copy, Save, Info, Loader2, CheckCircle2 } from 'lucide-react'
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
  horario_inicio: string | null
  horario_fim: string | null
  peso_percentual: number
  numero_sequencia: number
  periodicidade?: 'diaria' | 'semanal' | 'quinzenal' | 'mensal'
  dias_semana?: number[] | null
  dia_mes?: number | null
  data_inicio_contagem?: string | null
}

type User = {
  id: string
  nome: string
  role: string | null
  hasRoutine?: boolean
}

const timeToMinutes = (time: string | null) => {
  if (!time) return 0
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
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
  const [periodicidade, setPeriodicidade] = useState<'diaria' | 'semanal' | 'quinzenal' | 'mensal'>(
    'diaria',
  )
  const [diasSemana, setDiasSemana] = useState<number[]>([])
  const [diaMes, setDiaMes] = useState<number>(1)
  const [dataInicioContagem, setDataInicioContagem] = useState<string>('')

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

    const { data: rotinasData } = await supabase
      .from('rotinas_usuarios')
      .select('usuario_id, tarefas_rotina(id)')

    const usersWithRoutine = new Set(
      rotinasData
        ?.filter(
          (r: any) =>
            r.tarefas_rotina && Array.isArray(r.tarefas_rotina) && r.tarefas_rotina.length > 0,
        )
        .map((r) => r.usuario_id),
    )

    const filtered = data
      .filter((u) => {
        const role = u.role?.toLowerCase() || ''
        return !role.includes('ceo') && !role.includes('socia')
      })
      .map((u) => ({
        ...u,
        hasRoutine: usersWithRoutine.has(u.id),
      }))

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
    setPeriodicidade('diaria')
    setDiasSemana([])
    setDiaMes(1)
    setDataInicioContagem('')
  }

  const handleAddOrUpdateTask = async () => {
    if (!descricao || peso <= 0) {
      toast({
        title: 'Campos inválidos',
        description: 'Preencha os campos obrigatórios corretamente.',
        variant: 'destructive',
      })
      return
    }

    if (periodicidade === 'semanal' && diasSemana.length === 0) {
      toast({
        title: 'Erro',
        description: 'Selecione pelo menos um dia da semana.',
        variant: 'destructive',
      })
      return
    }
    if (periodicidade === 'quinzenal' && !dataInicioContagem) {
      toast({
        title: 'Erro',
        description: 'Selecione a data de início para a contagem quinzenal.',
        variant: 'destructive',
      })
      return
    }
    if (periodicidade === 'mensal' && (diaMes < 1 || diaMes > 31)) {
      toast({ title: 'Erro', description: 'Dia do mês inválido.', variant: 'destructive' })
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

      const taskData: any = {
        rotina_id: routineId,
        descricao_tarefa: descricao,
        horario_inicio: horarioInicio || null,
        horario_fim: horarioFim || null,
        peso_percentual: peso,
        numero_sequencia: numeroSequencia,
        periodicidade,
        dias_semana: periodicidade === 'semanal' ? diasSemana : null,
        dia_mes: periodicidade === 'mensal' ? diaMes : null,
        data_inicio_contagem: periodicidade === 'quinzenal' ? dataInicioContagem : null,
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
      await fetchUsers()
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
    setHorarioInicio(task.horario_inicio ? task.horario_inicio.substring(0, 5) : '')
    setHorarioFim(task.horario_fim ? task.horario_fim.substring(0, 5) : '')
    setPeso(Number(task.peso_percentual))
    setNumeroSequencia(task.numero_sequencia)
    setPeriodicidade(task.periodicidade || 'diaria')
    setDiasSemana(task.dias_semana || [])
    setDiaMes(task.dia_mes || 1)
    setDataInicioContagem(task.data_inicio_contagem || '')

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
      await fetchUsers()
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

      const tasksToInsert: any = currentTasks.map((t) => ({
        rotina_id: targetRoutine!.id,
        descricao_tarefa: t.descricao_tarefa,
        horario_inicio: t.horario_inicio,
        horario_fim: t.horario_fim,
        peso_percentual: Number(t.peso_percentual),
        numero_sequencia: t.numero_sequencia,
        periodicidade: t.periodicidade || 'diaria',
        dias_semana: t.dias_semana,
        dia_mes: t.dia_mes,
        data_inicio_contagem: t.data_inicio_contagem,
        ativa: true,
      }))

      if (tasksToInsert.length > 0) {
        const { error } = await supabase.from('tarefas_rotina').insert(tasksToInsert)
        if (error) throw error
      }

      await fetchUsers()
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
                      <div className="flex items-center gap-2">
                        <span>{u.nome}</span>
                        {u.hasRoutine && (
                          <span className="flex items-center text-emerald-600 text-xs font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                            <CheckCircle2 className="size-3 mr-1" />
                            Configurado
                          </span>
                        )}
                      </div>
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
                                <div className="flex items-center gap-2">
                                  <span>{u.nome}</span>
                                  {u.hasRoutine && (
                                    <span className="flex items-center text-amber-600 text-xs font-medium bg-amber-500/10 px-1.5 py-0.5 rounded-full">
                                      <CheckCircle2 className="size-3 mr-1" />
                                      Substituir
                                    </span>
                                  )}
                                </div>
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
            <CardContent className="pt-6 space-y-4">
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
                  <Label>Início (HH:MM) - Opcional</Label>
                  <Input
                    type="time"
                    value={horarioInicio}
                    onChange={(e) => setHorarioInicio(e.target.value)}
                  />
                </div>
                <div className="md:col-span-3 space-y-2">
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-3 space-y-2">
                  <Label>Periodicidade</Label>
                  <Select value={periodicidade} onValueChange={(v: any) => setPeriodicidade(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diaria">Diária</SelectItem>
                      <SelectItem value="semanal">Semanal</SelectItem>
                      <SelectItem value="quinzenal">Quinzenal</SelectItem>
                      <SelectItem value="mensal">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {periodicidade === 'semanal' && (
                  <div className="md:col-span-6 space-y-2">
                    <Label>Dias da Semana</Label>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        { label: 'Dom', val: 0 },
                        { label: 'Seg', val: 1 },
                        { label: 'Ter', val: 2 },
                        { label: 'Qua', val: 3 },
                        { label: 'Qui', val: 4 },
                        { label: 'Sex', val: 5 },
                        { label: 'Sáb', val: 6 },
                      ].map((d) => (
                        <Badge
                          key={d.val}
                          variant={diasSemana.includes(d.val) ? 'default' : 'outline'}
                          className="cursor-pointer px-3 py-1 hover:opacity-80 transition-opacity"
                          onClick={() => {
                            if (diasSemana.includes(d.val)) {
                              setDiasSemana(diasSemana.filter((x) => x !== d.val))
                            } else {
                              setDiasSemana([...diasSemana, d.val])
                            }
                          }}
                        >
                          {d.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {periodicidade === 'quinzenal' && (
                  <div className="md:col-span-3 space-y-2">
                    <Label>A partir de</Label>
                    <Input
                      type="date"
                      value={dataInicioContagem}
                      onChange={(e) => setDataInicioContagem(e.target.value)}
                    />
                  </div>
                )}

                {periodicidade === 'mensal' && (
                  <div className="md:col-span-2 space-y-2">
                    <Label>Dia do Mês (1-31)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="31"
                      value={diaMes}
                      onChange={(e) => setDiaMes(Number(e.target.value))}
                    />
                  </div>
                )}

                <div
                  className={`md:col-span-3 ${periodicidade === 'semanal' ? 'md:col-start-10' : periodicidade === 'quinzenal' ? 'md:col-start-10' : periodicidade === 'mensal' ? 'md:col-start-10' : 'md:col-start-10'} flex gap-2 w-full justify-end`}
                >
                  <Button onClick={handleAddOrUpdateTask} disabled={savingTask} className="w-full">
                    {savingTask ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : editId ? (
                      <Save className="size-4 mr-2" />
                    ) : (
                      <Plus className="size-4 mr-2" />
                    )}
                    {editId ? 'Salvar' : 'Adicionar'}
                  </Button>
                  {editId && (
                    <Button
                      variant="outline"
                      onClick={resetForm}
                      disabled={savingTask}
                      className="w-12 px-0 shrink-0"
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
                        <TableHead>Periodicidade</TableHead>
                        <TableHead>Horário</TableHead>
                        <TableHead className="text-right">Peso</TableHead>
                        <TableHead className="text-right w-[120px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentTasks
                        .sort((a, b) => {
                          if (a.horario_inicio && b.horario_inicio) {
                            const timeA = timeToMinutes(a.horario_inicio)
                            const timeB = timeToMinutes(b.horario_inicio)
                            if (timeA !== timeB) return timeA - timeB
                            return a.numero_sequencia - b.numero_sequencia
                          }
                          if (a.horario_inicio && !b.horario_inicio) return -1
                          if (!a.horario_inicio && b.horario_inicio) return 1
                          return a.numero_sequencia - b.numero_sequencia
                        })
                        .map((task) => (
                          <TableRow key={task.id}>
                            <TableCell className="font-medium">{task.numero_sequencia}</TableCell>
                            <TableCell>{task.descricao_tarefa}</TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1 items-start">
                                <Badge
                                  variant="secondary"
                                  className="w-fit text-[10px] px-2 py-0 uppercase tracking-wider"
                                >
                                  {task.periodicidade === 'diaria'
                                    ? 'Diária'
                                    : task.periodicidade === 'semanal'
                                      ? 'Semanal'
                                      : task.periodicidade === 'quinzenal'
                                        ? 'Quinzenal'
                                        : task.periodicidade === 'mensal'
                                          ? 'Mensal'
                                          : 'Diária'}
                                </Badge>
                                {task.periodicidade === 'semanal' && task.dias_semana && (
                                  <span className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider leading-tight">
                                    {task.dias_semana
                                      .map(
                                        (d) => ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][d],
                                      )
                                      .join(', ')}
                                  </span>
                                )}
                                {task.periodicidade === 'quinzenal' &&
                                  task.data_inicio_contagem && (
                                    <span className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider leading-tight">
                                      Início:{' '}
                                      {new Date(
                                        task.data_inicio_contagem + 'T00:00:00',
                                      ).toLocaleDateString('pt-BR')}
                                    </span>
                                  )}
                                {task.periodicidade === 'mensal' && task.dia_mes && (
                                  <span className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider leading-tight">
                                    Dia {task.dia_mes}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {task.horario_inicio ? (
                                <Badge variant="outline" className="font-mono">
                                  {task.horario_inicio.substring(0, 5)}
                                  {task.horario_fim ? ` - ${task.horario_fim.substring(0, 5)}` : ''}
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="font-mono font-normal">
                                  Sob demanda
                                </Badge>
                              )}
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

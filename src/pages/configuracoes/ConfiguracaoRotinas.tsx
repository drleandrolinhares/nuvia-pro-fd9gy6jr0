import { useState, useEffect, useMemo, useRef } from 'react'
import {
  Plus,
  Trash2,
  Edit2,
  Copy,
  Save,
  Info,
  Loader2,
  CheckCircle2,
  Eye,
  Clock,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
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
  observacao?: string | null
}

type User = {
  id: string
  nome: string
  role: string | null
  status?: string | null
  hasRoutine?: boolean
  horario_entrada?: string | null
  inicio_lanche_manha?: string | null
  fim_lanche_manha?: string | null
  saida_almoco?: string | null
  retorno_almoco?: string | null
  inicio_lanche_tarde?: string | null
  fim_lanche_tarde?: string | null
  horario_saida?: string | null
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

  // Single task duplicate state
  const [duplicateTaskOpen, setDuplicateTaskOpen] = useState(false)
  const [taskToDuplicate, setTaskToDuplicate] = useState<Task | null>(null)
  const [targetUserForTask, setTargetUserForTask] = useState<string>('')
  const [isDuplicatingTask, setIsDuplicatingTask] = useState(false)

  // Bulk duplicate state
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [bulkDuplicateOpen, setBulkDuplicateOpen] = useState(false)
  const [targetUsersForBulk, setTargetUsersForBulk] = useState<string[]>([])
  const [isBulkDuplicating, setIsBulkDuplicating] = useState(false)

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
  const [observacao, setObservacao] = useState<string>('')

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
      setSelectedTasks([])
    } else {
      setCurrentTasks([])
    }
  }, [selectedUser])

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('usuarios')
      .select(
        'id, nome, role, status, horario_entrada, inicio_lanche_manha, fim_lanche_manha, saida_almoco, retorno_almoco, inicio_lanche_tarde, fim_lanche_tarde, horario_saida',
      )
      .eq('status', 'ativo')
      .order('nome')

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
        return !role.includes('ceo') && !role.includes('socia') && !role.includes('admin')
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
          .order('horario_inicio', { ascending: true, nullsFirst: false })
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
    setObservacao('')
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
        observacao: observacao || null,
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
    setObservacao(task.observacao || '')

    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      document.getElementById('input-descricao')?.focus()
    }, 100)
  }

  const handleOpenDuplicateTask = (task: Task) => {
    setTaskToDuplicate(task)
    setTargetUserForTask(selectedUser)
    setDuplicateTaskOpen(true)
  }

  const handleDuplicateTask = async () => {
    if (!taskToDuplicate || !targetUserForTask) return
    setIsDuplicatingTask(true)
    try {
      let routineId = null
      const { data: routine } = await supabase
        .from('rotinas_usuarios')
        .select('id')
        .eq('usuario_id', targetUserForTask)
        .maybeSingle()

      if (!routine) {
        const { data: newRoutine, error: routineError } = await supabase
          .from('rotinas_usuarios')
          .insert({ usuario_id: targetUserForTask, ativa: true })
          .select('id')
          .single()
        if (routineError) throw routineError
        if (newRoutine) routineId = newRoutine.id
      } else {
        routineId = routine.id
      }

      if (!routineId) throw new Error('Não foi possível encontrar ou criar rotina do destino.')

      const { data: maxSeqData } = await supabase
        .from('tarefas_rotina')
        .select('numero_sequencia')
        .eq('rotina_id', routineId)
        .order('numero_sequencia', { ascending: false })
        .limit(1)

      const nextSeq = maxSeqData && maxSeqData.length > 0 ? maxSeqData[0].numero_sequencia + 1 : 1

      const taskData: any = {
        rotina_id: routineId,
        descricao_tarefa: taskToDuplicate.descricao_tarefa,
        horario_inicio: taskToDuplicate.horario_inicio,
        horario_fim: taskToDuplicate.horario_fim,
        peso_percentual: Number(taskToDuplicate.peso_percentual),
        numero_sequencia: nextSeq,
        periodicidade: taskToDuplicate.periodicidade || 'diaria',
        dias_semana: taskToDuplicate.dias_semana,
        dia_mes: taskToDuplicate.dia_mes,
        data_inicio_contagem: taskToDuplicate.data_inicio_contagem,
        observacao: taskToDuplicate.observacao,
        ativa: true,
      }

      const { error } = await supabase.from('tarefas_rotina').insert(taskData)
      if (error) throw error

      if (targetUserForTask === selectedUser) {
        await loadRoutine(selectedUser)
      }
      await fetchUsers()

      toast({ description: 'Tarefa duplicada com sucesso!' })
      setDuplicateTaskOpen(false)
      setTaskToDuplicate(null)
    } catch (error: any) {
      toast({
        title: 'Erro ao duplicar tarefa',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsDuplicatingTask(false)
    }
  }

  const handleBulkDuplicate = async () => {
    if (selectedTasks.length === 0 || targetUsersForBulk.length === 0) return
    setIsBulkDuplicating(true)
    try {
      const tasksToDuplicate = currentTasks.filter((t) => selectedTasks.includes(t.id))

      for (const targetUserId of targetUsersForBulk) {
        let routineId = null
        const { data: routine } = await supabase
          .from('rotinas_usuarios')
          .select('id')
          .eq('usuario_id', targetUserId)
          .maybeSingle()

        if (!routine) {
          const { data: newRoutine, error: routineError } = await supabase
            .from('rotinas_usuarios')
            .insert({ usuario_id: targetUserId, ativa: true })
            .select('id')
            .single()
          if (routineError) throw routineError
          if (newRoutine) routineId = newRoutine.id
        } else {
          routineId = routine.id
        }

        if (!routineId) throw new Error('Não foi possível encontrar ou criar rotina do destino.')

        const { data: maxSeqData } = await supabase
          .from('tarefas_rotina')
          .select('numero_sequencia')
          .eq('rotina_id', routineId)
          .order('numero_sequencia', { ascending: false })
          .limit(1)

        const nextSeq = maxSeqData && maxSeqData.length > 0 ? maxSeqData[0].numero_sequencia + 1 : 1

        const tasksData = tasksToDuplicate.map((t, index) => ({
          rotina_id: routineId,
          descricao_tarefa: t.descricao_tarefa,
          horario_inicio: t.horario_inicio,
          horario_fim: t.horario_fim,
          peso_percentual: Number(t.peso_percentual),
          numero_sequencia: nextSeq + index,
          periodicidade: t.periodicidade || 'diaria',
          dias_semana: t.dias_semana,
          dia_mes: t.dia_mes,
          data_inicio_contagem: t.data_inicio_contagem,
          observacao: t.observacao,
          ativa: true,
        }))

        const { error } = await supabase.from('tarefas_rotina').insert(tasksData)
        if (error) throw error
      }

      if (targetUsersForBulk.includes(selectedUser)) {
        await loadRoutine(selectedUser)
      }
      await fetchUsers()

      toast({
        description: `${tasksToDuplicate.length} tarefas duplicadas com sucesso para ${targetUsersForBulk.length} colaborador(es)!`,
      })
      setBulkDuplicateOpen(false)
      setSelectedTasks([])
      setTargetUsersForBulk([])
    } catch (error: any) {
      toast({
        title: 'Erro ao duplicar tarefas',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsBulkDuplicating(false)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase.from('tarefas_rotina').delete().eq('id', taskId)
      if (error) throw error
      await loadRoutine(selectedUser)
      await fetchUsers()
      setSelectedTasks(selectedTasks.filter((id) => id !== taskId))
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
        observacao: t.observacao,
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
      <div className="bg-slate-900 border-l-4 border-amber-500 p-4 sm:p-6 rounded-lg shadow-sm mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight uppercase">
          Configuração de Rotinas
        </h1>
        <p className="text-slate-400 uppercase text-sm sm:text-base font-medium tracking-wider mt-1">
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

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className="w-full sm:w-[350px] lg:w-[450px] h-12 text-base font-medium">
                  <SelectValue placeholder="Selecione o colaborador..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id} className="py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-amber-500/20">
                          <AvatarFallback className="bg-amber-500/10 text-amber-600 text-xs font-bold">
                            {u.nome
                              .split(' ')
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join('')
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start">
                          <span className="font-bold text-sm">{u.nome}</span>
                          {u.hasRoutine && (
                            <span className="flex items-center text-emerald-600 text-[10px] font-medium uppercase tracking-wider mt-0.5">
                              <CheckCircle2 className="size-3 mr-1" />
                              Rotina Configurada
                            </span>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedUser && currentTasks.length > 0 && (
                <Dialog open={isDuplicateDialogOpen} onOpenChange={setIsDuplicateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-12 shrink-0 border-border/50 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Copy className="size-4 mr-2 text-amber-500" />
                      Duplicar Rotina
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Duplicar Rotina Completa</DialogTitle>
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
                              <SelectItem key={u.id} value={u.id} className="py-2">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="bg-slate-900 text-amber-500 text-[10px] font-bold">
                                      {u.nome
                                        .split(' ')
                                        .map((n) => n[0])
                                        .slice(0, 2)
                                        .join('')
                                        .toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium text-sm">{u.nome}</span>
                                  {u.hasRoutine && (
                                    <span className="flex items-center text-amber-600 text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 px-1.5 py-0.5 rounded-full ml-2">
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
                      <Button
                        className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold"
                        onClick={handleDuplicate}
                      >
                        Confirmar Duplicação
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
          {selectedUser && (
            <div className="mt-6 pt-6 border-t border-border/50 animate-fade-in">
              {(() => {
                const user = users.find((u) => u.id === selectedUser)
                if (!user) return null

                const formatH = (h: string | null | undefined) => (h ? h.substring(0, 5) : null)

                const hours = [
                  { label: 'Entrada', value: formatH(user.horario_entrada) },
                  {
                    label: 'Almoço',
                    value:
                      user.saida_almoco && user.retorno_almoco
                        ? `${formatH(user.saida_almoco)} - ${formatH(user.retorno_almoco)}`
                        : null,
                  },
                  { label: 'Saída', value: formatH(user.horario_saida) },
                ].filter((h) => h.value)

                return (
                  <div className="bg-slate-900 border-l-4 border-amber-500 p-5 rounded-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16 border-2 border-amber-500/20 shadow-inner bg-slate-800">
                        <AvatarFallback className="bg-transparent text-amber-500 font-bold text-xl">
                          {user.nome
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1.5">
                        <h2 className="text-xl font-bold text-white uppercase tracking-wider leading-none">
                          {user.nome}
                        </h2>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant="outline"
                            className="text-[10px] text-amber-500 border-amber-500/30 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5"
                          >
                            {user.role === 'admin' ? 'Administrador' : user.role || 'Colaborador'}
                          </Badge>
                          {user.hasRoutine && (
                            <span className="flex items-center text-emerald-400 text-xs font-semibold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="size-3 mr-1" />
                              Rotina Ativa
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {hours.length > 0 ? (
                      <div className="flex flex-col gap-2.5 bg-slate-800/60 p-4 rounded-lg w-full lg:w-auto border border-slate-700/50">
                        <div className="font-bold flex items-center gap-2 text-slate-300 uppercase tracking-widest text-xs">
                          <Clock className="w-4 h-4 text-amber-500" />
                          Jornada de Trabalho
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {hours.map((h, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1.5 rounded-md border border-slate-700/50 shadow-sm"
                            >
                              <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
                                {h.label}:
                              </span>
                              <span className="text-xs font-bold text-amber-50">{h.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-slate-400 italic flex items-center gap-2 bg-slate-800/60 p-4 rounded-lg border border-slate-700/50 w-full lg:w-auto">
                        <Info className="w-4 h-4 text-amber-500" /> Nenhum horário cadastrado.
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>
          )}
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
                  <Label title="Apenas para itens sob demanda">Seq.</Label>
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
                <div className="md:col-span-12 space-y-2">
                  <Label>Observação / Script de Apoio (Opcional)</Label>
                  <Textarea
                    placeholder="Ex: Olá, tudo bem? Gostaria de confirmar sua consulta..."
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    className="resize-none min-h-[80px]"
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
                  <Button
                    onClick={handleAddOrUpdateTask}
                    disabled={savingTask}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold uppercase tracking-wider"
                  >
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
              {selectedTasks.length > 0 && (
                <div className="flex items-center justify-between bg-primary/5 p-3 rounded-md mb-4 border border-primary/20 animate-fade-in">
                  <span className="text-sm font-medium text-primary">
                    {selectedTasks.length}{' '}
                    {selectedTasks.length === 1 ? 'tarefa selecionada' : 'tarefas selecionadas'}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setSelectedTasks([])}>
                      Limpar Seleção
                    </Button>
                    <Button size="sm" onClick={() => setBulkDuplicateOpen(true)}>
                      <Copy className="size-4 mr-2" />
                      Duplicar Selecionadas
                    </Button>
                  </div>
                </div>
              )}

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
                        <TableHead className="w-[40px] text-center">
                          <Checkbox
                            checked={
                              currentTasks.length > 0 &&
                              selectedTasks.length === currentTasks.length
                            }
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedTasks(currentTasks.map((t) => t.id))
                              } else {
                                setSelectedTasks([])
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead className="w-[140px]">Horário / Seq.</TableHead>
                        <TableHead>Descrição da Tarefa</TableHead>
                        <TableHead>Periodicidade</TableHead>
                        <TableHead className="text-right">Peso</TableHead>
                        <TableHead className="text-right w-[120px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...currentTasks]
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
                          <TableRow
                            key={task.id}
                            className={selectedTasks.includes(task.id) ? 'bg-muted/30' : ''}
                          >
                            <TableCell className="text-center">
                              <Checkbox
                                checked={selectedTasks.includes(task.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedTasks([...selectedTasks, task.id])
                                  } else {
                                    setSelectedTasks(selectedTasks.filter((id) => id !== task.id))
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              {task.horario_inicio ? (
                                <Badge
                                  variant="outline"
                                  className="font-mono bg-muted/50 whitespace-nowrap"
                                >
                                  {task.horario_inicio.substring(0, 5)}
                                  {task.horario_fim ? ` - ${task.horario_fim.substring(0, 5)}` : ''}
                                </Badge>
                              ) : (
                                <Badge
                                  variant="secondary"
                                  className="font-mono font-normal bg-primary/5 text-primary border-primary/20"
                                >
                                  {task.numero_sequencia}º (Demanda)
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {task.observacao && (
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-primary bg-primary/5 hover:bg-primary/10 shrink-0"
                                        title="Ver Observação/Script"
                                      >
                                        <Eye className="w-4 h-4" />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                      className="w-[calc(100vw-2rem)] max-w-[900px] p-5 bg-slate-200 dark:bg-slate-800 border-t-8 border-t-primary border-x-2 border-b-2 border-primary shadow-2xl z-[9999] rounded-xl"
                                      side="bottom"
                                      align="start"
                                    >
                                      <div className="space-y-3">
                                        <h4 className="font-bold text-base flex items-center gap-2 text-primary dark:text-primary">
                                          <Eye className="w-5 h-5" />
                                          Script / Observação
                                        </h4>
                                        <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap bg-slate-100 dark:bg-slate-900 p-4 rounded-lg border border-slate-300 dark:border-slate-700 max-h-[60vh] overflow-y-auto font-medium shadow-inner">
                                          {task.observacao}
                                        </p>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                )}
                                <span>{task.descricao_tarefa}</span>
                              </div>
                            </TableCell>
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
                            <TableCell className="text-right font-medium">
                              {task.peso_percentual}%
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10"
                                  onClick={() => handleOpenDuplicateTask(task)}
                                  title="Duplicar Tarefa"
                                >
                                  <Copy className="size-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10"
                                  onClick={() => handleEditTask(task)}
                                  title="Editar Tarefa"
                                >
                                  <Edit2 className="size-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => handleDeleteTask(task.id)}
                                  title="Excluir Tarefa"
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
                  className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold uppercase tracking-wider"
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

      {/* Dialog for Duplicating a Single Task */}
      <Dialog open={duplicateTaskOpen} onOpenChange={setDuplicateTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicar Tarefa</DialogTitle>
            <DialogDescription>
              Selecione o colaborador de destino para esta tarefa. Você pode clonar para o próprio
              colaborador ou enviar para outro.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="bg-muted p-3 rounded-md text-sm border border-border/50">
              <span className="font-semibold block mb-1 uppercase tracking-wider text-xs text-primary">
                Tarefa selecionada:
              </span>
              <span className="text-foreground">{taskToDuplicate?.descricao_tarefa}</span>
            </div>
            <div className="space-y-2">
              <Label>Colaborador de destino</Label>
              <Select value={targetUserForTask} onValueChange={setTargetUserForTask}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o destino..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id} className="py-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-slate-900 text-amber-500 text-[10px] font-bold">
                            {u.nome
                              .split(' ')
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join('')
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{u.nome}</span>
                        {u.id === selectedUser && (
                          <span className="flex items-center text-primary text-[10px] font-bold bg-primary/10 px-1.5 py-0.5 rounded-full uppercase tracking-wider ml-2">
                            Clonar
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDuplicateTaskOpen(false)}
              disabled={isDuplicatingTask}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDuplicateTask}
              disabled={isDuplicatingTask || !targetUserForTask}
              className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold"
            >
              {isDuplicatingTask && <Loader2 className="size-4 mr-2 animate-spin" />}
              {isDuplicatingTask ? 'Copiando...' : 'Confirmar Cópia'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for Bulk Duplicating Multiple Tasks */}
      <Dialog open={bulkDuplicateOpen} onOpenChange={setBulkDuplicateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicar {selectedTasks.length} Tarefas</DialogTitle>
            <DialogDescription>
              Selecione os colaboradores de destino para enviar as tarefas selecionadas em lote.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Colaboradores de destino</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => {
                    if (targetUsersForBulk.length === users.length) {
                      setTargetUsersForBulk([])
                    } else {
                      setTargetUsersForBulk(users.map((u) => u.id))
                    }
                  }}
                >
                  {targetUsersForBulk.length === users.length ? 'Desmarcar todos' : 'Marcar todos'}
                </Button>
              </div>
              <div className="border border-border/50 rounded-md p-2 h-[200px] overflow-y-auto space-y-1 bg-background/50">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded-md transition-colors"
                  >
                    <Checkbox
                      id={`bulk-user-${u.id}`}
                      checked={targetUsersForBulk.includes(u.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setTargetUsersForBulk([...targetUsersForBulk, u.id])
                        } else {
                          setTargetUsersForBulk(targetUsersForBulk.filter((id) => id !== u.id))
                        }
                      }}
                    />
                    <label
                      htmlFor={`bulk-user-${u.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1 flex items-center gap-3"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-slate-900 text-amber-500 text-xs font-bold">
                          {u.nome
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-bold text-sm tracking-wide">{u.nome}</span>
                      {u.id === selectedUser && (
                        <span className="flex items-center text-primary text-[10px] font-bold bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider ml-auto">
                          Clonar
                        </span>
                      )}
                    </label>
                  </div>
                ))}
              </div>
              {targetUsersForBulk.length > 0 && (
                <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  {targetUsersForBulk.length} colaborador(es) selecionado(s)
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkDuplicateOpen(false)}
              disabled={isBulkDuplicating}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleBulkDuplicate}
              disabled={isBulkDuplicating || targetUsersForBulk.length === 0}
              className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold"
            >
              {isBulkDuplicating && <Loader2 className="size-4 mr-2 animate-spin" />}
              {isBulkDuplicating ? 'Copiando...' : 'Confirmar Cópia'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

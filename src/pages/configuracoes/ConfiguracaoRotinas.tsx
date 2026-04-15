import { useState, useEffect, useMemo } from 'react'
import { Plus, Trash2, Edit2, Copy, Save, Info } from 'lucide-react'
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
  descricao: string
  horarioInicio: string
  horarioFim: string
  peso: number
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

  // Mocked state to hold routines mapped by user id
  const [routines, setRoutines] = useState<Record<string, Task[]>>({})

  useEffect(() => {
    fetchUsers()
  }, [])

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

    // Filter out CEO and Sócia
    const filtered = data.filter((u) => {
      const role = u.role?.toLowerCase() || ''
      return !role.includes('ceo') && !role.includes('socia')
    })

    setUsers(filtered)

    // Initialize mock data for the first user to demonstrate functionality
    if (filtered.length > 0) {
      setRoutines({
        [filtered[0].id]: [
          {
            id: '1',
            descricao: 'Conferência de equipamentos',
            horarioInicio: '08:00',
            horarioFim: '08:15',
            peso: 15,
          },
          {
            id: '2',
            descricao: 'Revisão da agenda do dia',
            horarioInicio: '08:15',
            horarioFim: '08:30',
            peso: 25,
          },
          {
            id: '3',
            descricao: 'Preparação dos consultórios',
            horarioInicio: '08:30',
            horarioFim: '09:00',
            peso: 60,
          },
        ],
      })
    }
  }

  const currentTasks = useMemo(() => {
    if (!selectedUser) return []
    return routines[selectedUser] || []
  }, [selectedUser, routines])

  const totalWeight = useMemo(() => {
    return currentTasks.reduce((sum, task) => sum + task.peso, 0)
  }, [currentTasks])

  const resetForm = () => {
    setEditId(null)
    setDescricao('')
    setHorarioInicio('')
    setHorarioFim('')
    setPeso(5)
  }

  const handleAddOrUpdateTask = () => {
    if (!descricao || !horarioInicio || !horarioFim || peso <= 0) {
      toast({
        title: 'Campos inválidos',
        description: 'Preencha todos os campos corretamente.',
        variant: 'destructive',
      })
      return
    }

    const newTask: Task = {
      id: editId || crypto.randomUUID(),
      descricao,
      horarioInicio,
      horarioFim,
      peso,
    }

    setRoutines((prev) => {
      const userTasks = prev[selectedUser] ? [...prev[selectedUser]] : []
      if (editId) {
        const index = userTasks.findIndex((t) => t.id === editId)
        if (index !== -1) userTasks[index] = newTask
      } else {
        userTasks.push(newTask)
      }
      return { ...prev, [selectedUser]: userTasks }
    })

    resetForm()
  }

  const handleEditTask = (task: Task) => {
    setEditId(task.id)
    setDescricao(task.descricao)
    setHorarioInicio(task.horarioInicio)
    setHorarioFim(task.horarioFim)
    setPeso(task.peso)
  }

  const handleDeleteTask = (taskId: string) => {
    setRoutines((prev) => {
      const userTasks = prev[selectedUser]?.filter((t) => t.id !== taskId) || []
      return { ...prev, [selectedUser]: userTasks }
    })
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
      description: 'A configuração de rotina foi salva com sucesso!',
    })
  }

  const handleDuplicate = () => {
    if (!targetDuplicateUser) {
      toast({
        title: 'Selecione um destino',
        description: 'Você precisa escolher para qual usuário deseja copiar a rotina.',
        variant: 'destructive',
      })
      return
    }

    setRoutines((prev) => ({
      ...prev,
      [targetDuplicateUser]: [...currentTasks].map((t) => ({ ...t, id: crypto.randomUUID() })),
    }))

    setIsDuplicateDialogOpen(false)
    setTargetDuplicateUser('')
    toast({
      title: 'Rotina Duplicada',
      description: 'A rotina foi copiada com sucesso para o usuário selecionado.',
    })
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
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
              <CardTitle className="text-lg uppercase tracking-wider flex items-center gap-2">
                <Plus className="size-5 text-primary" />
                {editId ? 'Editar Tarefa' : 'Adicionar Nova Tarefa'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-5 space-y-2">
                  <Label>Descrição da Tarefa</Label>
                  <Input
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
                  <Label>Fim (HH:MM)</Label>
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
                  <Button onClick={handleAddOrUpdateTask} className="w-full">
                    {editId ? <Save className="size-4" /> : <Plus className="size-4" />}
                  </Button>
                  {editId && (
                    <Button variant="outline" onClick={resetForm} className="w-full px-0">
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
              {currentTasks.length === 0 ? (
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
                        .sort((a, b) => a.horarioInicio.localeCompare(b.horarioInicio))
                        .map((task, idx) => (
                          <TableRow key={task.id}>
                            <TableCell className="font-medium">{idx + 1}</TableCell>
                            <TableCell>{task.descricao}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-mono">
                                {task.horarioInicio} - {task.horarioFim}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">{task.peso}%</TableCell>
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
                  disabled={currentTasks.length === 0}
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

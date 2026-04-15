import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Clock, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type Task = {
  id: string
  descricao: string
  horarioInicio: string // HH:MM
  horarioFim: string // HH:MM
  concluidaEm: string | null // HH:MM or null
}

const mockTasks: Task[] = [
  {
    id: '1',
    descricao: 'Chegar e abrir a clínica',
    horarioInicio: '08:00',
    horarioFim: '08:15',
    concluidaEm: '08:10',
  },
  {
    id: '2',
    descricao: 'Ligar compressores e equipamentos',
    horarioInicio: '08:15',
    horarioFim: '08:30',
    concluidaEm: null,
  },
  {
    id: '3',
    descricao: 'Conferir agenda do dia',
    horarioInicio: '08:30',
    horarioFim: '09:00',
    concluidaEm: null,
  },
  {
    id: '4',
    descricao: 'Preparar salas de atendimento',
    horarioInicio: '09:00',
    horarioFim: '09:30',
    concluidaEm: null,
  },
  {
    id: '5',
    descricao: 'Confirmar consultas do período da tarde',
    horarioInicio: '09:30',
    horarioFim: '10:00',
    concluidaEm: null,
  },
  {
    id: '6',
    descricao: 'Checagem de materiais de consumo',
    horarioInicio: '10:00',
    horarioFim: '10:30',
    concluidaEm: null,
  },
  {
    id: '7',
    descricao: 'Atualizar planilhas de controle',
    horarioInicio: '10:30',
    horarioFim: '11:00',
    concluidaEm: null,
  },
  {
    id: '8',
    descricao: 'Esterilização de instrumentais (Lote 1)',
    horarioInicio: '11:00',
    horarioFim: '11:30',
    concluidaEm: null,
  },
  {
    id: '9',
    descricao: 'Revisão de prontuários',
    horarioInicio: '11:30',
    horarioFim: '12:00',
    concluidaEm: null,
  },
  {
    id: '10',
    descricao: 'Pausa para Almoço',
    horarioInicio: '12:00',
    horarioFim: '13:00',
    concluidaEm: null,
  },
  {
    id: '11',
    descricao: 'Retorno e organização da recepção',
    horarioInicio: '13:00',
    horarioFim: '13:30',
    concluidaEm: null,
  },
  {
    id: '12',
    descricao: 'Confirmar consultas do dia seguinte',
    horarioInicio: '13:30',
    horarioFim: '14:00',
    concluidaEm: null,
  },
  {
    id: '13',
    descricao: 'Preparar salas para o período da tarde',
    horarioInicio: '14:00',
    horarioFim: '14:30',
    concluidaEm: null,
  },
  {
    id: '14',
    descricao: 'Auditoria de estoque nas gavetas',
    horarioInicio: '14:30',
    horarioFim: '15:00',
    concluidaEm: null,
  },
  {
    id: '15',
    descricao: 'Fechamento de caixa parcial',
    horarioInicio: '15:00',
    horarioFim: '15:30',
    concluidaEm: null,
  },
  {
    id: '16',
    descricao: 'Esterilização de instrumentais (Lote 2)',
    horarioInicio: '15:30',
    horarioFim: '16:00',
    concluidaEm: null,
  },
  {
    id: '17',
    descricao: 'Contato com pacientes faltantes',
    horarioInicio: '16:00',
    horarioFim: '16:30',
    concluidaEm: null,
  },
  {
    id: '18',
    descricao: 'Organização de documentos físicos',
    horarioInicio: '16:30',
    horarioFim: '17:00',
    concluidaEm: null,
  },
  {
    id: '19',
    descricao: 'Desligar equipamentos não essenciais',
    horarioInicio: '17:00',
    horarioFim: '17:30',
    concluidaEm: null,
  },
  {
    id: '20',
    descricao: 'Fechamento da clínica e alarme',
    horarioInicio: '17:30',
    horarioFim: '18:00',
    concluidaEm: null,
  },
]

const timeToMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export default function RotinaDiaria() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  const handleCheck = (taskId: string, checked: boolean) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          if (checked) {
            const hh = String(now.getHours()).padStart(2, '0')
            const mm = String(now.getMinutes()).padStart(2, '0')
            return { ...t, concluidaEm: `${hh}:${mm}` }
          } else {
            return { ...t, concluidaEm: null }
          }
        }
        return t
      }),
    )
  }

  const completedCount = tasks.filter((t) => t.concluidaEm !== null).length
  const progressPercent = Math.round((completedCount / tasks.length) * 100)

  const allTasksHandled = tasks.every((t) => {
    if (t.concluidaEm) return true
    const endMins = timeToMinutes(t.horarioFim)
    return currentMinutes > endMins
  })

  const renderTaskStatus = (task: Task) => {
    if (task.concluidaEm) {
      return (
        <div className="flex items-center text-emerald-600 dark:text-emerald-400 text-sm font-medium gap-1.5">
          <CheckCircle2 className="w-4 h-4" />
          <span>Concluído às {task.concluidaEm}</span>
        </div>
      )
    }

    const startMins = timeToMinutes(task.horarioInicio)
    const endMins = timeToMinutes(task.horarioFim)

    if (currentMinutes < startMins) {
      return (
        <div className="flex items-center text-slate-400 dark:text-slate-500 text-sm gap-1.5">
          <Clock className="w-4 h-4" />
          <span>Disponível em {task.horarioInicio}</span>
        </div>
      )
    }

    if (currentMinutes > endMins) {
      const minutesLate = currentMinutes - endMins
      const isCritical = minutesLate > 60

      return (
        <div className="flex items-center text-red-500 dark:text-red-400 text-sm font-medium gap-1.5">
          {isCritical ? (
            <AlertCircle className="w-4 h-4" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          )}
          <div className="flex items-center flex-wrap sm:flex-nowrap gap-y-1">
            <span>Prazo expirado</span>
            {isCritical ? (
              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800 tracking-wider">
                🔴 CRÍTICO
              </span>
            ) : (
              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800 tracking-wider">
                ⚠️ TOLERÂNCIA
              </span>
            )}
          </div>
        </div>
      )
    }

    return (
      <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium gap-1.5 animate-pulse">
        <Clock className="w-4 h-4" />
        <span>Em andamento</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rotina Diária</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie e acompanhe as tarefas operacionais do dia.
          </p>
        </div>
        <div className="text-left sm:text-right bg-muted/30 p-3 rounded-lg border border-border/50">
          <div className="text-2xl font-bold text-amber-500 tracking-wider">
            {String(now.getHours()).padStart(2, '0')}:{String(now.getMinutes()).padStart(2, '0')}
          </div>
          <div className="text-sm text-muted-foreground capitalize">
            {now.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
          </div>
        </div>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-4 bg-muted/10 border-b border-border/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:mb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-amber-500" />
              Progresso das Tarefas
            </CardTitle>
            <span className="font-semibold text-sm bg-primary/10 text-primary px-3 py-1 rounded-full w-fit">
              Progresso: {completedCount}/{tasks.length} ({progressPercent}%)
            </span>
          </div>
          <Progress value={progressPercent} className="h-2.5" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {tasks.map((task) => {
              const startMins = timeToMinutes(task.horarioInicio)
              const endMins = timeToMinutes(task.horarioFim)
              const isWithinWindow = currentMinutes >= startMins && currentMinutes <= endMins
              const disabled = !isWithinWindow

              return (
                <div
                  key={task.id}
                  className={cn(
                    'p-4 sm:px-6 flex items-start sm:items-center gap-4 transition-colors hover:bg-muted/30',
                    !isWithinWindow && !task.concluidaEm && 'opacity-80 bg-muted/10',
                    task.concluidaEm && 'bg-emerald-50/30 dark:bg-emerald-950/10',
                  )}
                >
                  <div className="mt-1 sm:mt-0">
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={!!task.concluidaEm}
                      disabled={disabled}
                      onCheckedChange={(checked) => handleCheck(task.id, checked as boolean)}
                      className={cn(
                        'w-5 h-5',
                        task.concluidaEm &&
                          'data-[state=checked]:bg-emerald-500 data-[state=checked]:text-white data-[state=checked]:border-emerald-500',
                      )}
                    />
                  </div>
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1.5">
                      <label
                        htmlFor={`task-${task.id}`}
                        className={cn(
                          'text-base font-medium leading-tight peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                          !disabled && 'cursor-pointer hover:text-primary',
                          task.concluidaEm && 'line-through text-muted-foreground',
                        )}
                      >
                        {task.descricao}
                      </label>
                      <div className="flex items-center text-sm text-muted-foreground gap-1.5 font-medium bg-muted/50 w-fit px-2 py-0.5 rounded-md">
                        <Clock className="w-3.5 h-3.5" />
                        {task.horarioInicio} - {task.horarioFim}
                      </div>
                    </div>
                    <div className="shrink-0 bg-background sm:bg-transparent rounded-md p-2 sm:p-0 border sm:border-none border-border/50">
                      {renderTaskStatus(task)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-2 pb-10">
        <Button
          size="lg"
          disabled={!allTasksHandled}
          onClick={() =>
            toast.success('Rotina do dia fechada com sucesso!', {
              description: 'Todas as tarefas foram registradas e o relatório foi gerado.',
            })
          }
          className="w-full sm:w-auto font-bold tracking-wide"
        >
          FECHAR ROTINA DO DIA
        </Button>
      </div>
    </div>
  )
}

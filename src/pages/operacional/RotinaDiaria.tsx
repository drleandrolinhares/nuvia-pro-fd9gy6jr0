import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Clock, CheckCircle2, AlertCircle, AlertTriangle, XCircle, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type Task = {
  id: string
  descricao: string
  horarioInicio: string
  horarioFim: string
  concluidaEm: string | null
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

function ResumoFechamento({
  tasks,
  now,
  progressPercent,
  onCancel,
  onConfirm,
}: {
  tasks: Task[]
  now: Date
  progressPercent: number
  onCancel: () => void
  onConfirm: () => void
}) {
  const [hasConfirmed, setHasConfirmed] = useState(false)

  const stats = useMemo(() => {
    let onTime = 0
    let tolerance = 0
    let critical = 0
    let notCompleted = 0
    const delays: {
      id: string
      descricao: string
      delayStr: string
      type: 'tolerance' | 'critical' | 'notCompleted'
    }[] = []

    tasks.forEach((t) => {
      if (!t.concluidaEm) {
        notCompleted++
        delays.push({
          id: t.id,
          descricao: t.descricao,
          delayStr: 'Não concluída',
          type: 'notCompleted',
        })
      } else {
        const endMins = timeToMinutes(t.horarioFim)
        const doneMins = timeToMinutes(t.concluidaEm)
        const delay = doneMins - endMins

        if (delay <= 0) {
          onTime++
        } else if (delay <= 60) {
          tolerance++
          delays.push({
            id: t.id,
            descricao: t.descricao,
            delayStr: `${delay} min atrasado`,
            type: 'tolerance',
          })
        } else {
          critical++
          const h = Math.floor(delay / 60)
          const m = delay % 60
          const timeStr = h > 0 ? `${h}h ${m}min` : `${m} min`
          delays.push({
            id: t.id,
            descricao: t.descricao,
            delayStr: `${timeStr} atrasado`,
            type: 'critical',
          })
        }
      }
    })

    return { onTime, tolerance, critical, notCompleted, delays }
  }, [tasks])

  const total = tasks.length

  const handleConfirm = () => {
    const dateStr = now.toLocaleDateString('pt-BR')
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    toast.success(`Rotina fechada com sucesso em ${dateStr} às ${timeStr}`)
    onConfirm()
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onCancel} className="shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fechamento de Rotina</h1>
          <p className="text-muted-foreground mt-1">Resumo consolidado das atividades do dia.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 shadow-sm border-border/50">
          <CardHeader className="bg-muted/10 border-b border-border/50 pb-4">
            <CardTitle className="text-lg">Resumo do Dia</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 shrink-0" />
                <div>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {stats.onTime}/{total}
                  </div>
                  <div className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                    Tarefas no Horário
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                <AlertTriangle className="w-8 h-8 text-amber-500 shrink-0" />
                <div>
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {stats.tolerance}/{total}
                  </div>
                  <div className="text-sm font-medium text-amber-800 dark:text-amber-300">
                    Atrasadas - Tolerância
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
                <AlertCircle className="w-8 h-8 text-red-500 shrink-0" />
                <div>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {stats.critical}/{total}
                  </div>
                  <div className="text-sm font-medium text-red-800 dark:text-red-300">
                    Críticas &gt; 1h
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50/50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800">
                <XCircle className="w-8 h-8 text-slate-400 shrink-0" />
                <div>
                  <div className="text-2xl font-bold text-slate-600 dark:text-slate-400">
                    {stats.notCompleted}/{total}
                  </div>
                  <div className="text-sm font-medium text-slate-800 dark:text-slate-300">
                    Não Concluídas
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50 flex flex-col">
          <CardHeader className="bg-muted/10 border-b border-border/50 pb-4">
            <CardTitle className="text-lg text-center">Percentual Final</CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col items-center justify-center">
            <div className="relative flex items-center justify-center w-32 h-32">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  className="text-muted/30"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - progressPercent / 100)}`}
                  strokeLinecap="round"
                  className={cn(
                    'transition-all duration-1000 ease-out',
                    progressPercent >= 80
                      ? 'text-emerald-500'
                      : progressPercent >= 50
                        ? 'text-amber-500'
                        : 'text-red-500',
                  )}
                />
              </svg>
              <div className="absolute flex items-center justify-center text-3xl font-bold">
                {progressPercent}%
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {stats.delays.length > 0 && (
        <Card className="shadow-sm border-border/50">
          <CardHeader className="bg-muted/10 border-b border-border/50 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Detalhes de Atrasos e Pendências
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {stats.delays.map((delay) => (
                <div
                  key={delay.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                >
                  <span className="font-medium text-sm">{delay.descricao}</span>
                  <div
                    className={cn(
                      'flex items-center w-fit gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
                      delay.type === 'notCompleted' &&
                        'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
                      delay.type === 'tolerance' &&
                        'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-800',
                      delay.type === 'critical' &&
                        'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-400 dark:border-red-800',
                    )}
                  >
                    {delay.type === 'notCompleted' && <XCircle className="w-3.5 h-3.5" />}
                    {delay.type === 'tolerance' && <AlertTriangle className="w-3.5 h-3.5" />}
                    {delay.type === 'critical' && <AlertCircle className="w-3.5 h-3.5" />}
                    {delay.delayStr}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-border/50 shadow-sm overflow-hidden border-2 border-primary/20">
        <CardContent className="p-6 bg-primary/5">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="confirm-closure"
              checked={hasConfirmed}
              onCheckedChange={(c) => setHasConfirmed(!!c)}
              className="mt-1 w-5 h-5 data-[state=checked]:bg-primary"
            />
            <label
              htmlFor="confirm-closure"
              className="text-base font-medium leading-tight cursor-pointer select-none"
            >
              Eu confirmo que revisei minha rotina do dia e tomo ciência dos atrasos e não
              conclusões acima.
            </label>
          </div>
        </CardContent>
        <CardFooter className="p-4 bg-muted/30 border-t border-border/50 flex flex-col sm:flex-row justify-end gap-3">
          <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            CANCELAR
          </Button>
          <Button
            disabled={!hasConfirmed}
            onClick={handleConfirm}
            className="w-full sm:w-auto font-bold tracking-wide"
          >
            CONFIRMAR FECHAMENTO
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function RotinaDiaria() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [now, setNow] = useState(new Date())
  const [isClosing, setIsClosing] = useState(false)
  const [isClosed, setIsClosed] = useState(false)

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

  if (isClosed) {
    return (
      <div className="container mx-auto p-4 sm:p-6 max-w-4xl flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-center">Rotina Finalizada</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Seu checklist diário foi encerrado e salvo com sucesso. Bom descanso!
        </p>
        <Button
          onClick={() => {
            setIsClosed(false)
            setIsClosing(false)
            setTasks(mockTasks)
          }}
          variant="outline"
          className="mt-8"
        >
          Reiniciar Checklist
        </Button>
      </div>
    )
  }

  if (isClosing) {
    return (
      <div className="container mx-auto p-4 sm:p-6 max-w-4xl">
        <ResumoFechamento
          tasks={tasks}
          now={now}
          progressPercent={progressPercent}
          onCancel={() => setIsClosing(false)}
          onConfirm={() => setIsClosed(true)}
        />
      </div>
    )
  }

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
          onClick={() => setIsClosing(true)}
          className="w-full sm:w-auto font-bold tracking-wide"
        >
          FECHAR ROTINA DO DIA
        </Button>
      </div>
    </div>
  )
}

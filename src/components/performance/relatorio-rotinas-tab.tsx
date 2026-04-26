import { useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts'
import {
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
} from 'date-fns'
import {
  CheckCircle2,
  Clock,
  Filter,
  Loader2,
  FileBarChart,
  BarChart as BarChartIcon,
  Activity,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RotateCcw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { XCircle, ListOrdered, Eye, Copy, AlertCircle } from 'lucide-react'

const getBrtDate = (d: Date = new Date()) => {
  return new Date(d.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
}

const getLocalDateString = (d: Date = getBrtDate()) => {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const timeToMinutes = (time: string | null) => {
  if (!time) return 0
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

const formatTime = (time: string | null) => (time ? time.substring(0, 5) : '')

type Task = {
  id: string
  rotina_id: string
  numero_sequencia: number
  descricao_tarefa: string
  horario_inicio: string | null
  horario_fim: string | null
  peso_percentual: number
  periodicidade?: 'diaria' | 'semanal' | 'quinzenal' | 'mensal'
  dias_semana?: number[] | null
  dia_mes?: number | null
  data_inicio_contagem?: string | null
  observacao?: string | null

  execucao_id?: string
  concluida: boolean
  concluidaEm: string | null
  minutos_atrasado: number
  nivel_criticidade: 'no_horario' | 'tolerancia' | 'critico' | 'nao_concluida' | null
  fechamento_confirmado: boolean

  isAnticipated?: boolean
  originalDateStr?: string
}

const isWorkingDay = (date: Date, diasTrabalho: number[], ausencias: any[], userId: string) => {
  const dayOfWeek = date.getDay()
  if (!diasTrabalho.includes(dayOfWeek)) return false

  const dateStr = getLocalDateString(date)
  const isFeriadoGlobal = ausencias?.find((a: any) => !a.usuario_id && a.data === dateStr)
  const isAusenciaUsuario = ausencias?.find(
    (a: any) => a.usuario_id === userId && a.data === dateStr,
  )

  if (isFeriadoGlobal || isAusenciaUsuario) return false

  return true
}

const evaluateTasksForDate = (date: Date, tarefas: any[]) => {
  const currentDayOfWeek = date.getDay()
  const currentDayOfMonth = date.getDate()

  return tarefas.filter((t: any) => {
    const p = t.periodicidade || 'diaria'
    if (p === 'diaria') return true
    if (p === 'semanal') {
      return (
        t.dias_semana && Array.isArray(t.dias_semana) && t.dias_semana.includes(currentDayOfWeek)
      )
    }
    if (p === 'mensal') {
      const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
      const targetDay = (t.dia_mes ?? 1) > lastDayOfMonth ? lastDayOfMonth : t.dia_mes
      return targetDay === currentDayOfMonth
    }
    if (p === 'quinzenal') {
      if (!t.data_inicio_contagem) return false
      const [year, month, day] = t.data_inicio_contagem.split('-').map(Number)
      const startDate = new Date(year, month - 1, day)
      const targetDateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const diffTime = targetDateOnly.getTime() - startDate.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays < 0) return false
      return diffDays % 15 === 0
    }
    return true
  })
}

function ScriptPopoverReadOnly({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Copiado para a área de transferência!')
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-primary bg-primary/5 hover:bg-primary/10 shrink-0 transition-colors"
          title="Visualizar Script / Observação"
        >
          <Eye className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[calc(100vw-2rem)] sm:w-[500px] p-5 bg-slate-200 dark:bg-slate-800 border-t-8 border-t-primary border-x-2 border-b-2 border-primary/40 shadow-2xl z-[9999] rounded-xl"
        side="bottom"
        align="start"
      >
        <div className="space-y-4">
          <h4 className="font-bold text-base flex items-center gap-2 text-primary dark:text-primary">
            <Eye className="w-5 h-5" />
            Script / Observação
          </h4>
          <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap bg-slate-100 dark:bg-slate-900 p-4 rounded-lg border border-slate-300 dark:border-slate-700 max-h-[40vh] overflow-y-auto font-medium shadow-inner">
            {text}
          </p>
          <Button
            onClick={handleCopy}
            size="sm"
            className="w-full font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? 'Copiado!' : 'Copiar Texto'}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function RotinaEspelhoContent({ usuarioId, dateStr }: { usuarioId: string; dateStr: string }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const { data: routine } = await supabase
          .from('rotinas_usuarios')
          .select('id')
          .eq('usuario_id', usuarioId)
          .eq('ativa', true)
          .maybeSingle()

        if (!routine) {
          setTasks([])
          return
        }

        const { data: tarefas } = await supabase
          .from('tarefas_rotina')
          .select('*')
          .eq('rotina_id', routine.id)
          .eq('ativa', true)
          .order('horario_inicio', { ascending: true, nullsFirst: false })
          .order('numero_sequencia', { ascending: true })

        if (!tarefas) {
          setTasks([])
          return
        }

        const [year, month, day] = dateStr.split('-').map(Number)
        const targetDate = new Date(year, month - 1, day)

        const next15Days = new Date(targetDate)
        next15Days.setDate(targetDate.getDate() + 15)
        const next15DaysStr = getLocalDateString(next15Days)

        const [{ data: usuario }, { data: ausencias }] = await Promise.all([
          supabase.from('usuarios').select('dias_trabalho').eq('id', usuarioId).single(),
          supabase.from('ausencias').select('*').gte('data', dateStr).lte('data', next15DaysStr),
        ])

        const diasTrabalho = usuario?.dias_trabalho || [1, 2, 3, 4, 5]

        const nonWorkingDays: Date[] = []
        let checkDate = new Date(targetDate)
        checkDate.setDate(targetDate.getDate() + 1)

        while (true) {
          if (isWorkingDay(checkDate, diasTrabalho, ausencias || [], usuarioId)) {
            break
          }
          nonWorkingDays.push(new Date(checkDate))
          checkDate.setDate(checkDate.getDate() + 1)
          if (nonWorkingDays.length > 14) break
        }

        const tasksTarget = evaluateTasksForDate(targetDate, tarefas)
        const anticipatedTasks: any[] = []

        nonWorkingDays.forEach((nwd) => {
          const tasksForNwd = evaluateTasksForDate(nwd, tarefas)
          tasksForNwd.forEach((t: any) => {
            if (
              !tasksTarget.find((td: any) => td.id === t.id) &&
              !anticipatedTasks.find((at: any) => at.id === t.id)
            ) {
              anticipatedTasks.push({
                ...t,
                isAnticipated: true,
                originalDateStr: getLocalDateString(nwd),
              })
            }
          })
        })

        const tarefasFiltradas = [
          ...tasksTarget.map((t: any) => ({ ...t, isAnticipated: false })),
          ...anticipatedTasks,
        ]

        const { data: execucoes } = await supabase
          .from('execucoes_rotina')
          .select('*')
          .eq('usuario_id', usuarioId)
          .eq('data_execucao', dateStr)

        const validExecucoes =
          execucoes?.filter((e) => {
            if (!e.data_criacao) return true
            const criacaoDate = getBrtDate(new Date(e.data_criacao))
            const criacaoStr = getLocalDateString(criacaoDate)
            return criacaoStr === dateStr
          }) || []

        const mergedTasks: Task[] = tarefasFiltradas.map((t) => {
          const exec = validExecucoes.find((e) => e.tarefa_id === t.id)
          let concluidaEm = null
          if (exec?.timestamp_conclusao) {
            const d = getBrtDate(new Date(exec.timestamp_conclusao))
            concluidaEm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
          }

          return {
            id: t.id,
            rotina_id: t.rotina_id,
            numero_sequencia: t.numero_sequencia,
            descricao_tarefa: t.descricao_tarefa,
            horario_inicio: t.horario_inicio,
            horario_fim: t.horario_fim,
            peso_percentual: t.peso_percentual,
            periodicidade: t.periodicidade,
            dias_semana: t.dias_semana,
            dia_mes: t.dia_mes,
            data_inicio_contagem: t.data_inicio_contagem,
            observacao: t.observacao,
            execucao_id: exec?.id,
            concluida: exec?.concluida || false,
            concluidaEm,
            minutos_atrasado: exec?.minutos_atrasado || 0,
            nivel_criticidade: exec?.nivel_criticidade || null,
            fechamento_confirmado: exec?.fechamento_confirmado || false,
            isAnticipated: t.isAnticipated,
            originalDateStr: t.originalDateStr,
          }
        })

        mergedTasks.sort((a, b) => {
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

        setTasks(mergedTasks)
      } finally {
        setLoading(false)
      }
    }
    if (usuarioId && dateStr) {
      load()
    }
  }, [usuarioId, dateStr])

  const brtNow = getBrtDate()
  const todayStr = format(brtNow, 'yyyy-MM-dd')
  let currentMinutes = 1439 // end of day
  if (dateStr === todayStr) {
    currentMinutes = brtNow.getHours() * 60 + brtNow.getMinutes()
  } else if (dateStr > todayStr) {
    currentMinutes = 0
  }

  const completedCount = tasks.filter((t) => t.concluida).length
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0

  const notaQualidade = useMemo(() => {
    if (tasks.length === 0) return 0
    let somaNotas = 0
    tasks.forEach((t) => {
      if (!t.concluida) {
        somaNotas += 0
      } else {
        let dynamicDelay = t.minutos_atrasado || 0
        if (t.concluidaEm && t.horario_inicio) {
          const concluidaMins = timeToMinutes(t.concluidaEm)
          const compareTime = timeToMinutes(t.horario_fim || t.horario_inicio)
          const diff = concluidaMins - compareTime
          dynamicDelay = diff > 0 ? diff : 0
        }

        if (dynamicDelay <= 5) somaNotas += 10
        else if (dynamicDelay <= 15) somaNotas += 8
        else if (dynamicDelay <= 30) somaNotas += 5
        else somaNotas += 2
      }
    })
    return somaNotas / tasks.length
  }, [tasks])

  const renderTaskStatus = (task: Task) => {
    if (task.concluidaEm) {
      let dynamicDelay = task.minutos_atrasado || 0
      if (task.horario_inicio) {
        const concluidaMins = timeToMinutes(task.concluidaEm)
        const compareTime = timeToMinutes(task.horario_fim || task.horario_inicio)
        const diff = concluidaMins - compareTime
        dynamicDelay = diff > 0 ? diff : 0
      }

      const isGreen = dynamicDelay <= 5
      const isYellow = dynamicDelay > 5 && dynamicDelay <= 30

      return (
        <div
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-bold border-2 shadow-sm',
            isGreen
              ? 'bg-green-50 text-green-700 border-green-400 dark:bg-green-950/50 dark:text-green-400 dark:border-green-700'
              : isYellow
                ? 'bg-amber-50 text-amber-700 border-amber-400 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-700'
                : 'bg-red-600 text-white border-red-700 dark:bg-red-700 dark:border-red-800',
          )}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{task.concluidaEm}</span>
          {dynamicDelay > 0 && (
            <span className="text-xs ml-1 font-normal opacity-90">({dynamicDelay}m)</span>
          )}
        </div>
      )
    }

    if (task.fechamento_confirmado && !task.concluida) {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-bold border-2 shadow-sm bg-slate-100 text-slate-500 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
          <XCircle className="w-4 h-4" />
          <span>Não concluída</span>
        </div>
      )
    }

    if (!task.horario_inicio) {
      return (
        <div className="flex items-center text-amber-600 dark:text-amber-400 text-sm font-medium gap-1.5">
          <ListOrdered className="w-4 h-4" />
          <span>Pendente</span>
        </div>
      )
    }

    const startMins = timeToMinutes(task.horario_inicio)

    if (currentMinutes < startMins) {
      return (
        <div className="flex items-center text-slate-400 dark:text-slate-500 text-sm gap-1.5">
          <Clock className="w-4 h-4" />
          <span>Início {formatTime(task.horario_inicio)}</span>
        </div>
      )
    }

    if (task.horario_fim) {
      const endMins = timeToMinutes(task.horario_fim)
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
              <span>Atrasada</span>
              {isCritical ? (
                <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200 tracking-wider">
                  🔴 CRÍTICO
                </span>
              ) : (
                <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 tracking-wider">
                  ⚠️ TOLERÂNCIA
                </span>
              )}
            </div>
          </div>
        )
      }
    }

    return (
      <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium gap-1.5 animate-pulse">
        <Clock className="w-4 h-4" />
        <span>Em andamento</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 p-8">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium">Carregando espelho da rotina...</p>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-muted-foreground min-h-[300px] p-8">
        <Clock className="w-12 h-12 mb-4 opacity-20" />
        <p className="text-lg font-medium">Nenhuma rotina para este dia.</p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <Card className="border-border/50 shadow-sm bg-card">
        <CardHeader className="pb-4 bg-muted/10 border-b border-border/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:mb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-amber-500" />
              Progresso do Colaborador
            </CardTitle>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="font-semibold text-sm bg-primary/10 text-primary px-3 py-1 rounded-full w-fit">
                Progresso: {completedCount}/{tasks.length} ({progressPercent}%)
              </span>
              <span
                className={cn(
                  'font-bold text-sm px-3 py-1 rounded-full w-fit border',
                  notaQualidade >= 8
                    ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                    : notaQualidade >= 6
                      ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
                      : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
                )}
              >
                Nota Atual: {(notaQualidade || 0).toFixed(1)}
              </span>
            </div>
          </div>
          <Progress value={progressPercent} className="h-2.5" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {tasks.map((task) => {
              const hasTime = !!task.horario_inicio
              const startMins = hasTime ? timeToMinutes(task.horario_inicio) : 0

              let isWithinWindow = false
              if (!hasTime) {
                isWithinWindow = true
              } else if (task.horario_fim) {
                const endMins = timeToMinutes(task.horario_fim)
                isWithinWindow = currentMinutes >= startMins && currentMinutes <= endMins
              } else {
                isWithinWindow = currentMinutes >= startMins
              }

              let dynamicDelay = task.minutos_atrasado || 0
              if (task.concluidaEm && task.horario_inicio) {
                const concluidaMins = timeToMinutes(task.concluidaEm)
                const compareTime = timeToMinutes(task.horario_fim || task.horario_inicio)
                const diff = concluidaMins - compareTime
                dynamicDelay = diff > 0 ? diff : 0
              } else if (!task.concluida && task.horario_inicio) {
                const compareTime = timeToMinutes(task.horario_fim || task.horario_inicio)
                const diff = currentMinutes - compareTime
                dynamicDelay = diff > 0 ? diff : 0
              }

              const isGreen = task.concluida && dynamicDelay <= 5
              const isYellow = task.concluida && dynamicDelay > 5 && dynamicDelay <= 30
              const isRed =
                (task.concluida && dynamicDelay > 30) ||
                (!task.concluida && (task.fechamento_confirmado || dynamicDelay > 30))

              return (
                <div
                  key={task.id}
                  className={cn(
                    'p-4 sm:px-6 flex items-start sm:items-center gap-4 transition-colors',
                    !isWithinWindow && !task.concluida && 'opacity-80 bg-muted/10',
                    isGreen && 'bg-green-100 dark:bg-green-900/30',
                    isYellow && 'bg-amber-100 dark:bg-amber-900/30',
                    isRed && 'bg-red-100 dark:bg-red-900/30',
                  )}
                >
                  <div
                    className={cn(
                      'w-14 flex-shrink-0 text-center font-bold text-sm py-1.5 rounded border',
                      hasTime
                        ? 'bg-muted/50 text-muted-foreground border-border/50'
                        : 'bg-primary/5 text-primary border-primary/20',
                    )}
                  >
                    {hasTime ? formatTime(task.horario_inicio) : `${task.numero_sequencia}º`}
                  </div>

                  <div className="mt-1 sm:mt-0 flex-shrink-0 flex items-center gap-3">
                    {task.observacao && <ScriptPopoverReadOnly text={task.observacao} />}
                    <Checkbox
                      checked={!!task.concluida}
                      disabled={true}
                      className={cn(
                        'w-5 h-5 cursor-default',
                        task.concluida &&
                          'data-[state=checked]:bg-emerald-500 data-[state=checked]:text-white data-[state=checked]:border-emerald-500 opacity-60',
                      )}
                    />
                  </div>

                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={cn(
                            'text-base font-medium leading-tight',
                            task.concluida && 'line-through text-muted-foreground',
                          )}
                        >
                          {task.descricao_tarefa}
                        </span>
                        {task.isAnticipated && task.originalDateStr && (
                          <Badge
                            variant="outline"
                            className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 ml-2 text-[10px] tracking-wider px-1.5 py-0"
                          >
                            Antecipada de{' '}
                            {format(new Date(task.originalDateStr + 'T12:00:00'), 'dd/MM')}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground gap-1.5 font-medium bg-muted/50 w-fit px-2 py-0.5 rounded-md">
                        {hasTime ? (
                          <>
                            <Clock className="w-3.5 h-3.5" />
                            {formatTime(task.horario_inicio)}
                            {task.horario_fim
                              ? ` - ${formatTime(task.horario_fim)}`
                              : ' (sem prazo)'}
                          </>
                        ) : (
                          <>
                            <ListOrdered className="w-3.5 h-3.5" />
                            Sob demanda
                          </>
                        )}
                        <span className="ml-2 px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[10px] uppercase font-bold tracking-wider">
                          {task.periodicidade}
                        </span>
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
    </div>
  )
}

function DashboardCard({ title, stats }: { title: string; stats: any }) {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (circumference * stats.globalPercentual) / 100

  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center mb-6 mt-2">
          <div className="relative flex items-center justify-center w-24 h-24">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-secondary"
              />
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className={cn(
                  'transition-all duration-1000 ease-out',
                  stats.globalPercentual >= 80
                    ? 'text-green-500'
                    : stats.globalPercentual >= 50
                      ? 'text-amber-500'
                      : 'text-red-500',
                )}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-xl font-bold">{(stats.globalPercentual || 0).toFixed(0)}%</span>
            </div>
          </div>
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-2">
            Conclusão Global
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-secondary/30 p-2 rounded-md">
            <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" /> Top 3
            </h4>
            <div className="space-y-2">
              {stats.top3.length > 0 ? (
                stats.top3.map((u: any, i: number) => (
                  <div key={u.id} className="flex justify-between items-center text-xs">
                    <span className="truncate pr-2 text-muted-foreground" title={u.nome}>
                      {i + 1}. {u.nome.split(' ')[0]}
                    </span>
                    <span className="font-medium">{(u.percentual || 0).toFixed(0)}%</span>
                  </div>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">Sem dados</span>
              )}
            </div>
          </div>
          <div className="bg-secondary/30 p-2 rounded-md">
            <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2 flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4" /> Menores
            </h4>
            <div className="space-y-2">
              {stats.bottom3.length > 0 ? (
                stats.bottom3.map((u: any, i: number) => (
                  <div key={u.id} className="flex justify-between items-center text-xs">
                    <span className="truncate pr-2 text-muted-foreground" title={u.nome}>
                      {i + 1}. {u.nome.split(' ')[0]}
                    </span>
                    <span className="font-medium">{(u.percentual || 0).toFixed(0)}%</span>
                  </div>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">Sem dados</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const chartConfig = {
  quantidade: {
    label: 'Quantidade',
    color: 'hsl(var(--primary))',
  },
}

export function RelatorioRotinasTab() {
  const { profile } = useAuth()

  const [userFilter, setUserFilter] = useState('all')
  const [isReopening, setIsReopening] = useState(false)
  const [dateFilter, setDateFilter] = useState('hoje')
  const [cycleFilter, setCycleFilter] = useState('all')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const [espelhoUser, setEspelhoUser] = useState<{ id: string; nome: string } | null>(null)
  const [espelhoDate, setEspelhoDate] = useState<string>('')

  const [usersWithRoutines, setUsersWithRoutines] = useState<any[]>([])
  const [executions, setExecutions] = useState<any[]>([])
  const [ausencias, setAusencias] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isLive, setIsLive] = useState(true)
  const [dashboardExecutions, setDashboardExecutions] = useState<any[]>([])

  useEffect(() => {
    const fetchUsers = async () => {
      const { data: rotinas } = await supabase
        .from('rotinas_usuarios')
        .select(`
          usuario_id,
          usuarios:usuario_id (
            id, nome, role, dias_trabalho
          )
        `)
        .eq('ativa', true)

      if (rotinas) {
        const uniqueUsers = new Map()
        rotinas.forEach((r: any) => {
          const u = Array.isArray(r.usuarios) ? r.usuarios[0] : r.usuarios
          if (u && u.role?.toUpperCase() !== 'CEO' && u.role?.toUpperCase() !== 'SÓCIA') {
            uniqueUsers.set(u.id, u)
          }
        })
        setUsersWithRoutines(Array.from(uniqueUsers.values()))
      }
    }
    fetchUsers()
  }, [])

  const fetchExecutions = useCallback(async () => {
    setLoading(true)
    try {
      let startStr = format(getBrtDate(), 'yyyy-MM-dd')
      let endStr = format(getBrtDate(), 'yyyy-MM-dd')

      if (dateFilter === 'hoje') {
        startStr = format(startOfDay(getBrtDate()), 'yyyy-MM-dd')
        endStr = format(endOfDay(getBrtDate()), 'yyyy-MM-dd')
      } else if (dateFilter === '7dias') {
        startStr = format(startOfDay(subDays(getBrtDate(), 7)), 'yyyy-MM-dd')
        endStr = format(endOfDay(getBrtDate()), 'yyyy-MM-dd')
      } else if (dateFilter === 'mes') {
        startStr = format(startOfMonth(getBrtDate()), 'yyyy-MM-dd')
        endStr = format(endOfMonth(getBrtDate()), 'yyyy-MM-dd')
      } else if (dateFilter === 'custom') {
        if (!customStart || !customEnd) {
          setLoading(false)
          return
        }
        startStr = customStart
        endStr = customEnd
      }

      let query = supabase
        .from('execucoes_rotina')
        .select(`
          *,
          tarefas_rotina!inner (
            peso_percentual,
            periodicidade,
            horario_inicio,
            horario_fim
          ),
          usuarios:usuario_id (
            nome
          )
        `)
        .gte('data_execucao', startStr)
        .lte('data_execucao', endStr)

      if (userFilter !== 'all') {
        query = query.eq('usuario_id', userFilter)
      }

      if (cycleFilter !== 'all') {
        query = query.eq('tarefas_rotina.periodicidade', cycleFilter)
      }

      const [{ data, error }, { data: ausData }] = await Promise.all([
        query,
        supabase.from('ausencias').select('*').gte('data', startStr).lte('data', endStr),
      ])

      if (error) throw error
      setExecutions(data || [])
      setAusencias(ausData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }, [dateFilter, userFilter, customStart, customEnd, cycleFilter])

  const fetchDashboardExecutions = useCallback(async () => {
    const startM = startOfMonth(getBrtDate())
    const endM = endOfMonth(getBrtDate())

    const { data } = await supabase
      .from('execucoes_rotina')
      .select(`
        *,
        tarefas_rotina!inner (
          peso_percentual,
          periodicidade,
          horario_inicio,
          horario_fim
        ),
        usuarios:usuario_id (
          nome
        )
      `)
      .gte('data_execucao', format(startM, 'yyyy-MM-dd'))
      .lte('data_execucao', format(endM, 'yyyy-MM-dd'))

    if (data) {
      setDashboardExecutions(data)
    }
  }, [])

  useEffect(() => {
    fetchExecutions()
    fetchDashboardExecutions()
  }, [fetchExecutions, fetchDashboardExecutions])

  useEffect(() => {
    if (!isLive) return
    const channel = supabase
      .channel('realtime_execucoes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'execucoes_rotina' }, () => {
        fetchExecutions()
        fetchDashboardExecutions()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchExecutions, fetchDashboardExecutions, isLive])

  const dashboardStats = useMemo(() => {
    const now = getBrtDate()
    const todayStr = format(now, 'yyyy-MM-dd')
    const weekStartStr = format(startOfWeek(now, { weekStartsOn: 0 }), 'yyyy-MM-dd')
    const weekEndStr = format(endOfWeek(now, { weekStartsOn: 0 }), 'yyyy-MM-dd')
    const monthStartStr = format(startOfMonth(now), 'yyyy-MM-dd')
    const monthEndStr = format(endOfMonth(now), 'yyyy-MM-dd')

    const getStats = (startStr: string, endStr: string) => {
      const filtered = dashboardExecutions.filter((e) => {
        return e.data_execucao >= startStr && e.data_execucao <= endStr
      })

      const byUser: Record<string, any[]> = {}
      filtered.forEach((e) => {
        if (!byUser[e.usuario_id]) byUser[e.usuario_id] = []
        byUser[e.usuario_id].push(e)
      })

      const userStats = usersWithRoutines
        .map((u) => {
          const userExecs = byUser[u.id] || []
          const totalPeso = userExecs.reduce(
            (acc, curr) => acc + Number(curr.tarefas_rotina?.peso_percentual || 5),
            0,
          )
          const concluidoPeso = userExecs
            .filter((e) => e.concluida)
            .reduce((acc, curr) => acc + Number(curr.tarefas_rotina?.peso_percentual || 5), 0)
          const percentual = totalPeso > 0 ? (concluidoPeso / totalPeso) * 100 : 0
          return { id: u.id, nome: u.nome, percentual, totalPeso }
        })
        .filter((u) => u.totalPeso > 0)

      userStats.sort((a, b) => b.percentual - a.percentual)

      const top3 = userStats.slice(0, 3)
      const bottom3 = [...userStats].sort((a, b) => a.percentual - b.percentual).slice(0, 3)

      const globalTotalPeso = filtered.reduce(
        (acc, curr) => acc + Number(curr.tarefas_rotina?.peso_percentual || 5),
        0,
      )
      const globalConcluidoPeso = filtered
        .filter((e) => e.concluida)
        .reduce((acc, curr) => acc + Number(curr.tarefas_rotina?.peso_percentual || 5), 0)
      const globalPercentual =
        globalTotalPeso > 0 ? (globalConcluidoPeso / globalTotalPeso) * 100 : 0

      return { globalPercentual, top3, bottom3 }
    }

    return {
      diario: getStats(todayStr, todayStr),
      semanal: getStats(weekStartStr, weekEndStr),
      mensal: getStats(monthStartStr, monthEndStr),
    }
  }, [dashboardExecutions, usersWithRoutines])

  const ranking = useMemo(() => {
    const byUser: Record<string, any[]> = {}
    executions.forEach((e) => {
      if (!byUser[e.usuario_id]) byUser[e.usuario_id] = []
      byUser[e.usuario_id].push(e)
    })

    const usersToDisplay = new Map<string, { id: string; nome: string }>()

    usersWithRoutines.forEach((u) => {
      usersToDisplay.set(u.id, { id: u.id, nome: u.nome })
    })

    executions.forEach((e) => {
      if (!usersToDisplay.has(e.usuario_id)) {
        const uObj = Array.isArray(e.usuarios) ? e.usuarios[0] : e.usuarios
        usersToDisplay.set(e.usuario_id, {
          id: e.usuario_id,
          nome: uObj?.nome || 'Desconhecido',
          dias_trabalho: uObj?.dias_trabalho,
        } as any)
      }
    })

    let filteredUsers = Array.from(usersToDisplay.values()) as any[]
    if (userFilter !== 'all') {
      filteredUsers = filteredUsers.filter((u) => u.id === userFilter)
    }

    return filteredUsers
      .map((u) => {
        const userExecs = byUser[u.id] || []

        let isFolgaHoje = false
        if (dateFilter === 'hoje') {
          const today = getBrtDate()
          const currentDayOfWeek = today.getDay()
          const diasTrabalho = u.dias_trabalho || [1, 2, 3, 4, 5]
          const isFeriadoGlobal = ausencias.find(
            (a) => !a.usuario_id && a.data === format(today, 'yyyy-MM-dd'),
          )
          const isAusencia = ausencias.find(
            (a) => a.usuario_id === u.id && a.data === format(today, 'yyyy-MM-dd'),
          )

          if (!diasTrabalho.includes(currentDayOfWeek) || isFeriadoGlobal || isAusencia) {
            isFolgaHoje = true
          }
        }

        if (userExecs.length === 0) {
          return {
            usuario_id: u.id,
            nome: u.nome,
            percentual: 0,
            notaQualidade: 0,
            isFechado: false,
            isFolgaHoje,
            dataFechamento: null,
            ultimaAcao: null,
            inatividadeMinutos: -1,
            inatividadeTexto: isFolgaHoje ? 'Folga / Exceção' : 'Não iniciado',
            stats: {
              concluidas: 0,
              tolerancia: 0,
              criticas: 0,
              naoConcluidas: 0,
              noHorario: 0,
            },
          }
        }

        const totalPeso = userExecs.reduce(
          (acc, curr) => acc + Number(curr.tarefas_rotina?.peso_percentual || 5),
          0,
        )
        const concluidoPeso = userExecs
          .filter((e) => e.concluida)
          .reduce((acc, curr) => acc + Number(curr.tarefas_rotina?.peso_percentual || 5), 0)
        const percentual = totalPeso > 0 ? (concluidoPeso / totalPeso) * 100 : 0

        const pendentesFechamento = userExecs.filter((e) => !e.fechamento_confirmado).length
        const isFechado = pendentesFechamento === 0 && userExecs.length > 0

        const latestFechamento = userExecs
          .filter((e) => e.data_fechamento)
          .sort(
            (a, b) => new Date(b.data_fechamento).getTime() - new Date(a.data_fechamento).getTime(),
          )[0]?.data_fechamento

        const ultimaAcao = userExecs
          .filter((e) => e.timestamp_conclusao)
          .sort(
            (a, b) =>
              new Date(b.timestamp_conclusao).getTime() - new Date(a.timestamp_conclusao).getTime(),
          )[0]?.timestamp_conclusao

        let inatividadeMinutos = -1
        let inatividadeTexto = 'Sem ação hoje'

        if (ultimaAcao) {
          inatividadeMinutos = Math.floor(
            (new Date().getTime() - new Date(ultimaAcao).getTime()) / 60000,
          )
          if (inatividadeMinutos < 60) {
            inatividadeTexto = `Há ${inatividadeMinutos} min`
          } else {
            const diffHours = Math.floor(inatividadeMinutos / 60)
            inatividadeTexto = `Há ${diffHours}h ${inatividadeMinutos % 60}m`
          }
        }

        const statsObj = {
          concluidas: 0,
          tolerancia: 0,
          criticas: 0,
          naoConcluidas: 0,
          noHorario: 0,
        }

        let somaNotas = 0

        userExecs.forEach((e) => {
          if (!e.concluida) {
            statsObj.naoConcluidas++
            return
          }
          statsObj.concluidas++

          let dynamicDelay = e.minutos_atrasado || 0
          if (e.timestamp_conclusao && e.tarefas_rotina?.horario_inicio) {
            const d = getBrtDate(new Date(e.timestamp_conclusao))
            const concluidaMins = d.getHours() * 60 + d.getMinutes()
            const compareTime = timeToMinutes(
              e.tarefas_rotina.horario_fim || e.tarefas_rotina.horario_inicio,
            )
            const diff = concluidaMins - compareTime
            dynamicDelay = diff > 0 ? diff : 0
          }

          if (dynamicDelay <= 5) {
            statsObj.noHorario++
            somaNotas += 10
          } else if (dynamicDelay <= 15) {
            statsObj.tolerancia++
            somaNotas += 8
          } else if (dynamicDelay <= 30) {
            statsObj.tolerancia++
            somaNotas += 5
          } else {
            statsObj.criticas++
            somaNotas += 2
          }
        })

        const totalAcoes = userExecs.length
        const notaQualidade = totalAcoes > 0 ? somaNotas / totalAcoes : 0
        const concluidas = statsObj.concluidas
        const tolerancia = statsObj.tolerancia
        const criticas = statsObj.criticas
        const naoConcluidas = statsObj.naoConcluidas
        const noHorario = statsObj.noHorario

        return {
          usuario_id: u.id,
          nome: u.nome,
          percentual,
          notaQualidade,
          isFechado,
          isFolgaHoje,
          dataFechamento: latestFechamento,
          ultimaAcao,
          inatividadeMinutos,
          inatividadeTexto,
          stats: {
            concluidas,
            tolerancia,
            criticas,
            naoConcluidas,
            noHorario,
          },
        }
      })
      .sort((a, b) => {
        if (b.percentual !== a.percentual) return b.percentual - a.percentual
        return b.notaQualidade - a.notaQualidade
      })
  }, [executions, usersWithRoutines, userFilter])

  const selectedDetails = useMemo(() => {
    if (userFilter !== 'all') {
      return ranking.find((r) => r.usuario_id === userFilter) || null
    }

    if (ranking.length === 0) return null

    const globalStats = {
      concluidas: ranking.reduce((acc, r) => acc + r.stats.concluidas, 0),
      tolerancia: ranking.reduce((acc, r) => acc + r.stats.tolerancia, 0),
      criticas: ranking.reduce((acc, r) => acc + r.stats.criticas, 0),
      naoConcluidas: ranking.reduce((acc, r) => acc + r.stats.naoConcluidas, 0),
      noHorario: ranking.reduce((acc, r) => acc + r.stats.noHorario, 0),
    }

    const avgPercent = ranking.reduce((acc, r) => acc + r.percentual, 0) / ranking.length
    const allFechado = ranking.every((r) => r.isFechado)

    const avgNota = ranking.reduce((acc, r) => acc + (r.notaQualidade || 0), 0) / ranking.length

    return {
      nome: 'Todos os Usuários (Média)',
      percentual: avgPercent,
      notaQualidade: avgNota,
      isFechado: allFechado,
      dataFechamento: null,
      stats: globalStats,
    }
  }, [ranking, userFilter])

  const chartData = useMemo(() => {
    if (!selectedDetails) return []
    return [
      { name: 'No Horário', quantidade: selectedDetails.stats.noHorario, fill: '#22c55e' },
      { name: 'Tolerância', quantidade: selectedDetails.stats.tolerancia, fill: '#eab308' },
      { name: 'Crítico', quantidade: selectedDetails.stats.criticas, fill: '#ef4444' },
      { name: 'Não Concluídas', quantidade: selectedDetails.stats.naoConcluidas, fill: '#94a3b8' },
    ]
  }, [selectedDetails])

  const handleReabrirRotina = async (usuarioId: string) => {
    setIsReopening(true)
    try {
      const execsToOpen = executions.filter(
        (e) => e.usuario_id === usuarioId && e.fechamento_confirmado,
      )
      const ids = execsToOpen.map((e) => e.id)

      if (ids.length > 0) {
        const { error } = await supabase
          .from('execucoes_rotina')
          .update({
            fechamento_confirmado: false,
            data_fechamento: null,
          })
          .in('id', ids)

        if (error) throw error
        toast.success('Rotina reaberta com sucesso!')
        fetchExecutions()
        fetchDashboardExecutions()
      } else {
        toast.info('Nenhuma execução fechada encontrada para este usuário no período.')
      }
    } catch (err) {
      console.error(err)
      toast.error('Erro ao reabrir rotina.')
    } finally {
      setIsReopening(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight">
              Torre de Comando (Relatório de Rotinas)
            </h2>
            {isLive && (
              <Badge
                variant="outline"
                className="bg-red-500/10 text-red-500 border-red-200 animate-pulse flex items-center gap-1.5 px-2 py-0.5"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                AO VIVO
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            Monitoramento dinâmico e proativo de rotinas da equipe
          </p>
        </div>
        <div className="flex items-center gap-2 p-2 bg-secondary rounded-lg">
          <Activity className="w-5 h-5 text-primary" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard title="Desempenho Diário" stats={dashboardStats.diario} />
        <DashboardCard title="Desempenho Semanal" stats={dashboardStats.semanal} />
        <DashboardCard title="Desempenho Mensal" stats={dashboardStats.mensal} />
      </div>

      <Card className="bg-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="space-y-1.5 w-full md:w-auto flex-1">
              <Label>Selecionar Usuário</Label>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os usuários" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os usuários</SelectItem>
                  {usersWithRoutines.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 w-full md:w-auto flex-1">
              <Label>Ciclo / Periodicidade</Label>
              <Select value={cycleFilter} onValueChange={setCycleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Tarefas</SelectItem>
                  <SelectItem value="diaria">Diárias</SelectItem>
                  <SelectItem value="semanal">Semanais</SelectItem>
                  <SelectItem value="quinzenal">Quinzenais</SelectItem>
                  <SelectItem value="mensal">Mensais</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 w-full md:w-auto flex-1">
              <Label>Período</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hoje">Hoje</SelectItem>
                  <SelectItem value="7dias">Últimos 7 dias</SelectItem>
                  <SelectItem value="mes">Este mês</SelectItem>
                  <SelectItem value="custom">Período Customizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dateFilter === 'custom' && (
              <div className="flex gap-2 w-full md:w-auto items-end flex-1">
                <div className="space-y-1.5 flex-1">
                  <Label>De</Label>
                  <Input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5 flex-1">
                  <Label>Até</Label>
                  <Input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                  />
                </div>
              </div>
            )}

            <Button
              variant={isLive ? 'default' : 'outline'}
              onClick={() => setIsLive(!isLive)}
              className="w-full md:w-auto gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isLive ? (
                <Activity className="w-4 h-4" />
              ) : (
                <Filter className="w-4 h-4" />
              )}
              {isLive ? 'Pausar Atualizações' : 'Ativar Ao Vivo'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Grid de Status da Equipe</CardTitle>
            <CardDescription>Acompanhe a inatividade e o progresso em tempo real</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/30">
                    <TableHead>Colaborador</TableHead>
                    <TableHead>Conclusão</TableHead>
                    <TableHead>Qualidade</TableHead>
                    <TableHead>Última Ação</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ranking.map((r, i) => (
                    <TableRow key={r.usuario_id}>
                      <TableCell className="font-medium">
                        <button
                          onClick={() => {
                            setEspelhoUser({ id: r.usuario_id, nome: r.nome })
                            setEspelhoDate(
                              dateFilter === 'custom' && customEnd
                                ? customEnd
                                : format(getBrtDate(), 'yyyy-MM-dd'),
                            )
                          }}
                          className="hover:underline hover:text-primary flex items-center gap-1.5 text-left transition-colors font-semibold"
                          title="Espelhar rotina do colaborador"
                        >
                          <Eye className="w-4 h-4 text-muted-foreground" />
                          {r.nome}
                        </button>
                      </TableCell>
                      <TableCell>
                        {r.isFolgaHoje ? (
                          <Badge
                            variant="outline"
                            className="bg-blue-500/10 text-blue-600 border-blue-200"
                          >
                            Folga / Exceção
                          </Badge>
                        ) : (
                          <div className="flex items-center gap-3">
                            <Progress value={r.percentual || 0} className="w-[80px] h-2.5" />
                            <span className="text-sm font-semibold">
                              {(r.percentual || 0).toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {r.isFolgaHoje ? (
                          <span className="text-muted-foreground">-</span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span
                              className={cn(
                                'text-sm font-bold px-2 py-0.5 rounded-md',
                                (r.notaQualidade || 0) >= 8
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                  : (r.notaQualidade || 0) >= 6
                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                              )}
                            >
                              {(r.notaQualidade || 0).toFixed(1)}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-sm flex items-center gap-1.5 ${r.inatividadeMinutos > 120 && !r.isFolgaHoje ? 'text-red-500 font-semibold' : 'text-muted-foreground'}`}
                        >
                          {r.inatividadeMinutos > 120 && !r.isFolgaHoje && (
                            <AlertTriangle className="w-3.5 h-3.5" />
                          )}
                          {r.inatividadeTexto}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {r.isFolgaHoje ? (
                          <span className="text-muted-foreground text-sm">-</span>
                        ) : r.isFechado ? (
                          <div className="flex flex-col items-end gap-1">
                            <Badge
                              variant="outline"
                              className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-200 gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3" /> Fechado
                            </Badge>
                            {r.dataFechamento && (
                              <span className="text-[10px] text-muted-foreground font-medium">
                                às {format(getBrtDate(new Date(r.dataFechamento)), 'HH:mm')}
                              </span>
                            )}
                          </div>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-200 gap-1"
                          >
                            <Clock className="w-3 h-3" /> Pendente
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {ranking.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        {loading
                          ? 'Carregando dados...'
                          : 'Nenhum dado encontrado para o período/ciclo selecionado.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Detalhes: {selectedDetails?.nome}</CardTitle>
            <CardDescription>Resumo de execução das tarefas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedDetails ? (
              <>
                <div className="flex flex-col items-center justify-center p-6 bg-secondary/50 rounded-xl border border-border/50">
                  <div className="flex items-center gap-6 w-full justify-center">
                    <div className="flex flex-col items-center">
                      <span className="text-4xl font-black text-primary drop-shadow-sm">
                        {(selectedDetails.percentual || 0).toFixed(1)}%
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-1 text-center">
                        Conclusão
                        <br />
                        Final
                      </span>
                    </div>
                    <div className="h-12 w-px bg-border/50"></div>
                    <div className="flex flex-col items-center">
                      <span
                        className={cn(
                          'text-4xl font-black drop-shadow-sm',
                          (selectedDetails.notaQualidade || 0) >= 8
                            ? 'text-green-500'
                            : (selectedDetails.notaQualidade || 0) >= 6
                              ? 'text-amber-500'
                              : 'text-red-500',
                        )}
                      >
                        {(selectedDetails.notaQualidade || 0).toFixed(1)}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-1 text-center">
                        Nota de
                        <br />
                        Qualidade
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 px-2">
                  <div className="flex justify-between items-center text-sm group">
                    <span className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-green-500/20"></div>
                      <span className="font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                        ✅ No Horário
                      </span>
                    </span>
                    <span className="font-bold text-base">{selectedDetails.stats.noHorario}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm group">
                    <span className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 ring-2 ring-yellow-500/20"></div>
                      <span className="font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                        ⚠️ Tolerância
                      </span>
                    </span>
                    <span className="font-bold text-base">{selectedDetails.stats.tolerancia}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm group">
                    <span className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-red-500/20"></div>
                      <span className="font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                        🔴 Críticas
                      </span>
                    </span>
                    <span className="font-bold text-base">{selectedDetails.stats.criticas}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm group">
                    <span className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-400 ring-2 ring-slate-400/20"></div>
                      <span className="font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                        ❌ Não Concluídas
                      </span>
                    </span>
                    <span className="font-bold text-base">
                      {selectedDetails.stats.naoConcluidas}
                    </span>
                  </div>
                </div>

                <div className="pt-5 border-t border-border/50">
                  <h4 className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-3">
                    Status de Fechamento
                  </h4>
                  {selectedDetails.isFechado ? (
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex flex-col gap-3">
                      <p className="text-sm text-green-700 dark:text-green-400 flex items-center justify-center gap-2 font-semibold">
                        <CheckCircle2 className="w-4 h-4" />
                        Fechado{' '}
                        {selectedDetails.dataFechamento
                          ? `em ${format(getBrtDate(new Date(selectedDetails.dataFechamento)), 'dd/MM às HH:mm')}`
                          : ''}
                      </p>
                      {profile?.role === 'admin' &&
                        selectedDetails.nome !== 'Todos os Usuários (Média)' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full bg-background/50 hover:bg-background border-green-500/30 text-green-700 hover:text-green-800"
                                disabled={isReopening}
                              >
                                <RotateCcw className="w-3.5 h-3.5 mr-2" />
                                Reabrir Rotina
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Reabrir rotina deste colaborador?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Ao confirmar, o status de fechamento será removido e o colaborador
                                  poderá editar sua rotina novamente dentro da data de hoje.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleReabrirRotina(selectedDetails.usuario_id)}
                                >
                                  Sim, Reabrir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <p className="text-sm text-amber-700 dark:text-amber-400 flex items-center justify-center gap-2 font-semibold">
                        <Clock className="w-4 h-4" />
                        Pendente de Fechamento
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center text-muted-foreground py-12 bg-secondary/20 rounded-xl border border-dashed">
                <FileBarChart className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">Nenhum detalhe disponível.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-3 shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Distribuição de Criticidade</CardTitle>
            <CardDescription>Volume de tarefas por status de execução</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            {chartData.some((d) => d.quantidade > 0) ? (
              <ChartContainer config={chartConfig} className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="name"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      dx={-10}
                      allowDecimals={false}
                    />
                    <ChartTooltip
                      cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                      content={<ChartTooltipContent />}
                    />
                    <Bar dataKey="quantidade" radius={[6, 6, 0, 0]} maxBarSize={60}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-secondary/10 rounded-xl border border-dashed">
                <BarChartIcon className="w-10 h-10 mb-3 opacity-20" />
                <p className="text-sm font-medium">Sem dados para exibir no gráfico</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {espelhoUser && (
        <Dialog open={!!espelhoUser} onOpenChange={(open) => !open && setEspelhoUser(null)}>
          <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden bg-background">
            <DialogHeader className="p-6 pb-4 border-b bg-card">
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                Espelho da Rotina: {espelhoUser.nome}
              </DialogTitle>
              <DialogDescription>
                Visualização em modo leitura. Exibe as tarefas, horários e status conforme o
                colaborador enxerga.
              </DialogDescription>
              <div className="mt-4 flex items-center gap-3 bg-secondary/30 p-2 rounded-md w-fit border border-border/50">
                <Label className="text-sm font-semibold">Data da Rotina:</Label>
                <Input
                  type="date"
                  value={espelhoDate}
                  onChange={(e) => setEspelhoDate(e.target.value)}
                  className="w-auto h-8 text-sm"
                />
              </div>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto bg-muted/10 p-0">
              <RotinaEspelhoContent usuarioId={espelhoUser.id} dateStr={espelhoDate} />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

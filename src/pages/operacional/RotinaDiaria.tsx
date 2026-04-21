import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  XCircle,
  ArrowLeft,
  Loader2,
  ListOrdered,
  Eye,
  Copy,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'

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
}

const timeToMinutes = (time: string | null) => {
  if (!time) return 0
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

const formatTime = (time: string | null) => (time ? time.substring(0, 5) : '')

function ScriptPopover({ text }: { text: string }) {
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
      <PopoverContent className="w-80 p-4" side="bottom" align="start">
        <div className="space-y-3">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            Script / Observação
          </h4>
          <p className="text-sm text-foreground whitespace-pre-wrap bg-muted/50 p-3 rounded-md border border-border/50 max-h-60 overflow-y-auto">
            {text}
          </p>
          <Button onClick={handleCopy} size="sm" className="w-full font-medium" variant="secondary">
            {copied ? (
              <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />
            ) : (
              <Copy className="w-4 h-4 mr-2" />
            )}
            {copied ? 'Copiado!' : 'Copiar Texto'}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
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
  onConfirm: () => Promise<void>
}) {
  const [hasConfirmed, setHasConfirmed] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

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
      if (!t.concluida) {
        notCompleted++
        delays.push({
          id: t.id,
          descricao: t.descricao_tarefa,
          delayStr: 'Não concluída',
          type: 'notCompleted',
        })
      } else {
        if (t.nivel_criticidade === 'no_horario') {
          onTime++
        } else if (t.nivel_criticidade === 'tolerancia') {
          tolerance++
          delays.push({
            id: t.id,
            descricao: t.descricao_tarefa,
            delayStr: `${t.minutos_atrasado} min atrasado`,
            type: 'tolerance',
          })
        } else if (t.nivel_criticidade === 'critico') {
          critical++
          const h = Math.floor(t.minutos_atrasado / 60)
          const m = t.minutos_atrasado % 60
          const timeStr = h > 0 ? `${h}h ${m}min` : `${m} min`
          delays.push({
            id: t.id,
            descricao: t.descricao_tarefa,
            delayStr: `${timeStr} atrasado`,
            type: 'critical',
          })
        }
      }
    })

    return { onTime, tolerance, critical, notCompleted, delays }
  }, [tasks])

  const total = tasks.length

  const handleConfirm = async () => {
    setIsSaving(true)
    await onConfirm()
    setIsSaving(false)
    const dateStr = now.toLocaleDateString('pt-BR')
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    toast.success(`Rotina fechada com sucesso em ${dateStr} às ${timeStr}`)
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          disabled={isSaving}
          className="shrink-0"
        >
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
              disabled={isSaving}
              className="mt-1 w-5 h-5 data-[state=checked]:bg-primary"
            />
            <label
              htmlFor="confirm-closure"
              className={cn(
                'text-base font-medium leading-tight cursor-pointer select-none',
                isSaving && 'opacity-70',
              )}
            >
              Eu confirmo que revisei minha rotina do dia e tomo ciência dos atrasos e não
              conclusões acima.
            </label>
          </div>
        </CardContent>
        <CardFooter className="p-4 bg-muted/30 border-t border-border/50 flex flex-col sm:flex-row justify-end gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            CANCELAR
          </Button>
          <Button
            disabled={!hasConfirmed || isSaving}
            onClick={handleConfirm}
            className="w-full sm:w-auto font-bold tracking-wide"
          >
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            CONFIRMAR FECHAMENTO
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function RotinaDiaria() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [now, setNow] = useState(new Date())
  const [isClosing, setIsClosing] = useState(false)
  const [isClosed, setIsClosed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (user) {
      loadRoutine()
    }
  }, [user])

  const loadRoutine = async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data: routine } = await supabase
        .from('rotinas_usuarios')
        .select('id')
        .eq('usuario_id', user.id)
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

      const today = new Date()
      const currentDayOfWeek = today.getDay()
      const currentDayOfMonth = today.getDate()
      const todayDateStr = today.toISOString().split('T')[0]

      const tarefasFiltradas = tarefas.filter((t) => {
        const p = t.periodicidade || 'diaria'
        if (p === 'diaria') return true
        if (p === 'semanal') {
          return (
            t.dias_semana &&
            Array.isArray(t.dias_semana) &&
            t.dias_semana.includes(currentDayOfWeek)
          )
        }
        if (p === 'mensal') {
          const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
          const targetDay = (t.dia_mes ?? 1) > lastDayOfMonth ? lastDayOfMonth : t.dia_mes
          return targetDay === currentDayOfMonth
        }
        if (p === 'quinzenal') {
          if (!t.data_inicio_contagem) return false
          const [year, month, day] = t.data_inicio_contagem.split('-').map(Number)
          const startDate = new Date(year, month - 1, day)
          const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
          const diffTime = todayDate.getTime() - startDate.getTime()
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

          if (diffDays < 0) return false
          return diffDays % 15 === 0
        }
        return true
      })

      const { data: execucoes } = await supabase
        .from('execucoes_rotina')
        .select('*')
        .eq('usuario_id', user.id)
        .eq('data_execucao', todayDateStr)

      const mergedTasks: Task[] = tarefasFiltradas.map((t) => {
        const exec = execucoes?.find((e) => e.tarefa_id === t.id)
        let concluidaEm = null
        if (exec?.timestamp_conclusao) {
          const d = new Date(exec.timestamp_conclusao)
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

      if (mergedTasks.length > 0 && mergedTasks.some((t) => t.fechamento_confirmado)) {
        setIsClosed(true)
      }
    } finally {
      setLoading(false)
    }
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  const handleCheck = async (taskId: string, checked: boolean) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    const nowTime = new Date()
    const todayDate = nowTime.toISOString().split('T')[0]

    let concluida = checked
    let timestamp_conclusao = null
    let minutos_atrasado = 0
    let nivel_criticidade: any = null

    if (checked) {
      timestamp_conclusao = nowTime.toISOString()

      try {
        const { data: validacao, error: validacaoError } = await supabase.functions.invoke(
          'validar_conclusao_tarefa',
          {
            body: {
              usuario_id: user!.id,
              tarefa_id: taskId,
              timestamp_cliente: timestamp_conclusao,
            },
          },
        )

        if (validacaoError) throw validacaoError

        if (validacao && !validacao.valido) {
          toast.error(validacao.mensagem)
          return
        }
      } catch (err) {
        console.error('Erro ao validar conclusão:', err)
        toast.error('Erro ao validar horário. Tente novamente.')
        return
      }

      try {
        const { data, error } = await supabase.functions.invoke('calcular_criticidade', {
          body: {
            tarefa_id: taskId,
            horario_fim: task.horario_fim,
            timestamp_conclusao,
          },
        })

        if (!error && data) {
          minutos_atrasado = data.minutos_atrasado
          nivel_criticidade = data.nivel_criticidade
        } else {
          // Fallback caso a edge function falhe
          if (!task.horario_fim) {
            minutos_atrasado = 0
            nivel_criticidade = 'no_horario'
          } else {
            const [hFim, mFim] = task.horario_fim.split(':').map(Number)
            const fimDate = new Date(nowTime)
            fimDate.setHours(hFim, mFim, 0, 0)
            minutos_atrasado = Math.max(
              0,
              Math.floor((nowTime.getTime() - fimDate.getTime()) / 60000),
            )
            if (minutos_atrasado <= 0) nivel_criticidade = 'no_horario'
            else if (minutos_atrasado <= 60) nivel_criticidade = 'tolerancia'
            else nivel_criticidade = 'critico'
          }
        }
      } catch (err) {
        console.error('Erro ao calcular criticidade:', err)
        if (!task.horario_fim) {
          minutos_atrasado = 0
          nivel_criticidade = 'no_horario'
        } else {
          const [hFim, mFim] = task.horario_fim.split(':').map(Number)
          const fimDate = new Date(nowTime)
          fimDate.setHours(hFim, mFim, 0, 0)
          minutos_atrasado = Math.max(
            0,
            Math.floor((nowTime.getTime() - fimDate.getTime()) / 60000),
          )
          if (minutos_atrasado <= 0) nivel_criticidade = 'no_horario'
          else if (minutos_atrasado <= 60) nivel_criticidade = 'tolerancia'
          else nivel_criticidade = 'critico'
        }
      }
    }

    let concluidaEm = null
    if (timestamp_conclusao) {
      concluidaEm = `${String(nowTime.getHours()).padStart(2, '0')}:${String(nowTime.getMinutes()).padStart(2, '0')}`
    }

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              concluida,
              concluidaEm,
              minutos_atrasado,
              nivel_criticidade,
            }
          : t,
      ),
    )

    const payload = {
      usuario_id: user!.id,
      data_execucao: todayDate,
      tarefa_id: taskId,
      concluida,
      timestamp_conclusao,
      minutos_atrasado,
      nivel_criticidade,
      fechamento_confirmado: false,
    }

    if (task.execucao_id) {
      await supabase.from('execucoes_rotina').update(payload).eq('id', task.execucao_id)
    } else {
      const { data } = await supabase.from('execucoes_rotina').insert(payload).select().single()
      if (data) {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, execucao_id: data.id } : t)))
      }
    }
  }

  const handleConfirmClosure = async () => {
    const todayDate = now.toISOString().split('T')[0]
    const closedAt = now.toISOString()

    for (const t of tasks) {
      if (t.concluida) {
        if (t.execucao_id) {
          await supabase
            .from('execucoes_rotina')
            .update({
              fechamento_confirmado: true,
              data_fechamento: closedAt,
            })
            .eq('id', t.execucao_id)
        }
      } else {
        if (t.execucao_id) {
          await supabase
            .from('execucoes_rotina')
            .update({
              concluida: false,
              nivel_criticidade: 'nao_concluida',
              fechamento_confirmado: true,
              data_fechamento: closedAt,
            })
            .eq('id', t.execucao_id)
        } else {
          await supabase.from('execucoes_rotina').insert({
            usuario_id: user!.id,
            data_execucao: todayDate,
            tarefa_id: t.id,
            concluida: false,
            minutos_atrasado: 0,
            nivel_criticidade: 'nao_concluida',
            fechamento_confirmado: true,
            data_fechamento: closedAt,
          })
        }
      }
    }

    setIsClosed(true)
    setIsClosing(false)
  }

  const completedCount = tasks.filter((t) => t.concluida).length
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0

  const allTasksHandled =
    tasks.length > 0 &&
    tasks.every((t) => {
      if (t.concluida) return true
      if (!t.horario_fim) return true
      const endMins = timeToMinutes(t.horario_fim)
      return currentMinutes > endMins
    })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium">Carregando rotina diária...</p>
      </div>
    )
  }

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
          onConfirm={handleConfirmClosure}
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

    if (!task.horario_inicio) {
      return (
        <div className="flex items-center text-amber-600 dark:text-amber-400 text-sm font-medium gap-1.5">
          <ListOrdered className="w-4 h-4" />
          <span>Pendente (Sob demanda)</span>
        </div>
      )
    }

    const startMins = timeToMinutes(task.horario_inicio)

    if (currentMinutes < startMins) {
      return (
        <div className="flex items-center text-slate-400 dark:text-slate-500 text-sm gap-1.5">
          <Clock className="w-4 h-4" />
          <span>Disponível a partir de {formatTime(task.horario_inicio)}</span>
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
    }

    return (
      <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium gap-1.5 animate-pulse">
        <Clock className="w-4 h-4" />
        <span>Em andamento</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-4xl space-y-6 animate-fade-in-up">
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

      {tasks.length === 0 ? (
        <Card className="border-border/50 shadow-sm p-12 flex flex-col items-center justify-center text-muted-foreground">
          <Clock className="w-12 h-12 mb-4 opacity-20" />
          <p className="text-lg font-medium">Nenhuma rotina configurada para hoje.</p>
          <p className="text-sm text-center max-w-md mt-1">
            Sua lista de tarefas aparecerá aqui quando for definida pelo administrador em
            Configurações e corresponder à data de hoje.
          </p>
        </Card>
      ) : (
        <>
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

                  const disabled = hasTime && currentMinutes < startMins && !task.concluida

                  return (
                    <div
                      key={task.id}
                      className={cn(
                        'p-4 sm:px-6 flex items-start sm:items-center gap-4 transition-colors hover:bg-muted/30',
                        !isWithinWindow && !task.concluida && 'opacity-80 bg-muted/10',
                        task.concluida && 'bg-emerald-50/30 dark:bg-emerald-950/10',
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

                      <div className="mt-1 sm:mt-0 flex-shrink-0">
                        <Checkbox
                          id={`task-${task.id}`}
                          checked={!!task.concluida}
                          disabled={disabled}
                          onCheckedChange={(checked) => handleCheck(task.id, checked as boolean)}
                          className={cn(
                            'w-5 h-5',
                            task.concluida &&
                              'data-[state=checked]:bg-emerald-500 data-[state=checked]:text-white data-[state=checked]:border-emerald-500',
                          )}
                        />
                      </div>
                      <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            {task.observacao && <ScriptPopover text={task.observacao} />}
                            <label
                              htmlFor={`task-${task.id}`}
                              className={cn(
                                'text-base font-medium leading-tight peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                                !disabled && 'cursor-pointer hover:text-primary',
                                task.concluida && 'line-through text-muted-foreground',
                              )}
                            >
                              {task.descricao_tarefa}
                            </label>
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
                              {task.periodicidade === 'diaria'
                                ? 'Diária'
                                : task.periodicidade === 'semanal'
                                  ? 'Semanal'
                                  : task.periodicidade === 'quinzenal'
                                    ? 'Quinzenal'
                                    : task.periodicidade === 'mensal'
                                      ? 'Mensal'
                                      : 'Diária'}
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
        </>
      )}
    </div>
  )
}

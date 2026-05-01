import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, Lock, AlertTriangle, CalendarOff, CalendarClock, Clock } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { format, parseISO } from 'date-fns'

export default function SmartLock() {
  const [loading, setLoading] = useState(true)
  const [activeAbsences, setActiveAbsences] = useState<any[]>([])
  const [scheduledAbsences, setScheduledAbsences] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const appliesToDate = (absence: any, dateStr: string, dateObj: Date) => {
    if (absence.recorrencia === 'nenhuma' || !absence.recorrencia) {
      return absence.data === dateStr
    }
    if (absence.data > dateStr) return false
    if (absence.data_fim && absence.data_fim < dateStr) return false

    if (absence.recorrencia === 'semanal') {
      const dayOfWeek = dateObj.getDay()
      return (
        absence.dias_semana &&
        Array.isArray(absence.dias_semana) &&
        absence.dias_semana.includes(dayOfWeek)
      )
    }
    if (absence.recorrencia === 'mensal') {
      return absence.dia_mes === dateObj.getDate()
    }
    return false
  }

  const fetchData = async () => {
    try {
      const now = new Date()
      const todayStr = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .split('T')[0]

      const { data: absencesData } = await supabase
        .from('ausencias')
        .select('*, usuarios(nome)')
        .or(`data.gte.${todayStr},recorrencia.in.(semanal,mensal)`)
        .order('data', { ascending: true })

      if (absencesData) {
        const active = absencesData.filter((a) => appliesToDate(a, todayStr, now))
        const scheduled = absencesData.filter(
          (a) =>
            !appliesToDate(a, todayStr, now) &&
            (a.data > todayStr ||
              (a.recorrencia !== 'nenhuma' && (!a.data_fim || a.data_fim > todayStr))),
        )

        setActiveAbsences(active)
        setScheduledAbsences(scheduled)
      }
    } catch (error) {
      toast.error('Erro ao carregar dados do Smart Lock')
    } finally {
      setLoading(false)
    }
  }

  const formatTimeRange = (inicio: string, fim: string) => {
    if (!inicio && !fim) return 'Dia Inteiro'
    return `${inicio?.substring(0, 5) || '--:--'} às ${fim?.substring(0, 5) || '--:--'}`
  }

  const formatRecurrence = (a: any) => {
    if (a.recorrencia === 'semanal') {
      const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
      const s = a.dias_semana?.map((d: number) => dias[d]).join(', ')
      return `Toda semana (${s})`
    }
    if (a.recorrencia === 'mensal') {
      return `Todo dia ${a.dia_mes}`
    }
    return format(parseISO(a.data), 'dd/MM/yyyy')
  }

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    )
  }

  const globalAbsences = activeAbsences.filter((a) => !a.usuario_id)
  const userAbsences = activeAbsences.filter((a) => a.usuario_id)

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-slate-900 p-6 rounded-xl border-l-4 border-amber-500 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-800 rounded-lg">
            <Lock className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white uppercase">SMART LOCK</h1>
            <p className="text-slate-300 mt-1 text-sm uppercase tracking-wider font-medium">
              Painel de Monitoramento de Acessos
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 text-card-foreground shadow-sm">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" /> Status em Tempo Real (Hoje)
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          O Smart Lock monitora ativamente as ausências de hoje. Restrições de dia inteiro bloqueiam
          o acesso, enquanto restrições parciais (por horário) ajustam a geração de rotinas diárias
          para não prejudicar a performance.
        </p>

        {globalAbsences.length > 0 && (
          <Alert
            variant="destructive"
            className="bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-800 dark:text-red-500 mb-6 shadow-sm"
          >
            <AlertTriangle className="h-5 w-5 !text-red-600 dark:!text-red-500" />
            <AlertTitle className="text-base font-bold ml-2">
              SISTEMA COM RESTRIÇÃO (GLOBAL)
            </AlertTitle>
            <AlertDescription className="ml-2 mt-2">
              Hoje possui restrição global no sistema.
              <ul className="list-disc pl-5 mt-3 space-y-2 text-red-700 dark:text-red-400 font-medium">
                {globalAbsences.map((a) => (
                  <li key={a.id}>
                    {a.descricao}{' '}
                    <span className="opacity-75 text-sm font-normal">
                      ({formatTimeRange(a.hora_inicio, a.hora_fim)})
                    </span>
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {userAbsences.length > 0 && (
          <Alert className="bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-500 mb-6 shadow-sm">
            <CalendarOff className="h-5 w-5 !text-amber-600 dark:!text-amber-500" />
            <AlertTitle className="text-base font-bold ml-2">
              AUSÊNCIAS INDIVIDUAIS ATIVAS HOJE
            </AlertTitle>
            <AlertDescription className="ml-2 mt-2 text-amber-700 dark:text-amber-400">
              <ul className="list-disc pl-5 mt-3 space-y-2 font-medium">
                {userAbsences.map((a) => (
                  <li key={a.id}>
                    {a.usuarios?.nome || 'Colaborador'} - {a.descricao}{' '}
                    <span className="opacity-75 text-sm font-normal">
                      ({formatTimeRange(a.hora_inicio, a.hora_fim)})
                    </span>
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {activeAbsences.length === 0 && (
          <Alert className="bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-500 shadow-sm">
            <Lock className="h-5 w-5 !text-emerald-600 dark:!text-emerald-500" />
            <AlertTitle className="text-base font-bold ml-2">SISTEMA OPERACIONAL</AlertTitle>
            <AlertDescription className="ml-2 mt-2 text-emerald-700 dark:text-emerald-400">
              Nenhuma restrição especial (feriados ou ausências) foi detectada para hoje. O sistema
              segue os limites de horário padrão da clínica.
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl p-6 text-card-foreground shadow-sm">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
          <CalendarClock className="w-5 h-5 text-blue-500" /> Ausências Programadas
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Visualização de férias, estágios e compromissos futuros. Estas regras entrarão em vigor
          automaticamente nas datas configuradas.
        </p>

        {scheduledAbsences.length > 0 ? (
          <div className="grid gap-3">
            {scheduledAbsences.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
              >
                <div>
                  <div className="font-semibold text-sm">
                    {a.usuario_id ? a.usuarios?.nome : 'Recesso Global'} - {a.descricao}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                      {formatRecurrence(a)}
                    </span>
                    {(a.hora_inicio || a.hora_fim) && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatTimeRange(a.hora_inicio, a.hora_fim)}
                      </span>
                    )}
                  </div>
                </div>
                {a.recorrencia !== 'nenhuma' && (
                  <div className="text-xs font-medium text-slate-500 border border-slate-200 dark:border-slate-800 px-2 py-1 rounded bg-background">
                    A partir de {format(parseISO(a.data), 'dd/MM/yy')}
                    {a.data_fim && ` até ${format(parseISO(a.data_fim), 'dd/MM/yy')}`}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 border border-dashed border-border rounded-lg text-muted-foreground">
            Nenhuma ausência futura ou recorrente programada no momento.
          </div>
        )}
      </div>
    </div>
  )
}

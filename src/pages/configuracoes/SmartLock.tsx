import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Loader2,
  Lock,
  AlertTriangle,
  CalendarOff,
  CalendarClock,
  Clock,
  Plus,
  Edit2,
  Trash2,
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { format, parseISO, differenceInDays } from 'date-fns'
import { Button } from '@/components/ui/button'
import { AusenciaTemporariaDialog } from '@/components/performance/ausencia-temporaria-dialog'
import { EditarAusenciaDialog } from '@/components/configuracoes/editar-ausencia-dialog'

export default function SmartLock() {
  const [loading, setLoading] = useState(true)
  const [activeAbsences, setActiveAbsences] = useState<any[]>([])
  const [scheduledAbsences, setScheduledAbsences] = useState<any[]>([])
  const [usuarios, setUsuarios] = useState<any[]>([])

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingAbsence, setEditingAbsence] = useState<any>(null)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (!isAddOpen) {
      fetchData()
    }
  }, [isAddOpen])

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

      const { data: usersData } = await supabase
        .from('usuarios')
        .select('id, nome')
        .eq('status', 'ativo')
        .order('nome')
      if (usersData) setUsuarios(usersData)

      const { data: absencesData } = await supabase
        .from('ausencias')
        .select('*, usuarios(nome)')
        .or(`data.gte.${todayStr},recorrencia.in.(semanal,mensal)`)
        .order('data', { ascending: true })

      if (absencesData) {
        const active = absencesData
          .filter((a) => appliesToDate(a, todayStr, now))
          .map((a) => ({ ...a, ids: [a.id] }))
        let scheduled = absencesData.filter(
          (a) =>
            !appliesToDate(a, todayStr, now) &&
            (a.data > todayStr ||
              (a.recorrencia !== 'nenhuma' && (!a.data_fim || a.data_fim > todayStr))),
        )

        const recurring = scheduled
          .filter((a) => a.recorrencia !== 'nenhuma' || !a.data)
          .map((a) => ({ ...a, ids: [a.id] }))
        const nonRecurring = scheduled.filter((a) => a.recorrencia === 'nenhuma' && a.data)

        const grouped = nonRecurring
          .sort((a, b) => {
            const kA = `${a.usuario_id}-${a.descricao}-${a.hora_inicio}-${a.hora_fim}`
            const kB = `${b.usuario_id}-${b.descricao}-${b.hora_inicio}-${b.hora_fim}`
            return kA === kB ? a.data.localeCompare(b.data) : kA.localeCompare(kB)
          })
          .reduce((acc: any[], curr) => {
            const last = acc[acc.length - 1]
            if (
              last &&
              `${last.usuario_id}-${last.descricao}-${last.hora_inicio}-${last.hora_fim}` ===
                `${curr.usuario_id}-${curr.descricao}-${curr.hora_inicio}-${curr.hora_fim}` &&
              differenceInDays(parseISO(curr.data), parseISO(last.data_fim_grouped)) === 1
            ) {
              last.data_fim_grouped = curr.data
              last.ids.push(curr.id)
            } else {
              acc.push({ ...curr, data_fim_grouped: curr.data, ids: [curr.id] })
            }
            return acc
          }, [])

        scheduled = [...grouped, ...recurring].sort((a, b) =>
          (a.data || '').localeCompare(b.data || ''),
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
    if (a.data_fim_grouped && a.data_fim_grouped !== a.data) {
      return `${format(parseISO(a.data), 'dd/MM/yyyy')} a ${format(parseISO(a.data_fim_grouped), 'dd/MM/yyyy')}`
    }
    return format(parseISO(a.data), 'dd/MM/yyyy')
  }

  const handleDelete = async (ids: string[]) => {
    if (!window.confirm('Tem certeza que deseja excluir esta ausência/exceção?')) return
    try {
      const { error } = await supabase.from('ausencias').delete().in('id', ids)
      if (error) throw error
      toast.success('Excluído com sucesso')
      fetchData()
    } catch (e: any) {
      toast.error('Erro ao excluir: ' + e.message)
    }
  }

  const handleEditClick = (absence: any) => {
    setEditingAbsence(absence)
    setIsEditOpen(true)
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
        <Button
          onClick={() => setIsAddOpen(true)}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold whitespace-nowrap w-full md:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" /> Nova Ausência / Exceção
        </Button>
      </div>

      <AusenciaTemporariaDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
      <EditarAusenciaDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        absence={editingAbsence}
        onSuccess={fetchData}
        usuarios={usuarios}
      />

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
                  <li
                    key={a.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-red-200/50 dark:border-red-500/20 pb-2 last:border-0 last:pb-0"
                  >
                    <div>
                      {a.descricao}{' '}
                      <span className="opacity-75 text-sm font-normal">
                        ({formatTimeRange(a.hora_inicio, a.hora_fim)})
                      </span>
                    </div>
                    <div className="flex items-center gap-1 -ml-5 sm:ml-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-700 hover:bg-red-200/50 dark:hover:bg-red-500/20"
                        onClick={() => handleEditClick(a)}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-700 hover:bg-red-200/50 dark:hover:bg-red-500/20"
                        onClick={() => handleDelete(a.ids)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
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
                  <li
                    key={a.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/50 dark:border-amber-500/20 pb-2 last:border-0 last:pb-0"
                  >
                    <div>
                      {a.usuarios?.nome || 'Colaborador'} - {a.descricao}{' '}
                      <span className="opacity-75 text-sm font-normal">
                        ({formatTimeRange(a.hora_inicio, a.hora_fim)})
                      </span>
                    </div>
                    <div className="flex items-center gap-1 -ml-5 sm:ml-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-amber-700 hover:bg-amber-200/50 dark:hover:bg-amber-500/20"
                        onClick={() => handleEditClick(a)}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-amber-700 hover:bg-amber-200/50 dark:hover:bg-amber-500/20"
                        onClick={() => handleDelete(a.ids)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
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
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors gap-4"
              >
                <div>
                  <div className="font-semibold text-sm text-foreground">
                    {a.usuario_id ? a.usuarios?.nome : '🌎 Recesso Global'} - {a.descricao}
                  </div>
                  <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-2 mt-1.5">
                    <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                      {formatRecurrence(a)}
                    </span>
                    {(a.hora_inicio || a.hora_fim) && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-200 dark:bg-slate-800 rounded-full font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {formatTimeRange(a.hora_inicio, a.hora_fim)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {a.recorrencia !== 'nenhuma' && (
                    <div className="text-xs font-medium text-slate-500 border border-slate-200 dark:border-slate-800 px-2 py-1 rounded bg-background whitespace-nowrap">
                      A partir de {format(parseISO(a.data), 'dd/MM/yy')}
                      {a.data_fim && ` até ${format(parseISO(a.data_fim), 'dd/MM/yy')}`}
                    </div>
                  )}
                  <div className="flex items-center gap-1 border-l pl-3 ml-1 border-border/50">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-500 hover:text-primary"
                      onClick={() => handleEditClick(a)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-500 hover:text-destructive"
                      onClick={() => handleDelete(a.ids)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
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

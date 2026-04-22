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
  parseISO,
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

const getBrtDate = (d: Date = new Date()) => {
  return new Date(d.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
}
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
              <span className="text-xl font-bold">{stats.globalPercentual.toFixed(0)}%</span>
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
                    <span className="font-medium">{u.percentual.toFixed(0)}%</span>
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
                    <span className="font-medium">{u.percentual.toFixed(0)}%</span>
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

export default function RelatorioRotinas() {
  const { profile } = useAuth()

  const [userFilter, setUserFilter] = useState('all')
  const [isReopening, setIsReopening] = useState(false)
  const [dateFilter, setDateFilter] = useState('hoje')
  const [cycleFilter, setCycleFilter] = useState('all')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const [usersWithRoutines, setUsersWithRoutines] = useState<any[]>([])
  const [executions, setExecutions] = useState<any[]>([])
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
            id, nome, role
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
            periodicidade
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

      const { data, error } = await query

      if (error) throw error
      setExecutions(data || [])
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
          periodicidade
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
        })
      }
    })

    let filteredUsers = Array.from(usersToDisplay.values())
    if (userFilter !== 'all') {
      filteredUsers = filteredUsers.filter((u) => u.id === userFilter)
    }

    return filteredUsers
      .map((u) => {
        const userExecs = byUser[u.id] || []

        if (userExecs.length === 0) {
          return {
            usuario_id: u.id,
            nome: u.nome,
            percentual: 0,
            isFechado: false,
            dataFechamento: null,
            ultimaAcao: null,
            inatividadeMinutos: -1,
            inatividadeTexto: 'Não iniciado',
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

        const concluidas = userExecs.filter((e) => e.concluida).length
        const tolerancia = userExecs.filter((e) => e.nivel_criticidade === 'tolerancia').length
        const criticas = userExecs.filter((e) => e.nivel_criticidade === 'critico').length
        const naoConcluidas = userExecs.filter((e) => !e.concluida).length
        const noHorario = userExecs.filter((e) => e.nivel_criticidade === 'no_horario').length

        return {
          usuario_id: u.id,
          nome: u.nome,
          percentual,
          isFechado,
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
      .sort((a, b) => b.percentual - a.percentual)
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

    return {
      nome: 'Todos os Usuários (Média)',
      percentual: avgPercent,
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Torre de Comando</h1>
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
                    <TableHead>Última Ação</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ranking.map((r, i) => (
                    <TableRow key={r.usuario_id}>
                      <TableCell className="font-medium">{r.nome}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Progress value={r.percentual} className="w-[80px] h-2.5" />
                          <span className="text-sm font-semibold">{r.percentual.toFixed(1)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-sm flex items-center gap-1.5 ${r.inatividadeMinutos > 120 ? 'text-red-500 font-semibold' : 'text-muted-foreground'}`}
                        >
                          {r.inatividadeMinutos > 120 && <AlertTriangle className="w-3.5 h-3.5" />}
                          {r.inatividadeTexto}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {r.isFechado ? (
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
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
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
                  <span className="text-5xl font-black text-primary drop-shadow-sm">
                    {selectedDetails.percentual.toFixed(1)}%
                  </span>
                  <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mt-2">
                    Conclusão Final
                  </span>
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
    </div>
  )
}

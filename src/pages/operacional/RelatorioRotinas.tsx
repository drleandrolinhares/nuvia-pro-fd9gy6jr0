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
import { format, subDays, startOfMonth, endOfMonth, startOfDay, endOfDay, parseISO } from 'date-fns'
import {
  CheckCircle2,
  Clock,
  Filter,
  Loader2,
  FileBarChart,
  BarChart as BarChartIcon,
  Activity,
  AlertTriangle,
} from 'lucide-react'

const chartConfig = {
  quantidade: {
    label: 'Quantidade',
    color: 'hsl(var(--primary))',
  },
}

export default function RelatorioRotinas() {
  const { profile } = useAuth()

  const [userFilter, setUserFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('hoje')
  const [cycleFilter, setCycleFilter] = useState('all')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const [usersWithRoutines, setUsersWithRoutines] = useState<any[]>([])
  const [executions, setExecutions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isLive, setIsLive] = useState(true)

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
      let startD = new Date()
      let endD = new Date()

      if (dateFilter === 'hoje') {
        startD = startOfDay(new Date())
        endD = endOfDay(new Date())
      } else if (dateFilter === '7dias') {
        startD = startOfDay(subDays(new Date(), 7))
        endD = endOfDay(new Date())
      } else if (dateFilter === 'mes') {
        startD = startOfMonth(new Date())
        endD = endOfMonth(new Date())
      } else if (dateFilter === 'custom') {
        if (!customStart || !customEnd) {
          setLoading(false)
          return
        }
        startD = startOfDay(parseISO(customStart))
        endD = endOfDay(parseISO(customEnd))
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
        .gte('data_execucao', format(startD, 'yyyy-MM-dd'))
        .lte('data_execucao', format(endD, 'yyyy-MM-dd'))

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

  useEffect(() => {
    fetchExecutions()
  }, [fetchExecutions])

  useEffect(() => {
    if (!isLive) return
    const channel = supabase
      .channel('realtime_execucoes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'execucoes_rotina' }, () => {
        fetchExecutions()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchExecutions, isLive])

  const ranking = useMemo(() => {
    const byUser: Record<string, any[]> = {}
    executions.forEach((e) => {
      if (!byUser[e.usuario_id]) byUser[e.usuario_id] = []
      byUser[e.usuario_id].push(e)
    })

    return Object.values(byUser)
      .map((userExecs) => {
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

        const userObj = Array.isArray(userExecs[0].usuarios)
          ? userExecs[0].usuarios[0]
          : userExecs[0].usuarios

        return {
          usuario_id: userExecs[0].usuario_id,
          nome: userObj?.nome || 'Desconhecido',
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
  }, [executions])

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
                          <Badge
                            variant="outline"
                            className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-200 gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" /> Fechado
                          </Badge>
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
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <p className="text-sm text-green-700 dark:text-green-400 flex items-center justify-center gap-2 font-semibold">
                        <CheckCircle2 className="w-4 h-4" />
                        Fechado{' '}
                        {selectedDetails.dataFechamento
                          ? `em ${format(new Date(selectedDetails.dataFechamento), 'dd/MM HH:mm')}`
                          : ''}
                      </p>
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

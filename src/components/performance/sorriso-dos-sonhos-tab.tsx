import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Checkbox } from '@/components/ui/checkbox'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  Search,
  Plus,
  CheckCircle2,
  Users,
  Trophy,
  DollarSign,
  Loader2,
  Settings,
  Trash2,
  Filter,
} from 'lucide-react'
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval, parseISO } from 'date-fns'

export function SorrisoDosSonhosTab() {
  const [indicacoes, setIndicacoes] = useState<any[]>([])
  const [pacientes, setPacientes] = useState<any[]>([])
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [config, setConfig] = useState({
    id: '',
    valor_bonus: 100,
    meta_indicacoes: 2,
    usuarios_elegiveis: [] as string[],
  })
  const [loading, setLoading] = useState(true)

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false)
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Selections
  const [selectedIndicacao, setSelectedIndicacao] = useState<any>(null)
  const [indicacaoToDelete, setIndicacaoToDelete] = useState<any>(null)
  const [confirmClose, setConfirmClose] = useState(false)

  // Filters
  const [search, setSearch] = useState('')
  const [colaboradorFilter, setColaboradorFilter] = useState('todos')
  const [periodFilter, setPeriodFilter] = useState('todos')

  const { toast } = useToast()
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'

  // Forms
  const [pacienteId, setPacienteId] = useState('')
  const [nomeIndicado, setNomeIndicado] = useState('')
  const [telefoneIndicado, setTelefoneIndicado] = useState('')
  const [colaboradorId, setColaboradorId] = useState('')
  const [editConfig, setEditConfig] = useState({
    valor_bonus: 100,
    meta_indicacoes: 2,
    usuarios_elegiveis: [] as string[],
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      if (isAdmin) {
        const currentMonth = format(new Date(), 'yyyy-MM')
        const prevMonth = format(subMonths(new Date(), 1), 'yyyy-MM')
        supabase.rpc('gerar_adiantamento_mes_sorriso' as any, { p_mes: currentMonth }).then()
        supabase.rpc('processar_fechamento_mes_sorriso' as any, { p_mes: prevMonth }).then()
      }

      const [indRes, pacRes, usuRes, configRes] = await Promise.all([
        supabase
          .from('sorriso_dos_sonhos_indicacoes' as any)
          .select(
            `*, paciente:pacientes!paciente_indicador_id(nome), colaborador:usuarios!colaborador_id(nome)`,
          )
          .order('criado_em', { ascending: false }),
        supabase.from('pacientes').select('id, nome').order('nome'),
        supabase.from('usuarios').select('id, nome').eq('status', 'ativo').order('nome'),
        supabase
          .from('sorriso_dos_sonhos_config' as any)
          .select('*')
          .limit(1)
          .maybeSingle(),
      ])

      if (indRes.error && indRes.error.code !== '42P01') throw indRes.error

      setIndicacoes(indRes.data || [])
      setPacientes(pacRes.data || [])
      setUsuarios(usuRes.data || [])

      if (configRes.data) {
        setConfig({
          ...configRes.data,
          usuarios_elegiveis: configRes.data.usuarios_elegiveis || [],
        })
        setEditConfig({
          valor_bonus: configRes.data.valor_bonus,
          meta_indicacoes: configRes.data.meta_indicacoes,
          usuarios_elegiveis: configRes.data.usuarios_elegiveis || [],
        })
      }
    } catch (error: any) {
      if (error.code !== '42P01')
        toast({ title: 'Erro ao carregar', description: error.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAdd = async () => {
    if (!pacienteId || !nomeIndicado || !colaboradorId)
      return toast({ title: 'Preencha os campos obrigatórios', variant: 'destructive' })
    try {
      await supabase.from('sorriso_dos_sonhos_indicacoes' as any).insert({
        paciente_indicador_id: pacienteId,
        nome_indicado: nomeIndicado,
        telefone_indicado: telefoneIndicado,
        colaborador_id: colaboradorId,
        status: 'pendente',
      })
      toast({ title: 'Indicação registrada com sucesso!' })
      setIsAddModalOpen(false)
      setPacienteId('')
      setNomeIndicado('')
      setTelefoneIndicado('')
      setColaboradorId('')
      fetchData()
    } catch (error: any) {
      toast({ title: 'Erro ao registrar', description: error.message, variant: 'destructive' })
    }
  }

  const handleClose = async () => {
    if (!selectedIndicacao || !confirmClose) return
    try {
      await supabase
        .from('sorriso_dos_sonhos_indicacoes' as any)
        .update({
          status: 'fechado',
          data_fechamento: new Date().toISOString().split('T')[0],
        })
        .eq('id', selectedIndicacao.id)
      toast({ title: 'Indicação fechada com sucesso!' })
      setIsCloseModalOpen(false)
      setSelectedIndicacao(null)
      setConfirmClose(false)
      fetchData()
    } catch (error: any) {
      toast({ title: 'Erro ao fechar', description: error.message, variant: 'destructive' })
    }
  }

  const handleDelete = async () => {
    if (!indicacaoToDelete) return
    try {
      await supabase
        .from('sorriso_dos_sonhos_indicacoes' as any)
        .delete()
        .eq('id', indicacaoToDelete.id)
      toast({ title: 'Indicação excluída' })
      setIsDeleteModalOpen(false)
      setIndicacaoToDelete(null)
      fetchData()
    } catch (error: any) {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' })
    }
  }

  const handleSaveConfig = async () => {
    try {
      if (config.id) {
        await supabase
          .from('sorriso_dos_sonhos_config' as any)
          .update(editConfig)
          .eq('id', config.id)
      } else {
        await supabase.from('sorriso_dos_sonhos_config' as any).insert(editConfig)
      }
      toast({ title: 'Configurações salvas' })
      setIsConfigModalOpen(false)
      fetchData()
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar configurações',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  // Filtering
  const filteredData = useMemo(() => {
    let data = indicacoes
    if (periodFilter === 'este_mes') {
      const start = startOfMonth(new Date())
      const end = endOfMonth(new Date())
      data = data.filter((i) => isWithinInterval(parseISO(i.criado_em), { start, end }))
    } else if (periodFilter === 'mes_passado') {
      const start = startOfMonth(subMonths(new Date(), 1))
      const end = endOfMonth(subMonths(new Date(), 1))
      data = data.filter((i) => isWithinInterval(parseISO(i.criado_em), { start, end }))
    }
    if (colaboradorFilter !== 'todos') {
      data = data.filter((i) => i.colaborador_id === colaboradorFilter)
    }
    if (search) {
      data = data.filter(
        (i) =>
          i.nome_indicado?.toLowerCase().includes(search.toLowerCase()) ||
          i.paciente?.nome?.toLowerCase().includes(search.toLowerCase()),
      )
    }
    return data
  }, [indicacoes, periodFilter, colaboradorFilter, search])

  // KPIs
  const totais = filteredData.length
  const fechadas = filteredData.filter((i) => i.status === 'fechado').length
  const fechadasPorColab = filteredData
    .filter((i) => i.status === 'fechado')
    .filter((i) => !config.id || config.usuarios_elegiveis?.includes(i.colaborador_id))
    .reduce(
      (acc, curr) => {
        if (curr.colaborador_id) acc[curr.colaborador_id] = (acc[curr.colaborador_id] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
  const bonusTotal = Object.values(fechadasPorColab).reduce(
    (sum, count) => sum + Math.floor(count / config.meta_indicacoes) * config.valor_bonus,
    0,
  )

  // Chart Data
  const chartData = useMemo(() => {
    const elegiveis = !config.id
      ? usuarios
      : usuarios.filter((u) => config.usuarios_elegiveis?.includes(u.id))

    return elegiveis
      .map((u) => {
        const userInds = (
          periodFilter !== 'todos'
            ? indicacoes.filter((i) => {
                const d = parseISO(i.criado_em)
                const s =
                  periodFilter === 'este_mes'
                    ? startOfMonth(new Date())
                    : startOfMonth(subMonths(new Date(), 1))
                const e =
                  periodFilter === 'este_mes'
                    ? endOfMonth(new Date())
                    : endOfMonth(subMonths(new Date(), 1))
                return isWithinInterval(d, { start: s, end: e })
              })
            : indicacoes
        ).filter((i) => i.colaborador_id === u.id)

        const indicadas = userInds.length
        const concluidas = userInds.filter((i) => i.status === 'fechado').length
        return { name: u.nome.split(' ')[0], indicadas, fechadas: concluidas }
      })
      .filter((d) => d.indicadas > 0)
      .sort((a, b) => b.fechadas - a.fechadas)
  }, [usuarios, indicacoes, periodFilter])

  return (
    <div className="space-y-6">
      {/* Top Bar with Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white/50 p-4 rounded-lg border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700">Filtros:</span>
        </div>
        <Select value={colaboradorFilter} onValueChange={setColaboradorFilter}>
          <SelectTrigger className="w-[200px] bg-white">
            <SelectValue placeholder="Colaborador" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os colaboradores</SelectItem>
            {usuarios.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={periodFilter} onValueChange={setPeriodFilter}>
          <SelectTrigger className="w-[180px] bg-white">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todo o período</SelectItem>
            <SelectItem value="este_mes">Este mês</SelectItem>
            <SelectItem value="mes_passado">Mês passado</SelectItem>
          </SelectContent>
        </Select>

        {isAdmin && (
          <Dialog open={isConfigModalOpen} onOpenChange={setIsConfigModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="ml-auto bg-white">
                <Settings className="h-4 w-4 mr-2" /> Regras do Bônus
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configurar Regras de Premiação</DialogTitle>
                <DialogDescription>
                  Ajuste os valores e metas para a bonificação da equipe.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Valor do Bônus (R$)</Label>
                  <Input
                    type="number"
                    value={editConfig.valor_bonus}
                    onChange={(e) =>
                      setEditConfig((p) => ({ ...p, valor_bonus: Number(e.target.value) }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>A cada quantas indicações fechadas?</Label>
                  <Input
                    type="number"
                    value={editConfig.meta_indicacoes}
                    onChange={(e) =>
                      setEditConfig((p) => ({ ...p, meta_indicacoes: Number(e.target.value) }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Usuários Elegíveis para a Campanha</Label>
                  <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-3 bg-slate-50/50">
                    {usuarios.map((u) => (
                      <div key={u.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`user-${u.id}`}
                          checked={editConfig.usuarios_elegiveis.includes(u.id)}
                          onCheckedChange={(checked) => {
                            setEditConfig((prev) => ({
                              ...prev,
                              usuarios_elegiveis: checked
                                ? [...prev.usuarios_elegiveis, u.id]
                                : prev.usuarios_elegiveis.filter((id) => id !== u.id),
                            }))
                          }}
                        />
                        <label
                          htmlFor={`user-${u.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {u.nome}
                        </label>
                      </div>
                    ))}
                    {usuarios.length === 0 && (
                      <span className="text-sm text-slate-500">Nenhum colaborador encontrado.</span>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsConfigModalOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                  onClick={handleSaveConfig}
                >
                  Salvar Regras
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-sm bg-white/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total de Indicações
            </CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{totais}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Indicações Fechadas
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{fechadas}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Bônus Gerado (Total)
            </CardTitle>
            <Trophy className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              R$ {bonusTotal.toFixed(2).replace('.', ',')}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              R${config.valor_bonus} a cada {config.meta_indicacoes} fechadas (Inclui R$ 200
              antecipados)
            </p>
          </CardContent>
        </Card>
      </div>

      {colaboradorFilter === 'todos' && chartData.length > 0 && (
        <Card className="border-none shadow-sm bg-white/70">
          <CardHeader>
            <CardTitle className="text-lg">Desempenho Individual da Equipe</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                indicadas: { label: 'Indicações', color: '#f59e0b' },
                fechadas: { label: 'Fechadas', color: '#10b981' },
              }}
            >
              <BarChart data={chartData} height={250}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="indicadas" fill="var(--color-indicadas)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fechadas" fill="var(--color-fechadas)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      <Card className="border-none shadow-sm bg-white/70">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6">
          <CardTitle className="text-xl">Controle de Indicações</CardTitle>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Buscar indicação..."
                className="pl-8 bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                  <Plus className="h-4 w-4 mr-2" /> Nova Indicação
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Nova Indicação</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>
                      Paciente Indicador <span className="text-red-500">*</span>
                    </Label>
                    <Select value={pacienteId} onValueChange={setPacienteId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {pacientes.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>
                      Nome do Indicado <span className="text-red-500">*</span>
                    </Label>
                    <Input value={nomeIndicado} onChange={(e) => setNomeIndicado(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label>
                      Colaborador Responsável <span className="text-red-500">*</span>
                    </Label>
                    <Select value={colaboradorId} onValueChange={setColaboradorId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {usuarios.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button className="bg-amber-500 text-white" onClick={handleAdd}>
                    Salvar Registro
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Indicador</TableHead>
                  <TableHead>Indicado</TableHead>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-500 h-32">
                      Nenhuma indicação encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((ind) => (
                    <TableRow key={ind.id}>
                      <TableCell className="text-slate-600">
                        {format(new Date(ind.criado_em), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">
                        {ind.paciente?.nome}
                      </TableCell>
                      <TableCell className="font-medium text-slate-700">
                        {ind.nome_indicado}
                      </TableCell>
                      <TableCell className="text-slate-600">{ind.colaborador?.nome}</TableCell>
                      <TableCell>
                        {ind.status === 'pendente' ? (
                          <Badge
                            variant="outline"
                            className="bg-amber-50 text-amber-600 border-amber-200"
                          >
                            Pendente
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-emerald-50 text-emerald-600 border-emerald-200"
                          >
                            Fechado
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-2">
                          {ind.status === 'pendente' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              onClick={() => {
                                setSelectedIndicacao(ind)
                                setIsCloseModalOpen(true)
                                setConfirmClose(false)
                              }}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" /> Fechar
                            </Button>
                          )}
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                setIndicacaoToDelete(ind)
                                setIsDeleteModalOpen(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCloseModalOpen} onOpenChange={setIsCloseModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Fechamento</DialogTitle>
            <DialogDescription>
              Marcar tratamento como fechado para{' '}
              <strong>{selectedIndicacao?.nome_indicado}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center space-x-2 rounded-md border border-amber-200 bg-amber-50 p-4">
              <Checkbox
                id="confirm"
                checked={confirmClose}
                onCheckedChange={(c) => setConfirmClose(c as boolean)}
              />
              <label
                htmlFor="confirm"
                className="text-sm font-medium leading-none text-amber-900 cursor-pointer"
              >
                Ação Dupla: Confirmo que o tratamento foi efetivamente fechado no sistema.
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCloseModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-emerald-600 text-white"
              disabled={!confirmClose}
              onClick={handleClose}
            >
              Confirmar Fechamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Indicação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza? Esta ação não pode ser desfeita. A indicação de{' '}
              <strong>{indicacaoToDelete?.nome_indicado}</strong> será removida permanentemente do
              sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDelete}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

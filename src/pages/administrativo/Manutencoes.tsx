import { useCallback, useEffect, useMemo, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Wrench,
  Plus,
  AlertTriangle,
  CalendarClock,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Search,
  Loader2,
  Building2,
  Boxes,
  ClipboardList,
  ShieldCheck,
  Trash2,
  Pencil,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Layers,
} from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import {
  CATEGORIAS,
  alertas,
  custoPorAtivo,
  custoPorSetor,
  diasAte,
  excluirOrdem,
  fmtBRL,
  fmtData,
  kpis,
  listarAtivos,
  listarFornecedores,
  listarOrdens,
  listarSetores,
  planosReferencia,
  salvarAtivo,
  salvarFornecedor,
  salvarOrdem,
  salvarSetor,
  excluirSetor,
  reordenarSetores,
  serieMensal,
  ROTULO_SETOR,
  ROTULO_PRIORIDADE,
  ROTULO_STATUS,
  ROTULO_STATUS_ATIVO,
  ROTULO_TIPO,
  type Ativo,
  type Fornecedor,
  type Kpis,
  type Ordem,
  type Setor,
} from '@/services/manutencao'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/* ========================================================================== */

const vazioAtivo = (): Partial<Ativo> => ({
  nome: '',
  categoria: 'Odontológico',
  criticidade: 'media',
  status: 'operando',
  ativo: true,
})

const vazioOrdem = (): Partial<Ordem> => ({
  tipo: 'preventiva',
  prioridade: 'media',
  status: 'aberta',
  data_abertura: new Date().toISOString().slice(0, 10),
  pago: false,
  tem_garantia: false,
})

function KpiCard({
  titulo,
  valor,
  sub,
  icon: Icon,
  cor = 'text-foreground',
  alerta,
}: {
  titulo: string
  valor: string
  sub?: string
  icon: any
  cor?: string
  alerta?: boolean
}) {
  return (
    <Card className={`border ${alerta ? 'border-red-500/40' : 'border-border'}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
        <CardTitle className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {titulo}
        </CardTitle>
        <Icon className={`size-4 ${alerta ? 'text-red-500' : 'text-muted-foreground'}`} />
      </CardHeader>
      <CardContent className="pb-3">
        <div className={`text-xl font-bold leading-tight ${cor}`}>{valor}</div>
        {sub && <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  )
}

function Barra({ valor, max, cor }: { valor: number; max: number; cor: string }) {
  const pct = max > 0 ? Math.max(2, Math.round((valor / max) * 100)) : 0
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div className={`h-full rounded-full ${cor}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

/* ========================================================================== */

export default function Manutencoes() {
  const { toast } = useToast()
  const { hasPermission } = useAuth()

  const podeGerenciarAtivos = hasPermission('Gerenciar Ativos de Manutenção')
  const podeGerenciarOrdens = hasPermission('Gerenciar Ordens de Manutenção')
  const podeExcluir = hasPermission('Excluir Ordem de Manutenção')
  const podeVerCustos = hasPermission('Ver Custos de Manutenção')

  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [aba, setAba] = useState('painel')

  const [setores, setSetores] = useState<Setor[]>([])
  const [ativos, setAtivos] = useState<Ativo[]>([])
  const [ordens, setOrdens] = useState<Ordem[]>([])
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [kpi, setKpi] = useState<Kpis | null>(null)
  const [porSetor, setPorSetor] = useState<Awaited<ReturnType<typeof custoPorSetor>>>([])
  const [porAtivo, setPorAtivo] = useState<Awaited<ReturnType<typeof custoPorAtivo>>>([])
  const [serie, setSerie] = useState<Awaited<ReturnType<typeof serieMensal>>>([])
  const [avisos, setAvisos] = useState<Awaited<ReturnType<typeof alertas>>>([])
  const [planos, setPlanos] = useState<any[]>([])

  const [mes, setMes] = useState(() => format(new Date(), 'yyyy-MM'))
  const [busca, setBusca] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [filtroStatus, setFiltroStatus] = useState('todos')

  const [modalAtivo, setModalAtivo] = useState<Partial<Ativo> | null>(null)
  const [modalOrdem, setModalOrdem] = useState<Partial<Ordem> | null>(null)
  const [modalFornecedor, setModalFornecedor] = useState<Partial<Fornecedor> | null>(null)
  const [modalSetor, setModalSetor] = useState<Partial<Setor> | null>(null)

  const inicio = useMemo(() => {
    const [a, m] = mes.split('-').map(Number)
    return format(startOfMonth(new Date(a, m - 1, 1)), 'yyyy-MM-dd')
  }, [mes])
  const fim = useMemo(() => {
    const [a, m] = mes.split('-').map(Number)
    return format(endOfMonth(new Date(a, m - 1, 1)), 'yyyy-MM-dd')
  }, [mes])

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const [s, a, o, f, k, ps, pa, sm, al, pl] = await Promise.all([
        listarSetores(),
        listarAtivos(),
        listarOrdens(),
        listarFornecedores(),
        kpis(inicio, fim),
        custoPorSetor(inicio, fim),
        custoPorAtivo(inicio, fim),
        serieMensal(12),
        alertas(),
        planosReferencia(),
      ])
      setSetores(s)
      setAtivos(a)
      setOrdens(o)
      setFornecedores(f)
      setKpi(k)
      setPorSetor(ps)
      setPorAtivo(pa)
      setSerie(sm)
      setAvisos(al)
      setPlanos(pl)
    } catch (e: any) {
      toast({
        title: 'Erro ao carregar manutenções',
        description: e?.message ?? 'Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setCarregando(false)
    }
  }, [inicio, fim, toast])

  useEffect(() => {
    carregar()
  }, [carregar])

  const ordensFiltradas = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return ordens.filter((o) => {
      if (filtroTipo !== 'todos' && o.tipo !== filtroTipo) return false
      if (filtroStatus !== 'todos' && o.status !== filtroStatus) return false
      if (!q) return true
      return (
        (o.ativo_nome || '').toLowerCase().includes(q) ||
        (o.setor_nome || '').toLowerCase().includes(q) ||
        (o.descricao_problema || '').toLowerCase().includes(q) ||
        (o.fornecedor_nome || '').toLowerCase().includes(q) ||
        String(o.numero ?? '').includes(q)
      )
    })
  }, [ordens, busca, filtroTipo, filtroStatus])

  // dropdowns só com setor ativo; contagem de equipamentos por setor
  const setoresAtivos = useMemo(() => setores.filter((s) => s.ativo), [setores])

  const setoresComContagem = useMemo(() => {
    const mapa = new Map<string, number>()
    for (const a of ativos) {
      if (a.setor_id) mapa.set(a.setor_id, (mapa.get(a.setor_id) ?? 0) + 1)
    }
    return setores.map((s) => ({ ...s, qtd_ativos: mapa.get(s.id) ?? 0 }))
  }, [setores, ativos])

  const maxSetor = Math.max(...porSetor.map((s) => s.custo), 1)
  const maxSerie = Math.max(...serie.map((s) => s.custo), 1)

  const totalCustoSetores = porSetor.reduce((a, s) => a + s.custo, 0)

  const mesesOptions = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => {
        const d = subMonths(new Date(), i)
        return { value: format(d, 'yyyy-MM'), label: format(d, 'MMMM yyyy', { locale: ptBR }) }
      }),
    [],
  )

  /* ---------------------------- gravações ---------------------------- */

  const gravarAtivo = async () => {
    if (!modalAtivo?.nome?.trim()) {
      toast({ title: 'Informe o nome do equipamento', variant: 'destructive' })
      return
    }
    setSalvando(true)
    try {
      await salvarAtivo(modalAtivo)
      toast({ title: 'Equipamento salvo' })
      setModalAtivo(null)
      carregar()
    } catch (e: any) {
      toast({ title: 'Erro ao salvar', description: e?.message, variant: 'destructive' })
    } finally {
      setSalvando(false)
    }
  }

  const gravarOrdem = async () => {
    if (!modalOrdem?.ativo_id) {
      toast({ title: 'Selecione o equipamento', variant: 'destructive' })
      return
    }
    setSalvando(true)
    try {
      const payload: any = { ...modalOrdem }
      if (payload.data_mao_obra) delete payload.data_mao_obra
      await salvarOrdem(payload)
      toast({ title: 'Ordem salva' })
      setModalOrdem(null)
      carregar()
    } catch (e: any) {
      toast({ title: 'Erro ao salvar', description: e?.message, variant: 'destructive' })
    } finally {
      setSalvando(false)
    }
  }

  const concluirOrdem = async (o: Ordem) => {
    setSalvando(true)
    try {
      await salvarOrdem({
        id: o.id,
        status: 'concluida',
        data_conclusao: new Date().toISOString().slice(0, 10),
      } as Partial<Ordem>)
      toast({ title: `Ordem ${o.numero ?? ''} concluída` })
      carregar()
    } catch (e: any) {
      toast({ title: 'Erro ao concluir', description: e?.message, variant: 'destructive' })
    } finally {
      setSalvando(false)
    }
  }

  const apagarOrdem = async (o: Ordem) => {
    if (!confirm(`Apagar definitivamente a ordem ${o.numero ?? ''}?`)) return
    try {
      await excluirOrdem(o.id)
      toast({ title: 'Ordem apagada' })
      carregar()
    } catch (e: any) {
      toast({ title: 'Erro ao apagar', description: e?.message, variant: 'destructive' })
    }
  }

  const gravarSetor = async () => {
    if (!modalSetor?.nome?.trim()) {
      toast({ title: 'Informe o nome do setor', variant: 'destructive' })
      return
    }
    setSalvando(true)
    try {
      await salvarSetor({ ativo: true, ...modalSetor })
      toast({ title: 'Setor salvo' })
      setModalSetor(null)
      carregar()
    } catch (e: any) {
      const dup = String(e?.message || '').includes('duplicate')
      toast({
        title: dup ? 'Já existe um setor com esse nome' : 'Erro ao salvar setor',
        description: dup ? 'Escolha um nome diferente.' : e?.message,
        variant: 'destructive',
      })
    } finally {
      setSalvando(false)
    }
  }

  const alternarSetor = async (s: Setor) => {
    try {
      await salvarSetor({ id: s.id, ativo: !s.ativo })
      toast({ title: s.ativo ? `"${s.nome}" desativado` : `"${s.nome}" reativado` })
      carregar()
    } catch (e: any) {
      toast({ title: 'Erro', description: e?.message, variant: 'destructive' })
    }
  }

  const apagarSetor = async (s: Setor) => {
    if (!confirm(`Excluir definitivamente o setor "${s.nome}"?`)) return
    try {
      await excluirSetor(s.id)
      toast({ title: 'Setor excluído' })
      carregar()
    } catch (e: any) {
      toast({ title: 'Não foi possível excluir', description: e?.message, variant: 'destructive' })
    }
  }

  const moverSetor = async (idx: number, dir: -1 | 1) => {
    const alvo = idx + dir
    if (alvo < 0 || alvo >= setores.length) return
    const lista = [...setores]
    const tmp = lista[idx]
    lista[idx] = lista[alvo]
    lista[alvo] = tmp
    const comOrdem = lista.map((s, i) => ({ ...s, ordem: i + 1 }))
    setSetores(comOrdem)
    try {
      await reordenarSetores(comOrdem.map((s) => s.id))
    } catch (e: any) {
      toast({ title: 'Erro ao reordenar', description: e?.message, variant: 'destructive' })
      carregar()
    }
  }

  const gravarFornecedor = async () => {
    if (!modalFornecedor?.nome?.trim()) {
      toast({ title: 'Informe o nome do fornecedor', variant: 'destructive' })
      return
    }
    setSalvando(true)
    try {
      await salvarFornecedor({ ativo: true, ...modalFornecedor })
      toast({ title: 'Fornecedor salvo' })
      setModalFornecedor(null)
      carregar()
    } catch (e: any) {
      toast({ title: 'Erro ao salvar', description: e?.message, variant: 'destructive' })
    } finally {
      setSalvando(false)
    }
  }

  /* ------------------------------ render ------------------------------ */

  const badgeTipo = (t: string) =>
    t === 'preventiva'
      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600'
      : t === 'corretiva'
        ? 'border-amber-500/40 bg-amber-500/10 text-amber-700'
        : 'border-slate-400/40 bg-slate-500/10 text-slate-600'

  const badgeStatus = (s: string) =>
    s === 'concluida'
      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600'
      : s === 'cancelada'
        ? 'border-slate-400/40 bg-slate-500/10 text-slate-500'
        : s === 'em_execucao'
          ? 'border-blue-500/40 bg-blue-500/10 text-blue-600'
          : 'border-amber-500/40 bg-amber-500/10 text-amber-700'

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Manutenções"
        description="Equipamentos, preventivas, corretivas, custos por setor e previsão do que vem."
        icon={Wrench}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Select value={mes} onValueChange={setMes}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mesesOptions.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {podeGerenciarOrdens && (
              <Button onClick={() => setModalOrdem(vazioOrdem())} className="gap-1.5">
                <Plus className="size-4" /> Nova ordem
              </Button>
            )}
          </div>
        }
      />

      {carregando ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-7 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* ---------------- KPIs ---------------- */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              titulo="Gasto no período"
              valor={podeVerCustos ? fmtBRL(kpi?.custo_total) : '—'}
              sub={`${kpi?.ordens_total ?? 0} ordens · média ${fmtBRL(kpi?.custo_medio_ordem)}`}
              icon={DollarSign}
            />
            <KpiCard
              titulo="Preventivas atrasadas"
              valor={String(kpi?.preventivas_atrasadas ?? 0)}
              sub={`${kpi?.preventivas_30d ?? 0} vencem em 30 dias`}
              icon={CalendarClock}
              cor={kpi?.preventivas_atrasadas ? 'text-red-600' : 'text-foreground'}
              alerta={(kpi?.preventivas_atrasadas ?? 0) > 0}
            />
            <KpiCard
              titulo="Corretiva vs preventiva"
              valor={`${kpi?.aderencia_preventiva ?? 0}%`}
              sub={`${kpi?.ordens_preventiva ?? 0} preventivas · ${kpi?.ordens_corretiva ?? 0} corretivas`}
              icon={(kpi?.aderencia_preventiva ?? 0) >= 60 ? TrendingUp : TrendingDown}
              cor={(kpi?.aderencia_preventiva ?? 0) >= 60 ? 'text-emerald-600' : 'text-amber-700'}
            />
            <KpiCard
              titulo="Equipamentos"
              valor={String(kpi?.ativos_total ?? 0)}
              sub={`${kpi?.ativos_criticos ?? 0} de criticidade alta · MTTR ${kpi?.mttr_dias ?? 0}d`}
              icon={Boxes}
            />
          </div>

          <Tabs value={aba} onValueChange={setAba} className="w-full">
            <TabsList className="grid w-full grid-cols-5 max-w-3xl h-auto">
              <TabsTrigger value="painel">Painel</TabsTrigger>
              <TabsTrigger value="ordens">Ordens</TabsTrigger>
              <TabsTrigger value="ativos">Equipamentos</TabsTrigger>
              <TabsTrigger value="setores">Setores</TabsTrigger>
              <TabsTrigger value="planos">Planos</TabsTrigger>
            </TabsList>

            {/* ================= PAINEL ================= */}
            <TabsContent value="painel" className="mt-6 space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">
                      Gasto por setor —{' '}
                      {format(new Date(inicio + 'T12:00:00'), 'MMMM yyyy', { locale: ptBR })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2.5">
                    {porSetor.length === 0 && (
                      <p className="py-6 text-center text-sm text-muted-foreground">
                        Nenhuma ordem concluída neste período.
                      </p>
                    )}
                    {porSetor.slice(0, 10).map((s) => (
                      <div key={s.setor} className="space-y-1">
                        <div className="flex items-baseline justify-between gap-2 text-[12.5px]">
                          <span className="truncate font-medium text-foreground">{s.setor}</span>
                          <span className="shrink-0 tabular-nums font-semibold">
                            {podeVerCustos ? fmtBRL(s.custo) : '—'}
                          </span>
                        </div>
                        <Barra
                          valor={s.custo}
                          max={maxSetor}
                          cor={
                            s.custo_corretiva > s.custo_preventiva
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }
                        />
                        <div className="flex justify-between text-[10.5px] text-muted-foreground">
                          <span>
                            {s.ordens} ordens ·{' '}
                            {totalCustoSetores > 0
                              ? Math.round((s.custo / totalCustoSetores) * 100)
                              : 0}
                            % do total
                          </span>
                          <span>
                            prev {fmtBRL(s.custo_preventiva)} · corr {fmtBRL(s.custo_corretiva)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Alertas e previsão</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {avisos.length === 0 && (
                      <p className="py-6 text-center text-sm text-muted-foreground">
                        Nada vencido e nada nos próximos 30 dias.
                      </p>
                    )}
                    {avisos.slice(0, 12).map((a, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-2 rounded-md border border-border px-2.5 py-1.5"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            {a.prioridade === 'urgente' && (
                              <AlertTriangle className="size-3.5 shrink-0 text-red-500" />
                            )}
                            <span className="truncate text-[12.5px] font-medium">{a.ativo}</span>
                          </div>
                          <p className="truncate text-[10.5px] text-muted-foreground">
                            {a.tipo} · {a.setor}
                            {a.data ? ` · ${fmtData(a.data)}` : ''}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            a.prioridade === 'urgente'
                              ? 'border-red-500/40 bg-red-500/10 text-red-600'
                              : a.prioridade === 'alta'
                                ? 'border-amber-500/40 bg-amber-500/10 text-amber-700'
                                : 'border-slate-400/40 text-slate-500'
                          }
                        >
                          {a.dias != null
                            ? a.dias < 0
                              ? `${Math.abs(a.dias)}d atrás`
                              : `${a.dias}d`
                            : '—'}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">
                    Evolução mensal (12 meses)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-2 overflow-x-auto pb-1">
                    {serie.map((s) => (
                      <div
                        key={s.mes}
                        className="flex w-full min-w-[38px] flex-col items-center gap-1"
                      >
                        <span className="text-[9.5px] tabular-nums text-muted-foreground">
                          {s.custo > 0 ? `${Math.round(s.custo / 1000)}k` : ''}
                        </span>
                        <div className="flex h-28 w-full items-end">
                          <div
                            className="w-full rounded-t bg-amber-500/80"
                            style={{ height: `${Math.max(2, (s.custo / maxSerie) * 100)}%` }}
                            title={`${s.mes}: ${fmtBRL(s.custo)} · ${s.ordens} ordens`}
                          />
                        </div>
                        <span className="text-[9px] text-muted-foreground">{s.mes.slice(5)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {podeVerCustos && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">
                      Equipamentos que mais custam no período
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Equipamento</TableHead>
                          <TableHead>Setor</TableHead>
                          <TableHead className="text-center">Ordens</TableHead>
                          <TableHead className="text-center">Corretivas</TableHead>
                          <TableHead className="text-center">Intervalo médio</TableHead>
                          <TableHead className="text-right">Custo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {porAtivo
                          .filter((a) => a.custo > 0)
                          .slice(0, 12)
                          .map((a) => (
                            <TableRow key={a.ativo}>
                              <TableCell className="font-medium">{a.ativo}</TableCell>
                              <TableCell className="text-muted-foreground">{a.setor}</TableCell>
                              <TableCell className="text-center tabular-nums">{a.ordens}</TableCell>
                              <TableCell className="text-center tabular-nums">
                                {a.corretivas > 0 ? (
                                  <span className="font-semibold text-amber-700">
                                    {a.corretivas}
                                  </span>
                                ) : (
                                  '0'
                                )}
                              </TableCell>
                              <TableCell className="text-center tabular-nums text-muted-foreground">
                                {a.media_intervalo_dias != null
                                  ? `${a.media_intervalo_dias}d`
                                  : '—'}
                              </TableCell>
                              <TableCell className="text-right font-semibold tabular-nums">
                                {fmtBRL(a.custo)}
                              </TableCell>
                            </TableRow>
                          ))}
                        {porAtivo.filter((a) => a.custo > 0).length === 0 && (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              className="py-8 text-center text-muted-foreground"
                            >
                              Sem custo lançado neste período.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* ================= ORDENS ================= */}
            <TabsContent value="ordens" className="mt-6 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[220px] flex-1">
                  <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    className="pl-8"
                    placeholder="Buscar por equipamento, setor, fornecedor ou nº"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                  />
                </div>
                <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os tipos</SelectItem>
                    <SelectItem value="preventiva">Preventiva</SelectItem>
                    <SelectItem value="corretiva">Corretiva</SelectItem>
                    <SelectItem value="preditiva">Preditiva</SelectItem>
                    <SelectItem value="melhoria">Melhoria</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os status</SelectItem>
                    <SelectItem value="aberta">Aberta</SelectItem>
                    <SelectItem value="agendada">Agendada</SelectItem>
                    <SelectItem value="em_execucao">Em execução</SelectItem>
                    <SelectItem value="concluida">Concluída</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-14 text-center">Nº</TableHead>
                        <TableHead>Equipamento</TableHead>
                        <TableHead>Setor</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Abertura</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead className="w-24 text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ordensFiltradas.map((o) => (
                        <TableRow key={o.id}>
                          <TableCell className="text-center text-xs tabular-nums text-muted-foreground">
                            {o.numero ?? '—'}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{o.ativo_nome}</div>
                            <div className="text-[11px] text-muted-foreground">
                              {o.ativo_categoria}
                              {o.fornecedor_nome ? ` · ${o.fornecedor_nome}` : ''}
                            </div>
                          </TableCell>
                          <TableCell className="text-[12.5px] text-muted-foreground">
                            {o.setor_nome || '—'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={badgeTipo(o.tipo)}>
                              {ROTULO_TIPO[o.tipo]}
                            </Badge>
                          </TableCell>
                          <TableCell className="tabular-nums text-[12.5px]">
                            {fmtData(o.data_abertura)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={badgeStatus(o.status)}>
                              {ROTULO_STATUS[o.status]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {podeVerCustos ? fmtBRL(o.valor_total) : '—'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              {podeGerenciarOrdens && o.status !== 'concluida' && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="size-7"
                                  title="Concluir"
                                  onClick={() => concluirOrdem(o)}
                                >
                                  <CheckCircle2 className="size-4 text-emerald-600" />
                                </Button>
                              )}
                              {podeGerenciarOrdens && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="size-7"
                                  title="Editar"
                                  onClick={() => setModalOrdem(o)}
                                >
                                  <Pencil className="size-4" />
                                </Button>
                              )}
                              {podeExcluir && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="size-7"
                                  title="Apagar"
                                  onClick={() => apagarOrdem(o)}
                                >
                                  <Trash2 className="size-4 text-red-500" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {ordensFiltradas.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            className="py-10 text-center text-muted-foreground"
                          >
                            Nenhuma ordem encontrada.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ================= ATIVOS ================= */}
            <TabsContent value="ativos" className="mt-6 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground">
                  {ativos.length} equipamentos cadastrados
                </p>
                {podeGerenciarAtivos && (
                  <Button size="sm" onClick={() => setModalAtivo(vazioAtivo())} className="gap-1.5">
                    <Plus className="size-4" /> Novo equipamento
                  </Button>
                )}
              </div>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Equipamento</TableHead>
                        <TableHead>Setor</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Última prev.</TableHead>
                        <TableHead>Próxima prev.</TableHead>
                        <TableHead className="text-center">Frequência</TableHead>
                        {podeGerenciarAtivos && <TableHead className="w-12" />}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ativos.map((a) => {
                        const d = diasAte(a.proxima_preventiva)
                        return (
                          <TableRow key={a.id}>
                            <TableCell>
                              <div className="font-medium">{a.nome}</div>
                              <div className="text-[11px] text-muted-foreground">
                                {[a.marca, a.modelo, a.codigo].filter(Boolean).join(' · ') || '—'}
                              </div>
                            </TableCell>
                            <TableCell className="text-[12.5px] text-muted-foreground">
                              {a.setor_nome || '—'}
                            </TableCell>
                            <TableCell className="text-[12.5px]">{a.categoria}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  a.status === 'operando'
                                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600'
                                    : a.status === 'parado'
                                      ? 'border-red-500/40 bg-red-500/10 text-red-600'
                                      : 'border-amber-500/40 bg-amber-500/10 text-amber-700'
                                }
                              >
                                {ROTULO_STATUS_ATIVO[a.status]}
                              </Badge>
                            </TableCell>
                            <TableCell className="tabular-nums text-[12.5px] text-muted-foreground">
                              {fmtData(a.ultima_preventiva)}
                            </TableCell>
                            <TableCell className="tabular-nums text-[12.5px]">
                              {a.proxima_preventiva ? (
                                <span
                                  className={
                                    d != null && d < 0
                                      ? 'font-semibold text-red-600'
                                      : d != null && d <= 30
                                        ? 'font-semibold text-amber-700'
                                        : 'text-foreground'
                                  }
                                >
                                  {fmtData(a.proxima_preventiva)}
                                  {d != null && (
                                    <span className="ml-1 text-[10.5px] text-muted-foreground">
                                      ({d < 0 ? `${Math.abs(d)}d atrás` : `${d}d`})
                                    </span>
                                  )}
                                </span>
                              ) : (
                                '—'
                              )}
                            </TableCell>
                            <TableCell className="text-center text-[12.5px] text-muted-foreground">
                              {a.frequencia_preventiva_dias
                                ? `${a.frequencia_preventiva_dias}d`
                                : '—'}
                            </TableCell>
                            {podeGerenciarAtivos && (
                              <TableCell>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="size-7"
                                  onClick={() => setModalAtivo(a)}
                                >
                                  <Pencil className="size-4" />
                                </Button>
                              </TableCell>
                            )}
                          </TableRow>
                        )
                      })}
                      {ativos.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            className="py-10 text-center text-muted-foreground"
                          >
                            Nenhum equipamento cadastrado ainda. Comece cadastrando os aparelhos de
                            ar-condicionado, as cadeiras e a autoclave.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <Building2 className="size-4" /> Fornecedores de serviço
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {fornecedores.map((f) => (
                      <div
                        key={f.id}
                        className="rounded-md border border-border px-2.5 py-1.5 text-[12px]"
                      >
                        <div className="font-medium">{f.nome}</div>
                        <div className="text-[10.5px] text-muted-foreground">
                          {[f.telefone, f.contato].filter(Boolean).join(' · ') || 'sem contato'}
                        </div>
                      </div>
                    ))}
                    {fornecedores.length === 0 && (
                      <p className="text-sm text-muted-foreground">Nenhum fornecedor cadastrado.</p>
                    )}
                  </div>
                  {podeGerenciarAtivos && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      onClick={() => setModalFornecedor({ nome: '' })}
                    >
                      <Plus className="size-4" /> Cadastrar fornecedor
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ================= SETORES ================= */}
            <TabsContent value="setores" className="mt-6 space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">
                    Custo por setor —{' '}
                    {format(new Date(inicio + 'T12:00:00'), 'MMMM yyyy', { locale: ptBR })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Setor</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-center">Ordens</TableHead>
                        <TableHead className="text-right">Preventiva</TableHead>
                        <TableHead className="text-right">Corretiva</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">% do gasto</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {porSetor.map((s) => (
                        <TableRow key={s.setor}>
                          <TableCell className="font-medium">{s.setor}</TableCell>
                          <TableCell className="text-[12px] capitalize text-muted-foreground">
                            {s.tipo_setor}
                          </TableCell>
                          <TableCell className="text-center tabular-nums">{s.ordens}</TableCell>
                          <TableCell className="text-right tabular-nums text-emerald-600">
                            {podeVerCustos ? fmtBRL(s.custo_preventiva) : '—'}
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-amber-700">
                            {podeVerCustos ? fmtBRL(s.custo_corretiva) : '—'}
                          </TableCell>
                          <TableCell className="text-right font-semibold tabular-nums">
                            {podeVerCustos ? fmtBRL(s.custo) : '—'}
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-muted-foreground">
                            {totalCustoSetores > 0
                              ? `${((s.custo / totalCustoSetores) * 100).toFixed(1)}%`
                              : '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                      {porSetor.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="py-10 text-center text-muted-foreground"
                          >
                            Nenhuma ordem concluída neste período.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
                  <div>
                    <CardTitle className="text-sm font-semibold">
                      Setores cadastrados ({setores.filter((s) => s.ativo).length} ativos)
                    </CardTitle>
                    <p className="mt-1 text-[12px] text-muted-foreground">
                      Renomeie como você chama na clínica. A ordem aqui é a ordem que aparece nos
                      formulários e no painel.
                    </p>
                  </div>
                  {podeGerenciarAtivos && (
                    <Button
                      size="sm"
                      className="shrink-0 gap-1.5"
                      onClick={() =>
                        setModalSetor({
                          nome: '',
                          tipo: 'clinico',
                          ativo: true,
                          ordem: setores.length + 1,
                        })
                      }
                    >
                      <Plus className="size-4" /> Novo setor
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-14 text-center">Ordem</TableHead>
                        <TableHead>Nome do setor</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-center">Equipamentos</TableHead>
                        <TableHead className="text-center">Situação</TableHead>
                        <TableHead className="w-24 text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {setoresComContagem.map((s, idx) => (
                        <TableRow key={s.id} className={!s.ativo ? 'opacity-50' : ''}>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-0.5">
                              {podeGerenciarAtivos && (
                                <>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="size-6"
                                    disabled={idx === 0}
                                    title="Subir"
                                    onClick={() => moverSetor(idx, -1)}
                                  >
                                    <ChevronUp className="size-3.5" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="size-6"
                                    disabled={idx === setores.length - 1}
                                    title="Descer"
                                    onClick={() => moverSetor(idx, 1)}
                                  >
                                    <ChevronDown className="size-3.5" />
                                  </Button>
                                </>
                              )}
                              <span className="w-5 text-[11px] tabular-nums text-muted-foreground">
                                {s.ordem}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{s.nome}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10.5px] capitalize">
                              {ROTULO_SETOR[s.tipo] ?? s.tipo}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center tabular-nums text-[12.5px] text-muted-foreground">
                            {s.qtd_ativos ?? 0}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant="outline"
                              className={
                                s.ativo
                                  ? 'border-emerald-500/40 bg-emerald-500/10 text-[10.5px] text-emerald-600'
                                  : 'border-slate-400/40 text-[10.5px] text-slate-500'
                              }
                            >
                              {s.ativo ? 'Ativo' : 'Desativado'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {podeGerenciarAtivos && (
                              <div className="flex justify-end gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="size-7"
                                  title="Editar nome"
                                  onClick={() => setModalSetor(s)}
                                >
                                  <Pencil className="size-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="size-7"
                                  title={
                                    s.ativo
                                      ? 'Desativar (some dos formulários, mantém o histórico)'
                                      : 'Reativar'
                                  }
                                  onClick={() => alternarSetor(s)}
                                >
                                  {s.ativo ? (
                                    <EyeOff className="size-4 text-muted-foreground" />
                                  ) : (
                                    <Eye className="size-4 text-emerald-600" />
                                  )}
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="size-7"
                                  title="Excluir definitivamente"
                                  onClick={() => apagarSetor(s)}
                                >
                                  <Trash2 className="size-4 text-red-500" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ================= PLANOS ================= */}
            <TabsContent value="planos" className="mt-6 space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <ShieldCheck className="size-4" /> Planos preventivos de referência
                  </CardTitle>
                  <p className="text-[12px] text-muted-foreground">
                    Frequências sugeridas a partir do manual do fabricante e das normas aplicáveis
                    (Anvisa RDC 1.002/2025, PMOC/Lei 13.589/2018, NR-10, NBR 12962). Use como ponto
                    de partida ao cadastrar cada equipamento.
                  </p>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-center">Frequência</TableHead>
                        <TableHead>Responsável</TableHead>
                        <TableHead>Norma</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {planos.map((p: any) => (
                        <TableRow key={p.id}>
                          <TableCell className="text-[12.5px] font-medium">{p.categoria}</TableCell>
                          <TableCell className="text-[12.5px]">
                            {p.item}
                            {p.obrigatorio && (
                              <Badge
                                variant="outline"
                                className="ml-1.5 border-red-500/40 bg-red-500/10 text-[9px] text-red-600"
                              >
                                obrigatório
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center tabular-nums text-[12.5px]">
                            {p.frequencia_dias === 1 ? 'diária' : `${p.frequencia_dias} dias`}
                          </TableCell>
                          <TableCell className="text-[12px] capitalize text-muted-foreground">
                            {String(p.responsavel || '—').replace('_', ' ')}
                          </TableCell>
                          <TableCell className="text-[11.5px] text-muted-foreground">
                            {p.base_legal || '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* -------------------- modal: ativo -------------------- */}
      <Dialog open={!!modalAtivo} onOpenChange={(o) => !o && setModalAtivo(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{modalAtivo?.id ? 'Editar equipamento' : 'Novo equipamento'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Nome *</Label>
              <Input
                value={modalAtivo?.nome ?? ''}
                onChange={(e) => setModalAtivo((p) => ({ ...p, nome: e.target.value }))}
                placeholder="Ex.: Ar-condicionado Split 18.000 BTU"
              />
            </div>
            <div>
              <Label>Categoria</Label>
              <Select
                value={modalAtivo?.categoria ?? 'Odontológico'}
                onValueChange={(v) => setModalAtivo((p) => ({ ...p, categoria: v as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Setor</Label>
              <Select
                value={modalAtivo?.setor_id ?? ''}
                onValueChange={(v) => setModalAtivo((p) => ({ ...p, setor_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {setoresAtivos.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Marca</Label>
              <Input
                value={modalAtivo?.marca ?? ''}
                onChange={(e) => setModalAtivo((p) => ({ ...p, marca: e.target.value }))}
              />
            </div>
            <div>
              <Label>Modelo</Label>
              <Input
                value={modalAtivo?.modelo ?? ''}
                onChange={(e) => setModalAtivo((p) => ({ ...p, modelo: e.target.value }))}
              />
            </div>
            <div>
              <Label>Nº de série</Label>
              <Input
                value={modalAtivo?.numero_serie ?? ''}
                onChange={(e) => setModalAtivo((p) => ({ ...p, numero_serie: e.target.value }))}
              />
            </div>
            <div>
              <Label>Código / patrimônio</Label>
              <Input
                value={modalAtivo?.codigo ?? ''}
                onChange={(e) => setModalAtivo((p) => ({ ...p, codigo: e.target.value }))}
              />
            </div>
            <div>
              <Label>Criticidade</Label>
              <Select
                value={modalAtivo?.criticidade ?? 'media'}
                onValueChange={(v) => setModalAtivo((p) => ({ ...p, criticidade: v as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alta">Alta — para a operação</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={modalAtivo?.status ?? 'operando'}
                onValueChange={(v) => setModalAtivo((p) => ({ ...p, status: v as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operando">Operando</SelectItem>
                  <SelectItem value="parado">Parado</SelectItem>
                  <SelectItem value="em_manutencao">Em manutenção</SelectItem>
                  <SelectItem value="baixado">Baixado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Frequência da preventiva (dias)</Label>
              <Input
                type="number"
                value={modalAtivo?.frequencia_preventiva_dias ?? ''}
                onChange={(e) =>
                  setModalAtivo((p) => ({
                    ...p,
                    frequencia_preventiva_dias: e.target.value ? Number(e.target.value) : null,
                  }))
                }
                placeholder="30, 90, 180, 365"
              />
            </div>
            <div>
              <Label>Última preventiva</Label>
              <Input
                type="date"
                value={modalAtivo?.ultima_preventiva ?? ''}
                onChange={(e) =>
                  setModalAtivo((p) => ({ ...p, ultima_preventiva: e.target.value || null }))
                }
              />
            </div>
            <div>
              <Label>Valor de aquisição (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={modalAtivo?.valor_aquisicao ?? ''}
                onChange={(e) =>
                  setModalAtivo((p) => ({
                    ...p,
                    valor_aquisicao: e.target.value ? Number(e.target.value) : null,
                  }))
                }
              />
            </div>
            <div>
              <Label>Vida útil (meses)</Label>
              <Input
                type="number"
                value={modalAtivo?.vida_util_meses ?? ''}
                onChange={(e) =>
                  setModalAtivo((p) => ({
                    ...p,
                    vida_util_meses: e.target.value ? Number(e.target.value) : null,
                  }))
                }
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Observações</Label>
              <Input
                value={modalAtivo?.observacoes ?? ''}
                onChange={(e) => setModalAtivo((p) => ({ ...p, observacoes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setModalAtivo(null)}>
              Cancelar
            </Button>
            <Button onClick={gravarAtivo} disabled={salvando}>
              {salvando && <Loader2 className="mr-1.5 size-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* -------------------- modal: ordem -------------------- */}
      <Dialog open={!!modalOrdem} onOpenChange={(o) => !o && setModalOrdem(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {modalOrdem?.id ? 'Editar ordem' : 'Nova ordem de manutenção'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Equipamento *</Label>
              <Select
                value={modalOrdem?.ativo_id ?? ''}
                onValueChange={(v) => setModalOrdem((p) => ({ ...p, ativo_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o equipamento" />
                </SelectTrigger>
                <SelectContent>
                  {ativos.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.nome}
                      {a.setor_nome ? ` · ${a.setor_nome}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipo</Label>
              <Select
                value={modalOrdem?.tipo ?? 'preventiva'}
                onValueChange={(v) => setModalOrdem((p) => ({ ...p, tipo: v as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preventiva">Preventiva</SelectItem>
                  <SelectItem value="corretiva">Corretiva</SelectItem>
                  <SelectItem value="preditiva">Preditiva</SelectItem>
                  <SelectItem value="melhoria">Melhoria</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Prioridade</Label>
              <Select
                value={modalOrdem?.prioridade ?? 'media'}
                onValueChange={(v) => setModalOrdem((p) => ({ ...p, prioridade: v as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgente">Urgente</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={modalOrdem?.status ?? 'aberta'}
                onValueChange={(v) => setModalOrdem((p) => ({ ...p, status: v as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aberta">Aberta</SelectItem>
                  <SelectItem value="agendada">Agendada</SelectItem>
                  <SelectItem value="em_execucao">Em execução</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Data de abertura</Label>
              <Input
                type="date"
                value={modalOrdem?.data_abertura?.substring(0, 10) ?? ''}
                onChange={(e) => setModalOrdem((p) => ({ ...p, data_abertura: e.target.value }))}
              />
            </div>
            <div>
              <Label>Data de conclusão</Label>
              <Input
                type="date"
                value={modalOrdem?.data_conclusao?.substring(0, 10) ?? ''}
                onChange={(e) =>
                  setModalOrdem((p) => ({ ...p, data_conclusao: e.target.value || null }))
                }
              />
            </div>
            <div className="sm:col-span-2">
              <Label>O que foi feito / problema</Label>
              <Input
                value={modalOrdem?.descricao_problema ?? ''}
                onChange={(e) =>
                  setModalOrdem((p) => ({ ...p, descricao_problema: e.target.value }))
                }
                placeholder="Ex.: limpeza de filtro e recarga de gás"
              />
            </div>
            <div>
              <Label>Mão de obra (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={modalOrdem?.valor_mao_obra ?? ''}
                onChange={(e) =>
                  setModalOrdem((p) => ({
                    ...p,
                    valor_mao_obra: e.target.value ? Number(e.target.value) : 0,
                  }))
                }
              />
            </div>
            <div>
              <Label>Peças (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={modalOrdem?.valor_pecas ?? ''}
                onChange={(e) =>
                  setModalOrdem((p) => ({
                    ...p,
                    valor_pecas: e.target.value ? Number(e.target.value) : 0,
                  }))
                }
              />
            </div>
            <div>
              <Label>Fornecedor</Label>
              <Select
                value={modalOrdem?.fornecedor_id ?? ''}
                onValueChange={(v) => setModalOrdem((p) => ({ ...p, fornecedor_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Quem fez" />
                </SelectTrigger>
                <SelectContent>
                  {fornecedores.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Quem executou (livre)</Label>
              <Input
                value={modalOrdem?.executado_por ?? ''}
                onChange={(e) => setModalOrdem((p) => ({ ...p, executado_por: e.target.value }))}
              />
            </div>
            <div>
              <Label>Data de pagamento</Label>
              <Input
                type="date"
                value={modalOrdem?.data_pagamento?.substring(0, 10) ?? ''}
                onChange={(e) =>
                  setModalOrdem((p) => ({ ...p, data_pagamento: e.target.value || null }))
                }
              />
            </div>
            <div>
              <Label>Próxima preventiva (gerada)</Label>
              <Input
                type="date"
                value={modalOrdem?.gerou_proxima?.substring(0, 10) ?? ''}
                onChange={(e) =>
                  setModalOrdem((p) => ({ ...p, gerou_proxima: e.target.value || null }))
                }
              />
            </div>
            <div>
              <Label>Garantia até</Label>
              <Input
                type="date"
                value={modalOrdem?.garantia_ate?.substring(0, 10) ?? ''}
                onChange={(e) =>
                  setModalOrdem((p) => ({
                    ...p,
                    garantia_ate: e.target.value || null,
                    tem_garantia: !!e.target.value,
                  }))
                }
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Observações</Label>
              <Input
                value={modalOrdem?.observacoes ?? ''}
                onChange={(e) => setModalOrdem((p) => ({ ...p, observacoes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setModalOrdem(null)}>
              Cancelar
            </Button>
            <Button onClick={gravarOrdem} disabled={salvando}>
              {salvando && <Loader2 className="mr-1.5 size-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* -------------------- modal: setor -------------------- */}
      <Dialog open={!!modalSetor} onOpenChange={(o) => !o && setModalSetor(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{modalSetor?.id ? 'Editar setor' : 'Novo setor'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Nome do setor *</Label>
              <Input
                autoFocus
                value={modalSetor?.nome ?? ''}
                onChange={(e) => setModalSetor((p) => ({ ...p, nome: e.target.value }))}
                placeholder="Ex.: Consultório 5 · Sala da Diretoria · CPD"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') gravarSetor()
                }}
              />
              <p className="mt-1 text-[11.5px] text-muted-foreground">
                Escreva exatamente como o seu time chama. Aparece nos formulários e nos relatórios.
              </p>
            </div>
            <div>
              <Label>Tipo</Label>
              <Select
                value={modalSetor?.tipo ?? 'clinico'}
                onValueChange={(v) => setModalSetor((p) => ({ ...p, tipo: v as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clinico">Clínico — consultórios, recepção</SelectItem>
                  <SelectItem value="tecnico">Técnico — expurgo, sala de compressores</SelectItem>
                  <SelectItem value="administrativo">
                    Administrativo — comercial, financeiro
                  </SelectItem>
                  <SelectItem value="comum">Área comum — corredores, copa, banheiros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Observações</Label>
              <Input
                value={modalSetor?.observacoes ?? ''}
                onChange={(e) => setModalSetor((p) => ({ ...p, observacoes: e.target.value }))}
                placeholder="Opcional"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setModalSetor(null)}>
              Cancelar
            </Button>
            <Button onClick={gravarSetor} disabled={salvando}>
              {salvando && <Loader2 className="mr-1.5 size-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* -------------------- modal: fornecedor -------------------- */}
      <Dialog open={!!modalFornecedor} onOpenChange={(o) => !o && setModalFornecedor(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Fornecedor de serviço</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Nome *</Label>
              <Input
                value={modalFornecedor?.nome ?? ''}
                onChange={(e) => setModalFornecedor((p) => ({ ...p, nome: e.target.value }))}
              />
            </div>
            <div>
              <Label>CNPJ / CPF</Label>
              <Input
                value={modalFornecedor?.cnpj_cpf ?? ''}
                onChange={(e) => setModalFornecedor((p) => ({ ...p, cnpj_cpf: e.target.value }))}
              />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input
                value={modalFornecedor?.telefone ?? ''}
                onChange={(e) => setModalFornecedor((p) => ({ ...p, telefone: e.target.value }))}
              />
            </div>
            <div>
              <Label>Contato</Label>
              <Input
                value={modalFornecedor?.contato ?? ''}
                onChange={(e) => setModalFornecedor((p) => ({ ...p, contato: e.target.value }))}
              />
            </div>
            <div>
              <Label>E-mail</Label>
              <Input
                value={modalFornecedor?.email ?? ''}
                onChange={(e) => setModalFornecedor((p) => ({ ...p, email: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setModalFornecedor(null)}>
              Cancelar
            </Button>
            <Button onClick={gravarFornecedor} disabled={salvando}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

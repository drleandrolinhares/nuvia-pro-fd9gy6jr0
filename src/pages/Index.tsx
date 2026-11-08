import {
  Calendar,
  Cake,
  CheckCircle2,
  MessageSquare,
  Package,
  Target,
  TrendingDown,
  Wallet,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  LayoutDashboard,
  Boxes,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { useState, useEffect, useMemo, type ElementType, type ReactNode } from 'react'
import { GestaoRH } from '@/components/rh/GestaoRH'
import { supabase } from '@/lib/supabase/client'
import { fetchProdutos, Produto } from '@/services/produtos'
import { SyncIndicator } from '@/components/ui/sync-indicator'
import { useCache } from '@/hooks/use-cache'
import { useAuth } from '@/hooks/use-auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { parseISO, format, startOfMonth, endOfMonth } from 'date-fns'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

const brl = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 })

/** Bloco de KPI com hierarquia clara: rótulo, valor, contexto e tendência */
function KpiTile({
  label,
  value,
  hint,
  tone = 'neutral',
  icon: Icon,
  loading,
}: {
  label: string
  value: string
  hint?: string
  tone?: 'neutral' | 'positive' | 'warning' | 'negative'
  icon?: ElementType
  loading?: boolean
}) {
  const toneStyles = {
    neutral: 'text-foreground',
    positive: 'text-success',
    warning: 'text-warning',
    negative: 'text-destructive',
  } as const

  return (
    <div className="group relative flex min-w-0 flex-col gap-2 rounded-xl border border-border/70 bg-card p-4 shadow-xs transition-shadow hover:shadow-card">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
          {label}
        </span>
        {Icon && <Icon className="size-4 shrink-0 text-muted-foreground/50" />}
      </div>
      <span
        className={cn(
          'tabular truncate text-[1.35rem] font-bold leading-none tracking-tight',
          toneStyles[tone],
          loading && 'text-muted-foreground/40',
        )}
      >
        {loading ? '—' : value}
      </span>
      {hint && <span className="truncate text-[11px] text-muted-foreground">{hint}</span>}
    </div>
  )
}

/** Cartão de painel com cabeçalho padronizado (ícone, título, ação) */
function PanelCard({
  title,
  icon: Icon,
  action,
  children,
  className,
  count,
}: {
  title: string
  icon: ElementType
  action?: ReactNode
  children: ReactNode
  className?: string
  count?: number
}) {
  return (
    <Card className={cn('flex h-[380px] flex-col overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border/70 py-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
            <Icon className="size-4" />
          </span>
          <CardTitle className="truncate text-sm font-semibold uppercase tracking-[0.06em]">
            {title}
          </CardTitle>
          {typeof count === 'number' && count > 0 && (
            <Badge variant="secondary" className="tabular shrink-0 px-2 py-0 font-bold">
              {count}
            </Badge>
          )}
        </div>
        {action}
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 custom-scrollbar">{children}</CardContent>
    </Card>
  )
}

/** Estado vazio consistente entre os painéis */
function EmptyState({ icon: Icon, label }: { icon: ElementType; label: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border-strong/70 bg-muted/25 p-6 text-center">
      <span className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground/60">
        <Icon className="size-5" />
      </span>
      <p className="max-w-[220px] text-[12.5px] leading-relaxed text-muted-foreground">{label}</p>
    </div>
  )
}

const Index = () => {
  const { user, profile } = useAuth()
  const { toast } = useToast()
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loadingMeta, setLoadingMeta] = useState(true)
  const [loadingEstoque, setLoadingEstoque] = useState(true)
  const [loadingUsuarios, setLoadingUsuarios] = useState(true)
  const [loadingSAC, setLoadingSAC] = useState(true)
  const [todosUsuarios, setTodosUsuarios] = useState<any[]>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [possuiCarteira, setPossuiCarteira] = useState(false)
  const [saldoAtual, setSaldoAtual] = useState(0)
  const [saldoPerdido, setSaldoPerdido] = useState(0)
  const [minhasDemandas, setMinhasDemandas] = useState<any[]>([])
  const [metaFaturamento, setMetaFaturamento] = useState(0)
  const [vendasDiarias, setVendasDiarias] = useState<any[]>([]) // Used for goal calculation

  const { dataVersion, invalidateCache } = useCache()

  const loading = loadingMeta || loadingEstoque || loadingUsuarios || loadingSAC

  const loadData = () => {
    const todayDate = new Date()
    const startOfMonthStr = format(startOfMonth(todayDate), 'yyyy-MM-dd')
    const endOfMonthStr = format(endOfMonth(todayDate), 'yyyy-MM-dd')

    setLoadingMeta(true)
    Promise.all([
      supabase.from('gestao_fiscal_config').select('faturamento_previsto').single(),
      supabase
        .from('vendas_confirmadas')
        .select('valor_tratamento')
        .gte('data_fechamento', startOfMonthStr)
        .lte('data_fechamento', endOfMonthStr),
    ]).then(([{ data: configFiscal }, { data: vendas }]) => {
      if (configFiscal) setMetaFaturamento(configFiscal.faturamento_previsto)
      if (vendas) setVendasDiarias(vendas)
      setLoadingMeta(false)
    })

    setLoadingEstoque(true)
    fetchProdutos().then(({ data: pData }) => {
      if (pData) setProdutos(pData)
      setLoadingEstoque(false)
    })

    if (user) {
      setLoadingUsuarios(true)
      Promise.all([
        supabase.from('usuarios').select('possui_carteira').eq('id', user.id).single(),
        supabase
          .from('usuarios')
          .select('id, nome, data_nascimento, avatar_url')
          .eq('status', 'ativo')
          .not('data_nascimento', 'is', null),
        supabase.from('carteira_transacoes').select('tipo, valor').eq('usuario_id', user.id),
      ]).then(([{ data: userData }, { data: usuarios }, { data: transacoes }]) => {
        if (userData) setPossuiCarteira(userData.possui_carteira)
        if (usuarios) setTodosUsuarios(usuarios)

        if (userData?.possui_carteira && transacoes) {
          let creditos = 0
          let debitos = 0
          let saques = 0
          transacoes.forEach((t) => {
            if (t.tipo === 'credito') creditos += Number(t.valor)
            else if (t.tipo === 'debito') debitos += Number(t.valor)
            else if (t.tipo === 'saque') saques += Number(t.valor)
          })
          setSaldoAtual(creditos - debitos - saques)
          setSaldoPerdido(debitos)
        }
        setLoadingUsuarios(false)
      })

      setLoadingSAC(true)
      const isAdmin =
        profile?.role === 'admin' ||
        user.email === 'drleandro@nuvia.com' ||
        user.email === 'drleandrolinhares@gmail.com'

      let query = supabase
        .from('sac_demandas')
        .select('id, paciente_nome, tipo, limite_primeiro_contato, status')
        .neq('status', 'resolvido')
        .order('limite_primeiro_contato', { ascending: true })

      if (!isAdmin) {
        query = query.eq('quem_resolve_id', user.id)
      }

      query.then(({ data: demandas }) => {
        if (demandas) setMinhasDemandas(demandas)
        setLoadingSAC(false)
      })
    } else {
      setLoadingUsuarios(false)
      setLoadingSAC(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [dataVersion, user, profile])

  useEffect(() => {
    const channel = supabase
      .channel('dashboard-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'produtos' }, () =>
        invalidateCache(),
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'compras' }, () =>
        invalidateCache(),
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'compra_itens' }, () =>
        invalidateCache(),
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'entrada_produtos' }, () =>
        invalidateCache(),
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'saida_produtos' }, () =>
        invalidateCache(),
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sac_demandas' }, () =>
        invalidateCache(),
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vendas_confirmadas' }, () =>
        invalidateCache(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [invalidateCache])

  const totalVendasMes = vendasDiarias.reduce(
    (acc, curr) => acc + Number(curr.valor_tratamento || 0),
    0,
  )
  const valorRestante = Math.max(0, metaFaturamento - totalVendasMes)
  const percentualAlcancado = metaFaturamento > 0 ? (totalVendasMes / metaFaturamento) * 100 : 0
  const percentualFaltante = Math.max(0, 100 - percentualAlcancado)

  const produtosDashboard = useMemo(() => {
    return produtos.map((p) => {
      const finalizedPurchases =
        p.compra_itens?.filter((ci) => ci.compras?.status === 'Finalizada') || []
      finalizedPurchases.sort(
        (a, b) =>
          new Date(b.compras?.data || 0).getTime() - new Date(a.compras?.data || 0).getTime(),
      )

      const latestCusto =
        finalizedPurchases.length > 0 ? finalizedPurchases[0].valor_unitario : p.custo_unitario
      return { ...p, custo_unitario: latestCusto }
    })
  }, [produtos])

  const aniversariantes = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const currentMonth = today.getMonth()

    return todosUsuarios
      .filter((u) => {
        if (!u.data_nascimento) return false
        const birthDate = parseISO(u.data_nascimento)
        const birthDateLocal = new Date(birthDate.getTime() + birthDate.getTimezoneOffset() * 60000)
        return birthDateLocal.getMonth() === selectedMonth
      })
      .map((u) => {
        const birthDate = parseISO(u.data_nascimento!)
        const birthDateLocal = new Date(birthDate.getTime() + birthDate.getTimezoneOffset() * 60000)
        const day = birthDateLocal.getDate()

        let isPast = false
        if (selectedMonth === currentMonth) {
          isPast = day < today.getDate()
        } else if (selectedMonth < currentMonth) {
          isPast = true
        }

        return {
          ...u,
          day,
          isPast,
        }
      })
      .sort((a, b) => a.day - b.day)
  }, [todosUsuarios, selectedMonth])

  const { itemsAvisos } = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const itemsLowStock = produtosDashboard.filter((p) => {
      let isPastPrazo = false
      if (p.data_proxima_revisao) {
        const d = new Date(p.data_proxima_revisao)
        const localDate = new Date(d.getTime() + d.getTimezoneOffset() * 60000)
        localDate.setHours(0, 0, 0, 0)
        isPastPrazo = localDate <= today
      }
      const isLowStock = (p.quantidade_estoque || 0) <= (p.quantidade_minima || 0)

      return isLowStock || isPastPrazo
    })

    return {
      itemsAvisos: itemsLowStock,
    }
  }, [produtosDashboard])

  const saldoCritico = saldoAtual < 0
  const primeiroNome = (profile?.nome || user?.user_metadata?.name || '')
    .split(' ')
    .filter(Boolean)[0]
  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <div className="relative space-y-5 animate-fade-in-up">
      <div className="absolute -top-1 right-0 z-10">
        <SyncIndicator isSyncing={loading} />
      </div>

      {/* Cabeçalho da página */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="mb-1.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            <LayoutDashboard className="size-3.5" />
            Painel executivo
          </div>
          <h1 className="truncate text-[1.55rem] font-bold leading-tight tracking-tight text-foreground sm:text-[1.75rem]">
            {saudacao}
            {primeiroNome ? `, ${primeiroNome}` : ''}
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Visão consolidada de meta, operação, pessoas e estoque.
          </p>
        </div>
        <Badge variant="outline" className="w-fit gap-1.5 py-1 text-[11px] capitalize">
          <Calendar className="size-3.5" />
          {format(new Date(), "EEEE, dd 'de' MMMM")}
        </Badge>
      </div>

      {/* Meta de faturamento */}
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border/70 py-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-lg bg-accent text-accent-foreground">
              <Target className="size-4" />
            </span>
            <div>
              <CardTitle className="text-sm font-semibold uppercase tracking-[0.06em]">
                Meta de faturamento
              </CardTitle>
              <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                Vendas confirmadas no mês corrente
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-1.5 sm:flex">
            <span
              className={cn(
                'tabular text-[13px] font-bold',
                percentualAlcancado >= 100 ? 'text-success' : 'text-foreground',
              )}
            >
              {loadingMeta ? '—' : `${percentualAlcancado.toFixed(1)}%`}
            </span>
            {percentualAlcancado >= 100 ? (
              <ArrowUpRight className="size-4 text-success" />
            ) : (
              <ArrowDownRight className="size-4 text-warning" />
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-5">
          <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-700',
                percentualAlcancado >= 100 ? 'bg-success' : 'bg-primary',
              )}
              style={{ width: `${Math.min(100, Math.max(0, percentualAlcancado))}%` }}
            />
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <KpiTile
              label="Meta do mês"
              value={brl(metaFaturamento)}
              loading={loadingMeta}
              icon={Target}
            />
            <KpiTile
              label="Vendas atuais"
              value={brl(totalVendasMes)}
              tone="positive"
              loading={loadingMeta}
              icon={ArrowUpRight}
            />
            <KpiTile
              label="Falta para a meta"
              value={brl(valorRestante)}
              tone="warning"
              loading={loadingMeta}
              icon={TrendingDown}
            />
            <KpiTile
              label="Meta alcançada"
              value={`${percentualAlcancado.toFixed(1)}%`}
              tone={percentualAlcancado >= 100 ? 'positive' : 'neutral'}
              loading={loadingMeta}
            />
            <KpiTile
              label="Falta (%)"
              value={`${percentualFaltante.toFixed(1)}%`}
              tone="warning"
              loading={loadingMeta}
            />
          </div>
        </CardContent>
      </Card>

      {/* Carteira (quando habilitada) */}
      {possuiCarteira && (
        <div className="grid gap-3 md:grid-cols-2">
          <Card className="flex items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                <Wallet className="size-3.5" /> Saldo acumulado
              </div>
              <div
                className={cn(
                  'tabular mt-1.5 truncate text-2xl font-bold tracking-tight',
                  saldoCritico ? 'text-destructive' : 'text-success',
                )}
              >
                {loadingUsuarios ? '—' : brl(saldoAtual)}
              </div>
              <p className="mt-1 text-[11.5px] text-muted-foreground">
                Disponível para saque na carteira
              </p>
            </div>
            <span
              className={cn(
                'grid size-11 shrink-0 place-items-center rounded-xl',
                saldoCritico ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success',
              )}
            >
              <Wallet className="size-5" />
            </span>
          </Card>

          <Card className="flex items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                <TrendingDown className="size-3.5" /> Descontos aplicados
              </div>
              <div className="tabular mt-1.5 truncate text-2xl font-bold tracking-tight text-destructive">
                {loadingUsuarios ? '—' : brl(saldoPerdido)}
              </div>
              <p className="mt-1 text-[11.5px] text-muted-foreground">Penalidades e descontos</p>
            </div>
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-destructive/10 text-destructive">
              <TrendingDown className="size-5" />
            </span>
          </Card>
        </div>
      )}

      {/* Painéis operacionais */}
      <div className="grid gap-3 lg:grid-cols-2">
        <PanelCard
          title="SAC"
          icon={MessageSquare}
          count={minhasDemandas.length}
          action={
            <Button variant="ghost" size="xs" asChild className="shrink-0 text-primary">
              <Link to="/operacional/sac">
                Ver tudo <ArrowRight className="ml-1 size-3" />
              </Link>
            </Button>
          }
        >
          {minhasDemandas.length > 0 ? (
            <div className="flex flex-col gap-2">
              {minhasDemandas.map((d) => (
                <Link
                  key={d.id}
                  to={`/operacional/sac?demanda=${d.id}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-card px-3 py-2.5 transition-colors hover:border-border-strong hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-foreground">
                      {d.paciente_nome}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span
                        className={cn(
                          'rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                          d.tipo === 'reclamacao'
                            ? 'bg-destructive/10 text-destructive'
                            : 'bg-warning/10 text-warning',
                        )}
                      >
                        {d.tipo}
                      </span>
                      <span className="tabular">
                        {d.limite_primeiro_contato
                          ? format(parseISO(d.limite_primeiro_contato), 'dd/MM/yyyy')
                          : '—'}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      'shrink-0 text-[10px] uppercase tracking-wide',
                      d.status === 'recebido' && 'border-destructive/30 text-destructive',
                      d.status === 'sendo_tratado' && 'border-warning/30 text-warning',
                    )}
                  >
                    {String(d.status).replace('_', ' ')}
                  </Badge>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState icon={CheckCircle2} label="Nenhuma demanda pendente. Tudo em dia." />
          )}
        </PanelCard>

        <PanelCard
          title="Alertas de estoque"
          icon={Package}
          count={itemsAvisos.length}
          action={
            <Button variant="ghost" size="xs" asChild className="shrink-0 text-primary">
              <Link to="/estoque">
                Estoque <ArrowRight className="ml-1 size-3" />
              </Link>
            </Button>
          }
        >
          {itemsAvisos.length > 0 ? (
            <div className="flex flex-col gap-2">
              {itemsAvisos.map((item) => {
                const prazoAtingido =
                  item.data_proxima_revisao &&
                  new Date(
                    new Date(item.data_proxima_revisao).getTime() +
                      new Date(item.data_proxima_revisao).getTimezoneOffset() * 60000,
                  ) <= new Date(new Date().setHours(0, 0, 0, 0))
                const abaixoMinimo = (item.quantidade_estoque || 0) <= (item.quantidade_minima || 0)

                return (
                  <Link
                    key={item.id}
                    to={`/estoque?q=${encodeURIComponent(item.nome)}`}
                    className="group flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-card px-3 py-2.5 transition-colors hover:border-border-strong hover:bg-muted/50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-foreground group-hover:text-primary">
                        {item.nome}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                        {item.marca || 'Sem marca'} · {item.variacao || 'S/V'} · mín.{' '}
                        {item.quantidade_minima}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      {abaixoMinimo && (
                        <span className="tabular rounded bg-destructive/10 px-1.5 py-0.5 text-[11px] font-bold text-destructive">
                          {item.quantidade_estoque} un.
                        </span>
                      )}
                      {prazoAtingido && (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-warning">
                          <AlertTriangle className="size-3" /> comprar
                        </span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <EmptyState icon={Boxes} label="Nenhum alerta de estoque no momento." />
          )}
        </PanelCard>

        <PanelCard
          title="Aniversariantes"
          icon={Cake}
          action={
            <Select
              value={selectedMonth.toString()}
              onValueChange={(v) => setSelectedMonth(parseInt(v))}
            >
              <SelectTrigger className="h-8 w-[118px] shrink-0 text-xs">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                {MESES.map((mes, idx) => (
                  <SelectItem key={idx} value={idx.toString()} className="text-xs">
                    {mes}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
        >
          {loadingUsuarios ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="skeleton-shimmer h-11 rounded-lg" />
              ))}
            </div>
          ) : aniversariantes.length > 0 ? (
            <div className="flex flex-col gap-1">
              {aniversariantes.map((a) => {
                const isToday =
                  selectedMonth === new Date().getMonth() && a.day === new Date().getDate()
                return (
                  <div
                    key={a.id}
                    className={cn(
                      'flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 transition-colors hover:bg-muted/50',
                      a.isPast && 'opacity-45',
                    )}
                  >
                    <Avatar className="size-8 shrink-0 ring-1 ring-border">
                      <AvatarImage
                        src={
                          a.avatar_url || `https://img.usecurling.com/ppl/thumbnail?seed=${a.id}`
                        }
                      />
                      <AvatarFallback className="bg-muted text-[10px] font-bold text-muted-foreground">
                        {a.nome.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-foreground">{a.nome}</p>
                      <p className="tabular text-[11px] text-muted-foreground">
                        Dia {String(a.day).padStart(2, '0')}
                      </p>
                    </div>
                    {isToday && (
                      <Badge
                        variant="secondary"
                        className="shrink-0 text-[10px] font-bold uppercase"
                      >
                        Hoje
                      </Badge>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState icon={Cake} label="Nenhum aniversariante neste mês." />
          )}
        </PanelCard>

        <PanelCard title="A única coisa" icon={RefreshCw}>
          <EmptyState icon={Calendar} label="Nenhum lembrete ou agendamento pendente no momento." />
        </PanelCard>
      </div>

      <div className="mb-0">
        <GestaoRH />
      </div>
    </div>
  )
}

export default Index

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  addMonths,
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  BarChart3,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  RefreshCw,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { CrcInteracoesTab } from './components/crc/CrcInteracoesTab'

type Perfil = {
  crc_nome: string
  avaliacoes: number
  valor_oportunidades: number
  oportunidades_abertas: number
  valor_aberto: number
  vendas: number
  valor_vendido: number
  taxa_conversao_pct: number
  ticket_medio: number | null
  agendamentos: number
  interacoes: number
  interacoes_por_venda: number | null
  dias_ate_fechamento: number | null
  fechou: number
  negou: number
  em_negociacao: number
}

type Serie = {
  crc_nome: string
  dimensao: string
  rotulo: string
  ordem: number
  avaliacoes: number
  vendas: number
  valor_vendido: number
}

const brl = (v: number | null | undefined) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v ?? 0))

const num = (v: number | null | undefined, d = 0) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d }).format(
    Number(v ?? 0),
  )

/** Faixa do período selecionado. */
function calcularPeriodo(chave: string, ini: string, fim: string) {
  const hoje = new Date()
  if (chave === 'mes') return { ini: startOfMonth(hoje), fim: endOfMonth(hoje) }
  if (chave === 'mes_anterior') {
    const m = addMonths(hoje, -1)
    return { ini: startOfMonth(m), fim: endOfMonth(m) }
  }
  if (chave === 'semana')
    return {
      ini: startOfWeek(hoje, { weekStartsOn: 1 }),
      fim: endOfWeek(hoje, { weekStartsOn: 1 }),
    }
  if (chave === 'hoje') return { ini: startOfDay(hoje), fim: hoje }
  if (chave === '7') {
    const d = new Date(hoje)
    d.setDate(d.getDate() - 6)
    return { ini: startOfDay(d), fim: hoje }
  }
  if (chave === '30') {
    const d = new Date(hoje)
    d.setDate(d.getDate() - 29)
    return { ini: startOfDay(d), fim: hoje }
  }
  if (chave === '90') {
    const d = new Date(hoje)
    d.setDate(d.getDate() - 89)
    return { ini: startOfDay(d), fim: hoje }
  }
  if (chave === 'ano') return { ini: new Date(hoje.getFullYear(), 0, 1), fim: hoje }
  return {
    ini: ini ? new Date(`${ini}T00:00:00`) : startOfMonth(hoje),
    fim: fim ? new Date(`${fim}T00:00:00`) : hoje,
  }
}

export default function CrcPerformance() {
  const { toast } = useToast()
  const [periodo, setPeriodo] = useState('mes')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [crcFiltro, setCrcFiltro] = useState('todos')
  const [perfis, setPerfis] = useState<Perfil[]>([])
  const [series, setSeries] = useState<Serie[]>([])
  const [crcs, setCrcs] = useState<{ id: string; nome: string }[]>([])
  const [loading, setLoading] = useState(true)

  const faixa = useMemo(
    () => calcularPeriodo(periodo, dataInicio, dataFim),
    [periodo, dataInicio, dataFim],
  )
  const ini = format(faixa.ini, 'yyyy-MM-dd')
  const fim = format(faixa.fim, 'yyyy-MM-dd')

  useEffect(() => {
    supabase
      .from('crc_comercial')
      .select('id, nome, status')
      .order('nome')
      .then(({ data }) => {
        if (data) setCrcs(data as any)
      })
  }, [])

  const carregar = useCallback(async () => {
    setLoading(true)
    const crcParam = crcFiltro === 'todos' ? null : crcFiltro
    const [p, s] = await Promise.all([
      supabase.rpc('crc_performance', { p_ini: ini, p_fim: fim, p_crc: crcParam }),
      supabase.rpc('crc_series', { p_ini: ini, p_fim: fim, p_crc: crcParam }),
    ])
    if (p.error || s.error) {
      toast({
        title: 'Erro ao carregar performance',
        description: (p.error || s.error)?.message,
        variant: 'destructive',
      })
    } else {
      setPerfis((p.data ?? []) as Perfil[])
      setSeries((s.data ?? []) as Serie[])
    }
    setLoading(false)
  }, [ini, fim, crcFiltro, toast])

  useEffect(() => {
    carregar()
  }, [carregar])

  useEffect(() => {
    const ch = supabase
      .channel(`crc-perf-${crypto.randomUUID()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'avaliacoes' }, () =>
        carregar(),
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contatos_follow_up' }, () =>
        carregar(),
      )
      .subscribe()
    return () => {
      supabase.removeChannel(ch)
    }
  }, [carregar])

  const total = useMemo(
    () =>
      perfis.reduce(
        (a, p) => ({
          avaliacoes: a.avaliacoes + Number(p.avaliacoes),
          valor_oportunidades: a.valor_oportunidades + Number(p.valor_oportunidades),
          abertas: a.abertas + Number(p.oportunidades_abertas),
          valor_aberto: a.valor_aberto + Number(p.valor_aberto),
          vendas: a.vendas + Number(p.vendas),
          valor_vendido: a.valor_vendido + Number(p.valor_vendido),
          agendamentos: a.agendamentos + Number(p.agendamentos),
          interacoes: a.interacoes + Number(p.interacoes),
        }),
        {
          avaliacoes: 0,
          valor_oportunidades: 0,
          abertas: 0,
          valor_aberto: 0,
          vendas: 0,
          valor_vendido: 0,
          agendamentos: 0,
          interacoes: 0,
        },
      ),
    [perfis],
  )

  const conversao = total.avaliacoes ? (100 * total.vendas) / total.avaliacoes : 0
  const ticket = total.vendas ? total.valor_vendido / total.vendas : 0

  /** Série agregada de uma dimensão (todos os CRCs somados). */
  const seriePor = (dim: string) => {
    const mapa = new Map<
      string,
      { rotulo: string; ordem: number; avaliacoes: number; vendas: number; valor: number }
    >()
    series
      .filter((s) => s.dimensao === dim)
      .forEach((s) => {
        const atual = mapa.get(s.rotulo) ?? {
          rotulo: s.rotulo,
          ordem: s.ordem,
          avaliacoes: 0,
          vendas: 0,
          valor: 0,
        }
        atual.avaliacoes += Number(s.avaliacoes)
        atual.vendas += Number(s.vendas)
        atual.valor += Number(s.valor_vendido)
        mapa.set(s.rotulo, atual)
      })
    return [...mapa.values()].sort((a, b) => a.ordem - b.ordem)
  }

  const porDiaSemana = seriePor('dia_semana')
  const porHora = seriePor('hora')
  const porQuinzena = seriePor('quinzena')

  const melhorDia = [...porDiaSemana].sort((a, b) => b.vendas - a.vendas)[0]
  const melhorHora = [...porHora].sort((a, b) => b.vendas - a.vendas)[0]

  const dicas = useMemo(() => {
    const out: { titulo: string; texto: string }[] = []
    const aberto = total.valor_aberto
    if (aberto > 0)
      out.push({
        titulo: `${brl(aberto)} parados em oportunidade aberta`,
        texto:
          'O valor em aberto é o maior ativo do mês. Cada semana sem contato reduz a chance de fechamento — priorize as mais antigas por valor.',
      })
    if (conversao < 35 && total.avaliacoes > 5)
      out.push({
        titulo: `Conversão em ${num(conversao, 1)}%`,
        texto:
          'Abaixo de 35% indica que a avaliação está gerando orçamento, mas o follow-up não sustenta a decisão. Meta saudável para clínica: 40–50%.',
      })
    if (melhorDia)
      out.push({
        titulo: `${melhorDia.rotulo} é o dia que mais fecha`,
        texto: `${melhorDia.vendas} vendas no período. Concentre as tentativas de fechamento e as avaliações neste dia.`,
      })
    if (melhorHora)
      out.push({
        titulo: `${melhorHora.rotulo} é a faixa que mais converte`,
        texto: `${melhorHora.vendas} vendas. Bloqueie agenda do CRC nessa janela para retorno de orçamento.`,
      })
    if (total.interacoes === 0)
      out.push({
        titulo: 'Nenhuma interação registrada no período',
        texto:
          'Sem registro, a performance é só o resultado. Abra a aba Interações e registre cada contato com desfecho: é o que permite medir tempo e número de toques até o fechamento.',
      })
    return out
  }, [total, conversao, melhorDia, melhorHora])

  return (
    <div className="space-y-4">
      <PageHeader
        title="Performance CRC Comercial"
        description="Oportunidades lançadas na Gestão de Vendas cruzadas com a agenda e as interações do CRC."
        icon={TrendingUp}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger className="h-9 w-[185px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hoje">Hoje</SelectItem>
                <SelectItem value="semana">Esta semana</SelectItem>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="mes">Mês atual</SelectItem>
                <SelectItem value="mes_anterior">Mês anterior</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
                <SelectItem value="ano">Ano atual</SelectItem>
                <SelectItem value="personalizado">Personalizado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={crcFiltro} onValueChange={setCrcFiltro}>
              <SelectTrigger className="h-9 w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os CRCs</SelectItem>
                {crcs.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={carregar}>
              <RefreshCw className="size-4" />
              Atualizar
            </Button>
          </div>
        }
      />

      {periodo === 'personalizado' && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-2.5">
          <CalendarRange className="size-4 text-muted-foreground" />
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
          />
          <span className="text-sm text-muted-foreground">até</span>
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
          />
        </div>
      )}

      <div className="text-[12.5px] text-muted-foreground">
        Período: <strong className="text-foreground">{format(faixa.ini, 'dd/MM/yyyy')}</strong> a{' '}
        <strong className="text-foreground">{format(faixa.fim, 'dd/MM/yyyy')}</strong>
        {periodo === 'mes' && (
          <span className="ml-1 capitalize">
            · {format(faixa.ini, 'MMMM/yyyy', { locale: ptBR })}
          </span>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          titulo="Pacientes avaliados"
          valor={num(total.avaliacoes)}
          sub={`${num(total.abertas)} seguem em oportunidade`}
          loading={loading}
        />
        <KpiCard
          titulo="Orçamentos gerados"
          valor={brl(total.valor_oportunidades)}
          sub={`${brl(total.valor_aberto)} ainda abertos`}
          loading={loading}
          tone="gold"
        />
        <KpiCard
          titulo="Vendas fechadas"
          valor={num(total.vendas)}
          sub={`${brl(total.valor_vendido)} · ticket ${brl(ticket)}`}
          loading={loading}
          tone="success"
        />
        <KpiCard
          titulo="Conversão"
          valor={`${num(conversao, 1)}%`}
          sub={`${num(total.agendamentos)} agendamentos · ${num(total.interacoes)} interações`}
          loading={loading}
          tone={conversao >= 40 ? 'success' : conversao >= 25 ? 'gold' : 'danger'}
        />
      </div>

      {/* Tabela por CRC */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="size-4 text-muted-foreground" />
            Performance por CRC
          </CardTitle>
          <CardDescription>
            Funil completo no período: do orçamento gerado ao desfecho de cada interação.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="py-2 pr-3 text-left font-bold">CRC</th>
                  <th className="px-2 py-2 text-right font-bold">Avaliações</th>
                  <th className="px-2 py-2 text-right font-bold">Gerado</th>
                  <th className="px-2 py-2 text-right font-bold">Aberto</th>
                  <th className="px-2 py-2 text-right font-bold">Vendas</th>
                  <th className="px-2 py-2 text-right font-bold">Vendido</th>
                  <th className="px-2 py-2 text-right font-bold">Conv.</th>
                  <th className="px-2 py-2 text-right font-bold">Ticket</th>
                  <th className="px-2 py-2 text-right font-bold">Agend.</th>
                  <th className="px-2 py-2 text-right font-bold">Interações</th>
                  <th className="px-2 py-2 text-right font-bold">Dias p/ fechar</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={11} className="py-6">
                      <Skeleton className="h-8 w-full" />
                    </td>
                  </tr>
                )}
                {!loading && perfis.length === 0 && (
                  <tr>
                    <td colSpan={11} className="py-8 text-center text-muted-foreground">
                      Nenhuma oportunidade lançada no período.
                    </td>
                  </tr>
                )}
                {!loading &&
                  perfis.map((p) => (
                    <tr key={p.crc_nome} className="border-b border-border/60 last:border-0">
                      <td className="py-2.5 pr-3 font-semibold text-foreground">{p.crc_nome}</td>
                      <td className="tabular px-2 py-2.5 text-right">{num(p.avaliacoes)}</td>
                      <td className="tabular px-2 py-2.5 text-right">
                        {brl(p.valor_oportunidades)}
                      </td>
                      <td className="tabular px-2 py-2.5 text-right text-gold-ink">
                        {brl(p.valor_aberto)}
                      </td>
                      <td className="tabular px-2 py-2.5 text-right font-bold">{num(p.vendas)}</td>
                      <td className="tabular px-2 py-2.5 text-right font-bold text-success">
                        {brl(p.valor_vendido)}
                      </td>
                      <td className="tabular px-2 py-2.5 text-right">
                        <Badge
                          variant="outline"
                          className={
                            Number(p.taxa_conversao_pct) >= 40
                              ? 'border-success/40 bg-success/10 text-success'
                              : Number(p.taxa_conversao_pct) >= 25
                                ? 'border-gold-ink/40 bg-gold-ink/10 text-gold-ink'
                                : 'border-destructive/40 bg-destructive/10 text-destructive'
                          }
                        >
                          {num(p.taxa_conversao_pct, 1)}%
                        </Badge>
                      </td>
                      <td className="tabular px-2 py-2.5 text-right">{brl(p.ticket_medio)}</td>
                      <td className="tabular px-2 py-2.5 text-right">{num(p.agendamentos)}</td>
                      <td className="tabular px-2 py-2.5 text-right">{num(p.interacoes)}</td>
                      <td className="tabular px-2 py-2.5 text-right">
                        {p.dias_ate_fechamento == null ? '—' : num(p.dias_ate_fechamento, 1)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Comparações de tempo */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <BarrasCard
          titulo="Por dia da semana"
          descricao="Onde a venda realmente acontece"
          dados={porDiaSemana}
          loading={loading}
        />
        <BarrasCard
          titulo="Por faixa do dia"
          descricao="Melhor janela para fechar"
          dados={porHora}
          loading={loading}
        />
        <BarrasCard
          titulo="Por quinzena do mês"
          descricao="Início x fim de mês"
          dados={porQuinzena}
          loading={loading}
        />
      </div>

      {/* Dicas */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="size-4 text-gold-ink" />O que os números pedem
          </CardTitle>
          <CardDescription>
            Leitura automática do período — o que atacar primeiro para virar máquina de vendas.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2.5 pt-0 sm:grid-cols-2">
          {dicas.map((d) => (
            <div key={d.titulo} className="rounded-lg border border-border bg-muted/40 p-3">
              <div className="flex items-start gap-2">
                <Zap className="mt-0.5 size-3.5 shrink-0 text-gold-ink" />
                <div>
                  <div className="text-[13px] font-bold text-foreground">{d.titulo}</div>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted-foreground">
                    {d.texto}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Interações */}
      <CrcInteracoesTab ini={ini} fim={fim} crcFiltro={crcFiltro} crcs={crcs} onSaved={carregar} />
    </div>
  )
}

function KpiCard({
  titulo,
  valor,
  sub,
  loading,
  tone = 'default',
}: {
  titulo: string
  valor: string
  sub?: string
  loading?: boolean
  tone?: 'default' | 'success' | 'gold' | 'danger'
}) {
  const cor =
    tone === 'success'
      ? 'text-success'
      : tone === 'gold'
        ? 'text-gold-ink'
        : tone === 'danger'
          ? 'text-destructive'
          : 'text-foreground'
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          {titulo}
        </div>
        {loading ? (
          <Skeleton className="mt-2 h-7 w-24" />
        ) : (
          <div className={`tabular mt-1 text-[22px] font-extrabold leading-tight ${cor}`}>
            {valor}
          </div>
        )}
        {sub && <div className="mt-0.5 text-[11.5px] text-muted-foreground">{sub}</div>}
      </CardContent>
    </Card>
  )
}

function BarrasCard({
  titulo,
  descricao,
  dados,
  loading,
}: {
  titulo: string
  descricao: string
  dados: { rotulo: string; vendas: number; valor: number }[]
  loading?: boolean
}) {
  const max = Math.max(1, ...dados.map((d) => d.vendas))
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-[13.5px]">
          <BarChart3 className="size-4 text-muted-foreground" />
          {titulo}
        </CardTitle>
        <CardDescription className="text-[11.5px]">{descricao}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {loading && <Skeleton className="h-24 w-full" />}
        {!loading &&
          dados.map((d) => (
            <div key={d.rotulo}>
              <div className="mb-0.5 flex items-baseline justify-between text-[11.5px]">
                <span className="font-medium text-foreground">{d.rotulo}</span>
                <span className="tabular text-muted-foreground">
                  {d.vendas} · {brl(d.valor)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gold-ink"
                  style={{ width: `${Math.max(3, (d.vendas / max) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        {!loading && dados.length === 0 && (
          <p className="py-4 text-center text-xs text-muted-foreground">Sem dados no período.</p>
        )}
      </CardContent>
    </Card>
  )
}

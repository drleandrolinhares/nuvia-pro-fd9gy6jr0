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
  CheckCircle2,
  Lightbulb,
  RefreshCw,
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

const DIAS = ['Domingo', 'Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado']
const FAIXAS = ['Manha (ate 12h)', '12h-15h', '15h-18h', 'Noite (apos 18h)']
const QUINZENAS = ['1a quinzena', '2a quinzena']

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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vendas_confirmadas' }, () =>
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

  /** Agrega uma dimensão preenchendo os rótulos zerados (semana/faixa completa). */
  const seriePor = (dim: string, todos?: string[]) => {
    const mapa = new Map<
      string,
      { rotulo: string; ordem: number; avaliacoes: number; vendas: number; valor: number }
    >()
    todos?.forEach((r, i) =>
      mapa.set(r, { rotulo: r, ordem: i, avaliacoes: 0, vendas: 0, valor: 0 }),
    )
    series
      .filter((s) => s.dimensao === dim)
      .forEach((s) => {
        const atual = mapa.get(s.rotulo) ?? {
          rotulo: s.rotulo,
          ordem: Number(s.ordem),
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

  const avalDia = seriePor('avaliacao_dia_semana', DIAS)
  const vendaDia = seriePor('venda_dia_semana', DIAS)
  const vendaHora = seriePor('venda_hora', FAIXAS)
  const avalQuinzena = seriePor('avaliacao_quinzena', QUINZENAS)
  const vendaQuinzena = seriePor('venda_quinzena', QUINZENAS)

  const melhorDia = [...vendaDia].sort((a, b) => b.vendas - a.vendas)[0]
  const piorDia = [...vendaDia]
    .filter((d) => d.vendas > 0 || true)
    .sort((a, b) => a.vendas - b.vendas)[0]
  const melhorHora = [...vendaHora].sort((a, b) => b.vendas - a.vendas)[0]

  const dicas = useMemo(() => {
    const out: { titulo: string; texto: string }[] = []
    if (total.valor_aberto > 0)
      out.push({
        titulo: `${brl(total.valor_aberto)} em ${num(total.abertas)} oportunidades abertas`,
        texto:
          'Este é o valor já produzido e ainda não convertido. Priorize por valor e por tempo sem contato: é a alavanca mais rápida de receita.',
      })
    if (total.avaliacoes > 0)
      out.push({
        titulo: `Conversão de ${num(conversao, 1)}%`,
        texto: `${num(total.vendas)} vendas sobre ${num(total.avaliacoes)} avaliações no período. Referência saudável em clínica: 40% a 50%.`,
      })
    if (melhorDia && melhorDia.vendas > 0)
      out.push({
        titulo: `${melhorDia.rotulo} é o dia que mais fecha`,
        texto: `${melhorDia.vendas} vendas (${brl(melhorDia.valor)}). Concentre retorno de orçamento e tentativa de fechamento neste dia.`,
      })
    if (melhorHora && melhorHora.vendas > 0)
      out.push({
        titulo: `A faixa ${melhorHora.rotulo} concentra os fechamentos`,
        texto: `${melhorHora.vendas} vendas (${brl(melhorHora.valor)}). Proteja essa janela na agenda do CRC para retorno de orçamento.`,
      })
    if (total.interacoes === 0)
      out.push({
        titulo: 'Interações ainda não registradas por CRC',
        texto:
          'O resultado já é medido; o esforço ainda não. Registre cada contato com desfecho na aba de interações para calcular tempo médio de fechamento e toques por venda.',
      })
    return out
  }, [total, conversao, melhorDia, melhorHora])

  return (
    <div className="space-y-4">
      <PageHeader
        title="Performance CRC Comercial"
        description="Mesma base da Gestão de Vendas: oportunidades por avaliação, vendas por fechamento, agenda e interações."
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

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-muted-foreground">
        <span>
          Período: <strong className="text-foreground">{format(faixa.ini, 'dd/MM/yyyy')}</strong> a{' '}
          <strong className="text-foreground">{format(faixa.fim, 'dd/MM/yyyy')}</strong>
          {periodo === 'mes' && (
            <span className="ml-1 capitalize">
              · {format(faixa.ini, 'MMMM/yyyy', { locale: ptBR })}
            </span>
          )}
        </span>
        <span className="hidden sm:inline text-border-strong">|</span>
        <span className="inline-flex items-center gap-1">
          <CheckCircle2 className="size-3.5 text-success" />
          Oportunidades: <em>avaliações em aberto</em> · Vendas: <em>fechamentos</em>
        </span>
      </div>

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
          sub={`${brl(total.valor_aberto)} em aberto`}
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
          sub={`${num(total.agendamentos)} agendamentos na agenda`}
          loading={loading}
          tone={conversao >= 40 ? 'success' : conversao >= 25 ? 'gold' : 'danger'}
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="size-4 text-muted-foreground" />
            Performance por CRC
          </CardTitle>
          <CardDescription>
            Oportunidades e vendas separadas: uma mede o que foi gerado, a outra o que fechou.
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
                  <th className="px-2 py-2 text-right font-bold">Agenda</th>
                  <th className="px-2 py-2 text-right font-bold">Dias p/ fechar</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={10} className="py-6">
                      <Skeleton className="h-8 w-full" />
                    </td>
                  </tr>
                )}
                {!loading && perfis.length === 0 && (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-muted-foreground">
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
                      <td className="tabular px-2 py-2.5 text-right">
                        {p.dias_ate_fechamento == null ? '—' : num(p.dias_ate_fechamento, 1)}
                      </td>
                    </tr>
                  ))}
              </tbody>
              {!loading && perfis.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-border bg-muted/40 font-bold">
                    <td className="py-2.5 pr-3 text-foreground">TOTAL</td>
                    <td className="tabular px-2 py-2.5 text-right">{num(total.avaliacoes)}</td>
                    <td className="tabular px-2 py-2.5 text-right">
                      {brl(total.valor_oportunidades)}
                    </td>
                    <td className="tabular px-2 py-2.5 text-right text-gold-ink">
                      {brl(total.valor_aberto)}
                    </td>
                    <td className="tabular px-2 py-2.5 text-right">{num(total.vendas)}</td>
                    <td className="tabular px-2 py-2.5 text-right text-success">
                      {brl(total.valor_vendido)}
                    </td>
                    <td className="tabular px-2 py-2.5 text-right">{num(conversao, 1)}%</td>
                    <td className="tabular px-2 py-2.5 text-right">{brl(ticket)}</td>
                    <td className="tabular px-2 py-2.5 text-right">{num(total.agendamentos)}</td>
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <BarrasCard
          titulo="Avaliações por dia da semana"
          descricao="Quando o paciente chega para ser avaliado"
          dados={avalDia}
          metrica="avaliacoes"
          loading={loading}
        />
        <BarrasCard
          titulo="Vendas por dia da semana"
          descricao="Quando o fechamento acontece"
          dados={vendaDia}
          metrica="vendas"
          loading={loading}
        />
        <BarrasCard
          titulo="Vendas por faixa do dia"
          descricao="Horário do lançamento do fechamento"
          dados={vendaHora}
          metrica="vendas"
          loading={loading}
        />
        <div className="space-y-3">
          <BarrasCard
            titulo="Avaliações por quinzena"
            descricao="Início x fim de mês"
            dados={avalQuinzena}
            metrica="avaliacoes"
            loading={loading}
          />
          <BarrasCard
            titulo="Vendas por quinzena"
            descricao="Onde o mês vira resultado"
            dados={vendaQuinzena}
            metrica="vendas"
            loading={loading}
          />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="size-4 text-gold-ink" />O que os números pedem
          </CardTitle>
          <CardDescription>
            Leitura automática do período selecionado, sempre sobre os mesmos números da tabela.
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
  metrica,
  loading,
}: {
  titulo: string
  descricao: string
  dados: { rotulo: string; avaliacoes: number; vendas: number; valor: number }[]
  metrica: 'avaliacoes' | 'vendas'
  loading?: boolean
}) {
  const vals = dados.map((d) => (metrica === 'avaliacoes' ? d.avaliacoes : d.vendas))
  const max = Math.max(1, ...vals)
  const totalVals = vals.reduce((a, b) => a + b, 0)
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
          dados.map((d, i) => {
            const v = vals[i]
            const pct = totalVals > 0 ? Math.round((v / totalVals) * 100) : 0
            return (
              <div key={d.rotulo}>
                <div className="mb-0.5 flex items-baseline justify-between text-[11.5px]">
                  <span className="font-medium text-foreground">{d.rotulo}</span>
                  <span className="tabular text-muted-foreground">
                    {metrica === 'vendas'
                      ? `${v} vendas · ${brl(d.valor)}`
                      : `${v} avaliações${totalVals ? ` · ${pct}%` : ''}`}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gold-ink"
                    style={{ width: `${v === 0 ? 0 : Math.max(3, (v / max) * 100)}%` }}
                  />
                </div>
              </div>
            )
          })}
        {!loading && dados.every((d, i) => vals[i] === 0) && (
          <p className="py-3 text-center text-xs text-muted-foreground">Sem dados no período.</p>
        )}
      </CardContent>
    </Card>
  )
}

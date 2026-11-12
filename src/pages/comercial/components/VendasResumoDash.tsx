import { useEffect, useMemo, useState } from 'react'
import { Banknote, Percent, Stethoscope, Target, TrendingUp, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase/client'

const brl = (v: number | null | undefined) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v ?? 0))

const num = (v: number | null | undefined, d = 0) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d }).format(
    Number(v ?? 0),
  )

type Item = {
  nome: string
  quantidade: number
  valor: number
  entradas?: number
  dias_medio?: number | null
}

type Resumo = {
  modo: string
  linhas: number
  pacientes: number
  valor_total: number
  entradas: number
  pct_medio_entrada: number
  pct_medio_campo: number | null
  dias_medio_fechamento: number | null
  dentistas: Item[]
  por_origem: Item[]
}

/**
 * Dashboard das abas da Gestão de Vendas.
 * Vem de public.vendas_dashboard(), que usa as MESMAS fontes das tabelas:
 * oportunidade = avaliacoes em aberto por data_avaliacao;
 * venda = vendas_confirmadas por data_fechamento.
 */
export function VendasResumoDash({
  modo,
  ini,
  fim,
  refreshKey,
}: {
  modo: 'oportunidades' | 'vendas'
  ini: string
  fim: string
  refreshKey?: number
}) {
  const [d, setD] = useState<Resumo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let vivo = true
    setLoading(true)
    supabase.rpc('vendas_dashboard', { p_ini: ini, p_fim: fim, p_modo: modo }).then(({ data }) => {
      if (!vivo) return
      setD((data as unknown as Resumo) ?? null)
      setLoading(false)
    })
    return () => {
      vivo = false
    }
  }, [modo, ini, fim, refreshKey])

  const venda = modo === 'vendas'
  const principalTitulo = venda ? 'Vendas lançadas' : 'Oportunidades'
  const valorTitulo = venda ? 'Total fechado' : 'Oportunidades em aberto'

  // Denominadores dos percentuais: soma das linhas de cada lista
  const totalQtd = useMemo(
    () => (d?.dentistas ?? []).reduce((a, x) => a + Number(x.quantidade), 0),
    [d],
  )
  const totalValor = useMemo(
    () => (d?.dentistas ?? []).reduce((a, x) => a + Number(x.valor), 0),
    [d],
  )
  const totalQtdOrigem = useMemo(
    () => (d?.por_origem ?? []).reduce((a, x) => a + Number(x.quantidade), 0),
    [d],
  )
  const totalValorOrigem = useMemo(
    () => (d?.por_origem ?? []).reduce((a, x) => a + Number(x.valor), 0),
    [d],
  )

  return (
    <div className="space-y-3">
      {/* KPIs principais */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Mini
          titulo={principalTitulo}
          valor={num(d?.linhas)}
          destaque={venda ? 'vendas' : 'oportunidades'}
          sub={`de ${num(d?.pacientes)} ${d?.pacientes === 1 ? 'paciente' : 'pacientes'}`}
          icon={Users}
          loading={loading}
        />
        <Mini
          titulo={valorTitulo}
          valor={brl(d?.valor_total)}
          sub={venda ? 'valor dos tratamentos' : 'soma dos orçamentos'}
          icon={Target}
          tone="gold"
          loading={loading}
        />
        <Mini
          titulo={venda ? 'Entradas' : 'Entradas previstas'}
          valor={brl(d?.entradas)}
          sub="soma do valor de entrada"
          icon={Banknote}
          tone="success"
          loading={loading}
        />
        <Mini
          titulo={venda ? '% médio de entrada' : '% médio de entrada'}
          valor={`${num(d?.pct_medio_entrada, 1)}%`}
          sub={venda ? 'entradas ÷ valor fechado' : 'entradas ÷ orçamento'}
          icon={Percent}
          loading={loading}
        />
      </div>

      {venda && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Mini
            titulo="Tempo médio de fechamento"
            valor={d?.dias_medio_fechamento == null ? '—' : `${num(d.dias_medio_fechamento, 1)} d`}
            sub="fechamento − avaliação"
            icon={TrendingUp}
            tone={
              d?.dias_medio_fechamento == null
                ? 'default'
                : d.dias_medio_fechamento <= 7
                  ? 'success'
                  : d.dias_medio_fechamento <= 20
                    ? 'gold'
                    : 'danger'
            }
            loading={loading}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {/* Dentistas */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-[13.5px]">
              <Stethoscope className="size-4 text-muted-foreground" />
              {venda ? 'Fechamentos por dentista avaliador' : 'Avaliações por dentista'}
            </CardTitle>
            <CardDescription className="text-[11.5px]">
              {venda
                ? 'Quantos fechamentos e quanto em R$ cada avaliador respondeu.'
                : 'Quantas avaliações cada avaliador realizou no período.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {loading && <Skeleton className="h-16 w-full" />}
            {!loading && (d?.dentistas?.length ?? 0) === 0 && (
              <p className="py-3 text-center text-xs text-muted-foreground">
                Sem dados no período.
              </p>
            )}
            <div className="divide-y divide-border">
              {!loading &&
                (d?.dentistas ?? []).map((x) => {
                  const pctQtd = totalQtd > 0 ? (x.quantidade / totalQtd) * 100 : 0
                  const pctValor = totalValor > 0 ? (x.valor / totalValor) * 100 : 0
                  return (
                    <div key={x.nome} className="flex items-center justify-between gap-3 py-1.5">
                      <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-foreground">
                        {x.nome}
                      </span>
                      <span className="flex shrink-0 items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className="tabular border-info/40 bg-info/10 px-1.5 py-0 text-[10.5px] font-bold text-info"
                          title={`${num(x.quantidade)} de ${num(totalQtd)} ${venda ? 'vendas' : 'avaliações'}`}
                        >
                          {num(pctQtd, 0)}%
                        </Badge>
                        <Badge
                          variant="outline"
                          className="tabular border-gold-ink/40 bg-gold-ink/10 px-1.5 py-0 text-[10.5px] font-bold text-gold-ink"
                          title={`${brl(x.valor)} de ${brl(totalValor)}`}
                        >
                          {num(pctValor, 0)}%
                        </Badge>
                        <span className="tabular text-[12.5px] text-muted-foreground">
                          <strong className="text-foreground">{num(x.quantidade)}</strong>
                          {venda ? ` fech. · ${brl(x.valor)}` : ` aval. · ${brl(x.valor)}`}
                        </span>
                      </span>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>

        {/* Origem / participação */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-[13.5px]">
              <Users className="size-4 text-muted-foreground" />
              {venda ? 'Participação na venda' : 'Origem da oportunidade'}
            </CardTitle>
            <CardDescription className="text-[11.5px]">
              {venda
                ? 'Conversão Direta = venda feita no consultório pelo dentista, sem negociação do CRC. Nela o CRC não participa nem recebe comissão.'
                : 'Quem responde pela oportunidade em aberto.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {loading && <Skeleton className="h-16 w-full" />}
            <div className="space-y-1.5">
              {!loading &&
                (d?.por_origem ?? []).map((o) => {
                  const total = d?.valor_total || 1
                  const pct = Math.round((o.valor / total) * 100)
                  const pctQtd = totalQtdOrigem > 0 ? (o.quantidade / totalQtdOrigem) * 100 : 0
                  const pctValor = totalValorOrigem > 0 ? (o.valor / totalValorOrigem) * 100 : 0
                  const direta = /convers/i.test(o.nome)
                  return (
                    <div key={o.nome}>
                      <div className="mb-0.5 flex items-baseline justify-between gap-2 text-[12px]">
                        <span className="flex min-w-0 items-center gap-1.5 font-medium text-foreground">
                          <span className="truncate">{o.nome}</span>
                          {venda && direta && (
                            <Badge
                              variant="outline"
                              className="shrink-0 border-border bg-muted px-1 py-0 text-[9.5px] font-semibold uppercase text-muted-foreground"
                            >
                              sem CRC
                            </Badge>
                          )}
                        </span>
                        <span className="flex shrink-0 items-center gap-1.5 tabular text-muted-foreground">
                          <Badge
                            variant="outline"
                            className="tabular border-info/40 bg-info/10 px-1.5 py-0 text-[10.5px] font-bold text-info"
                            title={`${num(o.quantidade)} de ${num(totalQtdOrigem)} ${venda ? 'vendas' : 'oportunidades'}`}
                          >
                            {num(pctQtd, 0)}%
                          </Badge>
                          <Badge
                            variant="outline"
                            className="tabular border-gold-ink/40 bg-gold-ink/10 px-1.5 py-0 text-[10.5px] font-bold text-gold-ink"
                            title={`${brl(o.valor)} de ${brl(totalValorOrigem)}`}
                          >
                            {num(pctValor, 0)}%
                          </Badge>
                          <span>
                            {num(o.quantidade)}
                            {venda ? ' vendas' : ' oport.'} · {brl(o.valor)}
                            {venda && o.dias_medio != null ? ` · ${num(o.dias_medio, 1)}d` : ''}
                          </span>
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${direta ? 'bg-border-strong' : 'bg-gold-ink'}`}
                          style={{ width: `${Math.max(2, pct)}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
            {!loading && venda && (d?.por_origem?.length ?? 0) > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5 border-t border-border pt-2">
                {(d?.por_origem ?? []).map((o) => (
                  <Badge
                    key={o.nome}
                    variant="outline"
                    className="border-border bg-muted text-foreground/80"
                  >
                    {o.nome}: {num(o.quantidade)} · {brl(o.valor)}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {venda && d?.pct_medio_campo != null && (
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          <strong className="text-foreground/80">Nota sobre o % de entrada:</strong> o percentual
          médio mostrado acima é ponderado (soma das entradas ÷ soma do valor). O campo
          “percentual_entrada” do cadastro marca {num(d.pct_medio_campo, 0)}% em média porque venda
          de balcão é lançada com entrada igual ao total — por isso não é usado como indicador.
        </p>
      )}
    </div>
  )
}

function Mini({
  titulo,
  valor,
  sub,
  destaque,
  icon: Icon,
  tone = 'default',
  loading,
}: {
  titulo: string
  valor: string
  sub?: string
  /** Rótulo curto ao lado do número principal (ex.: "vendas"). */
  destaque?: string
  icon: React.ElementType
  tone?: 'default' | 'success' | 'gold' | 'danger'
  loading?: boolean
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
      <CardContent className="p-3.5">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
          <Icon className="size-3" />
          {titulo}
        </div>
        {loading ? (
          <Skeleton className="mt-2 h-7 w-20" />
        ) : (
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className={`tabular text-[27px] font-extrabold leading-none ${cor}`}>
              {valor}
            </span>
            {destaque && (
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {destaque}
              </span>
            )}
          </div>
        )}
        {sub && <div className="mt-1 text-[11px] font-medium text-muted-foreground">{sub}</div>}
      </CardContent>
    </Card>
  )
}

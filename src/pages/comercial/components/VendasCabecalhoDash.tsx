import { useEffect, useState } from 'react'
import { ArrowRight, Banknote, CalendarCheck, Handshake, Target, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase/client'

const brl = (v: number | null | undefined) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v ?? 0))

const num = (v: number | null | undefined, d = 0) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d }).format(
    Number(v ?? 0),
  )

type Cab = {
  pacientes_avaliados: number
  avaliacoes: number
  op_qtd: number
  op_valor: number
  vendas_qtd: number
  vendas_valor: number
  oportunidade_total: number
  pct_aberto: number
  pct_vendido: number
}

/**
 * Cabeçalho da Gestão de Vendas.
 *
 * A leitura é uma conta só, que fecha na vertical e na horizontal:
 *   OPORTUNIDADE TOTAL = o que está em aberto + o que já foi vendido
 *
 * Por isso os dois blocos ficam lado a lado, com o total embaixo deles,
 * e cada bloco mostra sua fatia em % do total.
 */
export function VendasCabecalhoDash({
  ini,
  fim,
  refreshKey,
}: {
  ini: string
  fim: string
  refreshKey?: number
}) {
  const [d, setD] = useState<Cab | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let vivo = true
    setLoading(true)
    supabase.rpc('vendas_cabecalho', { p_ini: ini, p_fim: fim }).then(({ data }) => {
      if (!vivo) return
      setD((data as unknown as Cab) ?? null)
      setLoading(false)
    })
    return () => {
      vivo = false
    }
  }, [ini, fim, refreshKey])

  return (
    <Card>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 divide-y divide-border md:grid-cols-12 md:divide-x md:divide-y-0">
          {/* 1. Pacientes avaliados */}
          <div className="p-4 md:col-span-3">
            <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.11em] text-muted-foreground">
              <Users className="size-3.5" />
              Pacientes avaliados
            </div>
            {loading ? (
              <Skeleton className="mt-2 h-8 w-20" />
            ) : (
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="tabular text-[30px] font-extrabold leading-none text-foreground">
                  {num(d?.pacientes_avaliados)}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">pacientes</span>
              </div>
            )}
            <p className="mt-1 text-[11.5px] leading-tight text-muted-foreground">
              {num(d?.avaliacoes)} avaliações lançadas
              {d
                ? ` · ${num(d.avaliacoes - d.pacientes_avaliados)} paciente(s) com mais de uma`
                : ''}
            </p>
          </div>

          {/* 2. Oportunidade total (a soma) */}
          <div className="bg-muted/40 p-4 md:col-span-3">
            <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.11em] text-gold-ink">
              <Target className="size-3.5" />
              Oportunidade total
            </div>
            {loading ? (
              <Skeleton className="mt-2 h-8 w-28" />
            ) : (
              <div className="tabular mt-1 text-[30px] font-extrabold leading-none text-gold-ink">
                {brl(d?.oportunidade_total)}
              </div>
            )}
            <p className="mt-1 text-[11.5px] leading-tight text-muted-foreground">
              {brl(d?.op_valor)} em aberto + {brl(d?.vendas_valor)} vendido
            </p>
          </div>

          {/* 3 e 4. As duas partes, com barra e % */}
          <div className="p-4 md:col-span-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <Parte
                icone={Handshake}
                titulo="Em aberto"
                valor={d?.op_valor}
                qtd={d?.op_qtd}
                qtdLabel="oportunidades"
                pct={d?.pct_aberto}
                corTexto="text-info"
                corBarra="bg-info"
                corBorda="border-info/35"
                corFundo="bg-info/8"
                loading={loading}
              />
              <Parte
                icone={Banknote}
                titulo="Vendido"
                valor={d?.vendas_valor}
                qtd={d?.vendas_qtd}
                qtdLabel="vendas"
                pct={d?.pct_vendido}
                corTexto="text-success"
                corBarra="bg-success"
                corBorda="border-success/35"
                corFundo="bg-success/8"
                loading={loading}
              />
            </div>

            {/* Régua única mostrando as duas fatias */}
            {!loading && (
              <div className="mt-3">
                <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-info"
                    style={{ width: `${d?.pct_aberto ?? 0}%` }}
                    title={`Em aberto: ${num(d?.pct_aberto, 1)}%`}
                  />
                  <div
                    className="h-full bg-success"
                    style={{ width: `${d?.pct_vendido ?? 0}%` }}
                    title={`Vendido: ${num(d?.pct_vendido, 1)}%`}
                  />
                </div>
                <div className="mt-1 flex items-center justify-between text-[10.5px] font-semibold text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-info" />
                    {num(d?.pct_aberto, 1)}% em aberto
                  </span>
                  <span className="inline-flex items-center gap-1">
                    {num(d?.pct_vendido, 1)}% vendido
                    <span className="size-1.5 rounded-full bg-success" />
                  </span>
                </div>
              </div>
            )}

            {/* Régua da conta: tudo pela data da AVALIAÇÃO */}
            <p className="mt-2 text-[10.5px] leading-relaxed text-muted-foreground">
              Conta pela <strong className="text-foreground/80">data da avaliação</strong>: a
              oportunidade nasce na avaliação e entra em um grupo só — {num(d?.op_qtd)} em aberto +{' '}
              {num(d?.vendas_qtd)} vendidas = {num(d?.avaliacoes)}. A aba Vendas Concretizadas usa
              outra régua (data de <em>fechamento</em>), por isso os totais das duas abas diferem.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function Parte({
  icone: Icone,
  titulo,
  valor,
  qtd,
  qtdLabel,
  pct,
  corTexto,
  corBarra,
  corBorda,
  corFundo,
  loading,
}: {
  icone: React.ElementType
  titulo: string
  valor: number | undefined
  qtd: number | undefined
  qtdLabel: string
  pct: number | undefined
  corTexto: string
  corBarra: string
  corBorda: string
  corFundo: string
  loading: boolean
}) {
  return (
    <div className={`rounded-lg border ${corBorda} ${corFundo} p-2.5`}>
      <div className="flex items-center justify-between gap-1">
        <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
          <Icone className="size-3.5" />
          {titulo}
        </span>
        {!loading && (
          <Badge
            variant="outline"
            className={`tabular shrink-0 border-current/40 bg-card px-1.5 py-0 text-[10.5px] font-bold ${corTexto}`}
          >
            {num(pct, 1)}%
          </Badge>
        )}
      </div>
      {loading ? (
        <Skeleton className="mt-1.5 h-6 w-24" />
      ) : (
        <div className={`tabular mt-1 text-[19px] font-extrabold leading-tight ${corTexto}`}>
          {brl(valor)}
        </div>
      )}
      <div className="mt-0.5 text-[11px] text-muted-foreground">
        {num(qtd)} {qtdLabel}
      </div>
      {!loading && (
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-card">
          <div
            className={`h-full rounded-full ${corBarra}`}
            style={{ width: `${Math.min(100, pct ?? 0)}%` }}
          />
        </div>
      )}
    </div>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { KPIData } from '../hooks/use-vendas-kpis'
import { cn } from '@/lib/utils'

interface Props {
  kpis: KPIData | null
  trends: Record<keyof KPIData, number> | null
  loading: boolean
}

export function VendasKPIs({ kpis, trends, loading }: Props) {
  if (loading || !kpis || !trends) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 h-24 flex items-center justify-center">
              <Skeleton className="h-full w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
  const formatPercent = (v: number) => `${v.toFixed(1)}%`
  const formatNumber = (v: number) => v.toString()
  const formatDays = (v: number) => `${v} dias`

  const renderTrend = (value: number, invertColors = false) => {
    if (value === 0) {
      return (
        <span className="text-muted-foreground flex items-center text-xs mt-1 font-medium">
          <Minus className="w-3 h-3 mr-1" /> 0%
        </span>
      )
    }

    const isPositive = value > 0
    const isGood = invertColors ? !isPositive : isPositive
    const colorClass = isGood ? 'text-emerald-500' : 'text-rose-500'
    const Icon = isPositive ? ArrowUpRight : ArrowDownRight

    return (
      <span className={cn('flex items-center text-xs mt-1 font-medium', colorClass)}>
        <Icon className="w-3 h-3 mr-1" /> {Math.abs(value).toFixed(1)}%
      </span>
    )
  }

  const cards = [
    {
      title: 'Avaliações Realizadas',
      value: formatNumber(kpis.avaliacoesRealizadas),
      trend: trends.avaliacoesRealizadas,
    },
    {
      title: 'Valor Oportunidades',
      value: formatCurrency(kpis.valorTotalOportunidades),
      trend: trends.valorTotalOportunidades,
    },
    { title: 'Ticket Médio', value: formatCurrency(kpis.ticketMedio), trend: trends.ticketMedio },
    {
      title: 'Vendas Concretizadas',
      value: formatNumber(kpis.vendasConcretizadas),
      trend: trends.vendasConcretizadas,
    },
    {
      title: 'Valor Vendido',
      value: formatCurrency(kpis.valorTotalVendido),
      trend: trends.valorTotalVendido,
    },
    {
      title: 'Taxa de Conversão',
      value: formatPercent(kpis.taxaConversao),
      trend: trends.taxaConversao,
    },
    {
      title: 'Ciclo Médio de Vendas',
      value: formatDays(kpis.cicloMedioVendas),
      trend: trends.cicloMedioVendas,
      invertTrend: true,
    },
    {
      title: 'Em Follow-up',
      value: formatNumber(kpis.pacientesFollowUp),
      trend: trends.pacientesFollowUp,
    },
    { title: 'Leads Quentes', value: formatNumber(kpis.leadsQuentes), trend: trends.leadsQuentes },
    { title: 'Leads Mornos', value: formatNumber(kpis.leadsMornos), trend: trends.leadsMornos },
    {
      title: 'Leads Frios',
      value: formatNumber(kpis.leadsFrios),
      trend: trends.leadsFrios,
      invertTrend: true,
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
      {cards.map((card, idx) => (
        <Card key={idx} className="overflow-hidden">
          <CardHeader className="p-4 pb-2">
            <CardTitle
              className="text-xs font-medium text-muted-foreground line-clamp-1"
              title={card.title}
            >
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold truncate" title={card.value}>
              {card.value}
            </div>
            {renderTrend(card.trend, card.invertTrend)}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

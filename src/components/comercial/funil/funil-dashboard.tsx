import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OrigemCard } from './origem-card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import {
  Users,
  DollarSign,
  Target,
  TrendingUp,
  PieChart as PieChartIcon,
  CheckSquare,
  Percent,
} from 'lucide-react'

export function FunilDashboard({ origens, dados, mesReferencia, avaliacoes, onUpdate }: any) {
  const totais = useMemo(() => {
    return dados.reduce(
      (acc: any, curr: any) => ({
        investimento: acc.investimento + Number(curr.investimento || 0),
        leads: acc.leads + Number(curr.leads_realizado || 0),
        agendamentos: acc.agendamentos + Number(curr.agendamentos_realizado || 0),
        comparecimentos: acc.comparecimentos + Number(curr.comparecimentos_realizado || 0),
        faltas: acc.faltas + Number(curr.faltas_realizado || 0),
        fechamentos: acc.fechamentos + Number(curr.fechamentos_qtde_realizado || 0),
        valor_fechado: acc.valor_fechado + Number(curr.fechamentos_valor_realizado || 0),
      }),
      {
        investimento: 0,
        leads: 0,
        agendamentos: 0,
        comparecimentos: 0,
        faltas: 0,
        fechamentos: 0,
        valor_fechado: 0,
      },
    )
  }, [dados])

  const totalAvaliacoes = avaliacoes ? avaliacoes.length : 0

  const valorOportunidades = useMemo(() => {
    if (!avaliacoes) return 0
    return avaliacoes.reduce(
      (acc: number, curr: any) => acc + (Number(curr.valor_orcamento) || 0),
      0,
    )
  }, [avaliacoes])

  const conversaoTotal = useMemo(() => {
    if (valorOportunidades === 0) return 0
    return (totais.valor_fechado / valorOportunidades) * 100
  }, [totais.valor_fechado, valorOportunidades])

  const pieData = useMemo(() => {
    return origens
      .filter((o: any) => o.ativo)
      .map((o: any) => {
        const d = dados.find((x: any) => x.origem_id === o.id)
        return { name: o.nome, value: d ? Number(d.leads_realizado) : 0 }
      })
      .filter((x: any) => x.value > 0)
  }, [origens, dados])

  const COLORS = [
    '#f59e0b',
    '#3b82f6',
    '#10b981',
    '#ef4444',
    '#8b5cf6',
    '#d946ef',
    '#f97316',
    '#06b6d4',
  ]

  const chartConfig = {
    value: { label: 'Leads', color: 'hsl(var(--chart-1))' },
  }

  const barData = useMemo(() => {
    return origens
      .filter((o: any) => o.ativo)
      .map((o: any) => {
        const d = dados.find((x: any) => x.origem_id === o.id)
        return {
          name: o.nome,
          investimento: d ? Number(d.investimento) : 0,
          receita: d ? Number(d.fechamentos_valor_realizado) : 0,
        }
      })
      .filter((x: any) => x.investimento > 0 || x.receita > 0)
  }, [origens, dados])

  const barChartConfig = {
    investimento: { label: 'Investimento', color: '#ef4444' },
    receita: { label: 'Receita', color: '#10b981' },
  }

  const formatBrl = (v: number) =>
    Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-2 gap-4">
        <Card className="bg-slate-900 border-slate-800 shadow-sm transition-all hover:border-slate-700">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Leads
            </CardTitle>
            <Users className="w-5 h-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{totais.leads}</div>
            <p className="text-xs text-slate-400 mt-1">Total captado no período</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 shadow-sm transition-all hover:border-slate-700">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Avaliações
            </CardTitle>
            <CheckSquare className="w-5 h-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{totalAvaliacoes}</div>
            <p className="text-xs text-slate-400 mt-1">Total realizadas no período</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800 shadow-sm">
          <CardHeader className="border-b border-slate-800/50 pb-4">
            <CardTitle className="text-white font-semibold text-lg flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-amber-500" />
              Distribuição de Leads por Origem
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[320px] pt-6">
            {pieData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-full w-full">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {pieData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="flex flex-col h-full items-center justify-center text-slate-500 gap-2">
                <Users className="w-8 h-8 text-slate-700" />
                <span>Sem dados de leads no período</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 shadow-sm">
          <CardHeader className="border-b border-slate-800/50 pb-4">
            <CardTitle className="text-white font-semibold text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              Performance Financeira
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[320px] pt-6">
            {barData.length > 0 ? (
              <ChartContainer config={barChartConfig} className="h-full w-full">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `R$ ${value / 1000}k`}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent formatter={(value) => formatBrl(Number(value))} />
                    }
                  />
                  <Bar
                    dataKey="investimento"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                    name="Investimento"
                  />
                  <Bar dataKey="receita" fill="#10b981" radius={[4, 4, 0, 0]} name="Receita" />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex flex-col h-full items-center justify-center text-slate-500 gap-2">
                <DollarSign className="w-8 h-8 text-slate-700" />
                <span>Sem dados financeiros no período</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6 pt-4">
        <div className="flex items-center gap-4 py-2 mt-4">
          <div className="h-px bg-slate-800 flex-1"></div>
          <div className="flex items-center gap-2 bg-slate-800 px-6 py-3 rounded-md border border-slate-700 shadow-sm">
            <Target className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-white tracking-widest uppercase">
              Detalhamento da Cascata
            </h3>
          </div>
          <div className="h-px bg-slate-800 flex-1"></div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {origens
            .filter((o: any) => o.ativo)
            .map((origem: any) => (
              <OrigemCard
                key={origem.id}
                origem={origem}
                dado={dados.find((d: any) => d.origem_id === origem.id)}
                mesReferencia={mesReferencia}
                onUpdate={onUpdate}
              />
            ))}
          {origens.filter((o: any) => o.ativo).length === 0 && (
            <div className="col-span-full p-12 text-center text-slate-400 bg-slate-900/50 rounded-lg border border-slate-800 flex flex-col items-center gap-3">
              <Target className="w-12 h-12 text-slate-700" />
              <p className="text-lg">Nenhuma origem ativa encontrada.</p>
              <p className="text-sm">
                Adicione fontes em "Origens" no topo da página para começar a analisar seu funil.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

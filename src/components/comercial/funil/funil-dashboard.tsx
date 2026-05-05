import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OrigemCard } from './origem-card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

export function FunilDashboard({ origens, dados, mesReferencia, onUpdate }: any) {
  const totais = useMemo(() => {
    return dados.reduce(
      (acc: any, curr: any) => ({
        investimento: acc.investimento + Number(curr.investimento),
        leads: acc.leads + Number(curr.leads_realizado),
        agendamentos: acc.agendamentos + Number(curr.agendamentos_realizado),
        comparecimentos: acc.comparecimentos + Number(curr.comparecimentos_realizado),
        fechamentos: acc.fechamentos + Number(curr.fechamentos_qtde_realizado),
        valor_fechado: acc.valor_fechado + Number(curr.fechamentos_valor_realizado),
      }),
      {
        investimento: 0,
        leads: 0,
        agendamentos: 0,
        comparecimentos: 0,
        fechamentos: 0,
        valor_fechado: 0,
      },
    )
  }, [dados])

  const pieData = useMemo(() => {
    return origens
      .filter((o: any) => o.ativo)
      .map((o: any) => {
        const d = dados.find((x: any) => x.origem_id === o.id)
        return { name: o.nome, value: d ? Number(d.leads_realizado) : 0 }
      })
      .filter((x: any) => x.value > 0)
  }, [origens, dados])

  const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#d946ef']

  const chartConfig = {
    value: { label: 'Leads', color: 'hsl(var(--chart-1))' },
  }

  const formatBrl = (v: number) =>
    Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400 uppercase tracking-wider">
              Total Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{totais.leads}</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400 uppercase tracking-wider">
              CPL Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {totais.leads ? formatBrl(totais.investimento / totais.leads) : 'R$ 0,00'}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400 uppercase tracking-wider">
              Total Vendas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-500">
              {formatBrl(totais.valor_fechado)}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400 uppercase tracking-wider">
              Ticket Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {totais.fechamentos
                ? formatBrl(totais.valor_fechado / totais.fechamentos)
                : 'R$ 0,00'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Distribuição de Leads</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {pieData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-full w-full">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {pieData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500">
                Sem dados de leads no período
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white mt-8 tracking-wide">
          Detalhamento da Cascata por Origem
        </h3>
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
            <div className="col-span-full p-8 text-center text-slate-500 bg-slate-900/50 rounded-lg border border-slate-800">
              Nenhuma origem ativa encontrada. Adicione fontes em "Origens" no topo da página.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

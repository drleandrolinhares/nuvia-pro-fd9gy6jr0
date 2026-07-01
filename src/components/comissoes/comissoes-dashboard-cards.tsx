import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Stethoscope, Headphones, TrendingUp, Wallet } from 'lucide-react'
import type { DashboardTotals } from '@/services/comissoes-dashboard'

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

export function ComissoesDashboardCards({
  totals,
  competencia,
}: {
  totals: DashboardTotals
  competencia: string
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-slate-900 border-slate-800 shadow-lg overflow-hidden relative border-l-4 border-l-amber-500">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Comissões Dentistas
          </CardTitle>
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <Stethoscope className="w-5 h-5 text-amber-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {formatCurrency(totals.totalComissaoDentista)}
          </div>
          <p className="text-xs text-slate-500 mt-1">{competencia}</p>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800 shadow-lg overflow-hidden relative border-l-4 border-l-emerald-500">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Comissões CRC
          </CardTitle>
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Headphones className="w-5 h-5 text-emerald-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {formatCurrency(totals.totalComissaoCRC)}
          </div>
          <p className="text-xs text-slate-500 mt-1">{competencia}</p>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800 shadow-lg overflow-hidden relative border-l-4 border-l-blue-500">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Volume de Vendas
          </CardTitle>
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{formatCurrency(totals.totalVendas)}</div>
          <p className="text-xs text-slate-500 mt-1">{competencia}</p>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800 shadow-lg overflow-hidden relative border-l-4 border-l-violet-500">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Total de Entradas
          </CardTitle>
          <div className="p-2 bg-violet-500/10 rounded-lg">
            <Wallet className="w-5 h-5 text-violet-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{formatCurrency(totals.totalEntries)}</div>
          <p className="text-xs text-slate-500 mt-1">
            {totals.totalVendas > 0
              ? `${((totals.totalEntries / totals.totalVendas) * 100).toFixed(1)}% do volume`
              : competencia}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

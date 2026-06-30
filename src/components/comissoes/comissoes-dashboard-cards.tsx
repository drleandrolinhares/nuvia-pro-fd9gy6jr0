import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Stethoscope, Headphones, TrendingUp } from 'lucide-react'
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-slate-900 border-slate-800 shadow-lg overflow-hidden relative">
        <div className="absolute -top-4 -right-4 p-4 opacity-5">
          <Stethoscope className="w-32 h-32 text-white" />
        </div>
        <CardHeader className="pb-2 relative z-10 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider">
            Total Comissões Dentistas
          </CardTitle>
          <Stethoscope className="w-5 h-5 text-amber-500" />
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-2xl font-bold text-amber-400">
            {formatCurrency(totals.totalComissaoDentista)}
          </div>
          <p className="text-xs text-slate-500 mt-1">{competencia}</p>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800 shadow-lg overflow-hidden relative">
        <div className="absolute -top-4 -right-4 p-4 opacity-5">
          <Headphones className="w-32 h-32 text-white" />
        </div>
        <CardHeader className="pb-2 relative z-10 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider">
            Total Comissões CRC
          </CardTitle>
          <Headphones className="w-5 h-5 text-emerald-500" />
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-2xl font-bold text-emerald-400">
            {formatCurrency(totals.totalComissaoCRC)}
          </div>
          <p className="text-xs text-slate-500 mt-1">{competencia}</p>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800 shadow-lg overflow-hidden relative">
        <div className="absolute -top-4 -right-4 p-4 opacity-5">
          <TrendingUp className="w-32 h-32 text-white" />
        </div>
        <CardHeader className="pb-2 relative z-10 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider">
            Volume de Vendas (Mês)
          </CardTitle>
          <TrendingUp className="w-5 h-5 text-blue-500" />
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-2xl font-bold text-blue-400">
            {formatCurrency(totals.totalVendas)}
          </div>
          <p className="text-xs text-slate-500 mt-1">{competencia}</p>
        </CardContent>
      </Card>
    </div>
  )
}

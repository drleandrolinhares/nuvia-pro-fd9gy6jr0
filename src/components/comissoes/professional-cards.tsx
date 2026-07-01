import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Stethoscope, Headphones, TrendingUp, DollarSign, Receipt, Percent } from 'lucide-react'
import type { ProfessionalSummary } from '@/services/comissoes-dashboard'

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

export function ProfessionalCards({ profissionais }: { profissionais: ProfessionalSummary[] }) {
  if (profissionais.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        Nenhum profissional com comissões no período selecionado.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {profissionais.map((prof) => {
        const isDentista = prof.tipo === 'Dentista'
        const Icon = isDentista ? Stethoscope : Headphones
        const accentBg = isDentista ? 'bg-amber-50' : 'bg-emerald-50'
        const accentText = isDentista ? 'text-amber-600' : 'text-emerald-600'
        const accentBorder = isDentista ? 'border-amber-200' : 'border-emerald-200'
        const accentBadge = isDentista
          ? 'border-amber-200 text-amber-700 bg-amber-50'
          : 'border-emerald-200 text-emerald-700 bg-emerald-50'
        const commissionColor = isDentista ? 'text-amber-600' : 'text-emerald-600'

        return (
          <Card
            key={prof.id + prof.tipo}
            className="bg-white border-slate-200 shadow-sm overflow-hidden hover:shadow-md hover:border-slate-300 transition-all duration-200"
          >
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${accentBg}`}>
                  <Icon className={`w-4 h-4 ${accentText}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-950 truncate">{prof.nome}</p>
                  <Badge
                    variant="outline"
                    className={`mt-0.5 text-[10px] py-0 px-1.5 ${accentBadge}`}
                  >
                    {prof.tipo}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className={`rounded-lg border ${accentBorder} bg-slate-50/50 p-2`}>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium uppercase tracking-wide">
                    <TrendingUp className="w-3 h-3" />
                    Vendas ({prof.qtdeVendas})
                  </div>
                  <p className="text-sm font-bold text-slate-950 mt-0.5">
                    {formatCurrency(prof.totalVendas)}
                  </p>
                </div>
                <div className={`rounded-lg border ${accentBorder} bg-slate-50/50 p-2`}>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium uppercase tracking-wide">
                    <DollarSign className="w-3 h-3" />
                    Entradas
                  </div>
                  <p className="text-sm font-bold text-slate-950 mt-0.5">
                    {formatCurrency(prof.totalEntries)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5" />
                  Performance
                </span>
                <span className="font-bold text-slate-950">{prof.entryPercentage.toFixed(1)}%</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1">
                  <Receipt className="w-3.5 h-3.5" />
                  Taxa de Comissão
                </span>
                <span className="font-bold text-slate-950">{prof.commissionRate.toFixed(1)}%</span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-600 font-semibold uppercase tracking-wider">
                  Comissão a Pagar
                </span>
                <span className={`text-lg font-bold ${commissionColor}`}>
                  {formatCurrency(prof.totalComissao)}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-amber-600 font-medium">
                  Em Aberto: {formatCurrency(prof.comissaoAberta)}
                </span>
                <span className="text-emerald-600 font-medium">
                  Pago: {formatCurrency(prof.comissaoPaga)}
                </span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

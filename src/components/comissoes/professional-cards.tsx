import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Stethoscope, Headphones, TrendingUp, DollarSign, Receipt, Percent } from 'lucide-react'
import type { ProfessionalSummary } from '@/services/comissoes-dashboard'

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

export function ProfessionalCards({ profissionais }: { profissionais: ProfessionalSummary[] }) {
  if (profissionais.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        Nenhum profissional com comissões no período selecionado.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {profissionais.map((prof) => {
        const isDentista = prof.tipo === 'Dentista'
        const Icon = isDentista ? Stethoscope : Headphones
        const accentBg = isDentista ? 'bg-amber-500/10' : 'bg-emerald-500/10'
        const accentText = isDentista ? 'text-amber-500' : 'text-emerald-500'
        const accentBorder = isDentista ? 'border-amber-500/30' : 'border-emerald-500/30'
        const accentBadge = isDentista
          ? 'border-amber-500/30 text-amber-400 bg-amber-500/10'
          : 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
        const commissionColor = isDentista ? 'text-amber-400' : 'text-emerald-400'

        return (
          <Card
            key={prof.id + prof.tipo}
            className="bg-slate-900 border-slate-800 shadow-lg overflow-hidden hover:shadow-xl hover:border-slate-700 transition-all duration-200"
          >
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${accentBg}`}>
                  <Icon className={`w-4 h-4 ${accentText}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white truncate">{prof.nome}</p>
                  <Badge
                    variant="outline"
                    className={`mt-0.5 text-[10px] py-0 px-1.5 ${accentBadge}`}
                  >
                    {prof.tipo}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className={`rounded-lg border ${accentBorder} bg-slate-800/50 p-2`}>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium uppercase tracking-wide">
                    <TrendingUp className="w-3 h-3" />
                    Vendas ({prof.qtdeVendas})
                  </div>
                  <p className="text-sm font-bold text-white mt-0.5">
                    {formatCurrency(prof.totalVendas)}
                  </p>
                </div>
                <div className={`rounded-lg border ${accentBorder} bg-slate-800/50 p-2`}>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium uppercase tracking-wide">
                    <DollarSign className="w-3 h-3" />
                    Entradas
                  </div>
                  <p className="text-sm font-bold text-white mt-0.5">
                    {formatCurrency(prof.totalEntries)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5" />
                  Performance
                </span>
                <span className="font-bold text-white">{prof.entryPercentage.toFixed(1)}%</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Receipt className="w-3.5 h-3.5" />
                  Taxa de Comissão
                </span>
                <span className="font-bold text-amber-400">{prof.commissionRate.toFixed(1)}%</span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-300 font-semibold uppercase tracking-wider">
                  Comissão a Pagar
                </span>
                <span className={`text-lg font-bold ${commissionColor}`}>
                  {formatCurrency(prof.totalComissao)}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-amber-400/80 font-medium">
                  Em Aberto: {formatCurrency(prof.comissaoAberta)}
                </span>
                <span className="text-emerald-400/80 font-medium">
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

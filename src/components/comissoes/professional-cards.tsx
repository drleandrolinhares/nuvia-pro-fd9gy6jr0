import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Stethoscope, Headphones, TrendingUp, DollarSign, Receipt } from 'lucide-react'
import type { ProfessionalSummary } from '@/services/comissoes-dashboard'

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

export function ProfessionalCards({ profissionais }: { profissionais: ProfessionalSummary[] }) {
  if (profissionais.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
        Nenhum profissional com comissões no período selecionado.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {profissionais.map((prof) => {
        const isDentista = prof.tipo === 'Dentista'
        const Icon = isDentista ? Stethoscope : Headphones
        const accentColor = isDentista ? 'amber' : 'emerald'

        return (
          <Card
            key={prof.id + prof.tipo}
            className="bg-slate-900 border-slate-800 shadow-lg overflow-hidden relative hover:border-slate-700 transition-all duration-300"
          >
            <div className="absolute -top-4 -right-4 p-4 opacity-5">
              <Icon className="w-24 h-24 text-white" />
            </div>
            <CardHeader className="pb-2 relative z-10 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={`p-1.5 rounded-md flex-shrink-0 ${
                    isDentista ? 'bg-amber-500/10' : 'bg-emerald-500/10'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${isDentista ? 'text-amber-500' : 'text-emerald-500'}`}
                  />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-sm font-bold text-slate-100 truncate">
                    {prof.nome}
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className={`mt-0.5 text-[10px] py-0 px-1.5 ${
                      isDentista
                        ? 'border-amber-500/30 text-amber-500 bg-amber-500/10'
                        : 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10'
                    }`}
                  >
                    {prof.tipo}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10 space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Volume ({prof.qtdeVendas})
                </span>
                <span className="font-semibold text-slate-200">
                  {formatCurrency(prof.totalVendas)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Receipt className="w-3.5 h-3.5" />
                  Em Aberto
                </span>
                <span className="font-semibold text-amber-400">
                  {formatCurrency(prof.comissaoAberta)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  Pago
                </span>
                <span className="font-semibold text-emerald-400">
                  {formatCurrency(prof.comissaoPaga)}
                </span>
              </div>
              <div
                className={`pt-2 mt-1 border-t border-slate-800 flex items-center justify-between`}
              >
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                  Total Comissão
                </span>
                <span
                  className={`text-lg font-bold ${
                    isDentista ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {formatCurrency(prof.totalComissao)}
                </span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

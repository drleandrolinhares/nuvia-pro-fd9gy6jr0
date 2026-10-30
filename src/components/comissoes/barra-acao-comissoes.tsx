import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, X, DollarSign, AlertCircle } from 'lucide-react'

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

export interface BarraAcaoComissoesProps {
  quantidade: number
  totalComissao: number
  totalVendas: number
  onRemover: () => void
  onLimparSelecao: () => void
}

export function BarraAcaoComissoes({
  quantidade,
  totalComissao,
  totalVendas,
  onRemover,
  onLimparSelecao,
}: BarraAcaoComissoesProps) {
  if (quantidade === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="bg-slate-900/95 backdrop-blur-md border-2 border-amber-500 text-white rounded-2xl p-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Info lateral esquerda */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-400">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">
                {quantidade} {quantidade === 1 ? 'comissão selecionada' : 'comissões selecionadas'}
              </span>
              <Badge
                variant="outline"
                className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[11px] py-0 px-2 font-semibold"
              >
                Em lote
              </Badge>
            </div>
            <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
              <span>
                Total comissões:{' '}
                <strong className="text-emerald-400 font-bold">
                  {formatCurrency(totalComissao)}
                </strong>
              </span>
              <span>•</span>
              <span>
                Volume: <strong className="text-slate-200">{formatCurrency(totalVendas)}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onLimparSelecao}
            className="text-slate-400 hover:text-white hover:bg-slate-800 text-xs"
          >
            <X className="w-3.5 h-3.5 mr-1" />
            Limpar
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={onRemover}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md border border-amber-500/40"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Remover do fechamento
          </Button>
        </div>
      </div>
    </div>
  )
}

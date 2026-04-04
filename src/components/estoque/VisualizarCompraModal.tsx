import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Compra } from '@/services/compras'
import { format, parseISO } from 'date-fns'
import { Badge } from '@/components/ui/badge'

interface VisualizarCompraModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  compra: Compra | null
}

export function VisualizarCompraModal({ open, onOpenChange, compra }: VisualizarCompraModalProps) {
  if (!compra) return null

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const renderStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'concluído':
      case 'concluido':
        return <Badge className="bg-emerald-500">Concluído</Badge>
      case 'cancelado':
        return <Badge variant="destructive">Cancelado</Badge>
      default:
        return <Badge className="bg-amber-500 text-slate-950">Pendente</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900 border-b pb-4">
            Detalhes da Compra
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Fornecedor
              </p>
              <p className="text-sm font-medium text-slate-900">
                {compra.fornecedores?.nome || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Data</p>
              <p className="text-sm font-medium text-slate-900">
                {compra.data ? format(parseISO(compra.data), 'dd/MM/yyyy') : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">NFe</p>
              <p className="text-sm font-medium text-slate-900">{compra.nfe || 'Não informada'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Valor Total
              </p>
              <p className="text-sm font-bold text-slate-900">
                {formatCurrency(compra.valor_total_compra)}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Status
              </p>
              <div>{renderStatus(compra.status)}</div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-slate-900 text-white hover:bg-slate-800"
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

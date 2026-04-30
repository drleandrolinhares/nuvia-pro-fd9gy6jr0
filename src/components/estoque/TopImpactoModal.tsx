import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Produto } from '@/services/produtos'

interface TopImpactoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  produtos: Produto[]
}

export function TopImpactoModal({ open, onOpenChange, produtos }: TopImpactoModalProps) {
  const top10 = [...produtos]
    .map((p) => ({
      ...p,
      valorTotal: (p.quantidade_estoque || 0) * (p.custo_unitario || 0),
    }))
    .sort((a, b) => b.valorTotal - a.valorTotal)
    .slice(0, 10)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-800">
            Top 10 Materiais (Maior Impacto Financeiro)
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-x-auto mt-4 rounded-md border border-slate-200">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-bold text-slate-700">Produto</TableHead>
                <TableHead className="text-right font-bold text-slate-700">Qtd. Estoque</TableHead>
                <TableHead className="text-right font-bold text-slate-700">Custo Unit.</TableHead>
                <TableHead className="text-right font-bold text-slate-700">Valor Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {top10.map((p, i) => (
                <TableRow key={p.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-900">
                    {i + 1}. {p.nome} {p.marca ? `- ${p.marca}` : ''}{' '}
                    {p.variacao ? `(${p.variacao})` : ''}
                  </TableCell>
                  <TableCell className="text-right text-slate-600">
                    {p.quantidade_estoque}
                  </TableCell>
                  <TableCell className="text-right text-slate-600">
                    R${' '}
                    {p.custo_unitario?.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-right font-bold text-amber-600">
                    R${' '}
                    {p.valorTotal?.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                </TableRow>
              ))}
              {top10.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                    Nenhum produto encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
}

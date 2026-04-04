import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Compra, fetchCompraItens } from '@/services/compras'
import { format, parseISO } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Loader2, Edit, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { ScrollArea } from '@/components/ui/scroll-area'

interface VisualizarCompraModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  compra: Compra | null
  onEdit?: (compra: Compra) => void
  onDelete?: (compra: Compra) => void
}

export function VisualizarCompraModal({
  open,
  onOpenChange,
  compra,
  onEdit,
  onDelete,
}: VisualizarCompraModalProps) {
  const [itens, setItens] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkAdmin = async () => {
      const { data } = await supabase.rpc('is_admin')
      setIsAdmin(!!data)
    }
    checkAdmin()
  }, [])

  useEffect(() => {
    if (open && compra) {
      loadItens()
    } else {
      setItens([])
    }
  }, [open, compra])

  const loadItens = async () => {
    if (!compra) return
    setLoading(true)
    const { data } = await fetchCompraItens(compra.id)
    setItens(data || [])
    setLoading(false)
  }

  if (!compra) return null

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const renderStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'finalizada':
        return (
          <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-transparent">
            Finalizada
          </Badge>
        )
      case 'cancelada':
        return (
          <Badge variant="destructive" className="border-transparent">
            Cancelada
          </Badge>
        )
      case 'rascunho':
      default:
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600 text-slate-950 border-transparent font-bold">
            Rascunho
          </Badge>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-white border-slate-200">
        <DialogHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-slate-900">
              Detalhes da Compra
            </DialogTitle>
            <div>{renderStatus(compra.status)}</div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-grow">
          <div className="p-6 space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 bg-white rounded-lg p-5 border border-slate-200 shadow-sm">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Fornecedor
                </p>
                <p
                  className="text-sm font-bold text-slate-900 truncate"
                  title={compra.fornecedores?.nome || 'N/A'}
                >
                  {compra.fornecedores?.nome || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Data
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {compra.data ? format(parseISO(compra.data), 'dd/MM/yyyy') : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  NFe
                </p>
                <p className="text-sm font-bold text-slate-900">{compra.nfe || 'Não informada'}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Valor Total
                </p>
                <p className="text-sm font-bold text-amber-600">
                  {formatCurrency(compra.valor_total_compra)}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center">
                <span className="w-1.5 h-5 bg-amber-500 rounded-full mr-2"></span>
                Produtos da Compra
              </h3>
              <div className="rounded-md border border-slate-200 overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-slate-900">
                    <TableRow className="hover:bg-slate-900 border-slate-800">
                      <TableHead className="font-bold text-slate-50 uppercase text-[10px] tracking-wider">
                        Produto
                      </TableHead>
                      <TableHead className="font-bold text-slate-50 uppercase text-[10px] tracking-wider">
                        Marca
                      </TableHead>
                      <TableHead className="font-bold text-slate-50 uppercase text-[10px] tracking-wider">
                        Ref. Consumo
                      </TableHead>
                      <TableHead className="font-bold text-slate-50 uppercase text-[10px] tracking-wider text-right">
                        Qtd
                      </TableHead>
                      <TableHead className="font-bold text-slate-50 uppercase text-[10px] tracking-wider text-right">
                        V. Unitário
                      </TableHead>
                      <TableHead className="font-bold text-slate-50 uppercase text-[10px] tracking-wider text-right">
                        Subtotal
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-white">
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-500 mb-2" />
                          <p className="text-sm text-slate-500 font-medium">Carregando itens...</p>
                        </TableCell>
                      </TableRow>
                    ) : itens.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-slate-500 text-sm font-medium"
                        >
                          Nenhum produto vinculado a esta compra.
                        </TableCell>
                      </TableRow>
                    ) : (
                      itens.map((item) => (
                        <TableRow key={item.id} className="hover:bg-slate-50 border-slate-100">
                          <TableCell className="font-medium text-slate-900">
                            {item.produtos?.nome || '-'}
                          </TableCell>
                          <TableCell className="text-slate-600 text-sm">
                            {item.produtos?.marca || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="font-normal text-xs bg-slate-50 border-slate-200 text-slate-700"
                            >
                              {item.referencia_consumo === 'itens_embalagem'
                                ? 'Por Embalagem'
                                : 'Por Unidade'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-bold text-slate-900">
                            {item.referencia_consumo === 'itens_embalagem'
                              ? item.itens_embalagem
                              : item.qtd_comprada}
                          </TableCell>
                          <TableCell className="text-right text-slate-600 text-sm font-medium">
                            {formatCurrency(item.valor_unitario)}
                          </TableCell>
                          <TableCell className="text-right font-bold text-slate-900">
                            {formatCurrency(item.valor_total)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="p-4 border-t border-slate-100 bg-slate-50 flex sm:justify-between items-center gap-2">
          <div className="flex gap-2 w-full sm:w-auto">
            {isAdmin && (
              <>
                <Button
                  variant="outline"
                  className="flex-1 sm:flex-none text-slate-700 border-slate-300 hover:bg-slate-100 hover:text-slate-900 font-semibold"
                  onClick={() => onEdit?.(compra)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 sm:flex-none text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 font-semibold"
                  onClick={() => onDelete?.(compra)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Deletar
                </Button>
              </>
            )}
          </div>
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto bg-slate-900 text-amber-400 hover:bg-slate-800 hover:text-amber-300 font-bold tracking-wide"
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Compra, fetchCompraItens, finalizarCompra } from '@/services/compras'
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
import { Loader2, Edit, Trash2, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface VisualizarCompraModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  compra: Compra | null
  onEdit?: (compra: Compra) => void
  onDelete?: (compra: Compra) => void
  onSuccess?: () => void
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
  const [isFinalizando, setIsFinalizando] = useState(false)

  const handleFinalizar = async () => {
    if (!compra) return
    setIsFinalizando(true)

    const { error } = await finalizarCompra(compra.id)

    setIsFinalizando(false)

    if (error) {
      toast.error('Erro ao finalizar a compra')
      return
    }

    toast.success('Compra finalizada com sucesso! Estoque atualizado.')
    onOpenChange(false)
    if (typeof onSuccess === 'function') {
      onSuccess()
    }
  }

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: admin } = await supabase.rpc('is_admin')
      const { data: perm } = await supabase.rpc('has_permission', {
        permission_name: 'Gerenciar Estoque',
      })
      setIsAdmin(!!admin || !!perm)
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
          <Badge className="bg-[#d4af37] hover:bg-[#d4af37]/90 text-[#1a2a4a] border-transparent font-bold">
            Rascunho
          </Badge>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[850px] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-white border-slate-200">
        <DialogHeader className="p-6 pb-4 border-b border-[#1a2a4a]/10 bg-[#1a2a4a] shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-[#d4af37]">
              Detalhes da Compra
            </DialogTitle>
            <div>{renderStatus(compra.status)}</div>
          </div>
        </DialogHeader>

        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 shrink-0 z-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 bg-white rounded-lg p-5 border border-slate-200 shadow-sm">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Fornecedor
              </p>
              <p
                className="text-sm font-bold text-[#1a2a4a] truncate"
                title={compra.fornecedores?.nome || 'N/A'}
              >
                {compra.fornecedores?.nome || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Data
              </p>
              <p className="text-sm font-bold text-[#1a2a4a]">
                {compra.data ? format(parseISO(compra.data), 'dd/MM/yyyy') : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                NFe
              </p>
              <p className="text-sm font-bold text-[#1a2a4a]">{compra.nfe || 'Não informada'}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Valor Total
              </p>
              <p className="text-sm font-bold text-[#d4af37]">
                {formatCurrency(compra.valor_total_compra)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 p-6">
          <div>
            <h3 className="text-base font-bold text-[#1a2a4a] mb-4 flex items-center">
              <span className="w-1.5 h-5 bg-[#d4af37] rounded-full mr-2"></span>
              Produtos da Compra
            </h3>
            <div className="rounded-md border border-slate-200 overflow-hidden shadow-sm">
              <Table>
                <TableHeader className="bg-[#1a2a4a]">
                  <TableRow className="hover:bg-[#1a2a4a] border-[#1a2a4a]">
                    <TableHead className="font-bold text-[#d4af37] uppercase text-[10px] tracking-wider">
                      Produto
                    </TableHead>
                    <TableHead className="font-bold text-[#d4af37] uppercase text-[10px] tracking-wider">
                      Marca
                    </TableHead>
                    <TableHead className="font-bold text-[#d4af37] uppercase text-[10px] tracking-wider">
                      Especialidade
                    </TableHead>
                    <TableHead className="font-bold text-[#d4af37] uppercase text-[10px] tracking-wider text-right">
                      Qtd
                    </TableHead>
                    <TableHead className="font-bold text-[#d4af37] uppercase text-[10px] tracking-wider text-right">
                      V. Unit
                    </TableHead>
                    <TableHead className="font-bold text-[#d4af37] uppercase text-[10px] tracking-wider text-right">
                      Subtotal
                    </TableHead>
                    <TableHead className="font-bold text-[#d4af37] uppercase text-[10px] tracking-wider">
                      Ref. Consumo
                    </TableHead>
                    <TableHead className="font-bold text-[#d4af37] uppercase text-[10px] tracking-wider">
                      Sala
                    </TableHead>
                    <TableHead className="font-bold text-[#d4af37] uppercase text-[10px] tracking-wider text-center">
                      Ações
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white">
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#d4af37] mb-2" />
                        <p className="text-sm text-slate-500 font-medium">Carregando itens...</p>
                      </TableCell>
                    </TableRow>
                  ) : itens.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="text-center py-8 text-slate-500 text-sm font-medium"
                      >
                        Nenhum produto vinculado a esta compra.
                      </TableCell>
                    </TableRow>
                  ) : (
                    itens.map((item) => (
                      <TableRow key={item.id} className="hover:bg-slate-50 border-slate-100">
                        <TableCell className="font-medium text-[#1a2a4a]">
                          {item.produtos?.nome || '-'}
                        </TableCell>
                        <TableCell className="text-slate-600 text-sm">
                          {item.produtos?.marca || '-'}
                        </TableCell>
                        <TableCell className="text-slate-600 text-sm">
                          {item.produtos?.especialidades?.nome || '-'}
                        </TableCell>
                        <TableCell className="text-right font-bold text-[#1a2a4a]">
                          {item.referencia_consumo === 'itens_embalagem'
                            ? `${item.itens_embalagem} (${item.qtd_comprada} emb.)`
                            : item.qtd_comprada}
                        </TableCell>
                        <TableCell className="text-right text-slate-600 text-sm font-medium">
                          {formatCurrency(item.valor_unitario)}
                        </TableCell>
                        <TableCell className="text-right font-bold text-[#1a2a4a]">
                          {formatCurrency(item.valor_total)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="font-normal text-[10px] bg-slate-50 border-slate-200 text-slate-700"
                          >
                            {item.referencia_consumo === 'itens_embalagem'
                              ? 'Embalagem'
                              : 'Unidade'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-600 text-sm">
                          {item.salas?.nome || item.produtos?.salas?.nome || '-'}
                        </TableCell>
                        <TableCell className="text-center text-slate-400">-</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 border-t border-slate-100 bg-slate-50 flex sm:justify-between items-center gap-2 shrink-0">
          <div className="flex gap-2 w-full sm:w-auto">
            {isAdmin && (
              <>
                {compra.status?.toLowerCase() === 'rascunho' && (
                  <Button
                    variant="default"
                    className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
                    onClick={handleFinalizar}
                    disabled={isFinalizando || itens.length === 0}
                  >
                    {isFinalizando ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Finalizar Compra
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex-1 sm:flex-none text-[#1a2a4a] border-slate-300 hover:bg-slate-100 hover:text-[#1a2a4a] font-semibold shadow-sm"
                  onClick={() => onEdit?.(compra)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 sm:flex-none text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 font-semibold shadow-sm"
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
            className="w-full sm:w-auto bg-[#1a2a4a] text-[#d4af37] hover:bg-[#1a2a4a]/90 font-bold tracking-wide shadow-sm"
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

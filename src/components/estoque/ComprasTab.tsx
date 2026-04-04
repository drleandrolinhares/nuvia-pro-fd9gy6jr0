import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, Eye, Edit, Trash2, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Compra, fetchCompras, deleteCompra } from '@/services/compras'
import { CompraFormModal } from './CompraFormModal'
import { VisualizarCompraModal } from './VisualizarCompraModal'
import { format, parseISO } from 'date-fns'
import { supabase } from '@/lib/supabase/client'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export function ComprasTab() {
  const [compras, setCompras] = useState<Compra[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [modalFormOpen, setModalFormOpen] = useState(false)
  const [compraEditar, setCompraEditar] = useState<Compra | null>(null)
  const [compraVisualizar, setCompraVisualizar] = useState<Compra | null>(null)
  const [compraExcluir, setCompraExcluir] = useState<Compra | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const { toast } = useToast()

  const checkAdmin = async () => {
    const { data } = await supabase.rpc('is_admin')
    setIsAdmin(!!data)
  }

  const loadData = async () => {
    setLoading(true)
    const { data, error } = await fetchCompras()
    if (error) {
      toast({
        title: 'Erro ao carregar compras',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      setCompras(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
    checkAdmin()
  }, [])

  const handleDelete = async () => {
    if (!compraExcluir) return
    setIsDeleting(true)
    const { error } = await deleteCompra(compraExcluir.id)
    if (error) {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Compra excluída com sucesso.' })
      loadData()
    }
    setIsDeleting(false)
    setCompraExcluir(null)
  }

  const handleOpenEdit = (compra: Compra) => {
    setCompraEditar(compra)
    setModalFormOpen(true)
  }

  const filteredCompras = compras.filter((c) => {
    const term = searchTerm.toLowerCase()
    return c.nfe?.toLowerCase().includes(term) || c.fornecedores?.nome?.toLowerCase().includes(term)
  })

  const renderStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'finalizada':
        return <Badge className="bg-emerald-500 hover:bg-emerald-600">Finalizada</Badge>
      case 'cancelada':
        return <Badge variant="destructive">Cancelada</Badge>
      case 'rascunho':
      default:
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-slate-950">Rascunho</Badge>
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar por NFe ou Fornecedor..."
              className="pl-9 border-slate-300 focus-visible:ring-slate-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            onClick={() => {
              setCompraEditar(null)
              setModalFormOpen(true)
            }}
            className="w-full sm:w-auto bg-[#1a2a4a] hover:bg-[#1a2a4a]/90 text-[#d4af37] font-bold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Compra
          </Button>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#1a2a4a]">
              <TableRow className="hover:bg-[#1a2a4a] border-[#1a2a4a]">
                <TableHead className="font-bold text-[#d4af37] uppercase text-xs">
                  Fornecedor
                </TableHead>
                <TableHead className="font-bold text-[#d4af37] uppercase text-xs">Data</TableHead>
                <TableHead className="font-bold text-[#d4af37] uppercase text-xs">NFe</TableHead>
                <TableHead className="font-bold text-[#d4af37] uppercase text-xs">
                  Valor Total
                </TableHead>
                <TableHead className="font-bold text-[#d4af37] uppercase text-xs">Status</TableHead>
                <TableHead className="font-bold text-[#d4af37] uppercase text-xs text-center">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Carregando compras...
                  </TableCell>
                </TableRow>
              ) : filteredCompras.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    Nenhuma compra encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCompras.map((compra) => (
                  <TableRow key={compra.id} className="hover:bg-slate-50 bg-white">
                    <TableCell className="font-medium text-slate-900">
                      {compra.fornecedores?.nome || '-'}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {compra.data ? format(parseISO(compra.data), 'dd/MM/yyyy') : '-'}
                    </TableCell>
                    <TableCell className="text-slate-600 font-mono text-sm">
                      {compra.nfe || '-'}
                    </TableCell>
                    <TableCell className="font-bold text-slate-900">
                      {compra.valor_total_compra.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </TableCell>
                    <TableCell>{renderStatus(compra.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setCompraVisualizar(compra)}
                          className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-200"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {isAdmin && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEdit(compra)}
                              className="h-8 w-8 text-slate-500 hover:text-amber-600 hover:bg-amber-100"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setCompraExcluir(compra)}
                              className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-100"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <CompraFormModal
        open={modalFormOpen}
        onOpenChange={setModalFormOpen}
        compra={compraEditar}
        onSuccess={loadData}
      />

      <VisualizarCompraModal
        open={!!compraVisualizar}
        onOpenChange={(open) => !open && setCompraVisualizar(null)}
        compra={compraVisualizar}
        onEdit={(compra) => {
          setCompraVisualizar(null)
          handleOpenEdit(compra)
        }}
        onDelete={(compra) => {
          setCompraVisualizar(null)
          setCompraExcluir(compra)
        }}
      />

      <AlertDialog
        open={!!compraExcluir}
        onOpenChange={(open) => !open && !isDeleting && setCompraExcluir(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Compra</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta compra? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

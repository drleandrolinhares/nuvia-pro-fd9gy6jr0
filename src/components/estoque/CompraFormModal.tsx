import { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import {
  Compra,
  createCompra,
  updateCompra,
  fetchFornecedoresBasico,
  FornecedorBasico,
  CompraItem,
  fetchCompraItens,
} from '@/services/compras'
import { fetchSalas } from '@/services/produtos'
import { Loader2, Plus, Trash2, Edit } from 'lucide-react'
import { CompraItemFormModal } from './CompraItemFormModal'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  compra: Compra | null
  onSuccess: () => void
}

export function CompraFormModal({ open, onOpenChange, compra, onSuccess }: Props) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fornecedores, setFornecedores] = useState<FornecedorBasico[]>([])
  const [salas, setSalas] = useState<any[]>([])

  const [formData, setFormData] = useState({
    fornecedor_id: '',
    data: '',
    nfe: '',
    status: 'Rascunho',
  })

  const [itens, setItens] = useState<CompraItem[]>([])
  const [itemModalOpen, setItemModalOpen] = useState(false)
  const [editIndex, setEditIndex] = useState<number | null>(null)

  useEffect(() => {
    if (open) {
      fetchFornecedoresBasico().then(({ data }) => setFornecedores(data || []))
      fetchSalas().then(({ data }) => setSalas(data || []))

      if (compra) {
        setFormData({
          fornecedor_id: compra.fornecedor_id || '',
          data: compra.data || '',
          nfe: compra.nfe || '',
          status: compra.status || 'Rascunho',
        })
        fetchCompraItens(compra.id).then((res) => {
          if (res.data)
            setItens(
              res.data.map((i) => ({
                ...i,
                produto_nome: i.produtos?.nome,
                produto_marca: i.produtos?.marca,
                produto_especialidade: i.produtos?.especialidades?.nome,
                produto_sala: i.produtos?.salas?.nome,
              })),
            )
        })
      } else {
        setFormData({
          fornecedor_id: '',
          data: new Date().toISOString().split('T')[0],
          nfe: '',
          status: 'Rascunho',
        })
        setItens([])
      }
    } else {
      setEditIndex(null)
    }
  }, [open, compra])

  const valorTotalCalculado = useMemo(() => {
    return itens.reduce((acc, i) => acc + i.valor_total, 0)
  }, [itens])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const payload = {
      fornecedor_id: formData.fornecedor_id || null,
      data: formData.data,
      nfe: formData.nfe,
      valor_total_compra: valorTotalCalculado,
      status: formData.status,
    }

    const { error } = compra
      ? await updateCompra(compra.id, payload, itens)
      : await createCompra(payload, itens)

    if (error) {
      toast({ title: 'Erro ao salvar compra', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Compra salva com sucesso!' })
      onSuccess()
      onOpenChange(false)
    }
    setLoading(false)
  }

  const handleEditItem = (idx: number) => {
    setEditIndex(idx)
    setItemModalOpen(true)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[1000px] max-h-[95vh] flex flex-col p-0 gap-0 overflow-hidden bg-slate-50 border-slate-200">
          <DialogHeader className="p-6 pb-4 border-b border-[#1a2a4a]/10 bg-[#1a2a4a]">
            <DialogTitle className="text-xl font-bold text-[#d4af37]">
              {compra ? 'Editar Compra' : 'Nova Compra'}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-grow">
            <form id="compra-form" onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* SEÇÃO 1: Cabeçalho da Compra */}
              <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-[#1a2a4a] flex items-center border-b border-slate-100 pb-2">
                  <span className="w-1.5 h-5 bg-[#d4af37] rounded-full mr-2"></span>
                  SEÇÃO 1: Cabeçalho da Compra
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#1a2a4a] font-semibold">Fornecedor</Label>
                    <Select
                      value={formData.fornecedor_id}
                      onValueChange={(v) => setFormData({ ...formData, fornecedor_id: v })}
                    >
                      <SelectTrigger className="border-slate-300 focus:ring-[#d4af37]">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {fornecedores.map((f) => (
                          <SelectItem key={f.id} value={f.id}>
                            {f.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#1a2a4a] font-semibold">Data *</Label>
                    <Input
                      type="date"
                      required
                      value={formData.data}
                      onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                      className="border-slate-300 focus-visible:ring-[#d4af37]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#1a2a4a] font-semibold">NFe *</Label>
                    <Input
                      required
                      placeholder="Número"
                      value={formData.nfe}
                      onChange={(e) => setFormData({ ...formData, nfe: e.target.value })}
                      className="border-slate-300 focus-visible:ring-[#d4af37]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#1a2a4a] font-semibold">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(v) => setFormData({ ...formData, status: v })}
                    >
                      <SelectTrigger className="border-slate-300 focus:ring-[#d4af37]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Rascunho">Rascunho</SelectItem>
                        <SelectItem value="Finalizada">Finalizada</SelectItem>
                        <SelectItem value="Cancelada">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* SEÇÃO 2: Tabela de Produtos */}
              <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-base font-bold text-[#1a2a4a] flex items-center">
                    <span className="w-1.5 h-5 bg-[#d4af37] rounded-full mr-2"></span>
                    SEÇÃO 2: Tabela de Produtos
                  </h3>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setEditIndex(null)
                      setItemModalOpen(true)
                    }}
                    className="bg-[#1a2a4a] hover:bg-[#1a2a4a]/90 text-[#d4af37] font-bold"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Adicionar Produto
                  </Button>
                </div>

                <div className="border border-slate-200 rounded-md overflow-hidden">
                  <Table>
                    <TableHeader className="bg-[#1a2a4a]">
                      <TableRow className="hover:bg-[#1a2a4a] border-[#1a2a4a]">
                        <TableHead className="font-bold text-[#d4af37] uppercase text-xs">
                          Produto
                        </TableHead>
                        <TableHead className="font-bold text-[#d4af37] uppercase text-xs">
                          Marca
                        </TableHead>
                        <TableHead className="font-bold text-[#d4af37] uppercase text-xs">
                          Especialidade
                        </TableHead>
                        <TableHead className="font-bold text-[#d4af37] uppercase text-xs text-right">
                          Qtd
                        </TableHead>
                        <TableHead className="font-bold text-[#d4af37] uppercase text-xs text-right">
                          V. Unit
                        </TableHead>
                        <TableHead className="font-bold text-[#d4af37] uppercase text-xs text-right">
                          Subtotal
                        </TableHead>
                        <TableHead className="font-bold text-[#d4af37] uppercase text-xs text-center">
                          Ref.
                        </TableHead>
                        <TableHead className="font-bold text-[#d4af37] uppercase text-xs">
                          Sala
                        </TableHead>
                        <TableHead className="w-[80px] text-center font-bold text-[#d4af37] uppercase text-xs">
                          Ações
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {itens.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                            Nenhum produto adicionado.
                          </TableCell>
                        </TableRow>
                      ) : (
                        itens.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium text-[#1a2a4a]">
                              {item.produto_nome}
                            </TableCell>
                            <TableCell className="text-slate-600">
                              {item.produto_marca || '-'}
                            </TableCell>
                            <TableCell className="text-slate-600 text-sm">
                              {item.produto_especialidade || '-'}
                            </TableCell>
                            <TableCell className="text-right text-slate-700">
                              {item.qtd_comprada}
                            </TableCell>
                            <TableCell className="text-right text-slate-700">
                              R$ {item.valor_unitario.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right text-[#1a2a4a] font-bold">
                              R$ {item.valor_total.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="text-[10px] uppercase font-bold px-2 py-1 rounded-full bg-slate-100 text-[#1a2a4a] border border-slate-200">
                                {item.referencia_consumo === 'itens_embalagem' ? 'Emb' : 'Qtd'}
                              </span>
                            </TableCell>
                            <TableCell className="text-slate-600 text-sm truncate max-w-[100px]">
                              {item.produto_sala || '-'}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditItem(idx)}
                                  className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 h-7 w-7"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setItens(itens.filter((_, i) => i !== idx))}
                                  className="text-red-500 hover:text-red-600 hover:bg-red-50 h-7 w-7"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </form>
          </ScrollArea>

          <DialogFooter className="p-4 border-t border-slate-200 bg-white flex flex-row items-center justify-between sm:justify-between">
            <div className="flex items-center gap-3">
              <Label className="text-slate-600 font-medium">Valor Total da Compra:</Label>
              <div className="text-xl font-black text-[#1a2a4a]">
                R$ {valorTotalCalculado.toFixed(2)}
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                form="compra-form"
                type="submit"
                disabled={loading}
                className="bg-[#1a2a4a] hover:bg-[#1a2a4a]/90 text-[#d4af37] font-bold px-6"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Salvar Compra
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CompraItemFormModal
        open={itemModalOpen}
        onOpenChange={(v) => {
          setItemModalOpen(v)
          if (!v) setEditIndex(null)
        }}
        compraData={{
          fornecedor_id: formData.fornecedor_id,
          fornecedorNome: fornecedores.find((f) => f.id === formData.fornecedor_id)?.nome,
          data: formData.data,
          nfe: formData.nfe,
        }}
        salas={salas}
        itemToEdit={editIndex !== null ? itens[editIndex] : undefined}
        onAdd={(item) => {
          if (editIndex !== null) {
            const newItens = [...itens]
            newItens[editIndex] = item
            setItens(newItens)
            setEditIndex(null)
          } else {
            setItens([...itens, item])
          }
        }}
      />
    </>
  )
}

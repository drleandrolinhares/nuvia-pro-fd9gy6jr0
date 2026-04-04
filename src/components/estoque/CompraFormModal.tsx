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
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { CompraItemFormModal } from './CompraItemFormModal'

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
    sala_id: '',
    status: 'Rascunho',
  })

  const [itens, setItens] = useState<CompraItem[]>([])
  const [itemModalOpen, setItemModalOpen] = useState(false)

  useEffect(() => {
    if (open) {
      fetchFornecedoresBasico().then(({ data }) => setFornecedores(data || []))
      fetchSalas().then(({ data }) => setSalas(data || []))

      if (compra) {
        setFormData({
          fornecedor_id: compra.fornecedor_id || '',
          data: compra.data || '',
          nfe: compra.nfe || '',
          sala_id: '',
          status: compra.status || 'Rascunho',
        })
        fetchCompraItens(compra.id).then((res) => {
          if (res.data)
            setItens(
              res.data.map((i) => ({
                ...i,
                produto_nome: i.produtos?.nome,
                produto_marca: i.produtos?.marca,
              })),
            )
        })
      } else {
        setFormData({
          fornecedor_id: '',
          data: new Date().toISOString().split('T')[0],
          nfe: '',
          sala_id: '',
          status: 'Rascunho',
        })
        setItens([])
      }
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
      ? await updateCompra(compra.id, payload)
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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{compra ? 'Editar Compra' : 'Nova Compra'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fornecedor</Label>
                <Select
                  value={formData.fornecedor_id}
                  onValueChange={(v) => setFormData({ ...formData, fornecedor_id: v })}
                >
                  <SelectTrigger className="border-slate-300 focus:ring-slate-900">
                    <SelectValue placeholder="Selecione um fornecedor" />
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
                <Label>Data da Compra *</Label>
                <Input
                  type="date"
                  required
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  className="border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <Label>NFe *</Label>
                <Input
                  required
                  placeholder="Número da NFe"
                  value={formData.nfe}
                  onChange={(e) => setFormData({ ...formData, nfe: e.target.value })}
                  className="border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <Label>Sala de Armazenamento</Label>
                <Select
                  value={formData.sala_id}
                  onValueChange={(v) => setFormData({ ...formData, sala_id: v })}
                >
                  <SelectTrigger className="border-slate-300 focus:ring-slate-900">
                    <SelectValue placeholder="Selecione a sala" />
                  </SelectTrigger>
                  <SelectContent>
                    {salas.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => setFormData({ ...formData, status: v })}
                >
                  <SelectTrigger className="border-slate-300 focus:ring-slate-900">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Rascunho">Rascunho</SelectItem>
                    <SelectItem value="Finalizada">Finalizada</SelectItem>
                    <SelectItem value="Cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Valor Total (Calc)</Label>
                <Input
                  value={`R$ ${valorTotalCalculado.toFixed(2)}`}
                  disabled
                  className="bg-amber-50 text-amber-900 font-bold border-amber-200"
                />
              </div>
            </div>

            <div className="space-y-3 bg-white p-4 rounded-md border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <Label className="text-base font-bold text-slate-900">Produtos da Compra</Label>
                {!compra && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setItemModalOpen(true)}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Adicionar Produto
                  </Button>
                )}
              </div>
              <div className="border border-slate-200 rounded-md overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-900">
                    <TableRow className="hover:bg-slate-900 border-slate-800">
                      <TableHead className="font-bold text-slate-50 uppercase text-xs">
                        Produto
                      </TableHead>
                      <TableHead className="font-bold text-slate-50 uppercase text-xs">
                        Marca
                      </TableHead>
                      <TableHead className="text-right font-bold text-slate-50 uppercase text-xs">
                        Qtd
                      </TableHead>
                      <TableHead className="text-right font-bold text-slate-50 uppercase text-xs">
                        V. Unit
                      </TableHead>
                      <TableHead className="text-right font-bold text-slate-50 uppercase text-xs">
                        Subtotal
                      </TableHead>
                      <TableHead className="text-center font-bold text-slate-50 uppercase text-xs">
                        Ref. Consumo
                      </TableHead>
                      {!compra && <TableHead className="w-[60px]"></TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itens.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-slate-500">
                          Nenhum produto adicionado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      itens.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium text-slate-900">
                            {item.produto_nome}
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {item.produto_marca || '-'}
                          </TableCell>
                          <TableCell className="text-right text-slate-700">
                            {item.qtd_comprada}
                          </TableCell>
                          <TableCell className="text-right text-slate-700">
                            R$ {item.valor_unitario.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right text-slate-900 font-bold">
                            R$ {item.valor_total.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                              {item.referencia_consumo === 'itens_embalagem'
                                ? 'Por Embalagem'
                                : 'Por Qtd'}
                            </span>
                          </TableCell>
                          {!compra && (
                            <TableCell className="text-center">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setItens(itens.filter((_, i) => i !== idx))}
                                  className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Salvar Compra
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <CompraItemFormModal
        open={itemModalOpen}
        onOpenChange={setItemModalOpen}
        compraData={{
          fornecedor_id: formData.fornecedor_id,
          fornecedorNome: fornecedores.find((f) => f.id === formData.fornecedor_id)?.nome,
          data: formData.data,
          nfe: formData.nfe,
          sala_id: formData.sala_id,
          salaNome: salas.find((s) => s.id === formData.sala_id)?.nome,
        }}
        onAdd={(item) => setItens([...itens, item])}
      />
    </>
  )
}

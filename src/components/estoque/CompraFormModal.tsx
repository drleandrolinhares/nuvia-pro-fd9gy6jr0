import { useState, useEffect } from 'react'
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
import { useToast } from '@/hooks/use-toast'
import {
  Compra,
  createCompra,
  updateCompra,
  fetchFornecedoresBasico,
  FornecedorBasico,
} from '@/services/compras'
import { Loader2 } from 'lucide-react'

interface CompraFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  compra: Compra | null
  onSuccess: () => void
}

export function CompraFormModal({ open, onOpenChange, compra, onSuccess }: CompraFormModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fornecedores, setFornecedores] = useState<FornecedorBasico[]>([])

  const [formData, setFormData] = useState({
    fornecedor_id: '',
    data: '',
    nfe: '',
    valor_total_compra: '',
    status: 'pendente',
  })

  useEffect(() => {
    if (open) {
      fetchFornecedoresBasico().then(({ data }) => setFornecedores(data || []))
      if (compra) {
        setFormData({
          fornecedor_id: compra.fornecedor_id || '',
          data: compra.data || '',
          nfe: compra.nfe || '',
          valor_total_compra: compra.valor_total_compra.toString(),
          status: compra.status || 'pendente',
        })
      } else {
        setFormData({
          fornecedor_id: '',
          data: new Date().toISOString().split('T')[0],
          nfe: '',
          valor_total_compra: '',
          status: 'pendente',
        })
      }
    }
  }, [open, compra])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const payload = {
      fornecedor_id: formData.fornecedor_id || null,
      data: formData.data,
      nfe: formData.nfe,
      valor_total_compra: parseFloat(formData.valor_total_compra) || 0,
      status: formData.status,
    }

    const { error } = compra ? await updateCompra(compra.id, payload) : await createCompra(payload)

    if (error) {
      toast({
        title: 'Erro ao salvar compra',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({ title: 'Sucesso', description: 'Compra salva com sucesso!' })
      onSuccess()
      onOpenChange(false)
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{compra ? 'Editar Compra' : 'Nova Compra'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="fornecedor">Fornecedor</Label>
            <Select
              value={formData.fornecedor_id}
              onValueChange={(val) => setFormData({ ...formData, fornecedor_id: val })}
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
            <Label htmlFor="data">Data da Compra *</Label>
            <Input
              id="data"
              type="date"
              required
              value={formData.data}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              className="border-slate-300 focus-visible:ring-slate-900"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nfe">NFe</Label>
            <Input
              id="nfe"
              placeholder="Número da Nota Fiscal"
              value={formData.nfe}
              onChange={(e) => setFormData({ ...formData, nfe: e.target.value })}
              className="border-slate-300 focus-visible:ring-slate-900"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="valor">Valor Total (R$) *</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="0.00"
              value={formData.valor_total_compra}
              onChange={(e) => setFormData({ ...formData, valor_total_compra: e.target.value })}
              className="border-slate-300 focus-visible:ring-slate-900"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(val) => setFormData({ ...formData, status: val })}
            >
              <SelectTrigger className="border-slate-300 focus:ring-slate-900">
                <SelectValue placeholder="Status da compra" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="concluído">Concluído</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

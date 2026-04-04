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
import { Badge } from '@/components/ui/badge'
import { fetchProdutos, Produto } from '@/services/produtos'
import { fetchUltimasComprasProduto, CompraItem } from '@/services/compras'
import { format, parseISO } from 'date-fns'

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
  onAdd: (item: CompraItem) => void
}

export function CompraItemFormModal({ open, onOpenChange, onAdd }: Props) {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [prodId, setProdId] = useState('')
  const [ultimas, setUltimas] = useState<any[]>([])

  const [vt, setVt] = useState('')
  const [qc, setQc] = useState('')
  const [ie, setIe] = useState('')

  useEffect(() => {
    if (open) {
      fetchProdutos().then((res) => setProdutos(res.data || []))
    } else {
      setProdId('')
      setVt('')
      setQc('')
      setIe('')
      setUltimas([])
    }
  }, [open])

  useEffect(() => {
    if (prodId) {
      fetchUltimasComprasProduto(prodId).then((res) => setUltimas(res.data || []))
    } else {
      setUltimas([])
    }
  }, [prodId])

  const produto = useMemo(() => produtos.find((p) => p.id === prodId), [produtos, prodId])

  const vu = useMemo(() => {
    if (!produto) return 0
    const val = parseFloat(vt) || 0
    if (produto.referencia_consumo === 'itens_embalagem') {
      return val / (parseInt(ie) || 1)
    }
    return val / (parseInt(qc) || 1)
  }, [vt, qc, ie, produto])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!produto) return
    onAdd({
      produto_id: produto.id,
      produto_nome: produto.nome,
      valor_total: parseFloat(vt) || 0,
      qtd_comprada: parseInt(qc) || 0,
      itens_embalagem:
        produto.referencia_consumo === 'itens_embalagem' ? parseInt(ie) || null : null,
      referencia_consumo: produto.referencia_consumo,
      valor_unitario: vu,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Produto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Produto</Label>
            <Select value={prodId} onValueChange={setProdId}>
              <SelectTrigger className="border-slate-300 focus:ring-slate-900">
                <SelectValue placeholder="Selecione um produto..." />
              </SelectTrigger>
              <SelectContent>
                {produtos.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {produto && (
            <div className="flex flex-col gap-3 p-3 bg-slate-50 rounded-md border border-slate-200">
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="outline" className="bg-white">
                  Estoque Atual: {produto.quantidade_estoque}
                </Badge>
                <Badge variant="outline" className="bg-white">
                  Ref:{' '}
                  {produto.referencia_consumo === 'itens_embalagem'
                    ? 'Por Embalagem'
                    : 'Por Qtd Comprada'}
                </Badge>
              </div>
              {ultimas.length > 0 && (
                <div className="text-xs text-slate-600 mt-1">
                  <span className="font-bold text-slate-800 block mb-1">Últimas Compras:</span>
                  {ultimas.map((u, i) => (
                    <div
                      key={i}
                      className="flex justify-between py-0.5 border-b border-slate-100 last:border-0"
                    >
                      <span>
                        {format(parseISO(u.data_criacao), 'dd/MM/yy')} -{' '}
                        {u.compras?.fornecedores?.nome}
                      </span>
                      <span className="font-medium">
                        {u.qtd_comprada} un. a R$ {u.valor_unitario.toFixed(2)}/un
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Qtd Comprada *</Label>
              <Input
                type="number"
                required
                min="1"
                value={qc}
                onChange={(e) => setQc(e.target.value)}
              />
            </div>
            {produto?.referencia_consumo === 'itens_embalagem' && (
              <div className="space-y-2">
                <Label>Itens na Embalagem *</Label>
                <Input
                  type="number"
                  required
                  min="1"
                  value={ie}
                  onChange={(e) => setIe(e.target.value)}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Valor Total (R$) *</Label>
              <Input
                type="number"
                step="0.01"
                required
                min="0"
                value={vt}
                onChange={(e) => setVt(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Valor Unit. (Calc)</Label>
              <Input
                value={`R$ ${vu.toFixed(2)}`}
                disabled
                className="bg-slate-100 text-slate-600"
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!prodId}
              className="bg-slate-900 hover:bg-slate-800 text-white"
            >
              Adicionar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

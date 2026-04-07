import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Avaliacao } from '../types'

interface Props {
  isOpen: boolean
  onClose: () => void
  avaliacao: Avaliacao
}

export function ConfirmacaoPagamentoModal({ isOpen, onClose, avaliacao }: Props) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Mocking the structure for saving the state of the sale later.
    setTimeout(() => {
      setLoading(false)
      toast({
        title: 'Sucesso',
        description: 'Confirmação de pagamento registrada (Estrutura base).',
      })
      onClose()
    }, 1000)
  }

  const getMaiorValor = (av: Avaliacao) => {
    const maxOrcamentos = av.orcamentos?.length
      ? Math.max(...av.orcamentos.map((o) => Number(o.valor)))
      : 0
    return Math.max(Number(av.valor_orcamento || 0), maxOrcamentos)
  }

  const valorSugerido = getMaiorValor(avaliacao)

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirmação de Pagamento</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para registrar o pagamento e finalizar a venda do paciente{' '}
            <strong>{avaliacao.pacientes?.nome || 'N/A'}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="valor">Valor Pago</Label>
            <Input id="valor" defaultValue={formatCurrency(valorSugerido)} placeholder="R$ 0,00" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="forma_pagamento">Forma de Pagamento</Label>
            <Select defaultValue="pix">
              <SelectTrigger id="forma_pagamento">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                <SelectItem value="boleto">Boleto</SelectItem>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações (Opcional)</Label>
            <Input id="observacoes" placeholder="Detalhes do pagamento, número do recibo..." />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={loading}
            >
              {loading ? 'Processando...' : 'Confirmar Pagamento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

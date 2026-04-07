import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
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
import { useToast } from '@/hooks/use-toast'
import { Avaliacao } from '../types'

interface Props {
  isOpen: boolean
  onClose: () => void
  avaliacao: Avaliacao
  onSuccess?: () => void
}

export function ConfirmacaoPagamentoModal({ isOpen, onClose, avaliacao, onSuccess }: Props) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [dataFechamento, setDataFechamento] = useState(() => new Date().toISOString().split('T')[0])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('avaliacoes')
        .update({ status: 'venda_concretizada' })
        .eq('id', avaliacao.id)

      if (error) throw error

      toast({
        title: 'Sucesso',
        description: 'Venda finalizada com sucesso.',
      })
      onClose()

      if (onSuccess) {
        onSuccess()
      } else {
        window.location.reload()
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao finalizar venda.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
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
          <DialogTitle>Confirmação de Venda</DialogTitle>
          <DialogDescription>
            Confirme os dados abaixo para registrar o fechamento da venda.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Nome do Paciente</Label>
            <Input
              value={avaliacao.pacientes?.nome || 'N/A'}
              readOnly
              className="bg-muted cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <Label>Dentista Avaliador</Label>
            <Input
              value={avaliacao.dentistas_avaliadores?.nome || 'N/A'}
              readOnly
              className="bg-muted cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <Label>Especialidade/Tratamento</Label>
            <Input
              value={avaliacao.tipo_tratamento || 'Não informado'}
              readOnly
              className="bg-muted cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <Label>Valor do Tratamento</Label>
            <Input
              value={formatCurrency(valorSugerido)}
              readOnly
              className="bg-muted cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="data_fechamento">Data do Fechamento</Label>
            <Input
              id="data_fechamento"
              type="date"
              value={dataFechamento}
              onChange={(e) => setDataFechamento(e.target.value)}
              required
            />
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
              {loading ? 'Processando...' : 'Confirmar Venda'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

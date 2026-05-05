import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  avaliacao: any
}

export function ConfirmacaoVendaModal({ isOpen, onClose, avaliacao }: Props) {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [dentistas, setDentistas] = useState<any[]>([])
  const [crcs, setCrcs] = useState<any[]>([])

  const [formData, setFormData] = useState({
    valor_tratamento: '',
    valor_entrada: '',
    forma_pagamento: 'pix',
    dentista_avaliador: 'nenhum',
    crc: 'nenhum',
    tratamento: 'ortodontia',
    data_venda: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    if (isOpen && avaliacao) {
      supabase
        .from('dentistas_avaliadores')
        .select('id, nome')
        .eq('status', 'ativo')
        .then(({ data }) => setDentistas(data || []))
      supabase
        .from('crc_comercial')
        .select('id, nome')
        .eq('status', 'ativo')
        .then(({ data }) => setCrcs(data || []))

      const orcamentoMax = avaliacao.orcamentos?.length
        ? Math.max(...avaliacao.orcamentos.map((o: any) => Number(o.valor)))
        : 0
      const vt = Math.max(Number(avaliacao.valor_orcamento || 0), orcamentoMax)

      setFormData({
        valor_tratamento: vt > 0 ? vt.toString() : '',
        valor_entrada: '',
        forma_pagamento: 'pix',
        dentista_avaliador: avaliacao.dentista_avaliador_id || 'nenhum',
        crc: avaliacao.crc_comercial_id || 'nenhum',
        tratamento: avaliacao.tipo_tratamento || 'ortodontia',
        data_venda: new Date().toISOString().split('T')[0],
      })
    }
  }, [isOpen, avaliacao])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const valor_tratamento = Number(formData.valor_tratamento)
      const valor_entrada = Number(formData.valor_entrada || formData.valor_tratamento)
      const paciente_nome = avaliacao.pacientes?.nome || 'Desconhecido'

      const { error: err1 } = await supabase.from('vendas_diarias').insert({
        data_venda: formData.data_venda,
        valor: valor_entrada,
        valor_tratamento: valor_tratamento,
        paciente_nome: paciente_nome,
        forma_pagamento: formData.forma_pagamento,
      })
      if (err1) throw err1

      const dentista = formData.dentista_avaliador !== 'nenhum' ? formData.dentista_avaliador : null
      const crc = formData.crc !== 'nenhum' ? formData.crc : null
      const percentual_entrada =
        valor_tratamento > 0 ? (valor_entrada / valor_tratamento) * 100 : 100

      const { error: err2 } = await supabase.from('vendas_confirmadas').insert({
        oportunidade_id: avaliacao.id,
        paciente_nome: paciente_nome,
        dentista_avaliador: dentista,
        crc: crc,
        valor_tratamento: valor_tratamento,
        valor_entrada: valor_entrada,
        percentual_entrada: percentual_entrada,
        data_fechamento: formData.data_venda,
        tratamento: formData.tratamento,
        observacoes: 'Venda Fechada via Oportunidade',
      })
      if (err2) throw err2

      const { error: err3 } = await supabase
        .from('avaliacoes')
        .update({
          status: 'venda_concretizada',
          data_fechamento: formData.data_venda,
          valor_entrada: valor_entrada,
        })
        .eq('id', avaliacao.id)
      if (err3) throw err3

      toast({ title: 'Sucesso', description: 'Venda concretizada com sucesso!' })
      onClose()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Finalizar Venda</DialogTitle>
            <DialogDescription>
              Confirme os dados da venda para o paciente{' '}
              <strong>{avaliacao?.pacientes?.nome}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Data da Venda *</Label>
                <Input
                  type="date"
                  required
                  value={formData.data_venda}
                  onChange={(e) => setFormData({ ...formData, data_venda: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Forma de Pagamento</Label>
                <Select
                  value={formData.forma_pagamento}
                  onValueChange={(v) => setFormData({ ...formData, forma_pagamento: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                    <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="boleto">Boleto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Valor Total do Tratamento *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.valor_tratamento}
                  onChange={(e) => setFormData({ ...formData, valor_tratamento: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Valor da Entrada (Recebido) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.valor_entrada}
                  onChange={(e) => setFormData({ ...formData, valor_entrada: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Dentista Avaliador</Label>
                <Select
                  value={formData.dentista_avaliador}
                  onValueChange={(v) => setFormData({ ...formData, dentista_avaliador: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Nenhum" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhum">Nenhum</SelectItem>
                    {dentistas.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>CRC Comercial</Label>
                <Select
                  value={formData.crc}
                  onValueChange={(v) => setFormData({ ...formData, crc: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Nenhum" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhum">Nenhum</SelectItem>
                    {crcs.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Tipo de Tratamento</Label>
              <Select
                value={formData.tratamento}
                onValueChange={(v) => setFormData({ ...formData, tratamento: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ortodontia">Ortodontia</SelectItem>
                  <SelectItem value="implante">Implante</SelectItem>
                  <SelectItem value="protese">Prótese</SelectItem>
                  <SelectItem value="estetica">Estética</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Confirmar Venda
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

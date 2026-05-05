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
import { useCache } from '@/hooks/use-cache'

interface Props {
  open: boolean
  onOpenChange: (val: boolean) => void
}

export function GestaoReceitasModal({ open, onOpenChange }: Props) {
  const { toast } = useToast()
  const { invalidateCache } = useCache()
  const [saving, setSaving] = useState(false)
  const [dentistas, setDentistas] = useState<any[]>([])
  const [crcs, setCrcs] = useState<any[]>([])

  const [formData, setFormData] = useState({
    paciente_nome: '',
    valor_tratamento: '',
    valor_entrada: '',
    forma_pagamento: 'pix',
    dentista_avaliador: 'nenhum',
    crc: 'nenhum',
    tratamento: 'ortodontia',
    data_venda: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    if (open) {
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
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const valor_tratamento = Number(formData.valor_tratamento)
      const valor_entrada = Number(formData.valor_entrada || formData.valor_tratamento)

      const { error: err1 } = await supabase.from('vendas_diarias').insert({
        data_venda: formData.data_venda,
        valor: valor_entrada,
        valor_tratamento: valor_tratamento,
        paciente_nome: formData.paciente_nome,
        forma_pagamento: formData.forma_pagamento,
      })

      if (err1) throw err1

      const dentista = formData.dentista_avaliador !== 'nenhum' ? formData.dentista_avaliador : null
      const crc = formData.crc !== 'nenhum' ? formData.crc : null

      const percentual_entrada =
        valor_tratamento > 0 ? (valor_entrada / valor_tratamento) * 100 : 100

      const { error: err2 } = await supabase.from('vendas_confirmadas').insert({
        paciente_nome: formData.paciente_nome,
        dentista_avaliador: dentista,
        crc: crc,
        valor_tratamento: valor_tratamento,
        valor_entrada: valor_entrada,
        percentual_entrada: percentual_entrada,
        data_fechamento: formData.data_venda,
        tratamento: formData.tratamento,
        observacoes: 'Venda Avulsa via Gestão de Receitas',
      })

      if (err2) throw err2

      toast({ title: 'Sucesso', description: 'Receita e venda registradas!' })
      if (invalidateCache) invalidateCache('vendas')
      onOpenChange(false)
      setFormData({
        paciente_nome: '',
        valor_tratamento: '',
        valor_entrada: '',
        forma_pagamento: 'pix',
        dentista_avaliador: 'nenhum',
        crc: 'nenhum',
        tratamento: 'ortodontia',
        data_venda: new Date().toISOString().split('T')[0],
      })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Lançamento de Venda/Receita</DialogTitle>
            <DialogDescription>
              Registre uma venda avulsa. Ela alimentará o financeiro e o ranking comercial.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nome do Paciente *</Label>
              <Input
                required
                value={formData.paciente_nome}
                onChange={(e) => setFormData({ ...formData, paciente_nome: e.target.value })}
              />
            </div>
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

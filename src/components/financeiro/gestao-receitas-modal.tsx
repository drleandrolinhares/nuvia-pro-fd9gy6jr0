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
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/supabase/client'
import { useCache } from '@/hooks/use-cache'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

export function GestaoReceitasModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { toast } = useToast()
  const { invalidateCache } = useCache()
  const [saving, setSaving] = useState(false)
  const [dentistas, setDentistas] = useState<any[]>([])
  const [crcs, setCrcs] = useState<any[]>([])

  const [formData, setFormData] = useState({
    valor: '',
    data_venda: new Date().toISOString().split('T')[0],
    paciente_nome: '',
    dentista_avaliador_id: '',
    crc_comercial_id: '',
    forma_pagamento: 'pix',
    destino_pagamento: 'caixa',
    destino_fiscal: 'pf',
  })

  useEffect(() => {
    if (open) {
      Promise.all([
        supabase.from('dentistas_avaliadores').select('id, nome').eq('status', 'ativo'),
        supabase.from('crc_comercial').select('id, nome').eq('status', 'ativo'),
      ]).then(([d, c]) => {
        if (d.data) setDentistas(d.data)
        if (c.data) setCrcs(c.data)
      })
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.dentista_avaliador_id) {
      return toast({
        title: 'Atenção',
        description: 'Selecione o Dentista Avaliador.',
        variant: 'destructive',
      })
    }
    if (!formData.crc_comercial_id) {
      return toast({
        title: 'Atenção',
        description: 'Selecione o CRC Comercial.',
        variant: 'destructive',
      })
    }

    setSaving(true)
    try {
      const { error } = await supabase.from('vendas_diarias').insert({
        valor: Number(formData.valor),
        valor_tratamento: Number(formData.valor),
        data_venda: formData.data_venda,
        paciente_nome: formData.paciente_nome || 'Venda Avulsa',
        dentista_avaliador_id: formData.dentista_avaliador_id,
        crc_comercial_id: formData.crc_comercial_id,
        forma_pagamento: formData.forma_pagamento,
        destino_pagamento: formData.destino_pagamento,
        destino_fiscal: formData.destino_fiscal,
      })
      if (error) throw error
      toast({ title: 'Sucesso', description: 'Venda lançada com sucesso!' })
      invalidateCache()
      onOpenChange(false)
      setFormData({
        valor: '',
        data_venda: new Date().toISOString().split('T')[0],
        paciente_nome: '',
        dentista_avaliador_id: '',
        crc_comercial_id: '',
        forma_pagamento: 'pix',
        destino_pagamento: 'caixa',
        destino_fiscal: 'pf',
      })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Lançar Venda Avulsa</DialogTitle>
            <DialogDescription>
              Registre uma nova venda direta com identificação de responsáveis.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Valor (R$) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Data *</Label>
                <Input
                  type="date"
                  required
                  value={formData.data_venda}
                  onChange={(e) => setFormData({ ...formData, data_venda: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Nome do Paciente (Opcional)</Label>
              <Input
                value={formData.paciente_nome}
                onChange={(e) => setFormData({ ...formData, paciente_nome: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label>Dentista Avaliador *</Label>
              <Select
                value={formData.dentista_avaliador_id}
                onValueChange={(v) => setFormData({ ...formData, dentista_avaliador_id: v })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {dentistas.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>CRC Comercial *</Label>
              <Select
                value={formData.crc_comercial_id}
                onValueChange={(v) => setFormData({ ...formData, crc_comercial_id: v })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {crcs.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Forma Pag.</Label>
                <Select
                  value={formData.forma_pagamento}
                  onValueChange={(v) => setFormData({ ...formData, forma_pagamento: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="cartao_credito">Cartão de Créd.</SelectItem>
                    <SelectItem value="cartao_debito">Cartão de Déb.</SelectItem>
                    <SelectItem value="boleto">Boleto</SelectItem>
                    <SelectItem value="transferencia">Transferência</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Destino Pag.</Label>
                <Select
                  value={formData.destino_pagamento}
                  onValueChange={(v) => setFormData({ ...formData, destino_pagamento: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="caixa">Caixa Clínica</SelectItem>
                    <SelectItem value="banco">Conta Bancária</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Dest. Fiscal</Label>
                <Select
                  value={formData.destino_fiscal}
                  onValueChange={(v) => setFormData({ ...formData, destino_fiscal: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pf">PF</SelectItem>
                    <SelectItem value="pj1">PJ 01</SelectItem>
                    <SelectItem value="pj2">PJ 02</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Venda
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

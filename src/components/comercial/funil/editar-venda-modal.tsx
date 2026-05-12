import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'

export function EditarVendaModal({ open, onOpenChange, venda, onSaved }: any) {
  const [loading, setLoading] = useState(false)
  const [origens, setOrigens] = useState<any[]>([])
  const [dentistas, setDentistas] = useState<any[]>([])
  const [crcs, setCrcs] = useState<any[]>([])

  const [formData, setFormData] = useState({
    paciente_nome: '',
    valor_tratamento: 0,
    data_fechamento: '',
    data_original: '',
    origem_id: '',
    dentista_avaliador: '',
    crc: '',
    forma_pagamento: '',
  })

  useEffect(() => {
    if (!open) return
    const fetchSelects = async () => {
      const [origensRes, dentistasRes, crcsRes] = await Promise.all([
        supabase.from('funil_origens').select('id, nome').eq('ativo', true).order('nome'),
        supabase
          .from('dentistas_avaliadores')
          .select('id, nome')
          .eq('status', 'ativo')
          .order('nome'),
        supabase.from('crc_comercial').select('id, nome').eq('status', 'ativo').order('nome'),
      ])

      setOrigens(origensRes.data || [])
      setDentistas(dentistasRes.data || [])
      setCrcs(crcsRes.data || [])
    }
    fetchSelects()
  }, [open])

  useEffect(() => {
    if (venda && open) {
      setFormData({
        paciente_nome: venda.paciente_nome || '',
        valor_tratamento: venda.valor_tratamento || 0,
        data_fechamento: venda.data_fechamento || '',
        data_original: venda.data_avaliacao || venda.data_original || venda.data_fechamento || '',
        origem_id: venda.origem_id || '',
        dentista_avaliador: venda.dentista_avaliador || '',
        crc: venda.crc || '',
        forma_pagamento: venda.forma_pagamento || '',
      })
    }
  }, [venda, open])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('vendas_confirmadas')
        .update({
          paciente_nome: formData.paciente_nome,
          valor_tratamento: formData.valor_tratamento,
          data_fechamento: formData.data_fechamento,
          data_original: formData.data_original,
          origem_id: formData.origem_id || null,
          dentista_avaliador: formData.dentista_avaliador || null,
          crc: formData.crc || null,
          forma_pagamento: formData.forma_pagamento || null,
        })
        .eq('id', venda.id)

      if (error) throw error

      if (formData.paciente_nome && formData.origem_id) {
        await supabase
          .from('funil_leads')
          .update({ origem_id: formData.origem_id })
          .ilike('nome', formData.paciente_nome)
        if (venda.oportunidade_id) {
          await supabase
            .from('avaliacoes')
            .update({ origem_id: formData.origem_id })
            .eq('id', venda.oportunidade_id)
        } else {
          const { data: paciente } = await supabase
            .from('pacientes')
            .select('id')
            .ilike('nome', formData.paciente_nome)
            .maybeSingle()
          if (paciente?.id) {
            await supabase
              .from('avaliacoes')
              .update({ origem_id: formData.origem_id })
              .eq('paciente_id', paciente.id)
          }
        }
      }

      toast.success('Venda atualizada com sucesso!')
      onOpenChange(false)
      if (onSaved) onSaved()
    } catch (err: any) {
      toast.error('Erro ao atualizar venda: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-slate-900 border-slate-800 text-slate-200">
        <DialogHeader>
          <DialogTitle>Editar Venda - {venda?.paciente_nome}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>Paciente</Label>
              <Input
                value={formData.paciente_nome}
                onChange={(e) => setFormData({ ...formData, paciente_nome: e.target.value })}
                className="bg-slate-950 border-slate-800"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Data da Avaliação (Original)</Label>
              <Input
                type="date"
                value={formData.data_original}
                onChange={(e) => setFormData({ ...formData, data_original: e.target.value })}
                className="bg-slate-950 border-slate-800"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Data do Fechamento</Label>
              <Input
                type="date"
                value={formData.data_fechamento}
                onChange={(e) => setFormData({ ...formData, data_fechamento: e.target.value })}
                className="bg-slate-950 border-slate-800"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Valor do Tratamento</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.valor_tratamento}
                onChange={(e) =>
                  setFormData({ ...formData, valor_tratamento: Number(e.target.value) })
                }
                className="bg-slate-950 border-slate-800"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Forma de Pagamento</Label>
              <Select
                value={formData.forma_pagamento}
                onValueChange={(v) => setFormData({ ...formData, forma_pagamento: v })}
              >
                <SelectTrigger className="bg-slate-950 border-slate-800">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                  <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                  <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                  <SelectItem value="PIX">PIX</SelectItem>
                  <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="Boleto">Boleto</SelectItem>
                  <SelectItem value="Financiamento">Financiamento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Origem</Label>
              <Select
                value={formData.origem_id}
                onValueChange={(v) => setFormData({ ...formData, origem_id: v })}
              >
                <SelectTrigger className="bg-slate-950 border-slate-800">
                  <SelectValue placeholder="Selecione a origem" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                  {origens.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Dentista Avaliador</Label>
              <Select
                value={formData.dentista_avaliador}
                onValueChange={(v) => setFormData({ ...formData, dentista_avaliador: v })}
              >
                <SelectTrigger className="bg-slate-950 border-slate-800">
                  <SelectValue placeholder="Selecione o dentista" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                  {dentistas.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2">
              <Label>CRC Comercial</Label>
              <Select
                value={formData.crc}
                onValueChange={(v) => setFormData({ ...formData, crc: v })}
              >
                <SelectTrigger className="bg-slate-950 border-slate-800">
                  <SelectValue placeholder="Selecione o CRC" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                  {crcs.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-transparent border-slate-700 text-slate-300"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-amber-500 text-amber-950 hover:bg-amber-600"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

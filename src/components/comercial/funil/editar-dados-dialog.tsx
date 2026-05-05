import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Edit2, Loader2 } from 'lucide-react'

export function EditarDadosDialog({ origem, dado, mesReferencia, onUpdate }: any) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    investimento: dado?.investimento || 0,
    meta_leads: dado?.meta_leads || 0,
    leads_realizado: dado?.leads_realizado || 0,
    meta_agendamentos_qtde: dado?.meta_agendamentos_qtde || 0,
    meta_agendamentos_perc: dado?.meta_agendamentos_perc || 0,
    agendamentos_realizado: dado?.agendamentos_realizado || 0,
    meta_comparecimentos_qtde: dado?.meta_comparecimentos_qtde || 0,
    meta_comparecimentos_perc: dado?.meta_comparecimentos_perc || 0,
    comparecimentos_realizado: dado?.comparecimentos_realizado || 0,
    meta_fechamento_valor: dado?.meta_fechamento_valor || 0,
    ticket_medio_esperado: dado?.ticket_medio_esperado || 0,
    fechamentos_qtde_realizado: dado?.fechamentos_qtde_realizado || 0,
    fechamentos_valor_realizado: dado?.fechamentos_valor_realizado || 0,
  })

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: Number(value) }))
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        origem_id: origem.id,
        mes_referencia: mesReferencia,
        ...formData,
      }

      let error
      if (dado?.id) {
        const { error: err } = await supabase
          .from('funil_dados_mensais')
          .update(payload)
          .eq('id', dado.id)
        error = err
      } else {
        const { error: err } = await supabase.from('funil_dados_mensais').insert([payload])
        error = err
      }

      if (error) throw error
      toast.success('Dados salvos com sucesso!')
      onUpdate()
      setOpen(false)
    } catch (error: any) {
      toast.error('Erro ao salvar: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-slate-400 hover:text-white transition-colors"
        >
          <Edit2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Editar Dados: {origem.nome} ({mesReferencia})
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
              <h4 className="font-semibold text-amber-500 uppercase text-xs tracking-wider">
                Investimento
              </h4>
              <div className="space-y-2">
                <Label>Valor Investido (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  name="investimento"
                  value={formData.investimento}
                  onChange={handleChange}
                  className="bg-slate-950 border-slate-700 focus-visible:ring-amber-500"
                />
              </div>
            </div>

            <div className="space-y-4 bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
              <h4 className="font-semibold text-white uppercase text-xs tracking-wider">Leads</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Realizado (Qtd)</Label>
                  <Input
                    type="number"
                    name="leads_realizado"
                    value={formData.leads_realizado}
                    onChange={handleChange}
                    className="bg-slate-950 border-slate-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Meta (Qtd)</Label>
                  <Input
                    type="number"
                    name="meta_leads"
                    value={formData.meta_leads}
                    onChange={handleChange}
                    className="bg-slate-950 border-slate-700"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
              <h4 className="font-semibold text-blue-400 uppercase text-xs tracking-wider">
                Agendamentos
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Realizado (Qtd)</Label>
                  <Input
                    type="number"
                    name="agendamentos_realizado"
                    value={formData.agendamentos_realizado}
                    onChange={handleChange}
                    className="bg-slate-950 border-slate-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Meta (Qtd)</Label>
                  <Input
                    type="number"
                    name="meta_agendamentos_qtde"
                    value={formData.meta_agendamentos_qtde}
                    onChange={handleChange}
                    className="bg-slate-950 border-slate-700"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
              <h4 className="font-semibold text-purple-400 uppercase text-xs tracking-wider">
                Comparecimentos
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Realizado (Qtd)</Label>
                  <Input
                    type="number"
                    name="comparecimentos_realizado"
                    value={formData.comparecimentos_realizado}
                    onChange={handleChange}
                    className="bg-slate-950 border-slate-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Meta (Qtd)</Label>
                  <Input
                    type="number"
                    name="meta_comparecimentos_qtde"
                    value={formData.meta_comparecimentos_qtde}
                    onChange={handleChange}
                    className="bg-slate-950 border-slate-700"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 md:col-span-2">
              <h4 className="font-semibold text-emerald-400 uppercase text-xs tracking-wider">
                Fechamentos
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Qtd Realizado</Label>
                  <Input
                    type="number"
                    name="fechamentos_qtde_realizado"
                    value={formData.fechamentos_qtde_realizado}
                    onChange={handleChange}
                    className="bg-slate-950 border-slate-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor Realizado (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    name="fechamentos_valor_realizado"
                    value={formData.fechamentos_valor_realizado}
                    onChange={handleChange}
                    className="bg-slate-950 border-slate-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Meta Valor (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    name="meta_fechamento_valor"
                    value={formData.meta_fechamento_valor}
                    onChange={handleChange}
                    className="bg-slate-950 border-slate-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ticket Médio Esp. (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    name="ticket_medio_esperado"
                    value={formData.ticket_medio_esperado}
                    onChange={handleChange}
                    className="bg-slate-950 border-slate-700"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="hover:bg-slate-800 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-amber-500 text-slate-950 hover:bg-amber-600 font-semibold"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvar Dados
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

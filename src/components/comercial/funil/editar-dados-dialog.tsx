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
import { Edit2, Loader2, Save } from 'lucide-react'

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
          variant="outline"
          size="sm"
          className="h-9 px-3 bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:text-white transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5 mr-2 text-slate-400" />
          Editar Valores
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 border-b border-slate-800 bg-slate-900/80 sticky top-0 z-10 backdrop-blur-sm">
          <DialogTitle className="text-xl">
            Lançamento de Dados: <span className="text-amber-500">{origem.nome}</span> (
            {mesReferencia})
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Investimento & Leads */}
            <div className="space-y-4">
              <div className="bg-slate-800/30 p-5 rounded-xl border border-slate-700/50">
                <h4 className="font-bold text-slate-300 uppercase text-xs tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  Investimento e Captação
                </h4>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Valor Investido (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      name="investimento"
                      value={formData.investimento}
                      onChange={handleChange}
                      className="bg-slate-950 border-slate-700 focus-visible:ring-amber-500 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Leads (Realizado)</Label>
                      <Input
                        type="number"
                        name="leads_realizado"
                        value={formData.leads_realizado}
                        onChange={handleChange}
                        className="bg-slate-950 border-slate-700 font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-400">Meta de Leads</Label>
                      <Input
                        type="number"
                        name="meta_leads"
                        value={formData.meta_leads}
                        onChange={handleChange}
                        className="bg-slate-950 border-slate-800 text-slate-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Agendamentos */}
            <div className="space-y-4">
              <div className="bg-blue-950/10 p-5 rounded-xl border border-blue-900/30">
                <h4 className="font-bold text-blue-400 uppercase text-xs tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Agendamentos
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Qtd Realizado</Label>
                    <Input
                      type="number"
                      name="agendamentos_realizado"
                      value={formData.agendamentos_realizado}
                      onChange={handleChange}
                      className="bg-slate-950 border-slate-700 font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-400">Meta (Qtd)</Label>
                    <Input
                      type="number"
                      name="meta_agendamentos_qtde"
                      value={formData.meta_agendamentos_qtde}
                      onChange={handleChange}
                      className="bg-slate-950 border-slate-800 text-slate-400"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label className="text-slate-400">Meta de Conversão (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      name="meta_agendamentos_perc"
                      value={formData.meta_agendamentos_perc}
                      onChange={handleChange}
                      className="bg-slate-950 border-slate-800 text-slate-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Comparecimentos */}
            <div className="space-y-4">
              <div className="bg-purple-950/10 p-5 rounded-xl border border-purple-900/30">
                <h4 className="font-bold text-purple-400 uppercase text-xs tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  Comparecimentos
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Qtd Realizado</Label>
                    <Input
                      type="number"
                      name="comparecimentos_realizado"
                      value={formData.comparecimentos_realizado}
                      onChange={handleChange}
                      className="bg-slate-950 border-slate-700 font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-400">Meta (Qtd)</Label>
                    <Input
                      type="number"
                      name="meta_comparecimentos_qtde"
                      value={formData.meta_comparecimentos_qtde}
                      onChange={handleChange}
                      className="bg-slate-950 border-slate-800 text-slate-400"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label className="text-slate-400">Meta de Conversão (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      name="meta_comparecimentos_perc"
                      value={formData.meta_comparecimentos_perc}
                      onChange={handleChange}
                      className="bg-slate-950 border-slate-800 text-slate-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Fechamentos */}
            <div className="space-y-4">
              <div className="bg-emerald-950/10 p-5 rounded-xl border border-emerald-900/30 h-full">
                <h4 className="font-bold text-emerald-400 uppercase text-xs tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Fechamentos (Vendas)
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300 flex items-center gap-2">
                      Qtd Realizado
                      <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                        Automático
                      </span>
                    </Label>
                    <Input
                      type="number"
                      name="fechamentos_qtde_realizado"
                      value={formData.fechamentos_qtde_realizado}
                      disabled
                      className="bg-slate-900 border-slate-800 text-slate-500 font-medium cursor-not-allowed opacity-70"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300 flex items-center gap-2">
                      Receita Realizada (R$)
                      <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                        Automático
                      </span>
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      name="fechamentos_valor_realizado"
                      value={formData.fechamentos_valor_realizado}
                      disabled
                      className="bg-slate-900 border-slate-800 text-emerald-700 font-medium cursor-not-allowed opacity-70"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-400">Meta Receita (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      name="meta_fechamento_valor"
                      value={formData.meta_fechamento_valor}
                      onChange={handleChange}
                      className="bg-slate-950 border-slate-800 text-slate-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-400">Ticket Médio Esp. (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      name="ticket_medio_esperado"
                      value={formData.ticket_medio_esperado}
                      onChange={handleChange}
                      className="bg-slate-950 border-slate-800 text-slate-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-800">
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
              className="bg-amber-500 text-slate-950 hover:bg-amber-600 font-bold px-6"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar Dados do Funil
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

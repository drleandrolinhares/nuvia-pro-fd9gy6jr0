import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { Loader2, Save } from 'lucide-react'

export function PPEPDMTab() {
  const { user } = useAuth()
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [pp, setPp] = useState('')
  const [pdm, setPdm] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user && date) {
      loadData()
    }
  }, [user, date])

  const loadData = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('performance_pp_pdm' as any)
        .select('*')
        .eq('usuario_id', user?.id)
        .eq('data_registro', date)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') throw error

      if (data) {
        setPp(data.pontos_positivos || '')
        setPdm(data.pontos_melhoria || '')
      } else {
        setPp('')
        setPdm('')
      }
    } catch (error: any) {
      toast.error('Erro ao carregar dados: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return
    if (!pp.trim() && !pdm.trim()) {
      toast.warning('Preencha ao menos um dos campos antes de salvar.')
      return
    }

    setSaving(true)
    try {
      const { data: existing } = await supabase
        .from('performance_pp_pdm' as any)
        .select('id')
        .eq('usuario_id', user.id)
        .eq('data_registro', date)
        .maybeSingle()

      if (existing) {
        const { error } = await supabase
          .from('performance_pp_pdm' as any)
          .update({
            pontos_positivos: pp,
            pontos_melhoria: pdm,
            atualizado_em: new Date().toISOString(),
          })
          .eq('id', existing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('performance_pp_pdm' as any).insert({
          usuario_id: user.id,
          data_registro: date,
          pontos_positivos: pp,
          pontos_melhoria: pdm,
        })
        if (error) throw error
      }

      toast.success('Registros salvos com sucesso!')
    } catch (error: any) {
      toast.error('Erro ao salvar: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Pontos Positivos (PP) e Pontos de Melhoria (PDM)</CardTitle>
        <CardDescription>Registre suas considerações diárias de performance.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-2 max-w-sm">
          <Label htmlFor="date" className="text-slate-700">
            Data de Registro
          </Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-white cursor-pointer"
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label
                htmlFor="pp"
                className="text-emerald-700 font-semibold flex items-center gap-2"
              >
                Pontos Positivos (PP)
              </Label>
              <Textarea
                id="pp"
                placeholder="O que deu certo hoje? Quais foram as conquistas ou destaques?"
                className="min-h-[220px] resize-none border-emerald-200 bg-emerald-50/30 focus-visible:ring-emerald-500 text-base shadow-sm"
                value={pp}
                onChange={(e) => setPp(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="pdm" className="text-rose-700 font-semibold flex items-center gap-2">
                Pontos de Melhoria (PDM)
              </Label>
              <Textarea
                id="pdm"
                placeholder="O que pode ser melhorado? Quais foram os desafios e gargalos?"
                className="min-h-[220px] resize-none border-rose-200 bg-rose-50/30 focus-visible:ring-rose-500 text-base shadow-sm"
                value={pdm}
                onChange={(e) => setPdm(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <Button
            onClick={handleSave}
            disabled={loading || saving}
            className="gap-2 bg-amber-600 hover:bg-amber-700 text-white min-w-[150px] shadow-sm"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar Registros
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

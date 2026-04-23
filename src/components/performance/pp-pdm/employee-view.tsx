import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Save, Clock, AlertTriangle } from 'lucide-react'
import { startOfWeek, addDays, isAfter, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

function getCurrentDeadline() {
  const now = new Date()
  const sunday = startOfWeek(now, { weekStartsOn: 0 })
  const saturday = addDays(sunday, 6)
  saturday.setHours(11, 59, 0, 0)

  if (isAfter(now, saturday)) {
    return addDays(saturday, 7)
  }
  return saturday
}

export function EmployeePPDMView() {
  const { user, profile } = useAuth()
  const [pp, setPp] = useState('')
  const [pdm, setPdm] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const deadline = getCurrentDeadline()
  const weekRef = format(deadline, 'yyyy-MM-dd')

  const now = new Date()
  const isSaturday = now.getDay() === 6
  const isBlocked = isSaturday && now.getHours() >= 12

  useEffect(() => {
    if (user) loadData()
  }, [user, weekRef])

  const loadData = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('performance_pp_pdm' as any)
        .select('*')
        .eq('usuario_id', user?.id)
        .eq('data_registro', weekRef)
        .maybeSingle()

      if (data) {
        setPp(data.pontos_positivos || '')
        setPdm(data.pontos_melhoria || '')
      } else {
        setPp('')
        setPdm('')
      }
    } catch (e: any) {
      console.error(e)
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
        .eq('data_registro', weekRef)
        .maybeSingle()

      if (existing) {
        await supabase
          .from('performance_pp_pdm' as any)
          .update({
            pontos_positivos: pp,
            pontos_melhoria: pdm,
            atualizado_em: new Date().toISOString(),
          })
          .eq('id', existing.id)
      } else {
        await supabase.from('performance_pp_pdm' as any).insert({
          usuario_id: user.id,
          data_registro: weekRef,
          pontos_positivos: pp,
          pontos_melhoria: pdm,
        })
      }
      toast.success('Registros salvos com sucesso!')
    } catch (e: any) {
      toast.error('Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="border-slate-200 shadow-sm mt-6">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <CardTitle className="text-xl">Meus PP e PDM</CardTitle>
            <CardDescription>Registre suas considerações da semana atual.</CardDescription>
          </div>
          <div className="bg-amber-50 text-amber-800 text-sm font-medium px-3 py-1.5 rounded-md flex items-center gap-2 border border-amber-200 shadow-sm">
            <Clock className="w-4 h-4" />
            Prazo: {format(deadline, "EEEE', 'dd/MM' às 'HH:mm", { locale: ptBR })}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {(profile as any)?.obrigatorio_pp_pdm && (
          <div className="bg-blue-50 text-blue-800 p-3 rounded-md flex items-start gap-2 border border-blue-200">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm">
              Você está marcado para o preenchimento obrigatório semanal. Envie suas considerações
              até o prazo estipulado para evitar pendências no relatório.
            </p>
          </div>
        )}

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
                placeholder="O que deu certo nesta semana? Conquistas ou destaques?"
                className="min-h-[220px] resize-none border-emerald-200 bg-emerald-50/30 focus-visible:ring-emerald-500 text-base shadow-sm disabled:opacity-70"
                value={pp}
                onChange={(e) => setPp(e.target.value)}
                disabled={isBlocked}
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="pdm" className="text-rose-700 font-semibold flex items-center gap-2">
                Pontos de Melhoria (PDM)
              </Label>
              <Textarea
                id="pdm"
                placeholder="O que pode ser melhorado? Desafios e gargalos da semana?"
                className="min-h-[220px] resize-none border-rose-200 bg-rose-50/30 focus-visible:ring-rose-500 text-base shadow-sm disabled:opacity-70"
                value={pdm}
                onChange={(e) => setPdm(e.target.value)}
                disabled={isBlocked}
              />
            </div>
          </div>
        )}

        {isBlocked && (
          <div className="bg-amber-50 text-amber-800 p-3 rounded-md border border-amber-200 mt-4 text-sm font-medium">
            Envio bloqueado. O preenchimento se encerrou no sábado às 11:59h. O sistema será
            reaberto na próxima semana.
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <Button
            onClick={handleSave}
            disabled={loading || saving || isBlocked}
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

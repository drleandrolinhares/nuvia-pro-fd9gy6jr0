import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Save, Clock } from 'lucide-react'
import { startOfWeek, addDays, isAfter, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

function getCurrentDeadline() {
  const now = new Date()
  const sunday = startOfWeek(now, { weekStartsOn: 0 })
  const saturday = addDays(sunday, 6)
  saturday.setHours(11, 59, 0, 0)
  return isAfter(now, saturday) ? addDays(saturday, 7) : saturday
}

export function EmployeeInovacoesView() {
  const { user } = useAuth()
  const [recordId, setRecordId] = useState<string | null>(null)
  const [inovacoes, setInovacoes] = useState('')
  const [inovacaoValidada, setInovacaoValidada] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const deadline = getCurrentDeadline()
  const weekRef = format(deadline, 'yyyy-MM-dd')
  const isBlocked = new Date().getDay() === 6 && new Date().getHours() >= 12

  useEffect(() => {
    if (user) loadData()
  }, [user, weekRef])

  const loadData = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('performance_pp_pdm' as any)
        .select('id, inovacoes, inovacao_validada')
        .eq('usuario_id', user?.id)
        .eq('data_registro', weekRef)
        .maybeSingle()

      if (data) {
        setRecordId(data.id)
        setInovacoes(data.inovacoes || '')
        setInovacaoValidada(data.inovacao_validada || false)
      } else {
        setRecordId(null)
        setInovacoes('')
        setInovacaoValidada(false)
      }
    } catch (e: any) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return
    if (!inovacoes.trim()) {
      toast.warning('Preencha as inovações antes de salvar.')
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
          .update({ inovacoes, atualizado_em: new Date().toISOString() })
          .eq('id', existing.id)
        setRecordId(existing.id)
      } else {
        const { data: inserted } = await supabase
          .from('performance_pp_pdm' as any)
          .insert({
            usuario_id: user.id,
            data_registro: weekRef,
            inovacoes,
            pontos_positivos: '',
            pontos_melhoria: '',
            nota_pdm: 0,
            atualizado_em: new Date().toISOString(),
          })
          .select('id')
          .single()
        if (inserted) setRecordId(inserted.id)
      }

      toast.success('Inovações salvas com sucesso!')
    } catch (e: any) {
      toast.error('Erro ao salvar inovações.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="border-slate-200 shadow-sm mt-6">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <CardTitle className="text-xl">Minhas Inovações</CardTitle>
            <CardDescription>Registre sugestões e inovações da semana atual.</CardDescription>
          </div>
          <div className="bg-blue-50 text-blue-800 text-sm font-medium px-3 py-1.5 rounded-md flex items-center gap-2 border border-blue-200 shadow-sm">
            <Clock className="w-4 h-4" /> Prazo:{' '}
            {format(deadline, "EEEE', 'dd/MM' às 'HH:mm", { locale: ptBR })}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-blue-700 font-semibold flex items-center gap-2">
                Descreva suas inovações
              </Label>
              {inovacaoValidada && (
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-bold">
                  Validado (R$ 100)
                </span>
              )}
            </div>
            <Textarea
              placeholder="Sugestões de implementações: ação, equipamento, comportamento..."
              className="min-h-[150px] resize-none border-blue-200 bg-blue-50/30 focus-visible:ring-blue-500 text-sm shadow-sm disabled:opacity-70"
              value={inovacoes}
              onChange={(e) => setInovacoes(e.target.value)}
              disabled={isBlocked || inovacaoValidada}
            />

            {isBlocked && (
              <div className="bg-amber-50 text-amber-800 p-3 rounded-md border border-amber-200 text-sm font-medium">
                Envio bloqueado. O preenchimento se encerrou no sábado às 11:59h.
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button
                onClick={handleSave}
                disabled={loading || saving || isBlocked || inovacaoValidada}
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white min-w-[150px]"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}{' '}
                Salvar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

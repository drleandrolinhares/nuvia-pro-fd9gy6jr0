import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, Save, Clock } from 'lucide-react'

export default function ControleAcesso() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState<any>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data: configData, error: configError } = await supabase
        .from('configuracoes_acesso' as any)
        .select('*')
        .single()

      if (configError && configError.code !== 'PGRST116') throw configError

      if (configData) {
        setConfig(configData)
      } else {
        setConfig({
          dom_inicio: '00:00',
          dom_fim: '00:00',
          seg_inicio: '07:00',
          seg_fim: '19:00',
          ter_inicio: '07:00',
          ter_fim: '19:00',
          qua_inicio: '07:00',
          qua_fim: '19:00',
          qui_inicio: '07:00',
          qui_fim: '19:00',
          sex_inicio: '07:00',
          sex_fim: '19:00',
          sab_inicio: '07:00',
          sab_fim: '12:00',
        })
      }
    } catch (error) {
      toast.error('Erro ao carregar configurações de acesso')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const { error } = await supabase
        .from('configuracoes_acesso' as any)
        .upsert({ id: config?.id, ...config, atualizado_em: new Date().toISOString() })

      if (error) throw error
      toast.success('Configurações salvas com sucesso!')
    } catch (error) {
      toast.error('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setConfig((prev: any) => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    )
  }

  const days = [
    { id: 'dom', label: 'Domingo' },
    { id: 'seg', label: 'Segunda-feira' },
    { id: 'ter', label: 'Terça-feira' },
    { id: 'qua', label: 'Quarta-feira' },
    { id: 'qui', label: 'Quinta-feira' },
    { id: 'sex', label: 'Sexta-feira' },
    { id: 'sab', label: 'Sábado' },
  ]

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-slate-900 p-6 rounded-xl border-l-4 border-amber-500 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-800 rounded-lg">
            <Clock className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white uppercase">
              Controle de Acesso
            </h1>
            <p className="text-slate-300 mt-1 text-sm uppercase tracking-wider font-medium">
              Defina os limites de horário de funcionamento
            </p>
          </div>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-white uppercase tracking-wider">
            Limites de Horário
          </CardTitle>
          <CardDescription className="text-slate-300">
            Defina o horário de início e fim para cada dia da semana. Fora desse período, o acesso
            será bloqueado automaticamente pelo Smart Lock. Domingos são sempre bloqueados por
            padrão e administradores possuem acesso irrestrito.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6">
            {days.map((day) => (
              <div
                key={day.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 md:items-center border-b border-slate-800/50 pb-6 last:border-0 last:pb-0"
              >
                <div className="md:col-span-4">
                  <span className="font-bold text-slate-100 uppercase tracking-wide text-sm">
                    {day.label}
                  </span>
                  {day.id === 'dom' && (
                    <p className="text-xs text-amber-500 mt-1 font-medium">
                      Domingo: mantenha 00:00 — 00:00 para bloquear. Gerentes Administrativos
                      possuem acesso irrestrito.
                    </p>
                  )}
                  {day.id === 'sab' && (
                    <p className="text-xs text-amber-500 mt-1 font-medium">
                      Aos sábados, apenas a página de Performance ficará acessível.
                    </p>
                  )}
                </div>
                <div className="md:col-span-4">
                  <Label className="text-xs text-slate-300 font-bold uppercase tracking-wider mb-2 block">
                    Horário de Início
                  </Label>
                  <Input
                    type="time"
                    value={config[`${day.id}_inicio`]?.substring(0, 5) || ''}
                    onChange={(e) => handleChange(`${day.id}_inicio`, e.target.value)}
                    className="bg-slate-950 border-slate-700 text-slate-100 focus-visible:ring-amber-500 focus-visible:border-amber-500 [color-scheme:dark]"
                  />
                </div>
                <div className="md:col-span-4">
                  <Label className="text-xs text-slate-300 font-bold uppercase tracking-wider mb-2 block">
                    Horário de Fim
                  </Label>
                  <Input
                    type="time"
                    value={config[`${day.id}_fim`]?.substring(0, 5) || ''}
                    onChange={(e) => handleChange(`${day.id}_fim`, e.target.value)}
                    className="bg-slate-950 border-slate-700 text-slate-100 focus-visible:ring-amber-500 focus-visible:border-amber-500 [color-scheme:dark]"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 mt-6 border-t border-slate-800 flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full md:w-auto bg-amber-500 text-slate-900 hover:bg-amber-600 font-bold uppercase tracking-wider text-xs transition-all shadow-sm"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar Restrições
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

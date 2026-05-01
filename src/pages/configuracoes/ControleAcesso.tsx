import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'

export default function ControleAcesso() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState<any>(null)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('configuracoes_acesso' as any)
        .select('*')
        .single()
      if (error && error.code !== 'PGRST116') throw error
      if (data) {
        setConfig(data)
      } else {
        setConfig({
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
      toast.error('Erro ao carregar configurações')
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
    { id: 'seg', label: 'Segunda-feira' },
    { id: 'ter', label: 'Terça-feira' },
    { id: 'qua', label: 'Quarta-feira' },
    { id: 'qui', label: 'Quinta-feira' },
    { id: 'sex', label: 'Sexta-feira' },
    { id: 'sab', label: 'Sábado' },
  ]

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Controle de Acesso</h1>
        <p className="text-slate-400 mt-1">
          Configure os horários em que os colaboradores podem acessar o sistema. Fora desse período,
          o acesso será bloqueado automaticamente.
        </p>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle>Limites de Horário</CardTitle>
          <CardDescription>
            Defina o horário de início e fim para cada dia da semana. Domingos são sempre bloqueados
            por padrão e administradores possuem acesso irrestrito.
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
                  <span className="font-medium text-slate-200">{day.label}</span>
                  {day.id === 'sab' && (
                    <p className="text-xs text-amber-500/80 mt-1">
                      Aos sábados, apenas a página de Performance ficará acessível.
                    </p>
                  )}
                </div>
                <div className="md:col-span-4">
                  <Label className="text-xs text-slate-400 mb-2 block">Horário de Início</Label>
                  <Input
                    type="time"
                    value={config[`${day.id}_inicio`]?.substring(0, 5) || ''}
                    onChange={(e) => handleChange(`${day.id}_inicio`, e.target.value)}
                    className="bg-slate-950 border-slate-800 text-slate-100 [color-scheme:dark]"
                  />
                </div>
                <div className="md:col-span-4">
                  <Label className="text-xs text-slate-400 mb-2 block">Horário de Fim</Label>
                  <Input
                    type="time"
                    value={config[`${day.id}_fim`]?.substring(0, 5) || ''}
                    onChange={(e) => handleChange(`${day.id}_fim`, e.target.value)}
                    className="bg-slate-950 border-slate-800 text-slate-100 [color-scheme:dark]"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 mt-6 border-t border-slate-800 flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto">
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

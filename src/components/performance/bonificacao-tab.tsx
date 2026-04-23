import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CheckCircle2, Loader2, Save, XCircle, Award } from 'lucide-react'
import { cn } from '@/lib/utils'

const CHECKLIST_ITEMS = [
  { id: '1', label: 'Cumprimento rigoroso do horário (Pontualidade)' },
  { id: '2', label: 'Assiduidade (Zero faltas injustificadas)' },
  { id: '3', label: 'Uso correto do uniforme e EPIs' },
  { id: '4', label: 'Organização e limpeza do setor' },
  { id: '5', label: 'Preenchimento correto dos sistemas e planilhas' },
  { id: '6', label: 'Comunicação adequada com pacientes e equipe' },
  { id: '7', label: 'Proatividade na resolução de problemas' },
  { id: '8', label: 'Participação ativa nas reuniões de alinhamento' },
  { id: '9', label: 'Cumprimento das normas internas da clínica' },
]

const BONUS_VALUE = 350.0

export function BonificacaoTab() {
  const { user } = useAuth()
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'))
  const [checkedItems, setCheckedItems] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const monthOptions = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    return {
      value: format(d, 'yyyy-MM'),
      label: format(d, 'MMMM yyyy', { locale: ptBR }).replace(/^\w/, (c) => c.toUpperCase()),
    }
  })

  useEffect(() => {
    if (user && month) {
      loadData()
    }
  }, [user, month])

  const loadData = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('performance_bonificacao' as any)
        .select('*')
        .eq('usuario_id', user?.id)
        .eq('mes_referencia', month)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') throw error

      if (data) {
        setCheckedItems(data.itens_marcados || [])
      } else {
        setCheckedItems([])
      }
    } catch (error: any) {
      toast.error('Erro ao carregar dados: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = (id: string, checked: boolean) => {
    if (checked) {
      setCheckedItems((prev) => [...prev, id])
    } else {
      setCheckedItems((prev) => prev.filter((itemId) => itemId !== id))
    }
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      const is100Percent = checkedItems.length === CHECKLIST_ITEMS.length
      const pontuacaoTotal = Math.round((checkedItems.length / CHECKLIST_ITEMS.length) * 100)

      const { data: existing } = await supabase
        .from('performance_bonificacao' as any)
        .select('id')
        .eq('usuario_id', user.id)
        .eq('mes_referencia', month)
        .maybeSingle()

      if (existing) {
        const { error } = await supabase
          .from('performance_bonificacao' as any)
          .update({
            itens_marcados: checkedItems,
            pontuacao_total: pontuacaoTotal,
            atingiu_meta: is100Percent,
            atualizado_em: new Date().toISOString(),
          })
          .eq('id', existing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('performance_bonificacao' as any).insert({
          usuario_id: user.id,
          mes_referencia: month,
          itens_marcados: checkedItems,
          pontuacao_total: pontuacaoTotal,
          atingiu_meta: is100Percent,
        })
        if (error) throw error
      }

      toast.success('Avaliação salva com sucesso!')
    } catch (error: any) {
      toast.error('Erro ao salvar: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const percentComplete = Math.round((checkedItems.length / CHECKLIST_ITEMS.length) * 100)
  const is100Percent = checkedItems.length === CHECKLIST_ITEMS.length

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Award className="h-6 w-6 text-amber-500" />
          Bonificação Feijão com Arroz
        </CardTitle>
        <CardDescription>
          Avalie os {CHECKLIST_ITEMS.length} itens fundamentais de engajamento. Ao atingir 100%,
          você garante o bônus de R$ {BONUS_VALUE.toFixed(2).replace('.', ',')}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-2 max-w-sm">
          <Label className="text-slate-700">Mês de Referência</Label>
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Selecione o mês" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4 bg-slate-50/50 p-6 rounded-xl border border-slate-100">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <span className="bg-amber-100 text-amber-800 text-xs py-0.5 px-2 rounded-full font-bold">
                  {checkedItems.length}/{CHECKLIST_ITEMS.length}
                </span>
                Checklist de Avaliação
              </h3>
              <div className="space-y-2">
                {CHECKLIST_ITEMS.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      'flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 cursor-pointer border border-transparent',
                      checkedItems.includes(item.id)
                        ? 'bg-white shadow-sm border-slate-200'
                        : 'hover:bg-slate-100',
                    )}
                    onClick={() => handleToggle(item.id, !checkedItems.includes(item.id))}
                  >
                    <Checkbox
                      id={`item-${item.id}`}
                      checked={checkedItems.includes(item.id)}
                      onCheckedChange={(checked) => handleToggle(item.id, checked as boolean)}
                      className={cn(
                        'h-5 w-5',
                        checkedItems.includes(item.id)
                          ? 'data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500'
                          : '',
                      )}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Label
                      htmlFor={`item-${item.id}`}
                      className={cn(
                        'text-sm leading-tight cursor-pointer flex-1',
                        checkedItems.includes(item.id)
                          ? 'font-medium text-slate-900'
                          : 'text-slate-600',
                      )}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {item.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <Card
                className={cn(
                  'border-2 transition-all duration-500 shadow-none overflow-hidden',
                  is100Percent
                    ? 'border-emerald-500 bg-emerald-50/50'
                    : 'border-slate-200 bg-white',
                )}
              >
                <div
                  className={cn(
                    'h-1 w-full transition-colors duration-500',
                    is100Percent ? 'bg-emerald-500' : 'bg-slate-200',
                  )}
                />
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-slate-800">Resultado da Avaliação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-slate-500">Progresso Atual</span>
                      <span
                        className={cn(
                          'font-bold transition-colors',
                          is100Percent ? 'text-emerald-600' : 'text-amber-600',
                        )}
                      >
                        {percentComplete}%
                      </span>
                    </div>
                    <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 shadow-inner">
                      <div
                        className={cn(
                          'h-full transition-all duration-700 ease-out',
                          is100Percent ? 'bg-emerald-500' : 'bg-amber-400',
                        )}
                        style={{ width: `${percentComplete}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-4 pt-4 border-t border-slate-100">
                    {is100Percent ? (
                      <>
                        <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                          <CheckCircle2 className="h-7 w-7" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-emerald-800 mb-1">Meta Atingida!</p>
                          <p className="text-2xl font-black text-emerald-600 tracking-tight">
                            R$ {BONUS_VALUE.toFixed(2).replace('.', ',')}
                          </p>
                          <p className="text-xs text-emerald-600/80 mt-1 font-medium">
                            Bônus garantido para o mês.
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                          <XCircle className="h-7 w-7" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700 mb-1">
                            Meta em andamento
                          </p>
                          <p className="text-xs text-slate-500 font-medium">
                            Faltam{' '}
                            <span className="text-amber-600 font-bold">
                              {CHECKLIST_ITEMS.length - checkedItems.length}
                            </span>{' '}
                            itens para atingir 100%.
                          </p>
                          <p className="text-xs text-slate-400 mt-2">
                            Valor do bônus: R$ {BONUS_VALUE.toFixed(2).replace('.', ',')}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={handleSave}
                disabled={loading || saving}
                className="w-full gap-2 bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
                size="lg"
              >
                {saving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Save className="h-5 w-5" />
                )}
                {saving ? 'Salvando...' : 'Salvar Avaliação'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

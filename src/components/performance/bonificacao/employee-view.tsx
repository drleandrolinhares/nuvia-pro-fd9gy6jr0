import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, Award, CheckCircle2 } from 'lucide-react'
import { format, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

function getPastMonths(count = 6) {
  const dates = []
  const now = new Date()
  for (let i = 0; i < count; i++) {
    const d = subMonths(now, i)
    dates.push(format(d, 'yyyy-MM'))
  }
  return dates
}

export function EmployeeBonificacaoView() {
  const { user } = useAuth()
  const pastMonths = getPastMonths()
  const [selectedMonth, setSelectedMonth] = useState(pastMonths[0])

  const [items, setItems] = useState<any[]>([])
  const [checkedItems, setCheckedItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) loadData()
  }, [user, selectedMonth])

  const loadData = async () => {
    setLoading(true)
    const [{ data: iData }, { data: rData }] = await Promise.all([
      supabase
        .from('performance_bonificacao_itens' as any)
        .select('*')
        .eq('ativo', true)
        .order('ordem'),
      supabase
        .from('performance_bonificacao' as any)
        .select('*')
        .eq('usuario_id', user?.id)
        .eq('mes_referencia', selectedMonth)
        .maybeSingle(),
    ])

    if (iData) setItems(iData)
    if (rData) {
      setCheckedItems(rData.itens_marcados || [])
    } else {
      setCheckedItems([])
    }
    setLoading(false)
  }

  const isChecked = (itemId: string, itemIndex: number) => {
    return checkedItems.includes(itemId) || checkedItems.includes(itemIndex as any)
  }

  const percent = items.length > 0 ? Math.round((checkedItems.length / items.length) * 100) : 0
  const isEligible = checkedItems.length >= items.length && items.length > 0

  return (
    <div className="space-y-6 mt-6">
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="w-full sm:w-[250px]">
          <Label className="text-xs text-slate-500 mb-1 block">Mês de Referência</Label>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o mês" />
            </SelectTrigger>
            <SelectContent>
              {pastMonths.map((m) => {
                const [year, month] = m.split('-')
                const date = new Date(parseInt(year), parseInt(month) - 1, 1)
                return (
                  <SelectItem key={m} value={m}>
                    {format(date, 'MMMM / yyyy', { locale: ptBR }).replace(/^\w/, (c) =>
                      c.toUpperCase(),
                    )}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Meu Checklist Feijão com Arroz</CardTitle>
                <CardDescription>
                  Acompanhe sua avaliação de desempenho no mês selecionado.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {items.map((item, index) => {
                    const checked = isChecked(item.id, index)
                    return (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${checked ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-slate-100'}`}
                      >
                        <Checkbox
                          checked={checked}
                          disabled
                          className={
                            checked
                              ? 'data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600'
                              : ''
                          }
                        />
                        <Label
                          className={`flex-1 font-medium ${checked ? 'text-emerald-900' : 'text-slate-700'}`}
                        >
                          {item.descricao}
                        </Label>
                      </div>
                    )
                  })}
                  {items.length === 0 && (
                    <p className="text-slate-500 text-sm py-4">
                      Nenhum item configurado pela gestão.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card
              className={
                isEligible
                  ? 'bg-gradient-to-br from-emerald-50 to-white border-emerald-200'
                  : 'bg-slate-50 border-slate-200'
              }
            >
              <CardContent className="pt-6 text-center">
                <div className="mb-4">
                  <div
                    className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-sm border-4 border-white ${isEligible ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}
                  >
                    <Award className="w-10 h-10" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-slate-800 mb-1">{percent}%</h3>
                <p className="text-slate-500 font-medium mb-6">Pontuação Atingida</p>

                {isEligible ? (
                  <div className="bg-emerald-100 text-emerald-800 p-4 rounded-lg flex flex-col items-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    <p className="font-bold text-lg">Elegível ao Bônus!</p>
                    <p className="text-sm font-medium">Bônus liberado.</p>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 p-4 rounded-lg text-slate-500">
                    <p className="text-sm">Atinga 100% dos itens para liberar a bonificação.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

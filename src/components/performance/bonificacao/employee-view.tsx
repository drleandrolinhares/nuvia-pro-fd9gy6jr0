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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Loader2, Trophy, X, Check, Eye, AlertTriangle } from 'lucide-react'
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

    if (iData) setItems(iData as any)
    if (rData) {
      setCheckedItems((rData as any).itens_marcados || [])
    } else {
      setCheckedItems([])
    }
    setLoading(false)
  }

  const isChecked = (itemId: string, itemIndex: number) => {
    return checkedItems.includes(itemId) || checkedItems.includes(itemIndex as any)
  }

  const isEligible = checkedItems.length === 0 && items.length > 0
  const hasFailed = checkedItems.length > 0

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
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" /> Regras de Desclassificação
                </CardTitle>
                <CardDescription>
                  Se alguma destas ações for registrada contra você, o bônus será cancelado.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {items.map((item, index) => {
                    const checked = isChecked(item.id, index)
                    return (
                      <div
                        key={item.id}
                        className={`flex items-center gap-4 p-4 rounded-xl border transition-colors shadow-sm ${checked ? 'bg-red-50/80 border-red-200' : 'bg-emerald-50/30 border-slate-100'}`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border ${checked ? 'bg-red-500 border-red-600 text-white' : 'bg-emerald-100 border-emerald-200 text-emerald-600'}`}
                        >
                          {checked ? <X className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                          <Label
                            className={`block font-semibold text-base ${checked ? 'text-red-900 line-through opacity-70' : 'text-slate-700'}`}
                          >
                            {item.descricao}
                          </Label>
                          {checked && (
                            <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded mt-1 inline-block">
                              Falha Registrada
                            </span>
                          )}
                        </div>
                        {item.explicacao && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className="text-slate-400 hover:text-amber-500 focus:outline-none flex-shrink-0 bg-white p-2 rounded-full border shadow-sm transition-colors hover:bg-amber-50 hover:border-amber-200">
                                <Eye className="w-4 h-4" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 z-[100] shadow-xl border-slate-200">
                              <div className="space-y-2">
                                <h4 className="font-semibold text-sm text-slate-900 border-b pb-2">
                                  {item.descricao}
                                </h4>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                  {item.explicacao}
                                </p>
                              </div>
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
                    )
                  })}
                  {items.length === 0 && (
                    <p className="text-slate-500 text-sm py-8 text-center bg-slate-50 rounded-lg border border-dashed">
                      Nenhuma regra configurada pela gestão.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card
              className={`overflow-hidden shadow-md ${
                isEligible
                  ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 border-emerald-600 text-white'
                  : hasFailed
                    ? 'bg-red-50 border-red-200'
                    : 'bg-slate-50 border-slate-200'
              }`}
            >
              <CardContent className="pt-8 pb-8 text-center">
                <div className="mb-6 relative">
                  <div
                    className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-lg border-4 ${isEligible ? 'bg-white border-emerald-200 text-emerald-600' : hasFailed ? 'bg-red-100 border-white text-red-500' : 'bg-white border-slate-200 text-slate-300'}`}
                  >
                    {hasFailed ? <X className="w-12 h-12" /> : <Trophy className="w-12 h-12" />}
                  </div>
                  {isEligible && (
                    <div className="absolute top-0 right-1/2 translate-x-12 -translate-y-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow-sm animate-bounce">
                      VITÓRIA
                    </div>
                  )}
                </div>
                <h3
                  className={`text-4xl font-extrabold mb-2 ${isEligible ? 'text-white drop-shadow-sm' : 'text-slate-800'}`}
                >
                  {isEligible ? 'R$ 350,00' : 'R$ 0,00'}
                </h3>
                <p
                  className={`font-medium mb-8 ${isEligible ? 'text-emerald-100' : 'text-slate-500'}`}
                >
                  Bônus Feijão com Arroz
                </p>

                {isEligible ? (
                  <div className="bg-black/20 p-4 rounded-xl backdrop-blur-sm">
                    <p className="font-bold text-lg mb-1">Qualificado! 🚀</p>
                    <p className="text-sm text-emerald-50">
                      Você manteve o padrão este mês e garantiu o seu bônus.
                    </p>
                  </div>
                ) : hasFailed ? (
                  <div className="bg-red-100 text-red-800 p-4 rounded-xl border border-red-200 shadow-inner">
                    <p className="font-bold text-lg mb-1">Eliminado 🚨</p>
                    <p className="text-sm font-medium">
                      Foram registradas falhas contra você que desclassificam o bônus neste mês.
                    </p>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 p-4 rounded-xl text-slate-500">
                    <p className="text-sm font-medium">
                      Mantenha o padrão de qualidade e não acumule falhas para liberar a
                      bonificação.
                    </p>
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

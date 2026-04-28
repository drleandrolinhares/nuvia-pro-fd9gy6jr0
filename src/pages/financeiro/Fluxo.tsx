import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { format, addMonths, subMonths, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Plus, Trash2, Waves } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface Receita {
  id: string
  mes_referencia: string
  ciclo: number
  valor_estimado: number
}

interface Despesa {
  id: string
  data_vencimento: string
  categoria: string
  valor_estimado: number
  descricao: string
}

function getCycleForDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  const day = d.getDate()
  const month = d.getMonth()
  const year = d.getFullYear()

  if (day >= 9 && day <= 15)
    return { cycle: 1, monthStr: `${year}-${String(month + 1).padStart(2, '0')}` }
  if (day >= 16 && day <= 22)
    return { cycle: 2, monthStr: `${year}-${String(month + 1).padStart(2, '0')}` }
  if (day >= 23 && day <= 29)
    return { cycle: 3, monthStr: `${year}-${String(month + 1).padStart(2, '0')}` }
  if (day >= 30) return { cycle: 4, monthStr: `${year}-${String(month + 1).padStart(2, '0')}` }

  const prevMonthDate = new Date(year, month - 1, 1)
  return {
    cycle: 4,
    monthStr: `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`,
  }
}

const CATEGORIAS = [
  'Fornecedores',
  'Impostos',
  'Folha de Pagamento',
  'Marketing',
  'Infraestrutura',
  'Laboratório',
  'Outros',
]

export default function Fluxo() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [receitas, setReceitas] = useState<Receita[]>([])
  const [despesas, setDespesas] = useState<Despesa[]>([])
  const [receitaInputs, setReceitaInputs] = useState<Record<number, string>>({})
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newDespesa, setNewDespesa] = useState({
    data: '',
    categoria: '',
    descricao: '',
    valor: '',
  })

  const { toast } = useToast()
  const monthStr = format(currentMonth, 'yyyy-MM')

  const fetchData = async () => {
    const { data: recData } = await supabase
      .from('fluxo_caixa_receitas')
      .select('*')
      .eq('mes_referencia', monthStr)

    const prevMonth = format(subMonths(currentMonth, 2), 'yyyy-MM-dd')
    const nextMonth = format(addMonths(currentMonth, 2), 'yyyy-MM-dd')

    const { data: despData } = await supabase
      .from('fluxo_caixa_despesas')
      .select('*')
      .gte('data_vencimento', prevMonth)
      .lte('data_vencimento', nextMonth)

    setReceitas(recData || [])
    setDespesas(despData || [])

    const inputs: Record<number, string> = {}
    ;(recData || []).forEach((r) => {
      inputs[r.ciclo] = r.valor_estimado.toString()
    })
    setReceitaInputs(inputs)
  }

  useEffect(() => {
    fetchData()
  }, [monthStr])

  const handleSaveReceita = async (ciclo: number) => {
    const valor = parseFloat(receitaInputs[ciclo] || '0')
    const existing = receitas.find((r) => r.ciclo === ciclo)

    try {
      if (existing) {
        await supabase
          .from('fluxo_caixa_receitas')
          .update({ valor_estimado: valor })
          .eq('id', existing.id)
      } else {
        await supabase
          .from('fluxo_caixa_receitas')
          .insert({ mes_referencia: monthStr, ciclo, valor_estimado: valor })
      }
      toast({ title: 'Receita salva com sucesso!' })
      fetchData()
    } catch (e) {
      toast({ title: 'Erro ao salvar receita', variant: 'destructive' })
    }
  }

  const handleAddDespesa = async () => {
    if (!newDespesa.data || !newDespesa.categoria || !newDespesa.valor) {
      toast({ title: 'Preencha os campos obrigatórios', variant: 'destructive' })
      return
    }

    try {
      await supabase.from('fluxo_caixa_despesas').insert({
        data_vencimento: newDespesa.data,
        categoria: newDespesa.categoria,
        descricao: newDespesa.descricao || newDespesa.categoria,
        valor_estimado: parseFloat(newDespesa.valor),
      })
      toast({ title: 'Despesa adicionada com sucesso!' })
      setIsAddModalOpen(false)
      setNewDespesa({ data: '', categoria: '', descricao: '', valor: '' })
      fetchData()
    } catch (e) {
      toast({ title: 'Erro ao adicionar despesa', variant: 'destructive' })
    }
  }

  const handleDeleteDespesa = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta despesa?')) return
    try {
      await supabase.from('fluxo_caixa_despesas').delete().eq('id', id)
      toast({ title: 'Despesa excluída' })
      fetchData()
    } catch (e) {
      toast({ title: 'Erro ao excluir despesa', variant: 'destructive' })
    }
  }

  const cycles = [1, 2, 3, 4]
  const cycleInfo = {
    1: { boleto: 7, disp: 9, start: 9, end: 15 },
    2: { boleto: 14, disp: 16, start: 16, end: 22 },
    3: { boleto: 21, disp: 23, start: 23, end: 29 },
    4: { boleto: 28, disp: 30, start: 30, end: 8 },
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#C5A059]"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Waves className="h-6 w-6 text-[#C5A059]" />
              Ondas de Liquidez
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              Sincronização de receitas e planejamento de contas a pagar.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950 p-1.5 rounded-lg border border-slate-800 shadow-inner">
            <Button
              variant="ghost"
              size="icon"
              className="text-[#C5A059] hover:bg-[#C5A059]/10 hover:text-[#C5A059]"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="font-medium w-32 text-center text-[#C5A059] capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="text-[#C5A059] hover:bg-[#C5A059]/10 hover:text-[#C5A059]"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {cycles.map((c) => {
          const info = cycleInfo[c as keyof typeof cycleInfo]
          const recVal = receitas.find((r) => r.ciclo === c)?.valor_estimado || 0

          const cycleDespesas = despesas
            .filter((d) => {
              const mapped = getCycleForDate(d.data_vencimento)
              return mapped.cycle === c && mapped.monthStr === monthStr
            })
            .sort(
              (a, b) =>
                new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime(),
            )

          const totalDesp = cycleDespesas.reduce((acc, d) => acc + Number(d.valor_estimado), 0)
          const saldo = recVal - totalDesp
          const capacity = totalDesp > 0 ? (recVal / totalDesp) * 100 : recVal > 0 ? 200 : 0

          let statusColor = 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30'
          let progressColor = 'bg-emerald-500'
          let statusText = 'Saudável'

          if (recVal < totalDesp) {
            statusColor = 'bg-rose-500/20 text-rose-500 border-rose-500/30'
            progressColor = 'bg-rose-500'
            statusText = 'Crítico'
          } else if (recVal < totalDesp * 1.1) {
            statusColor = 'bg-amber-500/20 text-amber-500 border-amber-500/30'
            progressColor = 'bg-amber-500'
            statusText = 'Ajustado'
          }

          return (
            <Card
              key={c}
              className="border-slate-800 bg-slate-900/50 flex flex-col overflow-hidden shadow-lg"
            >
              <CardHeader className="pb-4 border-b border-slate-800 bg-slate-900 relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#C5A059]/20"></div>
                <div className="flex justify-between items-start mb-3">
                  <Badge
                    variant="outline"
                    className="bg-slate-950 border-slate-700 text-[#C5A059] font-semibold"
                  >
                    Ciclo {c}
                  </Badge>
                  <Badge variant="outline" className={statusColor}>
                    {statusText}
                  </Badge>
                </div>
                <CardTitle className="text-lg text-slate-100 flex items-center gap-2">
                  Boletos: Dia {info.boleto}
                </CardTitle>
                <CardDescription className="text-slate-400 mt-1">
                  Disponível ~Dia {info.disp} <br />
                  Cobre despesas de {info.start} a {info.end}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-5 flex-1 flex flex-col gap-6">
                <div className="space-y-2">
                  <Label className="text-xs text-slate-400 font-semibold tracking-wider uppercase">
                    Receita Estimada
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                        R$
                      </span>
                      <Input
                        type="number"
                        value={receitaInputs[c] || ''}
                        onChange={(e) =>
                          setReceitaInputs((prev) => ({ ...prev, [c]: e.target.value }))
                        }
                        className="bg-slate-950 border-slate-700 text-[#C5A059] font-semibold pl-9 placeholder:text-slate-600 focus-visible:ring-[#C5A059]/50 w-full"
                        placeholder="0,00"
                      />
                    </div>
                    <Button
                      className="bg-[#C5A059] hover:bg-[#b08d4d] text-[#001529] font-bold shadow-sm"
                      onClick={() => handleSaveReceita(c)}
                    >
                      Salvar
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Despesas</span>
                    <span className="font-medium text-rose-400">{formatCurrency(totalDesp)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-slate-300">Saldo Projetado</span>
                    <span className={saldo >= 0 ? 'text-emerald-400' : 'text-rose-500'}>
                      {formatCurrency(saldo)}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(capacity, 100)}
                    className={cn('h-2 mt-2', progressColor)}
                  />
                </div>

                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-3">
                    <Label className="text-xs text-slate-400 font-semibold tracking-wider uppercase">
                      Contas a Pagar
                    </Label>
                    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-xs border-[#C5A059]/30 text-[#C5A059] hover:bg-[#C5A059]/10 bg-transparent"
                        >
                          <Plus className="h-3 w-3 mr-1" /> Adicionar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="border-slate-800 bg-slate-900 text-slate-200 sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle className="text-slate-100 flex items-center gap-2">
                            <span className="w-1 h-5 bg-[#C5A059] rounded-full inline-block"></span>
                            Nova Despesa Estimada
                          </DialogTitle>
                        </DialogHeader>{' '}
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label className="text-slate-300">Data de Vencimento</Label>
                            <Input
                              type="date"
                              value={newDespesa.data}
                              onChange={(e) =>
                                setNewDespesa({ ...newDespesa, data: e.target.value })
                              }
                              className="bg-slate-950 border-slate-800 text-slate-200"
                            />
                            <p className="text-[10px] text-slate-500">
                              O sistema alocará automaticamente no ciclo correto.
                            </p>
                          </div>
                          <div className="grid gap-2">
                            <Label className="text-slate-300">Categoria</Label>
                            <Select
                              value={newDespesa.categoria}
                              onValueChange={(v) => setNewDespesa({ ...newDespesa, categoria: v })}
                            >
                              <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-200">
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                              <SelectContent>
                                {CATEGORIAS.map((cat) => (
                                  <SelectItem key={cat} value={cat}>
                                    {cat}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label className="text-slate-300">Descrição (Opcional)</Label>
                            <Input
                              value={newDespesa.descricao}
                              onChange={(e) =>
                                setNewDespesa({ ...newDespesa, descricao: e.target.value })
                              }
                              className="bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-600"
                              placeholder="Ex: Fornecedor X"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label className="text-slate-300">Valor Estimado (R$)</Label>
                            <Input
                              type="number"
                              value={newDespesa.valor}
                              onChange={(e) =>
                                setNewDespesa({ ...newDespesa, valor: e.target.value })
                              }
                              className="bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-600"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            className="border-slate-700 text-slate-300 hover:bg-slate-800"
                            onClick={() => setIsAddModalOpen(false)}
                          >
                            Cancelar
                          </Button>
                          <Button
                            className="bg-[#C5A059] hover:bg-[#b08d4d] text-[#001529] font-bold"
                            onClick={handleAddDespesa}
                          >
                            Salvar Despesa
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="space-y-2 flex-1 overflow-y-auto pr-1 max-h-[250px] scrollbar-thin scrollbar-thumb-slate-800">
                    {cycleDespesas.length === 0 ? (
                      <div className="text-center py-6 text-sm text-slate-500 border border-dashed border-slate-800 rounded-lg">
                        Nenhuma despesa neste ciclo.
                      </div>
                    ) : (
                      cycleDespesas.map((d) => (
                        <div
                          key={d.id}
                          className="flex flex-col bg-slate-800/40 p-3 rounded-lg border border-slate-700/50 group hover:border-slate-600 transition-colors"
                        >
                          {' '}
                          <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-slate-300 truncate max-w-[140px]">
                                {d.descricao}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {format(parseISO(d.data_vencimento), 'dd/MM/yyyy')} • {d.categoria}
                              </span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-sm font-semibold text-rose-400/90">
                                {formatCurrency(d.valor_estimado)}
                              </span>
                              <button
                                onClick={() => handleDeleteDespesa(d.id)}
                                className="text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

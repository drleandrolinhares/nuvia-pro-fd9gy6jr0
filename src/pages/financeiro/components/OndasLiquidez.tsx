import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { format, addMonths, subMonths, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Copy } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { CycleCard } from './CycleCard'

export interface Receita {
  id: string
  mes_referencia: string
  ciclo: number
  valor_estimado: number
}
export interface Despesa {
  id: string
  data_vencimento: string
  categoria: string
  valor_estimado: number
  descricao: string
}

export function getCycleForDate(dateStr: string) {
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
  const p = new Date(year, month - 1, 1)
  return { cycle: 4, monthStr: `${p.getFullYear()}-${String(p.getMonth() + 1).padStart(2, '0')}` }
}

const cycles = [1, 2, 3, 4]
const cycleInfo = {
  1: { boleto: 7, disp: 9, start: 9, end: 15 },
  2: { boleto: 14, disp: 16, start: 16, end: 22 },
  3: { boleto: 21, disp: 23, start: 23, end: 29 },
  4: { boleto: 28, disp: 30, start: 30, end: 8 },
}

export function OndasLiquidez() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [receitas, setReceitas] = useState<Receita[]>([])
  const [despesas, setDespesas] = useState<Despesa[]>([])
  const [receitaInputs, setReceitaInputs] = useState<Record<number, string>>({})
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
    if (existing)
      await supabase
        .from('fluxo_caixa_receitas')
        .update({ valor_estimado: valor })
        .eq('id', existing.id)
    else
      await supabase
        .from('fluxo_caixa_receitas')
        .insert({ mes_referencia: monthStr, ciclo, valor_estimado: valor })
    toast({ title: 'Receita salva com sucesso!' })
    fetchData()
  }

  const handleDeleteDespesa = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta despesa?')) return
    await supabase.from('fluxo_caixa_despesas').delete().eq('id', id)
    toast({ title: 'Despesa excluída' })
    fetchData()
  }

  const handleReplicarMes = async () => {
    if (!confirm('Deseja replicar as informações para o próximo mês?')) return
    const nStr = format(addMonths(currentMonth, 1), 'yyyy-MM')
    const novasReceitas = receitas.map((r) => ({
      mes_referencia: nStr,
      ciclo: r.ciclo,
      valor_estimado: r.valor_estimado,
    }))
    if (novasReceitas.length > 0) await supabase.from('fluxo_caixa_receitas').insert(novasReceitas)
    const novasDespesas = despesas
      .filter((d) => getCycleForDate(d.data_vencimento).monthStr === monthStr)
      .map((d) => ({
        data_vencimento: format(addMonths(parseISO(d.data_vencimento), 1), 'yyyy-MM-dd'),
        categoria: d.categoria,
        descricao: d.descricao,
        valor_estimado: d.valor_estimado,
      }))
    if (novasDespesas.length > 0) await supabase.from('fluxo_caixa_despesas').insert(novasDespesas)
    toast({ title: 'Replicado com sucesso!' })
    fetchData()
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-end items-center gap-4">
        <Button
          variant="outline"
          className="border-[#C5A059]/50 text-[#C5A059] hover:bg-[#C5A059]/10 bg-slate-950 font-semibold"
          onClick={handleReplicarMes}
        >
          <Copy className="h-4 w-4 mr-2" /> Replicar Mês
        </Button>
        <div className="flex items-center gap-4 bg-slate-950 p-1.5 rounded-lg border border-slate-800 shadow-inner w-full sm:w-auto justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="text-[#C5A059] hover:bg-[#C5A059]/10"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft />
          </Button>
          <span className="font-bold w-32 text-center text-slate-100 capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="text-[#C5A059] hover:bg-[#C5A059]/10"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {cycles.map((c) => {
          const cycleDespesas = despesas
            .filter((d) => {
              const mapped = getCycleForDate(d.data_vencimento)
              return mapped.cycle === c && mapped.monthStr === monthStr
            })
            .sort(
              (a, b) =>
                new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime(),
            )

          return (
            <CycleCard
              key={c}
              c={c}
              info={cycleInfo[c as keyof typeof cycleInfo]}
              receitaVal={receitas.find((r) => r.ciclo === c)?.valor_estimado || 0}
              receitaInput={receitaInputs[c]}
              setReceitaInput={(val) => setReceitaInputs((p) => ({ ...p, [c]: val }))}
              handleSaveReceita={() => handleSaveReceita(c)}
              cycleDespesas={cycleDespesas}
              handleDeleteDespesa={handleDeleteDespesa}
              fetchData={fetchData}
            />
          )
        })}
      </div>
    </div>
  )
}

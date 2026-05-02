import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Loader2, Calculator } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

export function FatoresPrecificacao() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [horasTrabalhadas, setHorasTrabalhadas] = useState(0)
  const [custosFixos, setCustosFixos] = useState(0)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [{ data: ocupacao, error: errorOcupacao }, { data: custos, error: errorCustos }] =
        await Promise.all([
          supabase.from('precificacao_ocupacao_cadeiras' as any).select('horas_trabalhadas'),
          supabase.from('precificacao_custos_fixos' as any).select('valor'),
        ])

      if (errorOcupacao) throw errorOcupacao
      if (errorCustos) throw errorCustos

      const totalHoras =
        ocupacao?.reduce((acc, curr) => acc + (Number(curr.horas_trabalhadas) || 0), 0) || 0
      const totalCustos = custos?.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0) || 0

      setHorasTrabalhadas(totalHoras)
      setCustosFixos(totalCustos)
    } catch (err) {
      console.error(err)
      toast({ title: 'Erro ao carregar dados', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const metrics = useMemo(() => {
    const ocupacaoTotal = horasTrabalhadas
    const totalHorasDesconto = ocupacaoTotal * 0.8
    const totalCustoHora = totalHorasDesconto > 0 ? custosFixos / totalHorasDesconto : 0
    const totalCustoHoraFator = totalCustoHora * 1.15
    const totalCustoMinuto = totalCustoHoraFator / 60

    return {
      ocupacaoTotal,
      totalHorasDesconto,
      totalCustoHora,
      totalCustoHoraFator,
      totalCustoMinuto,
    }
  }, [horasTrabalhadas, custosFixos])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-4" />
        <p className="text-slate-400">Carregando fatores de precificação...</p>
      </div>
    )
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Ocupação Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{metrics.ocupacaoTotal}h</div>
            <p className="text-[10px] text-slate-500 mt-1">Horas preenchidas</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total de Horas (-20%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-500">
              {metrics.totalHorasDesconto.toFixed(1)}h
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Ociosidade e faltas</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Custo Hora
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-rose-500">
              {formatCurrency(metrics.totalCustoHora)}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Custo Fixo / Horas (-20%)</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Custo Hora + Avaliação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-500">
              {formatCurrency(metrics.totalCustoHoraFator)}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Custo Hora + 15%</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Custo por Minuto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-500">
              {formatCurrency(metrics.totalCustoMinuto)}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Custo Hora Fator / 60</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="flex items-center gap-4 py-6">
          <div className="p-3 bg-amber-500/10 rounded-lg">
            <Calculator className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h3 className="font-medium text-white text-lg">Como funcionam estes fatores?</h3>
            <p className="text-slate-400 text-sm mt-1 max-w-3xl leading-relaxed">
              Estes são os multiplicadores base usados em sua precificação. Os cálculos utilizam o
              somatório dos seus Custos Fixos mensais e dividem pela capacidade real da sua clínica
              de gerar receita, considerando as faltas e ociosidade da agenda (-20%).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

type OcupacaoData = {
  consultorio: string
  turno: string
  dia_semana: string
  semana?: number
  especialidade: string | null
  dentista: string | null
  horas_trabalhadas: number | null
  capacidade_maxima: number | null
}

const CONSULTORIOS = ['Consultório 1', 'Consultório 2', 'Consultório 3', 'Consultório 4']

export function OcupacaoConsultorios() {
  const { toast } = useToast()
  const [data, setData] = useState<Record<string, OcupacaoData>>({})
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const { data: records, error } = await supabase
        .from('precificacao_ocupacao_cadeiras' as any)
        .select('*')
      if (error) throw error

      const map: Record<string, OcupacaoData> = {}
      records?.forEach((r: any) => {
        map[`${r.consultorio}_${r.turno}_${r.dia_semana}_${r.semana || 1}`] = {
          ...r,
          capacidade_maxima: Number(r.capacidade_maxima) || 0,
        }
      })
      setData(map)
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
    let capTotal = 0
    let horasTotais = 0

    const consultoriosMetrics: Record<string, { cap: number; horas: number }> = {
      'Consultório 1': { cap: 0, horas: 0 },
      'Consultório 2': { cap: 0, horas: 0 },
      'Consultório 3': { cap: 0, horas: 0 },
      'Consultório 4': { cap: 0, horas: 0 },
    }

    const periodosPorDentista: Record<string, number> = {}
    const horasPorDentista: Record<string, number> = {}
    const periodosPorEspecialidade: Record<string, number> = {}
    const horasPorEspecialidade: Record<string, number> = {}

    Object.values(data).forEach((item) => {
      const horas = Number(item.horas_trabalhadas) || 0
      const cap = Number(item.capacidade_maxima) || 0
      const c = item.consultorio

      capTotal += cap
      horasTotais += horas

      if (consultoriosMetrics[c]) {
        consultoriosMetrics[c].cap += cap
        consultoriosMetrics[c].horas += horas
      }

      if (item.dentista && item.especialidade) {
        periodosPorDentista[item.dentista] = (periodosPorDentista[item.dentista] || 0) + 1
        horasPorDentista[item.dentista] = (horasPorDentista[item.dentista] || 0) + horas

        periodosPorEspecialidade[item.especialidade] =
          (periodosPorEspecialidade[item.especialidade] || 0) + 1
        horasPorEspecialidade[item.especialidade] =
          (horasPorEspecialidade[item.especialidade] || 0) + horas
      }
    })

    const ocupacaoPercTotal = capTotal > 0 ? (horasTotais / capTotal) * 100 : 0
    const deficitTotal = capTotal - horasTotais

    const getTop = (record: Record<string, number>) => {
      return Object.entries(record)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
    }

    return {
      capTotal,
      horasTotais,
      ocupacaoPercTotal,
      deficitTotal,
      consultoriosMetrics,
      topDentistasPeriodos: getTop(periodosPorDentista),
      topDentistasHoras: getTop(horasPorDentista),
      topEspecialidadesPeriodos: getTop(periodosPorEspecialidade),
      topEspecialidadesHoras: getTop(horasPorEspecialidade),
    }
  }, [data])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-4" />
        <p className="text-slate-400">Carregando indicadores...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Capacidade Total (Mensal)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{metrics.capTotal}h</div>
            <p className="text-[10px] text-slate-500 mt-1">Máximo de horas disponíveis</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Ocupação Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-500">{metrics.horasTotais}h</div>
            <p className="text-[10px] text-slate-500 mt-1">Total de horas preenchidas</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Ocupação Atual (%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-500">
              {metrics.ocupacaoPercTotal.toFixed(1)}%
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Em relação à capacidade total</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Déficit Operacional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{metrics.deficitTotal}h</div>
            <p className="text-[10px] text-slate-500 mt-1">Horas não utilizadas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {CONSULTORIOS.map((c) => {
          const cMetrics = metrics.consultoriosMetrics[c]
          const perc = cMetrics.cap > 0 ? (cMetrics.horas / cMetrics.cap) * 100 : 0
          const deficit = cMetrics.cap - cMetrics.horas
          return (
            <Card key={c} className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-200 uppercase tracking-wider truncate">
                  {c}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Capacidade</span>
                  <span className="font-bold text-white">{cMetrics.cap}h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Ocupação</span>
                  <span className="font-bold text-amber-500">{cMetrics.horas}h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Déficit</span>
                  <span className="font-bold text-red-500">{deficit}h</span>
                </div>
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Ocupação (%)</span>
                    <span className="font-bold text-emerald-500">{perc.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${Math.min(perc, 100)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-200">
              Ranking por Dentista (Mensal)
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">
                Mais Períodos
              </h4>
              <div className="space-y-2">
                {metrics.topDentistasPeriodos.map(([d, val]) => (
                  <div key={d} className="flex justify-between items-center text-sm">
                    <span className="text-slate-300 truncate pr-2">{d}</span>
                    <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded-md">
                      {val}
                    </span>
                  </div>
                ))}
                {metrics.topDentistasPeriodos.length === 0 && (
                  <p className="text-xs text-slate-600">Sem dados</p>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">
                Mais Horas
              </h4>
              <div className="space-y-2">
                {metrics.topDentistasHoras.map(([d, val]) => (
                  <div key={d} className="flex justify-between items-center text-sm">
                    <span className="text-slate-300 truncate pr-2">{d}</span>
                    <span className="font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">
                      {val}h
                    </span>
                  </div>
                ))}
                {metrics.topDentistasHoras.length === 0 && (
                  <p className="text-xs text-slate-600">Sem dados</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-200">
              Ranking por Especialidade (Mensal)
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">
                Mais Períodos
              </h4>
              <div className="space-y-2">
                {metrics.topEspecialidadesPeriodos.map(([e, val]) => (
                  <div key={e} className="flex justify-between items-center text-sm">
                    <span className="text-slate-300 truncate pr-2">{e}</span>
                    <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded-md">
                      {val}
                    </span>
                  </div>
                ))}
                {metrics.topEspecialidadesPeriodos.length === 0 && (
                  <p className="text-xs text-slate-600">Sem dados</p>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">
                Mais Horas
              </h4>
              <div className="space-y-2">
                {metrics.topEspecialidadesHoras.map(([e, val]) => (
                  <div key={e} className="flex justify-between items-center text-sm">
                    <span className="text-slate-300 truncate pr-2">{e}</span>
                    <span className="font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">
                      {val}h
                    </span>
                  </div>
                ))}
                {metrics.topEspecialidadesHoras.length === 0 && (
                  <p className="text-xs text-slate-600">Sem dados</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

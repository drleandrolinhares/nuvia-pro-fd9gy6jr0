import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, CheckSquare } from 'lucide-react'

export default function Onboarding() {
  const { user } = useAuth()
  const [etapas, setEtapas] = useState<any[]>([])
  const [tarefas, setTarefas] = useState<any[]>([])
  const [progresso, setProgresso] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    if (!user) return
    const [resEtapas, resTarefas, resProgresso] = await Promise.all([
      supabase.from('intranet_onboarding_etapas').select('*').order('dia').order('ordem'),
      supabase.from('intranet_onboarding_tarefas').select('*').order('ordem'),
      supabase.from('intranet_onboarding_progresso').select('*').eq('usuario_id', user.id),
    ])
    setEtapas(resEtapas.data || [])
    setTarefas(resTarefas.data || [])
    setProgresso(resProgresso.data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [user])

  const toggleTarefa = async (tarefaId: string, concluido: boolean) => {
    if (!user) return
    const prev = progresso.find((p) => p.tarefa_id === tarefaId)
    if (prev) {
      await supabase.from('intranet_onboarding_progresso').update({ concluido }).eq('id', prev.id)
    } else {
      await supabase
        .from('intranet_onboarding_progresso')
        .insert({ usuario_id: user.id, tarefa_id: tarefaId, concluido })
    }
    fetchData()
  }

  if (loading)
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-amber-500" />
      </div>
    )

  const totalTarefas = tarefas.length
  const concluidas = progresso.filter((p) => p.concluido).length
  const percentual = totalTarefas > 0 ? Math.round((concluidas / totalTarefas) * 100) : 0

  return (
    <div className="flex flex-col gap-6 p-6 w-full mx-auto animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-slate-50 p-6 rounded-xl shadow-lg border-l-4 border-amber-500 relative">
        <div className="flex items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3 uppercase">
              <CheckSquare className="h-8 w-8 text-amber-500" />
              Onboarding
            </h1>
            <p className="text-slate-300 text-sm font-medium tracking-wide mt-1">
              Acompanhe as etapas de integração do seu início na Nuvia.
            </p>
          </div>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle>Meu Progresso</CardTitle>
          <CardDescription>
            {concluidas} de {totalTarefas} tarefas concluídas ({percentual}%)
          </CardDescription>
          <Progress value={percentual} className="h-3 mt-2" />
        </CardHeader>
      </Card>

      <div className="space-y-6">
        {etapas.map((etapa) => {
          const etapaTarefas = tarefas.filter((t) => t.etapa_id === etapa.id)
          const etapaConcluidas = etapaTarefas.filter((t) =>
            progresso.some((p) => p.tarefa_id === t.id && p.concluido),
          ).length
          const etapaPercent =
            etapaTarefas.length > 0 ? Math.round((etapaConcluidas / etapaTarefas.length) * 100) : 0

          return (
            <Card key={etapa.id} className="bg-slate-900 border-slate-800 shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-800">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg text-amber-500">
                      Dia {etapa.dia} - {etapa.titulo}
                    </CardTitle>
                    <CardDescription className="text-slate-400 mt-1">
                      {etapa.descricao}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-300 bg-slate-800 px-3 py-1 rounded-full">
                      {etapaPercent}% concluído
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-5 space-y-5">
                {etapaTarefas.map((tarefa) => {
                  const isDone = progresso.some((p) => p.tarefa_id === tarefa.id && p.concluido)
                  return (
                    <div
                      key={tarefa.id}
                      className="flex items-start space-x-3 bg-slate-950/40 p-3 rounded-lg border border-slate-800/60"
                    >
                      <Checkbox
                        id={tarefa.id}
                        checked={isDone}
                        onCheckedChange={(c) => toggleTarefa(tarefa.id, c === true)}
                        className="mt-1"
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor={tarefa.id}
                          className={`text-sm font-semibold cursor-pointer ${isDone ? 'text-slate-500 line-through' : 'text-slate-200'}`}
                        >
                          {tarefa.titulo}
                        </label>
                        {tarefa.descricao && (
                          <p className={`text-sm ${isDone ? 'text-slate-600' : 'text-slate-400'}`}>
                            {tarefa.descricao}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
                {etapaTarefas.length === 0 && (
                  <p className="text-sm text-slate-500">Nenhuma tarefa cadastrada nesta etapa.</p>
                )}
              </CardContent>
            </Card>
          )
        })}
        {etapas.length === 0 && (
          <div className="text-center py-12 text-slate-500 bg-slate-900/50 rounded-lg border border-slate-800 border-dashed">
            Nenhuma etapa de onboarding configurada no sistema.
          </div>
        )}
      </div>
    </div>
  )
}

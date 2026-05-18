import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Loader2, PlayCircle, CheckCircle2, XCircle, ArrowLeft, GraduationCap } from 'lucide-react'
import { toast } from 'sonner'

export default function Treinamentos() {
  const { user } = useAuth()
  const [cursos, setCursos] = useState<any[]>([])
  const [modulos, setModulos] = useState<any[]>([])
  const [progresso, setProgresso] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeModulo, setActiveModulo] = useState<any | null>(null)
  const [respostas, setRespostas] = useState<Record<number, number>>({})

  const fetchData = async () => {
    if (!user) return
    const [c, m, p] = await Promise.all([
      supabase.from('intranet_treinamentos_cursos').select('*').order('ordem'),
      supabase.from('intranet_treinamentos_modulos').select('*').order('ordem'),
      supabase.from('intranet_treinamentos_progresso').select('*').eq('usuario_id', user.id),
    ])
    setCursos(c.data || [])
    setModulos(m.data || [])
    setProgresso(p.data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [user])

  const submitQuiz = async () => {
    if (!activeModulo || !user) return
    const quiz = activeModulo.quiz_json || []
    let acertos = 0
    quiz.forEach((q: any, i: number) => {
      if (respostas[i] === q.correta) acertos++
    })
    const nota = Math.round((acertos / quiz.length) * 10)
    const aprovado = nota >= (activeModulo.nota_minima || 7)

    const prev = progresso.find((p) => p.modulo_id === activeModulo.id)
    if (prev) {
      await supabase
        .from('intranet_treinamentos_progresso')
        .update({ nota_quiz: nota, aprovado, tentativas: prev.tentativas + 1, video_visto: true })
        .eq('id', prev.id)
    } else {
      await supabase.from('intranet_treinamentos_progresso').insert({
        usuario_id: user.id,
        modulo_id: activeModulo.id,
        nota_quiz: nota,
        aprovado,
        tentativas: 1,
        video_visto: true,
      })
    }

    if (aprovado) toast.success(`Parabéns! Você foi aprovado com nota ${nota}.`)
    else
      toast.error(
        `Nota ${nota}. Você não atingiu o mínimo de ${activeModulo.nota_minima}. Revise o conteúdo e tente novamente.`,
      )

    setRespostas({})
    setActiveModulo(null)
    fetchData()
  }

  if (loading)
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-amber-500" />
      </div>
    )

  if (activeModulo) {
    const quiz = activeModulo.quiz_json || []
    return (
      <div className="flex flex-col gap-6 p-6 w-full mx-auto animate-fade-in-up">
        <Button variant="outline" className="gap-2 w-max" onClick={() => setActiveModulo(null)}>
          <ArrowLeft className="w-4 h-4" /> Voltar aos Cursos
        </Button>
        <Card className="bg-slate-900 border-slate-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-amber-500 text-2xl">{activeModulo.titulo}</CardTitle>
            <CardDescription className="text-slate-400 text-base">
              {activeModulo.descricao}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="aspect-video bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
              {activeModulo.video_url ? (
                <iframe
                  src={activeModulo.video_url.replace('watch?v=', 'embed/')}
                  className="w-full h-full"
                  allowFullScreen
                />
              ) : (
                <span className="text-slate-500">Vídeo não configurado</span>
              )}
            </div>

            {quiz.length > 0 && (
              <div className="space-y-6 pt-6 border-t border-slate-800">
                <h3 className="text-xl font-semibold text-slate-100">
                  Quiz de Avaliação (Nota Mínima: {activeModulo.nota_minima})
                </h3>
                {quiz.map((q: any, i: number) => (
                  <div
                    key={i}
                    className="space-y-4 bg-slate-950/50 p-4 rounded-lg border border-slate-800"
                  >
                    <p className="text-slate-200 font-medium">
                      {i + 1}. {q.pergunta}
                    </p>
                    <RadioGroup
                      onValueChange={(val) => setRespostas((r) => ({ ...r, [i]: parseInt(val) }))}
                      value={respostas[i]?.toString()}
                      className="space-y-3"
                    >
                      {q.opcoes.map((op: string, j: number) => (
                        <div
                          key={j}
                          className="flex items-center space-x-3 bg-slate-900 px-4 py-2 rounded-md border border-slate-800/60"
                        >
                          <RadioGroupItem
                            value={j.toString()}
                            id={`q${i}-op${j}`}
                            className="border-slate-500 text-amber-500"
                          />
                          <Label
                            htmlFor={`q${i}-op${j}`}
                            className="text-slate-300 font-normal cursor-pointer w-full"
                          >
                            {op}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ))}
                <div className="flex justify-end pt-4">
                  <Button
                    onClick={submitQuiz}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-8"
                    disabled={Object.keys(respostas).length < quiz.length}
                  >
                    Finalizar Avaliação
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6 w-full mx-auto animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-slate-50 p-6 rounded-xl shadow-lg border-l-4 border-amber-500 relative">
        <div className="flex items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3 uppercase">
              <GraduationCap className="h-8 w-8 text-amber-500" />
              Treinamentos
            </h1>
            <p className="text-slate-300 text-sm font-medium tracking-wide mt-1">
              Acesse os cursos e capacitações disponíveis para o seu setor.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {cursos.map((curso) => {
          const modulosCurso = modulos.filter((m) => m.curso_id === curso.id)
          return (
            <Card key={curso.id} className="bg-slate-900 border-slate-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-slate-100">{curso.titulo}</CardTitle>
                <CardDescription className="text-slate-400">{curso.descricao}</CardDescription>
                {curso.setor && (
                  <span className="inline-block px-3 py-1 text-xs font-semibold bg-amber-500/10 text-amber-500 rounded-full mt-2 max-w-max border border-amber-500/20">
                    {curso.setor}
                  </span>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {modulosCurso.map((modulo) => {
                  const p = progresso.find((pr) => pr.modulo_id === modulo.id)
                  return (
                    <div
                      key={modulo.id}
                      className="flex items-center justify-between p-4 bg-slate-950/50 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-amber-500">
                          <PlayCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-200">{modulo.titulo}</h4>
                          {p && (
                            <p
                              className={`text-xs mt-1 font-medium ${p.aprovado ? 'text-emerald-500' : 'text-rose-500'}`}
                            >
                              Última nota: {p.nota_quiz}{' '}
                              {p.aprovado ? '(Aprovado)' : '(Reprovado - Requer Revisão)'}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {p?.aprovado ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        ) : p ? (
                          <XCircle className="w-6 h-6 text-rose-500" />
                        ) : null}
                        <Button
                          variant={p?.aprovado ? 'outline' : 'default'}
                          size="sm"
                          onClick={() => setActiveModulo(modulo)}
                          className={
                            !p?.aprovado ? 'bg-amber-500 hover:bg-amber-600 text-slate-950' : ''
                          }
                        >
                          {p?.aprovado ? 'Revisar Conteúdo' : 'Acessar Módulo'}
                        </Button>
                      </div>
                    </div>
                  )
                })}
                {modulosCurso.length === 0 && (
                  <p className="text-sm text-slate-500">Nenhum módulo cadastrado neste curso.</p>
                )}
              </CardContent>
            </Card>
          )
        })}
        {cursos.length === 0 && (
          <div className="text-center py-12 text-slate-500 bg-slate-900/50 rounded-lg border border-slate-800 border-dashed">
            Nenhum curso disponível no momento.
          </div>
        )}
      </div>
    </div>
  )
}

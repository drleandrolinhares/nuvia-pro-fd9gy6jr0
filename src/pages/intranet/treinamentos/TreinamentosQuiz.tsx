import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export function TreinamentosQuiz({ modulo, progressoAtual, onBack, onComplete }: any) {
  const { user } = useAuth()
  const [respostas, setRespostas] = useState<Record<number, number>>({})

  const submitQuiz = async () => {
    if (!user) return
    const quiz = modulo.quiz_json || []
    let acertos = 0
    quiz.forEach((q: any, i: number) => {
      if (respostas[i] === q.correta) acertos++
    })
    const nota = quiz.length > 0 ? Math.round((acertos / quiz.length) * 10) : 10
    const aprovado = nota >= (modulo.nota_minima || 7)

    let pontos_ganhos = 0
    const tentativasAtuais = progressoAtual ? progressoAtual.tentativas : 0
    const novaTentativa = tentativasAtuais + 1

    if (aprovado && (!progressoAtual || !progressoAtual.aprovado)) {
      if (novaTentativa === 1) pontos_ganhos = 15
      else if (novaTentativa === 2) pontos_ganhos = 10
      else pontos_ganhos = 8
    } else if (progressoAtual && progressoAtual.aprovado) {
      pontos_ganhos = progressoAtual.pontos || 0
    }

    if (progressoAtual) {
      await supabase
        .from('intranet_treinamentos_progresso')
        .update({
          nota_quiz: nota,
          aprovado,
          tentativas: novaTentativa,
          video_visto: true,
          pontos: pontos_ganhos,
        })
        .eq('id', progressoAtual.id)
    } else {
      await supabase.from('intranet_treinamentos_progresso').insert({
        usuario_id: user.id,
        modulo_id: modulo.id,
        nota_quiz: nota,
        aprovado,
        tentativas: novaTentativa,
        video_visto: true,
        pontos: pontos_ganhos,
      })
    }

    if (aprovado) {
      toast.success(`Parabéns! Você foi aprovado com nota ${nota}. Ganhou ${pontos_ganhos} pontos!`)
    } else {
      toast.error(`Nota ${nota}. Mínimo exigido: ${modulo.nota_minima || 7}. Revise o conteúdo!`)
    }

    onComplete()
  }

  const quiz = modulo.quiz_json || []

  return (
    <div className="flex flex-col gap-6 p-6 w-full mx-auto animate-fade-in-up">
      <Button
        variant="outline"
        className="gap-2 w-max border-slate-700 bg-slate-900 hover:bg-slate-800 text-white"
        onClick={onBack}
      >
        <ArrowLeft className="w-4 h-4" /> Voltar aos Cursos
      </Button>
      <Card className="bg-slate-900 border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-amber-500 text-2xl">{modulo.titulo}</CardTitle>
          <CardDescription className="text-slate-400 text-base">{modulo.descricao}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="aspect-video bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
            {modulo.video_url ? (
              <iframe
                src={modulo.video_url
                  .replace('watch?v=', 'embed/')
                  .replace('youtu.be/', 'youtube.com/embed/')}
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
                Quiz de Avaliação (Nota Mínima: {modulo.nota_minima || 7})
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
                        className="flex items-center space-x-3 bg-slate-900 px-4 py-2 rounded-md border border-slate-800/60 hover:border-amber-500/50 transition-colors"
                      >
                        <RadioGroupItem
                          value={j.toString()}
                          id={`q${i}-op${j}`}
                          className="border-slate-500 text-amber-500"
                        />
                        <Label
                          htmlFor={`q${i}-op${j}`}
                          className="text-slate-300 font-normal cursor-pointer w-full py-1"
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
          {quiz.length === 0 && (
            <div className="flex justify-end pt-4 border-t border-slate-800">
              <Button
                onClick={submitQuiz}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-8 mt-6"
              >
                Marcar como Concluído
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

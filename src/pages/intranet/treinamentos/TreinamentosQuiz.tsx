import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { ArrowLeft, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

export function TreinamentosQuiz({ modulo, progressoAtual, onBack, onComplete }: any) {
  const { user } = useAuth()
  const [step, setStep] = useState<'content' | 'quiz'>('content')
  const [answers, setAnswers] = useState<number[]>([])
  const [submitting, setSubmitting] = useState(false)
  const quiz = modulo.quiz_json || []

  const handleContentComplete = () => {
    if (quiz.length > 0) {
      setStep('quiz')
      setAnswers(new Array(quiz.length).fill(-1))
    } else {
      submitResult(10, true)
    }
  }

  const submitResult = async (nota: number, aprovado: boolean) => {
    if (!user) return
    setSubmitting(true)
    try {
      const payload = {
        usuario_id: user.id,
        modulo_id: modulo.id,
        video_visto: true,
        nota_quiz: nota,
        aprovado,
        tentativas: (progressoAtual?.tentativas || 0) + 1,
        pontos: aprovado ? 50 : 0,
      }

      if (progressoAtual?.id) {
        await supabase
          .from('intranet_treinamentos_progresso')
          .update(payload)
          .eq('id', progressoAtual.id)
      } else {
        await supabase.from('intranet_treinamentos_progresso').insert([payload])
      }

      if (aprovado) {
        toast.success('Parabéns! Você concluiu este módulo.')
      } else {
        toast.error(
          `Você atingiu a nota ${nota}. A nota mínima é ${modulo.nota_minima || 7}. Tente novamente.`,
        )
      }
      onComplete()
    } catch (error) {
      toast.error('Erro ao salvar progresso')
    } finally {
      setSubmitting(false)
    }
  }

  const calculateScore = () => {
    if (answers.includes(-1)) {
      toast.error('Por favor, responda todas as questões.')
      return
    }

    let correct = 0
    quiz.forEach((q: any, i: number) => {
      if (answers[i] === q.correctIndex) correct++
    })
    const nota = (correct / quiz.length) * 10
    const aprovado = nota >= (modulo.nota_minima || 7)
    submitResult(nota, aprovado)
  }

  const setAnswer = (qIndex: number, aIndex: number) => {
    const newAnswers = [...answers]
    newAnswers[qIndex] = aIndex
    setAnswers(newAnswers)
  }

  const isPdf = !!modulo.arquivo_url
  const hasVideo = !!modulo.video_url

  const getEmbedUrl = (url: string) => {
    if (!url) return ''
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/')
    }
    if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'youtube.com/embed/')
    }
    return url
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in w-full max-w-5xl mx-auto">
      <Button variant="ghost" onClick={onBack} className="w-fit text-slate-400 hover:text-white">
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar aos Treinamentos
      </Button>

      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">{modulo.titulo}</h2>
          <p className="text-slate-400">{modulo.descricao}</p>
        </div>

        {step === 'content' && (
          <div className="space-y-6">
            {isPdf ? (
              <div className="w-full h-[70vh] bg-slate-950 rounded-lg overflow-hidden border border-slate-800 relative shadow-inner">
                <iframe
                  src={`${modulo.arquivo_url}#toolbar=0`}
                  className="w-full h-full border-0"
                  title="Visualizador de PDF"
                />
              </div>
            ) : hasVideo ? (
              <div className="w-full aspect-video bg-slate-950 rounded-lg overflow-hidden border border-slate-800 shadow-inner">
                <iframe
                  src={getEmbedUrl(modulo.video_url)}
                  className="w-full h-full border-0"
                  allowFullScreen
                  title="Video Player"
                />
              </div>
            ) : (
              <div className="w-full aspect-video bg-slate-950/50 rounded-lg border border-slate-800 border-dashed flex flex-col items-center justify-center text-slate-500">
                <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                <p>Nenhum conteúdo disponível para este módulo.</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-6 border-t border-slate-800">
              <div className="text-sm text-slate-400">
                {progressoAtual?.aprovado && (
                  <span className="flex items-center text-emerald-500 font-medium">
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Você já foi aprovado neste módulo
                  </span>
                )}
              </div>
              <Button
                onClick={handleContentComplete}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold px-6"
              >
                {quiz.length > 0 ? 'Ir para a Avaliação' : 'Concluir Módulo'}{' '}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {step === 'quiz' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-xl font-bold text-slate-100">Avaliação do Módulo</h3>
              <div className="text-sm bg-slate-950 px-4 py-1.5 rounded-full border border-slate-800 text-slate-300 shadow-inner">
                Nota Mínima:{' '}
                <span className="text-amber-500 font-bold ml-1">{modulo.nota_minima || 7}</span>
              </div>
            </div>

            <div className="space-y-6">
              {quiz.map((q: any, qIndex: number) => (
                <div key={qIndex} className="p-6 bg-slate-950 rounded-xl border border-slate-800">
                  <h4 className="text-lg font-medium text-slate-50 mb-4">
                    {qIndex + 1}. {q.question}
                  </h4>
                  <RadioGroup
                    value={answers[qIndex]?.toString()}
                    onValueChange={(val) => setAnswer(qIndex, parseInt(val))}
                    className="space-y-3"
                  >
                    {q.options.map((opt: string, optIndex: number) => (
                      <div
                        key={optIndex}
                        className="flex items-center space-x-3 bg-slate-900 p-4 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
                        onClick={() => setAnswer(qIndex, optIndex)}
                      >
                        <RadioGroupItem
                          value={optIndex.toString()}
                          id={`q${qIndex}-opt${optIndex}`}
                          className="border-slate-600 text-amber-500"
                        />
                        <Label
                          htmlFor={`q${qIndex}-opt${optIndex}`}
                          className="text-slate-300 cursor-pointer flex-1 text-base leading-snug"
                        >
                          {opt}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-6 border-t border-slate-800">
              <Button
                variant="outline"
                onClick={() => setStep('content')}
                className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Revisar Conteúdo
              </Button>
              <Button
                onClick={calculateScore}
                disabled={submitting}
                className="bg-amber-500 hover:bg-amber-600 text-black px-8 font-semibold"
              >
                {submitting ? 'Enviando...' : 'Finalizar Avaliação'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

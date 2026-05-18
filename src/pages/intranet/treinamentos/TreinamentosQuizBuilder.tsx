import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export function TreinamentosQuizBuilder({ modulo, cursos, onSave, onCancel }: any) {
  const [formData, setFormData] = useState({
    curso_id: modulo.curso_id || '',
    titulo: modulo.titulo || '',
    descricao: modulo.descricao || '',
    video_url: modulo.video_url || '',
    nota_minima: modulo.nota_minima || 7,
  })

  const [quiz, setQuiz] = useState<any[]>(modulo.quiz_json || [])

  const addPergunta = () => {
    setQuiz([...quiz, { pergunta: '', opcoes: ['', ''], correta: 0 }])
  }

  const handleSave = async () => {
    if (!formData.curso_id) return toast.error('Selecione um curso')
    if (!formData.titulo) return toast.error('O título é obrigatório')

    const payload = {
      ...formData,
      quiz_json: quiz,
    }

    if (modulo.id) {
      await supabase.from('intranet_treinamentos_modulos').update(payload).eq('id', modulo.id)
      toast.success('Módulo atualizado')
    } else {
      await supabase.from('intranet_treinamentos_modulos').insert([payload])
      toast.success('Módulo criado')
    }
    onSave()
  }

  return (
    <div className="space-y-6 bg-slate-950 p-4 rounded-lg border border-slate-800 h-max max-h-[800px] overflow-y-auto">
      <div className="space-y-4">
        <h4 className="font-semibold text-slate-200">Detalhes do Módulo</h4>
        <div className="space-y-2">
          <Label>Curso</Label>
          <Select
            value={formData.curso_id}
            onValueChange={(v) => setFormData({ ...formData, curso_id: v })}
          >
            <SelectTrigger className="bg-slate-900 border-slate-700">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              {cursos.map((c: any) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.titulo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Título</Label>
          <Input
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            className="bg-slate-900 border-slate-700"
          />
        </div>
        <div className="space-y-2">
          <Label>Descrição</Label>
          <Textarea
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            className="bg-slate-900 border-slate-700"
          />
        </div>
        <div className="space-y-2">
          <Label>Link do Vídeo (YouTube)</Label>
          <Input
            value={formData.video_url}
            onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
            placeholder="https://youtube.com/..."
            className="bg-slate-900 border-slate-700"
          />
        </div>
        <div className="space-y-2">
          <Label>Nota Mínima (0 a 10)</Label>
          <Input
            type="number"
            min={0}
            max={10}
            value={formData.nota_minima}
            onChange={(e) => setFormData({ ...formData, nota_minima: parseInt(e.target.value) })}
            className="bg-slate-900 border-slate-700"
          />
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-slate-200">Editor de Quiz</h4>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={addPergunta}
            className="border-slate-700 bg-slate-900 hover:bg-slate-800 text-white"
          >
            <Plus className="w-4 h-4 mr-1" /> Pergunta
          </Button>
        </div>

        {quiz.map((q, qIdx) => (
          <div
            key={qIdx}
            className="p-4 bg-slate-900 rounded-lg border border-slate-700 space-y-4 relative"
          >
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2 text-rose-500 hover:text-rose-400 hover:bg-slate-800"
              onClick={() => setQuiz(quiz.filter((_, i) => i !== qIdx))}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <div className="space-y-2 pr-8">
              <Label>Pergunta {qIdx + 1}</Label>
              <Input
                value={q.pergunta}
                onChange={(e) => {
                  const n = [...quiz]
                  n[qIdx].pergunta = e.target.value
                  setQuiz(n)
                }}
                className="bg-slate-950 border-slate-800"
              />
            </div>

            <div className="space-y-2">
              <Label>Opções (Marque a correta)</Label>
              <RadioGroup
                value={q.correta.toString()}
                onValueChange={(v) => {
                  const n = [...quiz]
                  n[qIdx].correta = parseInt(v)
                  setQuiz(n)
                }}
              >
                {q.opcoes.map((op: string, oIdx: number) => (
                  <div key={oIdx} className="flex items-center gap-3">
                    <RadioGroupItem
                      value={oIdx.toString()}
                      id={`q${qIdx}o${oIdx}`}
                      className="border-slate-500 text-amber-500"
                    />
                    <Input
                      value={op}
                      onChange={(e) => {
                        const n = [...quiz]
                        n[qIdx].opcoes[oIdx] = e.target.value
                        setQuiz(n)
                      }}
                      className="bg-slate-950 border-slate-800 flex-1"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="text-slate-500 hover:text-rose-500 hover:bg-slate-800"
                      onClick={() => {
                        const n = [...quiz]
                        n[qIdx].opcoes = n[qIdx].opcoes.filter((_: any, i: number) => i !== oIdx)
                        setQuiz(n)
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </RadioGroup>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-amber-500 mt-2 hover:bg-amber-500/10 hover:text-amber-400"
                onClick={() => {
                  const n = [...quiz]
                  n[qIdx].opcoes.push('')
                  setQuiz(n)
                }}
              >
                + Adicionar Opção
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
        <Button
          variant="outline"
          onClick={onCancel}
          className="border-slate-700 bg-slate-900 text-white hover:bg-slate-800"
        >
          Cancelar
        </Button>
        <Button onClick={handleSave} className="bg-amber-500 hover:bg-amber-600 text-black">
          Salvar Módulo
        </Button>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Plus, Trash2, Video, FileText, ArrowLeft } from 'lucide-react'

export function TreinamentosQuizBuilder({ modulo, cursos, onSave, onCancel }: any) {
  const [titulo, setTitulo] = useState(modulo?.titulo || '')
  const [descricao, setDescricao] = useState(modulo?.descricao || '')
  const [cursoId, setCursoId] = useState(modulo?.curso_id || '')
  const [notaMinima, setNotaMinima] = useState(modulo?.nota_minima ?? 7)

  // Safely parse quiz JSON
  const initialQuiz = (() => {
    let parsed: any[] = []
    if (Array.isArray(modulo?.quiz_json)) {
      parsed = modulo.quiz_json
    } else if (typeof modulo?.quiz_json === 'string') {
      try {
        const p = JSON.parse(modulo.quiz_json)
        if (Array.isArray(p)) parsed = p
      } catch (e) {
        // ignore
      }
    }
    return parsed.map((q) => ({
      question: q?.question || '',
      options: Array.isArray(q?.options) ? q.options : ['', '', '', ''],
      correctIndex: typeof q?.correctIndex === 'number' ? q.correctIndex : 0,
    }))
  })()

  const [quiz, setQuiz] = useState<any[]>(initialQuiz)

  const [tipoConteudo, setTipoConteudo] = useState<'video' | 'pdf'>(
    modulo?.arquivo_url ? 'pdf' : 'video',
  )
  const [videoUrl, setVideoUrl] = useState(modulo?.video_url || '')
  const [arquivoUrl, setArquivoUrl] = useState(modulo?.arquivo_url || '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      toast.error('Apenas arquivos PDF são permitidos.')
      return
    }

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
      const filePath = `pdfs/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('treinamentos')
        .upload(filePath, file)
      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('treinamentos').getPublicUrl(filePath)
      setArquivoUrl(publicUrl)
      toast.success('Arquivo PDF enviado com sucesso!')
    } catch (error: any) {
      toast.error(`Erro ao enviar arquivo: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!titulo || !cursoId) {
      toast.error('Título e Curso são obrigatórios')
      return
    }

    setSaving(true)
    try {
      const payload = {
        titulo,
        descricao,
        curso_id: cursoId,
        video_url: tipoConteudo === 'video' ? videoUrl : null,
        arquivo_url: tipoConteudo === 'pdf' ? arquivoUrl : null,
        nota_minima: notaMinima,
        quiz_json: quiz,
        ordem: modulo?.ordem || 0,
      }

      if (modulo?.id) {
        await supabase.from('intranet_treinamentos_modulos').update(payload).eq('id', modulo.id)
        toast.success('Módulo atualizado com sucesso!')
      } else {
        await supabase.from('intranet_treinamentos_modulos').insert([payload])
        toast.success('Módulo criado com sucesso!')
      }
      onSave()
    } catch (error: any) {
      toast.error(`Erro ao salvar: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const addQuestion = () =>
    setQuiz([...quiz, { question: '', options: ['', '', '', ''], correctIndex: 0 }])
  const updateQuestion = (i: number, field: string, value: any) => {
    const newQuiz = [...quiz]
    newQuiz[i] = { ...newQuiz[i], [field]: value }
    setQuiz(newQuiz)
  }
  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    const newQuiz = [...quiz]
    newQuiz[qIndex].options[optIndex] = value
    setQuiz(newQuiz)
  }
  const removeQuestion = (i: number) => setQuiz(quiz.filter((_, idx) => idx !== i))

  return (
    <form
      onSubmit={handleSave}
      className="space-y-6 bg-slate-950 p-6 rounded-xl border border-slate-800"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-50">
          {modulo?.id ? 'Editar Módulo' : 'Novo Módulo'}
        </h3>
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-slate-300">Título</Label>
          <Input
            required
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="bg-slate-900 border-slate-700 text-white"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-300">Curso</Label>
          <Select value={cursoId || undefined} onValueChange={setCursoId}>
            <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
              <SelectValue placeholder="Selecione um curso" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-white">
              {cursos?.map((c: any) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.titulo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-slate-300">Descrição</Label>
        <Textarea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="bg-slate-900 border-slate-700 text-white"
        />
      </div>

      <div className="bg-slate-900 p-5 rounded-lg border border-slate-800 space-y-5">
        <Label className="text-base text-white font-semibold">Conteúdo do Módulo</Label>
        <div className="flex gap-4">
          <Button
            type="button"
            variant={tipoConteudo === 'video' ? 'default' : 'outline'}
            onClick={() => setTipoConteudo('video')}
            className={
              tipoConteudo === 'video'
                ? 'bg-amber-500 hover:bg-amber-600 text-black'
                : 'text-slate-300 border-slate-700 hover:bg-slate-800'
            }
          >
            <Video className="w-4 h-4 mr-2" /> URL de Vídeo
          </Button>
          <Button
            type="button"
            variant={tipoConteudo === 'pdf' ? 'default' : 'outline'}
            onClick={() => setTipoConteudo('pdf')}
            className={
              tipoConteudo === 'pdf'
                ? 'bg-amber-500 hover:bg-amber-600 text-black'
                : 'text-slate-300 border-slate-700 hover:bg-slate-800'
            }
          >
            <FileText className="w-4 h-4 mr-2" /> Arquivo PDF
          </Button>
        </div>

        {tipoConteudo === 'video' ? (
          <div className="space-y-2">
            <Label className="text-slate-300">URL do Vídeo (Youtube, Vimeo, etc)</Label>
            <Input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://..."
              className="bg-slate-950 border-slate-700 text-white"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <Label className="text-slate-300">Arquivo PDF</Label>
            {arquivoUrl ? (
              <div className="flex items-center gap-4 bg-slate-950 p-3 rounded-lg border border-slate-700">
                <FileText className="text-amber-500 w-6 h-6 shrink-0" />
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm text-slate-300 truncate">{arquivoUrl.split('/').pop()}</p>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => setArquivoUrl('')}
                >
                  Remover
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileUpload}
                  className="bg-slate-950 border-slate-700 text-white file:text-amber-500 file:bg-amber-500/10 file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-4 file:font-semibold"
                />
                {uploading && <Loader2 className="w-5 h-5 animate-spin text-amber-500" />}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Label className="text-base text-white font-semibold">Quiz (Avaliação)</Label>
            <div className="flex items-center gap-2">
              <Label className="text-sm text-slate-400">Nota Mínima</Label>
              <Input
                type="number"
                min="0"
                max="10"
                value={notaMinima}
                onChange={(e) => setNotaMinima(Number(e.target.value))}
                className="w-20 bg-slate-900 border-slate-700 text-white h-8"
              />
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={addQuestion}
            className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
          >
            <Plus className="w-4 h-4 mr-2" /> Nova Questão
          </Button>
        </div>

        {quiz.map((q, qIndex) => (
          <div
            key={qIndex}
            className="p-5 bg-slate-900 rounded-lg border border-slate-800 space-y-4 relative"
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10"
              onClick={() => removeQuestion(qIndex)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <div className="space-y-2 pr-10">
              <Label className="text-slate-300">Pergunta {qIndex + 1}</Label>
              <Input
                value={q.question}
                onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                className="bg-slate-950 border-slate-700 text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.isArray(q.options) &&
                q.options.map((opt: string, optIndex: number) => (
                  <div key={optIndex} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name={`correct-${qIndex}`}
                      checked={q.correctIndex === optIndex}
                      onChange={() => updateQuestion(qIndex, 'correctIndex', optIndex)}
                      className="w-4 h-4 accent-amber-500 bg-slate-950 border-slate-700 cursor-pointer"
                    />
                    <Input
                      value={opt}
                      onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                      placeholder={`Opção ${optIndex + 1}`}
                      className="bg-slate-950 border-slate-700 text-white"
                    />
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-6 border-t border-slate-800">
        <Button
          type="submit"
          disabled={saving}
          className="bg-amber-500 hover:bg-amber-600 text-black px-8 font-semibold"
        >
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Salvar Módulo
        </Button>
      </div>
    </form>
  )
}

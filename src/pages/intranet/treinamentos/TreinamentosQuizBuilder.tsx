import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Check, ChevronsUpDown, Edit2, Plus, Trash2, X, CheckCircle2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

interface TreinamentosQuizBuilderProps {
  modulo: any
  cursos: any[]
  onSave: () => void
  onCancel: () => void
  onRefresh?: () => void
}

export function TreinamentosQuizBuilder({
  modulo,
  cursos,
  onSave,
  onCancel,
  onRefresh,
}: TreinamentosQuizBuilderProps) {
  const [cursoId, setCursoId] = useState(modulo.curso_id || '')
  const [titulo, setTitulo] = useState(modulo.titulo || '')
  const [descricao, setDescricao] = useState(modulo.descricao || '')
  const [videoUrl, setVideoUrl] = useState(modulo.video_url || '')
  const [notaMinima, setNotaMinima] = useState(modulo.nota_minima || 7)
  const [perguntas, setPerguntas] = useState<any[]>(modulo.quiz_json || [])
  const [openCurso, setOpenCurso] = useState(false)
  const [isEditingCurso, setIsEditingCurso] = useState(false)
  const [editingCursoNome, setEditingCursoNome] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleUpdateCursoNome = async () => {
    if (!cursoId || !editingCursoNome.trim()) return
    const { error } = await supabase
      .from('intranet_treinamentos_cursos')
      .update({ titulo: editingCursoNome.trim() })
      .eq('id', cursoId)

    if (error) {
      toast.error('Erro ao atualizar nome do curso')
    } else {
      toast.success('Nome do curso atualizado')
      setIsEditingCurso(false)
      if (onRefresh) onRefresh()
    }
  }

  const startEditingCurso = () => {
    const curso = cursos.find((c) => c.id === cursoId)
    if (curso) {
      setEditingCursoNome(curso.titulo)
      setIsEditingCurso(true)
    }
  }

  const handleAddPergunta = () => {
    setPerguntas([
      ...perguntas,
      {
        id: crypto.randomUUID(),
        pergunta: '',
        opcoes: [{ id: crypto.randomUUID(), texto: '', correta: true }],
      },
    ])
  }

  const handleRemovePergunta = (index: number) => {
    setPerguntas(perguntas.filter((_, i) => i !== index))
  }

  const handlePerguntaChange = (index: number, value: string) => {
    const newPerguntas = [...perguntas]
    newPerguntas[index].pergunta = value
    setPerguntas(newPerguntas)
  }

  const handleAddOpcao = (perguntaIndex: number) => {
    const newPerguntas = [...perguntas]
    newPerguntas[perguntaIndex].opcoes.push({ id: crypto.randomUUID(), texto: '', correta: false })
    setPerguntas(newPerguntas)
  }

  const handleRemoveOpcao = (perguntaIndex: number, opcaoIndex: number) => {
    const newPerguntas = [...perguntas]
    newPerguntas[perguntaIndex].opcoes = newPerguntas[perguntaIndex].opcoes.filter(
      (_: any, i: number) => i !== opcaoIndex,
    )
    setPerguntas(newPerguntas)
  }

  const handleOpcaoChange = (perguntaIndex: number, opcaoIndex: number, value: string) => {
    const newPerguntas = [...perguntas]
    newPerguntas[perguntaIndex].opcoes[opcaoIndex].texto = value
    setPerguntas(newPerguntas)
  }

  const handleSetCorreta = (perguntaIndex: number, opcaoIndex: number) => {
    const newPerguntas = [...perguntas]
    newPerguntas[perguntaIndex].opcoes.forEach((op: any, i: number) => {
      op.correta = i === opcaoIndex
    })
    setPerguntas(newPerguntas)
  }

  const handleSave = async () => {
    if (!titulo || !cursoId) {
      toast.error('Preencha os campos obrigatórios')
      return
    }

    setIsSaving(true)
    const payload = {
      titulo,
      descricao,
      curso_id: cursoId,
      video_url: videoUrl,
      nota_minima: notaMinima,
      quiz_json: perguntas,
      ordem: modulo.ordem || 0,
    }

    let error
    if (modulo.id) {
      const res = await supabase
        .from('intranet_treinamentos_modulos')
        .update(payload)
        .eq('id', modulo.id)
      error = res.error
    } else {
      const res = await supabase.from('intranet_treinamentos_modulos').insert([payload])
      error = res.error
    }

    setIsSaving(false)
    if (error) {
      toast.error('Erro ao salvar módulo')
    } else {
      toast.success('Módulo salvo com sucesso')
      onSave()
    }
  }

  return (
    <div className="space-y-6 bg-slate-950 p-4 rounded-lg border border-slate-800">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-100">
          {modulo.id ? 'Editar Módulo' : 'Novo Módulo'}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-slate-200">Curso Vinculado *</Label>
          <div className="flex gap-2 items-center">
            {isEditingCurso ? (
              <div className="flex-1 flex gap-2">
                <Input
                  value={editingCursoNome}
                  onChange={(e) => setEditingCursoNome(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-slate-50"
                  autoFocus
                />
                <Button
                  size="icon"
                  onClick={handleUpdateCursoNome}
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 shrink-0"
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setIsEditingCurso(false)}
                  className="border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex-1 flex gap-2">
                <Popover open={openCurso} onOpenChange={setOpenCurso}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCurso}
                      className="w-full justify-between bg-slate-900 border-slate-700 text-slate-50 hover:bg-slate-800 hover:text-white"
                    >
                      {cursoId
                        ? cursos.find((curso) => curso.id === cursoId)?.titulo
                        : 'Selecione um curso...'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0 bg-slate-900 border-slate-800">
                    <Command className="bg-transparent">
                      <CommandInput placeholder="Buscar curso..." className="text-slate-100" />
                      <CommandList>
                        <CommandEmpty className="py-6 text-center text-sm text-slate-400">
                          Nenhum curso encontrado.
                        </CommandEmpty>
                        <CommandGroup>
                          {cursos.map((curso) => (
                            <CommandItem
                              key={curso.id}
                              value={curso.titulo}
                              onSelect={() => {
                                setCursoId(curso.id === cursoId ? '' : curso.id)
                                setOpenCurso(false)
                              }}
                              className="text-slate-200 aria-selected:bg-slate-800 aria-selected:text-white cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  cursoId === curso.id ? 'opacity-100 text-amber-500' : 'opacity-0',
                                )}
                              />
                              {curso.titulo}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {cursoId && (
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={startEditingCurso}
                    className="border-slate-700 bg-slate-900 text-amber-500 hover:bg-slate-800 hover:text-amber-400 shrink-0"
                    title="Editar nome do curso"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-200">Título do Módulo *</Label>
          <Input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="bg-slate-900 border-slate-700 text-slate-50 placeholder:text-slate-500"
            placeholder="Ex: Introdução ao Atendimento"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-slate-200">Descrição</Label>
          <Textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="bg-slate-900 border-slate-700 text-slate-50 placeholder:text-slate-500 min-h-[80px]"
            placeholder="Breve resumo sobre o que será aprendido..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-200">URL do Vídeo (Opcional)</Label>
            <Input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="bg-slate-900 border-slate-700 text-slate-50 placeholder:text-slate-500"
              placeholder="https://youtube.com/..."
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-200">Nota Mínima (0 a 10)</Label>
            <Input
              type="number"
              min="0"
              max="10"
              value={notaMinima}
              onChange={(e) => setNotaMinima(Number(e.target.value))}
              className="bg-slate-900 border-slate-700 text-slate-50"
            />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-slate-100">Quiz / Avaliação</h4>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleAddPergunta}
            className="border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-slate-950"
          >
            <Plus className="w-4 h-4 mr-2" /> Adicionar Pergunta
          </Button>
        </div>

        <div className="space-y-6">
          {perguntas.map((p, pIndex) => (
            <div
              key={p.id}
              className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-4 relative"
            >
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => handleRemovePergunta(pIndex)}
                className="absolute top-2 right-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 h-8 w-8"
              >
                <Trash2 className="w-4 h-4" />
              </Button>

              <div className="space-y-2 pr-10">
                <Label className="text-slate-300">Pergunta {pIndex + 1}</Label>
                <Input
                  value={p.pergunta}
                  onChange={(e) => handlePerguntaChange(pIndex, e.target.value)}
                  className="bg-slate-950 border-slate-700 text-slate-50"
                  placeholder="Digite a pergunta..."
                />
              </div>

              <div className="space-y-2 pl-4 border-l-2 border-slate-800">
                <Label className="text-slate-400 text-xs uppercase tracking-wider">
                  Alternativas
                </Label>
                {p.opcoes.map((op: any, oIndex: number) => (
                  <div key={op.id} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSetCorreta(pIndex, oIndex)}
                      className={cn(
                        'shrink-0 p-1 rounded-full transition-colors',
                        op.correta
                          ? 'text-emerald-500 bg-emerald-500/10'
                          : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800',
                      )}
                      title={op.correta ? 'Alternativa Correta' : 'Marcar como correta'}
                    >
                      {op.correta ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                    <Input
                      value={op.texto}
                      onChange={(e) => handleOpcaoChange(pIndex, oIndex, e.target.value)}
                      className="bg-slate-950 border-slate-700 text-slate-50 h-9"
                      placeholder={`Opção ${oIndex + 1}`}
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => handleRemoveOpcao(pIndex, oIndex)}
                      disabled={p.opcoes.length <= 1}
                      className="text-slate-500 hover:text-rose-500 h-8 w-8 shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => handleAddOpcao(pIndex)}
                  className="text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 mt-2 h-8"
                >
                  <Plus className="w-3 h-3 mr-1" /> Nova Opção
                </Button>
              </div>
            </div>
          ))}
          {perguntas.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-sm bg-slate-900/50 rounded-lg border border-slate-800 border-dashed">
              Nenhuma pergunta adicionada ao quiz.
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800"
        >
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-medium"
        >
          {isSaving ? 'Salvando...' : 'Salvar Módulo'}
        </Button>
      </div>
    </div>
  )
}

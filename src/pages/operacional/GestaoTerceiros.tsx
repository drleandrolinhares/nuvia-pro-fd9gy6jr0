import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import {
  getTarefas,
  updateTarefaStatus,
  createTarefa,
  updateTarefa,
  deleteTarefa,
  TarefaTerceiro,
  getColunas,
  TerceiroColuna,
  updateColuna,
  createColuna,
  getHistorico,
  createHistorico,
  TerceiroHistorico,
} from '@/services/terceiros'
import { Button } from '@/components/ui/button'
import {
  Plus,
  GripVertical,
  Calendar,
  User,
  Building2,
  Trash2,
  Pencil,
  Check,
  X,
  History,
} from 'lucide-react'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const TITLES: Record<string, string> = {
  laboratorios: 'Laboratórios',
  radiologia: 'Radiologia',
  outros: 'Outros',
}

const CARD_COLORS = [
  { value: 'bg-slate-700', label: 'Padrão' },
  { value: 'bg-blue-600', label: 'Azul' },
  { value: 'bg-emerald-600', label: 'Verde' },
  { value: 'bg-rose-600', label: 'Vermelho' },
  { value: 'bg-amber-600', label: 'Amarelo' },
  { value: 'bg-purple-600', label: 'Roxo' },
  { value: 'bg-cyan-600', label: 'Ciano' },
  { value: 'bg-pink-600', label: 'Rosa' },
]

const TAG_COLORS = [
  { value: 'bg-slate-500', label: 'Cinza' },
  { value: 'bg-blue-500', label: 'Azul' },
  { value: 'bg-emerald-500', label: 'Verde' },
  { value: 'bg-rose-500', label: 'Vermelho' },
  { value: 'bg-amber-500', label: 'Amarelo' },
  { value: 'bg-purple-500', label: 'Roxo' },
  { value: 'bg-cyan-500', label: 'Ciano' },
  { value: 'bg-pink-500', label: 'Rosa' },
]

const getCardBg = (cor: string | null) => {
  if (!cor) return 'bg-slate-700'
  if (cor.startsWith('border-')) {
    const base = cor.replace('border-', '')
    if (base === 'slate-700') return 'bg-slate-700'
    return `bg-${base.replace('500', '600')}`
  }
  return cor
}

export default function GestaoTerceiros() {
  const { user } = useAuth()
  const { categoriaSlug } = useParams<{ categoriaSlug: string }>()
  const [tarefas, setTarefas] = useState<TarefaTerceiro[]>([])
  const [colunas, setColunas] = useState<TerceiroColuna[]>([])
  const [historico, setHistorico] = useState<TerceiroHistorico[]>([])
  const { toast } = useToast()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isNewColModalOpen, setIsNewColModalOpen] = useState(false)
  const [editingTarefa, setEditingTarefa] = useState<TarefaTerceiro | null>(null)
  const [editingColId, setEditingColId] = useState<string | null>(null)
  const [editColTitle, setEditColTitle] = useState('')
  const [newColTitle, setNewColTitle] = useState('')

  const [tagInput, setTagInput] = useState('')
  const [tagColor, setTagColor] = useState('bg-slate-500')

  const [formData, setFormData] = useState({
    pacienteNome: '',
    terceiroNome: '',
    titulo: '',
    dataPrevista: '',
    descricao: '',
    criadoEm: '',
    cor: 'bg-slate-700',
    etiquetas: [] as { nome: string; cor: string }[],
  })

  const loadData = async () => {
    if (!categoriaSlug) return
    try {
      const [tData, cData] = await Promise.all([
        getTarefas(categoriaSlug),
        getColunas(categoriaSlug),
      ])
      setTarefas(tData)
      setColunas(cData)
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    }
  }

  useEffect(() => {
    loadData()
  }, [categoriaSlug])

  const onDragStart = (e: React.DragEvent, id: string) => e.dataTransfer.setData('id', id)
  const onDrop = async (e: React.DragEvent, status: string) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('id')
    if (id && user) {
      const task = tarefas.find((t) => t.id === id)
      if (task && task.status !== status) {
        const oldCol = colunas.find((c) => c.id === task.status)?.titulo || 'Desconhecida'
        const newCol = colunas.find((c) => c.id === status)?.titulo || 'Desconhecida'

        setTarefas((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)))
        try {
          await updateTarefaStatus(id, status)
          await createHistorico({
            tarefa_id: id,
            usuario_id: user.id,
            acao: 'movimentacao',
            detalhes: `Moveu de "${oldCol}" para "${newCol}"`,
          })
        } catch (error) {
          console.error('Erro ao mover tarefa', error)
          toast({
            title: 'Erro',
            description: 'Não foi possível mover a tarefa.',
            variant: 'destructive',
          })
          loadData()
        }
      }
    }
  }
  const onDragOver = (e: React.DragEvent) => e.preventDefault()

  const openModal = async (t?: TarefaTerceiro) => {
    setEditingTarefa(t || null)
    setFormData({
      pacienteNome: t?.paciente_nome || '',
      terceiroNome: t?.terceiro_nome || '',
      titulo: t?.titulo || '',
      dataPrevista: t?.data_prevista || '',
      descricao: t?.descricao || '',
      criadoEm: t?.criado_em
        ? format(new Date(t.criado_em), 'yyyy-MM-dd')
        : format(new Date(), 'yyyy-MM-dd'),
      cor: t ? getCardBg(t.cor) : 'bg-slate-700',
      etiquetas: t?.etiquetas || [],
    })
    setTagInput('')
    setTagColor('bg-slate-500')
    setIsModalOpen(true)

    if (t) {
      try {
        const hist = await getHistorico(t.id)
        setHistorico(hist)
      } catch (error) {
        console.error('Erro ao buscar historico', error)
      }
    } else {
      setHistorico([])
    }
  }

  const handleAddTag = () => {
    if (!tagInput.trim()) return
    setFormData((prev) => ({
      ...prev,
      etiquetas: [...prev.etiquetas, { nome: tagInput.trim(), cor: tagColor }],
    }))
    setTagInput('')
  }

  const removeTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      etiquetas: prev.etiquetas.filter((_, i) => i !== index),
    }))
  }

  const handleSave = async () => {
    if (!user) return toast({ title: 'Atenção', description: 'Usuário não autenticado.' })
    if (!formData.pacienteNome || !formData.titulo || !categoriaSlug) {
      return toast({ title: 'Atenção', description: 'Preencha os campos obrigatórios.' })
    }
    try {
      const payload: any = {
        categoria_slug: categoriaSlug,
        titulo: formData.titulo,
        paciente_nome: formData.pacienteNome,
        terceiro_nome: formData.terceiroNome,
        data_prevista: formData.dataPrevista || null,
        descricao: formData.descricao,
        cor: formData.cor,
        etiquetas: formData.etiquetas,
      }

      if (formData.criadoEm) {
        const parsedDate = new Date(formData.criadoEm + 'T12:00:00')
        if (!isNaN(parsedDate.getTime())) {
          payload.criado_em = parsedDate.toISOString()
        }
      }

      if (editingTarefa) {
        await updateTarefa(editingTarefa.id, payload)
        await createHistorico({
          tarefa_id: editingTarefa.id,
          usuario_id: user.id,
          acao: 'edicao',
          detalhes: 'Atualizou as informações do card',
        })
      } else {
        payload.status = colunas.length > 0 ? colunas[0].id : 'pendente'
        const nova = await createTarefa(payload)
        await createHistorico({
          tarefa_id: nova.id,
          usuario_id: user.id,
          acao: 'criacao',
          detalhes: 'Criou o card no sistema',
        })
      }
      setIsModalOpen(false)
      loadData()
      toast({ title: 'Sucesso', description: 'Registro salvo.' })
    } catch (error: any) {
      console.error('Erro ao salvar:', error)
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao salvar.',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir?')) return
    try {
      await deleteTarefa(id)
      setIsModalOpen(false)
      loadData()
      toast({ title: 'Sucesso', description: 'Registro excluído.' })
    } catch (error: any) {
      console.error('Erro ao excluir:', error)
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao excluir.',
        variant: 'destructive',
      })
    }
  }

  const saveCol = async (id: string) => {
    if (!editColTitle.trim()) return
    try {
      await updateColuna(id, editColTitle)
      setColunas((prev) => prev.map((c) => (c.id === id ? { ...c, titulo: editColTitle } : c)))
      setEditingColId(null)
    } catch (error: any) {
      console.error(error)
      toast({ title: 'Erro', description: 'Falha ao renomear.', variant: 'destructive' })
    }
  }

  const handleCreateCol = async () => {
    if (!newColTitle.trim() || !categoriaSlug) return
    try {
      await createColuna({
        categoria_slug: categoriaSlug,
        titulo: newColTitle,
        ordem: colunas.length,
        cor: 'border-slate-700 bg-slate-800/50',
      })
      setIsNewColModalOpen(false)
      setNewColTitle('')
      loadData()
      toast({ title: 'Sucesso', description: 'Etapa criada com sucesso.' })
    } catch (error: any) {
      console.error(error)
      toast({ title: 'Erro', description: 'Erro ao criar etapa.', variant: 'destructive' })
    }
  }

  return (
    <div className="p-6 h-[calc(100vh-4rem)] flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            {TITLES[categoriaSlug || ''] || 'Gestão de Terceiros'}
          </h1>
          <p className="text-sm text-slate-400">
            Gerencie trabalhos e serviços externos (laboratórios, clínicas).
          </p>
        </div>
        <Button onClick={() => openModal()} className="bg-amber-600 hover:bg-amber-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Novo Registro
        </Button>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 h-full min-w-max">
          {colunas.map((col) => (
            <div
              key={col.id}
              className={`w-[320px] shrink-0 flex flex-col rounded-xl border ${col.cor} p-4`}
              onDrop={(e) => onDrop(e, col.id)}
              onDragOver={onDragOver}
            >
              <div className="flex justify-between items-center mb-4 group min-h-12 bg-[#0a1128] rounded-md px-4 py-2 border border-[#1e293b] shadow-md">
                {editingColId === col.id ? (
                  <div className="flex items-center gap-1 w-full">
                    <Input
                      value={editColTitle}
                      onChange={(e) => setEditColTitle(e.target.value)}
                      className="h-8 text-sm bg-blue-950 border-blue-900 text-[#d4af37] px-2 font-bold uppercase tracking-wide"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && saveCol(col.id)}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-emerald-400 hover:bg-emerald-500/20"
                      onClick={() => saveCol(col.id)}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-slate-400 hover:bg-slate-800"
                      onClick={() => setEditingColId(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <h3 className="font-bold text-[#d4af37] flex items-center gap-2 text-sm uppercase tracking-wider">
                      {col.titulo}
                      <button
                        onClick={() => {
                          setEditingColId(col.id)
                          setEditColTitle(col.titulo)
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-[#d4af37]/70 hover:text-[#d4af37]"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    </h3>
                    <span className="bg-blue-900/50 px-2 py-0.5 rounded text-xs text-[#d4af37] font-medium border border-blue-800/50">
                      {tarefas.filter((t) => t.status === col.id).length}
                    </span>
                  </>
                )}
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {tarefas
                  .filter((t) => t.status === col.id)
                  .map((t) => (
                    <div
                      key={t.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, t.id)}
                      onClick={() => openModal(t)}
                      className={cn(
                        'p-4 rounded-lg cursor-grab hover:brightness-110 transition-all shadow-md flex flex-col gap-1',
                        getCardBg(t.cor),
                      )}
                    >
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <h4 className="font-bold text-white text-base leading-tight line-clamp-2 flex-1 uppercase">
                          {t.paciente_nome || 'SEM PACIENTE'}
                        </h4>
                        <GripVertical className="w-4 h-4 text-white/50 shrink-0" />
                      </div>

                      {t.titulo && (
                        <div className="text-sm text-white/90 mb-2 font-medium line-clamp-2">
                          {t.titulo}
                        </div>
                      )}

                      {t.etiquetas && t.etiquetas.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {t.etiquetas.map((tag, idx) => (
                            <span
                              key={idx}
                              className={cn(
                                'text-[10px] px-1.5 py-0.5 rounded font-medium text-white shadow-sm border border-white/10',
                                tag.cor,
                              )}
                            >
                              {tag.nome}
                            </span>
                          ))}
                        </div>
                      )}

                      {t.terceiro_nome && (
                        <div className="flex items-center text-xs text-white/80 mb-1 mt-1">
                          <Building2 className="w-3 h-3 mr-1 shrink-0" />
                          <span className="truncate">{t.terceiro_nome}</span>
                        </div>
                      )}

                      {t.data_prevista && (
                        <div className="flex items-center mt-2 pt-2 border-t border-white/20 text-xs text-white/90 font-medium">
                          <Calendar className="w-3 h-3 mr-1" />
                          Agendado: {format(new Date(t.data_prevista + 'T12:00:00'), 'dd/MM/yyyy')}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}

          <div
            onClick={() => setIsNewColModalOpen(true)}
            className="w-[320px] shrink-0 flex flex-col rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/30 hover:bg-slate-800/50 hover:border-slate-600 transition-colors cursor-pointer items-center justify-center min-h-[150px] opacity-70 hover:opacity-100"
          >
            <Plus className="w-8 h-8 text-slate-400 mb-2" />
            <span className="text-slate-400 font-medium">Nova Etapa</span>
          </div>
        </div>
      </div>

      <Dialog open={isNewColModalOpen} onOpenChange={setIsNewColModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-200 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Nova Etapa (Coluna)</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label>Nome da Etapa</Label>
            <Input
              value={newColTitle}
              onChange={(e) => setNewColTitle(e.target.value)}
              placeholder="Ex: Em Prova, Finalizado..."
              className="bg-slate-950 border-slate-800"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateCol()}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNewColModalOpen(false)}
              className="border-slate-700 hover:bg-slate-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateCol}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Criar Etapa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-200 sm:max-w-4xl p-0 flex flex-col h-[90vh] md:h-[80vh]">
          <DialogHeader className="p-6 pb-4 border-b border-slate-800 shrink-0">
            <DialogTitle>{editingTarefa ? 'Editar Registro' : 'Novo Registro'}</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
            {/* Esquerda: Form */}
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-4">
              <div className="space-y-1">
                <Label>Nome do paciente *</Label>
                <Input
                  value={formData.pacienteNome}
                  onChange={(e) => setFormData({ ...formData, pacienteNome: e.target.value })}
                  className="bg-slate-950 border-slate-800 font-bold"
                />
              </div>
              <div className="space-y-1">
                <Label>Serviço a ser executado *</Label>
                <Input
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Ex: Protocolo superior, Tomografia..."
                  className="bg-slate-950 border-slate-800"
                />
              </div>
              <div className="space-y-1">
                <Label>Prestador</Label>
                <Input
                  value={formData.terceiroNome}
                  onChange={(e) => setFormData({ ...formData, terceiroNome: e.target.value })}
                  placeholder="Nome do laboratório ou clínica"
                  className="bg-slate-950 border-slate-800"
                />
              </div>

              <div className="space-y-1">
                <Label>Cor do Card (Laboratório/Prestador)</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {CARD_COLORS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setFormData({ ...formData, cor: c.value })}
                      className={cn(
                        'w-8 h-8 rounded-md transition-transform border-2 shadow-sm',
                        c.value,
                        formData.cor === c.value
                          ? 'border-white scale-110'
                          : 'border-transparent hover:scale-105',
                      )}
                      title={c.label}
                      type="button"
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-800">
                <Label>Etiquetas do Card</Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Nome da etiqueta"
                    className="bg-slate-950 border-slate-800 flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                  <Select value={tagColor} onValueChange={setTagColor}>
                    <SelectTrigger className="w-[110px] bg-slate-950 border-slate-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TAG_COLORS.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          <div className="flex items-center gap-2">
                            <div className={cn('w-3 h-3 rounded-full', c.value)} />
                            <span className="text-xs">{c.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    onClick={handleAddTag}
                    variant="secondary"
                    className="shrink-0 bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700"
                  >
                    Adicionar
                  </Button>
                </div>
                {formData.etiquetas.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.etiquetas.map((t, idx) => (
                      <Badge
                        key={idx}
                        className={cn(
                          t.cor,
                          'text-white gap-1 pl-2 pr-1 py-0.5 font-normal hover:opacity-90 transition-opacity border-none',
                        )}
                      >
                        {t.nome}
                        <X
                          className="w-3 h-3 ml-1 cursor-pointer hover:text-red-200"
                          onClick={() => removeTag(idx)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                <div className="space-y-1">
                  <Label>Data inclusão sistema</Label>
                  <Input
                    type="date"
                    value={formData.criadoEm}
                    onChange={(e) => setFormData({ ...formData, criadoEm: e.target.value })}
                    className="bg-slate-950 border-slate-800 [color-scheme:dark]"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Data agendamento</Label>
                  <Input
                    type="date"
                    value={formData.dataPrevista}
                    onChange={(e) => setFormData({ ...formData, dataPrevista: e.target.value })}
                    className="bg-slate-950 border-slate-800 [color-scheme:dark]"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Observações</Label>
                <Textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="bg-slate-950 border-slate-800 resize-none"
                  rows={3}
                />
              </div>
            </div>

            {/* Direita: Historico (Apenas Edição) */}
            {editingTarefa && (
              <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-800 bg-slate-950/50 p-6 flex flex-col h-64 md:h-auto">
                <h4 className="text-sm font-bold uppercase text-slate-400 mb-4 shrink-0 flex items-center gap-2">
                  <History className="w-4 h-4" /> Histórico de Atividades
                </h4>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                  {historico.length === 0 ? (
                    <p className="text-xs text-slate-500">Nenhum histórico encontrado.</p>
                  ) : (
                    historico.map((h) => (
                      <div
                        key={h.id}
                        className="space-y-1 relative pl-4 border-l-2 border-slate-800 pb-2"
                      >
                        <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-amber-500" />
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-300">
                            {h.usuario?.nome || 'Sistema'}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {format(new Date(h.criado_em), 'dd/MM/yyyy HH:mm')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{h.detalhes || h.acao}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="p-4 border-t border-slate-800 shrink-0 bg-slate-900 flex justify-between w-full">
            <div>
              {editingTarefa && (
                <Button
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive px-3"
                  onClick={() => handleDelete(editingTarefa.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Excluir
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="border-slate-700 hover:bg-slate-800 text-slate-300"
              >
                Cancelar
              </Button>
              <Button onClick={handleSave} className="bg-amber-600 hover:bg-amber-700">
                Salvar Alterações
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

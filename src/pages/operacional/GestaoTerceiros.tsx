import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'
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

const TITLES: Record<string, string> = {
  laboratorios: 'Laboratórios',
  radiologia: 'Radiologia',
  outros: 'Outros',
}

export default function GestaoTerceiros() {
  const { categoriaSlug } = useParams<{ categoriaSlug: string }>()
  const [tarefas, setTarefas] = useState<TarefaTerceiro[]>([])
  const [colunas, setColunas] = useState<TerceiroColuna[]>([])
  const { toast } = useToast()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTarefa, setEditingTarefa] = useState<TarefaTerceiro | null>(null)
  const [editingColId, setEditingColId] = useState<string | null>(null)
  const [editColTitle, setEditColTitle] = useState('')

  const [formData, setFormData] = useState({
    pacienteNome: '',
    terceiroNome: '',
    titulo: '',
    dataPrevista: '',
    descricao: '',
    criadoEm: '',
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
    if (id) {
      setTarefas((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)))
      try {
        await updateTarefaStatus(id, status)
      } catch {
        loadData()
      }
    }
  }
  const onDragOver = (e: React.DragEvent) => e.preventDefault()

  const openModal = (t?: TarefaTerceiro) => {
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
    })
    setIsModalOpen(true)
  }

  const handleSave = async () => {
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
      }
      if (formData.criadoEm) {
        payload.criado_em = new Date(formData.criadoEm + 'T12:00:00').toISOString()
      }
      if (editingTarefa) {
        await updateTarefa(editingTarefa.id, payload)
      } else {
        payload.status = colunas.length > 0 ? colunas[0].id : 'pendente'
        await createTarefa(payload)
      }
      setIsModalOpen(false)
      loadData()
      toast({ title: 'Sucesso', description: 'Registro salvo.' })
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
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
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    }
  }

  const saveCol = async (id: string) => {
    if (!editColTitle.trim()) return
    try {
      await updateColuna(id, editColTitle)
      setColunas((prev) => prev.map((c) => (c.id === id ? { ...c, titulo: editColTitle } : c)))
      setEditingColId(null)
    } catch (error: any) {
      toast({ title: 'Erro', description: 'Falha ao renomear.', variant: 'destructive' })
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
              className={`w-[320px] flex flex-col rounded-xl border ${col.cor} p-4`}
              onDrop={(e) => onDrop(e, col.id)}
              onDragOver={onDragOver}
            >
              <div className="flex justify-between items-center mb-4 group min-h-10 bg-blue-950 rounded-md px-3 py-1 border border-blue-900 shadow-sm">
                {editingColId === col.id ? (
                  <div className="flex items-center gap-1 w-full">
                    <Input
                      value={editColTitle}
                      onChange={(e) => setEditColTitle(e.target.value)}
                      className="h-8 text-sm bg-blue-900 border-blue-800 text-amber-500 px-2 font-bold uppercase tracking-wide"
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
                    <h3 className="font-bold text-amber-500 flex items-center gap-2 text-sm uppercase tracking-wide">
                      {col.titulo}
                      <button
                        onClick={() => {
                          setEditingColId(col.id)
                          setEditColTitle(col.titulo)
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-amber-600 hover:text-amber-400"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    </h3>
                    <span className="bg-blue-900 px-2 py-0.5 rounded text-xs text-amber-500/80 font-medium">
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
                      className="bg-slate-900/80 border border-slate-700 p-4 rounded-lg cursor-grab hover:border-amber-500/50 transition-colors"
                    >
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h4 className="font-medium text-slate-200 text-sm leading-tight line-clamp-2 flex-1">
                          {t.titulo}
                        </h4>
                        <GripVertical className="w-4 h-4 text-slate-500 shrink-0" />
                      </div>
                      {t.paciente_nome && (
                        <div className="flex items-center text-xs text-slate-400 mb-1">
                          <User className="w-3 h-3 mr-1 shrink-0" />
                          <span className="truncate">{t.paciente_nome}</span>
                        </div>
                      )}
                      {t.terceiro_nome && (
                        <div className="flex items-center text-xs text-slate-400 mb-2">
                          <Building2 className="w-3 h-3 mr-1 shrink-0" />
                          <span className="truncate">{t.terceiro_nome}</span>
                        </div>
                      )}
                      {t.data_prevista && (
                        <div className="flex items-center mt-3 pt-3 border-t border-slate-800 text-xs text-amber-500">
                          <Calendar className="w-3 h-3 mr-1" />
                          Agendado: {format(new Date(t.data_prevista + 'T12:00:00'), 'dd/MM/yyyy')}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-200 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTarefa ? 'Editar Registro' : 'Novo Registro'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Nome do paciente *</Label>
              <Input
                value={formData.pacienteNome}
                onChange={(e) => setFormData({ ...formData, pacienteNome: e.target.value })}
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
              <Label>Serviço a ser executado *</Label>
              <Input
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Ex: Protocolo superior, Tomografia..."
                className="bg-slate-950 border-slate-800"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
                <Label>Data agendamento no prestador</Label>
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
          <DialogFooter className="flex justify-between items-center sm:justify-between">
            {editingTarefa ? (
              <Button
                variant="ghost"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive p-0 h-auto"
                onClick={() => handleDelete(editingTarefa.id)}
              >
                <Trash2 className="w-4 h-4 mr-1" /> Excluir
              </Button>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="border-slate-700 hover:bg-slate-800 text-slate-300"
              >
                Cancelar
              </Button>
              <Button onClick={handleSave} className="bg-amber-600 hover:bg-amber-700">
                Salvar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

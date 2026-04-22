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
} from '@/services/terceiros'
import { Button } from '@/components/ui/button'
import { Plus, GripVertical, Calendar, User, Building2, Trash2 } from 'lucide-react'
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

const COLUMNS = [
  { id: 'pendente', title: 'Pendente', color: 'border-slate-700 bg-slate-800/50' },
  { id: 'em_execucao', title: 'Em Execução', color: 'border-blue-900 bg-blue-950/30' },
  { id: 'concluido', title: 'Concluído', color: 'border-emerald-900 bg-emerald-950/30' },
]

const TITLES: Record<string, string> = {
  proteses: 'Gestão de Próteses',
  exames: 'Exames Radiológicos',
  'risco-cirurgico': 'Risco Cirúrgico',
  outros: 'Outros Terceiros',
}

export default function GestaoTerceiros() {
  const { categoriaSlug } = useParams<{ categoriaSlug: string }>()
  const [tarefas, setTarefas] = useState<TarefaTerceiro[]>([])
  const { toast } = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTarefa, setEditingTarefa] = useState<TarefaTerceiro | null>(null)
  const [formData, setFormData] = useState({
    titulo: '',
    pacienteNome: '',
    terceiroNome: '',
    dataPrevista: '',
    descricao: '',
  })

  const loadTarefas = async () => {
    if (!categoriaSlug) return
    try {
      const data = await getTarefas(categoriaSlug)
      setTarefas(data)
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    }
  }

  useEffect(() => {
    loadTarefas()
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
        loadTarefas()
      }
    }
  }
  const onDragOver = (e: React.DragEvent) => e.preventDefault()

  const openModal = (t?: TarefaTerceiro) => {
    setEditingTarefa(t || null)
    setFormData(
      t
        ? {
            titulo: t.titulo,
            pacienteNome: t.paciente_nome || '',
            terceiroNome: t.terceiro_nome || '',
            dataPrevista: t.data_prevista || '',
            descricao: t.descricao || '',
          }
        : { titulo: '', pacienteNome: '', terceiroNome: '', dataPrevista: '', descricao: '' },
    )
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!formData.titulo || !categoriaSlug) return
    try {
      const payload = {
        categoria_slug: categoriaSlug,
        titulo: formData.titulo,
        paciente_nome: formData.pacienteNome,
        terceiro_nome: formData.terceiroNome,
        data_prevista: formData.dataPrevista || null,
        descricao: formData.descricao,
      }
      if (editingTarefa) await updateTarefa(editingTarefa.id, payload)
      else await createTarefa(payload)
      setIsModalOpen(false)
      loadTarefas()
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
      loadTarefas()
      toast({ title: 'Sucesso', description: 'Registro excluído.' })
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
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
            Gerencie trabalhos e serviços externos (laboratórios, clínicas, especialistas).
          </p>
        </div>
        <Button onClick={() => openModal()} className="bg-amber-600 hover:bg-amber-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Novo Registro
        </Button>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 h-full min-w-max">
          {COLUMNS.map((col) => (
            <div
              key={col.id}
              className={`w-[320px] flex flex-col rounded-xl border ${col.color} p-4`}
              onDrop={(e) => onDrop(e, col.id)}
              onDragOver={onDragOver}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-slate-200">{col.title}</h3>
                <span className="bg-slate-900 px-2 py-0.5 rounded text-xs text-slate-400">
                  {tarefas.filter((t) => t.status === col.id).length}
                </span>
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
                        <h4 className="font-medium text-slate-200 text-sm leading-tight">
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
                          Prev: {format(new Date(t.data_prevista + 'T12:00:00'), 'dd/MM/yyyy')}
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
              <Label>Título / Procedimento</Label>
              <Input
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Ex: Avaliação de risco, Aparelho total..."
                className="bg-slate-950 border-slate-800"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Paciente</Label>
                <Input
                  value={formData.pacienteNome}
                  onChange={(e) => setFormData({ ...formData, pacienteNome: e.target.value })}
                  className="bg-slate-950 border-slate-800"
                />
              </div>
              <div className="space-y-1">
                <Label>Terceiro</Label>
                <Input
                  value={formData.terceiroNome}
                  onChange={(e) => setFormData({ ...formData, terceiroNome: e.target.value })}
                  placeholder="Lab. / Clínica"
                  className="bg-slate-950 border-slate-800"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Data Prevista</Label>
              <Input
                type="date"
                value={formData.dataPrevista}
                onChange={(e) => setFormData({ ...formData, dataPrevista: e.target.value })}
                className="bg-slate-950 border-slate-800 [color-scheme:dark]"
              />
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

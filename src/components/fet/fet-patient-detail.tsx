import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Plus, GripVertical, Trash2, Tags } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

const TAG_COLORS = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#06b6d4',
  '#0ea5e9',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#ec4899',
  '#f43f5e',
]

export function FETPatientDetail({ patientId }: { patientId: string }) {
  const [patient, setPatient] = useState<any>(null)
  const [procedimentos, setProcedimentos] = useState<any[]>([])
  const [dentistas, setDentistas] = useState<any[]>([])
  const [etiquetasGerais, setEtiquetasGerais] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[8])

  useEffect(() => {
    fetchData()
  }, [patientId])

  const fetchData = async () => {
    setLoading(true)
    const [patRes, procRes, dentRes, etiqRes] = await Promise.all([
      supabase.from('fet_pacientes').select('*').eq('id', patientId).single(),
      supabase
        .from('fet_procedimentos')
        .select('*')
        .eq('paciente_id', patientId)
        .order('ordem')
        .order('criado_em'),
      supabase.from('pro_agenda_dentistas').select('id, nome').eq('status', 'ativo').order('nome'),
      supabase.from('fet_etiquetas').select('*').order('nome'),
    ])

    if (patRes.data) setPatient(patRes.data)
    if (procRes.data) setProcedimentos(procRes.data)
    if (dentRes.data) setDentistas(dentRes.data)
    if (etiqRes.data) setEtiquetasGerais(etiqRes.data)
    setLoading(false)
  }

  const handleAddProc = async (targetOrder: number) => {
    const toUpdate = procedimentos.filter((p) => p.ordem >= targetOrder)
    for (const p of toUpdate) {
      await supabase
        .from('fet_procedimentos')
        .update({ ordem: p.ordem + 1 })
        .eq('id', p.id)
    }

    const newProc = {
      paciente_id: patientId,
      procedimento: 'Novo Procedimento',
      ordem: targetOrder,
      concluido: false,
      etiquetas: [],
    }

    const { error } = await supabase.from('fet_procedimentos').insert([newProc])
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    fetchData()
  }

  const handleUpdate = async (id: string, field: string, value: any) => {
    setProcedimentos((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
    await supabase
      .from('fet_procedimentos')
      .update({ [field]: value })
      .eq('id', id)
  }

  const handleDelete = async (id: string) => {
    await supabase.from('fet_procedimentos').delete().eq('id', id)
    setProcedimentos((prev) => prev.filter((p) => p.id !== id))
  }

  const handleCreateTag = async (nome: string, cor: string) => {
    const { data, error } = await supabase
      .from('fet_etiquetas')
      .insert([{ nome, cor }])
      .select()
      .single()
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
      return null
    }
    setEtiquetasGerais((prev) => [...prev, data].sort((a, b) => a.nome.localeCompare(b.nome)))
    return data
  }

  const toggleEtiqueta = async (procId: string, tagId: string, currentTags: string[]) => {
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter((id) => id !== tagId)
      : [...currentTags, tagId]
    handleUpdate(procId, 'etiquetas', newTags)
  }

  const [draggedId, setDraggedId] = useState<string | null>(null)
  const handleDragStart = (id: string) => setDraggedId(id)

  const handleDrop = async (targetId: string) => {
    if (!draggedId || draggedId === targetId) return
    const oldIndex = procedimentos.findIndex((p) => p.id === draggedId)
    const newIndex = procedimentos.findIndex((p) => p.id === targetId)

    const newProcs = [...procedimentos]
    const [moved] = newProcs.splice(oldIndex, 1)
    newProcs.splice(newIndex, 0, moved)

    const reordered = newProcs.map((p, i) => ({ ...p, ordem: i }))
    setProcedimentos(reordered)
    setDraggedId(null)

    for (const p of reordered) {
      await supabase.from('fet_procedimentos').update({ ordem: p.ordem }).eq('id', p.id)
    }
  }

  if (loading)
    return (
      <div className="p-8 text-center text-slate-400 flex-1 flex items-center justify-center">
        Carregando...
      </div>
    )
  if (!patient) return null

  const concluidos = procedimentos.filter((p) => p.concluido).length
  const total = procedimentos.length
  const progress = total === 0 ? 0 : Math.round((concluidos / total) * 100)

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex flex-col gap-3">
        <h2 className="text-xl font-bold text-white">Evolução: {patient.nome}</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Progresso do Tratamento</span>
            <span className="text-amber-500 font-bold">
              {progress}% ({concluidos}/{total})
            </span>
          </div>
          <Progress value={progress} className="h-2 bg-slate-800 [&>div]:bg-amber-500" />
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3 pb-20 pt-6">
          {procedimentos.map((p, index) => (
            <div key={p.id} className="relative group/item">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 opacity-0 group-hover/item:opacity-100 transition-opacity z-30">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-6 px-3 rounded-full text-[10px] shadow-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
                  onClick={() => handleAddProc(p.ordem)}
                >
                  <Plus className="w-3 h-3 mr-1" /> Inserir Acima
                </Button>
              </div>

              <div
                draggable
                onDragStart={() => handleDragStart(p.id)}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.dataTransfer.dropEffect = 'move'
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  handleDrop(p.id)
                }}
                className={cn(
                  'bg-slate-950 border border-slate-800 rounded-lg p-3 flex gap-3 transition-all hover:border-slate-700',
                  p.concluido && 'opacity-60 bg-slate-950/50',
                )}
              >
                <div className="flex flex-col items-center gap-2 pt-1 cursor-grab active:cursor-grabbing shrink-0">
                  <GripVertical className="text-slate-600 w-4 h-4 hover:text-white" />
                  <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300">
                    {index + 1}
                  </div>
                  <Checkbox
                    checked={p.concluido}
                    onCheckedChange={(c) => handleUpdate(p.id, 'concluido', c)}
                    className="w-4 h-4 border-slate-600 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 data-[state=checked]:text-slate-950"
                  />
                </div>

                <div className="flex-1 flex flex-col gap-2 min-w-0">
                  {(p.etiquetas || []).length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {(p.etiquetas || []).map((tagId: string) => {
                        const tag = etiquetasGerais.find((t) => t.id === tagId)
                        if (!tag) return null
                        return (
                          <Badge
                            key={tag.id}
                            style={{
                              backgroundColor: `${tag.cor}15`,
                              color: tag.cor,
                              borderColor: `${tag.cor}30`,
                            }}
                            variant="outline"
                            className="px-1.5 py-0 text-[10px] leading-tight font-medium"
                          >
                            {tag.nome}
                          </Badge>
                        )
                      })}
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
                    <div className="lg:col-span-5">
                      <Input
                        value={p.procedimento}
                        onChange={(e) => handleUpdate(p.id, 'procedimento', e.target.value)}
                        placeholder="Nome do Procedimento"
                        className="h-8 text-sm font-bold text-white bg-slate-900 border-slate-800 focus-visible:ring-amber-500"
                      />
                    </div>

                    <div className="lg:col-span-3">
                      <Select
                        value={p.dentista_id || 'none'}
                        onValueChange={(v) =>
                          handleUpdate(p.id, 'dentista_id', v === 'none' ? null : v)
                        }
                      >
                        <SelectTrigger className="h-8 text-sm bg-slate-900 border-slate-800 focus:ring-amber-500 text-white">
                          <SelectValue placeholder="Dentista Executor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Não definido</SelectItem>
                          {dentistas.map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                              {d.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="lg:col-span-2">
                      <Input
                        value={p.tempo_execucao || ''}
                        onChange={(e) => handleUpdate(p.id, 'tempo_execucao', e.target.value)}
                        placeholder="Tempo Estimado"
                        className="h-8 text-sm bg-slate-900 border-slate-800 text-white focus-visible:ring-amber-500"
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="h-8 w-full justify-start px-2 text-xs bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300 hover:bg-slate-800"
                          >
                            <Tags className="w-3 h-3 mr-1.5 shrink-0" />
                            Etiquetas
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-64 p-3 bg-slate-900 border-slate-800 z-50"
                          align="end"
                        >
                          <div className="space-y-4">
                            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                              {etiquetasGerais.length === 0 && (
                                <p className="text-xs text-slate-500 text-center py-2">
                                  Nenhuma etiqueta.
                                </p>
                              )}
                              {etiquetasGerais.map((tag) => (
                                <div
                                  key={tag.id}
                                  className="flex items-center space-x-2 cursor-pointer hover:bg-slate-800/50 p-1.5 rounded transition-colors"
                                  onClick={() => toggleEtiqueta(p.id, tag.id, p.etiquetas || [])}
                                >
                                  <Checkbox checked={(p.etiquetas || []).includes(tag.id)} />
                                  <Badge
                                    style={{
                                      backgroundColor: `${tag.cor}15`,
                                      color: tag.cor,
                                      borderColor: `${tag.cor}30`,
                                    }}
                                    variant="outline"
                                  >
                                    {tag.nome}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                            <div className="border-t border-slate-800 pt-3 space-y-3">
                              <Input
                                placeholder="Nova etiqueta... (Enter)"
                                className="h-8 text-xs bg-slate-950 border-slate-800"
                                onKeyDown={async (e) => {
                                  if (e.key === 'Enter') {
                                    const val = e.currentTarget.value.trim()
                                    if (!val) return
                                    const tag = await handleCreateTag(val, newTagColor)
                                    if (tag) {
                                      toggleEtiqueta(p.id, tag.id, p.etiquetas || [])
                                      e.currentTarget.value = ''
                                    }
                                  }
                                }}
                              />
                              <div className="flex flex-wrap gap-1">
                                {TAG_COLORS.map((c) => (
                                  <button
                                    key={c}
                                    className="w-5 h-5 rounded-full transition-transform hover:scale-110"
                                    style={{
                                      backgroundColor: c,
                                      boxShadow:
                                        newTagColor === c
                                          ? `0 0 0 2px #0f172a, 0 0 0 3px ${c}`
                                          : 'none',
                                    }}
                                    onClick={() => setNewTagColor(c)}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div>
                    <Textarea
                      value={p.observacoes || ''}
                      onChange={(e) => handleUpdate(p.id, 'observacoes', e.target.value)}
                      placeholder="Observações da consulta..."
                      className="min-h-[32px] h-[36px] text-sm py-1.5 px-3 bg-slate-900 border-slate-800 text-white focus-visible:ring-amber-500 resize-y"
                    />
                  </div>
                </div>

                <div className="flex items-start shrink-0 pt-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(p.id)}
                    className="w-8 h-8 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {index === procedimentos.length - 1 && (
                <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 opacity-0 group-hover/item:opacity-100 transition-opacity z-30">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-6 px-3 rounded-full text-[10px] shadow-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
                    onClick={() => handleAddProc(p.ordem + 1)}
                  >
                    <Plus className="w-3 h-3 mr-1" /> Inserir Abaixo
                  </Button>
                </div>
              )}
            </div>
          ))}

          {procedimentos.length === 0 && (
            <div className="text-center py-10 bg-slate-950 rounded-xl border border-dashed border-slate-800 mt-4">
              <p className="text-slate-500 mb-4 text-sm">Nenhum procedimento cadastrado.</p>
              <Button
                onClick={() => handleAddProc(0)}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold h-9"
              >
                <Plus className="w-4 h-4 mr-2" /> Iniciar Plano de Tratamento
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

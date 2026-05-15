import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Plus, GripVertical, Trash2, Tags, Info, Clock, Calendar } from 'lucide-react'
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { format, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useAuth } from '@/hooks/use-auth'

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

export function FETPatientDetail({
  patientId,
  onStatusChange,
}: {
  patientId: string
  onStatusChange?: () => void
}) {
  const { user, profile } = useAuth()
  const isAdmin = profile?.role === 'admin'
  const [patient, setPatient] = useState<any>(null)

  const [completionDialog, setCompletionDialog] = useState<{
    isOpen: boolean
    procId: string | null
    date: Date | undefined
  }>({
    isOpen: false,
    procId: null,
    date: new Date(),
  })
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
        .select(`*, concluido_por:usuarios(nome)`)
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

  const logFetAction = async (acao: string, detalhes: string) => {
    if (!user) return
    const { data: profile } = await supabase
      .from('usuarios')
      .select('id')
      .eq('id', user.id)
      .single()
    if (profile) {
      await supabase.from('fet_historico').insert({
        paciente_id: patientId,
        usuario_id: profile.id,
        acao,
        detalhes,
      })
    }
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

    const { data, error } = await supabase
      .from('fet_procedimentos')
      .insert([newProc])
      .select()
      .single()
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      await logFetAction('Novo Procedimento', `Adicionado: Novo Procedimento`)
      fetchData()
    }
  }

  const checkFinalizacao = async (updatedProcs: any[]) => {
    if (updatedProcs.length === 0) return
    const allConcluidos = updatedProcs.every((p) => p.concluido)

    if (allConcluidos && patient?.status !== 'finalizado') {
      await supabase.from('fet_pacientes').update({ status: 'finalizado' }).eq('id', patientId)
      await logFetAction('Tratamento Finalizado', `Todos os procedimentos foram concluídos`)
      toast({
        title: 'Tratamento Finalizado',
        description: 'Paciente movido para a aba de finalizados.',
      })
      if (onStatusChange) onStatusChange()
    } else if (!allConcluidos && patient?.status === 'finalizado') {
      await supabase.from('fet_pacientes').update({ status: 'ativo' }).eq('id', patientId)
      await logFetAction('Tratamento Reativado', `Tratamento voltou para status ativo`)
      if (onStatusChange) onStatusChange()
    }
  }

  const handleCheckStart = (id: string, checked: boolean) => {
    if (checked) {
      setCompletionDialog({ isOpen: true, procId: id, date: new Date() })
    } else {
      if (!isAdmin) {
        toast({
          title: 'Acesso Negado',
          description: 'Apenas administradores podem reabrir um procedimento.',
          variant: 'destructive',
        })
        return
      }
      handleConfirmCheck(id, false, null)
    }
  }

  const handleConfirmCheck = async (id: string, checked: boolean, date: Date | null) => {
    let concluido_em = null
    let concluido_por = null

    if (checked && user && date) {
      const now = new Date()
      date.setHours(now.getHours(), now.getMinutes(), now.getSeconds())
      concluido_em = date.toISOString()
      concluido_por = user.id
    }

    const procAtual = procedimentos.find((p) => p.id === id)

    setProcedimentos((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              concluido: checked,
              concluido_em,
              concluido_por: checked && profile ? { nome: profile.nome || 'Você' } : null,
            }
          : p,
      ),
    )

    const { error } = await supabase
      .from('fet_procedimentos')
      .update({ concluido: checked, concluido_em, concluido_por })
      .eq('id', id)

    if (!error) {
      await logFetAction(
        checked ? 'Procedimento Concluído' : 'Procedimento Reaberto',
        `Procedimento: ${procAtual?.procedimento}${checked && date ? ` em ${format(date, 'dd/MM/yyyy')}` : ''}`,
      )
      const newProcs = procedimentos.map((p) => (p.id === id ? { ...p, concluido: checked } : p))
      checkFinalizacao(newProcs)
    }

    setCompletionDialog({ isOpen: false, procId: null, date: undefined })
  }

  const handleUpdate = async (id: string, field: string, value: any) => {
    setProcedimentos((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
    await supabase
      .from('fet_procedimentos')
      .update({ [field]: value })
      .eq('id', id)
  }

  const handleDelete = async (id: string, nomeProc: string) => {
    await supabase.from('fet_procedimentos').delete().eq('id', id)
    const newProcs = procedimentos.filter((p) => p.id !== id)
    setProcedimentos(newProcs)
    await logFetAction('Procedimento Removido', `Procedimento excluído: ${nomeProc}`)
    checkFinalizacao(newProcs)
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

  const parseTime = (timeStr: string | null) => {
    if (!timeStr) return 0
    const lower = timeStr.toLowerCase()
    let mins = 0

    if (lower.includes(':')) {
      const [h, m] = lower.split(':')
      mins += (parseInt(h) || 0) * 60 + (parseInt(m) || 0)
      return mins
    }

    const hMatch = lower.match(/(\d+)\s*h/)
    const mMatch = lower.match(/(\d+)\s*m/)

    if (hMatch || mMatch) {
      if (hMatch) mins += parseInt(hMatch[1]) * 60
      if (mMatch) mins += parseInt(mMatch[1])
      return mins
    }

    const num = parseInt(lower.replace(/\D/g, ''))
    if (!isNaN(num)) {
      return num
    }
    return 0
  }

  const concluidos = procedimentos.filter((p) => p.concluido).length
  const total = procedimentos.length
  const progress = total === 0 ? 0 : Math.round((concluidos / total) * 100)

  const totalMins = procedimentos.reduce((acc, p) => acc + parseTime(p.tempo_execucao), 0)
  const totalHours = Math.floor(totalMins / 60)
  const remainingMins = totalMins % 60
  const totalTimeFormatted =
    totalHours > 0
      ? `${totalHours}h${remainingMins > 0 ? ` ${remainingMins}m` : ''}`
      : `${remainingMins}m`

  const diasDecorridos = patient.criado_em
    ? differenceInDays(new Date(), new Date(patient.criado_em))
    : 0

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
      <div className="p-3 border-b border-slate-800 bg-slate-950/50 flex flex-col gap-2 shrink-0">
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-white truncate pr-2">Evolução: {patient.nome}</h2>

          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-sm font-bold bg-slate-900/80 backdrop-blur-sm rounded-xl p-2.5 sm:p-3 border border-slate-700/50 shadow-lg shrink-0">
            <div className="flex flex-col px-2 sm:px-3 items-center">
              <span className="text-slate-400 text-[10px] md:text-xs uppercase tracking-wider mb-0.5">
                Consultas
              </span>
              <span className="text-white text-base md:text-xl leading-none">{total}</span>
            </div>
            <div className="w-px h-8 md:h-10 bg-slate-700/50"></div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col px-2 sm:px-3 items-center cursor-help">
                    <span className="text-slate-400 text-[10px] md:text-xs uppercase tracking-wider mb-0.5 flex items-center gap-1">
                      Tempo em Cadeira <Info className="w-3 h-3" />
                    </span>
                    <span className="text-white text-base md:text-xl leading-none">
                      {totalTimeFormatted}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-[200px] text-center bg-slate-800 border-slate-700">
                  <p>
                    Total de horas de procedimentos (tempo que o paciente de fato ficará na cadeira
                    do dentista).
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="w-px h-8 md:h-10 bg-slate-700/50"></div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col px-2 sm:px-3 items-center cursor-help">
                    <span className="text-slate-400 text-[10px] md:text-xs uppercase tracking-wider mb-0.5 flex items-center gap-1">
                      Tempo Decorrido <Clock className="w-3 h-3" />
                    </span>
                    <span className="text-sky-400 text-base md:text-xl leading-none">
                      {diasDecorridos} {diasDecorridos === 1 ? 'dia' : 'dias'}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-800 border-slate-700">
                  <p>Dias corridos desde o início do tratamento.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="w-px h-8 md:h-10 bg-slate-700/50"></div>
            <div className="flex flex-col px-2 sm:px-3 items-center">
              <span className="text-slate-400 text-[10px] md:text-xs uppercase tracking-wider mb-0.5">
                Executado
              </span>
              <span className="text-emerald-400 text-base md:text-xl leading-none">
                {progress}%
              </span>
            </div>
            <div className="w-px h-8 md:h-10 bg-slate-700/50"></div>
            <div className="flex flex-col px-2 sm:px-3 items-center">
              <span className="text-slate-400 text-[10px] md:text-xs uppercase tracking-wider mb-0.5">
                A Executar
              </span>
              <span className="text-amber-400 text-base md:text-xl leading-none">
                {total === 0 ? 0 : 100 - progress}%
              </span>
            </div>
          </div>
        </div>
        <Progress value={progress} className="h-1.5 bg-slate-800 [&>div]:bg-amber-500" />
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
                  'bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex gap-2.5 transition-all hover:border-slate-700',
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
                    onCheckedChange={(c) => handleCheckStart(p.id, !!c)}
                    disabled={!isAdmin && p.concluido}
                    className="w-4 h-4 border-slate-600 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 data-[state=checked]:text-slate-950 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="flex-1 flex flex-col gap-2 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
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
                    {p.criado_em && (
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                        <Calendar className="w-3 h-3" /> Adicionado em:{' '}
                        {format(new Date(p.criado_em), 'dd/MM/yyyy')}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
                    <div className="lg:col-span-5">
                      <Input
                        value={p.procedimento}
                        onChange={(e) => handleUpdate(p.id, 'procedimento', e.target.value)}
                        placeholder="Nome do Procedimento"
                        disabled={!isAdmin && p.concluido}
                        className="h-8 text-sm font-bold text-white placeholder:text-slate-400 placeholder:font-normal bg-slate-900 border-slate-800 focus-visible:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div className="lg:col-span-3">
                      <Select
                        value={p.dentista_id || 'none'}
                        onValueChange={(v) =>
                          handleUpdate(p.id, 'dentista_id', v === 'none' ? null : v)
                        }
                        disabled={!isAdmin && p.concluido}
                      >
                        <SelectTrigger className="h-8 text-sm font-bold bg-slate-900 border-slate-800 focus:ring-amber-500 text-white disabled:opacity-50 disabled:cursor-not-allowed">
                          <SelectValue placeholder="Dentista Executor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none" className="font-bold">
                            Não definido
                          </SelectItem>
                          {dentistas.map((d) => (
                            <SelectItem key={d.id} value={d.id} className="font-bold">
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
                        disabled={!isAdmin && p.concluido}
                        className="h-8 text-sm font-bold bg-slate-900 border-slate-800 text-white placeholder:text-slate-400 placeholder:font-normal focus-visible:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            disabled={!isAdmin && p.concluido}
                            className="h-8 w-full justify-start px-2 text-xs font-bold bg-slate-900 border-slate-800 text-white hover:text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      disabled={!isAdmin && p.concluido}
                      className="min-h-[32px] h-[36px] text-sm font-bold py-1.5 px-3 bg-slate-900 border-slate-800 text-white placeholder:text-slate-400 placeholder:font-normal focus-visible:ring-amber-500 resize-y disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  {p.concluido && p.concluido_em && (
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-400 bg-emerald-400/10 w-fit px-2 py-1 rounded border border-emerald-400/20 font-medium">
                      Concluído em{' '}
                      {format(new Date(p.concluido_em), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      {p.concluido_por?.nome && ` por ${p.concluido_por.nome}`}
                    </div>
                  )}
                </div>

                {isAdmin && (
                  <div className="flex items-start shrink-0 pt-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(p.id, p.procedimento)}
                      className="w-8 h-8 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
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

      <Dialog
        open={completionDialog.isOpen}
        onOpenChange={(open) =>
          !open && setCompletionDialog({ ...completionDialog, isOpen: false })
        }
      >
        <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Data de Execução</DialogTitle>
            <DialogDescription className="text-slate-400">
              Selecione a data em que este procedimento foi efetivamente executado/concluído.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center p-4">
            <CalendarComponent
              mode="single"
              selected={completionDialog.date}
              onSelect={(date) => date && setCompletionDialog({ ...completionDialog, date })}
              locale={ptBR}
              className="bg-slate-950 border border-slate-800 rounded-lg p-3"
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setCompletionDialog({ ...completionDialog, isOpen: false })}
              className="hover:bg-slate-800 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (completionDialog.procId && completionDialog.date) {
                  handleConfirmCheck(completionDialog.procId, true, completionDialog.date)
                }
              }}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

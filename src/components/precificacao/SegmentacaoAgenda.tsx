import { Fragment, useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Loader2, Plus, Trash2, Copy } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { ConfiguracaoGradeDialog, ConfigItem } from './ConfiguracaoGradeDialog'

const DIAS = [
  { id: 'segunda', label: 'Segunda' },
  { id: 'terca', label: 'Terça' },
  { id: 'quarta', label: 'Quarta' },
  { id: 'quinta', label: 'Quinta' },
  { id: 'sexta', label: 'Sexta' },
  { id: 'sabado', label: 'Sábado' },
]

const CONSULTORIOS = ['Consultório 1', 'Consultório 2', 'Consultório 3', 'Consultório 4']
const TURNOS = ['Manhã', 'Tarde']

const PRESET_COLORS = [
  {
    name: 'Nenhuma',
    class: 'bg-slate-800 border-slate-700 text-slate-300',
    textClass: 'text-slate-300',
    value: '',
  },
  {
    name: 'Azul',
    class: 'bg-blue-600 border-blue-500 text-white',
    textClass: 'text-blue-400',
    value: 'blue',
  },
  {
    name: 'Verde',
    class: 'bg-emerald-600 border-emerald-500 text-white',
    textClass: 'text-emerald-400',
    value: 'emerald',
  },
  {
    name: 'Roxo',
    class: 'bg-purple-600 border-purple-500 text-white',
    textClass: 'text-purple-400',
    value: 'purple',
  },
  {
    name: 'Laranja',
    class: 'bg-orange-600 border-orange-500 text-white',
    textClass: 'text-orange-400',
    value: 'orange',
  },
  {
    name: 'Rosa',
    class: 'bg-pink-600 border-pink-500 text-white',
    textClass: 'text-pink-400',
    value: 'pink',
  },
  {
    name: 'Amarelo',
    class: 'bg-amber-500 border-amber-400 text-slate-950',
    textClass: 'text-amber-400',
    value: 'amber',
  },
  {
    name: 'Ciano',
    class: 'bg-cyan-600 border-cyan-500 text-white',
    textClass: 'text-cyan-400',
    value: 'cyan',
  },
  {
    name: 'Vermelho',
    class: 'bg-red-600 border-red-500 text-white',
    textClass: 'text-red-400',
    value: 'red',
  },
  {
    name: 'Branco',
    class: 'bg-white border-slate-300 text-slate-900',
    textClass: 'text-white',
    value: 'white',
  },
]

type OcupacaoData = {
  consultorio: string
  turno: string
  dia_semana: string
  semana?: number
  especialidade: string | null
  dentista: string | null
  horas_trabalhadas: number | null
  capacidade_maxima: number | null
  cor: string | null
}

interface SegmentacaoAgendaProps {
  isConfigOpen?: boolean
  setIsConfigOpen?: (open: boolean) => void
}

export function SegmentacaoAgenda({
  isConfigOpen: externalIsConfigOpen,
  setIsConfigOpen: externalSetIsConfigOpen,
}: SegmentacaoAgendaProps) {
  const { toast } = useToast()
  const [data, setData] = useState<Record<string, OcupacaoData>>({})
  const [configItems, setConfigItems] = useState<ConfigItem[]>([])
  const [internalIsConfigOpen, setInternalIsConfigOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeWeek, setActiveWeek] = useState(1)
  const [editingCell, setEditingCell] = useState<{
    consultorio: string
    turno: string
    dia: string
    semana: number
  } | null>(null)
  const [form, setForm] = useState({
    especialidade: '',
    dentista: '',
    horas: '',
    capacidade: '',
    cor: '',
  })

  const isConfigOpen =
    externalIsConfigOpen !== undefined ? externalIsConfigOpen : internalIsConfigOpen
  const setIsConfigOpen = externalSetIsConfigOpen || setInternalIsConfigOpen

  const fetchConfig = async () => {
    const { data: configData, error } = await supabase
      .from('precificacao_ocupacao_config')
      .select('*')
      .order('nome')
    if (!error && configData) setConfigItems(configData as ConfigItem[])
  }

  const fetchData = async () => {
    try {
      const { data: records, error } = await supabase
        .from('precificacao_ocupacao_cadeiras' as any)
        .select('*')
      if (error) throw error

      const map: Record<string, OcupacaoData> = {}
      records?.forEach((r: any) => {
        map[`${r.consultorio}_${r.turno}_${r.dia_semana}_${r.semana || 1}`] = {
          ...r,
          capacidade_maxima: Number(r.capacidade_maxima) || 0,
        }
      })
      setData(map)
    } catch (err) {
      console.error(err)
      toast({ title: 'Erro ao carregar dados', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    fetchConfig()
  }, [])

  useEffect(() => {
    if (editingCell) {
      const existing =
        data[
          `${editingCell.consultorio}_${editingCell.turno}_${editingCell.dia}_${editingCell.semana}`
        ]
      setForm({
        especialidade: existing?.especialidade || '',
        dentista: existing?.dentista || '',
        horas: existing?.horas_trabalhadas?.toString() || '',
        capacidade: existing?.capacidade_maxima?.toString() || '',
        cor: existing?.cor || '',
      })
    }
  }, [editingCell, data])

  const especialidadesOptions = useMemo(() => {
    const opts = configItems.filter((i) => i.tipo === 'especialidade').map((i) => i.nome)
    if (form.especialidade && !opts.includes(form.especialidade)) opts.push(form.especialidade)
    return opts
  }, [configItems, form.especialidade])

  const dentistasOptions = useMemo(() => {
    const opts = configItems.filter((i) => i.tipo === 'dentista').map((i) => i.nome)
    if (form.dentista && !opts.includes(form.dentista)) opts.push(form.dentista)
    return opts
  }, [configItems, form.dentista])

  const handleSave = async () => {
    if (!editingCell) return
    setSaving(true)

    try {
      const { consultorio, turno, dia, semana } = editingCell
      const cap = Number(form.capacidade) || 0

      if (!form.especialidade && cap === 0) {
        await supabase
          .from('precificacao_ocupacao_cadeiras' as any)
          .delete()
          .match({ consultorio, turno, dia_semana: dia, semana })
      } else {
        await supabase.from('precificacao_ocupacao_cadeiras' as any).upsert(
          {
            consultorio,
            turno,
            dia_semana: dia,
            semana,
            especialidade: form.especialidade || null,
            dentista: form.dentista || null,
            horas_trabalhadas: Number(form.horas) || 0,
            capacidade_maxima: cap,
            cor: form.cor || null,
          },
          { onConflict: 'consultorio,turno,dia_semana,semana' } as any,
        )
      }

      toast({ title: 'Salvo com sucesso' })
      setEditingCell(null)
      fetchData()
    } catch (err) {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!editingCell) return
    setSaving(true)

    try {
      const { consultorio, turno, dia, semana } = editingCell
      await supabase
        .from('precificacao_ocupacao_cadeiras' as any)
        .delete()
        .match({ consultorio, turno, dia_semana: dia, semana })
      toast({ title: 'Removido com sucesso' })
      setEditingCell(null)
      fetchData()
    } catch (err) {
      toast({ title: 'Erro ao remover', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleReplicarSemana = async (targetWeeks: number[]) => {
    setSaving(true)
    try {
      const currentWeekData = Object.values(data).filter((d) => (d.semana || 1) === activeWeek)

      for (const targetWeek of targetWeeks) {
        await supabase
          .from('precificacao_ocupacao_cadeiras' as any)
          .delete()
          .match({ semana: targetWeek })

        if (currentWeekData.length > 0) {
          const newData = currentWeekData.map((d) => ({
            consultorio: d.consultorio,
            turno: d.turno,
            dia_semana: d.dia_semana,
            semana: targetWeek,
            especialidade: d.especialidade,
            dentista: d.dentista,
            horas_trabalhadas: d.horas_trabalhadas,
            capacidade_maxima: d.capacidade_maxima || 0,
            cor: d.cor,
          }))
          await supabase.from('precificacao_ocupacao_cadeiras' as any).insert(newData)
        }
      }

      toast({ title: 'Semana replicada com sucesso' })
      fetchData()
    } catch (err) {
      console.error(err)
      toast({ title: 'Erro ao replicar semana', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-4" />
        <p className="text-slate-400">Carregando segmentação...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
          {[1, 2, 3, 4].map((w) => (
            <button
              key={w}
              onClick={() => setActiveWeek(w)}
              className={cn(
                'px-4 py-1.5 text-sm font-medium rounded-md transition-all',
                activeWeek === w
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50',
              )}
            >
              Semana {w}
            </button>
          ))}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <Copy className="w-4 h-4 mr-2" />
              Replicar Semana {activeWeek}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-200">
            <DropdownMenuItem
              onClick={() => handleReplicarSemana([1, 2, 3, 4].filter((w) => w !== activeWeek))}
              className="focus:bg-slate-800 focus:text-white cursor-pointer font-medium"
            >
              Para todas as outras semanas
            </DropdownMenuItem>
            {[1, 2, 3, 4]
              .filter((w) => w !== activeWeek)
              .map((w) => (
                <DropdownMenuItem
                  key={w}
                  onClick={() => handleReplicarSemana([w])}
                  className="focus:bg-slate-800 focus:text-white cursor-pointer"
                >
                  Apenas para a Semana {w}
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table className="min-w-[900px] border-collapse">
            <TableHeader className="bg-slate-950/50">
              <TableRow>
                <TableHead className="w-[140px] font-semibold text-slate-300 border-r border-slate-800">
                  Consultório
                </TableHead>
                <TableHead className="w-[100px] font-semibold text-slate-300 border-r border-slate-800">
                  Turno
                </TableHead>
                {DIAS.map((d) => (
                  <TableHead
                    key={d.id}
                    className="text-center font-semibold text-slate-300 border-r border-slate-800"
                  >
                    {d.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {CONSULTORIOS.map((c, cIdx) => (
                <Fragment key={c}>
                  {TURNOS.map((t, tIdx) => (
                    <TableRow
                      key={`${c}-${t}`}
                      className="hover:bg-transparent border-b border-slate-800"
                    >
                      {tIdx === 0 && (
                        <TableCell
                          rowSpan={2}
                          className="align-middle border-r border-slate-800 font-medium text-slate-200 bg-slate-950/20"
                        >
                          {c}
                        </TableCell>
                      )}
                      <TableCell className="border-r border-slate-800 text-slate-400 font-medium bg-slate-950/20">
                        {t}
                      </TableCell>
                      {DIAS.map((d) => {
                        const cellData = data[`${c}_${t}_${d.id}_${activeWeek}`]
                        const colorObj =
                          PRESET_COLORS.find((pc) => pc.value === cellData?.cor) || PRESET_COLORS[0]
                        const hasEspecialidade = !!cellData?.especialidade
                        const hasCapacidade = cellData?.capacidade_maxima
                          ? cellData.capacidade_maxima > 0
                          : false

                        return (
                          <TableCell
                            key={d.id}
                            className="p-1.5 border-r border-slate-800 align-top min-w-[140px]"
                          >
                            <div
                              onClick={() =>
                                setEditingCell({
                                  consultorio: c,
                                  turno: t,
                                  dia: d.id,
                                  semana: activeWeek,
                                })
                              }
                              className={cn(
                                'p-2 rounded-md border text-xs min-h-[85px] flex flex-col items-start justify-start cursor-pointer transition-all hover:scale-[1.02]',
                                hasEspecialidade || hasCapacidade
                                  ? 'bg-slate-800 border-slate-700'
                                  : 'bg-slate-800/20 border-slate-700/50 border-dashed hover:bg-slate-800/60',
                              )}
                            >
                              {hasEspecialidade ? (
                                <>
                                  <span
                                    className={cn('font-bold truncate w-full', colorObj.textClass)}
                                    title={cellData.especialidade!}
                                  >
                                    {cellData.especialidade}
                                  </span>
                                  <span
                                    className={cn(
                                      'opacity-90 truncate w-full mt-0.5 font-bold',
                                      colorObj.textClass,
                                    )}
                                    title={cellData.dentista || ''}
                                  >
                                    {cellData.dentista}
                                  </span>
                                  <span className="mt-auto pt-2 text-[10px] opacity-80 font-medium text-slate-400 whitespace-nowrap">
                                    Trab: {cellData.horas_trabalhadas}h | Cap:{' '}
                                    {cellData.capacidade_maxima}h
                                  </span>
                                </>
                              ) : hasCapacidade ? (
                                <div className="w-full h-full min-h-[60px] flex flex-col items-center justify-center opacity-70 hover:opacity-100 text-slate-400">
                                  <span className="text-[10px] uppercase font-semibold">Livre</span>
                                  <span className="text-xs font-bold mt-1 text-slate-300">
                                    Cap: {cellData.capacidade_maxima}h
                                  </span>
                                </div>
                              ) : (
                                <div className="w-full h-full min-h-[60px] flex items-center justify-center opacity-0 hover:opacity-100 text-slate-500">
                                  <Plus className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  ))}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={!!editingCell} onOpenChange={(open) => !open && setEditingCell(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-200 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Ocupação - Semana {editingCell?.semana}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className="text-slate-300">Especialidade</Label>
              <Select
                value={form.especialidade || undefined}
                onValueChange={(val) => setForm((f) => ({ ...f, especialidade: val }))}
              >
                <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                  <SelectValue placeholder="Selecione uma especialidade (opcional)" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-200 max-h-[250px]">
                  {especialidadesOptions.map((nome) => (
                    <SelectItem
                      key={nome}
                      value={nome}
                      className="focus:bg-slate-800 focus:text-white"
                    >
                      {nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="text-slate-300">Dentista</Label>
              <Select
                value={form.dentista || undefined}
                onValueChange={(val) => setForm((f) => ({ ...f, dentista: val }))}
              >
                <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                  <SelectValue placeholder="Selecione um dentista (opcional)" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-200 max-h-[250px]">
                  {dentistasOptions.map((nome) => (
                    <SelectItem
                      key={nome}
                      value={nome}
                      className="focus:bg-slate-800 focus:text-white"
                    >
                      {nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-slate-300">Horas Trabalhadas</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={form.horas}
                  onChange={(e) => setForm((f) => ({ ...f, horas: e.target.value }))}
                  placeholder="Ex: 4"
                  className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-slate-300">Capacidade Máxima</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={form.capacidade}
                  onChange={(e) => setForm((f) => ({ ...f, capacidade: e.target.value }))}
                  placeholder="Ex: 4"
                  className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="text-slate-300">Cor de Identificação</Label>
              <div className="flex flex-wrap gap-3 mt-1">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    title={c.name}
                    onClick={() => setForm((f) => ({ ...f, cor: c.value }))}
                    className={cn(
                      'w-8 h-8 rounded-md border-2 transition-all',
                      c.class,
                      form.cor === c.value
                        ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-slate-900 scale-110'
                        : 'opacity-80 hover:opacity-100',
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between w-full">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={saving}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Limpar
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingCell(null)}
                disabled={saving}
                className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={saving || (!form.especialidade && !form.capacidade)}
                className="bg-amber-500 text-slate-950 hover:bg-amber-600"
              >
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Salvar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfiguracaoGradeDialog
        open={isConfigOpen}
        onOpenChange={setIsConfigOpen}
        items={configItems}
        onRefresh={fetchConfig}
      />
    </div>
  )
}

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { addDays, format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

const DIAS_SEMANA = [
  { label: 'D', value: 0 },
  { label: 'S', value: 1 },
  { label: 'T', value: 2 },
  { label: 'Q', value: 3 },
  { label: 'Q', value: 4 },
  { label: 'S', value: 5 },
  { label: 'S', value: 6 },
]

export function AusenciaTemporariaDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [tipo, setTipo] = useState<'unico' | 'periodo' | 'recorrente'>('unico')
  const [recorrencia, setRecorrencia] = useState<'semanal' | 'mensal'>('semanal')
  const [dataUnica, setDataUnica] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [horaInicio, setHoraInicio] = useState('')
  const [horaFim, setHoraFim] = useState('')
  const [diasSemana, setDiasSemana] = useState<number[]>([])
  const [diaMes, setDiaMes] = useState('')
  const [dataFimRecorrencia, setDataFimRecorrencia] = useState('')
  const [usuarioId, setUsuarioId] = useState('todos')
  const [descricao, setDescricao] = useState('')

  useEffect(() => {
    if (open) {
      loadUsuarios()
      resetForm()
    }
  }, [open])

  const resetForm = () => {
    setTipo('unico')
    setRecorrencia('semanal')
    setDataUnica('')
    setDataInicio('')
    setDataFim('')
    setHoraInicio('')
    setHoraFim('')
    setDiasSemana([])
    setDiaMes('')
    setDataFimRecorrencia('')
    setUsuarioId('todos')
    setDescricao('')
  }

  const loadUsuarios = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('usuarios')
      .select('id, nome')
      .eq('status', 'ativo')
      .order('nome')
    if (data) setUsuarios(data)
    setLoading(false)
  }

  const handleSave = async () => {
    if (!descricao) {
      toast.error('Informe o motivo da ausência.')
      return
    }

    if (tipo === 'unico' && !dataUnica) {
      toast.error('Informe a data.')
      return
    }

    if (tipo === 'periodo' && (!dataInicio || !dataFim)) {
      toast.error('Informe o período completo.')
      return
    }

    if (tipo === 'recorrente') {
      if (!dataInicio) {
        toast.error('Informe a data de início da recorrência.')
        return
      }
      if (recorrencia === 'semanal' && diasSemana.length === 0) {
        toast.error('Selecione pelo menos um dia da semana.')
        return
      }
      if (recorrencia === 'mensal' && (!diaMes || parseInt(diaMes) < 1 || parseInt(diaMes) > 31)) {
        toast.error('Informe um dia do mês válido (1-31).')
        return
      }
    }

    if ((horaInicio && !horaFim) || (!horaInicio && horaFim)) {
      toast.error('Informe a hora de início e de fim, ou deixe ambas vazias para dia inteiro.')
      return
    }

    setSaving(true)
    try {
      const baseAbsence = {
        descricao,
        tipo: 'ausencia',
        usuario_id: usuarioId === 'todos' ? null : usuarioId,
        hora_inicio: horaInicio || null,
        hora_fim: horaFim || null,
        recorrencia: 'nenhuma',
      }

      const inserts: any[] = []

      if (tipo === 'unico') {
        inserts.push({ ...baseAbsence, data: dataUnica })
      } else if (tipo === 'periodo') {
        let current = parseISO(dataInicio)
        const end = parseISO(dataFim)
        if (current > end) {
          toast.error('A data final deve ser posterior à inicial.')
          setSaving(false)
          return
        }
        while (current <= end) {
          inserts.push({ ...baseAbsence, data: format(current, 'yyyy-MM-dd') })
          current = addDays(current, 1)
        }
      } else if (tipo === 'recorrente') {
        inserts.push({
          ...baseAbsence,
          data: dataInicio,
          data_fim: dataFimRecorrencia || null,
          recorrencia,
          dias_semana: recorrencia === 'semanal' ? diasSemana : null,
          dia_mes: recorrencia === 'mensal' ? parseInt(diaMes) : null,
        })
      }

      const { error } = await supabase.from('ausencias').insert(inserts)
      if (error) throw error

      toast.success('Ausência(s) registrada(s) com sucesso!')
      onOpenChange(false)
    } catch (e: any) {
      toast.error('Erro ao salvar: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  const toggleDiaSemana = (val: number) => {
    setDiasSemana((prev) => (prev.includes(val) ? prev.filter((d) => d !== val) : [...prev, val]))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Ausência Temporária</DialogTitle>
          <DialogDescription>
            Bloqueie a agenda e as rotinas para folgas, estágios ou compromissos.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto px-1">
            <div className="space-y-2">
              <Label>Colaborador</Label>
              <Select value={usuarioId} onValueChange={setUsuarioId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos (Feriado/Recesso Global)</SelectItem>
                  {usuarios.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Registro</Label>
              <Select value={tipo} onValueChange={(v: any) => setTipo(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unico">Dia Único</SelectItem>
                  <SelectItem value="periodo">Período Contínuo (Vários Dias)</SelectItem>
                  <SelectItem value="recorrente">Recorrente (Estágios/Fixo)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {tipo === 'recorrente' && (
              <div className="space-y-4 p-4 bg-muted/30 border border-border/50 rounded-lg">
                <div className="space-y-2">
                  <Label>Frequência</Label>
                  <Select value={recorrencia} onValueChange={(v: any) => setRecorrencia(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semanal">Semanal</SelectItem>
                      <SelectItem value="mensal">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {recorrencia === 'semanal' ? (
                  <div className="space-y-2">
                    <Label>Dias da Semana</Label>
                    <div className="flex gap-2">
                      {DIAS_SEMANA.map((dia) => (
                        <Button
                          key={dia.value}
                          type="button"
                          variant={diasSemana.includes(dia.value) ? 'default' : 'outline'}
                          className="w-10 h-10 p-0 font-bold"
                          onClick={() => toggleDiaSemana(dia.value)}
                        >
                          {dia.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Dia do Mês (1-31)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={31}
                      value={diaMes}
                      onChange={(e) => setDiaMes(e.target.value)}
                      placeholder="Ex: 15"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>A partir de</Label>
                    <Input
                      type="date"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Até (Opcional)</Label>
                    <Input
                      type="date"
                      value={dataFimRecorrencia}
                      onChange={(e) => setDataFimRecorrencia(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {tipo === 'unico' && (
              <div className="space-y-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={dataUnica}
                  onChange={(e) => setDataUnica(e.target.value)}
                />
              </div>
            )}

            {tipo === 'periodo' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>De</Label>
                  <Input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Até</Label>
                  <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
                </div>
              </div>
            )}

            {tipo !== 'periodo' && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label>Hora Início (Opcional)</Label>
                  <Input
                    type="time"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hora Fim (Opcional)</Label>
                  <Input type="time" value={horaFim} onChange={(e) => setHoraFim(e.target.value)} />
                </div>
                <div className="col-span-2 text-xs text-muted-foreground mt-[-4px]">
                  Deixe vazio para bloquear o dia inteiro.
                </div>
              </div>
            )}

            <div className="space-y-2 pt-2">
              <Label>Motivo / Descrição</Label>
              <Input
                placeholder="Ex: Férias, Folga, Estágio..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar Ausência
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

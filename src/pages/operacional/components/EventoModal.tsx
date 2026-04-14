import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Evento, TipoEvento } from '../data/mock-eventos'

interface EventoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (e: Evento) => void
  evento: Evento | null
}

const TIPOS: TipoEvento[] = [
  'Consulta',
  'Viagem Pessoal',
  'Viagem a Trabalho',
  'Reunião',
  'Congresso',
  'Folga/Férias',
  'Treinamento',
  'Atendimento Externo',
]
const COLABORADORES = [
  'Dr. Leandro Linhares',
  'Dra. Amanda Silva',
  'Carlos Eduardo (CRC)',
  'Dra. Beatriz',
  'Marcos (Financeiro)',
  'Dra. Juliana',
]

export function EventoModal({ isOpen, onClose, onSave, evento }: EventoModalProps) {
  const [colaborador, setColaborador] = useState('')
  const [tipo, setTipo] = useState<TipoEvento>('Reunião')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [diaInteiro, setDiaInteiro] = useState(true)
  const [horaInicio, setHoraInicio] = useState('')
  const [horaFim, setHoraFim] = useState('')
  const [descricao, setDescricao] = useState('')

  useEffect(() => {
    if (evento && isOpen) {
      setColaborador(evento.colaborador)
      setTipo(evento.tipo)
      setDataInicio(evento.dataInicio.split('T')[0])
      setDataFim(evento.dataFim.split('T')[0])
      setDiaInteiro(evento.diaInteiro)
      setHoraInicio(evento.horaInicio || '')
      setHoraFim(evento.horaFim || '')
      setDescricao(evento.descricao)
    } else if (isOpen) {
      const today = new Date().toISOString().split('T')[0]
      setColaborador('')
      setTipo('Reunião')
      setDataInicio(today)
      setDataFim(today)
      setDiaInteiro(true)
      setHoraInicio('')
      setHoraFim('')
      setDescricao('')
    }
  }, [evento, isOpen])

  const handleSave = () => {
    if (!colaborador || !dataInicio || !dataFim) return
    onSave({
      id: evento?.id || '',
      colaborador,
      tipo,
      dataInicio: new Date(dataInicio + 'T12:00:00').toISOString(),
      dataFim: new Date(dataFim + 'T12:00:00').toISOString(),
      diaInteiro,
      horaInicio: diaInteiro ? undefined : horaInicio,
      horaFim: diaInteiro ? undefined : horaFim,
      descricao,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {evento ? 'Editar Compromisso' : 'Novo Compromisso'}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-5 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Colaborador</Label>
              <Select value={colaborador} onValueChange={setColaborador}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {COLABORADORES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo de Compromisso</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as TipoEvento)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data Início</Label>
              <Input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label>Data Fim</Label>
              <Input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          <div className="flex items-center justify-between p-4 border rounded-xl bg-slate-50/50 shadow-sm">
            <div className="space-y-1">
              <Label className="text-base">Dia Inteiro</Label>
              <p className="text-sm text-slate-500">Compromisso dura o dia todo</p>
            </div>
            <Switch checked={diaInteiro} onCheckedChange={setDiaInteiro} />
          </div>
          {!diaInteiro && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-2">
                <Label>Hora Início</Label>
                <Input
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Hora Fim</Label>
                <Input type="time" value={horaFim} onChange={(e) => setHoraFim(e.target.value)} />
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label>Detalhes Adicionais</Label>
            <Textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva os detalhes do evento..."
              className="resize-none h-24"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-full px-6">
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8 shadow-sm"
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

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

interface EventoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (e: any) => void
  evento: any | null
  usuarios: { id: string; nome: string }[]
}

const TIPOS_OPCOES = [
  { value: 'consulta', label: 'Consulta' },
  { value: 'viagem_pessoal', label: 'Viagem Pessoal' },
  { value: 'viagem_trabalho', label: 'Viagem a Trabalho' },
  { value: 'reuniao', label: 'Reunião' },
  { value: 'congresso', label: 'Congresso' },
  { value: 'folga_ferias', label: 'Folga/Férias' },
  { value: 'treinamento', label: 'Treinamento' },
  { value: 'atendimento_externo', label: 'Atendimento Externo' },
]

export function EventoModal({ isOpen, onClose, onSave, evento, usuarios }: EventoModalProps) {
  const [usuarioId, setUsuarioId] = useState('')
  const [tipo, setTipo] = useState('reuniao')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [diaInteiro, setDiaInteiro] = useState(true)
  const [horaInicio, setHoraInicio] = useState('')
  const [horaFim, setHoraFim] = useState('')
  const [descricao, setDescricao] = useState('')

  useEffect(() => {
    if (evento && isOpen) {
      setUsuarioId(evento.usuario_id)
      setTipo(evento.tipo_compromisso)
      setDataInicio(evento.data_inicio)
      setDataFim(evento.data_fim)
      setDiaInteiro(evento.eh_dia_inteiro)
      setHoraInicio(evento.hora_inicio ? evento.hora_inicio.substring(0, 5) : '')
      setHoraFim(evento.hora_fim ? evento.hora_fim.substring(0, 5) : '')
      setDescricao(evento.descricao || '')
    } else if (isOpen) {
      const today = new Date()
      const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
        .toISOString()
        .split('T')[0]
      setUsuarioId('')
      setTipo('reuniao')
      setDataInicio(localDate)
      setDataFim(localDate)
      setDiaInteiro(true)
      setHoraInicio('')
      setHoraFim('')
      setDescricao('')
    }
  }, [evento, isOpen])

  const handleDataInicioChange = (val: string) => {
    setDataInicio(val)
    if (!dataFim || val > dataFim) {
      setDataFim(val)
    }
  }

  const handleDataFimChange = (val: string) => {
    setDataFim(val)
    if (dataInicio && val < dataInicio) {
      setDataInicio(val)
    }
  }

  const handleSave = () => {
    if (!usuarioId || !dataInicio || !dataFim) return
    onSave({
      usuario_id: usuarioId,
      tipo_compromisso: tipo,
      data_inicio: dataInicio,
      data_fim: dataFim,
      eh_dia_inteiro: diaInteiro,
      hora_inicio: diaInteiro ? null : horaInicio || null,
      hora_fim: diaInteiro ? null : horaFim || null,
      descricao,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {evento && evento.id ? 'Editar Compromisso' : 'Novo Compromisso'}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-5 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Colaborador</Label>
              <Select value={usuarioId} onValueChange={setUsuarioId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {usuarios.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo de Compromisso</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_OPCOES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
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
                onChange={(e) => handleDataInicioChange(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label>Data Fim</Label>
              <Input
                type="date"
                value={dataFim}
                onChange={(e) => handleDataFimChange(e.target.value)}
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
            disabled={!usuarioId || !dataInicio || !dataFim}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8 shadow-sm"
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

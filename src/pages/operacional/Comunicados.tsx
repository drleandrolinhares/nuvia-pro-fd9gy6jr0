import { useState, useMemo } from 'react'
import { format, parseISO, startOfDay, endOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Archive } from 'lucide-react'
import { Evento, MOCK_EVENTOS } from './data/mock-eventos'
import { EventoCard } from './components/EventoCard'
import { EventoModal } from './components/EventoModal'

type FilterTab = 'periodo' | 'usuario' | 'todos' | 'arquivados'

export default function Comunicados() {
  const [eventos, setEventos] = useState<Evento[]>(MOCK_EVENTOS)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [eventoEditando, setEventoEditando] = useState<Evento | null>(null)

  const [activeTab, setActiveTab] = useState<FilterTab>('periodo')
  const [selectedUser, setSelectedUser] = useState<string>('todos')

  const handleAdd = () => {
    setEventoEditando(null)
    setIsModalOpen(true)
  }

  const handleEdit = (evento: Evento) => {
    setEventoEditando(evento)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    setEventos((prev) => prev.filter((e) => e.id !== id))
  }

  const handleSave = (evento: Evento) => {
    if (eventoEditando) {
      setEventos((prev) => prev.map((e) => (e.id === evento.id ? evento : e)))
    } else {
      setEventos((prev) => [{ ...evento, id: Math.random().toString() }, ...prev])
    }
    setIsModalOpen(false)
  }

  const colaboradores = useMemo(() => {
    return Array.from(new Set(eventos.map((e) => e.colaborador))).sort()
  }, [eventos])

  const eventosFiltrados = useMemo(() => {
    const today = startOfDay(new Date())

    const isActiveTabArquivados = activeTab === 'arquivados'
    const baseEvents = eventos.filter((e) => {
      const end = startOfDay(parseISO(e.dataFim))
      if (isActiveTabArquivados) return end < today
      return end >= today
    })

    const expanded: (Evento & { dataInstancia: Date })[] = []
    baseEvents.forEach((ev) => {
      let curr = startOfDay(parseISO(ev.dataInicio))
      const end = startOfDay(parseISO(ev.dataFim))
      if (curr > end) {
        expanded.push({ ...ev, dataInstancia: curr })
      } else {
        while (curr <= end) {
          expanded.push({ ...ev, dataInstancia: new Date(curr) })
          curr.setDate(curr.getDate() + 1)
        }
      }
    })

    let filtered = expanded

    if (activeTab === 'periodo' && selectedDate) {
      filtered = filtered.filter((e) => {
        return (
          e.dataInstancia.getMonth() === selectedDate.getMonth() &&
          e.dataInstancia.getFullYear() === selectedDate.getFullYear()
        )
      })
    } else if (activeTab === 'usuario' && selectedUser !== 'todos') {
      filtered = filtered.filter((e) => e.colaborador === selectedUser)
    }

    return filtered.sort((a, b) => {
      const diff = a.dataInstancia.getTime() - b.dataInstancia.getTime()
      if (diff !== 0) return diff
      const timeA = a.horaInicio || '00:00'
      const timeB = b.horaInicio || '00:00'
      return timeA.localeCompare(timeB)
    })
  }, [eventos, selectedDate, activeTab, selectedUser])

  const eventDates = useMemo(() => {
    const dates: Date[] = []
    eventos.forEach((e) => {
      let curr = startOfDay(parseISO(e.dataInicio))
      const end = endOfDay(parseISO(e.dataFim))
      while (curr <= end) {
        dates.push(new Date(curr))
        curr.setDate(curr.getDate() + 1)
      }
    })
    return dates
  }, [eventos])

  return (
    <div className="flex h-full bg-slate-50/50">
      <div className="w-[360px] border-r bg-white p-6 overflow-y-auto shadow-sm z-10 hidden md:block">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Calendário</h2>
        <div className="border rounded-xl p-2 bg-slate-50/50 shadow-sm">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              setSelectedDate(date || new Date())
              setActiveTab('periodo')
            }}
            locale={ptBR}
            captionLayout="dropdown"
            fromYear={2020}
            toYear={2030}
            modifiers={{ hasEvent: eventDates }}
            modifiersClassNames={{
              hasEvent:
                'underline decoration-amber-500 underline-offset-4 decoration-2 font-bold text-slate-900',
            }}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col relative overflow-hidden">
        <div className="p-6 border-b bg-white shadow-sm z-10 flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-slate-800">
            Feed de Compromissos
            {activeTab === 'periodo' && selectedDate && (
              <span className="text-slate-500 font-medium ml-3 text-lg">
                - {format(selectedDate, 'MMMM yyyy', { locale: ptBR })}
              </span>
            )}
          </h2>

          <div className="flex flex-wrap items-center gap-4">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FilterTab)}>
              <TabsList>
                <TabsTrigger value="periodo">Por Período</TabsTrigger>
                <TabsTrigger value="usuario">Por Usuário</TabsTrigger>
                <TabsTrigger value="todos">Todos</TabsTrigger>
                <TabsTrigger value="arquivados" className="flex items-center gap-1.5">
                  <Archive className="w-3.5 h-3.5" />
                  Arquivados
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {activeTab === 'usuario' && (
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className="w-[280px] bg-white">
                  <SelectValue placeholder="Selecione um colaborador" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os colaboradores</SelectItem>
                  {colaboradores.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-4 pb-24">
            {eventosFiltrados.length === 0 ? (
              <div className="text-center text-slate-500 mt-20 p-8 border-2 border-dashed rounded-xl bg-white">
                <p className="text-lg font-medium">Nenhum compromisso encontrado.</p>
                <p className="text-sm mt-1">Ajuste os filtros ou adicione um novo compromisso.</p>
              </div>
            ) : (
              eventosFiltrados.map((ev, i) => (
                <EventoCard
                  key={`${ev.id}-${ev.dataInstancia.getTime()}`}
                  evento={ev}
                  index={i}
                  dataInstancia={ev.dataInstancia}
                  isArquivado={activeTab === 'arquivados'}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </ScrollArea>

        <Button
          onClick={handleAdd}
          className="absolute bottom-8 right-8 h-16 w-16 rounded-full bg-emerald-600 hover:bg-emerald-700 shadow-xl transition-transform hover:scale-105"
          size="icon"
        >
          <Plus className="w-8 h-8 text-white" />
        </Button>
      </div>

      <EventoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        evento={eventoEditando}
      />
    </div>
  )
}

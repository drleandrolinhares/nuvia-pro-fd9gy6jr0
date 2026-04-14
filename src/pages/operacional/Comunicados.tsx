import { useState, useMemo } from 'react'
import { format, parseISO, startOfDay, endOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus } from 'lucide-react'
import { Evento, MOCK_EVENTOS } from './data/mock-eventos'
import { EventoCard } from './components/EventoCard'
import { EventoModal } from './components/EventoModal'

export default function Comunicados() {
  const [eventos, setEventos] = useState<Evento[]>(MOCK_EVENTOS)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [eventoEditando, setEventoEditando] = useState<Evento | null>(null)

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

  const eventosFiltrados = useMemo(() => {
    if (!selectedDate) return eventos
    return eventos
      .filter((e) => {
        const evDate = parseISO(e.dataInicio)
        return (
          evDate.getMonth() === selectedDate.getMonth() &&
          evDate.getFullYear() === selectedDate.getFullYear()
        )
      })
      .sort((a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime())
  }, [eventos, selectedDate])

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
            onSelect={setSelectedDate}
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
        <div className="p-6 border-b bg-white shadow-sm z-10 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">
            Feed de Compromissos
            {selectedDate && (
              <span className="text-slate-500 font-medium ml-3 text-lg">
                - {format(selectedDate, 'MMMM yyyy', { locale: ptBR })}
              </span>
            )}
          </h2>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-4 pb-24">
            {eventosFiltrados.length === 0 ? (
              <div className="text-center text-slate-500 mt-20 p-8 border-2 border-dashed rounded-xl bg-white">
                <p className="text-lg font-medium">Nenhum compromisso encontrado para este mês.</p>
                <p className="text-sm mt-1">Selecione outro mês ou adicione um novo compromisso.</p>
              </div>
            ) : (
              eventosFiltrados.map((ev, i) => (
                <EventoCard
                  key={ev.id}
                  evento={ev}
                  index={i}
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

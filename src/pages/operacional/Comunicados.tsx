import { useState, useMemo, useEffect } from 'react'
import { format, startOfDay, endOfDay } from 'date-fns'
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
import { Plus, Archive, Loader2 } from 'lucide-react'
import { EventoCard } from './components/EventoCard'
import { EventoModal } from './components/EventoModal'
import {
  getCompromissos,
  createCompromisso,
  updateCompromisso,
  deleteCompromisso,
  Compromisso,
  getUsuarios,
} from '@/services/compromissos'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/use-auth'

type FilterTab = 'periodo' | 'usuario' | 'todos' | 'arquivados'

export default function Comunicados() {
  const [eventos, setEventos] = useState<Compromisso[]>([])
  const [usuarios, setUsuarios] = useState<{ id: string; nome: string }[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [eventoEditando, setEventoEditando] = useState<Compromisso | null>(null)
  const [loading, setLoading] = useState(true)

  const [activeTab, setActiveTab] = useState<FilterTab>('periodo')
  const [selectedUser, setSelectedUser] = useState<string>('todos')

  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [comps, usersData] = await Promise.all([getCompromissos(), getUsuarios()])
      setEventos(comps)
      setUsuarios(usersData || [])
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEventoEditando(null)
    setIsModalOpen(true)
  }

  const handleEdit = (evento: Compromisso) => {
    setEventoEditando(evento)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteCompromisso(id)
      setEventos((prev) => prev.filter((e) => e.id !== id))
      toast({ title: 'Sucesso', description: 'Compromisso removido.' })
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    }
  }

  const handleSave = async (eventoData: any) => {
    try {
      if (eventoEditando) {
        const updated = await updateCompromisso(eventoEditando.id, eventoData)
        const userObj = usuarios.find((u) => u.id === updated.usuario_id)
        setEventos((prev) =>
          prev.map((e) => (e.id === eventoEditando.id ? { ...updated, usuario: userObj } : e)),
        )
        toast({ title: 'Sucesso', description: 'Compromisso atualizado.' })
      } else {
        const created = await createCompromisso({ ...eventoData, arquivado: false })
        const userObj = usuarios.find((u) => u.id === created.usuario_id)
        setEventos((prev) => [...prev, { ...created, usuario: userObj }])
        toast({ title: 'Sucesso', description: 'Compromisso criado.' })
      }
      setIsModalOpen(false)
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    }
  }

  const eventosFiltrados = useMemo(() => {
    const today = startOfDay(new Date())

    const isActiveTabArquivados = activeTab === 'arquivados'
    const baseEvents = eventos.filter((e) => {
      const end = startOfDay(new Date(e.data_fim + 'T12:00:00'))
      if (isActiveTabArquivados) return end < today
      return end >= today
    })

    const expanded: (Compromisso & { dataInstancia: Date })[] = []
    baseEvents.forEach((ev) => {
      let curr = startOfDay(new Date(ev.data_inicio + 'T12:00:00'))
      const end = startOfDay(new Date(ev.data_fim + 'T12:00:00'))
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
      filtered = filtered.filter((e) => e.usuario_id === selectedUser)
    }

    return filtered.sort((a, b) => {
      const diff = a.dataInstancia.getTime() - b.dataInstancia.getTime()
      if (diff !== 0) return diff
      const timeA = a.hora_inicio || '00:00'
      const timeB = b.hora_inicio || '00:00'
      return timeA.localeCompare(timeB)
    })
  }, [eventos, selectedDate, activeTab, selectedUser])

  const eventDates = useMemo(() => {
    const dates: Date[] = []
    eventos.forEach((e) => {
      let curr = startOfDay(new Date(e.data_inicio + 'T12:00:00'))
      const end = endOfDay(new Date(e.data_fim + 'T12:00:00'))
      while (curr <= end) {
        dates.push(new Date(curr))
        curr.setDate(curr.getDate() + 1)
      }
    })
    return dates
  }, [eventos])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50/50">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="flex h-full bg-slate-50/50">
      <div className="hidden w-[360px] overflow-y-auto border-r bg-white p-6 shadow-sm z-10 md:block">
        <h2 className="mb-6 text-xl font-bold text-slate-800">Calendário</h2>
        <div className="rounded-xl border bg-slate-50/50 p-2 shadow-sm">
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

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div className="z-10 flex flex-col gap-4 border-b bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-800">
            Feed de Compromissos
            {activeTab === 'periodo' && selectedDate && (
              <span className="ml-3 text-lg font-medium text-slate-500">
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
                  <Archive className="h-3.5 w-3.5" />
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
                  {usuarios.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="mx-auto max-w-4xl space-y-4 pb-24">
            {eventosFiltrados.length === 0 ? (
              <div className="mt-20 rounded-xl border-2 border-dashed bg-white p-8 text-center text-slate-500">
                <p className="text-lg font-medium">Nenhum compromisso encontrado.</p>
                <p className="mt-1 text-sm">Ajuste os filtros ou adicione um novo compromisso.</p>
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
          className="absolute bottom-8 right-8 h-16 w-16 rounded-full bg-emerald-600 shadow-xl transition-transform hover:scale-105 hover:bg-emerald-700"
          size="icon"
        >
          <Plus className="h-8 w-8 text-white" />
        </Button>
      </div>

      <EventoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        evento={eventoEditando}
        usuarios={usuarios}
      />
    </div>
  )
}

import { useState, useMemo, useEffect } from 'react'
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { DateRange } from 'react-day-picker'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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

export default function Compromissos() {
  const [eventos, setEventos] = useState<Compromisso[]>([])
  const [usuarios, setUsuarios] = useState<{ id: string; nome: string }[]>([])
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [eventoEditando, setEventoEditando] = useState<Compromisso | null>(null)
  const [loading, setLoading] = useState(true)

  const [activeTab, setActiveTab] = useState<FilterTab>('todos')
  const [selectedUser, setSelectedUser] = useState<string>('todos')

  const { toast } = useToast()
  const { user, profile, permissions = [] } = useAuth() as any

  const [eventoParaDeletar, setEventoParaDeletar] = useState<string | null>(null)

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

  const handleDuplicate = (evento: Compromisso) => {
    setEventoEditando({ ...evento, id: '' })
    setIsModalOpen(true)
  }

  const handleDeleteClick = (id: string) => {
    setEventoParaDeletar(id)
  }

  const confirmDelete = async () => {
    if (!eventoParaDeletar) return
    try {
      await deleteCompromisso(eventoParaDeletar)
      setEventos((prev) => prev.filter((e) => e.id !== eventoParaDeletar))
      toast({ title: 'Sucesso', description: 'Compromisso removido.' })
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } finally {
      setEventoParaDeletar(null)
    }
  }

  const handleSave = async (eventoData: any) => {
    try {
      if (eventoEditando && eventoEditando.id) {
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

    let filtered = baseEvents

    if (activeTab === 'periodo' && dateRange?.from) {
      const filterFrom = startOfDay(dateRange.from)
      const filterTo = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from)

      filtered = filtered.filter((e) => {
        const start = startOfDay(new Date(e.data_inicio + 'T12:00:00'))
        const end = startOfDay(new Date(e.data_fim + 'T12:00:00'))
        return start <= filterTo && end >= filterFrom
      })
    } else if (activeTab === 'usuario' && selectedUser !== 'todos') {
      filtered = filtered.filter((e) => e.usuario_id === selectedUser)
    }

    return filtered.sort((a, b) => {
      const startA = startOfDay(new Date(a.data_inicio + 'T12:00:00')).getTime()
      const startB = startOfDay(new Date(b.data_inicio + 'T12:00:00')).getTime()
      if (startA !== startB) {
        return isActiveTabArquivados ? startB - startA : startA - startB
      }
      const timeA = a.hora_inicio || '00:00'
      const timeB = b.hora_inicio || '00:00'
      return isActiveTabArquivados ? timeB.localeCompare(timeA) : timeA.localeCompare(timeB)
    })
  }, [eventos, dateRange, activeTab, selectedUser])

  const eventDates = useMemo(() => {
    const dates: Date[] = []
    const today = startOfDay(new Date())
    eventos.forEach((e) => {
      let curr = startOfDay(new Date(e.data_inicio + 'T12:00:00'))
      const end = endOfDay(new Date(e.data_fim + 'T12:00:00'))
      while (curr <= end) {
        if (curr >= today) {
          dates.push(new Date(curr))
        }
        curr.setDate(curr.getDate() + 1)
      }
    })
    return dates
  }, [eventos])

  const isAdminOrManager = profile?.role === 'admin' || profile?.role === 'gestor'
  const canManageAll = isAdminOrManager || permissions.includes('Gerenciar Compromissos')
  const canViewAll = canManageAll || permissions.includes('Visualizar Todos Compromissos')
  const canEditAny = canManageAll || permissions.includes('Editar Compromissos')
  const currentUserId = user?.id

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
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Calendário</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCalendarMonth(new Date())
              setDateRange(undefined)
              setActiveTab('todos')
            }}
            className="h-8 px-3 text-xs font-medium"
          >
            Hoje / Todos
          </Button>
        </div>
        <div className="rounded-xl border bg-slate-50/50 p-2 shadow-sm">
          <Calendar
            mode="range"
            month={calendarMonth}
            selected={dateRange}
            onSelect={(range: DateRange | undefined) => {
              setDateRange(range)
              if (range?.from) {
                setActiveTab('periodo')
              }
            }}
            onMonthChange={setCalendarMonth}
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
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800">
              Feed de Compromissos
              {activeTab === 'periodo' && dateRange?.from && (
                <span className="ml-3 text-lg font-medium text-slate-500">
                  - {format(dateRange.from, 'dd/MM/yyyy')}
                  {dateRange.to && dateRange.to.getTime() !== dateRange.from.getTime()
                    ? ` até ${format(dateRange.to, 'dd/MM/yyyy')}`
                    : ''}
                </span>
              )}
            </h2>
            <Button
              onClick={handleAdd}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Novo
            </Button>
          </div>

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

            {activeTab === 'periodo' && (
              <Select
                onValueChange={(val) => {
                  const today = startOfDay(new Date())
                  let from, to
                  if (val === 'semana') {
                    from = startOfWeek(today, { weekStartsOn: 1 })
                    to = endOfWeek(today, { weekStartsOn: 1 })
                  } else if (val === 'quinzena') {
                    from = today
                    to = addDays(today, 14)
                  } else if (val === 'mes') {
                    from = startOfMonth(today)
                    to = endOfMonth(today)
                  }
                  if (from && to) {
                    setDateRange({ from, to })
                    setCalendarMonth(from)
                  }
                }}
              >
                <SelectTrigger className="w-[180px] bg-white">
                  <SelectValue placeholder="Períodos rápidos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semana">Semana atual</SelectItem>
                  <SelectItem value="quinzena">Próximos 15 dias</SelectItem>
                  <SelectItem value="mes">Mês atual</SelectItem>
                </SelectContent>
              </Select>
            )}

            {activeTab === 'usuario' && (canViewAll || usuarios.length > 1) && (
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
                  key={ev.id}
                  evento={ev}
                  index={i}
                  isArquivado={activeTab === 'arquivados'}
                  canModify={canEditAny || ev.usuario_id === currentUserId}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  onDuplicate={handleDuplicate}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <EventoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        evento={eventoEditando}
        usuarios={usuarios}
      />

      <AlertDialog
        open={!!eventoParaDeletar}
        onOpenChange={(open: boolean) => !open && setEventoParaDeletar(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir compromisso</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este compromisso? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

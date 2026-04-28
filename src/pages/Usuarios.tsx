import { useState, useEffect } from 'react'
import {
  getUsuarios,
  getCargos,
  updateUsuarioStatus,
  checkHasPermission,
  UsuarioWithCargo,
} from '@/services/usuarios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Eye,
  UserX,
  UserCheck,
  ShieldAlert,
  Loader2,
  GripVertical,
} from 'lucide-react'
import ColaboradorFormSheet from '@/components/colaboradores/ColaboradorFormSheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { Tables } from '@/lib/supabase/types'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'

export interface ExtendedUsuario extends UsuarioWithCargo {
  ordem?: number
  saldo_carteira?: number
  horario_entrada?: string | null
  inicio_lanche_manha?: string | null
  fim_lanche_manha?: string | null
  saida_almoco?: string | null
  retorno_almoco?: string | null
  inicio_lanche_tarde?: string | null
  fim_lanche_tarde?: string | null
  horario_saida?: string | null
}

const timeToMinutes = (timeStr?: string | null) => {
  if (!timeStr) return 0
  const parts = timeStr.split(':')
  if (parts.length < 2) return 0
  const h = parseInt(parts[0], 10)
  const m = parseInt(parts[1], 10)
  if (isNaN(h) || isNaN(m)) return 0
  return h * 60 + m
}

const formatTimeShort = (timeStr?: string | null) => {
  if (!timeStr) return '-'
  const parts = timeStr.split(':')
  if (parts.length >= 2) return `${parts[0]}:${parts[1]}`
  return timeStr
}

const calculateTotalHours = (u: ExtendedUsuario) => {
  const entrada = timeToMinutes(u.horario_entrada)
  const saida = timeToMinutes(u.horario_saida)

  if (entrada === 0 && saida === 0) return '-'

  let total = saida - entrada
  if (total < 0) total += 24 * 60

  const almoco = Math.max(0, timeToMinutes(u.retorno_almoco) - timeToMinutes(u.saida_almoco))

  total = total - almoco
  if (total < 0) total = 0

  const h = Math.floor(total / 60)
  const m = total % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<ExtendedUsuario[]>([])
  const [cargos, setCargos] = useState<Tables<'cargos'>[]>([])
  const [loading, setLoading] = useState(true)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ativo')
  const [cargoFilter, setCargoFilter] = useState<string>('todos')

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingUsuario, setEditingUsuario] = useState<ExtendedUsuario | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const { profile } = useAuth()
  const isAdmin =
    profile?.role === 'admin' ||
    profile?.email === 'drleandro@nuvia.com' ||
    profile?.email === 'drleandrolinhares@gmail.com'

  const load = async () => {
    try {
      const permitted = await checkHasPermission('Gerenciar Colaboradores')
      setHasPermission(permitted)

      if (permitted) {
        const [us, cs, { data: transacoes }] = await Promise.all([
          getUsuarios(),
          getCargos(),
          supabase.from('carteira_transacoes').select('usuario_id, tipo, valor'),
        ])

        const saldos: Record<string, number> = {}
        if (transacoes) {
          transacoes.forEach((t) => {
            if (!saldos[t.usuario_id]) saldos[t.usuario_id] = 0
            if (t.tipo === 'credito') saldos[t.usuario_id] += Number(t.valor)
            else if (t.tipo === 'debito' || t.tipo === 'saque')
              saldos[t.usuario_id] -= Number(t.valor)
          })
        }

        const { data: scheduleData } = await supabase
          .from('usuarios')
          .select(
            'id, ordem, horario_entrada, inicio_lanche_manha, fim_lanche_manha, saida_almoco, retorno_almoco, inicio_lanche_tarde, fim_lanche_tarde, horario_saida',
          )

        const extendedUs = us.map((u) => {
          const s = scheduleData?.find((sd) => sd.id === u.id)
          return { ...u, ...s, saldo_carteira: saldos[u.id] || 0 } as ExtendedUsuario
        })

        extendedUs.sort((a, b) => (a.ordem || 0) - (b.ordem || 0))
        setUsuarios(extendedUs)
        setCargos(cs)
      }
    } catch (error) {
      console.error(error)
      toast.error('Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleNew = () => {
    setEditingUsuario(null)
    setSheetOpen(true)
  }

  const handleEdit = (u: ExtendedUsuario) => {
    setEditingUsuario(u)
    setSheetOpen(true)
  }

  const handleToggleStatus = async (id: string, currentStatus: string | null) => {
    try {
      const status = currentStatus || 'ativo'
      const newStatus = status === 'ativo' ? 'inativo' : 'ativo'
      await updateUsuarioStatus(id, newStatus)
      setUsuarios(usuarios.map((u) => (u.id === id ? { ...u, status: newStatus } : u)))
      toast.success(`Status atualizado para ${newStatus}`)
    } catch (error) {
      console.error(error)
      toast.error('Erro ao atualizar status')
    }
  }

  const isFiltered = search !== '' || statusFilter !== 'todos' || cargoFilter !== 'todos'

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index.toString())
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (isFiltered || draggedIndex === null || draggedIndex === dropIndex) return

    const newUsuarios = [...usuarios]
    const draggedItem = newUsuarios[draggedIndex]

    newUsuarios.splice(draggedIndex, 1)
    newUsuarios.splice(dropIndex, 0, draggedItem)

    setUsuarios(newUsuarios)
    setDraggedIndex(null)

    try {
      const updates = newUsuarios.map((u, i) =>
        supabase.from('usuarios').update({ ordem: i }).eq('id', u.id),
      )
      await Promise.all(updates)
      toast.success('Ordem atualizada com sucesso')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao atualizar ordem')
      load()
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    )
  }

  if (hasPermission === false) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
        <ShieldAlert className="w-16 h-16 text-destructive" />
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Acesso Negado
        </h2>
        <p className="text-muted-foreground max-w-md text-center">
          Você não possui permissão para gerenciar usuários. Solicite acesso ao administrador do
          sistema.
        </p>
      </div>
    )
  }

  const filteredUsuarios = usuarios.filter((u) => {
    const matchSearch =
      u.nome.toLowerCase().includes(search.toLowerCase()) || (u.cpf && u.cpf.includes(search))
    const userStatus = u.status || 'ativo'
    const matchStatus = statusFilter === 'todos' || userStatus === statusFilter
    const matchCargo =
      cargoFilter === 'todos' ||
      u.cargo_id === cargoFilter ||
      (u as any).cargo_secundario_id === cargoFilter
    return matchSearch && matchStatus && matchCargo
  })

  return (
    <div className="p-6 md:p-8 max-w-full mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-slate-900 p-6 rounded-xl border-l-4 border-amber-500 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-800 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6 text-amber-500"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white uppercase">
              Gestão de Usuários
            </h1>
            <p className="text-slate-400 mt-1 text-sm uppercase tracking-wider font-medium">
              Visualize e gerencie a equipe da clínica.
            </p>
          </div>
        </div>
        <Button
          onClick={handleNew}
          className="bg-slate-200 text-slate-700 hover:bg-amber-500 hover:text-white font-bold uppercase tracking-wider text-xs transition-all shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      <div className="bg-card border rounded-xl shadow-sm p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou CPF..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
          <div className="w-full md:w-56">
            <Select value={cargoFilter} onValueChange={setCargoFilter}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Cargo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Cargos</SelectItem>
                {cargos.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="ativo">Ativos</SelectItem>
                <SelectItem value="inativo">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border overflow-x-auto bg-background">
          <Table className="min-w-max w-full text-sm">
            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
              <TableRow>
                <TableHead className="w-8 px-1"></TableHead>
                <TableHead className="px-2">Usuário</TableHead>
                <TableHead className="px-2">Cargo</TableHead>
                <TableHead
                  className="px-1 text-[11px] whitespace-nowrap text-center"
                  title="Entrada"
                >
                  Entrada
                </TableHead>
                <TableHead
                  className="px-1 text-[11px] whitespace-nowrap text-center"
                  title="Início Lanche Manhã"
                >
                  I.L.M.
                </TableHead>
                <TableHead
                  className="px-1 text-[11px] whitespace-nowrap text-center"
                  title="Fim Lanche Manhã"
                >
                  F.L.M.
                </TableHead>
                <TableHead
                  className="px-1 text-[11px] whitespace-nowrap text-center"
                  title="Saída Almoço"
                >
                  S.Alm.
                </TableHead>
                <TableHead
                  className="px-1 text-[11px] whitespace-nowrap text-center"
                  title="Retorno Almoço"
                >
                  R.Alm.
                </TableHead>
                <TableHead
                  className="px-1 text-[11px] whitespace-nowrap text-center"
                  title="Início Lanche Tarde"
                >
                  I.L.T.
                </TableHead>
                <TableHead
                  className="px-1 text-[11px] whitespace-nowrap text-center"
                  title="Fim Lanche Tarde"
                >
                  F.L.T.
                </TableHead>
                <TableHead className="px-1 text-[11px] whitespace-nowrap text-center" title="Saída">
                  Saída
                </TableHead>
                <TableHead className="px-2 text-xs whitespace-nowrap font-bold text-amber-600 text-center">
                  Total
                </TableHead>
                <TableHead className="px-2 text-right whitespace-nowrap">Saldo Carteira</TableHead>
                <TableHead className="px-2">Status</TableHead>
                <TableHead className="w-[60px] px-2 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsuarios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={14} className="text-center py-10 text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <UserX className="w-8 h-8 opacity-20" />
                      <p>Nenhum usuário encontrado.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsuarios.map((usuario, index) => {
                  const status = usuario.status || 'ativo'
                  return (
                    <TableRow
                      key={usuario.id}
                      draggable={!isFiltered}
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={() => setDraggedIndex(null)}
                      className={cn(
                        'group transition-colors',
                        draggedIndex === index ? 'opacity-50 bg-muted' : 'hover:bg-muted/50',
                      )}
                    >
                      <TableCell className="w-8 px-1 text-center">
                        {!isFiltered ? (
                          <div className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded inline-flex">
                            <GripVertical className="w-4 h-4 text-muted-foreground/50 group-hover:text-foreground" />
                          </div>
                        ) : (
                          <div className="w-4 h-4" title="Limpe os filtros para reordenar" />
                        )}
                      </TableCell>
                      <TableCell className="px-2">
                        <div className="flex items-center gap-3 py-1">
                          <Avatar className="h-9 w-9 border border-amber-500/20 shadow-sm hidden sm:flex">
                            <AvatarFallback className="bg-slate-900 text-amber-500 text-xs font-bold uppercase">
                              {usuario.nome
                                .split(' ')
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-bold text-xs text-slate-900 dark:text-slate-100 whitespace-nowrap uppercase tracking-wide">
                              {usuario.nome}
                            </div>
                            <div className="text-[10px] text-muted-foreground truncate max-w-[120px] font-medium tracking-wider">
                              {usuario.cpf || 'SEM CPF'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-2">
                        <div
                          className="font-medium text-xs whitespace-nowrap truncate max-w-[140px]"
                          title={usuario.cargo?.nome || 'Não definido'}
                        >
                          {usuario.cargo?.nome || 'Não definido'}
                        </div>
                        {(usuario as any).cargo_secundario_id &&
                          cargos.find((c) => c.id === (usuario as any).cargo_secundario_id) && (
                            <div className="text-[10px] font-medium text-amber-600 dark:text-amber-500 mt-0.5 whitespace-nowrap truncate max-w-[140px]">
                              +{' '}
                              {
                                cargos.find((c) => c.id === (usuario as any).cargo_secundario_id)
                                  ?.nome
                              }
                            </div>
                          )}
                        <div className="text-[10px] text-muted-foreground mt-0.5 whitespace-nowrap truncate max-w-[140px]">
                          {usuario.cargo?.setor || '-'}
                        </div>
                      </TableCell>

                      {/* Horários */}
                      <TableCell className="px-1 text-[11px] whitespace-nowrap text-center font-medium">
                        {formatTimeShort(usuario.horario_entrada)}
                      </TableCell>
                      <TableCell className="px-1 text-[11px] whitespace-nowrap text-center text-muted-foreground">
                        {formatTimeShort(usuario.inicio_lanche_manha)}
                      </TableCell>
                      <TableCell className="px-1 text-[11px] whitespace-nowrap text-center text-muted-foreground">
                        {formatTimeShort(usuario.fim_lanche_manha)}
                      </TableCell>
                      <TableCell className="px-1 text-[11px] whitespace-nowrap text-center font-medium">
                        {formatTimeShort(usuario.saida_almoco)}
                      </TableCell>
                      <TableCell className="px-1 text-[11px] whitespace-nowrap text-center font-medium">
                        {formatTimeShort(usuario.retorno_almoco)}
                      </TableCell>
                      <TableCell className="px-1 text-[11px] whitespace-nowrap text-center text-muted-foreground">
                        {formatTimeShort(usuario.inicio_lanche_tarde)}
                      </TableCell>
                      <TableCell className="px-1 text-[11px] whitespace-nowrap text-center text-muted-foreground">
                        {formatTimeShort(usuario.fim_lanche_tarde)}
                      </TableCell>
                      <TableCell className="px-1 text-[11px] whitespace-nowrap text-center font-medium">
                        {formatTimeShort(usuario.horario_saida)}
                      </TableCell>

                      <TableCell className="px-2 text-[11px] whitespace-nowrap font-bold text-amber-600 text-center">
                        {calculateTotalHours(usuario)}
                      </TableCell>

                      <TableCell className="px-2 text-right font-bold whitespace-nowrap text-xs">
                        <span
                          className={cn(
                            usuario.saldo_carteira && usuario.saldo_carteira > 0
                              ? 'text-emerald-600'
                              : usuario.saldo_carteira && usuario.saldo_carteira < 0
                                ? 'text-red-600'
                                : 'text-slate-500',
                          )}
                        >
                          R$ {(usuario.saldo_carteira || 0).toFixed(2).replace('.', ',')}
                        </span>
                      </TableCell>

                      <TableCell className="px-2">
                        <Badge
                          variant={status === 'ativo' ? 'default' : 'secondary'}
                          className={cn(
                            'text-[10px] px-1.5 py-0',
                            status === 'ativo'
                              ? 'bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 dark:text-emerald-400 border-none'
                              : 'opacity-70',
                          )}
                        >
                          {status === 'ativo' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-2 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                              <span className="sr-only">Abrir menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleEdit(usuario)}
                              className="cursor-pointer"
                            >
                              <Eye className="w-4 h-4 mr-2 text-slate-500" /> Visualizar Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEdit(usuario)}
                              className="cursor-pointer"
                            >
                              <Edit className="w-4 h-4 mr-2 text-slate-500" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(usuario.id, status)}
                              className={`cursor-pointer ${status === 'ativo' ? 'text-destructive focus:text-destructive' : 'text-emerald-600 focus:text-emerald-600'}`}
                            >
                              {status === 'ativo' ? (
                                <>
                                  <UserX className="w-4 h-4 mr-2" /> Desativar
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-4 h-4 mr-2" /> Ativar
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <ColaboradorFormSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        cargos={cargos}
        usuario={editingUsuario}
        onSuccess={load}
        isAdmin={isAdmin}
      />
    </div>
  )
}

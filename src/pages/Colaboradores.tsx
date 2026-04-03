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
} from 'lucide-react'
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

export default function Colaboradores() {
  const [usuarios, setUsuarios] = useState<UsuarioWithCargo[]>([])
  const [cargos, setCargos] = useState<Tables<'cargos'>[]>([])
  const [loading, setLoading] = useState(true)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const [cargoFilter, setCargoFilter] = useState<string>('todos')

  useEffect(() => {
    async function load() {
      try {
        const permitted = await checkHasPermission('Gerenciar Colaboradores')
        setHasPermission(permitted)

        if (permitted) {
          const [us, cs] = await Promise.all([getUsuarios(), getCargos()])
          setUsuarios(us)
          setCargos(cs)
        }
      } catch (error) {
        console.error(error)
        toast.error('Erro ao carregar colaboradores')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

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
          Você não possui permissão para gerenciar colaboradores. Solicite acesso ao administrador
          do sistema.
        </p>
      </div>
    )
  }

  const filteredUsuarios = usuarios.filter((u) => {
    const matchSearch =
      u.nome.toLowerCase().includes(search.toLowerCase()) || (u.cpf && u.cpf.includes(search))
    const userStatus = u.status || 'ativo'
    const matchStatus = statusFilter === 'todos' || userStatus === statusFilter
    const matchCargo = cargoFilter === 'todos' || u.cargo_id === cargoFilter
    return matchSearch && matchStatus && matchCargo
  })

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Gestão de Colaboradores
          </h1>
          <p className="text-muted-foreground mt-1">Visualize e gerencie a equipe da clínica.</p>
        </div>
        <Button className="bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Novo Colaborador
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

        <div className="rounded-md border overflow-hidden bg-background">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
              <TableRow>
                <TableHead>Colaborador</TableHead>
                <TableHead>Cargo / Setor</TableHead>
                <TableHead>Admissão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsuarios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <UserX className="w-8 h-8 opacity-20" />
                      <p>Nenhum colaborador encontrado.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsuarios.map((usuario) => {
                  const status = usuario.status || 'ativo'
                  return (
                    <TableRow
                      key={usuario.id}
                      className="group transition-colors hover:bg-muted/50"
                    >
                      <TableCell>
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {usuario.nome}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {usuario.cpf || 'Sem CPF'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{usuario.cargo?.nome || 'Não definido'}</div>
                        <div className="text-xs text-muted-foreground">
                          {usuario.cargo?.setor || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {usuario.data_admissao
                          ? format(parseISO(usuario.data_admissao), 'dd/MM/yyyy', { locale: ptBR })
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={status === 'ativo' ? 'default' : 'secondary'}
                          className={
                            status === 'ativo'
                              ? 'bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 dark:text-emerald-400 border-none'
                              : 'opacity-70'
                          }
                        >
                          {status === 'ativo' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
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
                            <DropdownMenuItem className="cursor-pointer">
                              <Eye className="w-4 h-4 mr-2 text-slate-500" /> Visualizar Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
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
    </div>
  )
}

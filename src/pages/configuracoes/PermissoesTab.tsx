import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Plus,
  Shield,
  UserCog,
  ShieldAlert,
  Loader2,
  AlertCircle,
  Users,
  Search,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  getCargos,
  getPermissoes,
  getUsuariosComPermissoes,
  Cargo,
  Permissao,
  UsuarioComPermissoes,
} from '@/services/permissoes'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { CargoDialog } from './CargoDialog'
import { PermissoesEditorDialog } from './PermissoesEditorDialog'
import { getUsuarios } from '@/services/usuarios'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'

export function PermissoesTab() {
  const { isAdmin } = useAuth()
  const [cargos, setCargos] = useState<Cargo[]>([])
  const [permissoes, setPermissoes] = useState<Permissao[]>([])
  const [usuarios, setUsuarios] = useState<UsuarioComPermissoes[]>([])
  const [excecoesPorUsuario, setExcecoesPorUsuario] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [partialError, setPartialError] = useState(false)
  const [busca, setBusca] = useState('')
  const { toast } = useToast()

  const [cargoDialogOpen, setCargoDialogOpen] = useState(false)
  const [selectedCargo, setSelectedCargo] = useState<Cargo | null>(null)

  const [userDialogOpen, setUserDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UsuarioComPermissoes | null>(null)
  const [somenteExcecoes, setSomenteExcecoes] = useState(false)

  const loadData = async () => {
    setLoading(true)
    setPartialError(false)
    try {
      const results = await Promise.allSettled([
        getCargos(),
        getPermissoes(),
        getUsuariosComPermissoes(),
        getUsuarios(),
        supabase.from('usuario_permissoes_negadas').select('usuario_id'),
        supabase.from('usuario_permissoes').select('usuario_id'),
      ])

      const c = results[0].status === 'fulfilled' ? results[0].value : []
      const p = results[1].status === 'fulfilled' ? results[1].value : []
      const u = results[2].status === 'fulfilled' ? results[2].value : []
      const allUsers = results[3].status === 'fulfilled' ? results[3].value : []
      const negadasRes = results[4].status === 'fulfilled' ? (results[4].value as any) : null
      const concedidasRes = results[5].status === 'fulfilled' ? (results[5].value as any) : null

      setCargos(c)
      setPermissoes(p)

      const activeUserIds = new Set(
        allUsers.filter((user) => user.status === 'ativo').map((user) => user.id),
      )
      setUsuarios(u.filter((user) => activeUserIds.has(user.id)))

      // Conta exceções REAIS: o que a pessoa tem fora do cargo (concedidas)
      // + o que ela tem bloqueado (negadas). O que é igual ao cargo não é
      // exceção e por isso não aparece no badge.
      const cargoPorUsuario = new Map<string, Set<string>>()
      c.forEach((cargo) => {
        cargoPorUsuario.set(
          cargo.id,
          new Set((cargo.cargo_permissoes || []).map((cp) => cp.permissao_id)),
        )
      })

      const contagem: Record<string, number> = {}
      const concedidasPorUsuario = new Map<string, string[]>()
      ;(concedidasRes?.data || []).forEach((r: any) => {
        if (!concedidasPorUsuario.has(r.usuario_id)) concedidasPorUsuario.set(r.usuario_id, [])
        concedidasPorUsuario.get(r.usuario_id)!.push(r.permissao_id)
      })

      u.forEach((user) => {
        const doCargo = cargoPorUsuario.get((user as any).cargo_id || '') || new Set<string>()
        const extras = (concedidasPorUsuario.get(user.id) || []).filter((pid) => !doCargo.has(pid))
        if (extras.length) contagem[user.id] = extras.length
      })
      ;(negadasRes?.data || []).forEach((r: any) => {
        contagem[r.usuario_id] = (contagem[r.usuario_id] || 0) + 1
      })
      setExcecoesPorUsuario(contagem)
    } catch (error: any) {
      setPartialError(true)
      toast({ title: 'Erro ao carregar dados', description: error.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      loadData()
    } else {
      setLoading(false)
    }
  }, [isAdmin])

  const paginas = useMemo(() => permissoes.filter((p) => p.tipo === 'pagina'), [permissoes])
  const acoes = useMemo(() => permissoes.filter((p) => p.tipo === 'acao'), [permissoes])

  const resumoCargo = (cargo: Cargo) => {
    const ids = new Set(cargo.cargo_permissoes?.map((cp) => cp.permissao_id) || [])
    const qtdPaginas = paginas.filter((p) => ids.has(p.id)).length
    const qtdAcoes = acoes.filter((p) => ids.has(p.id)).length
    return { qtdPaginas, qtdAcoes }
  }

  const termo = busca.trim().toLowerCase()
  const usuariosFiltrados = termo
    ? usuarios.filter(
        (u) =>
          u.nome.toLowerCase().includes(termo) ||
          u.email.toLowerCase().includes(termo) ||
          (u.cargo?.nome || '').toLowerCase().includes(termo),
      )
    : usuarios

  const cargosFiltrados = termo
    ? cargos.filter(
        (c) =>
          c.nome.toLowerCase().includes(termo) || (c.setor || '').toLowerCase().includes(termo),
      )
    : cargos

  if (!isAdmin) {
    return (
      <Card className="border-border/50 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <ShieldAlert className="size-12 mb-4 text-destructive opacity-80" />
          <h3 className="text-lg font-bold uppercase tracking-wider mb-2 text-foreground">
            Acesso Restrito
          </h3>
          <p className="text-sm">Apenas administradores podem configurar cargos e permissões.</p>
        </CardContent>
      </Card>
    )
  }

  const comExcecao = usuarios.filter((u) => (excecoesPorUsuario[u.id] || 0) > 0).length
  const usuariosListados = somenteExcecoes
    ? usuariosFiltrados.filter((u) => (excecoesPorUsuario[u.id] || 0) > 0)
    : usuariosFiltrados

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-lg font-bold tracking-tight text-foreground">Controle de acesso</h3>
          <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-muted-foreground">
            O <strong className="font-semibold text-foreground">cargo</strong> define o padrão de
            acesso. A <strong className="font-semibold text-foreground">pessoa</strong> recebe
            apenas exceções — liberar algo a mais ou bloquear algo do cargo.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setSelectedCargo(null)
            setCargoDialogOpen(true)
          }}
          className="shrink-0 uppercase tracking-wider text-xs font-bold"
        >
          <Plus className="size-4 mr-2" /> Novo cargo
        </Button>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="cargos" className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-2">
            <TabsTrigger value="cargos" className="uppercase tracking-wider text-xs font-bold">
              <Shield className="size-4 mr-2" /> Padrão por cargo
              <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px]">
                {cargos.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="usuarios" className="uppercase tracking-wider text-xs font-bold">
              <UserCog className="size-4 mr-2" /> Exceções por pessoa
              <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px]">
                {comExcecao}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar cargo, pessoa ou e-mail..."
              className="h-9 pl-9 text-[13px]"
            />
          </div>

          {/* ---------- PADRÃO POR CARGO ---------- */}
          <TabsContent value="cargos" className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
                <span className="text-sm">Carregando cargos...</span>
              </div>
            ) : cargosFiltrados.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">
                {partialError ? (
                  <div className="flex flex-col items-center gap-2">
                    <AlertCircle className="size-8 text-amber-500" />
                    <p>Erro ao carregar cargos.</p>
                    <Button variant="outline" size="sm" onClick={loadData} className="mt-2">
                      Recarregar
                    </Button>
                  </div>
                ) : (
                  'Nenhum cargo cadastrado.'
                )}
              </div>
            ) : (
              <div className="divide-y divide-border/60 overflow-hidden rounded-lg border border-border">
                {cargosFiltrados.map((cargo) => {
                  const { qtdPaginas, qtdAcoes } = resumoCargo(cargo)
                  const pessoas = usuarios.filter(
                    (u) => (u.cargo?.nome || '') === cargo.nome,
                  ).length
                  return (
                    <div
                      key={cargo.id}
                      className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/30"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[13.5px] font-semibold text-foreground">
                            {cargo.nome}
                          </span>
                          {cargo.setor && (
                            <Badge variant="outline" className="text-[10px]">
                              {cargo.setor}
                            </Badge>
                          )}
                        </div>
                        <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                          {qtdPaginas === 0 && qtdAcoes === 0 ? (
                            <span className="text-amber-600 dark:text-amber-400">
                              Sem acesso liberado — quem tiver este cargo não vê nada
                            </span>
                          ) : (
                            <>
                              {qtdPaginas} de {paginas.length} páginas
                              {qtdAcoes > 0 && ` · ${qtdAcoes} ações`}
                              {pessoas > 0 && ` · ${pessoas} pessoa(s)`}
                            </>
                          )}
                        </p>
                      </div>

                      <div className="hidden w-40 shrink-0 sm:block">
                        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary/70 transition-all"
                            style={{
                              width: `${paginas.length ? (qtdPaginas / paginas.length) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCargo(cargo)
                          setCargoDialogOpen(true)
                        }}
                        className="h-8 shrink-0 text-xs uppercase tracking-wider"
                      >
                        Editar
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </TabsContent>

          {/* ---------- EXCEÇÕES POR PESSOA ---------- */}
          <TabsContent value="usuarios" className="space-y-3">
            <div className="flex flex-col gap-2 rounded-lg border border-border/70 bg-muted/30 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[11.5px] leading-relaxed text-muted-foreground">
                Quem está com{' '}
                <strong className="font-semibold text-foreground">segue o cargo</strong> acessa
                exatamente o que o cargo permite. Abra uma pessoa para liberar ou bloquear itens
                específicos.
              </p>
              <label className="flex shrink-0 cursor-pointer items-center gap-2 text-[11.5px] font-medium text-foreground">
                <input
                  type="checkbox"
                  checked={somenteExcecoes}
                  onChange={(e) => setSomenteExcecoes(e.target.checked)}
                  className="size-3.5 accent-primary"
                />
                Só com exceções
              </label>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
                <span className="text-sm">Carregando colaboradores...</span>
              </div>
            ) : usuariosListados.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">
                {partialError
                  ? 'Erro ao carregar colaboradores.'
                  : somenteExcecoes
                    ? 'Ninguém tem exceção — todo mundo segue o cargo.'
                    : 'Nenhum colaborador encontrado.'}
              </div>
            ) : (
              <div className="divide-y divide-border/60 overflow-hidden rounded-lg border border-border">
                {usuariosListados.map((user) => {
                  const excecoes = excecoesPorUsuario[user.id] || 0
                  return (
                    <div
                      key={user.id}
                      className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/30"
                    >
                      <div className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-bold uppercase text-muted-foreground">
                        {user.nome
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="truncate text-[13.5px] font-semibold text-foreground">
                            {user.nome}
                          </span>
                          {excecoes > 0 ? (
                            <Badge
                              variant="outline"
                              className="border-amber-500/30 bg-amber-500/10 text-[10px] text-amber-600 dark:text-amber-400"
                            >
                              {excecoes} exceção(ões)
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-border text-[10px] text-muted-foreground"
                            >
                              segue o cargo
                            </Badge>
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">
                          {user.cargo?.nome || 'Sem cargo'} · {user.email}
                        </p>
                      </div>

                      <Button
                        variant={excecoes > 0 ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user)
                          setUserDialogOpen(true)
                        }}
                        className="h-8 shrink-0 text-xs uppercase tracking-wider"
                      >
                        Ajustar
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {cargoDialogOpen && (
          <CargoDialog
            open={cargoDialogOpen}
            onOpenChange={setCargoDialogOpen}
            cargo={selectedCargo}
            permissoes={permissoes}
            onSave={loadData}
          />
        )}
        {userDialogOpen && selectedUser && (
          <PermissoesEditorDialog
            open={userDialogOpen}
            onOpenChange={setUserDialogOpen}
            usuario={selectedUser}
            onSave={loadData}
          />
        )}
      </CardContent>
    </Card>
  )
}

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Shield, UserCog, ShieldAlert } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  checkIsAdmin,
  getCargos,
  getPermissoes,
  getUsuariosComPermissoes,
  Cargo,
  Permissao,
  UsuarioComPermissoes,
} from '@/services/permissoes'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { CargoDialog } from './CargoDialog'
import { UsuarioPermissoesDialog } from './UsuarioPermissoesDialog'

export function PermissoesTab() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [cargos, setCargos] = useState<Cargo[]>([])
  const [permissoes, setPermissoes] = useState<Permissao[]>([])
  const [usuarios, setUsuarios] = useState<UsuarioComPermissoes[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const [cargoDialogOpe, setCargoDialogOpen] = useState(false)
  const [selectedCargo, setSelectedCargo] = useState<Cargo | null>(null)

  const [userDialogOpen, setUserDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UsuarioComPermissoes | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const admin = await checkIsAdmin()
      setIsAdmin(admin)
      if (!admin) return

      const [c, p, u] = await Promise.all([
        getCargos(),
        getPermissoes(),
        getUsuariosComPermissoes(),
      ])
      setCargos(c)
      setPermissoes(p)
      setUsuarios(u)
    } catch (error: any) {
      toast({ title: 'Erro ao carregar dados', description: error.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (!loading && !isAdmin) {
    return (
      <Card className="border-border/50 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <ShieldAlert className="size-12 mb-4 text-destructive opacity-80" />
          <h3 className="text-lg font-bold uppercase tracking-wider mb-2 text-foreground">
            Acesso Restrito
          </h3>
          <p className="text-sm">
            Apenas usuários com privilégios de CEO (Administrador) podem configurar cargos e
            permissões.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-4">
        <div>
          <CardTitle className="uppercase tracking-wider text-lg">Cargos e Permissões</CardTitle>
          <CardDescription>Gerencie o controle de acesso (RBAC) da clínica.</CardDescription>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setSelectedCargo(null)
            setCargoDialogOpen(true)
          }}
          className="uppercase tracking-wider text-xs font-bold"
        >
          <Plus className="size-4 mr-2" /> Novo Cargo
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="cargos" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="cargos" className="uppercase tracking-wider text-xs font-bold">
              <Shield className="size-4 mr-2" /> Cargos
            </TabsTrigger>
            <TabsTrigger value="usuarios" className="uppercase tracking-wider text-xs font-bold">
              <UserCog className="size-4 mr-2" /> Exceções por Colaborador
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cargos" className="space-y-4">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando cargos...</div>
            ) : cargos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Nenhum cargo cadastrado.</div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {cargos.map((cargo) => (
                  <div
                    key={cargo.id}
                    className="rounded-lg border bg-card text-card-foreground p-4 flex flex-col gap-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm uppercase tracking-wider leading-none">
                          {cargo.nome}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {cargo.descricao || 'Sem descrição'} • Setor:{' '}
                          {cargo.setor || 'Não definido'}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCargo(cargo)
                          setCargoDialogOpen(true)
                        }}
                        className="h-8 text-xs uppercase tracking-wider shrink-0"
                      >
                        Editar
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {cargo.cargo_permissoes?.map((cp) => {
                        const perm = permissoes.find((p) => p.id === cp.permissao_id)
                        return perm ? (
                          <Badge
                            key={perm.id}
                            variant="secondary"
                            className="text-[10px] uppercase px-2 py-0.5 font-medium"
                          >
                            {perm.nome}
                          </Badge>
                        ) : null
                      })}
                      {(!cargo.cargo_permissoes || cargo.cargo_permissoes.length === 0) && (
                        <span className="text-xs text-muted-foreground italic">
                          Sem permissões atribuídas
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="usuarios" className="space-y-4">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Carregando colaboradores...
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {usuarios.map((user) => (
                  <div
                    key={user.id}
                    className="rounded-lg border bg-card text-card-foreground p-4 flex flex-col gap-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm uppercase tracking-wider leading-none">
                          {user.nome}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {user.email} • Cargo: {user.cargo?.nome || 'Nenhum'}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user)
                          setUserDialogOpen(true)
                        }}
                        className="h-8 text-xs uppercase tracking-wider shrink-0"
                      >
                        Permissões
                      </Button>
                    </div>
                    {user.usuario_permissoes?.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {user.usuario_permissoes.map((up) => {
                          const p = permissoes.find((p) => p.id === up.permissao_id)
                          return p ? (
                            <Badge
                              key={p.id}
                              variant="outline"
                              className="text-[10px] uppercase px-2 py-0.5 font-medium bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400"
                            >
                              {p.nome}
                            </Badge>
                          ) : null
                        })}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        Sem permissões adicionais
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {cargoDialogOpe && (
          <CargoDialog
            open={cargoDialogOpe}
            onOpenChange={setCargoDialogOpen}
            cargo={selectedCargo}
            permissoes={permissoes}
            onSave={loadData}
          />
        )}
        {userDialogOpen && (
          <UsuarioPermissoesDialog
            open={userDialogOpen}
            onOpenChange={setUserDialogOpen}
            usuario={selectedUser!}
            permissoes={permissoes}
            onSave={loadData}
          />
        )}
      </CardContent>
    </Card>
  )
}

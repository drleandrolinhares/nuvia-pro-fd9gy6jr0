import { Settings2, Users, Shield, SlidersHorizontal, HardDrive, Truck } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UsuariosTab } from './configuracoes/UsuariosTab'
import { PermissoesTab } from './configuracoes/PermissoesTab'
import { FornecedoresTab } from './configuracoes/FornecedoresTab'
import { useAuth } from '@/hooks/use-auth'

export default function Configuracoes() {
  const { profile, permissions } = useAuth()
  const isAdmin = profile?.role === 'admin'

  const canViewGeral = isAdmin || permissions.includes('configuracoes_geral')
  const canViewUsuarios = isAdmin || permissions.includes('configuracoes_usuarios')
  const canViewPermissoes = isAdmin || permissions.includes('configuracoes_permissoes')
  const canViewParametros = isAdmin || permissions.includes('configuracoes_parametros')
  const canViewFornecedores = isAdmin || permissions.includes('configuracoes_fornecedores')

  const defaultTab = canViewGeral
    ? 'geral'
    : canViewFornecedores
      ? 'fornecedores'
      : canViewUsuarios
        ? 'usuarios'
        : canViewPermissoes
          ? 'permissoes'
          : 'parametros'

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground uppercase">
          Configurações do Sistema
        </h1>
        <p className="text-muted-foreground uppercase text-sm font-medium tracking-wider mt-1">
          Parâmetros Globais Nuvia Odontologia
        </p>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="bg-muted/50 p-1 mb-6 flex-wrap h-auto">
          {canViewGeral && (
            <TabsTrigger
              value="geral"
              className="uppercase tracking-wider text-xs font-bold data-[state=active]:bg-background data-[state=active]:text-secondary flex-1 sm:flex-none"
            >
              <Settings2 className="size-4 mr-2" /> Geral
            </TabsTrigger>
          )}
          {canViewUsuarios && (
            <TabsTrigger
              value="usuarios"
              className="uppercase tracking-wider text-xs font-bold data-[state=active]:bg-background data-[state=active]:text-secondary flex-1 sm:flex-none"
            >
              <Users className="size-4 mr-2" /> Usuários e RH
            </TabsTrigger>
          )}
          {canViewPermissoes && (
            <TabsTrigger
              value="permissoes"
              className="uppercase tracking-wider text-xs font-bold data-[state=active]:bg-background data-[state=active]:text-secondary flex-1 sm:flex-none"
            >
              <Shield className="size-4 mr-2" /> Cargos e Permissões
            </TabsTrigger>
          )}
          {canViewParametros && (
            <TabsTrigger
              value="parametros"
              className="uppercase tracking-wider text-xs font-bold data-[state=active]:bg-background data-[state=active]:text-secondary flex-1 sm:flex-none"
            >
              <SlidersHorizontal className="size-4 mr-2" /> Parâmetros
            </TabsTrigger>
          )}
          {canViewFornecedores && (
            <TabsTrigger
              value="fornecedores"
              className="uppercase tracking-wider text-xs font-bold data-[state=active]:bg-background data-[state=active]:text-secondary flex-1 sm:flex-none"
            >
              <Truck className="size-4 mr-2" /> Fornecedores
            </TabsTrigger>
          )}
        </TabsList>

        {canViewGeral && (
          <TabsContent value="geral" className="m-0">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="uppercase tracking-wider">Informações da Clínica</CardTitle>
                <CardDescription>
                  Gerencie os dados principais da sua unidade Nuvia.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex size-16 items-center justify-center rounded-full bg-muted mb-4">
                    <HardDrive className="size-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-bold uppercase tracking-wider mb-2">
                    Módulo em Desenvolvimento
                  </h3>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {canViewUsuarios && (
          <TabsContent value="usuarios" className="m-0">
            <UsuariosTab />
          </TabsContent>
        )}

        {canViewPermissoes && (
          <TabsContent value="permissoes" className="m-0">
            <PermissoesTab />
          </TabsContent>
        )}

        {canViewParametros && (
          <TabsContent value="parametros" className="m-0">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="uppercase tracking-wider">Parâmetros do Sistema</CardTitle>
                <CardDescription>Configurações técnicas e de integração.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex size-16 items-center justify-center rounded-full bg-muted mb-4">
                    <SlidersHorizontal className="size-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-bold uppercase tracking-wider mb-2">
                    Módulo em Desenvolvimento
                  </h3>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {canViewFornecedores && (
          <TabsContent value="fornecedores" className="m-0">
            <FornecedoresTab />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

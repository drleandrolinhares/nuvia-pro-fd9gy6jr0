import { Users, Shield, Database, Percent, DollarSign } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UsuariosTab } from './configuracoes/UsuariosTab'
import { PermissoesTab } from './configuracoes/PermissoesTab'
import CadastrosBasicos from './admin/CadastrosBasicos'
import DescontosPorPrazo from './configuracoes/DescontosPorPrazo'
import EntradaEFaixas from './configuracoes/EntradaEFaixas'
import { useAuth } from '@/hooks/use-auth'

export default function Configuracoes() {
  const { profile, permissions } = useAuth()
  const isAdmin = profile?.role === 'admin'

  const canViewUsuarios = isAdmin || permissions.includes('configuracoes_usuarios')
  const canViewPermissoes = isAdmin || permissions.includes('configuracoes_permissoes')
  const canViewCadastros = isAdmin
  const canViewNegociacao = isAdmin

  const defaultTab = canViewUsuarios
    ? 'usuarios'
    : canViewPermissoes
      ? 'permissoes'
      : canViewCadastros
        ? 'cadastros'
        : 'descontos'

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
          {canViewUsuarios && (
            <TabsTrigger
              value="usuarios"
              className="uppercase tracking-wider text-xs font-bold data-[state=active]:bg-background data-[state=active]:text-secondary flex-1 sm:flex-none"
            >
              <Users className="size-4 mr-2" /> USUÁRIOS E RH
            </TabsTrigger>
          )}
          {canViewPermissoes && (
            <TabsTrigger
              value="permissoes"
              className="uppercase tracking-wider text-xs font-bold data-[state=active]:bg-background data-[state=active]:text-secondary flex-1 sm:flex-none"
            >
              <Shield className="size-4 mr-2" /> CARGOS E PERMISSÕES
            </TabsTrigger>
          )}
          {canViewCadastros && (
            <TabsTrigger
              value="cadastros"
              className="uppercase tracking-wider text-xs font-bold data-[state=active]:bg-background data-[state=active]:text-secondary flex-1 sm:flex-none"
            >
              <Database className="size-4 mr-2" /> CADASTROS BÁSICOS
            </TabsTrigger>
          )}
          {canViewNegociacao && (
            <TabsTrigger
              value="descontos"
              className="uppercase tracking-wider text-xs font-bold data-[state=active]:bg-background data-[state=active]:text-secondary flex-1 sm:flex-none"
            >
              <Percent className="size-4 mr-2" /> DESCONTOS POR PRAZO
            </TabsTrigger>
          )}
          {canViewNegociacao && (
            <TabsTrigger
              value="faixas"
              className="uppercase tracking-wider text-xs font-bold data-[state=active]:bg-background data-[state=active]:text-secondary flex-1 sm:flex-none"
            >
              <DollarSign className="size-4 mr-2" /> ENTRADA E FAIXAS
            </TabsTrigger>
          )}
        </TabsList>

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

        {canViewCadastros && (
          <TabsContent
            value="cadastros"
            className="m-0 border border-border/50 rounded-xl overflow-hidden bg-background"
          >
            <CadastrosBasicos />
          </TabsContent>
        )}

        {canViewNegociacao && (
          <TabsContent
            value="descontos"
            className="m-0 border border-border/50 rounded-xl overflow-hidden bg-background"
          >
            <DescontosPorPrazo />
          </TabsContent>
        )}

        {canViewNegociacao && (
          <TabsContent
            value="faixas"
            className="m-0 border border-border/50 rounded-xl overflow-hidden bg-background"
          >
            <EntradaEFaixas />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

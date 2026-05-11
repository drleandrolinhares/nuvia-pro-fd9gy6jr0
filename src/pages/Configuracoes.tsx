import { Users, Shield, Database, Percent, DollarSign } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UsuariosTab } from './configuracoes/UsuariosTab'
import { PermissoesTab } from './configuracoes/PermissoesTab'
import CadastrosBasicos from './admin/CadastrosBasicos'
import DescontosPorPrazo from './configuracoes/DescontosPorPrazo'
import EntradaEFaixas from './configuracoes/EntradaEFaixas'
import DentistasProTab from './configuracoes/DentistasProTab'
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-slate-900 p-6 rounded-xl border-l-4 border-amber-500 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-800 rounded-lg">
            <Shield className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white uppercase">
              Configurações do Sistema
            </h1>
            <p className="text-slate-400 mt-1 text-sm uppercase tracking-wider font-medium">
              Parâmetros Globais Nuvia Odontologia
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="bg-slate-200/50 p-1 mb-6 flex-wrap h-auto rounded-lg gap-2">
          {canViewUsuarios && (
            <TabsTrigger
              value="usuarios"
              className="uppercase tracking-wider text-xs font-bold data-[state=active]:bg-amber-500 data-[state=active]:text-white text-slate-600 rounded-md transition-all flex-1 sm:flex-none py-2"
            >
              <Users className="size-4 mr-2" /> USUÁRIOS E RH
            </TabsTrigger>
          )}
          {canViewPermissoes && (
            <TabsTrigger
              value="permissoes"
              className="uppercase tracking-wider text-xs font-bold data-[state=active]:bg-amber-500 data-[state=active]:text-white text-slate-600 rounded-md transition-all flex-1 sm:flex-none py-2"
            >
              <Shield className="size-4 mr-2" /> CARGOS E PERMISSÕES
            </TabsTrigger>
          )}
          {canViewCadastros && (
            <TabsTrigger
              value="cadastros"
              className="uppercase tracking-wider text-xs font-bold data-[state=active]:bg-amber-500 data-[state=active]:text-white text-slate-600 rounded-md transition-all flex-1 sm:flex-none py-2"
            >
              <Database className="size-4 mr-2" /> CADASTROS BÁSICOS
            </TabsTrigger>
          )}
          {canViewCadastros && (
            <TabsTrigger
              value="dentistas-pro"
              className="uppercase tracking-wider text-xs font-bold data-[state=active]:bg-amber-500 data-[state=active]:text-white text-slate-600 rounded-md transition-all flex-1 sm:flex-none py-2"
            >
              <Users className="size-4 mr-2" /> DENTISTAS PRO
            </TabsTrigger>
          )}
          {canViewNegociacao && (
            <TabsTrigger
              value="descontos"
              className="uppercase tracking-wider text-xs font-bold data-[state=active]:bg-amber-500 data-[state=active]:text-white text-slate-600 rounded-md transition-all flex-1 sm:flex-none py-2"
            >
              <Percent className="size-4 mr-2" /> DESCONTOS POR PRAZO
            </TabsTrigger>
          )}
          {canViewNegociacao && (
            <TabsTrigger
              value="faixas"
              className="uppercase tracking-wider text-xs font-bold data-[state=active]:bg-amber-500 data-[state=active]:text-white text-slate-600 rounded-md transition-all flex-1 sm:flex-none py-2"
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

        {canViewCadastros && (
          <TabsContent
            value="dentistas-pro"
            className="m-0 border border-border/50 rounded-xl overflow-hidden bg-background"
          >
            <DentistasProTab />
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

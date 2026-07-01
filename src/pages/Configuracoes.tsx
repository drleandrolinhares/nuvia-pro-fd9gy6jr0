import { Users, Shield, Database, Percent, DollarSign, Loader2, Lock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UsuariosTab } from './configuracoes/UsuariosTab'
import CadastrosBasicos from './admin/CadastrosBasicos'
import DescontosPorPrazo from './configuracoes/DescontosPorPrazo'
import EntradaEFaixas from './configuracoes/EntradaEFaixas'
import DentistasProTab from './configuracoes/DentistasProTab'
import { useAuth } from '@/hooks/use-auth'

export default function Configuracoes() {
  const { isAdmin, loading, hasPermission } = useAuth()

  const canViewAll = isAdmin || hasPermission('Acessar Parâmetros Gerais')
  const canViewUsuarios = canViewAll
  const canViewCadastros = canViewAll
  const canViewNegociacao = canViewAll

  const hasAnyAccess = canViewAll
  const defaultTab = 'usuarios'

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
          <p className="text-slate-400 font-medium text-sm uppercase tracking-wider">
            Carregando configurações...
          </p>
        </div>
      </div>
    )
  }

  if (!hasAnyAccess) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-[70vh]">
        <Card className="max-w-md w-full shadow-xl border-border/50">
          <CardContent className="flex flex-col items-center text-center space-y-4 py-12">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Acesso Restrito</h2>
            <p className="text-sm text-muted-foreground">
              Você não tem permissão para acessar as configurações do sistema. Solicite acesso a um
              administrador.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

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

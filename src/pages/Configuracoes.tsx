import { Settings2, Users, Shield, SlidersHorizontal, HardDrive } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function Configuracoes() {
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

      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="bg-muted/50 p-1 mb-6">
          <TabsTrigger
            value="geral"
            className="uppercase tracking-wider text-xs font-bold data-[state=active]:bg-background data-[state=active]:text-secondary"
          >
            <Settings2 className="size-4 mr-2" /> Geral
          </TabsTrigger>
          <TabsTrigger
            value="usuarios"
            className="uppercase tracking-wider text-xs font-bold data-[state=active]:bg-background data-[state=active]:text-secondary"
          >
            <Users className="size-4 mr-2" /> Usuários
          </TabsTrigger>
          <TabsTrigger
            value="permissoes"
            className="uppercase tracking-wider text-xs font-bold data-[state=active]:bg-background data-[state=active]:text-secondary"
          >
            <Shield className="size-4 mr-2" /> Permissões
          </TabsTrigger>
          <TabsTrigger
            value="parametros"
            className="uppercase tracking-wider text-xs font-bold data-[state=active]:bg-background data-[state=active]:text-secondary"
          >
            <SlidersHorizontal className="size-4 mr-2" /> Parâmetros
          </TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="m-0">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="uppercase tracking-wider">Informações da Clínica</CardTitle>
              <CardDescription>Gerencie os dados principais da sua unidade Nuvia.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-muted mb-4">
                  <HardDrive className="size-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold uppercase tracking-wider mb-2">
                  Módulo em Desenvolvimento
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  As configurações gerais do sistema estarão disponíveis na próxima atualização
                  arquitetural.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usuarios" className="m-0">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="uppercase tracking-wider">Gestão de Usuários</CardTitle>
              <CardDescription>Adicione ou remova acesso ao sistema Nuvia.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-muted mb-4">
                  <Users className="size-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold uppercase tracking-wider mb-2">
                  Módulo em Desenvolvimento
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  A gestão integrada de usuários será implementada em breve.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissoes" className="m-0">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="uppercase tracking-wider">Controle de Acesso</CardTitle>
              <CardDescription>Defina quais módulos cada perfil pode acessar.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-muted mb-4">
                  <Shield className="size-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold uppercase tracking-wider mb-2">
                  Módulo em Desenvolvimento
                </h3>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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
      </Tabs>
    </div>
  )
}

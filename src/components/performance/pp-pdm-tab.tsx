import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/use-auth'
import { EmployeePPDMView } from './pp-pdm/employee-view'
import { ManagerPPDMView } from './pp-pdm/manager-view'
import { ConfigPPDMView } from './pp-pdm/config-view'

export function PPEPDMTab() {
  const { profile } = useAuth()
  const isManager = profile?.role === 'admin' || profile?.role === 'gestor'

  if (!isManager) {
    return <EmployeePPDMView />
  }

  return (
    <Tabs defaultValue="gerencial" className="w-full">
      <TabsList className="grid w-full grid-cols-3 max-w-xl mb-6 bg-slate-100/80 p-1 border">
        <TabsTrigger
          value="gerencial"
          className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          Visão Gerencial
        </TabsTrigger>
        <TabsTrigger
          value="configuracao"
          className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          Configurações
        </TabsTrigger>
        <TabsTrigger
          value="meu_form"
          className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          Meu Formulário
        </TabsTrigger>
      </TabsList>

      <TabsContent value="gerencial" className="animate-fade-in mt-0">
        <ManagerPPDMView />
      </TabsContent>

      <TabsContent value="configuracao" className="animate-fade-in mt-0">
        <ConfigPPDMView />
      </TabsContent>

      <TabsContent value="meu_form" className="animate-fade-in mt-0">
        <EmployeePPDMView />
      </TabsContent>
    </Tabs>
  )
}

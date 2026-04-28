import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/use-auth'
import { EmployeeInovacoesView } from './inovacoes/employee-view'
import { ManagerInovacoesView } from './inovacoes/manager-view'

export function InovacoesTab() {
  const { profile } = useAuth()
  const isManager = profile?.role === 'admin' || profile?.role === 'gestor'

  if (!isManager) {
    return <EmployeeInovacoesView />
  }

  return (
    <Tabs defaultValue="gerencial" className="w-full">
      <TabsList className="grid w-full grid-cols-2 max-w-md mb-6 bg-slate-100/80 p-1 border">
        <TabsTrigger
          value="gerencial"
          className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          Visão Gerencial
        </TabsTrigger>
        <TabsTrigger
          value="minhas_inovacoes"
          className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          Minhas Inovações
        </TabsTrigger>
      </TabsList>
      <TabsContent value="gerencial" className="animate-fade-in mt-0">
        <ManagerInovacoesView />
      </TabsContent>
      <TabsContent value="minhas_inovacoes" className="animate-fade-in mt-0">
        <EmployeeInovacoesView />
      </TabsContent>
    </Tabs>
  )
}

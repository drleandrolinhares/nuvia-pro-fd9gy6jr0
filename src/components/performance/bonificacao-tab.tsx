import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/use-auth'
import { EmployeeBonificacaoView } from './bonificacao/employee-view'
import { ManagerBonificacaoMatrix } from './bonificacao/manager-matrix'
import { ConfigBonificacaoView } from './bonificacao/config-view'
import { RankingBonificacaoView } from './bonificacao/ranking-view'

export function BonificacaoTab() {
  const { profile } = useAuth()
  const isManager = profile?.role === 'admin' || profile?.role === 'gestor'

  if (!isManager) {
    return <EmployeeBonificacaoView />
  }

  return (
    <Tabs defaultValue="matriz" className="w-full mt-6">
      <TabsList className="grid w-full grid-cols-3 max-w-2xl mb-6 bg-slate-100/80 p-1 border">
        <TabsTrigger
          value="matriz"
          className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          Matriz de Avaliação
        </TabsTrigger>
        <TabsTrigger
          value="ranking"
          className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          Ranking e Histórico
        </TabsTrigger>
        <TabsTrigger
          value="configuracao"
          className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          Configurações
        </TabsTrigger>
      </TabsList>

      <TabsContent value="matriz" className="animate-fade-in mt-0">
        <ManagerBonificacaoMatrix />
      </TabsContent>
      <TabsContent value="ranking" className="animate-fade-in mt-0">
        <RankingBonificacaoView />
      </TabsContent>
      <TabsContent value="configuracao" className="animate-fade-in mt-0">
        <ConfigBonificacaoView />
      </TabsContent>
    </Tabs>
  )
}

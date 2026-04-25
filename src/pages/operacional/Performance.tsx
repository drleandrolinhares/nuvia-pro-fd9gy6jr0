import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PPEPDMTab } from '@/components/performance/pp-pdm-tab'
import { BonificacaoTab } from '@/components/performance/bonificacao-tab'
import { Target } from 'lucide-react'

export default function Performance() {
  return (
    <div className="flex flex-col gap-6 p-6 pb-20 w-full max-w-[1600px] mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Target className="h-8 w-8 text-amber-500" />
          Performance
        </h1>
        <p className="text-slate-500">
          Acompanhe os indicadores de desempenho, feedbacks e bonificações da equipe.
        </p>
      </div>

      <Tabs defaultValue="carteira" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-3xl mb-6 bg-slate-100/80 p-1 border">
          <TabsTrigger
            value="carteira"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Carteira
          </TabsTrigger>
          <TabsTrigger
            value="pp-pdm"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            PP e PDM
          </TabsTrigger>
          <TabsTrigger
            value="bonificacao"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Bonificação Feijão com Arroz
          </TabsTrigger>
        </TabsList>
        <TabsContent value="carteira" className="animate-fade-in">
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-200 border-dashed">
            <h2 className="text-xl font-semibold text-slate-700 mb-2">Carteira</h2>
            <p className="text-slate-500 text-center max-w-md">
              Área reservada para as futuras funcionalidades da Carteira. Em breve você poderá
              configurar e visualizar estes dados aqui.
            </p>
          </div>
        </TabsContent>
        <TabsContent value="pp-pdm" className="animate-fade-in">
          <PPEPDMTab />
        </TabsContent>
        <TabsContent value="bonificacao" className="animate-fade-in">
          <BonificacaoTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

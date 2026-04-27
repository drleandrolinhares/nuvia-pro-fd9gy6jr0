import { Calculator, Clock, DollarSign, Users } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function Precificacao() {
  return (
    <div className="p-6 max-w-7xl mx-auto w-full animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-amber-500/20 rounded-lg">
          <Calculator className="w-6 h-6 text-amber-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">PRECIFICAÇÃO</h1>
          <p className="text-slate-400">
            Análise de custos, formação de preços e ocupação da clínica
          </p>
        </div>
      </div>

      <Tabs defaultValue="custo-hora" className="w-full">
        <TabsList className="flex w-full overflow-x-auto mb-6 justify-start bg-slate-900 border border-slate-800 p-1">
          <TabsTrigger
            value="custo-hora"
            className="whitespace-nowrap flex items-center gap-2 data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950"
          >
            <Clock className="w-4 h-4" />
            CUSTO HORA CLÍNICA
          </TabsTrigger>
          <TabsTrigger
            value="precificacao"
            className="whitespace-nowrap flex items-center gap-2 data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950"
          >
            <DollarSign className="w-4 h-4" />
            PRECIFICAÇÃO
          </TabsTrigger>
          <TabsTrigger
            value="ocupacao"
            className="whitespace-nowrap flex items-center gap-2 data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950"
          >
            <Users className="w-4 h-4" />
            OCUPAÇÃO DAS CADEIRAS
          </TabsTrigger>
        </TabsList>

        <TabsContent value="custo-hora" className="animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-center min-h-[400px]">
            <Clock className="w-16 h-16 text-slate-700 mb-4" />
            <h2 className="text-xl font-medium text-white mb-2">Custo Hora Clínica</h2>
            <p className="text-slate-400 max-w-md">
              Aguardando definições para os cálculos e parâmetros de Custo de Hora Clínica.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="precificacao" className="animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-center min-h-[400px]">
            <DollarSign className="w-16 h-16 text-slate-700 mb-4" />
            <h2 className="text-xl font-medium text-white mb-2">Precificação</h2>
            <p className="text-slate-400 max-w-md">
              Aguardando definições para os cálculos e estrutura de Precificação.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="ocupacao" className="animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-center min-h-[400px]">
            <Users className="w-16 h-16 text-slate-700 mb-4" />
            <h2 className="text-xl font-medium text-white mb-2">Ocupação das Cadeiras</h2>
            <p className="text-slate-400 max-w-md">
              Aguardando definições para os cálculos e indicadores de Ocupação das Cadeiras.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

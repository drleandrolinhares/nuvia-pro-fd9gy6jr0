import { Calculator, Clock, DollarSign, Users, Settings, Calendar, LineChart } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CustoHoraClinica } from '@/components/precificacao/CustoHoraClinica'
import { SegmentacaoAgenda } from '@/components/precificacao/SegmentacaoAgenda'
import { OcupacaoConsultorios } from '@/components/precificacao/OcupacaoConsultorios'
import { EstruturaPrecificacao } from '@/components/precificacao/EstruturaPrecificacao'
import { FatoresPrecificacao } from '@/components/precificacao/FatoresPrecificacao'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function Precificacao() {
  const [activeTab, setActiveTab] = useState('custo-hora')
  const [isConfigOpen, setIsConfigOpen] = useState(false)

  return (
    <div className="p-6 max-w-full mx-auto w-full animate-fade-in-up">
      <div className="bg-slate-900 border border-slate-800 border-l-4 border-l-amber-500 rounded-xl p-6 mb-6 flex items-center gap-4 shadow-sm">
        <div className="p-3 bg-amber-500/10 rounded-lg">
          <Calculator className="w-6 h-6 text-amber-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight uppercase">PRECIFICAÇÃO</h1>
          <p className="text-slate-400 text-sm mt-1">
            Análise de custos, formação de preços e ocupação da clínica
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
            value="segmentacao"
            className="whitespace-nowrap flex items-center gap-2 data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950"
          >
            <Calendar className="w-4 h-4" />
            SEGMENTAÇÃO DA AGENDA
          </TabsTrigger>
          <TabsTrigger
            value="ocupacao"
            className="whitespace-nowrap flex items-center gap-2 data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950"
          >
            <Users className="w-4 h-4" />
            OCUPAÇÃO DOS CONSULTÓRIOS
          </TabsTrigger>
          <TabsTrigger
            value="fatores"
            className="whitespace-nowrap flex items-center gap-2 data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950"
          >
            <LineChart className="w-4 h-4" />
            FATORES DE PRECIFICAÇÃO
          </TabsTrigger>

          {activeTab === 'segmentacao' && (
            <div className="ml-auto pl-2 pr-1 flex items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsConfigOpen(true)}
                className="bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white gap-2 h-8 text-xs hidden sm:flex"
              >
                <Settings className="w-3.5 h-3.5" />
                Configurar Listas
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsConfigOpen(true)}
                className="bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white h-8 w-8 sm:hidden"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          )}
        </TabsList>

        <TabsContent value="custo-hora" className="animate-fade-in mt-0">
          <CustoHoraClinica />
        </TabsContent>

        <TabsContent value="precificacao" className="animate-fade-in mt-0">
          <EstruturaPrecificacao />
        </TabsContent>

        <TabsContent value="segmentacao" className="animate-fade-in mt-0">
          <SegmentacaoAgenda isConfigOpen={isConfigOpen} setIsConfigOpen={setIsConfigOpen} />
        </TabsContent>

        <TabsContent value="ocupacao" className="animate-fade-in mt-0">
          <OcupacaoConsultorios />
        </TabsContent>

        <TabsContent value="fatores" className="animate-fade-in mt-0">
          <FatoresPrecificacao />
        </TabsContent>
      </Tabs>
    </div>
  )
}

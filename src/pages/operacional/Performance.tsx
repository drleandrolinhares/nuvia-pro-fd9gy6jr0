import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PPEPDMTab } from '@/components/performance/pp-pdm-tab'
import { BonificacaoTab } from '@/components/performance/bonificacao-tab'
import { CarteiraTab } from '@/components/performance/carteira-tab'
import { RelatorioRotinasTab } from '@/components/performance/relatorio-rotinas-tab'
import { SorrisoDosSonhosTab } from '@/components/performance/sorriso-dos-sonhos-tab'
import { InovacoesTab } from '@/components/performance/inovacoes-tab'
import { GoogleTab } from '@/components/performance/google-tab'
import { Target } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

export default function Performance() {
  const { profile } = useAuth()
  const isManager = profile?.role === 'admin' || profile?.role === 'gestor'
  return (
    <div className="flex flex-col gap-6 p-6 pb-20 w-full max-w-[1600px] mx-auto animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-slate-50 p-6 rounded-xl shadow-lg border-l-4 border-amber-500 relative">
        <div className="flex items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white pr-24 sm:pr-0 flex items-center gap-3 uppercase">
              <Target className="h-8 w-8 text-amber-500" />
              Performance
            </h1>
            <p className="text-slate-300 text-sm font-medium tracking-wide mt-1">
              Acompanhe os indicadores de desempenho, feedbacks, bonificações e rotinas da equipe.
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="carteira" className="w-full">
        <TabsList className="flex w-full overflow-x-auto max-w-5xl mb-6 justify-start">
          <TabsTrigger value="carteira" className="whitespace-nowrap">
            Carteira
          </TabsTrigger>
          <TabsTrigger value="pp-pdm" className="whitespace-nowrap">
            PP e PDM
          </TabsTrigger>
          {isManager && (
            <TabsTrigger value="bonificacao" className="whitespace-nowrap">
              Bonificação Feijão com Arroz
            </TabsTrigger>
          )}
          <TabsTrigger value="relatorio-rotinas" className="whitespace-nowrap">
            Relatório de Rotinas
          </TabsTrigger>
          <TabsTrigger value="sorriso-dos-sonhos" className="whitespace-nowrap">
            Sorriso dos Sonhos
          </TabsTrigger>
          <TabsTrigger value="inovacoes" className="whitespace-nowrap">
            Inovações
          </TabsTrigger>
          <TabsTrigger value="google" className="whitespace-nowrap">
            Google
          </TabsTrigger>
        </TabsList>
        <TabsContent value="carteira" className="animate-fade-in">
          <CarteiraTab />
        </TabsContent>
        <TabsContent value="pp-pdm" className="animate-fade-in">
          <PPEPDMTab />
        </TabsContent>
        {isManager && (
          <TabsContent value="bonificacao" className="animate-fade-in">
            <BonificacaoTab />
          </TabsContent>
        )}
        <TabsContent value="relatorio-rotinas" className="animate-fade-in">
          <RelatorioRotinasTab />
        </TabsContent>
        <TabsContent value="sorriso-dos-sonhos" className="animate-fade-in">
          <SorrisoDosSonhosTab />
        </TabsContent>
        <TabsContent value="inovacoes" className="animate-fade-in">
          <InovacoesTab />
        </TabsContent>
        <TabsContent value="google" className="animate-fade-in">
          <GoogleTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

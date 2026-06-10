import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfiguracaoFaixas } from '@/components/comissoes/configuracao-faixas'
import { ComissoesArea } from '@/components/comissoes/comissoes-area'

export default function ControleComissoes() {
  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-fade-in pb-20">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Controle de Comissões</h1>
        <p className="text-slate-400">
          Gerencie faixas percentuais, acompanhe lançamentos de vendas e visualize faturas de
          pagamentos.
        </p>
      </div>

      <Tabs defaultValue="dentistas" className="w-full">
        <TabsList className="bg-slate-900 border border-slate-800 h-auto p-1 shadow-sm">
          <TabsTrigger
            value="dentistas"
            className="py-2.5 px-6 data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500 transition-all text-sm font-semibold tracking-wide"
          >
            Comissões Dentistas
          </TabsTrigger>
          <TabsTrigger
            value="crc"
            className="py-2.5 px-6 data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500 transition-all text-sm font-semibold tracking-wide"
          >
            Comissões CRC
          </TabsTrigger>
          <TabsTrigger
            value="configuracao"
            className="py-2.5 px-6 data-[state=active]:bg-slate-800 text-slate-300 data-[state=active]:text-slate-100 transition-all text-sm font-semibold tracking-wide ml-auto"
          >
            Configuração de Faixas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dentistas" className="mt-6 focus-visible:outline-none">
          <ComissoesArea tipo="dentista" />
        </TabsContent>

        <TabsContent value="crc" className="mt-6 focus-visible:outline-none">
          <ComissoesArea tipo="crc" />
        </TabsContent>

        <TabsContent value="configuracao" className="mt-6 focus-visible:outline-none">
          <ConfiguracaoFaixas />
        </TabsContent>
      </Tabs>
    </div>
  )
}

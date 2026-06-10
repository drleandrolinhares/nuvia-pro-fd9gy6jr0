import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ComissoesList } from './comissoes-list'
import { FaturasList } from './faturas-list'

export function ComissoesArea({ tipo }: { tipo: 'dentista' | 'crc' }) {
  const label = tipo === 'dentista' ? 'Dentistas Avaliadores' : 'CRC Comercial'

  return (
    <Tabs defaultValue="vendas" className="w-full">
      <TabsList className="bg-slate-900/60 border border-slate-800 p-1">
        <TabsTrigger value="vendas" className="px-6 data-[state=active]:bg-slate-800 text-sm">
          Lançamentos Individuais
        </TabsTrigger>
        <TabsTrigger value="faturas" className="px-6 data-[state=active]:bg-slate-800 text-sm">
          Faturas Agrupadas
        </TabsTrigger>
      </TabsList>

      <TabsContent value="vendas" className="mt-6">
        <Card className="border-slate-800 bg-slate-900/40 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-slate-100">Lançamentos - {label}</CardTitle>
            <CardDescription className="text-slate-400">
              Visualize, edite e atualize o status das comissões diretamente associadas às vendas
              confirmadas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ComissoesList tipo={tipo} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="faturas" className="mt-6">
        <Card className="border-slate-800 bg-slate-900/40 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-slate-100">Faturas - {label}</CardTitle>
            <CardDescription className="text-slate-400">
              Acompanhe as faturas processadas no fechamento de mês contendo comissões agrupadas
              para os profissionais.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FaturasList tipo={tipo} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

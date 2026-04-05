import { Landmark } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FaixasManager } from '@/components/comercial/FaixasManager'
import { comissoesService } from '@/services/comissoes'

export default function ControleComissoes() {
  return (
    <div className="container mx-auto p-6 space-y-6 max-w-6xl animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-amber-500/10 rounded-lg">
          <Landmark className="w-6 h-6 text-amber-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Controle de Comissões
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie as regras e faixas de remuneração variável da equipe.
          </p>
        </div>
      </div>

      <Tabs defaultValue="dentista" className="w-full">
        <TabsList className="w-full max-w-md grid grid-cols-2 mb-6">
          <TabsTrigger value="dentista">Dentista Avaliador</TabsTrigger>
          <TabsTrigger value="crc">CRC Comercial</TabsTrigger>
        </TabsList>

        <TabsContent value="dentista" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Referências - Dentista Avaliador</CardTitle>
              <CardDescription>
                Configure as faixas de comissionamento baseadas no percentual de entrada recebido do
                paciente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FaixasManager service={comissoesService.dentista} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crc" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Referências - CRC Comercial</CardTitle>
              <CardDescription>
                Configure as faixas de comissionamento para a equipe de Relacionamento Comercial.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FaixasManager service={comissoesService.crc} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

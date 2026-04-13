import { Landmark } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FaixasManager } from '@/components/comercial/FaixasManager'
import { RelatorioComissoes } from '@/components/comercial/RelatorioComissoes'
import { comissoesService } from '@/services/comissoes'
import { useAuth } from '@/hooks/use-auth'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import FechamentoComissoes from './FechamentoComissoes'

export default function ControleComissoes() {
  const { user, profile } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [dentistaId, setDentistaId] = useState<string | null>(null)
  const [crcId, setCrcId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string | undefined>()

  useEffect(() => {
    if (!user || !profile) return
    const checkRoles = async () => {
      const isAdminCheck = profile.role === 'admin'
      setIsAdmin(isAdminCheck)

      const { data: dentista } = await supabase
        .from('dentistas_avaliadores')
        .select('id')
        .eq('usuario_id', user.id)
        .maybeSingle()
      if (dentista) setDentistaId(dentista.id)

      const { data: crc } = await supabase
        .from('crc_comercial')
        .select('id')
        .eq('usuario_id', user.id)
        .maybeSingle()
      if (crc) setCrcId(crc.id)

      if (isAdminCheck || dentista || crc) {
        setActiveTab('minhas')
      }
    }
    checkRoles()
  }, [user, profile])

  const showMinhasComissoes = isAdmin || dentistaId || crcId

  if (!activeTab) return null

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-amber-500/10 rounded-lg">
          <Landmark className="w-6 h-6 text-amber-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Controle de Comissões
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie as regras, acompanhe pagamentos e veja o histórico de comissionamento da
            equipe.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-4 mb-6 h-auto">
          {showMinhasComissoes && (
            <TabsTrigger value="minhas" className="py-2">
              {isAdmin ? 'Relatório Geral' : 'Minhas Comissões'}
            </TabsTrigger>
          )}
          {isAdmin && (
            <TabsTrigger value="dentista" className="py-2">
              Dentista Avaliador
            </TabsTrigger>
          )}
          {isAdmin && (
            <TabsTrigger value="crc" className="py-2">
              CRC Comercial
            </TabsTrigger>
          )}
          {isAdmin && (
            <TabsTrigger value="fechamento" className="py-2">
              Fechamento
            </TabsTrigger>
          )}
        </TabsList>

        {showMinhasComissoes && (
          <TabsContent value="minhas" className="mt-0">
            <RelatorioComissoes isAdmin={isAdmin} dentistaId={dentistaId} crcId={crcId} />
          </TabsContent>
        )}

        {isAdmin && (
          <>
            <TabsContent value="dentista" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Referências - Dentista Avaliador</CardTitle>
                  <CardDescription>
                    Configure as faixas de comissionamento baseadas no percentual de entrada
                    recebido do paciente.
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
                    Configure as faixas de comissionamento para a equipe de Relacionamento
                    Comercial.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FaixasManager service={comissoesService.crc} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fechamento" className="mt-0">
              <FechamentoComissoes />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  )
}

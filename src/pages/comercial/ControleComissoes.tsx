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
  const { user, profile, permissions } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [dentistaId, setDentistaId] = useState<string | null>(null)
  const [crcId, setCrcId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string | undefined>()

  useEffect(() => {
    if (!user || !profile) return
    const checkRoles = async () => {
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

      const isAdminCheck =
        profile.role === 'admin' ||
        (!dentista && !crc && permissions.includes('comercial_comissoes'))
      setIsAdmin(isAdminCheck)

      if (isAdminCheck || dentista || crc) {
        setActiveTab('minhas')
      }
    }
    checkRoles()
  }, [user, profile, permissions])

  const showMinhasComissoes = isAdmin || dentistaId || crcId

  if (!activeTab) return null

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-slate-900 p-6 rounded-xl border-l-4 border-amber-500 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-800 rounded-lg">
            <Landmark className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white uppercase">Comissões</h1>
            <p className="text-slate-400 mt-1 text-sm uppercase tracking-wider font-medium">
              Gerencie regras, pagamentos e histórico de comissionamento.
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-3 mb-6 h-auto bg-slate-200/50 p-1 rounded-lg gap-2">
          {showMinhasComissoes && (
            <TabsTrigger
              value="minhas"
              className="py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white text-slate-600 font-bold uppercase tracking-wider text-xs rounded-md transition-all"
            >
              {isAdmin ? 'Relatório Geral' : 'Minhas Comissões'}
            </TabsTrigger>
          )}
          {isAdmin && (
            <TabsTrigger
              value="fechamento"
              className="py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white text-slate-600 font-bold uppercase tracking-wider text-xs rounded-md transition-all"
            >
              Fechamento
            </TabsTrigger>
          )}
          {isAdmin && (
            <TabsTrigger
              value="configuracoes"
              className="py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white text-slate-600 font-bold uppercase tracking-wider text-xs rounded-md transition-all"
            >
              Configurações
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
            <TabsContent value="fechamento" className="mt-0">
              <FechamentoComissoes />
            </TabsContent>

            <TabsContent value="configuracoes" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Comissões</CardTitle>
                  <CardDescription>
                    Gerencie as faixas e regras de comissionamento para a equipe comercial.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="dentista" className="w-full">
                    <TabsList className="w-full grid grid-cols-1 md:grid-cols-2 mb-6 h-auto bg-slate-200/50 p-1 rounded-lg gap-2">
                      <TabsTrigger
                        value="dentista"
                        className="py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white text-slate-600 font-bold uppercase tracking-wider text-xs rounded-md transition-all"
                      >
                        Dentista Avaliador
                      </TabsTrigger>
                      <TabsTrigger
                        value="crc"
                        className="py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white text-slate-600 font-bold uppercase tracking-wider text-xs rounded-md transition-all"
                      >
                        CRC Comercial
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="dentista" className="mt-0 space-y-4">
                      <div>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                          Referências - Dentista Avaliador
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Configure as faixas de comissionamento baseadas no percentual de entrada
                          recebido do paciente.
                        </p>
                      </div>
                      <FaixasManager service={comissoesService.dentista} />
                    </TabsContent>

                    <TabsContent value="crc" className="mt-0 space-y-4">
                      <div>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                          Referências - CRC Comercial
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Configure as faixas de comissionamento para a equipe de Relacionamento
                          Comercial.
                        </p>
                      </div>
                      <FaixasManager service={comissoesService.crc} />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  )
}

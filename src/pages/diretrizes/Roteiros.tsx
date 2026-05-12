import { useState, useEffect } from 'react'
import { MapIcon, Settings, Loader2 } from 'lucide-react'
import { useRoteiros } from '@/hooks/use-roteiros'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { RoteirosContent } from '@/components/roteiros/roteiros-content'
import { SetoresManager } from '@/components/roteiros/setores-manager'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

export default function Roteiros() {
  const { setores, roteiros, loading, refresh } = useRoteiros()
  const [activeTab, setActiveTab] = useState<string>('')
  const [setorDialog, setSetorDialog] = useState(false)

  useEffect(() => {
    if (!activeTab && setores.length > 0) {
      setActiveTab(setores[0].id)
    }
  }, [setores, activeTab])

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-lg hidden sm:block">
            <MapIcon className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Guia de Roteiros Nuvia</h2>
            <p className="text-sm text-slate-400 mt-1">
              Padronize mensagens, áudios e vídeos para a equipe.
            </p>
          </div>
        </div>
        <Button
          onClick={() => setSetorDialog(true)}
          variant="outline"
          className="border-slate-600 hover:bg-slate-800 text-slate-200 hover:text-white shrink-0"
        >
          <Settings className="w-4 h-4 mr-2" />
          Gerenciar Setores
        </Button>
      </div>

      {loading && (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      )}

      {!loading && setores.length === 0 && (
        <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-8 shadow-sm flex flex-col items-center justify-center min-h-[300px] text-center">
          <MapIcon className="w-16 h-16 text-slate-500 mb-4 opacity-70" />
          <h3 className="text-xl font-medium text-slate-200">Nenhum setor cadastrado</h3>
          <p className="text-slate-400 mt-2 max-w-md">
            Comece criando os setores (ex: Recepção, Comercial) para organizar seus roteiros.
          </p>
          <Button
            onClick={() => setSetorDialog(true)}
            className="mt-6 bg-amber-600 hover:bg-amber-700 text-white"
          >
            Criar Primeiro Setor
          </Button>
        </div>
      )}

      {!loading && setores.length > 0 && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <ScrollArea className="w-full whitespace-nowrap rounded-md pb-2">
            <TabsList className="bg-slate-900 border border-slate-700 justify-start h-12 p-1 inline-flex w-max min-w-full">
              {setores.map((setor) => (
                <TabsTrigger
                  key={setor.id}
                  value={setor.id}
                  className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500 data-[state=active]:font-medium text-slate-400 hover:text-slate-200 min-w-[120px] transition-colors"
                >
                  {setor.nome}
                </TabsTrigger>
              ))}
            </TabsList>
            <ScrollBar orientation="horizontal" className="h-2 invisible md:visible" />
          </ScrollArea>

          {setores.map((setor) => (
            <TabsContent key={setor.id} value={setor.id} className="focus-visible:outline-none m-0">
              <RoteirosContent
                setor={setor}
                roteiros={roteiros.filter((r) => r.setor_id === setor.id)}
                onRefresh={refresh}
              />
            </TabsContent>
          ))}
        </Tabs>
      )}

      <SetoresManager
        open={setorDialog}
        onOpenChange={setSetorDialog}
        setores={setores}
        onSuccess={refresh}
      />
    </div>
  )
}

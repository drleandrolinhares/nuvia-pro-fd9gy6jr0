import { useState } from 'react'
import { FETPatientList } from '@/components/fet/fet-patient-list'
import { FETPatientDetail } from '@/components/fet/fet-patient-detail'
import { FETLogs } from '@/components/fet/fet-logs'
import { Activity } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function FET() {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('ativos')

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] md:h-full overflow-hidden">
      <PageHeader
        title="Ficha de evolução (FET)"
        description="Controle de execução e evolução dos tratamentos."
        icon={Activity}
        className="shrink-0 pb-3"
        actions={
          <Tabs
            value={activeTab}
            onValueChange={(v) => {
              setActiveTab(v)
              setSelectedPatientId(null)
            }}
            className="w-full sm:w-auto"
          >
            <TabsList className="h-9">
              <TabsTrigger value="ativos" className="text-xs font-semibold">
                Ativos
              </TabsTrigger>
              <TabsTrigger value="finalizados" className="text-xs font-semibold">
                Finalizados
              </TabsTrigger>
              <TabsTrigger value="logs" className="text-xs font-semibold">
                Auditoria
              </TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />

      <div className="flex flex-col md:flex-row flex-1 min-h-0 w-full max-w-full">
        {activeTab !== 'logs' ? (
          <div className="flex flex-col md:flex-row flex-1 gap-3 p-2 md:p-3 min-h-0 w-full max-w-full">
            <div className="w-full md:w-64 lg:w-72 h-full flex flex-col min-h-0 shrink-0">
              <FETPatientList
                status={activeTab === 'ativos' ? 'ativo' : 'finalizado'}
                selectedId={selectedPatientId}
                onSelect={setSelectedPatientId}
              />
            </div>
            <div className="w-full flex-1 h-full flex flex-col min-h-0">
              {selectedPatientId ? (
                <FETPatientDetail
                  patientId={selectedPatientId}
                  onStatusChange={() => setSelectedPatientId(null)}
                />
              ) : (
                <div className="flex flex-col flex-1 items-center justify-center border border-dashed border-border-strong/70 rounded-lg bg-muted/25 text-center p-8">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Activity className="w-8 h-8 text-muted-foreground/60" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    Nenhum paciente selecionado
                  </h3>
                  <p className="text-muted-foreground max-w-sm">
                    Selecione um paciente na lista ao lado ou crie um novo para visualizar e
                    gerenciar sua Ficha de Evolução de Tratamento.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 p-2 md:p-3 min-h-0 w-full max-w-full">
            <FETLogs />
          </div>
        )}
      </div>
    </div>
  )
}

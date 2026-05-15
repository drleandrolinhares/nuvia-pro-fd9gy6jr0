import { useState } from 'react'
import { FETPatientList } from '@/components/fet/fet-patient-list'
import { FETPatientDetail } from '@/components/fet/fet-patient-detail'
import { Activity } from 'lucide-react'

export default function FET() {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] md:h-full bg-slate-950 overflow-hidden rounded-xl border border-slate-800 shadow-2xl -mx-2 sm:-mx-4 md:-mx-8 lg:-mx-16 w-[calc(100%+1rem)] sm:w-[calc(100%+2rem)] md:w-[calc(100%+4rem)] lg:w-[calc(100%+8rem)] max-w-none">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800 bg-slate-900/30 shrink-0">
        <div className="p-2 bg-amber-500/10 rounded-lg shrink-0">
          <Activity className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight leading-tight">
            Ficha de Evolução (FET)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Controle de execução e evolução</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 gap-3 p-2 md:p-3 min-h-0 w-full max-w-full">
        <div className="w-full md:w-64 lg:w-72 h-full flex flex-col min-h-0 shrink-0">
          <FETPatientList selectedId={selectedPatientId} onSelect={setSelectedPatientId} />
        </div>
        <div className="w-full flex-1 h-full flex flex-col min-h-0">
          {selectedPatientId ? (
            <FETPatientDetail patientId={selectedPatientId} />
          ) : (
            <div className="flex flex-col flex-1 items-center justify-center border border-slate-800 border-dashed rounded-lg bg-slate-900/30 text-center p-8">
              <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-800">
                <Activity className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-300 mb-2">Nenhum Paciente Selecionado</h3>
              <p className="text-slate-500 max-w-sm">
                Selecione um paciente na lista ao lado ou crie um novo para visualizar e gerenciar
                sua Ficha de Evolução de Tratamento.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

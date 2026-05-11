import { MapIcon } from 'lucide-react'

export default function Roteiros() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-lg hidden sm:block">
            <MapIcon className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Roteiros</h2>
            <p className="text-sm text-slate-400 mt-1">Conteúdo em desenvolvimento...</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-8 shadow-sm flex flex-col items-center justify-center min-h-[400px] text-center">
        <MapIcon className="w-16 h-16 text-slate-600 mb-4 opacity-50" />
        <h3 className="text-xl font-medium text-slate-300">Página em Construção</h3>
        <p className="text-slate-500 mt-2 max-w-md">
          Esta área está reservada para os roteiros de atendimento e fluxos. As funcionalidades
          serão disponibilizadas em breve.
        </p>
      </div>
    </div>
  )
}

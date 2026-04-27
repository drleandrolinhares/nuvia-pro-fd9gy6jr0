import { Calculator } from 'lucide-react'

export default function Precificacao() {
  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-amber-500/20 rounded-lg">
          <Calculator className="w-6 h-6 text-amber-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">PRECIFICAÇÃO</h1>
          <p className="text-slate-400">Módulo em desenvolvimento</p>
        </div>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-center min-h-[400px]">
        <Calculator className="w-16 h-16 text-slate-700 mb-4" />
        <h2 className="text-xl font-medium text-white mb-2">Módulo Administrativo</h2>
        <p className="text-slate-400 max-w-md">
          Este espaço foi reservado para a nova funcionalidade de precificação. Em breve, novas
          ferramentas e opções serão adicionadas aqui.
        </p>
      </div>
    </div>
  )
}

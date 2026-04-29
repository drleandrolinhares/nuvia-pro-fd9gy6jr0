import { useState, useMemo } from 'react'
import {
  Search,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Clock,
  Calculator,
  Percent,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const MOCK_ESPES = [
  {
    id: '1',
    nome: 'Clínico Geral',
    procs: [
      { id: 'p1', nome: 'Restauração 1 Face' },
      { id: 'p2', nome: 'Restauração 2 Faces' },
      { id: 'p3', nome: 'Profilaxia' },
      { id: 'p4', nome: 'Clareamento Dental' },
    ],
  },
  {
    id: '2',
    nome: 'Endodontia',
    procs: [
      { id: 'p5', nome: 'Tratamento Canal Anterior' },
      { id: 'p6', nome: 'Tratamento Canal Posterior' },
      { id: 'p7', nome: 'Retratamento' },
    ],
  },
  {
    id: '3',
    nome: 'Ortodontia',
    procs: [
      { id: 'p8', nome: 'Manutenção Aparelho Fixo' },
      { id: 'p9', nome: 'Aparelho Invisalign' },
    ],
  },
  {
    id: '4',
    nome: 'Implantodontia',
    procs: [
      { id: 'p10', nome: 'Implante Unitário' },
      { id: 'p11', nome: 'Protocolo Superior' },
      { id: 'p12', nome: 'Enxerto Ósseo' },
    ],
  },
]

export function EstruturaPrecificacao() {
  const [expanded, setExpanded] = useState<string[]>(['1'])
  const [selProc, setSelProc] = useState<string>('p1')
  const [search, setSearch] = useState('')

  const toggle = (id: string) =>
    setExpanded((p) => (p.includes(id) ? p.filter((e) => e !== id) : [...p, id]))

  const filtered = useMemo(
    () =>
      MOCK_ESPES.map((e) => ({
        ...e,
        procs: e.procs.filter((p) => p.nome.toLowerCase().includes(search.toLowerCase())),
      })).filter((e) => e.procs.length > 0 || e.nome.toLowerCase().includes(search.toLowerCase())),
    [search],
  )

  const activeProc = useMemo(
    () => MOCK_ESPES.flatMap((e) => e.procs).find((p) => p.id === selProc),
    [selProc],
  )

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar */}
      <div className="w-full lg:w-[340px] bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-4 shadow-sm h-[650px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar procedimento..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              if (e.target.value) setExpanded(MOCK_ESPES.map((esp) => esp.id))
            }}
            className="pl-9 bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-amber-500"
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-3">
          {filtered.length > 0 ? (
            filtered.map((esp) => (
              <div key={esp.id} className="space-y-1">
                <button
                  onClick={() => toggle(esp.id)}
                  className="flex items-center w-full justify-between p-2.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-200 font-medium text-sm group"
                >
                  <span>{esp.nome}</span>
                  <span className="text-slate-500 group-hover:text-slate-300 transition-colors">
                    {expanded.includes(esp.id) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </span>
                </button>

                {expanded.includes(esp.id) && (
                  <div className="pl-3 pr-1 space-y-1 border-l border-slate-800 ml-3 mt-1">
                    {esp.procs.map((proc) => (
                      <button
                        key={proc.id}
                        onClick={() => setSelProc(proc.id)}
                        className={cn(
                          'w-full text-left px-3 py-2 text-sm rounded-lg transition-all duration-200 border',
                          selProc === proc.id
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 font-medium shadow-sm shadow-amber-500/5'
                            : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/80',
                        )}
                      >
                        {proc.nome}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-slate-500 text-sm">
              Nenhum procedimento encontrado.
            </div>
          )}
        </div>
      </div>

      {/* Main Dash */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 shadow-sm relative overflow-hidden flex flex-col">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />

        {activeProc ? (
          <div className="space-y-8 animate-fade-in relative z-10 flex-1 flex flex-col">
            <div className="pb-6 border-b border-slate-800">
              <h2 className="text-2xl font-bold text-white tracking-tight">{activeProc.nome}</h2>
              <p className="text-slate-400 text-sm mt-1">
                Defina os valores e tempo de execução para calcular os custos e margens de forma
                automática.
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 flex-1">
              <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-6 space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <Calculator className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Configuração Manual</h3>
                    <p className="text-xs text-slate-500">Insira os dados base</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Valor Cobrado (R$)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500/70" />
                      <Input
                        type="number"
                        placeholder="0,00"
                        defaultValue="150"
                        className="pl-10 h-12 bg-slate-900 border-slate-700 text-white text-lg font-medium focus-visible:ring-amber-500 focus-visible:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">
                      Tempo de Execução (Minutos)
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500/70" />
                      <Input
                        type="number"
                        placeholder="0"
                        defaultValue="30"
                        className="pl-10 h-12 bg-slate-900 border-slate-700 text-white text-lg font-medium focus-visible:ring-amber-500 focus-visible:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 space-y-6 flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <Percent className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Indicadores Automáticos</h3>
                    <p className="text-xs text-slate-500">Baseados no custo hora</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5">
                  <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-5 shadow-inner">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                      Custo do Procedimento
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-white tracking-tight">R$ 45,00</span>
                      <span className="text-sm text-slate-500 font-medium mb-1">estimado</span>
                    </div>
                  </div>

                  <div className="bg-slate-900/80 border border-amber-500/30 rounded-xl p-5 shadow-inner relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-bl-full" />
                    <p className="text-xs font-semibold text-amber-500/80 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Margem de Lucro
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-amber-400 tracking-tight">70%</span>
                      <span className="text-sm text-slate-500 font-medium mb-1">estimada</span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-700/50">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    * Os indicadores automáticos serão calculados com base no Custo Hora da Clínica
                    e o Tempo de Execução informado.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-auto pt-6 border-t border-slate-800">
              <Button className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-8 h-11 shadow-lg shadow-amber-500/20 transition-all">
                Salvar Configuração
              </Button>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-5 animate-fade-in relative z-10">
            <div className="p-5 bg-slate-800/50 rounded-full border border-slate-700">
              <Calculator className="w-10 h-10 text-slate-400" />
            </div>
            <div className="max-w-xs">
              <h3 className="text-lg font-medium text-white mb-2">
                Nenhum procedimento selecionado
              </h3>
              <p className="text-sm leading-relaxed">
                Selecione um procedimento na lista lateral para configurar sua precificação e
                visualizar indicadores.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

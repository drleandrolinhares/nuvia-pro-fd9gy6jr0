import { useState, useMemo } from 'react'
import {
  Search,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Clock,
  Calculator,
  Percent,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CurrencyInput } from './CurrencyInput'

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

type ProcData = { valor: number; tempo: number; lab: number; mat: number }

function GlobalVarRow({
  label,
  perc,
  onChange,
  calc,
}: {
  label: string
  perc: number
  onChange: (v: number) => void
  calc: number
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-2.5 bg-slate-900/50 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors">
      <span className="text-sm font-medium text-slate-300 flex-1">{label}</span>
      <div className="flex items-center gap-2 w-24 relative">
        <Input
          type="number"
          value={perc}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-9 pr-6 text-right bg-slate-950 border-slate-700 focus-visible:ring-blue-500"
        />
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">
          %
        </span>
      </div>
      <div className="text-sm font-bold text-slate-200 w-24 text-right">R$ {calc.toFixed(2)}</div>
    </div>
  )
}

export function EstruturaPrecificacao() {
  const [expanded, setExpanded] = useState<string[]>(['1'])
  const [selProc, setSelProc] = useState<string>('p1')
  const [search, setSearch] = useState('')

  const [procData, setProcData] = useState<Record<string, ProcData>>({
    p1: { valor: 150, tempo: 30, lab: 0, mat: 15 },
  })

  const [globals, setGlobals] = useState({
    cartao: 3,
    comissao: 5,
    inadimplencia: 2,
    imposto: 6,
    dentista: 30,
  })

  const toggle = (id: string) =>
    setExpanded((p) => (p.includes(id) ? p.filter((e) => e !== id) : [...p, id]))

  const updateData = (field: keyof ProcData, val: number) => {
    setProcData((p) => ({
      ...p,
      [selProc]: {
        ...(p[selProc] || { valor: 0, tempo: 30, lab: 0, mat: 0 }),
        [field]: val,
      },
    }))
  }

  const updateGlobal = (key: keyof typeof globals, val: number) => {
    setGlobals((p) => ({ ...p, [key]: val }))
  }

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

  const data = procData[selProc] || { valor: 0, tempo: 30, lab: 0, mat: 0 }

  // Cálculos Automáticos
  const CUSTO_HORA = 90 // Simulação do Custo Hora Clínica
  const custoMinuto = CUSTO_HORA / 60
  const custoFixo = data.tempo * custoMinuto
  const percCustoFixo = data.valor > 0 ? (custoFixo / data.valor) * 100 : 0

  const cartaoVal = (data.valor * globals.cartao) / 100
  const comissaoVal = (data.valor * globals.comissao) / 100
  const inadimplenciaVal = (data.valor * globals.inadimplencia) / 100
  const impostoVal = (data.valor * globals.imposto) / 100
  const dentistaVal = (data.valor * globals.dentista) / 100

  const totalVariavelVal =
    data.lab + data.mat + cartaoVal + comissaoVal + inadimplenciaVal + impostoVal + dentistaVal
  const percCustoVariavel = data.valor > 0 ? (totalVariavelVal / data.valor) * 100 : 0

  const custoTotal = custoFixo + totalVariavelVal
  const lucroValor = data.valor - custoTotal
  const margemLucroPerc = data.valor > 0 ? (lucroValor / data.valor) * 100 : 0

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar */}
      <div className="w-full lg:w-[340px] bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-4 shadow-sm h-[750px]">
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

        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
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
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm relative overflow-hidden flex flex-col">
        {activeProc ? (
          <div className="space-y-6 animate-fade-in relative z-10 flex-1 flex flex-col">
            {/* Cabeçalho e Cards Principais */}
            <div className="pb-6 border-b border-slate-800 flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">{activeProc.nome}</h2>
                <p className="text-slate-400 text-sm mt-1">
                  Configure os valores e veja a margem de lucro em tempo real.
                </p>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap gap-4 w-full xl:w-auto">
                <div className="bg-slate-900/80 border border-amber-500/50 rounded-xl p-4 flex-1 sm:w-[200px] shadow-sm shadow-amber-500/5">
                  <p className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" /> Valor Cobrado
                  </p>
                  <CurrencyInput value={data.valor} onChange={(v) => updateData('valor', v)} />
                </div>

                <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-4 flex-1 sm:w-[160px] shadow-sm flex flex-col justify-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5" /> Margem de Lucro
                  </p>
                  <div
                    className={cn(
                      'text-2xl font-bold tracking-tight',
                      margemLucroPerc >= 0 ? 'text-emerald-400' : 'text-red-400',
                    )}
                  >
                    {margemLucroPerc.toFixed(1)}%
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-4 flex-1 sm:w-[160px] shadow-sm flex flex-col justify-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" /> Lucro em R$
                  </p>
                  <div
                    className={cn(
                      'text-2xl font-bold tracking-tight',
                      lucroValor >= 0 ? 'text-emerald-400' : 'text-red-400',
                    )}
                  >
                    R$ {lucroValor.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Custos Fixos */}
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6 shadow-sm relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-600 rounded-l-xl" />
              <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-400" />
                Custos Fixos
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">
                    Tempo de Execução (Minutos)
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      type="number"
                      value={data.tempo}
                      onChange={(e) => updateData('tempo', Number(e.target.value))}
                      className="pl-9 h-11 bg-slate-950 border-slate-700 text-white font-medium focus-visible:ring-slate-500"
                    />
                  </div>
                </div>

                <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-800/80 flex flex-col justify-center pl-4">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">
                    Custo Fixo do Procedimento
                  </p>
                  <p className="text-xl font-bold text-slate-200">R$ {custoFixo.toFixed(2)}</p>
                </div>

                <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-800/80 flex flex-col justify-center pl-4">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">
                    % Relativo ao Valor Cobrado
                  </p>
                  <p className="text-xl font-bold text-slate-200">{percCustoFixo.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            {/* Custos Variáveis */}
            <div className="bg-slate-800/20 border border-slate-700/50 rounded-xl p-6 shadow-sm flex flex-col relative overflow-hidden flex-1">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/50 rounded-l-xl" />
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-blue-400" />
                Custos Variáveis
              </h3>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 flex-1">
                {/* Globais */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/50 pb-2">
                    Referência Global
                  </h4>
                  <div className="space-y-2.5">
                    <GlobalVarRow
                      label="Taxa do Cartão"
                      perc={globals.cartao}
                      onChange={(v) => updateGlobal('cartao', v)}
                      calc={cartaoVal}
                    />
                    <GlobalVarRow
                      label="Comissões"
                      perc={globals.comissao}
                      onChange={(v) => updateGlobal('comissao', v)}
                      calc={comissaoVal}
                    />
                    <GlobalVarRow
                      label="Inadimplência"
                      perc={globals.inadimplencia}
                      onChange={(v) => updateGlobal('inadimplencia', v)}
                      calc={inadimplenciaVal}
                    />
                    <GlobalVarRow
                      label="Imposto"
                      perc={globals.imposto}
                      onChange={(v) => updateGlobal('imposto', v)}
                      calc={impostoVal}
                    />
                    <GlobalVarRow
                      label="Dentista"
                      perc={globals.dentista}
                      onChange={(v) => updateGlobal('dentista', v)}
                      calc={dentistaVal}
                    />
                  </div>
                </div>

                {/* Específicos */}
                <div className="space-y-4 flex flex-col h-full">
                  <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/50 pb-2">
                    Específicos do Procedimento
                  </h4>
                  <div className="space-y-4">
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                      <label className="text-sm font-medium text-slate-300 mb-2 block">
                        Laboratório (R$)
                      </label>
                      <CurrencyInput value={data.lab} onChange={(v) => updateData('lab', v)} />
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                      <label className="text-sm font-medium text-slate-300 mb-2 block">
                        Custo com Material (R$)
                      </label>
                      <CurrencyInput value={data.mat} onChange={(v) => updateData('mat', v)} />
                    </div>
                  </div>

                  <div className="mt-auto pt-6">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex justify-between items-center">
                      <div>
                        <p className="text-xs text-blue-400/80 uppercase tracking-wider font-bold mb-1">
                          Carga Variável Total
                        </p>
                        <p className="text-2xl font-bold text-blue-400">
                          {percCustoVariavel.toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-blue-400/80 uppercase tracking-wider font-bold mb-1">
                          Total em R$
                        </p>
                        <p className="text-xl font-bold text-white">
                          R$ {totalVariavelVal.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
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

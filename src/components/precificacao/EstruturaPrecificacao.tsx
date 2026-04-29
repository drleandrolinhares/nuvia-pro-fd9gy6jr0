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
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CurrencyInput } from './CurrencyInput'
import { useAuth } from '@/hooks/use-auth'

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

type ProcData = { valor: number; tempo: number; lab: number; mat: number; dentista: number }

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
          className="h-9 pr-6 text-right bg-slate-950 border-slate-700 text-slate-200 focus-visible:ring-blue-500 font-medium"
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
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'

  const [espes, setEspes] = useState(MOCK_ESPES)
  const [expanded, setExpanded] = useState<string[]>(['1'])
  const [selProc, setSelProc] = useState<string>('p1')
  const [search, setSearch] = useState('')

  const [procData, setProcData] = useState<Record<string, ProcData>>({
    p1: { valor: 150, tempo: 30, lab: 0, mat: 15, dentista: 45 },
  })

  const [globals, setGlobals] = useState({
    cartao: 3,
    comissao: 5,
    inadimplencia: 2,
    imposto: 6,
  })

  const toggle = (id: string) =>
    setExpanded((p) => (p.includes(id) ? p.filter((e) => e !== id) : [...p, id]))

  const updateData = (field: keyof ProcData, val: number) => {
    setProcData((p) => ({
      ...p,
      [selProc]: {
        ...(p[selProc] || { valor: 0, tempo: 30, lab: 0, mat: 0, dentista: 0 }),
        [field]: val,
      },
    }))
  }

  const updateGlobal = (key: keyof typeof globals, val: number) => {
    setGlobals((p) => ({ ...p, [key]: val }))
  }

  const handleAddEspec = () => {
    const nome = window.prompt('Nome da nova especialidade:')
    if (nome) setEspes([...espes, { id: `e${Date.now()}`, nome, procs: [] }])
  }

  const handleEditEspec = (e: React.MouseEvent, espId: string) => {
    e.stopPropagation()
    const esp = espes.find((e) => e.id === espId)
    const nome = window.prompt('Editar especialidade:', esp?.nome)
    if (nome) setEspes(espes.map((e) => (e.id === espId ? { ...e, nome } : e)))
  }

  const handleDeleteEspec = (e: React.MouseEvent, espId: string) => {
    e.stopPropagation()
    if (window.confirm('Excluir esta especialidade e seus procedimentos?')) {
      setEspes(espes.filter((e) => e.id !== espId))
    }
  }

  const handleAddProc = (e: React.MouseEvent, espId: string) => {
    e.stopPropagation()
    const nome = window.prompt('Nome do novo procedimento:')
    if (nome) {
      const newProc = { id: `p${Date.now()}`, nome }
      setEspes(espes.map((e) => (e.id === espId ? { ...e, procs: [...e.procs, newProc] } : e)))
      setExpanded((p) => (p.includes(espId) ? p : [...p, espId]))
      setSelProc(newProc.id)
    }
  }

  const handleEditProc = (e: React.MouseEvent, espId: string, procId: string) => {
    e.stopPropagation()
    const esp = espes.find((e) => e.id === espId)
    const proc = esp?.procs.find((p) => p.id === procId)
    const nome = window.prompt('Editar procedimento:', proc?.nome)
    if (nome) {
      setEspes(
        espes.map((e) =>
          e.id === espId
            ? { ...e, procs: e.procs.map((p) => (p.id === procId ? { ...p, nome } : p)) }
            : e,
        ),
      )
    }
  }

  const handleDeleteProc = (e: React.MouseEvent, espId: string, procId: string) => {
    e.stopPropagation()
    if (window.confirm('Excluir este procedimento?')) {
      setEspes(
        espes.map((e) =>
          e.id === espId ? { ...e, procs: e.procs.filter((p) => p.id !== procId) } : e,
        ),
      )
      if (selProc === procId) setSelProc('')
    }
  }

  const filtered = useMemo(
    () =>
      espes
        .map((e) => ({
          ...e,
          procs: e.procs.filter((p) => p.nome.toLowerCase().includes(search.toLowerCase())),
        }))
        .filter((e) => e.procs.length > 0 || e.nome.toLowerCase().includes(search.toLowerCase())),
    [espes, search],
  )

  const activeProc = useMemo(
    () => espes.flatMap((e) => e.procs).find((p) => p.id === selProc),
    [espes, selProc],
  )

  const data = procData[selProc] || { valor: 0, tempo: 30, lab: 0, mat: 0, dentista: 0 }

  const CUSTO_HORA = 90
  const custoMinuto = CUSTO_HORA / 60
  const custoFixo = data.tempo * custoMinuto
  const percCustoFixo = data.valor > 0 ? (custoFixo / data.valor) * 100 : 0

  const cartaoVal = (data.valor * globals.cartao) / 100
  const comissaoVal = (data.valor * globals.comissao) / 100
  const inadimplenciaVal = (data.valor * globals.inadimplencia) / 100
  const impostoVal = (data.valor * globals.imposto) / 100
  const dentistaVal = data.dentista || 0

  const totalVariavelVal =
    data.lab + data.mat + dentistaVal + cartaoVal + comissaoVal + inadimplenciaVal + impostoVal
  const percCustoVariavel = data.valor > 0 ? (totalVariavelVal / data.valor) * 100 : 0

  const custoTotal = custoFixo + totalVariavelVal
  const lucroValor = data.valor - custoTotal
  const margemLucroPerc = data.valor > 0 ? (lucroValor / data.valor) * 100 : 0

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-stretch min-h-[750px]">
      {/* Sidebar */}
      <div className="w-full lg:w-[380px] bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-4 shadow-sm">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar procedimento..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                if (e.target.value) setExpanded(espes.map((esp) => esp.id))
              }}
              className="pl-9 bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-amber-500"
            />
          </div>
          {isAdmin && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleAddEspec}
              className="bg-slate-950 border-slate-800 text-amber-500 hover:bg-slate-900 hover:text-amber-400 shrink-0"
              title="Nova Especialidade"
            >
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
          {filtered.length > 0 ? (
            filtered.map((esp) => (
              <div key={esp.id} className="space-y-1 group/esp">
                <div
                  onClick={() => toggle(esp.id)}
                  className="flex items-center w-full justify-between p-2.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-200 font-medium text-sm cursor-pointer"
                >
                  <span className="truncate text-[15px]">{esp.nome}</span>
                  <div className="flex items-center gap-1">
                    {isAdmin && (
                      <div className="hidden group-hover/esp:flex items-center gap-1 mr-2">
                        <div
                          onClick={(e) => handleAddProc(e, esp.id)}
                          className="p-1.5 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                          title="Novo Procedimento"
                        >
                          <Plus className="w-4 h-4" />
                        </div>
                        <div
                          onClick={(e) => handleEditEspec(e, esp.id)}
                          className="p-1.5 text-slate-400 hover:text-blue-400 transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </div>
                        <div
                          onClick={(e) => handleDeleteEspec(e, esp.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </div>
                      </div>
                    )}
                    <span className="text-slate-500 group-hover/esp:text-slate-300 transition-colors">
                      {expanded.includes(esp.id) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </span>
                  </div>
                </div>

                {expanded.includes(esp.id) && (
                  <div className="pl-3 pr-1 space-y-1 border-l border-slate-800 ml-3 mt-1">
                    {esp.procs.map((proc) => (
                      <div
                        key={proc.id}
                        className={cn(
                          'w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all duration-200 border group/proc',
                          selProc === proc.id
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 font-medium shadow-sm shadow-amber-500/5'
                            : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/80',
                        )}
                      >
                        <button
                          onClick={() => setSelProc(proc.id)}
                          className="flex-1 text-left truncate text-[14px]"
                        >
                          {proc.nome}
                        </button>

                        {isAdmin && (
                          <div className="hidden group-hover/proc:flex items-center gap-1 ml-2">
                            <button
                              onClick={(e) => handleEditProc(e, esp.id, proc.id)}
                              className="p-1.5 text-slate-400 hover:text-blue-400 transition-colors"
                              title="Editar"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteProc(e, esp.id, proc.id)}
                              className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
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
            <div className="pb-6 border-b border-slate-800 flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center">
              <div>
                <h2 className="text-3xl font-bold text-white tracking-tight">{activeProc.nome}</h2>
                <p className="text-slate-400 text-base mt-1.5">
                  Configure os valores e veja a margem de lucro em tempo real.
                </p>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap gap-4 w-full xl:w-auto">
                <div className="bg-slate-900/80 border border-amber-500/50 rounded-xl p-4 flex-1 sm:w-[220px] shadow-sm shadow-amber-500/5">
                  <p className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4" /> Valor Cobrado
                  </p>
                  <CurrencyInput value={data.valor} onChange={(v) => updateData('valor', v)} />
                </div>

                <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-4 flex-1 sm:w-[180px] shadow-sm flex flex-col justify-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Percent className="w-4 h-4" /> Margem de Lucro
                  </p>
                  <div
                    className={cn(
                      'text-3xl font-bold tracking-tight',
                      margemLucroPerc >= 0 ? 'text-emerald-400' : 'text-red-400',
                    )}
                  >
                    {margemLucroPerc.toFixed(1)}%
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-4 flex-1 sm:w-[180px] shadow-sm flex flex-col justify-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4" /> Lucro em R$
                  </p>
                  <div
                    className={cn(
                      'text-3xl font-bold tracking-tight',
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
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-400" />
                Custos Fixos
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/80 flex flex-col justify-center shadow-sm">
                  <label className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-3 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-500" />
                    Tempo de Execução (Minutos)
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={data.tempo}
                      onChange={(e) => updateData('tempo', Number(e.target.value))}
                      className="h-12 bg-slate-900 border-slate-700 text-white font-bold text-lg focus-visible:ring-amber-500 text-center"
                    />
                  </div>
                </div>

                <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/80 flex flex-col justify-center shadow-sm">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-2 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-slate-500" />
                    CUSTO FIXO EM R$
                  </p>
                  <p className="text-3xl font-bold text-slate-200 tracking-tight mt-1">
                    R$ {custoFixo.toFixed(2)}
                  </p>
                </div>

                <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/80 flex flex-col justify-center shadow-sm">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-2 flex items-center gap-1.5">
                    <Percent className="w-4 h-4 text-slate-500" />
                    CUSTO FIXO EM %
                  </p>
                  <p className="text-3xl font-bold text-slate-200 tracking-tight mt-1">
                    {percCustoFixo.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Custos Variáveis */}
            <div className="bg-slate-800/20 border border-slate-700/50 rounded-xl p-6 shadow-sm flex flex-col relative overflow-hidden flex-1">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/50 rounded-l-xl" />
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-blue-400" />
                Custos Variáveis
              </h3>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 flex-1">
                {/* Globais */}
                <div className="space-y-5">
                  <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/50 pb-2">
                    Referência Global
                  </h4>
                  <div className="space-y-3">
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
                  </div>
                </div>

                {/* Específicos */}
                <div className="space-y-5 flex flex-col h-full">
                  <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/50 pb-2">
                    Custo do Procedimento
                  </h4>
                  <div className="space-y-4">
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                      <label className="text-[15px] font-medium text-slate-300 mb-2 block">
                        Honorários Dentista (R$)
                      </label>
                      <CurrencyInput
                        value={data.dentista || 0}
                        onChange={(v) => updateData('dentista', v)}
                      />
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                      <label className="text-[15px] font-medium text-slate-300 mb-2 block">
                        Laboratório (R$)
                      </label>
                      <CurrencyInput value={data.lab} onChange={(v) => updateData('lab', v)} />
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                      <label className="text-[15px] font-medium text-slate-300 mb-2 block">
                        Custo com Material (R$)
                      </label>
                      <CurrencyInput value={data.mat} onChange={(v) => updateData('mat', v)} />
                    </div>
                  </div>

                  <div className="mt-auto pt-6">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5 flex justify-between items-center">
                      <div>
                        <p className="text-xs text-blue-400/80 uppercase tracking-wider font-bold mb-1">
                          Carga Variável Total
                        </p>
                        <p className="text-3xl font-bold text-blue-400">
                          {percCustoVariavel.toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-blue-400/80 uppercase tracking-wider font-bold mb-1">
                          Total em R$
                        </p>
                        <p className="text-2xl font-bold text-white">
                          R$ {totalVariavelVal.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <Button className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-8 h-12 text-base shadow-lg shadow-amber-500/20 transition-all">
                Salvar Configuração
              </Button>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-5 animate-fade-in relative z-10 flex-1">
            <div className="p-6 bg-slate-800/50 rounded-full border border-slate-700">
              <Calculator className="w-12 h-12 text-slate-400" />
            </div>
            <div className="max-w-sm">
              <h3 className="text-xl font-medium text-white mb-3">
                Nenhum procedimento selecionado
              </h3>
              <p className="text-base leading-relaxed">
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

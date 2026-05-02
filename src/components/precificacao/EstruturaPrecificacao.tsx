import { useState, useMemo, useEffect } from 'react'
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
  Loader2,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CurrencyInput } from './CurrencyInput'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

type Especialidade = {
  id: string
  nome: string
}

type Procedimento = {
  id: string
  especialidade_id: string
  nome: string
  valor_cobrado: number
  tempo_execucao: number
  custo_laboratorio: number
  custo_material: number
  honorarios_dentista: number
}

type GlobalVars = {
  id: string
  taxa_cartao: number
  comissao: number
  inadimplencia: number
  imposto: number
}

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
    <div className="flex items-center justify-between gap-4 p-3.5 bg-slate-900/80 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors shadow-sm">
      <span className="text-base font-semibold text-slate-100 flex-1">{label}</span>
      <div className="flex items-center gap-2 w-28 relative">
        <Input
          type="number"
          value={perc}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-11 pr-8 text-right bg-slate-950 border-slate-500 text-white focus-visible:ring-blue-400 font-bold text-base"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">
          %
        </span>
      </div>
      <div className="text-base font-bold text-emerald-400 w-28 text-right">
        R$ {calc.toFixed(2)}
      </div>
    </div>
  )
}

export function EstruturaPrecificacao() {
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([])
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([])
  const [globals, setGlobals] = useState<GlobalVars>({
    id: '',
    taxa_cartao: 3,
    comissao: 5,
    inadimplencia: 2,
    imposto: 6,
  })
  const [horasTrabalhadas, setHorasTrabalhadas] = useState(0)
  const [custosFixos, setCustosFixos] = useState(0)

  const [expanded, setExpanded] = useState<string[]>([])
  const [selProc, setSelProc] = useState<string>('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const [resEsp, resProc, resGlob, resOcupacao, resCustos] = await Promise.all([
      supabase
        .from('precificacao_especialidades' as any)
        .select('*')
        .order('nome'),
      supabase.from('precificacao_procedimentos').select('*').order('nome'),
      supabase.from('precificacao_globais').select('*').limit(1).single(),
      supabase.from('precificacao_ocupacao_cadeiras' as any).select('horas_trabalhadas'),
      supabase.from('precificacao_custos_fixos' as any).select('valor'),
    ])

    if (resEsp.data) {
      setEspecialidades(resEsp.data as any)
      setExpanded((resEsp.data as any).map((e: any) => e.id))
    }
    if (resProc.data) {
      setProcedimentos(resProc.data)
      if (resProc.data.length > 0) setSelProc(resProc.data[0].id)
    }
    if (resGlob.data) setGlobals(resGlob.data as any)
    if (resOcupacao.data) {
      setHorasTrabalhadas(
        resOcupacao.data.reduce((acc, curr) => acc + (Number(curr.horas_trabalhadas) || 0), 0),
      )
    }
    if (resCustos.data) {
      setCustosFixos(resCustos.data.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0))
    }
    setLoading(false)
  }

  const toggle = (id: string) =>
    setExpanded((p) => (p.includes(id) ? p.filter((e) => e !== id) : [...p, id]))

  const updateProcData = (field: keyof Procedimento, val: number) => {
    setProcedimentos((p) => p.map((x) => (x.id === selProc ? { ...x, [field]: val } : x)))
  }

  const updateGlobal = (key: keyof GlobalVars, val: number) => {
    setGlobals((p) => ({ ...p, [key]: val }))
  }

  const handleAddEspec = async () => {
    const nome = window.prompt('Nome da nova especialidade:')
    if (!nome) return
    const { data, error } = await supabase
      .from('precificacao_especialidades' as any)
      .insert({ nome })
      .select()
      .single()
    if (error) {
      if (error.code === '23505') toast.error('Especialidade já existe.')
      else toast.error('Erro ao adicionar.')
      return
    }
    setEspecialidades((p) => [...p, data as any])
  }

  const handleEditEspec = async (e: React.MouseEvent, espId: string) => {
    e.stopPropagation()
    const esp = especialidades.find((x) => x.id === espId)
    if (!esp) return
    const nome = window.prompt('Editar especialidade:', esp.nome)
    if (!nome || nome === esp.nome) return
    const { error } = await supabase
      .from('precificacao_especialidades' as any)
      .update({ nome })
      .eq('id', espId)
    if (error) toast.error('Erro ao editar especialidade.')
    else setEspecialidades((p) => p.map((x) => (x.id === espId ? { ...x, nome } : x)))
  }

  const handleDeleteEspec = async (e: React.MouseEvent, espId: string) => {
    e.stopPropagation()
    if (!window.confirm('Excluir esta especialidade e todos os seus procedimentos?')) return
    const { error } = await supabase
      .from('precificacao_especialidades' as any)
      .delete()
      .eq('id', espId)
    if (error) toast.error('Erro ao excluir.')
    else {
      setEspecialidades((p) => p.filter((x) => x.id !== espId))
      setProcedimentos((p) => p.filter((x) => x.especialidade_id !== espId))
      if (procedimentos.find((p) => p.id === selProc)?.especialidade_id === espId) setSelProc('')
    }
  }

  const handleAddProc = async (e: React.MouseEvent, espId: string) => {
    e.stopPropagation()
    const nome = window.prompt('Nome do novo procedimento:')
    if (!nome) return
    const { data, error } = await supabase
      .from('precificacao_procedimentos')
      .insert({
        especialidade_id: espId,
        nome,
        valor_cobrado: 0,
        tempo_execucao: 30,
        custo_laboratorio: 0,
        custo_material: 0,
        honorarios_dentista: 0,
      })
      .select()
      .single()
    if (error) {
      toast.error('Erro ao adicionar procedimento.')
      return
    }
    setProcedimentos((p) => [...p, data])
    setExpanded((p) => (p.includes(espId) ? p : [...p, espId]))
    setSelProc(data.id)
  }

  const handleEditProc = async (e: React.MouseEvent, procId: string) => {
    e.stopPropagation()
    const proc = procedimentos.find((x) => x.id === procId)
    if (!proc) return
    const nome = window.prompt('Editar procedimento:', proc.nome)
    if (!nome || nome === proc.nome) return
    const { error } = await supabase
      .from('precificacao_procedimentos')
      .update({ nome })
      .eq('id', procId)
    if (error) toast.error('Erro ao editar procedimento.')
    else setProcedimentos((p) => p.map((x) => (x.id === procId ? { ...x, nome } : x)))
  }

  const handleDeleteProc = async (e: React.MouseEvent, procId: string) => {
    e.stopPropagation()
    if (!window.confirm('Excluir este procedimento?')) return
    const { error } = await supabase.from('precificacao_procedimentos').delete().eq('id', procId)
    if (error) toast.error('Erro ao excluir.')
    else {
      setProcedimentos((p) => p.filter((x) => x.id !== procId))
      if (selProc === procId) setSelProc('')
    }
  }

  const handleSave = async () => {
    if (!selProc) return
    setSaving(true)
    try {
      const proc = procedimentos.find((p) => p.id === selProc)
      if (proc) {
        const { error: errProc } = await supabase
          .from('precificacao_procedimentos')
          .update({
            valor_cobrado: proc.valor_cobrado,
            tempo_execucao: proc.tempo_execucao,
            custo_laboratorio: proc.custo_laboratorio,
            custo_material: proc.custo_material,
            honorarios_dentista: proc.honorarios_dentista,
          })
          .eq('id', proc.id)
        if (errProc) throw errProc
      }

      if (globals.id) {
        const { error: errGlob } = await supabase
          .from('precificacao_globais')
          .update({
            taxa_cartao: globals.taxa_cartao,
            comissao: globals.comissao,
            inadimplencia: globals.inadimplencia,
            imposto: globals.imposto,
          })
          .eq('id', globals.id)
        if (errGlob) throw errGlob
      }
      toast.success('Configuração salva com sucesso!')
    } catch (error) {
      toast.error('Erro ao salvar as configurações.')
    } finally {
      setSaving(false)
    }
  }

  const filteredEspes = useMemo(() => {
    return especialidades
      .map((esp) => {
        const procs = procedimentos
          .filter((p) => p.especialidade_id === esp.id)
          .filter((p) => p.nome.toLowerCase().includes(search.toLowerCase()))
        return { ...esp, procs }
      })
      .filter(
        (esp) => esp.procs.length > 0 || esp.nome.toLowerCase().includes(search.toLowerCase()),
      )
  }, [especialidades, procedimentos, search])

  const activeProc = useMemo(
    () => procedimentos.find((p) => p.id === selProc),
    [procedimentos, selProc],
  )

  if (loading) {
    return (
      <div className="flex h-[750px] items-center justify-center bg-slate-900 border border-slate-800 rounded-xl shadow-sm">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
      </div>
    )
  }

  const data = activeProc || {
    valor_cobrado: 0,
    tempo_execucao: 30,
    custo_laboratorio: 0,
    custo_material: 0,
    honorarios_dentista: 0,
  }

  const totalHorasDesconto = horasTrabalhadas * 0.8
  const totalCustoHora = totalHorasDesconto > 0 ? custosFixos / totalHorasDesconto : 0
  const totalCustoHoraFator = totalCustoHora * 1.15
  const custoMinuto = totalCustoHoraFator / 60

  const custoFixo = (data.tempo_execucao || 0) * custoMinuto
  const percCustoFixo = (data.valor_cobrado || 0) > 0 ? (custoFixo / data.valor_cobrado) * 100 : 0

  const cartaoVal = ((data.valor_cobrado || 0) * globals.taxa_cartao) / 100
  const comissaoVal = ((data.valor_cobrado || 0) * globals.comissao) / 100
  const inadimplenciaVal = ((data.valor_cobrado || 0) * globals.inadimplencia) / 100
  const impostoVal = ((data.valor_cobrado || 0) * globals.imposto) / 100
  const dentistaVal = data.honorarios_dentista || 0

  const totalVariavelVal =
    (data.custo_laboratorio || 0) +
    (data.custo_material || 0) +
    cartaoVal +
    comissaoVal +
    inadimplenciaVal

  const percCustoVariavel =
    (data.valor_cobrado || 0) > 0 ? (totalVariavelVal / data.valor_cobrado) * 100 : 0

  const custoTotal = custoFixo + totalVariavelVal + dentistaVal + impostoVal
  const lucroValor = (data.valor_cobrado || 0) - custoTotal

  const percDentista = (data.valor_cobrado || 0) > 0 ? (dentistaVal / data.valor_cobrado) * 100 : 0
  const margemLucroPerc =
    (data.valor_cobrado || 0) > 0 ? (lucroValor / data.valor_cobrado) * 100 : 0

  // Cálculo Valor Mínimo para meta de 30%
  const cvPercTotal =
    globals.taxa_cartao + globals.comissao + globals.inadimplencia + globals.imposto
  const despesasFixasReais =
    custoFixo + (data.custo_laboratorio || 0) + (data.custo_material || 0) + dentistaVal
  const denom = 1 - 30 / 100 - cvPercTotal / 100
  const valorMinimo = denom > 0 ? despesasFixasReais / denom : 0

  const getProfitColor = (margin: number) => {
    if (margin < 20) return 'text-red-500'
    if (margin < 25) return 'text-amber-500'
    return 'text-emerald-500'
  }
  const profitColorClass = getProfitColor(margemLucroPerc)

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-stretch min-h-[750px]">
      {/* Sidebar */}
      <div className="w-full lg:w-[420px] bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 shadow-sm self-stretch h-auto">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar procedimento..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                if (e.target.value) setExpanded(especialidades.map((esp) => esp.id))
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

        <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar mt-2">
          {filteredEspes.length > 0 ? (
            filteredEspes.map((esp) => (
              <div key={esp.id} className="space-y-1 group/esp">
                <div
                  onClick={() => toggle(esp.id)}
                  className="flex items-center w-full justify-between py-2 px-3 rounded-md hover:bg-slate-800/50 transition-colors text-amber-500 hover:text-amber-400 cursor-pointer"
                >
                  <span className="truncate text-xs font-bold uppercase tracking-wider">
                    {esp.nome}
                  </span>
                  <div className="flex items-center gap-1">
                    {isAdmin && (
                      <div className="hidden group-hover/esp:flex items-center gap-1 mr-2">
                        <div
                          onClick={(e) => handleAddProc(e, esp.id)}
                          className="p-1 text-amber-500/70 hover:text-emerald-400 transition-colors cursor-pointer"
                          title="Novo Procedimento"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </div>
                        <div
                          onClick={(e) => handleEditEspec(e, esp.id)}
                          className="p-1 text-amber-500/70 hover:text-blue-400 transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </div>
                        <div
                          onClick={(e) => handleDeleteEspec(e, esp.id)}
                          className="p-1 text-amber-500/70 hover:text-red-400 transition-colors cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    )}
                    <span className="text-amber-500/70 group-hover/esp:text-amber-400 transition-colors">
                      {expanded.includes(esp.id) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </span>
                  </div>
                </div>

                {expanded.includes(esp.id) && (
                  <div className="space-y-0.5 ml-3 pl-2 border-l border-slate-800/50">
                    {esp.procs.map((proc) => (
                      <div
                        key={proc.id}
                        className={cn(
                          'w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-all duration-200 group/proc relative',
                          selProc === proc.id
                            ? 'bg-slate-800/80 text-white font-medium shadow-sm'
                            : 'bg-transparent text-slate-300 hover:text-white hover:bg-slate-800/40',
                        )}
                      >
                        <button
                          onClick={() => setSelProc(proc.id)}
                          className="flex-1 text-left truncate flex items-center gap-2"
                        >
                          <div
                            className={cn(
                              'w-1.5 h-1.5 rounded-full transition-colors',
                              selProc === proc.id
                                ? 'bg-amber-500'
                                : 'bg-slate-600 group-hover/proc:bg-slate-400',
                            )}
                          />
                          {proc.nome}
                        </button>

                        {isAdmin && (
                          <div className="hidden group-hover/proc:flex items-center gap-1 ml-2">
                            <button
                              onClick={(e) => handleEditProc(e, proc.id)}
                              className="p-1 text-slate-400 hover:text-blue-400 transition-colors"
                              title="Editar"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteProc(e, proc.id)}
                              className="p-1 text-slate-400 hover:text-red-400 transition-colors"
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
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm relative flex flex-col">
        {activeProc ? (
          <div className="space-y-6 animate-fade-in relative z-10 flex-1 flex flex-col">
            <div className="pb-6 border-b border-slate-800 flex flex-col gap-6">
              <div>
                <h2 className="text-3xl font-bold text-white tracking-tight">{activeProc.nome}</h2>
                <p className="text-slate-400 text-base mt-1.5">
                  Configure os valores e veja a margem de lucro em tempo real.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/80 border-2 border-amber-500/50 rounded-xl p-6 flex flex-col justify-center shadow-sm shadow-amber-500/10 min-h-[130px]">
                  <p className="text-sm font-bold text-amber-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <DollarSign className="w-5 h-5" /> Valor Cobrado
                  </p>
                  <div>
                    <CurrencyInput
                      value={data.valor_cobrado}
                      onChange={(v) => updateProcData('valor_cobrado', v)}
                      className="h-auto py-1 text-4xl lg:text-5xl font-bold tracking-tight pl-14 lg:pl-16 pr-0 border-transparent bg-transparent focus:bg-slate-950/50 transition-all text-white focus:text-white shadow-none text-left"
                      iconClassName="text-2xl lg:text-3xl text-amber-500/80 left-0"
                    />
                  </div>
                  <div className="mt-4 pt-3 border-t border-amber-500/20 flex justify-between items-center">
                    <span className="text-xs font-bold text-amber-500/80 uppercase">
                      Valor Mínimo (30% Lucro)
                    </span>
                    <span className="text-sm font-bold text-amber-400">
                      R$ {valorMinimo.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-6 flex flex-col justify-center shadow-sm min-h-[130px]">
                  <p
                    className={cn(
                      'text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5',
                      profitColorClass,
                    )}
                  >
                    <Percent className="w-5 h-5" /> Margem de Lucro
                  </p>
                  <div className={cn('text-4xl font-bold tracking-tight', profitColorClass)}>
                    {margemLucroPerc.toFixed(2)}%
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-6 flex flex-col justify-center shadow-sm min-h-[130px]">
                  <p
                    className={cn(
                      'text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5',
                      profitColorClass,
                    )}
                  >
                    <TrendingUp className="w-5 h-5" /> Lucro em R$
                  </p>
                  <div className={cn('text-4xl font-bold tracking-tight', profitColorClass)}>
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
                <div className="bg-slate-950/50 rounded-xl p-6 border border-slate-800/80 flex flex-col justify-center shadow-sm min-h-[130px]">
                  <label className="text-sm text-slate-300 uppercase tracking-wider font-bold mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-slate-400" />
                    Tempo de Execução (Minutos)
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={data.tempo_execucao}
                      onChange={(e) => updateProcData('tempo_execucao', Number(e.target.value))}
                      className="h-12 bg-slate-900 border-slate-600 text-white font-bold text-2xl focus-visible:ring-amber-500 text-center"
                    />
                  </div>
                </div>

                <div className="bg-slate-950/50 rounded-xl p-6 border border-slate-800/80 flex flex-col justify-center shadow-sm min-h-[130px]">
                  <p className="text-sm text-slate-300 uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-slate-400" />
                    CUSTO FIXO EM R$
                  </p>
                  <p className="text-4xl font-bold text-white tracking-tight mt-1">
                    R$ {custoFixo.toFixed(2)}
                  </p>
                </div>

                <div className="bg-slate-950/50 rounded-xl p-6 border border-slate-800/80 flex flex-col justify-center shadow-sm min-h-[130px]">
                  <p className="text-sm text-slate-300 uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                    <Percent className="w-5 h-5 text-slate-400" />
                    CUSTO FIXO EM %
                  </p>
                  <p className="text-4xl font-bold text-white tracking-tight mt-1">
                    {percCustoFixo.toFixed(2)}%
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
                      perc={globals.taxa_cartao}
                      onChange={(v) => updateGlobal('taxa_cartao', v)}
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
                  </div>
                </div>

                {/* Específicos */}
                <div className="space-y-5 flex flex-col h-full">
                  <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/50 pb-2">
                    Custo do Procedimento
                  </h4>
                  <div className="space-y-4">
                    <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-600 shadow-sm flex items-center justify-between gap-4">
                      <label className="text-base font-bold text-slate-100 flex-1">
                        Laboratório (R$)
                      </label>
                      <div className="w-40 currency-wrapper-lg">
                        <CurrencyInput
                          value={data.custo_laboratorio}
                          onChange={(v) => updateProcData('custo_laboratorio', v)}
                        />
                      </div>
                    </div>
                    <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-600 shadow-sm flex items-center justify-between gap-4">
                      <label className="text-base font-bold text-slate-100 flex-1">
                        Custo com Material (R$)
                      </label>
                      <div className="w-40 currency-wrapper-lg">
                        <CurrencyInput
                          value={data.custo_material}
                          onChange={(v) => updateProcData('custo_material', v)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-5 shadow-sm min-h-[130px] flex flex-col justify-center">
                        <p className="text-sm text-blue-400 uppercase tracking-wider font-bold mb-2">
                          Carga Variável Total
                        </p>
                        <p className="text-3xl font-bold text-blue-400">
                          {percCustoVariavel.toFixed(2)}%
                        </p>
                      </div>
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-5 shadow-sm min-h-[130px] flex flex-col justify-center">
                        <p className="text-sm text-blue-400 uppercase tracking-wider font-bold mb-2">
                          Total em R$
                        </p>
                        <p className="text-3xl font-bold text-blue-400">
                          R$ {totalVariavelVal.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Impostos */}
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6 shadow-sm relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500/50 rounded-l-xl" />
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Percent className="w-5 h-5 text-rose-400" />
                Impostos
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-950/50 rounded-xl p-6 border border-slate-800/80 flex flex-col justify-center shadow-sm min-h-[130px]">
                  <label className="text-sm text-slate-300 uppercase tracking-wider font-bold mb-3 flex items-center gap-2">
                    <Percent className="w-5 h-5 text-slate-400" />
                    Alíquota de Imposto (%)
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={globals.imposto}
                      onChange={(e) => updateGlobal('imposto', Number(e.target.value))}
                      className="h-12 bg-slate-900 border-slate-600 text-white font-bold text-2xl focus-visible:ring-rose-500 text-center"
                    />
                  </div>
                </div>

                <div className="bg-slate-950/50 rounded-xl p-6 border border-slate-800/80 flex flex-col justify-center shadow-sm min-h-[130px]">
                  <p className="text-sm text-slate-300 uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-slate-400" />
                    Valor do Imposto (R$)
                  </p>
                  <p className="text-4xl font-bold text-white tracking-tight mt-1">
                    R$ {impostoVal.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Profissional (Dentista) */}
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6 shadow-sm relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500/50 rounded-l-xl" />
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                Honorários do Profissional
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-950/50 rounded-xl p-6 border border-slate-800/80 flex flex-col justify-center shadow-sm min-h-[130px]">
                  <label className="text-sm text-slate-300 uppercase tracking-wider font-bold mb-3 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-slate-400" />
                    Honorários Dentista (R$)
                  </label>
                  <div className="w-full currency-wrapper-lg relative">
                    <CurrencyInput
                      value={data.honorarios_dentista || 0}
                      onChange={(v) => updateProcData('honorarios_dentista', v)}
                      className="h-12 bg-slate-900 border-slate-600 text-white font-bold text-2xl focus-visible:ring-purple-500 pl-12 text-left"
                      iconClassName="text-xl text-slate-400 left-4"
                    />
                  </div>
                </div>

                <div className="bg-slate-950/50 rounded-xl p-6 border border-slate-800/80 flex flex-col justify-center shadow-sm min-h-[130px]">
                  <p className="text-sm text-slate-300 uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                    <Percent className="w-5 h-5 text-slate-400" />% DO DENTISTA
                  </p>
                  <p className="text-4xl font-bold text-white tracking-tight mt-1">
                    {percDentista.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-8 h-12 text-base shadow-lg shadow-amber-500/20 transition-all"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
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

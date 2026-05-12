import { useState, useEffect } from 'react'
import {
  Landmark,
  Save,
  Loader2,
  User as UserIcon,
  Building2,
  TrendingUp,
  Info,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CurrencyInput } from '@/components/precificacao/CurrencyInput'

const PercInput = ({ value, onChange, className }: any) => (
  <div className="relative w-full">
    <Input
      type="number"
      value={value || ''}
      onChange={(e) => onChange(Number(e.target.value))}
      step="0.01"
      min="0"
      className={cn(
        `font-bold bg-slate-900/50 border-slate-800 text-slate-200 focus:text-white focus:bg-slate-800 focus:border-amber-500/50 hover:border-slate-600 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none pr-8 text-right h-9`,
        className,
      )}
    />
    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium select-none">
      %
    </span>
  </div>
)

export default function GestaoFiscal() {
  const [c, setC] = useState<any>({
    faturamento_previsto: 0,
    pf_despesa: 0,
    pf_receita: 0,
    pf_imposto_perc: 0,
    pj1_titulo: 'PJ 01',
    pj1_despesa_folha: 0,
    pj1_margem_perc: 30,
    pj1_receita: 0,
    pj1_imposto_perc: 0,
    pj2_titulo: 'EXCEDENTE (PJ 02)',
    pj2_imposto_perc: 0,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [id, setId] = useState('')
  const [realizadoPF, setRealizadoPF] = useState(0)
  const [realizadoPJ1, setRealizadoPJ1] = useState(0)
  const [realizadoPJ2, setRealizadoPJ2] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from('gestao_fiscal_config').select('*').limit(1).single()

      if (data) {
        setId(data.id)
        setC(data)
      }

      const todayDate = new Date()
      const startOfMonth = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1)
        .toISOString()
        .split('T')[0]
      const endOfMonth = new Date(todayDate.getFullYear(), todayDate.getMonth() + 1, 0)
        .toISOString()
        .split('T')[0]

      const { data: vendas } = await supabase
        .from('vendas_diarias')
        .select('valor, destino_fiscal')
        .gte('data_venda', startOfMonth)
        .lte('data_venda', endOfMonth)

      if (vendas) {
        let pf = 0
        let pj1 = 0
        let pj2 = 0

        vendas.forEach((v) => {
          if (v.destino_fiscal === 'PESSOA FISICA') pf += Number(v.valor)
          else if (v.destino_fiscal === 'VITALI ODONTOLOGIA') pj1 += Number(v.valor)
          else if (v.destino_fiscal === 'SOUZA FILHO ODONTOLOGIA') pj2 += Number(v.valor)
        })

        setRealizadoPF(pf)
        setRealizadoPJ1(pj1)
        setRealizadoPJ2(pj2)
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  const pf_receita_calc = c.pf_despesa + 4000
  const pj1_receita_calc =
    c.pj1_margem_perc > 0 ? Math.max(0, c.pj1_despesa_folha / (c.pj1_margem_perc / 100) - 1000) : 0
  const excedente = Math.max(0, c.faturamento_previsto - pf_receita_calc - pj1_receita_calc)

  const impPj1 = pj1_receita_calc * (c.pj1_imposto_perc / 100)
  const impPj2 = excedente * (c.pj2_imposto_perc / 100)

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('gestao_fiscal_config')
      .update({
        ...c,
        pf_receita: pf_receita_calc,
        pj1_receita: pj1_receita_calc,
      })
      .eq('id', id)
    if (error) toast.error('Erro ao salvar as configurações fiscais')
    else toast.success('Gestão fiscal atualizada com sucesso!')
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-full mx-auto w-full animate-fade-in-up">
      <div className="bg-slate-900 border border-slate-800 border-l-4 border-l-amber-500 rounded-xl p-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-lg">
            <Landmark className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight uppercase">
              Gestão Fiscal
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Controle inteligente de receitas, despesas e estimativas de tributação
            </p>
          </div>
        </div>
        <div className="flex flex-col md:items-end w-full md:w-auto">
          <span className="text-sm font-bold text-amber-500 uppercase tracking-wider mb-2">
            Faturamento Previsto Total
          </span>
          <div className="w-full md:w-64">
            <CurrencyInput
              value={c.faturamento_previsto}
              onChange={(v: number) => setC({ ...c, faturamento_previsto: v })}
              className="h-12 text-xl border-amber-500/50 bg-amber-500/5 text-amber-500 focus:border-amber-400 focus:text-amber-400"
              iconClassName="text-amber-500/70"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Card PF */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col relative overflow-hidden h-full">
          <div className="absolute top-0 left-0 w-full h-1 bg-amber-500" />
          <div className="flex items-center gap-2 mb-5 h-8 shrink-0">
            <UserIcon className="w-5 h-5 text-amber-500 shrink-0" />
            <h2 className="text-lg font-bold text-white tracking-wider uppercase flex-1 px-2 h-full flex items-center">
              PESSOA FÍSICA
            </h2>
          </div>
          <div className="flex flex-col flex-1">
            <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800/80 flex flex-col justify-center shrink-0">
              <div className="flex justify-between items-start mb-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  TETO DE RECEITA
                </label>
              </div>
              <div className="text-3xl font-bold tracking-tight text-amber-400 truncate h-10 flex items-center">
                R${' '}
                {pf_receita_calc.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <p className="text-[10px] text-slate-500 mt-2 font-medium leading-tight">
                Automático: Despesa Livro Caixa + R$ 4.000,00
              </p>
            </div>
            <div className="flex flex-col flex-1 mt-6">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Despesa Prevista (Livro Caixa)
                </label>
                <CurrencyInput
                  value={c.pf_despesa}
                  onChange={(v: number) => setC({ ...c, pf_despesa: v })}
                />
              </div>
              <div className="mt-auto pt-6">
                <div className="cursor-pointer group hover:border-amber-500/50 transition-colors p-3 rounded-lg border border-slate-800 bg-slate-950/50 flex flex-col justify-between shadow-sm">
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5 group-hover:text-slate-400 transition-colors">
                        Realizado PF
                      </span>
                      <span className="text-base font-bold text-slate-200">
                        R${' '}
                        {realizadoPF.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5 group-hover:text-slate-400 transition-colors">
                        Atingido
                      </span>
                      <div
                        className={cn(
                          'text-sm font-bold',
                          realizadoPF > pf_receita_calc ? 'text-red-500' : 'text-amber-500',
                        )}
                      >
                        {pf_receita_calc > 0
                          ? ((realizadoPF / pf_receita_calc) * 100).toFixed(1)
                          : 0}
                        %
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        realizadoPF > pf_receita_calc ? 'bg-red-500' : 'bg-amber-500',
                      )}
                      style={{
                        width: `${Math.min(100, pf_receita_calc > 0 ? (realizadoPF / pf_receita_calc) * 100 : 0)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-800 flex justify-between items-center h-[36px] shrink-0">
            {/* Espaço reservado para alinhar simetricamente com os outros cards */}
          </div>
        </div>

        {/* Card PJ1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col relative overflow-hidden h-full">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-500" />
          <div className="flex items-center gap-2 mb-5 h-8 shrink-0">
            <Building2 className="w-5 h-5 text-blue-500 shrink-0" />
            <Input
              value={c.pj1_titulo}
              onChange={(e) => setC({ ...c, pj1_titulo: e.target.value })}
              className="text-lg font-bold text-white tracking-wider uppercase bg-transparent border-transparent hover:border-slate-700 focus-visible:ring-blue-500 h-full px-2 flex-1 shadow-none"
            />
          </div>
          <div className="flex flex-col flex-1">
            <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800/80 flex flex-col justify-center shrink-0">
              <div className="flex justify-between items-start mb-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Teto de Receita Permitida
                </label>
              </div>
              <div className="text-3xl font-bold tracking-tight text-blue-400 truncate h-10 flex items-center">
                R${' '}
                {pj1_receita_calc.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <p className="text-[10px] text-slate-500 mt-2 font-medium leading-tight">
                Automático: (Despesa Folha ÷ Proporção) - R$ 1.000 (Margem de segurança)
              </p>
            </div>
            <div className="flex flex-col flex-1 mt-6">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Despesa (Folha)
                    </label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" className="cursor-help outline-none">
                          <Info className="w-3.5 h-3.5 text-slate-500 hover:text-blue-400 transition-colors" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-800 border border-slate-700 text-slate-200 max-w-[280px] p-3 shadow-xl z-50">
                        <p className="text-xs mb-2">
                          <strong>O que incluir:</strong> Salários de todos os colaboradores,
                          pró-labores, INSS e FGTS.
                        </p>
                        <p className="text-xs text-blue-300">
                          <strong>Aviso de competência:</strong> A despesa do mês atual (ex: Abril)
                          é a base para o teto de receita do mês seguinte (ex: Maio).
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <CurrencyInput
                    value={c.pj1_despesa_folha}
                    onChange={(v: number) => setC({ ...c, pj1_despesa_folha: v })}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Proporção (%)
                  </label>
                  <PercInput
                    value={c.pj1_margem_perc}
                    onChange={(v: number) => setC({ ...c, pj1_margem_perc: v })}
                  />
                </div>
              </div>
              <div className="mt-auto pt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Estimativa de Imposto (%)
                  </label>
                  <div className="w-24">
                    <PercInput
                      value={c.pj1_imposto_perc}
                      onChange={(v: number) => setC({ ...c, pj1_imposto_perc: v })}
                    />
                  </div>
                </div>
                <div className="cursor-pointer group hover:border-blue-500/50 transition-colors p-3 rounded-lg border border-slate-800 bg-slate-950/50 flex flex-col justify-between shadow-sm">
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5 group-hover:text-slate-400 transition-colors">
                        Realizado VO
                      </span>
                      <span className="text-base font-bold text-slate-200">
                        R${' '}
                        {realizadoPJ1.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5 group-hover:text-slate-400 transition-colors">
                        Atingido
                      </span>
                      <div
                        className={cn(
                          'text-sm font-bold',
                          realizadoPJ1 > pj1_receita_calc ? 'text-red-500' : 'text-blue-500',
                        )}
                      >
                        {pj1_receita_calc > 0
                          ? ((realizadoPJ1 / pj1_receita_calc) * 100).toFixed(1)
                          : 0}
                        %
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        realizadoPJ1 > pj1_receita_calc ? 'bg-red-500' : 'bg-blue-500',
                      )}
                      style={{
                        width: `${Math.min(100, pj1_receita_calc > 0 ? (realizadoPJ1 / pj1_receita_calc) * 100 : 0)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-800 flex justify-between items-center h-[36px] shrink-0">
            <span className="text-xs font-bold text-slate-400 uppercase">Imposto Previsto</span>
            <span className="text-lg font-bold text-red-400">
              R${' '}
              {impPj1.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>

        {/* Card PJ2 Excedente */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col relative overflow-hidden h-full">
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
          <div className="flex items-center gap-2 mb-5 h-8 shrink-0">
            <TrendingUp className="w-5 h-5 text-emerald-500 shrink-0" />
            <Input
              value={c.pj2_titulo}
              onChange={(e) => setC({ ...c, pj2_titulo: e.target.value })}
              className="text-lg font-bold text-white tracking-wider uppercase bg-transparent border-transparent hover:border-slate-700 focus-visible:ring-emerald-500 h-full px-2 flex-1 shadow-none"
            />
          </div>
          <div className="flex flex-col flex-1">
            <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800/80 flex flex-col justify-center shrink-0">
              <div className="flex justify-between items-start mb-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Receita Excedente Estimada
                </label>
              </div>
              <div className="text-3xl font-bold tracking-tight text-emerald-400 truncate h-10 flex items-center">
                R${' '}
                {excedente.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <p className="text-[10px] text-slate-500 mt-2 font-medium leading-tight">
                Automático: Faturamento Previsto - Teto PF - Teto VO
              </p>
            </div>
            <div className="flex flex-col flex-1 mt-6">
              <div className="mt-auto pt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Estimativa de Imposto (%)
                  </label>
                  <div className="w-24">
                    <PercInput
                      value={c.pj2_imposto_perc}
                      onChange={(v: number) => setC({ ...c, pj2_imposto_perc: v })}
                    />
                  </div>
                </div>
                <div className="cursor-pointer group hover:border-emerald-500/50 transition-colors p-3 rounded-lg border border-slate-800 bg-slate-950/50 flex flex-col justify-center min-h-[68px] shadow-sm">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5 group-hover:text-slate-400 transition-colors">
                        Realizado SFO (Excedente)
                      </span>
                      <span className="text-base font-bold text-emerald-400">
                        R${' '}
                        {realizadoPJ2.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-800 flex justify-between items-center h-[36px] shrink-0">
            <span className="text-xs font-bold text-slate-400 uppercase">Imposto Previsto</span>
            <span className="text-lg font-bold text-red-400">
              R${' '}
              {impPj2.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
            Carga Tributária Total Estimada
          </p>
          <p className="text-3xl font-bold text-red-400 tracking-tight">
            R${' '}
            {(impPj1 + impPj2).toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-8 h-12 text-base shadow-lg shadow-amber-500/20 w-full sm:w-auto"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <Save className="w-5 h-5 mr-2" />
          )}
          Salvar Configurações Fiscais
        </Button>
      </div>
    </div>
  )
}

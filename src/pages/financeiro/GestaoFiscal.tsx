import { useState, useEffect } from 'react'
import { Landmark, Save, Loader2, User as UserIcon, Building2, TrendingUp } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NumInput = ({ value, onChange, className, isPerc }: any) => (
  <div className="relative w-full">
    {!isPerc && (
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold select-none">
        R$
      </span>
    )}
    <Input
      type="number"
      value={value || ''}
      onChange={(e) => onChange(Number(e.target.value))}
      step="0.01"
      min="0"
      className={cn(
        `font-bold bg-slate-950 border-slate-700 text-white focus-visible:ring-amber-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`,
        isPerc ? 'pr-8 text-center' : 'pl-10',
        className,
      )}
    />
    {isPerc && (
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold select-none">
        %
      </span>
    )}
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

  useEffect(() => {
    supabase
      .from('gestao_fiscal_config')
      .select('*')
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) {
          setId(data.id)
          setC(data)
        }
        setLoading(false)
      })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase.from('gestao_fiscal_config').update(c).eq('id', id)
    if (error) toast.error('Erro ao salvar as configurações fiscais')
    else toast.success('Gestão fiscal atualizada com sucesso!')
    setSaving(false)
  }

  const excedente = Math.max(0, c.faturamento_previsto - c.pf_receita - c.pj1_receita)
  const impPf = c.pf_receita * (c.pf_imposto_perc / 100)
  const impPj1 = c.pj1_receita * (c.pj1_imposto_perc / 100)
  const impPj2 = excedente * (c.pj2_imposto_perc / 100)

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
          <div className="w-full md:w-56">
            <NumInput
              value={c.faturamento_previsto}
              onChange={(v: number) => setC({ ...c, faturamento_previsto: v })}
              className="h-12 text-xl border-amber-500/50 bg-amber-500/5 text-amber-500"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card PF */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-amber-500" />
          <div className="flex items-center gap-2 mb-5">
            <UserIcon className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-white tracking-wider uppercase">Pessoa Física</h2>
          </div>
          <div className="space-y-4 flex-1">
            <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800/80">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Valor a Receber (Teto)
              </label>
              <NumInput
                value={c.pf_receita}
                onChange={(v: number) => setC({ ...c, pf_receita: v })}
                className="text-2xl h-12 text-amber-500 border-amber-500/30 bg-amber-500/5"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Despesa Prevista (Livro Caixa)
              </label>
              <NumInput
                value={c.pf_despesa}
                onChange={(v: number) => setC({ ...c, pf_despesa: v })}
              />
            </div>
            <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Estimativa de Imposto (%)
              </label>
              <div className="w-24">
                <NumInput
                  isPerc
                  value={c.pf_imposto_perc}
                  onChange={(v: number) => setC({ ...c, pf_imposto_perc: v })}
                />
              </div>
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-800 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase">Imposto Previsto</span>
            <span className="text-lg font-bold text-red-400">R$ {impPf.toFixed(2)}</span>
          </div>
        </div>

        {/* Card PJ1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-500" />
          <div className="flex items-center gap-2 mb-5 w-full">
            <Building2 className="w-5 h-5 text-blue-500 shrink-0" />
            <Input
              value={c.pj1_titulo}
              onChange={(e) => setC({ ...c, pj1_titulo: e.target.value })}
              className="text-lg font-bold text-white tracking-wider uppercase bg-transparent border-transparent hover:border-slate-700 focus-visible:ring-blue-500 h-8 px-2 flex-1"
            />
          </div>
          <div className="space-y-4 flex-1">
            <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800/80">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Teto de Receita Permitida
              </label>
              <NumInput
                value={c.pj1_receita}
                onChange={(v: number) => setC({ ...c, pj1_receita: v })}
                className="text-2xl h-12 text-blue-400 border-blue-500/30 bg-blue-500/5 focus-visible:ring-blue-500"
              />
              <p className="text-[10px] text-slate-500 mt-2 font-medium leading-tight">
                Sugestão: R$ {(c.pj1_despesa_folha * (1 + c.pj1_margem_perc / 100)).toFixed(2)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Despesa (Folha)
                </label>
                <NumInput
                  value={c.pj1_despesa_folha}
                  onChange={(v: number) => setC({ ...c, pj1_despesa_folha: v })}
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Proporção (%)
                </label>
                <NumInput
                  isPerc
                  value={c.pj1_margem_perc}
                  onChange={(v: number) => setC({ ...c, pj1_margem_perc: v })}
                />
              </div>
            </div>
            <div className="pt-3 border-t border-slate-800 flex justify-between items-center mt-auto">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Estimativa de Imposto (%)
              </label>
              <div className="w-24">
                <NumInput
                  isPerc
                  value={c.pj1_imposto_perc}
                  onChange={(v: number) => setC({ ...c, pj1_imposto_perc: v })}
                />
              </div>
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-800 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase">Imposto Previsto</span>
            <span className="text-lg font-bold text-red-400">R$ {impPj1.toFixed(2)}</span>
          </div>
        </div>

        {/* Card PJ2 Excedente */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
          <div className="flex items-center gap-2 mb-5 w-full">
            <TrendingUp className="w-5 h-5 text-emerald-500 shrink-0" />
            <Input
              value={c.pj2_titulo}
              onChange={(e) => setC({ ...c, pj2_titulo: e.target.value })}
              className="text-lg font-bold text-white tracking-wider uppercase bg-transparent border-transparent hover:border-slate-700 focus-visible:ring-emerald-500 h-8 px-2 flex-1"
            />
          </div>
          <div className="space-y-4 flex-1 flex flex-col">
            <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800/80 flex-1 flex flex-col justify-center">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Receita Excedente
              </label>
              <div className="text-4xl font-bold tracking-tight text-emerald-400">
                R$ {excedente.toFixed(2)}
              </div>
              <p className="text-xs text-slate-500 mt-3 font-medium leading-relaxed">
                Calculado automaticamente baseando-se no Faturamento Previsto e descontando as
                receitas atribuídas à PF e PJ 01.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Estimativa de Imposto (%)
              </label>
              <div className="w-24">
                <NumInput
                  isPerc
                  value={c.pj2_imposto_perc}
                  onChange={(v: number) => setC({ ...c, pj2_imposto_perc: v })}
                />
              </div>
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-800 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase">Imposto Previsto</span>
            <span className="text-lg font-bold text-red-400">R$ {impPj2.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
            Carga Tributária Total Estimada
          </p>
          <p className="text-3xl font-bold text-red-400 tracking-tight">
            R$ {(impPf + impPj1 + impPj2).toFixed(2)}
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

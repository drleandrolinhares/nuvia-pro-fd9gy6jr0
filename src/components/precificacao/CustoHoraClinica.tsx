import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Save, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'

type CustoFixo = {
  id: string
  descricao: string
  valor: number
  ordem: number
}

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function CurrencyInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [inputValue, setInputValue] = useState(() => {
    return (value * 100).toFixed(0)
  })

  useEffect(() => {
    const num = parseInt(inputValue || '0', 10) / 100
    if (num !== value) {
      setInputValue((value * 100).toFixed(0))
    }
  }, [value, inputValue])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '')
    setInputValue(val)
    const num = parseInt(val || '0', 10) / 100
    onChange(num)
  }

  const formatDisplay = (val: string) => {
    const num = parseInt(val || '0', 10) / 100
    if (num === 0 && !val) return ''
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  return (
    <div className="relative flex items-center">
      <span className="absolute left-3 text-slate-400 font-medium">R$</span>
      <Input
        className="pl-10 text-right bg-slate-900/50 border-slate-800 hover:border-slate-600 focus:bg-slate-800 focus:border-amber-500/50 h-9 font-medium shadow-sm text-slate-200 focus:text-white transition-colors"
        value={formatDisplay(inputValue)}
        onChange={handleChange}
        placeholder="0,00"
      />
    </div>
  )
}

export function CustoHoraClinica() {
  const [custos, setCustos] = useState<CustoFixo[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchCustos()
  }, [])

  const fetchCustos = async () => {
    const { data, error } = await supabase
      .from('precificacao_custos_fixos' as any)
      .select('*')
      .order('ordem', { ascending: true })

    if (!error && data) {
      setCustos(data as CustoFixo[])
    }
    setLoading(false)
  }

  const updateCusto = useCallback((id: string, field: keyof CustoFixo, value: any) => {
    setCustos((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)))
  }, [])

  const handleAddRow = () => {
    const newRow = {
      id: generateUUID(),
      descricao: '',
      valor: 0,
      ordem: custos.length > 0 ? Math.max(...custos.map((c) => c.ordem)) + 10 : 10,
    }
    setCustos([...custos, newRow])
  }

  const handleRemoveRow = async (id: string) => {
    setCustos((prev) => prev.filter((c) => c.id !== id))
    await supabase
      .from('precificacao_custos_fixos' as any)
      .delete()
      .eq('id', id)
  }

  const handleSave = async () => {
    setSaving(true)
    const itemsToSave = custos.map((c, idx) => ({
      id: c.id,
      descricao: c.descricao,
      valor: c.valor,
      ordem: idx * 10,
    }))

    const { error } = await supabase.from('precificacao_custos_fixos' as any).upsert(itemsToSave)

    if (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Planilha de custos salva com sucesso.' })
      await fetchCustos()
    }
    setSaving(false)
  }

  const total = custos.reduce((acc, curr) => acc + (curr.valor || 0), 0)

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-4" />
        <p>Carregando planilha de custos...</p>
      </div>
    )
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-sm animate-fade-in">
      <div className="bg-slate-800/80 p-4 border-b border-slate-700 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Custos e Despesas Fixas</h2>
          <p className="text-sm text-slate-400">Gerencie os custos fixos mensais da clínica</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddRow}
            className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700 flex-1 sm:flex-none"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Linha
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 flex-1 sm:flex-none"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar Planilha
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="px-4 py-3 font-medium w-full">Descrição do Custo</th>
              <th className="px-4 py-3 font-medium min-w-[200px]">Valor Mensal</th>
              <th className="px-4 py-3 font-medium w-[100px] text-right">%</th>
              <th className="px-4 py-3 font-medium w-[80px] text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {custos.map((custo) => (
              <tr key={custo.id} className="hover:bg-slate-800/30 transition-colors group">
                <td className="px-4 py-1.5">
                  <Input
                    value={custo.descricao}
                    onChange={(e) => updateCusto(custo.id, 'descricao', e.target.value)}
                    className="bg-slate-900/50 border-slate-800 hover:border-slate-600 focus:bg-slate-800 focus:border-amber-500/50 h-9 font-medium shadow-sm text-slate-200 focus:text-white transition-colors"
                    placeholder="Ex: Aluguel..."
                  />
                </td>
                <td className="px-4 py-1.5">
                  <CurrencyInput
                    value={custo.valor}
                    onChange={(val) => updateCusto(custo.id, 'valor', val)}
                  />
                </td>
                <td className="px-4 py-1.5 text-right font-medium text-slate-300">
                  {total > 0
                    ? ((custo.valor / total) * 100).toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : '0,00'}
                  %
                </td>
                <td className="px-4 py-1.5 text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveRow(custo.id)}
                    className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all h-8 w-8"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {custos.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  Nenhum custo cadastrado. Clique em "Adicionar Linha" para começar.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot className="bg-slate-800/80 border-t border-slate-700 font-semibold text-white">
            <tr>
              <td className="px-6 py-4 text-right uppercase tracking-wider text-slate-300">
                Total de Custos Fixos
              </td>
              <td className="px-4 py-4 text-amber-500 text-lg tracking-tight">
                {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </td>
              <td className="px-4 py-4 text-right text-amber-500 text-lg tracking-tight">
                {total > 0 ? '100,00' : '0,00'}%
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

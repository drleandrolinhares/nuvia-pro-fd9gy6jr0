import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Save, Loader2, ListPlus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { CurrencyInput } from './CurrencyInput'
import { DetalhesCustoModal, CustoFixo, CustoFixoDetalhe } from './DetalhesCustoModal'

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

export function CustoHoraClinica() {
  const [custos, setCustos] = useState<CustoFixo[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [activeCusto, setActiveCusto] = useState<CustoFixo | null>(null)
  const [deletedDetalhes, setDeletedDetalhes] = useState<string[]>([])

  const { toast } = useToast()

  useEffect(() => {
    fetchCustos()
  }, [])

  const fetchCustos = async () => {
    const [{ data: custosData }, { data: detalhesData }] = await Promise.all([
      supabase
        .from('precificacao_custos_fixos' as any)
        .select('*')
        .order('ordem', { ascending: true }),
      supabase
        .from('precificacao_custos_fixos_detalhes' as any)
        .select('*')
        .order('ordem', { ascending: true }),
    ])

    if (custosData) {
      const mapped = custosData.map((c) => ({
        ...c,
        detalhes: (detalhesData || []).filter((d: any) => d.custo_fixo_id === c.id),
      }))
      setCustos(mapped)
    }
    setLoading(false)
  }

  const updateCusto = useCallback((id: string, field: keyof CustoFixo, value: any) => {
    setCustos((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)))
  }, [])

  const handleAddRow = () => {
    setCustos([
      ...custos,
      {
        id: generateUUID(),
        descricao: '',
        valor: 0,
        ordem: custos.length > 0 ? Math.max(...custos.map((c) => c.ordem)) + 10 : 10,
        detalhes: [],
      },
    ])
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

    if (deletedDetalhes.length > 0) {
      await supabase
        .from('precificacao_custos_fixos_detalhes' as any)
        .delete()
        .in('id', deletedDetalhes)
      setDeletedDetalhes([])
    }

    const itemsToSave = custos.map((c, idx) => {
      const hasDet = c.detalhes && c.detalhes.length > 0
      return {
        id: c.id,
        descricao: c.descricao,
        valor: hasDet ? c.detalhes!.reduce((acc, d) => acc + d.valor, 0) : c.valor,
        ordem: idx * 10,
        ativo: true,
      }
    })

    const { error } = await supabase.from('precificacao_custos_fixos' as any).upsert(itemsToSave)

    if (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
      setSaving(false)
      return
    }

    const allDetalhes = custos.flatMap((c) =>
      (c.detalhes || []).map((d, dIdx) => ({
        id: d.id,
        custo_fixo_id: c.id,
        descricao: d.descricao,
        valor: d.valor,
        ordem: dIdx * 10,
      })),
    )

    if (allDetalhes.length > 0) {
      await supabase.from('precificacao_custos_fixos_detalhes' as any).upsert(allDetalhes)
    }

    toast({ title: 'Sucesso', description: 'Planilha salva com sucesso.' })
    await fetchCustos()
    setSaving(false)
  }

  const onConfirmDetalhes = (id: string, novos: CustoFixoDetalhe[]) => {
    setCustos((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const removed = (c.detalhes || [])
            .map((d) => d.id)
            .filter((oldId) => !novos.find((n) => n.id === oldId))
          if (removed.length > 0) setDeletedDetalhes((d) => [...d, ...removed])
          const sum = novos.reduce((acc, d) => acc + d.valor, 0)
          return { ...c, detalhes: novos, valor: novos.length > 0 ? sum : c.valor }
        }
        return c
      }),
    )
    setModalOpen(false)
  }

  const total = custos.reduce((acc, curr) => acc + (curr.valor || 0), 0)

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-4" />
        <p>Carregando planilha...</p>
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
            <Plus className="w-4 h-4 mr-2" /> Adicionar Linha
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
            )}{' '}
            Salvar Planilha
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="px-4 py-3 font-medium w-full">Descrição do Custo</th>
              <th className="px-4 py-3 font-medium min-w-[220px]">Valor Mensal</th>
              <th className="px-4 py-3 font-medium w-[100px] text-right">%</th>
              <th className="px-4 py-3 font-medium w-[80px] text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {custos.map((custo) => {
              const hasDet = custo.detalhes && custo.detalhes.length > 0
              return (
                <tr key={custo.id} className="hover:bg-slate-800/30 group">
                  <td className="px-4 py-1.5">
                    <Input
                      value={custo.descricao}
                      onChange={(e) => updateCusto(custo.id, 'descricao', e.target.value)}
                      className="bg-slate-900/50 border-slate-800 h-9 font-medium shadow-sm text-slate-200 focus:text-white"
                      placeholder="Ex: Aluguel..."
                    />
                  </td>
                  <td className="px-4 py-1.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-[120px]">
                        <CurrencyInput
                          value={custo.valor}
                          onChange={(val) => !hasDet && updateCusto(custo.id, 'valor', val)}
                          disabled={hasDet}
                        />
                      </div>
                      <TooltipProvider>
                        <Tooltip delayDuration={300}>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className={cn(
                                'h-9 w-9 shrink-0 border-slate-700 transition-colors',
                                hasDet
                                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20'
                                  : 'bg-slate-900/50 text-slate-400 hover:bg-slate-800',
                              )}
                              onClick={() => {
                                setActiveCusto(custo)
                                setModalOpen(true)
                              }}
                            >
                              <ListPlus className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-slate-800 border-slate-700 text-slate-200">
                            <p>
                              {hasDet
                                ? 'Ver/Editar detalhamento'
                                : 'Adicionar itens (detalhar custo)'}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
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
              )
            })}
            {custos.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  Nenhum custo cadastrado.
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
      <DetalhesCustoModal
        custo={activeCusto}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={onConfirmDetalhes}
      />
    </div>
  )
}

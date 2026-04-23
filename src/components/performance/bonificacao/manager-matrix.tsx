import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'
import { format, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

function getPastMonths(count = 6) {
  const dates = []
  const now = new Date()
  for (let i = 0; i < count; i++) {
    const d = subMonths(now, i)
    dates.push(format(d, 'yyyy-MM'))
  }
  return dates
}

export function ManagerBonificacaoMatrix() {
  const pastMonths = getPastMonths()
  const [selectedMonth, setSelectedMonth] = useState(pastMonths[0])

  const [users, setUsers] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])
  const [records, setRecords] = useState<any[]>([])

  const [matrix, setMatrix] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [selectedMonth])

  const loadData = async () => {
    setLoading(true)
    const [{ data: uData }, { data: iData }, { data: rData }] = await Promise.all([
      supabase
        .from('usuarios')
        .select('id, nome')
        .eq('obrigatorio_bonificacao', true)
        .order('nome'),
      supabase
        .from('performance_bonificacao_itens' as any)
        .select('*')
        .eq('ativo', true)
        .order('ordem'),
      supabase
        .from('performance_bonificacao' as any)
        .select('*')
        .eq('mes_referencia', selectedMonth),
    ])

    if (uData) setUsers(uData)
    if (iData) setItems(iData)
    if (rData) {
      setRecords(rData)
      const newMatrix: Record<string, string[]> = {}
      rData.forEach((r) => {
        newMatrix[r.usuario_id] = r.itens_marcados || []
      })
      setMatrix(newMatrix)
    }
    setLoading(false)
  }

  const isChecked = (userId: string, itemId: string, itemIndex: number) => {
    const userItems = matrix[userId] || []
    return userItems.includes(itemId) || userItems.includes(itemIndex as any)
  }

  const handleToggle = (userId: string, itemId: string, itemIndex: number) => {
    setMatrix((prev) => {
      const userItems = prev[userId] || []
      const currentlyChecked = userItems.includes(itemId) || userItems.includes(itemIndex as any)

      if (currentlyChecked) {
        return {
          ...prev,
          [userId]: userItems.filter((i) => i !== itemId && i !== (itemIndex as any)),
        }
      } else {
        return { ...prev, [userId]: [...userItems, itemId] }
      }
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const promises = users.map(async (u) => {
        const userItems = matrix[u.id] || []
        const is100Percent = userItems.length >= items.length && items.length > 0
        const pontuacao = items.length > 0 ? Math.round((userItems.length / items.length) * 100) : 0
        const existing = records.find((r) => r.usuario_id === u.id)

        if (existing) {
          await supabase
            .from('performance_bonificacao' as any)
            .update({
              itens_marcados: userItems,
              pontuacao_total: pontuacao,
              atingiu_meta: is100Percent,
              atualizado_em: new Date().toISOString(),
            })
            .eq('id', existing.id)
        } else {
          await supabase.from('performance_bonificacao' as any).insert({
            usuario_id: u.id,
            mes_referencia: selectedMonth,
            itens_marcados: userItems,
            pontuacao_total: pontuacao,
            atingiu_meta: is100Percent,
          })
        }
      })
      await Promise.all(promises)
      toast.success('Avaliações salvas com sucesso!')
      loadData()
    } catch (e) {
      toast.error('Erro ao salvar as avaliações.')
    } finally {
      setSaving(false)
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div>
            <Label className="text-xs text-slate-500 mb-1 block">Mês de Referência</Label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent>
                {pastMonths.map((m) => {
                  const [year, month] = m.split('-')
                  const date = new Date(parseInt(year), parseInt(month) - 1, 1)
                  return (
                    <SelectItem key={m} value={m}>
                      {format(date, 'MMMM / yyyy', { locale: ptBR }).replace(/^\w/, (c) =>
                        c.toUpperCase(),
                      )}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-amber-600 hover:bg-amber-700 text-white min-w-[150px]"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Salvar Alterações
        </Button>
      </div>

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 min-w-[280px] sticky left-0 bg-slate-50 z-10 shadow-[1px_0_0_0_#e2e8f0]">
                  Itens de Avaliação
                </th>
                {users.map((u) => (
                  <th
                    key={u.id}
                    className="px-2 py-3 text-center min-w-[100px] border-l border-slate-200"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold mb-1">
                        {u.nome.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="truncate w-full block" title={u.nome}>
                        {u.nome.split(' ')[0]}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr
                  key={item.id}
                  className="bg-white border-b border-slate-100 hover:bg-slate-50/50"
                >
                  <td className="px-4 py-3 font-medium text-slate-800 sticky left-0 bg-white z-10 shadow-[1px_0_0_0_#e2e8f0] group-hover:bg-slate-50/50 transition-colors">
                    {item.descricao}
                  </td>
                  {users.map((u) => {
                    const checked = isChecked(u.id, item.id, index)
                    return (
                      <td
                        key={u.id}
                        className="p-0 border-l border-slate-100 text-center relative group"
                      >
                        <label
                          className={`absolute inset-0 flex items-center justify-center cursor-pointer transition-colors ${checked ? 'bg-emerald-50/70' : 'hover:bg-slate-100'}`}
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => handleToggle(u.id, item.id, index)}
                            className={
                              checked
                                ? 'data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600'
                                : ''
                            }
                          />
                        </label>
                        <div className="h-12 w-full"></div>
                      </td>
                    )
                  })}
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={users.length + 1} className="text-center py-8 text-slate-500">
                    Nenhum item configurado. Acesse a aba Configurações.
                  </td>
                </tr>
              )}
            </tbody>
            {users.length > 0 && items.length > 0 && (
              <tfoot className="bg-slate-50 border-t border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-right sticky left-0 bg-slate-50 z-10 shadow-[1px_0_0_0_#e2e8f0]">
                    Pontuação Total
                  </th>
                  {users.map((u) => {
                    const pontuacao = Math.round(((matrix[u.id] || []).length / items.length) * 100)
                    return (
                      <th key={u.id} className="px-2 py-3 text-center border-l border-slate-200">
                        <span
                          className={`font-bold ${pontuacao === 100 ? 'text-emerald-600' : 'text-slate-600'}`}
                        >
                          {pontuacao}%
                        </span>
                      </th>
                    )
                  })}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </Card>
    </div>
  )
}

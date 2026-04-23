import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
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
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { toast } from 'sonner'
import { Loader2, Save, Trophy, UserMinus, Eye } from 'lucide-react'
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
        const isEligible = userItems.length === 0 && items.length > 0
        const pontuacao = isEligible ? 100 : 0
        const existing = records.find((r) => r.usuario_id === u.id)

        if (existing) {
          await supabase
            .from('performance_bonificacao' as any)
            .update({
              itens_marcados: userItems,
              pontuacao_total: pontuacao,
              atingiu_meta: isEligible,
              atualizado_em: new Date().toISOString(),
            })
            .eq('id', existing.id)
        } else {
          await supabase.from('performance_bonificacao' as any).insert({
            usuario_id: u.id,
            mes_referencia: selectedMonth,
            itens_marcados: userItems,
            pontuacao_total: pontuacao,
            atingiu_meta: isEligible,
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

  const qualifiedUsers = users.filter((u) => (matrix[u.id] || []).length === 0)
  const disqualifiedUsers = users.filter((u) => (matrix[u.id] || []).length > 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div>
            <Label className="text-xs text-slate-500 mb-1 block">Mês de Referência</Label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[200px] border-slate-300">
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
          className="bg-amber-600 hover:bg-amber-700 text-white min-w-[150px] shadow-sm"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Salvar Alterações
        </Button>
      </div>

      {items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-emerald-50/50 border-emerald-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-emerald-800 text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5" /> Palco (R$ 350,00)
              </CardTitle>
              <CardDescription className="text-emerald-600/80">
                Colaboradores sem falhas no mês
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {qualifiedUsers.length > 0 ? (
                  qualifiedUsers.map((u) => (
                    <Badge
                      key={u.id}
                      variant="secondary"
                      className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 px-3 py-1 text-sm font-semibold border-emerald-200"
                    >
                      {u.nome.split(' ')[0]}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-emerald-600/60 italic">
                    Nenhum colaborador qualificado.
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-50/50 border-red-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-red-800 text-lg flex items-center gap-2">
                <UserMinus className="w-5 h-5" /> Eliminados
              </CardTitle>
              <CardDescription className="text-red-600/80">
                Colaboradores com falhas registradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {disqualifiedUsers.length > 0 ? (
                  disqualifiedUsers.map((u) => (
                    <Badge
                      key={u.id}
                      variant="secondary"
                      className="bg-red-100 text-red-800 hover:bg-red-200 px-3 py-1 text-sm font-semibold border-red-200"
                    >
                      {u.nome.split(' ')[0]}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-red-600/60 italic">
                    Nenhum colaborador eliminado.
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <div className="overflow-x-auto pb-4">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-4 min-w-[320px] max-w-[400px] sticky left-0 bg-slate-50 z-20 shadow-[1px_0_0_0_#e2e8f0]">
                  Ações que Desclassificam
                </th>
                {users.map((u) => (
                  <th
                    key={u.id}
                    className="px-2 py-4 text-center min-w-[110px] border-l border-slate-200"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-slate-600 font-bold">
                        {u.nome.substring(0, 2).toUpperCase()}
                      </div>
                      <span
                        className="truncate w-full block font-bold text-slate-800"
                        title={u.nome}
                      >
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
                  className="bg-white border-b border-slate-100 hover:bg-slate-50/80 transition-colors"
                >
                  <td className="px-4 py-3 font-semibold text-slate-800 sticky left-0 bg-white z-10 shadow-[1px_0_0_0_#e2e8f0] group-hover:bg-slate-50/80">
                    <div className="flex items-center justify-between gap-2">
                      <span className="line-clamp-2" title={item.descricao}>
                        {item.descricao}
                      </span>
                      {item.explicacao && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="text-slate-400 hover:text-amber-500 focus:outline-none flex-shrink-0 bg-slate-50 p-1.5 rounded-md hover:bg-amber-50 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-[350px] z-[100] shadow-xl border-slate-200"
                            sideOffset={10}
                          >
                            <div className="space-y-2">
                              <h4 className="font-bold text-sm text-slate-900 border-b pb-2">
                                {item.descricao}
                              </h4>
                              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                                {item.explicacao}
                              </p>
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                  </td>
                  {users.map((u) => {
                    const checked = isChecked(u.id, item.id, index)
                    return (
                      <td
                        key={u.id}
                        className={`p-0 border-l text-center relative group transition-colors ${checked ? 'bg-red-50/50 border-red-100' : 'border-slate-100 hover:bg-slate-100/50'}`}
                      >
                        <label className="absolute inset-0 flex items-center justify-center cursor-pointer">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => handleToggle(u.id, item.id, index)}
                            className={`w-5 h-5 transition-all ${
                              checked
                                ? 'data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500 shadow-sm'
                                : 'border-slate-300'
                            }`}
                          />
                        </label>
                        <div className="h-14 w-full"></div>
                      </td>
                    )
                  })}
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td
                    colSpan={users.length + 1}
                    className="text-center py-12 text-slate-500 bg-slate-50/50 italic"
                  >
                    Nenhuma regra configurada. Acesse a aba Configurações.
                  </td>
                </tr>
              )}
            </tbody>
            {users.length > 0 && items.length > 0 && (
              <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                <tr>
                  <th className="px-4 py-4 text-right font-bold text-slate-700 sticky left-0 bg-slate-50 z-20 shadow-[1px_0_0_0_#e2e8f0]">
                    Status do Colaborador
                  </th>
                  {users.map((u) => {
                    const isQualified = (matrix[u.id] || []).length === 0
                    return (
                      <th key={u.id} className="px-2 py-4 text-center border-l border-slate-200">
                        <span
                          className={`inline-flex px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${isQualified ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}
                        >
                          {isQualified ? 'No Palco' : 'Eliminado'}
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

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, Save, Award, CheckCircle2 } from 'lucide-react'
import { format, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const ITEMS = [
  '1. Pontualidade e Assiduidade',
  '2. Organização do ambiente de trabalho',
  '3. Uso correto dos EPIs e Uniforme',
  '4. Cumprimento das rotinas diárias',
  '5. Preenchimento correto do sistema',
  '6. Atendimento cordial e proativo',
  '7. Trabalho em equipe e cooperação',
  '8. Zelo por materiais e equipamentos',
  '9. Participação em reuniões e treinamentos',
]

function getPastMonths(count = 6) {
  const dates = []
  const now = new Date()
  for (let i = 0; i < count; i++) {
    const d = subMonths(now, i)
    dates.push(format(d, 'yyyy-MM'))
  }
  return dates
}

export function BonificacaoTab() {
  const { profile, user } = useAuth()
  const isManager = profile?.role === 'admin' || profile?.role === 'gestor'

  const pastMonths = getPastMonths()
  const [selectedMonth, setSelectedMonth] = useState(pastMonths[0])
  const [selectedUser, setSelectedUser] = useState<string>(isManager ? '' : user?.id || '')
  const [users, setUsers] = useState<any[]>([])

  const [checkedItems, setCheckedItems] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [recordId, setRecordId] = useState<string | null>(null)

  useEffect(() => {
    if (isManager) loadUsers()
  }, [isManager])

  useEffect(() => {
    if (selectedUser && selectedMonth) loadEvaluation()
    else {
      setCheckedItems([])
      setRecordId(null)
    }
  }, [selectedUser, selectedMonth])

  const loadUsers = async () => {
    const { data } = await supabase.from('usuarios').select('id, nome').order('nome')
    if (data) {
      setUsers(data)
      if (data.length > 0 && !selectedUser) setSelectedUser(data[0].id)
    }
  }

  const loadEvaluation = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('performance_bonificacao' as any)
        .select('*')
        .eq('usuario_id', selectedUser)
        .eq('mes_referencia', selectedMonth)
        .maybeSingle()

      if (data) {
        setRecordId(data.id)
        setCheckedItems(data.itens_marcados || [])
      } else {
        setRecordId(null)
        setCheckedItems([])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = (index: number) => {
    if (!isManager) return
    setCheckedItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    )
  }

  const handleSave = async () => {
    if (!selectedUser) return
    setSaving(true)
    try {
      const is100Percent = checkedItems.length === ITEMS.length
      const pontuacao = Math.round((checkedItems.length / ITEMS.length) * 100)

      if (recordId) {
        await supabase
          .from('performance_bonificacao' as any)
          .update({
            itens_marcados: checkedItems,
            pontuacao_total: pontuacao,
            atingiu_meta: is100Percent,
            atualizado_em: new Date().toISOString(),
          })
          .eq('id', recordId)
      } else {
        const { data } = await supabase
          .from('performance_bonificacao' as any)
          .insert({
            usuario_id: selectedUser,
            mes_referencia: selectedMonth,
            itens_marcados: checkedItems,
            pontuacao_total: pontuacao,
            atingiu_meta: is100Percent,
          })
          .select('id')
          .single()
        if (data) setRecordId(data.id)
      }
      toast.success('Avaliação salva com sucesso!')
    } catch (e: any) {
      toast.error('Erro ao salvar avaliação.')
    } finally {
      setSaving(false)
    }
  }

  const percent = Math.round((checkedItems.length / ITEMS.length) * 100)
  const isEligible = checkedItems.length === ITEMS.length

  return (
    <div className="space-y-6 mt-6">
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        {isManager && (
          <div className="flex-1">
            <Label className="text-xs text-slate-500 mb-1 block">Colaborador</Label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o colaborador" />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="w-full sm:w-[250px]">
          <Label className="text-xs text-slate-500 mb-1 block">Mês de Referência</Label>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger>
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

      {!selectedUser ? (
        <div className="text-center py-12 text-slate-500">
          Selecione um colaborador para ver a avaliação.
        </div>
      ) : loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Checklist Feijão com Arroz</CardTitle>
                <CardDescription>Avalie o cumprimento dos 9 itens fundamentais.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {ITEMS.map((item, idx) => {
                    const isChecked = checkedItems.includes(idx)
                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                          isChecked
                            ? 'bg-emerald-50/50 border-emerald-200'
                            : 'bg-white border-slate-100'
                        } ${isManager ? 'cursor-pointer hover:bg-slate-50' : ''}`}
                        onClick={() => handleToggle(idx)}
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => handleToggle(idx)}
                          disabled={!isManager}
                          className={
                            isChecked
                              ? 'data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600'
                              : ''
                          }
                        />
                        <Label
                          className={`flex-1 font-medium ${isChecked ? 'text-emerald-900' : 'text-slate-700'} ${isManager ? 'cursor-pointer' : ''}`}
                        >
                          {item}
                        </Label>
                      </div>
                    )
                  })}
                </div>

                {isManager && (
                  <div className="mt-6 flex justify-end">
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-amber-600 hover:bg-amber-700 text-white gap-2 min-w-[150px]"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Salvar Avaliação
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card
              className={
                isEligible
                  ? 'bg-gradient-to-br from-emerald-50 to-white border-emerald-200'
                  : 'bg-slate-50 border-slate-200'
              }
            >
              <CardContent className="pt-6 text-center">
                <div className="mb-4">
                  <div
                    className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-sm border-4 border-white ${isEligible ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}
                  >
                    <Award className="w-10 h-10" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-slate-800 mb-1">{percent}%</h3>
                <p className="text-slate-500 font-medium mb-6">Pontuação Atingida</p>

                {isEligible ? (
                  <div className="bg-emerald-100 text-emerald-800 p-4 rounded-lg flex flex-col items-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    <p className="font-bold text-lg">Elegível ao Bônus!</p>
                    <p className="text-sm font-medium">Bônus de R$ 350,00 liberado.</p>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 p-4 rounded-lg text-slate-500">
                    <p className="text-sm">
                      Atinga 100% dos itens para liberar a bonificação de R$ 350,00.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { format, startOfWeek, addDays, isAfter } from 'date-fns'
import { Eye, Loader2, CheckCircle2, XCircle } from 'lucide-react'

function getPastSaturdays(count = 10) {
  const dates = []
  let now = new Date()
  let sunday = startOfWeek(now, { weekStartsOn: 0 })
  let saturday = addDays(sunday, 6)
  saturday.setHours(11, 59, 0, 0)
  if (isAfter(now, saturday)) saturday = addDays(saturday, 7)
  for (let i = 0; i < count; i++) {
    dates.push(format(saturday, 'yyyy-MM-dd'))
    saturday = addDays(saturday, -7)
  }
  return dates
}

export function ManagerInovacoesView() {
  const pastWeeks = getPastSaturdays(10)
  const [selectedWeek, setSelectedWeek] = useState(pastWeeks[0])
  const [isGenerating, setIsGenerating] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [selectedWeek])

  const loadData = async () => {
    setLoading(true)
    const { data: uData } = await supabase
      .from('usuarios')
      .select('id, nome, avatar_url')
      .eq('status', 'ativo')
      .eq('possui_carteira', true)

    if (uData) setUsers(uData)

    const { data: sData } = await supabase
      .from('performance_pp_pdm' as any)
      .select('id, usuario_id, inovacoes, inovacao_validada, data_registro')
      .eq('data_registro', selectedWeek)

    if (sData) setSubmissions(sData)
    setLoading(false)
  }

  const handleToggleInovacao = async (
    id: string,
    currentVal: boolean,
    userId: string,
    date: string,
  ) => {
    const newVal = !currentVal
    const { error } = await supabase
      .from('performance_pp_pdm' as any)
      .update({ inovacao_validada: newVal })
      .eq('id', id)

    if (!error) {
      const month = date.substring(0, 7)
      if (newVal) {
        const { data: countData } = await supabase
          .from('performance_pp_pdm' as any)
          .select('id')
          .eq('usuario_id', userId)
          .like('data_registro', `${month}%`)
          .eq('inovacao_validada', true)

        const count = countData ? countData.length : 0
        if (count > 1) {
          await supabase.from('carteira_transacoes').insert({
            usuario_id: userId,
            tipo: 'credito',
            valor: 100,
            descricao: `Bônus: Inovação Validada extra (${count}ª do mês)`,
            mes_referencia: month,
            origem_id: id,
          })
        }
      } else {
        await supabase
          .from('carteira_transacoes')
          .delete()
          .eq('origem_id', id)
          .like('descricao', 'Bônus: Inovação Validada extra%')
      }
      toast.success(newVal ? 'Inovação validada!' : 'Inovação invalidada!')
      loadData()
    }
  }

  const handleGerarAdiantamentoInovacao = async () => {
    setIsGenerating(true)
    const month = selectedWeek.substring(0, 7)
    try {
      const { error } = await supabase.rpc('gerar_adiantamento_mes_inovacao', { p_mes: month })
      if (error) throw error
      toast.success(`Adiantamentos de Inovação gerados para ${month}`)
    } catch (e: any) {
      toast.error('Erro ao gerar adiantamentos: ' + e.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleProcessarFechamentoInovacao = async () => {
    setIsGenerating(true)
    const month = selectedWeek.substring(0, 7)
    try {
      const { error } = await supabase.rpc('processar_fechamento_mes_inovacao', { p_mes: month })
      if (error) throw error
      toast.success(`Fechamento de Inovações processado para ${month}`)
    } catch (e: any) {
      toast.error('Erro ao processar fechamento: ' + e.message)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6 mt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Validação de Inovações</h2>
          <p className="text-sm text-slate-500">Gerencie as sugestões semanais da equipe</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedWeek} onValueChange={setSelectedWeek}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Selecione a semana" />
            </SelectTrigger>
            <SelectContent>
              {pastWeeks.map((w) => (
                <SelectItem key={w} value={w}>
                  Semana ref. {format(new Date(w + 'T12:00:00'), 'dd/MM/yyyy')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2 justify-end mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleGerarAdiantamentoInovacao}
          disabled={isGenerating}
        >
          Gerar Adiantamento Inovação (Mês)
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleProcessarFechamentoInovacao}
          disabled={isGenerating}
        >
          Fechamento Inovação (Mês)
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inovações da Semana Selecionada</CardTitle>
          <CardDescription>Todos os colaboradores com carteira ativa</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((u) => {
                const submission = submissions.find((s) => s.usuario_id === u.id)
                const hasFilled =
                  !!submission && !!submission.inovacoes && submission.inovacoes.trim() !== ''

                return (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                        {u.avatar_url ? (
                          <img src={u.avatar_url} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500 font-medium text-xs">
                            {u.nome.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-slate-800">{u.nome}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {hasFilled ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                              <span className="text-xs text-blue-600 font-medium">Enviada</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-xs text-slate-500 font-medium">Pendente</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" disabled={!hasFilled} className="gap-2">
                          <Eye className="w-4 h-4" /> Ver Inovação
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Inovação - {u.nome}</DialogTitle>
                        </DialogHeader>
                        {submission && (
                          <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 mt-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-bold text-blue-800">Inovações</h4>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-blue-700">
                                  Aprovar Inovação?
                                </span>
                                <Switch
                                  checked={submission.inovacao_validada}
                                  onCheckedChange={() =>
                                    handleToggleInovacao(
                                      submission.id,
                                      submission.inovacao_validada,
                                      submission.usuario_id,
                                      submission.data_registro,
                                    )
                                  }
                                />
                              </div>
                            </div>
                            <p className="text-sm text-blue-900 whitespace-pre-wrap">
                              {submission.inovacoes || 'Nenhuma inovação registrada.'}
                            </p>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

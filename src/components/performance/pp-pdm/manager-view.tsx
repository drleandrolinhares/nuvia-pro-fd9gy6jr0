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
import { Badge } from '@/components/ui/badge'
import {
  Eye,
  Trophy,
  AlertCircle,
  Loader2,
  CheckCircle2,
  XCircle,
  GraduationCap,
} from 'lucide-react'

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

export function ManagerPPDMView() {
  const pastWeeks = getPastSaturdays(10)
  const [selectedWeek, setSelectedWeek] = useState(pastWeeks[0])
  const [isGenerating, setIsGenerating] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [topMais, setTopMais] = useState<any[]>([])
  const [topMenos, setTopMenos] = useState<any[]>([])
  const [rankingNotas, setRankingNotas] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [selectedWeek])

  const loadData = async () => {
    setLoading(true)
    const { data: uData } = await supabase
      .from('usuarios')
      .select('id, nome, avatar_url')
      .eq('obrigatorio_pp_pdm', true)
    if (uData) setUsers(uData)

    const { data: sData } = await supabase
      .from('performance_pp_pdm' as any)
      .select('*')
      .eq('data_registro', selectedWeek)
    if (sData) setSubmissions(sData)

    const last4 = pastWeeks.slice(0, 4)
    if (uData) {
      const { data: sData4 } = await supabase
        .from('performance_pp_pdm' as any)
        .select('usuario_id, data_registro, nota_pdm')
        .in('data_registro', last4)
      const scores = uData.map((u) => {
        const userSubs = sData4?.filter((s) => s.usuario_id === u.id) || []
        const count = userSubs.length
        const totalNotas = userSubs.reduce((acc, s) => acc + (s.nota_pdm || 0), 0)
        const mediaNota = count > 0 ? (totalNotas / count).toFixed(1) : 0
        return { ...u, count, mediaNota: Number(mediaNota) }
      })

      setTopMais(
        [...scores]
          .sort((a, b) => b.count - a.count)
          .filter((s) => s.count > 0)
          .slice(0, 3),
      )
      setTopMenos([...scores].sort((a, b) => a.count - b.count).slice(0, 3))
      setRankingNotas(
        [...scores]
          .sort((a, b) => b.mediaNota - a.mediaNota)
          .filter((s) => s.count > 0)
          .slice(0, 3),
      )
    }
    setLoading(false)
  }

  const handleTogglePP = async (id: string, currentVal: boolean, currentNota: number) => {
    const newVal = !currentVal
    let newNota = currentNota || 0
    if (newVal) {
      newNota = Math.min(newNota + 2, 10)
    } else {
      newNota = Math.max(newNota - 2, 0)
    }

    const { error } = await supabase
      .from('performance_pp_pdm' as any)
      .update({ pp_validado: newVal, nota_pdm: newNota })
      .eq('id', id)

    if (!error) {
      toast.success(newVal ? 'Ponto Positivo validado!' : 'Ponto Positivo invalidado!')
      loadData()
    }
  }

  return (
    <div className="space-y-6 mt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Painel de Acompanhamento</h2>
          <p className="text-sm text-slate-500">Visualize as entregas semanais obrigatórias</p>
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

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-emerald-800 flex items-center gap-2 text-base">
                  <Trophy className="w-5 h-5 text-emerald-600" /> Top 3 Entregas (Mês)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topMais.length === 0 ? (
                    <p className="text-sm text-emerald-600/70">Nenhum dado recente.</p>
                  ) : (
                    topMais.map((u, i) => (
                      <div
                        key={u.id}
                        className="flex items-center justify-between bg-white p-2 rounded-lg border border-emerald-100 shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold">
                            {i + 1}
                          </div>
                          <span className="text-sm font-medium text-slate-700 truncate max-w-[90px]">
                            {u.nome}
                          </span>
                        </div>
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                          {u.count} entregas
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-violet-50 to-white border-violet-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-violet-800 flex items-center gap-2 text-base">
                  <GraduationCap className="w-5 h-5 text-violet-600" /> Ranking Notas PDM
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rankingNotas.length === 0 ? (
                    <p className="text-sm text-violet-600/70">Nenhum dado recente.</p>
                  ) : (
                    rankingNotas.map((u, i) => (
                      <div
                        key={u.id}
                        className="flex items-center justify-between bg-white p-2 rounded-lg border border-violet-100 shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-xs font-bold">
                            {i + 1}
                          </div>
                          <span className="text-sm font-medium text-slate-700 truncate max-w-[90px]">
                            {u.nome}
                          </span>
                        </div>
                        <Badge variant="secondary" className="bg-violet-100 text-violet-700">
                          Média {u.mediaNota}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-rose-50 to-white border-rose-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-rose-800 flex items-center gap-2 text-base">
                  <AlertCircle className="w-5 h-5 text-rose-600" /> Maiores Pendências
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topMenos.length === 0 ? (
                    <p className="text-sm text-rose-600/70">Todos em dia!</p>
                  ) : (
                    topMenos.map((u, i) => (
                      <div
                        key={u.id}
                        className="flex items-center justify-between bg-white p-2 rounded-lg border border-rose-100 shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 text-xs font-bold">
                            {i + 1}
                          </div>
                          <span className="text-sm font-medium text-slate-700 truncate max-w-[90px]">
                            {u.nome}
                          </span>
                        </div>
                        <Badge variant="secondary" className="bg-rose-100 text-rose-700">
                          {4 - u.count} pendentes
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Status da Semana Selecionada</CardTitle>
              <CardDescription>Colaboradores com preenchimento obrigatório</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {users.map((u) => {
                  const submission = submissions.find((s) => s.usuario_id === u.id)
                  const hasFilled = !!submission

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
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-xs text-emerald-600 font-medium">
                                  Preenchido
                                </span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5 text-rose-500" />
                                <span className="text-xs text-rose-600 font-medium">Pendente</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={!hasFilled}
                            className="gap-2"
                          >
                            <Eye className="w-4 h-4" /> Ler Feedback
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Feedback Semanal - {u.nome}</DialogTitle>
                          </DialogHeader>
                          {submission && (
                            <div className="space-y-6 pt-4">
                              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-bold text-emerald-800">
                                    Pontos Positivos (PP)
                                  </h4>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-emerald-700">
                                      Validar PP (+2 pts)?
                                    </span>
                                    <Switch
                                      checked={submission.pp_validado}
                                      onCheckedChange={() =>
                                        handleTogglePP(
                                          submission.id,
                                          submission.pp_validado,
                                          submission.nota_pdm,
                                        )
                                      }
                                    />
                                  </div>
                                </div>
                                <p className="text-sm text-emerald-900 whitespace-pre-wrap">
                                  {submission.pontos_positivos ||
                                    'Nenhum ponto positivo registrado.'}
                                </p>
                              </div>

                              <div className="p-4 rounded-lg bg-rose-50 border border-rose-100">
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="font-bold text-rose-800">
                                    Pontos de Melhoria (PDM)
                                  </h4>
                                  {submission.nota_pdm !== null &&
                                    submission.nota_pdm !== undefined && (
                                      <Badge
                                        variant="outline"
                                        className="bg-white text-rose-700 border-rose-200"
                                      >
                                        Nota: {submission.nota_pdm}/10
                                      </Badge>
                                    )}
                                </div>
                                {submission.pdm_itens &&
                                Array.isArray(submission.pdm_itens) &&
                                submission.pdm_itens.length > 0 ? (
                                  <div className="space-y-3">
                                    {submission.pdm_itens.map((item: any, idx: number) => (
                                      <div
                                        key={idx}
                                        className="bg-white p-3 rounded-lg border border-rose-100 shadow-sm space-y-2"
                                      >
                                        <div>
                                          <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block mb-0.5">
                                            Crítica
                                          </span>
                                          <p className="text-sm text-slate-800 whitespace-pre-wrap">
                                            {item.melhoria}
                                          </p>
                                        </div>
                                        <div className="pt-2 border-t border-slate-100">
                                          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider block mb-0.5">
                                            Sugestão de Solução
                                          </span>
                                          <p className="text-sm text-slate-800 whitespace-pre-wrap">
                                            {item.sugestao}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-rose-900 whitespace-pre-wrap">
                                    {submission.pontos_melhoria ||
                                      'Nenhum ponto de melhoria registrado.'}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

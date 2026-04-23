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
import { format, startOfWeek, addDays, isAfter } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Eye, Trophy, AlertCircle, Loader2, CheckCircle2, XCircle } from 'lucide-react'

function getPastSaturdays(count = 10) {
  const dates = []
  let now = new Date()
  let sunday = startOfWeek(now, { weekStartsOn: 0 })
  let saturday = addDays(sunday, 6)
  saturday.setHours(11, 59, 0, 0)

  if (isAfter(now, saturday)) {
    saturday = addDays(saturday, 7)
  }

  for (let i = 0; i < count; i++) {
    dates.push(format(saturday, 'yyyy-MM-dd'))
    saturday = addDays(saturday, -7)
  }
  return dates
}

export function ManagerPPDMView() {
  const pastWeeks = getPastSaturdays(10)
  const [selectedWeek, setSelectedWeek] = useState(pastWeeks[0])
  const [users, setUsers] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [topMais, setTopMais] = useState<any[]>([])
  const [topMenos, setTopMenos] = useState<any[]>([])

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
        .select('usuario_id, data_registro')
        .in('data_registro', last4)
      const scores = uData.map((u) => {
        const count = sData4?.filter((s) => s.usuario_id === u.id).length || 0
        return { ...u, count }
      })

      const sorted = [...scores].sort((a, b) => b.count - a.count)
      setTopMais(sorted.filter((s) => s.count > 0).slice(0, 3))
      setTopMenos([...scores].sort((a, b) => a.count - b.count).slice(0, 3))
    }

    setLoading(false)
  }

  return (
    <div className="space-y-6 mt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Painel de Acompanhamento</h2>
          <p className="text-sm text-slate-500">Visualize as entregas semanais obrigatórias</p>
        </div>
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

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          <span className="text-sm font-medium text-slate-700">{u.nome}</span>
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                        >
                          {u.count} entregas
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
                  <AlertCircle className="w-5 h-5 text-rose-600" /> Maiores Pendências (Mês)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topMenos.length === 0 ? (
                    <p className="text-sm text-rose-600/70">Todos estão em dia!</p>
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
                          <span className="text-sm font-medium text-slate-700">{u.nome}</span>
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-rose-100 text-rose-700 hover:bg-rose-100"
                        >
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
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Feedback Semanal - {u.nome}</DialogTitle>
                          </DialogHeader>
                          {submission && (
                            <div className="space-y-4 pt-4">
                              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100">
                                <h4 className="font-bold text-emerald-800 mb-2">
                                  Pontos Positivos (PP)
                                </h4>
                                <p className="text-sm text-emerald-900 whitespace-pre-wrap">
                                  {submission.pontos_positivos ||
                                    'Nenhum ponto positivo registrado.'}
                                </p>
                              </div>
                              <div className="p-4 rounded-lg bg-rose-50 border border-rose-100">
                                <h4 className="font-bold text-rose-800 mb-2">
                                  Pontos de Melhoria (PDM)
                                </h4>
                                <p className="text-sm text-rose-900 whitespace-pre-wrap">
                                  {submission.pontos_melhoria ||
                                    'Nenhum ponto de melhoria registrado.'}
                                </p>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  )
                })}
                {users.length === 0 && (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    Nenhum colaborador configurado como obrigatório. Acesse a aba Configurações.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

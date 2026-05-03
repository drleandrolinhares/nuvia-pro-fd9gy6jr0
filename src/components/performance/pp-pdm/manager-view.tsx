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
import { Textarea } from '@/components/ui/textarea'
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
import { useAuth } from '@/hooks/use-auth'

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

function PendingUserCard({ u }: { u: any }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-rose-100 bg-rose-50/30">
      <div className="w-8 h-8 rounded-full bg-rose-100 overflow-hidden border border-rose-200">
        {u.avatar_url ? (
          <img src={u.avatar_url} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-rose-500 font-medium text-xs">
            {u.nome.substring(0, 2).toUpperCase()}
          </div>
        )}
      </div>
      <div>
        <p className="font-medium text-sm text-slate-800">{u.nome}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <XCircle className="w-3.5 h-3.5 text-rose-500" />
          <span className="text-xs text-rose-600 font-medium">Aguardando Envio</span>
        </div>
      </div>
    </div>
  )
}

function GestorConsiderationBlock({
  title,
  gestorKey,
  isOwner,
  consideration,
  onSave,
}: {
  title: string
  gestorKey: string
  isOwner: boolean
  consideration: any
  onSave: (texto: string) => Promise<void>
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [text, setText] = useState(consideration?.texto || '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setText(consideration?.texto || '')
  }, [consideration])

  const handleSave = async () => {
    setSaving(true)
    await onSave(text)
    setSaving(false)
    setIsEditing(false)
  }

  return (
    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700 text-sm">{title}</span>
          {consideration?.texto ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-500" />
          )}
        </div>
        {isOwner && !isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="h-6 text-xs px-2 text-slate-500 hover:text-slate-800"
          >
            {consideration?.texto ? 'Editar' : 'Adicionar'}
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2 mt-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="text-sm min-h-[80px] bg-white resize-none"
            placeholder="Digite suas considerações..."
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsEditing(false)
                setText(consideration?.texto || '')
              }}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!text.trim() || saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              Salvar
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-1">
          {consideration?.texto ? (
            <div className="text-sm text-slate-600 whitespace-pre-wrap">
              {consideration.texto}
              <div className="text-[10px] text-slate-400 mt-2 font-medium">
                Salvo em {format(new Date(consideration.data), 'dd/MM/yyyy HH:mm')}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">Nenhuma consideração registrada.</p>
          )}
        </div>
      )}
    </div>
  )
}

function FilledUserCard({
  u,
  submission,
  onReload,
}: {
  u: any
  submission: any
  onReload: () => void
}) {
  const { profile } = useAuth()
  const [open, setOpen] = useState(false)

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
      onReload()
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('performance_pp_pdm' as any)
      .update({ status_gestao: newStatus })
      .eq('id', id)

    if (!error) {
      toast.success('Status atualizado!')
      onReload()
    }
  }

  const historico = Array.isArray(submission.consideracoes_gestao)
    ? submission.consideracoes_gestao
    : []

  const consLeandro = historico.find(
    (c: any) =>
      c.gestor === 'leandro' ||
      c.admin_nome?.toLowerCase().includes('leandro') ||
      c.admin_email?.includes('leandro'),
  )
  const consStephani = historico.find(
    (c: any) => c.gestor === 'stephani' || c.admin_nome?.toLowerCase().includes('stephani'),
  )
  const consHeloisa = historico.find(
    (c: any) => c.gestor === 'heloisa' || c.admin_nome?.toLowerCase().includes('heloisa'),
  )

  const isLeandro = Boolean(
    profile?.nome?.toLowerCase().includes('leandro') ||
    profile?.email?.toLowerCase().includes('leandro'),
  )
  const isStephani = Boolean(profile?.nome?.toLowerCase().includes('stephani'))
  const isHeloisa = Boolean(profile?.nome?.toLowerCase().includes('heloisa'))

  const allFilled = !!(consLeandro?.texto && consStephani?.texto && consHeloisa?.texto)

  const handleSaveGestor = async (gestorKey: string, texto: string) => {
    const historicoAtual = Array.isArray(submission.consideracoes_gestao)
      ? submission.consideracoes_gestao
      : []
    const novoHistorico = historicoAtual.filter(
      (c: any) => c.gestor !== gestorKey && !c.admin_nome?.toLowerCase().includes(gestorKey),
    )
    novoHistorico.push({
      gestor: gestorKey,
      admin_id: profile?.id,
      admin_nome: profile?.nome || gestorKey,
      data: new Date().toISOString(),
      texto,
    })

    const { error } = await supabase
      .from('performance_pp_pdm' as any)
      .update({ consideracoes_gestao: novoHistorico })
      .eq('id', submission.id)

    if (!error) {
      toast.success('Consideração salva!')
      onReload()
    } else {
      toast.error('Erro ao salvar consideração.')
    }
  }

  const outrasConsideracoes = historico.filter(
    (c: any) =>
      c.gestor !== 'leandro' &&
      c.gestor !== 'stephani' &&
      c.gestor !== 'heloisa' &&
      !c.admin_nome?.toLowerCase().includes('leandro') &&
      !c.admin_nome?.toLowerCase().includes('stephani') &&
      !c.admin_nome?.toLowerCase().includes('heloisa'),
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolvido':
        return (
          <Badge
            variant="outline"
            className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
          >
            Resolvido
          </Badge>
        )
      case 'em_acompanhamento':
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100"
          >
            Em Acompanhamento
          </Badge>
        )
      case 'requer_reuniao':
        return (
          <Badge
            variant="outline"
            className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100"
          >
            Requer Reunião
          </Badge>
        )
      default:
        return (
          <Badge
            variant="outline"
            className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100"
          >
            Aguardando Ação
          </Badge>
        )
    }
  }

  return (
    <div className="flex flex-col p-3 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-sm gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-200">
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
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs text-slate-500 font-medium">Enviado</span>
            </div>
          </div>
        </div>
        {getStatusBadge(submission.status_gestao || 'aguardando_acao')}
      </div>

      <div className="flex items-center justify-end border-t border-slate-100 pt-3 mt-1">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 bg-slate-50">
              <Eye className="w-4 h-4" /> Analisar Feedback
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-50">
            <DialogHeader>
              <DialogTitle className="text-slate-800">Feedback e Ações - {u.nome}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-100 flex flex-col">
                  <div className="flex items-center justify-between mb-3 border-b border-emerald-100 pb-2">
                    <h4 className="font-bold text-emerald-800 text-sm">Pontos Positivos (PP)</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-medium text-emerald-700">
                        Validar (+2 pts)
                      </span>
                      <Switch
                        checked={submission.pp_validado}
                        onCheckedChange={() =>
                          handleTogglePP(submission.id, submission.pp_validado, submission.nota_pdm)
                        }
                      />
                    </div>
                  </div>
                  <p className="text-sm text-emerald-900 whitespace-pre-wrap flex-1">
                    {submission.pontos_positivos || 'Nenhum ponto positivo registrado.'}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-rose-50/50 border border-rose-100 flex flex-col">
                  <div className="flex items-center justify-between mb-3 border-b border-rose-100 pb-2">
                    <h4 className="font-bold text-rose-800 text-sm">Pontos de Melhoria (PDM)</h4>
                    {submission.nota_pdm !== null && submission.nota_pdm !== undefined && (
                      <Badge
                        variant="outline"
                        className="bg-white text-rose-700 border-rose-200 text-[10px]"
                      >
                        Nota: {submission.nota_pdm}/10
                      </Badge>
                    )}
                  </div>
                  {submission.pdm_itens &&
                  Array.isArray(submission.pdm_itens) &&
                  submission.pdm_itens.length > 0 ? (
                    <div className="space-y-3 flex-1">
                      {submission.pdm_itens.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="bg-white p-2.5 rounded border border-rose-100 shadow-sm space-y-1.5"
                        >
                          <div>
                            <span className="text-[9px] font-bold text-rose-500 uppercase tracking-wider block">
                              Crítica
                            </span>
                            <p className="text-xs text-slate-800 whitespace-pre-wrap">
                              {item.melhoria}
                            </p>
                          </div>
                          <div className="pt-1.5 border-t border-slate-50">
                            <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider block">
                              Sugestão
                            </span>
                            <p className="text-xs text-slate-800 whitespace-pre-wrap">
                              {item.sugestao}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-rose-900 whitespace-pre-wrap flex-1">
                      {submission.pontos_melhoria || 'Nenhum ponto de melhoria registrado.'}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 border-b border-slate-100 pb-3 gap-3">
                  <div>
                    <h4 className="font-bold text-slate-800 text-base">
                      Ações e Considerações da Gestão
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      O status "Resolvido" exige a análise dos 3 gestores.
                    </p>
                  </div>
                  <Select
                    value={submission.status_gestao || 'aguardando_acao'}
                    onValueChange={(val) => handleUpdateStatus(submission.id, val)}
                  >
                    <SelectTrigger className="w-[180px] h-8 text-xs bg-slate-50 border-slate-200">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aguardando_acao">Aguardando Ação</SelectItem>
                      <SelectItem value="em_acompanhamento">Em Acompanhamento</SelectItem>
                      <SelectItem value="requer_reuniao">Requer Reunião</SelectItem>
                      <SelectItem value="resolvido" disabled={!allFilled}>
                        Resolvido {!allFilled ? '(Pendente)' : ''}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3 mb-4 pr-2">
                  <GestorConsiderationBlock
                    title="Considerações Leandro"
                    gestorKey="leandro"
                    isOwner={isLeandro}
                    consideration={consLeandro}
                    onSave={(texto) => handleSaveGestor('leandro', texto)}
                  />
                  <GestorConsiderationBlock
                    title="Considerações Stephani"
                    gestorKey="stephani"
                    isOwner={isStephani}
                    consideration={consStephani}
                    onSave={(texto) => handleSaveGestor('stephani', texto)}
                  />
                  <GestorConsiderationBlock
                    title="Considerações Heloisa"
                    gestorKey="heloisa"
                    isOwner={isHeloisa}
                    consideration={consHeloisa}
                    onSave={(texto) => handleSaveGestor('heloisa', texto)}
                  />

                  {outrasConsideracoes.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Outras Considerações Históricas
                      </h5>
                      <div className="space-y-2">
                        {outrasConsideracoes.map((cons: any, idx: number) => (
                          <div
                            key={idx}
                            className="bg-slate-50 p-2.5 rounded border border-slate-100 text-sm"
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-slate-600 text-xs">
                                {cons.admin_nome}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {format(new Date(cons.data), 'dd/MM/yyyy HH:mm')}
                              </span>
                            </div>
                            <p className="text-slate-600 whitespace-pre-wrap text-xs">
                              {cons.texto}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export function ManagerPPDMView() {
  const pastWeeks = getPastSaturdays(10)
  const [selectedWeek, setSelectedWeek] = useState(pastWeeks[0])
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

  const filledUsers = users.filter((u) => submissions.find((s) => s.usuario_id === u.id))
  const pendingUsers = users.filter((u) => !submissions.find((s) => s.usuario_id === u.id))

  return (
    <div className="space-y-6 mt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Painel de Acompanhamento</h2>
          <p className="text-sm text-slate-500">Visualize e direcione as entregas semanais</p>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-emerald-100 shadow-sm bg-white">
              <CardHeader className="bg-emerald-50/50 border-b border-emerald-100 pb-4">
                <CardTitle className="text-emerald-800 flex items-center gap-2 text-base">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Feedbacks Recebidos (
                  {filledUsers.length})
                </CardTitle>
                <CardDescription className="text-emerald-600/70">
                  Colaboradores que já enviaram e aguardam análise
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {filledUsers.length === 0 ? (
                    <div className="text-center py-8 text-emerald-600/60 text-sm">
                      Nenhum feedback recebido ainda.
                    </div>
                  ) : (
                    filledUsers.map((u) => (
                      <FilledUserCard
                        key={u.id}
                        u={u}
                        submission={submissions.find((s) => s.usuario_id === u.id)}
                        onReload={loadData}
                      />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-rose-100 shadow-sm bg-white">
              <CardHeader className="bg-rose-50/50 border-b border-rose-100 pb-4">
                <CardTitle className="text-rose-800 flex items-center gap-2 text-base">
                  <XCircle className="w-5 h-5 text-rose-600" /> Feedbacks Pendentes (
                  {pendingUsers.length})
                </CardTitle>
                <CardDescription className="text-rose-600/70">
                  Colaboradores que ainda não enviaram nesta semana
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {pendingUsers.length === 0 ? (
                    <div className="text-center py-8 text-emerald-600 font-medium text-sm">
                      Todos os colaboradores preencheram! 🎉
                    </div>
                  ) : (
                    pendingUsers.map((u) => <PendingUserCard key={u.id} u={u} />)
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

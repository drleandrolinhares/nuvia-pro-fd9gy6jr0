import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, CalendarDays, CheckCircle, AlertTriangle, Plus, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import {
  format,
  parseISO,
  addYears,
  subDays,
  differenceInDays,
  isBefore,
  isValid,
  differenceInYears,
  differenceInMonths,
  addMonths,
  addDays,
} from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface UsuarioRH {
  id: string
  nome: string
  data_admissao: string | null
  avatar_url: string | null
}

interface PeriodoFerias {
  id: string
  usuario_id: string
  periodo_inicio: string
  periodo_fim: string
  prazo_limite: string
  dias_direito: number
  dias_gozados: number
  historico: any[]
  status: string
}

const getTempoDeCasa = (dataAdmissao: string) => {
  const dateISO = parseISO(dataAdmissao)
  if (!isValid(dateISO)) return '0 dias'

  const admissao = new Date(dateISO.getFullYear(), dateISO.getMonth(), dateISO.getDate())
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  if (isBefore(now, admissao)) return '0 dias'

  const years = differenceInYears(now, admissao)
  const admissaoPlusYears = addYears(admissao, years)

  const months = differenceInMonths(now, admissaoPlusYears)
  const admissaoPlusMonths = addMonths(admissaoPlusYears, months)

  const days = differenceInDays(now, admissaoPlusMonths)

  const parts = []
  if (years > 0) parts.push(`${years} ${years === 1 ? 'ano' : 'anos'}`)
  if (months > 0) parts.push(`${months} ${months === 1 ? 'mês' : 'meses'}`)
  if (days > 0) parts.push(`${days} ${days === 1 ? 'dia' : 'dias'}`)

  return parts.length > 0 ? parts.join(', ') : '0 dias'
}

export function GestaoRH() {
  const [usuarios, setUsuarios] = useState<UsuarioRH[]>([])
  const [periodos, setPeriodos] = useState<PeriodoFerias[]>([])
  const [loading, setLoading] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)

  const [selectedUser, setSelectedUser] = useState<UsuarioRH | null>(null)
  const [selectedPeriodo, setSelectedPeriodo] = useState<PeriodoFerias | null>(null)
  const [selectedUserHistory, setSelectedUserHistory] = useState<{
    usuario: UsuarioRH
    periodos: PeriodoFerias[]
  } | null>(null)

  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [dataRetorno, setDataRetorno] = useState('')
  const [saving, setSaving] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('usuarios')
        .select('id, nome, data_admissao, avatar_url')
        .eq('status', 'ativo')
        .eq('elegivel_ferias', true)
        .not('data_admissao', 'is', null)

      if (usersError) throw usersError

      const { data: periodosData, error: periodosError } = await supabase
        .from('rh_ferias')
        .select('*')

      if (periodosError) {
        console.error(periodosError)
      }

      const fetchedPeriodos = periodosData || []

      for (const p of fetchedPeriodos) {
        if (p.periodo_inicio) {
          const dateISO = parseISO(p.periodo_inicio)
          const pInicio = new Date(dateISO.getFullYear(), dateISO.getMonth(), dateISO.getDate())

          const expectedFim = format(subDays(addYears(pInicio, 1), 1), 'yyyy-MM-dd')
          const expectedLimite = format(subDays(addYears(pInicio, 2), 1), 'yyyy-MM-dd')

          let updated = false
          const updates: any = {}

          if (p.periodo_fim !== expectedFim) {
            p.periodo_fim = expectedFim
            updates.periodo_fim = expectedFim
            updated = true
          }

          if (p.prazo_limite !== expectedLimite) {
            p.prazo_limite = expectedLimite
            updates.prazo_limite = expectedLimite
            updated = true
          }

          if (updated) {
            supabase.from('rh_ferias').update(updates).eq('id', p.id).then()
          }
        }
      }

      for (const u of usersData || []) {
        if (!u.data_admissao) continue
        const dateISO = parseISO(u.data_admissao)
        if (!isValid(dateISO)) continue

        const admissao = new Date(dateISO.getFullYear(), dateISO.getMonth(), dateISO.getDate())
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        let userPeriodos = fetchedPeriodos.filter((p) => p.usuario_id === u.id)
        userPeriodos.sort((a, b) => a.periodo_inicio.localeCompare(b.periodo_inicio))

        if (userPeriodos.length === 0) {
          const pFim = subDays(addYears(admissao, 1), 1)
          const limite = subDays(addYears(admissao, 2), 1)
          const novo = {
            usuario_id: u.id,
            periodo_inicio: format(admissao, 'yyyy-MM-dd'),
            periodo_fim: format(pFim, 'yyyy-MM-dd'),
            prazo_limite: format(limite, 'yyyy-MM-dd'),
            dias_direito: 30,
            dias_gozados: 0,
            historico: [],
            status: 'pendente',
          }
          const { data: inserted, error } = await supabase
            .from('rh_ferias')
            .insert(novo)
            .select()
            .single()
          if (!error && inserted) {
            fetchedPeriodos.push(inserted)
            userPeriodos.push(inserted)
          }
        }

        let latest = userPeriodos[userPeriodos.length - 1]
        let safeguard = 0
        while (safeguard < 10 && latest) {
          const lastFimDate = parseISO(latest.periodo_fim)
          const lastFim = new Date(
            lastFimDate.getFullYear(),
            lastFimDate.getMonth(),
            lastFimDate.getDate(),
          )

          if (isBefore(lastFim, today)) {
            const nextInicio = addDays(lastFim, 1)
            const nextFim = subDays(addYears(nextInicio, 1), 1)
            const nextLimite = subDays(addYears(nextInicio, 2), 1)

            const existing = userPeriodos.find(
              (p) => p.periodo_inicio === format(nextInicio, 'yyyy-MM-dd'),
            )
            if (existing) break

            const novo = {
              usuario_id: u.id,
              periodo_inicio: format(nextInicio, 'yyyy-MM-dd'),
              periodo_fim: format(nextFim, 'yyyy-MM-dd'),
              prazo_limite: format(nextLimite, 'yyyy-MM-dd'),
              dias_direito: 30,
              dias_gozados: 0,
              historico: [],
              status: 'pendente',
            }
            const { data: inserted, error } = await supabase
              .from('rh_ferias')
              .insert(novo)
              .select()
              .single()

            if (!error && inserted) {
              fetchedPeriodos.push(inserted)
              userPeriodos.push(inserted)
              latest = inserted
            } else {
              break
            }
          } else {
            break
          }
          safeguard++
        }
      }

      setUsuarios(usersData || [])
      setPeriodos(fetchedPeriodos)
    } catch (error) {
      console.error('Error loading RH data', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    const channel = supabase
      .channel('rh-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rh_ferias' }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'usuarios' }, loadData)
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleOpenModal = (u: UsuarioRH, p: PeriodoFerias) => {
    setSelectedUser(u)
    setSelectedPeriodo(p)
    setDataInicio('')
    setDataFim('')
    setDataRetorno('')
    setIsModalOpen(true)
  }

  const handleOpenHistory = (u: UsuarioRH, periodos: PeriodoFerias[]) => {
    setSelectedUserHistory({ usuario: u, periodos })
    setIsHistoryModalOpen(true)
  }

  const handleSaveFerias = async () => {
    if (!selectedPeriodo || !dataInicio || !dataFim || !dataRetorno) {
      toast.error('Preencha todas as datas.')
      return
    }

    const dInicio = parseISO(dataInicio)
    const dFim = parseISO(dataFim)

    if (isBefore(dFim, dInicio)) {
      toast.error('Data Fim deve ser maior ou igual a Data Início.')
      return
    }

    const dias = differenceInDays(dFim, dInicio) + 1
    const totalGozados = selectedPeriodo.dias_gozados + dias

    if (totalGozados > selectedPeriodo.dias_direito) {
      toast.error(
        `Excede o limite. Restam ${selectedPeriodo.dias_direito - selectedPeriodo.dias_gozados} dias.`,
      )
      return
    }

    setSaving(true)
    try {
      const historicoAtual = Array.isArray(selectedPeriodo.historico)
        ? selectedPeriodo.historico
        : []
      const novoHistorico = [
        ...historicoAtual,
        { data_inicio: dataInicio, data_fim: dataFim, data_retorno: dataRetorno, dias },
      ]

      const { error } = await supabase
        .from('rh_ferias')
        .update({
          dias_gozados: totalGozados,
          historico: novoHistorico,
          status: totalGozados >= selectedPeriodo.dias_direito ? 'concluido' : 'parcial',
          atualizado_em: new Date().toISOString(),
        })
        .eq('id', selectedPeriodo.id)

      if (error) throw error

      toast.success('Férias registradas com sucesso!')
      setIsModalOpen(false)
      loadData()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao registrar férias')
    } finally {
      setSaving(false)
    }
  }

  const displayData = usuarios
    .map((u) => {
      const userPeriodos = periodos.filter((p) => p.usuario_id === u.id)
      userPeriodos.sort((a, b) => a.periodo_inicio.localeCompare(b.periodo_inicio))

      let active = userPeriodos.find((p) => p.status !== 'concluido')

      if (!active && userPeriodos.length > 0) {
        active = userPeriodos[userPeriodos.length - 1]
      }

      let statusSemaforo = 'green'
      let diasRestantes = 0
      let mesesAteLimite = 999
      let diffDays = 9999

      if (active) {
        diasRestantes = active.dias_direito - active.dias_gozados
        if (diasRestantes > 0) {
          diffDays = differenceInDays(parseISO(active.prazo_limite), new Date())
          mesesAteLimite = diffDays / 30
          if (diffDays < 0) statusSemaforo = 'red'
          else if (mesesAteLimite < 2) statusSemaforo = 'red'
          else if (mesesAteLimite < 4) statusSemaforo = 'yellow'
        } else {
          statusSemaforo = 'blue'
        }
      }

      return {
        usuario: u,
        periodo: active,
        statusSemaforo,
        diasRestantes,
        diffDays,
        todosPeriodos: userPeriodos,
      }
    })
    .sort((a, b) => a.diffDays - b.diffDays)

  return (
    <Card className="border-slate-800 bg-slate-900 shadow-sm flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-md">
            <Users className="size-5 text-amber-500" />
          </div>
          <CardTitle className="text-lg font-bold uppercase tracking-wider text-slate-100">
            Gestão de RH (Férias)
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="animate-spin text-amber-500 w-8 h-8" />
          </div>
        ) : displayData.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-slate-800 m-4 rounded-lg bg-slate-950/50">
            <CalendarDays className="w-8 h-8 text-slate-600 mb-2" />
            <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">
              Nenhum colaborador elegível encontrado.
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Edite o perfil do colaborador e ative a opção "Elegível para Férias (CLT)".
            </p>
          </div>
        ) : (
          <div className="min-w-[800px]">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 uppercase bg-slate-950 border-b border-slate-800 tracking-wider">
                <tr>
                  <th className="px-4 py-4 font-semibold">Colaborador</th>
                  <th className="px-4 py-4 font-semibold">Período Aquisitivo</th>
                  <th className="px-4 py-4 font-semibold">Vencimento (1 Ano)</th>
                  <th className="px-4 py-4 font-semibold">Prazo Limite</th>
                  <th className="px-4 py-4 font-semibold text-center">Dias (Gozo / Resta)</th>
                  <th className="px-4 py-4 font-semibold text-center">Status</th>
                  <th className="px-4 py-4 font-semibold text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {displayData.map((item, idx) => {
                  let countdownText = ''
                  let isAdquirido = false

                  if (item.periodo) {
                    const targetDateISO = parseISO(item.periodo.periodo_fim)
                    const target = new Date(
                      targetDateISO.getFullYear(),
                      targetDateISO.getMonth(),
                      targetDateISO.getDate(),
                    )
                    const now = new Date()
                    now.setHours(0, 0, 0, 0)

                    if (isBefore(now, target)) {
                      const years = differenceInYears(target, now)
                      const nowPlusYears = addYears(now, years)
                      const months = differenceInMonths(target, nowPlusYears)
                      const nowPlusMonths = addMonths(nowPlusYears, months)
                      const days = differenceInDays(target, nowPlusMonths)

                      const parts = []
                      if (years > 0) parts.push(`${years}a`)
                      if (months > 0) parts.push(`${months}m`)
                      if (days > 0) parts.push(`${days}d`)

                      if (parts.length > 0) {
                        countdownText = `Faltam ${parts.join(' e ')}`
                      } else {
                        countdownText = `Vence amanhã`
                      }
                    } else if (target.getTime() === now.getTime()) {
                      isAdquirido = true
                      countdownText = 'Vence hoje'
                    } else {
                      isAdquirido = true
                      const years = differenceInYears(now, target)
                      const targetPlusYears = addYears(target, years)
                      const months = differenceInMonths(now, targetPlusYears)
                      const targetPlusMonths = addMonths(targetPlusYears, months)
                      const days = differenceInDays(now, targetPlusMonths)

                      const parts = []
                      if (years > 0) parts.push(`${years}a`)
                      if (months > 0) parts.push(`${months}m`)
                      if (days > 0) parts.push(`${days}d`)

                      if (parts.length > 0) {
                        countdownText = `Vencido há ${parts.join(' e ')}`
                      } else {
                        countdownText = 'Venceu recentemente'
                      }
                    }
                  }

                  return (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8 border border-slate-700">
                            <AvatarImage
                              src={
                                item.usuario.avatar_url ||
                                `https://img.usecurling.com/ppl/thumbnail?seed=${item.usuario.id}`
                              }
                            />
                            <AvatarFallback className="bg-slate-800 text-slate-300">
                              {item.usuario.nome.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-slate-200">{item.usuario.nome}</p>
                            <div className="flex flex-col text-xs text-slate-500 mt-0.5 gap-0.5">
                              <span>
                                Admissão:{' '}
                                {item.usuario.data_admissao
                                  ? format(parseISO(item.usuario.data_admissao), 'dd/MM/yyyy')
                                  : '-'}
                              </span>
                              {item.usuario.data_admissao && (
                                <span className="text-[10px] text-amber-500/80 font-medium">
                                  Tempo de casa: {getTempoDeCasa(item.usuario.data_admissao)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-300">
                        {item.periodo ? (
                          <div className="flex flex-col">
                            <span className="text-xs">
                              {format(parseISO(item.periodo.periodo_inicio), 'dd/MM/yy')} até{' '}
                              <br className="hidden lg:block" />
                              {format(parseISO(item.periodo.periodo_fim), 'dd/MM/yy')}
                            </span>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {item.periodo ? (
                          <div className="flex flex-col gap-1.5 items-start">
                            <span className="font-medium text-slate-200">
                              {format(parseISO(item.periodo.periodo_fim), 'dd/MM/yyyy')}
                            </span>
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-[10px] px-1.5 py-0 font-semibold tracking-wide border whitespace-nowrap',
                                isAdquirido
                                  ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10'
                                  : 'text-blue-400 border-blue-400/30 bg-blue-400/10',
                              )}
                            >
                              {countdownText}
                            </Badge>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {item.periodo ? (
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                'font-medium',
                                item.statusSemaforo === 'red'
                                  ? 'text-red-400'
                                  : item.statusSemaforo === 'yellow'
                                    ? 'text-amber-400'
                                    : 'text-slate-300',
                              )}
                            >
                              {format(parseISO(item.periodo.prazo_limite), 'dd/MM/yyyy')}
                            </span>
                            {item.statusSemaforo === 'red' && (
                              <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                            )}
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {item.periodo ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950 border border-slate-800 shadow-sm">
                            <span className="text-emerald-400 font-bold">
                              {item.periodo.dias_gozados}
                            </span>
                            <span className="text-slate-600">/</span>
                            <span className="text-amber-500 font-bold">{item.diasRestantes}</span>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {item.statusSemaforo === 'red' ? (
                          <Badge className="bg-red-500/20 text-red-400 border-0 uppercase font-bold text-[10px]">
                            Crítico
                          </Badge>
                        ) : item.statusSemaforo === 'yellow' ? (
                          <Badge className="bg-amber-500/20 text-amber-400 border-0 uppercase font-bold text-[10px]">
                            Atenção
                          </Badge>
                        ) : item.statusSemaforo === 'blue' ? (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-0 uppercase font-bold text-[10px]">
                            Concluído
                          </Badge>
                        ) : (
                          <Badge className="bg-slate-800 text-slate-300 border-0 uppercase font-bold text-[10px]">
                            No Prazo
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenHistory(item.usuario, item.todosPeriodos)}
                            className="h-8 text-[10px] uppercase font-bold border-slate-700 bg-slate-950 hover:bg-slate-800 text-slate-300"
                          >
                            Histórico
                          </Button>
                          {item.periodo && item.diasRestantes > 0 && (
                            <Button
                              size="sm"
                              onClick={() => handleOpenModal(item.usuario, item.periodo!)}
                              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold uppercase text-[10px] h-8"
                            >
                              <Plus className="w-3 h-3 mr-1.5" /> Registrar
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Registrar Férias</DialogTitle>
          </DialogHeader>
          {selectedUser && selectedPeriodo && (
            <div className="py-4 space-y-4">
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 mb-4">
                <p className="text-sm font-semibold text-slate-200">{selectedUser.nome}</p>
                <p className="text-xs text-amber-500 font-medium mt-1">
                  Dias disponíveis: {selectedPeriodo.dias_direito - selectedPeriodo.dias_gozados}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Data Início</Label>
                <Input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Data Fim</Label>
                <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Data Retorno</Label>
                <Input
                  type="date"
                  value={dataRetorno}
                  onChange={(e) => setDataRetorno(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSaveFerias} disabled={saving}>
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}{' '}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
        <DialogContent className="sm:max-w-[600px] bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-slate-100">Histórico de Férias</DialogTitle>
          </DialogHeader>
          {selectedUserHistory && (
            <div className="py-4 space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <Avatar className="size-10 border border-slate-700">
                  <AvatarImage
                    src={
                      selectedUserHistory.usuario.avatar_url ||
                      `https://img.usecurling.com/ppl/thumbnail?seed=${selectedUserHistory.usuario.id}`
                    }
                  />
                  <AvatarFallback className="bg-slate-800 text-slate-300">
                    {selectedUserHistory.usuario.nome.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-slate-200">{selectedUserHistory.usuario.nome}</p>
                  <p className="text-xs text-slate-500">
                    Admissão:{' '}
                    {selectedUserHistory.usuario.data_admissao
                      ? format(parseISO(selectedUserHistory.usuario.data_admissao), 'dd/MM/yyyy')
                      : '-'}
                  </p>
                </div>
              </div>

              {selectedUserHistory.periodos.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">
                  Nenhum período registrado.
                </p>
              ) : (
                <div className="space-y-4">
                  {selectedUserHistory.periodos.map((p, i) => (
                    <div key={p.id} className="bg-slate-950 border border-slate-800 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-200">
                            Período {i + 1}: {format(parseISO(p.periodo_inicio), 'dd/MM/yyyy')} a{' '}
                            {format(parseISO(p.periodo_fim), 'dd/MM/yyyy')}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            Prazo Limite:{' '}
                            <span className="text-slate-300">
                              {format(parseISO(p.prazo_limite), 'dd/MM/yyyy')}
                            </span>
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            p.status === 'concluido'
                              ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10'
                              : 'text-amber-400 border-amber-400/30 bg-amber-400/10',
                          )}
                        >
                          {p.status === 'concluido' ? 'Concluído' : 'Pendente'}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm mb-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-500">Direito</span>
                          <span className="font-medium text-slate-300">{p.dias_direito} dias</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-500">Gozados</span>
                          <span className="font-medium text-emerald-400">
                            {p.dias_gozados} dias
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-500">Restantes</span>
                          <span className="font-medium text-amber-500">
                            {p.dias_direito - p.dias_gozados} dias
                          </span>
                        </div>
                      </div>

                      {p.historico && p.historico.length > 0 ? (
                        <div className="space-y-2 mt-3 pt-3 border-t border-slate-800">
                          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                            Lançamentos
                          </p>
                          {p.historico.map((h: any, idx: number) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center bg-slate-900 rounded px-3 py-2 text-sm border border-slate-800/50"
                            >
                              <div className="flex gap-4">
                                <div>
                                  <span className="text-xs text-slate-500 block">Início</span>
                                  <span className="text-slate-300">
                                    {format(parseISO(h.data_inicio), 'dd/MM/yyyy')}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-xs text-slate-500 block">Fim</span>
                                  <span className="text-slate-300">
                                    {format(parseISO(h.data_fim), 'dd/MM/yyyy')}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-xs text-slate-500 block">Retorno</span>
                                  <span className="text-slate-300">
                                    {format(parseISO(h.data_retorno), 'dd/MM/yyyy')}
                                  </span>
                                </div>
                              </div>
                              <Badge className="bg-slate-800 text-slate-300">{h.dias} dias</Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-3 pt-3 border-t border-slate-800">
                          <p className="text-xs text-slate-500 italic">
                            Nenhum lançamento registrado neste período.
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsHistoryModalOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

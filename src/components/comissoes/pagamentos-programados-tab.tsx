import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  CalendarClock,
  CheckCircle2,
  XCircle,
  Calendar,
  History,
  AlertTriangle,
  Loader2,
  DollarSign,
  TrendingUp,
  FileText,
  UserCheck,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import {
  fetchAjustesProgramados,
  alterarDataProgramada,
  marcarProgramadoComoPago,
  cancelarProgramadoDefinitivo,
  fetchComissaoAjusteLogs,
  type ComissaoAjuste,
  type ComissaoAjusteLog,
} from '@/services/comissao-ajustes'

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

const formatDate = (d: string | null | undefined) => {
  if (!d) return '-'
  const [y, m, day] = d.substring(0, 10).split('-')
  return `${day}/${m}/${y}`
}

const formatDateTime = (dtStr: string | null | undefined) => {
  if (!dtStr) return '-'
  try {
    const d = new Date(dtStr)
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dtStr
  }
}

export function PagamentosProgramadosTab({
  competencia,
  onAtualizarDashboard,
}: {
  competencia: string
  onAtualizarDashboard?: () => void
}) {
  const { toast } = useToast()
  const { profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [ajustes, setAjustes] = useState<ComissaoAjuste[]>([])

  // Modal Alterar Data
  const [modalDataAberto, setModalDataAberto] = useState(false)
  const [ajusteEdicaoData, setAjusteEdicaoData] = useState<ComissaoAjuste | null>(null)
  const [novaData, setNovaData] = useState('')
  const [justificativaData, setJustificativaData] = useState('')
  const [salvandoData, setSalvandoData] = useState(false)

  // Modal Marcar Como Pago
  const [modalPagoAberto, setModalPagoAberto] = useState(false)
  const [ajustePagar, setAjustePagar] = useState<ComissaoAjuste | null>(null)
  const [justificativaPago, setJustificativaPago] = useState('')
  const [salvandoPago, setSalvandoPago] = useState(false)

  // Modal Cancelar Definitivo
  const [modalCancelarAberto, setModalCancelarAberto] = useState(false)
  const [ajusteCancelar, setAjusteCancelar] = useState<ComissaoAjuste | null>(null)
  const [justificativaCancelar, setJustificativaCancelar] = useState('')
  const [salvandoCancelar, setSalvandoCancelar] = useState(false)

  // Modal Histórico de Auditoria
  const [modalAuditoriaAberto, setModalAuditoriaAberto] = useState(false)
  const [ajusteAuditoria, setAjusteAuditoria] = useState<ComissaoAjuste | null>(null)
  const [logsAuditoria, setLogsAuditoria] = useState<ComissaoAjusteLog[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)

  const carregarAjustes = async () => {
    setLoading(true)
    try {
      const data = await fetchAjustesProgramados()
      setAjustes(data)
    } catch (err: any) {
      toast({
        title: 'Erro ao carregar pagamentos programados',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarAjustes()
  }, [])

  // Totalizadores
  const totalProgramadoPendente = ajustes
    .filter((a) => a.status === 'ativo')
    .reduce((acc, a) => {
      // Estima a comissão a partir dos dados da venda se disponíveis
      const valorComissao = a.venda?.valor_tratamento ? a.venda.valor_tratamento * 0.04 : 0
      return acc + valorComissao
    }, 0)

  const countPendentes = ajustes.filter((a) => a.status === 'ativo').length
  const countPagos = ajustes.filter((a) => a.status === 'pago').length
  const countCancelados = ajustes.filter((a) => a.status === 'cancelado').length

  // Handlers de Ações
  const handleAbrirAlterarData = (ajuste: ComissaoAjuste) => {
    setAjusteEdicaoData(ajuste)
    setNovaData(ajuste.data_programada || '')
    setJustificativaData('')
    setModalDataAberto(true)
  }

  const handleConfirmarAlterarData = async () => {
    if (!ajusteEdicaoData || !novaData || !justificativaData.trim()) {
      toast({
        title: 'Atenção',
        description: 'Preencha a nova data e a justificativa obrigatória.',
        variant: 'destructive',
      })
      return
    }

    setSalvandoData(true)
    try {
      await alterarDataProgramada({
        ajuste_id: ajusteEdicaoData.id,
        comissao_id: ajusteEdicaoData.comissao_id,
        data_anterior: ajusteEdicaoData.data_programada || null,
        data_nova: novaData,
        justificativa: justificativaData.trim(),
        usuario_id: profile?.id || null,
        usuario_nome: profile?.nome || 'Usuário do Sistema',
      })

      toast({
        title: 'Data alterada com sucesso!',
        description: `Novo pagamento agendado para ${formatDate(novaData)}. Auditoria registrada.`,
      })
      setModalDataAberto(false)
      carregarAjustes()
      onAtualizarDashboard?.()
    } catch (err: any) {
      toast({
        title: 'Erro ao alterar data',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setSalvandoData(false)
    }
  }

  const handleAbrirMarcarPago = (ajuste: ComissaoAjuste) => {
    setAjustePagar(ajuste)
    setJustificativaPago('')
    setModalPagoAberto(true)
  }

  const handleConfirmarMarcarPago = async () => {
    if (!ajustePagar || !justificativaPago.trim()) {
      toast({
        title: 'Atenção',
        description: 'Informe a justificativa/comprovante obrigatório para marcar como pago.',
        variant: 'destructive',
      })
      return
    }

    setSalvandoPago(true)
    try {
      await marcarProgramadoComoPago({
        ajuste_id: ajustePagar.id,
        comissao_id: ajustePagar.comissao_id,
        justificativa: justificativaPago.trim(),
        usuario_id: profile?.id || null,
        usuario_nome: profile?.nome || 'Usuário do Sistema',
      })

      toast({
        title: 'Pagamento confirmado!',
        description: 'A comissão foi marcada como paga e retornou ao fluxo de auditoria normal.',
      })
      setModalPagoAberto(false)
      carregarAjustes()
      onAtualizarDashboard?.()
    } catch (err: any) {
      toast({
        title: 'Erro ao marcar como pago',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setSalvandoPago(false)
    }
  }

  const handleAbrirCancelar = (ajuste: ComissaoAjuste) => {
    setAjusteCancelar(ajuste)
    setJustificativaCancelar('')
    setModalCancelarAberto(true)
  }

  const handleConfirmarCancelar = async () => {
    if (!ajusteCancelar || !justificativaCancelar.trim()) {
      toast({
        title: 'Atenção',
        description: 'Informe a justificativa obrigatória para cancelamento definitivo.',
        variant: 'destructive',
      })
      return
    }

    setSalvandoCancelar(true)
    try {
      await cancelarProgramadoDefinitivo({
        ajuste_id: ajusteCancelar.id,
        comissao_id: ajusteCancelar.comissao_id,
        justificativa: justificativaCancelar.trim(),
        usuario_id: profile?.id || null,
        usuario_nome: profile?.nome || 'Usuário do Sistema',
      })

      toast({
        title: 'Comissão cancelada definitivamente',
        description: 'O pagamento foi cancelado em definitivo com registro de auditoria.',
      })
      setModalCancelarAberto(false)
      carregarAjustes()
      onAtualizarDashboard?.()
    } catch (err: any) {
      toast({
        title: 'Erro ao cancelar pagamento',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setSalvandoCancelar(false)
    }
  }

  const handleAbrirAuditoria = async (ajuste: ComissaoAjuste) => {
    setAjusteAuditoria(ajuste)
    setModalAuditoriaAberto(true)
    setLoadingLogs(true)
    try {
      const logs = await fetchComissaoAjusteLogs(ajuste.comissao_id)
      setLogsAuditoria(logs)
    } catch (err: any) {
      toast({
        title: 'Erro ao carregar auditoria',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setLoadingLogs(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Cards de Resumo dos Programados */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800 shadow-md border-l-4 border-l-amber-500">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Aguardando Data Futura
            </CardTitle>
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <CalendarClock className="w-4 h-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{countPendentes}</div>
            <p className="text-xs text-amber-400 mt-1">Comissões reagendadas ativas</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 shadow-md border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Pagas Posteriormente
            </CardTitle>
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{countPagos}</div>
            <p className="text-xs text-emerald-400 mt-1">Efetivadas na data programada</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 shadow-md border-l-4 border-l-rose-500">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Canceladas em Definitivo
            </CardTitle>
            <div className="p-2 bg-rose-500/10 rounded-lg">
              <XCircle className="w-4 h-4 text-rose-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{countCancelados}</div>
            <p className="text-xs text-rose-400 mt-1">Descartadas do fluxo</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 shadow-md border-l-4 border-l-blue-500">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Total Registros Programados
            </CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <History className="w-4 h-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{ajustes.length}</div>
            <p className="text-xs text-slate-400 mt-1">Histórico completo de ajustes</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Comissões Programadas */}
      <div className="rounded-lg border border-slate-800 overflow-hidden bg-slate-900 shadow-lg">
        <div className="p-4 bg-slate-800/80 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-white">Comissões com Pagamento Programado</h3>
            <span className="text-xs text-slate-400">({competencia})</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={carregarAjustes}
            className="border-slate-700 bg-slate-800 text-slate-200 hover:text-white text-xs"
          >
            Atualizar Lista
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-slate-800/40 border-slate-800">
              <TableHead className="text-slate-300 font-semibold">Data Programada</TableHead>
              <TableHead className="text-slate-300 font-semibold">Paciente</TableHead>
              <TableHead className="text-slate-300 font-semibold">Profissional</TableHead>
              <TableHead className="text-slate-300 font-semibold text-right">Valor Trat.</TableHead>
              <TableHead className="text-slate-300 font-semibold">Status</TableHead>
              <TableHead className="text-slate-300 font-semibold">Justificativa</TableHead>
              <TableHead className="text-slate-300 font-semibold">Reagendado Por</TableHead>
              <TableHead className="text-slate-300 font-semibold text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="border-slate-800">
                <TableCell colSpan={8} className="text-center py-12 bg-slate-900">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-500 mx-auto" />
                </TableCell>
              </TableRow>
            ) : ajustes.length === 0 ? (
              <TableRow className="border-slate-800">
                <TableCell colSpan={8} className="text-center text-slate-400 py-12 bg-slate-900">
                  <div className="flex flex-col items-center gap-2">
                    <CalendarClock className="w-8 h-8 text-slate-600" />
                    <span>Nenhuma comissão programada no momento.</span>
                    <span className="text-xs text-slate-500">
                      Ao selecionar comissões nas abas DENTISTAS ou CRC e escolher "Agendar
                      Pagamento Futuro", elas aparecerão aqui.
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              ajustes.map((item) => {
                const profNome =
                  item.venda?.dentista_nome ||
                  item.venda?.crc_nome ||
                  (item.venda?.dentista_avaliador ? 'Dentista' : 'CRC') ||
                  '-'

                const isAtivo = item.status === 'ativo'
                const isPago = item.status === 'pago'
                const isCancelado = item.status === 'cancelado'

                return (
                  <TableRow
                    key={item.id}
                    className="border-slate-800 hover:bg-slate-800/40 bg-slate-900"
                  >
                    <TableCell className="font-semibold text-amber-400 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-500" />
                        {formatDate(item.data_programada)}
                      </div>
                    </TableCell>

                    <TableCell className="font-medium text-white">
                      {item.venda?.paciente_nome || 'Paciente'}
                    </TableCell>

                    <TableCell className="text-slate-300">
                      <div>
                        <span>{profNome}</span>
                        {item.venda?.dentista_avaliador ? (
                          <span className="block text-[10px] text-amber-400/80">Dentista</span>
                        ) : (
                          <span className="block text-[10px] text-emerald-400/80">CRC</span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-right text-slate-300 font-medium">
                      {item.venda?.valor_tratamento
                        ? formatCurrency(item.venda.valor_tratamento)
                        : '-'}
                    </TableCell>

                    <TableCell>
                      {isAtivo && (
                        <Badge
                          variant="outline"
                          className="bg-amber-500/10 text-amber-400 border-amber-500/30 font-semibold"
                        >
                          Programada
                        </Badge>
                      )}
                      {isPago && (
                        <Badge
                          variant="outline"
                          className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-semibold"
                        >
                          Pago
                        </Badge>
                      )}
                      {isCancelado && (
                        <Badge
                          variant="outline"
                          className="bg-rose-500/10 text-rose-400 border-rose-500/30 font-semibold"
                        >
                          Cancelada
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell
                      className="text-slate-300 max-w-xs truncate text-xs"
                      title={item.justificativa}
                    >
                      {item.justificativa}
                    </TableCell>

                    <TableCell className="text-xs text-slate-400 whitespace-nowrap">
                      <div>
                        <span className="text-slate-200">{item.usuario_nome}</span>
                        <span className="block text-[10px] text-slate-500">
                          {formatDateTime(item.criado_em)}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {isAtivo && (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleAbrirAlterarData(item)}
                              title="Alterar Data do Pagamento"
                              className="h-8 px-2 bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700 hover:text-amber-300 text-xs"
                            >
                              <CalendarClock className="w-3.5 h-3.5 mr-1" />
                              Data
                            </Button>

                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleAbrirMarcarPago(item)}
                              title="Marcar como Pago"
                              className="h-8 px-2 bg-emerald-950/40 border-emerald-800/60 text-emerald-400 hover:bg-emerald-900/50 hover:text-emerald-300 text-xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                              Pagar
                            </Button>

                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleAbrirCancelar(item)}
                              title="Cancelar Definitivamente"
                              className="h-8 px-2 bg-rose-950/40 border-rose-800/60 text-rose-400 hover:bg-rose-900/50 hover:text-rose-300 text-xs"
                            >
                              <XCircle className="w-3.5 h-3.5 mr-1" />
                              Cancelar
                            </Button>
                          </>
                        )}

                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleAbrirAuditoria(item)}
                          title="Ver Auditoria"
                          className="h-8 px-2 text-slate-400 hover:text-white hover:bg-slate-800 text-xs"
                        >
                          <History className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal Alterar Data */}
      <Dialog open={modalDataAberto} onOpenChange={setModalDataAberto}>
        <DialogContent className="max-w-md bg-slate-900 border-slate-800 text-white p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-amber-500" />
              Alterar Data de Pagamento Programado
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Paciente:{' '}
              <strong className="text-white">{ajusteEdicaoData?.venda?.paciente_nome}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300">
                Nova Data de Pagamento *
              </Label>
              <Input
                type="date"
                value={novaData}
                onChange={(e) => setNovaData(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300">
                Justificativa da Alteração *
              </Label>
              <Textarea
                rows={3}
                placeholder="Ex.: Solicitação do financeiro para postergar repasse para a primeira semana do mês."
                value={justificativaData}
                onChange={(e) => setJustificativaData(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white text-sm"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setModalDataAberto(false)}
              disabled={salvandoData}
              className="text-slate-400 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirmarAlterarData}
              disabled={salvandoData}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold"
            >
              {salvandoData && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvar Nova Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Marcar Como Pago */}
      <Dialog open={modalPagoAberto} onOpenChange={setModalPagoAberto}>
        <DialogContent className="max-w-md bg-slate-900 border-slate-800 text-white p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Marcar Comissão como Paga
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              A comissão do paciente{' '}
              <strong className="text-white">{ajustePagar?.venda?.paciente_nome}</strong> será
              considerada liquidada.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <DollarSign className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span>Esta ação conclui o ciclo do pagamento programado e o grava como pago.</span>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300">
                Justificativa / Comprovante do Pagamento *
              </Label>
              <Textarea
                rows={3}
                placeholder="Ex.: Pagamento efetuado via PIX na conta do profissional em 10/11/2026. Comprovante arquivado."
                value={justificativaPago}
                onChange={(e) => setJustificativaPago(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white text-sm"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setModalPagoAberto(false)}
              disabled={salvandoPago}
              className="text-slate-400 hover:text-white"
            >
              Voltar
            </Button>
            <Button
              type="button"
              onClick={handleConfirmarMarcarPago}
              disabled={salvandoPago}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              {salvandoPago && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirmar Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Cancelar Definitivo */}
      <Dialog open={modalCancelarAberto} onOpenChange={setModalCancelarAberto}>
        <DialogContent className="max-w-md bg-slate-900 border-slate-800 text-white p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-500" />
              Cancelar Pagamento Definitivamente
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Tem certeza de que deseja descartar definitivamente este pagamento futuro?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>
                Esta comissão ficará arquivada com status "Cancelada" e não gerará repasse.
              </span>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300">
                Justificativa do Cancelamento *
              </Label>
              <Textarea
                rows={3}
                placeholder="Ex.: Tratamento distratado pelo paciente antes do início do procedimento; entrada estornada."
                value={justificativaCancelar}
                onChange={(e) => setJustificativaCancelar(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white text-sm"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setModalCancelarAberto(false)}
              disabled={salvandoCancelar}
              className="text-slate-400 hover:text-white"
            >
              Voltar
            </Button>
            <Button
              type="button"
              onClick={handleConfirmarCancelar}
              disabled={salvandoCancelar}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold"
            >
              {salvandoCancelar && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirmar Cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Histórico de Auditoria */}
      <Dialog open={modalAuditoriaAberto} onOpenChange={setModalAuditoriaAberto}>
        <DialogContent className="max-w-2xl bg-slate-900 border-slate-800 text-white p-6 shadow-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-amber-500" />
              Auditoria do Ajuste de Comissão
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Trilha de auditoria imutável de todas as alterações registradas para este item.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-3">
            {loadingLogs ? (
              <div className="py-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-amber-500 mx-auto" />
              </div>
            ) : logsAuditoria.length === 0 ? (
              <div className="text-center text-slate-400 py-8 text-sm">
                Nenhum log registrado para este item.
              </div>
            ) : (
              logsAuditoria.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <Badge
                      variant="outline"
                      className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px] font-bold"
                    >
                      {log.acao}
                    </Badge>
                    <span className="text-slate-400 text-[11px]">
                      {formatDateTime(log.criado_em)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200">
                    <strong className="text-white">Justificativa:</strong> {log.justificativa}
                  </p>

                  {log.data_programada_nova && (
                    <p className="text-[11px] text-amber-400">
                      Data programada: {formatDate(log.data_programada_nova)}{' '}
                      {log.data_programada_anterior && (
                        <span className="text-slate-400">
                          (anterior: {formatDate(log.data_programada_anterior)})
                        </span>
                      )}
                    </p>
                  )}

                  <div className="pt-1 text-[11px] text-slate-400 flex items-center gap-1.5 border-t border-slate-700/40">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Registrado por: <strong className="text-slate-300">{log.usuario_nome}</strong>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalAuditoriaAberto(false)}
              className="border-slate-700 bg-slate-800 text-slate-300 hover:text-white"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

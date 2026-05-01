import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  RefreshCw,
  Trash2,
  History,
  Plus,
  Undo2,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { format, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

function getPastMonths(count = 12) {
  const dates = []
  const now = new Date()
  for (let i = 0; i < count; i++) {
    const d = subMonths(now, i)
    dates.push(format(d, 'yyyy-MM'))
  }
  return dates
}

export function CarteiraTab() {
  const { user, profile } = useAuth()
  const isAdmin = profile?.role === 'admin' || profile?.role === 'gestor'
  const [users, setUsers] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<string>(user?.id || '')

  const pastMonths = getPastMonths()
  const [selectedMonth, setSelectedMonth] = useState(pastMonths[0])

  const [globalTransactions, setGlobalTransactions] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [balance, setBalance] = useState(0)
  const [saldoPeriodo, setSaldoPeriodo] = useState(0)
  const [potencialTotal, setPotencialTotal] = useState(0)
  const [perdasTotal, setPerdasTotal] = useState(0)

  const [isSaqueDialogOpen, setIsSaqueDialogOpen] = useState(false)
  const [isExtratoGlobalOpen, setIsExtratoGlobalOpen] = useState(false)

  const [isNovoLancamentoOpen, setIsNovoLancamentoOpen] = useState(false)
  const [novoLancamento, setNovoLancamento] = useState({
    tipo: 'credito',
    valor: '',
    descricao: '',
  })

  useEffect(() => {
    if (user?.id && !selectedUser) {
      setSelectedUser(user.id)
    }
  }, [user?.id, selectedUser])

  useEffect(() => {
    if (isAdmin) {
      loadUsers()
    }
  }, [isAdmin])

  useEffect(() => {
    if (selectedUser && selectedMonth) {
      loadTransactions(selectedUser, selectedMonth)
    }
  }, [selectedUser, selectedMonth])

  const loadUsers = async () => {
    const { data } = await supabase
      .from('usuarios')
      .select('id, nome, possui_carteira')
      .eq('possui_carteira', true)
      .order('nome')
    if (data) {
      setUsers(data)
      if (data.length > 0 && !data.find((u) => u.id === selectedUser)) {
        setSelectedUser(data[0].id)
      }
    }
  }

  const handleGerarAdiantamentos = async () => {
    try {
      setLoading(true)
      await supabase.rpc('gerar_adiantamento_mes_google', { p_mes: selectedMonth })
      await supabase.rpc('gerar_adiantamento_mes_inovacao', { p_mes: selectedMonth })
      await supabase.rpc('gerar_adiantamento_mes_sorriso', { p_mes: selectedMonth })

      const { data: bonificacoes } = await supabase
        .from('performance_bonificacao')
        .select('usuario_id')
        .eq('mes_referencia', selectedMonth)

      const existingUserIds = new Set(bonificacoes?.map((b: any) => b.usuario_id) || [])
      const toInsert = users
        .filter((u) => !existingUserIds.has(u.id))
        .map((u) => ({
          usuario_id: u.id,
          mes_referencia: selectedMonth,
          itens_marcados: [],
          pontuacao_total: 0,
          atingiu_meta: false,
        }))

      if (toInsert.length > 0) {
        await supabase.from('performance_bonificacao').insert(toInsert)
      }

      toast.success('Adiantamentos gerados com sucesso!')
      loadTransactions(selectedUser, selectedMonth)
    } catch (e) {
      toast.error('Erro ao gerar adiantamentos.')
      setLoading(false)
    }
  }

  const loadTransactions = async (userId: string, month: string) => {
    setLoading(true)

    // Fetch Global Data
    const { data: globalData, error } = await supabase
      .from('carteira_transacoes')
      .select('*')
      .eq('usuario_id', userId)
      .order('criado_em', { ascending: false })

    if (error) {
      toast.error('Erro ao carregar transações')
    } else if (globalData) {
      setGlobalTransactions(globalData)
      let globalBal = 0
      globalData.forEach((t) => {
        if (t.tipo === 'credito') globalBal += Number(t.valor)
        else if (t.tipo === 'debito') globalBal -= Number(t.valor)
        else if (t.tipo === 'saque') globalBal -= Number(t.valor)
      })
      setBalance(globalBal)

      // Calculate month data
      const monthData = globalData.filter((t) => t.mes_referencia === month)
      setTransactions(monthData)

      let pot = 0
      let per = 0
      monthData.forEach((t) => {
        if (t.tipo === 'credito') pot += Number(t.valor)
        else if (t.tipo === 'debito') per += Number(t.valor)
      })
      setPotencialTotal(pot)
      setPerdasTotal(per)
      // Calculation specified by user: Ganhos - Perdas (ignores saques for period display)
      setSaldoPeriodo(pot - per)
    }

    setLoading(false)
  }

  const handleSaque = async () => {
    if (balance <= 0) {
      toast.error('Saldo insuficiente para saque.')
      return
    }

    const currentMonth = format(new Date(), 'yyyy-MM')

    const { error } = await supabase.from('carteira_transacoes').insert({
      usuario_id: selectedUser,
      tipo: 'saque',
      valor: balance,
      descricao: 'Saque Efetuado: Resgate de Saldo Total Acumulado',
      mes_referencia: currentMonth,
    })

    if (error) {
      toast.error('Erro ao registrar saque.')
    } else {
      toast.success('Saque registrado com sucesso!')
      setIsSaqueDialogOpen(false)
      loadTransactions(selectedUser, selectedMonth)
    }
  }

  const handleNovoLancamento = async () => {
    if (!novoLancamento.valor || !novoLancamento.descricao) {
      toast.error('Preencha o valor e a descrição.')
      return
    }

    const valorNum = Number(novoLancamento.valor.replace(',', '.'))
    if (isNaN(valorNum) || valorNum <= 0) {
      toast.error('Valor inválido.')
      return
    }

    setLoading(true)
    const { error } = await supabase.from('carteira_transacoes').insert({
      usuario_id: selectedUser,
      tipo: novoLancamento.tipo,
      valor: valorNum,
      descricao: novoLancamento.descricao,
      mes_referencia: selectedMonth,
    })

    if (error) {
      toast.error('Erro ao registrar lançamento.')
      setLoading(false)
    } else {
      toast.success('Lançamento registrado com sucesso!')
      setIsNovoLancamentoOpen(false)
      setNovoLancamento({ tipo: 'credito', valor: '', descricao: '' })
      loadTransactions(selectedUser, selectedMonth)
    }
  }

  const checkIsEstornado = (t: any) => {
    return globalTransactions.some(
      (estorno) =>
        estorno.transacao_original_id === t.id ||
        (!estorno.transacao_original_id &&
          estorno.tipo !== t.tipo &&
          Number(estorno.valor) === Number(t.valor) &&
          estorno.mes_referencia === t.mes_referencia &&
          estorno.descricao.startsWith(`Estorno de: ${t.descricao}`)),
    )
  }

  const handleEstornarTransaction = async (t: any) => {
    if (checkIsEstornado(t)) {
      toast.error('Este lançamento já foi estornado.')
      return
    }

    if (
      !window.confirm(
        'Tem certeza que deseja estornar este lançamento? Uma transação compensatória será criada e o saldo será recalculado.',
      )
    )
      return
    setLoading(true)

    const isSaque = t.tipo === 'saque'
    const reversedTipo = isSaque ? 'credito' : t.tipo === 'credito' ? 'debito' : 'credito'

    const nomeAdmin = profile?.nome ? profile.nome.split(' ')[0] : 'Administrador'
    const descricaoEstorno = `Estorno de: ${t.descricao} — Realizado por: ${nomeAdmin}`

    const { error } = await supabase.from('carteira_transacoes').insert({
      usuario_id: t.usuario_id,
      tipo: reversedTipo,
      valor: t.valor,
      descricao: descricaoEstorno,
      mes_referencia: t.mes_referencia,
      origem_id: t.origem_id || null,
      transacao_original_id: t.id,
    })

    if (error) {
      toast.error('Erro ao estornar lançamento')
      setLoading(false)
    } else {
      toast.success('Lançamento estornado com sucesso')
      loadTransactions(selectedUser, selectedMonth)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm items-start sm:items-end justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-start sm:items-center">
          {isAdmin && (
            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <Label className="text-xs text-slate-500">Visualizar Colaborador</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className="w-full sm:w-[250px]">
                  <SelectValue placeholder="Selecione um colaborador" />
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

          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <Label className="text-xs text-slate-500">Mês de Referência</Label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Mês" />
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

        {isAdmin && (
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full sm:w-auto text-amber-700 border-amber-200 hover:bg-amber-50"
              onClick={handleGerarAdiantamentos}
              disabled={loading}
              title="Os adiantamentos são gerados automaticamente no dia 1º de cada mês (a partir de Maio/2026). Use este botão apenas para contingência/reprocessamento."
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Gerar Adiantamentos
            </Button>
            <Button
              variant="default"
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => setIsNovoLancamentoOpen(true)}
              disabled={loading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Lançamento Manual
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-emerald-50 border-emerald-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-800 flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4" />
              Ganhos do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              R$ {potencialTotal.toFixed(2).replace('.', ',')}
            </div>
            <p className="text-xs text-emerald-600/80 mt-1">Total de bonificações alcançadas</p>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-800 flex items-center gap-2">
              <ArrowDownRight className="w-4 h-4" />
              Perdas do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {perdasTotal.toFixed(2).replace('.', ',')}
            </div>
            <p className="text-xs text-red-600/80 mt-1">Descontos no mês selecionado</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-amber-500" />
                Saldo Total Acumulado
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold tracking-tight mb-1 text-emerald-400">
                R$ {balance.toFixed(2).replace('.', ',')}
              </div>
              <button
                onClick={() => setIsExtratoGlobalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors text-xs border border-slate-700"
                title="Ver Extrato Completo"
              >
                <History className="w-3.5 h-3.5 text-amber-400" />
                <span>Extrato</span>
              </button>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2 pb-1 border-b border-slate-700 mt-2">
              <span>Saldo do Período:</span>
              <span className="font-semibold text-white">
                R$ {saldoPeriodo.toFixed(2).replace('.', ',')}
              </span>
            </div>
            <Button
              onClick={() => setIsSaqueDialogOpen(true)}
              disabled={balance <= 0 || (!isAdmin && selectedUser !== user?.id)}
              className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold w-full h-8 text-sm mt-2"
            >
              <DollarSign className="w-3 h-3 mr-1" />
              Solicitar Saque
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg text-slate-800">Extrato Consolidado</CardTitle>
              <CardDescription>Acompanhe todos os lançamentos do mês selecionado</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-center text-slate-500">Carregando transações...</div>
            ) : transactions.length === 0 ? (
              <div className="py-8 text-center text-slate-500 italic">
                Nenhuma movimentação registrada no período.
              </div>
            ) : (
              <div className="rounded-md border max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição (Origem)</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      {isAdmin && <TableHead className="w-10"></TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="text-slate-500 whitespace-nowrap">
                          {format(new Date(t.criado_em), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </TableCell>
                        <TableCell className="font-medium text-slate-700">{t.descricao}</TableCell>
                        <TableCell>
                          {t.tipo === 'credito' && (
                            <Badge
                              variant="secondary"
                              className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            >
                              <ArrowUpRight className="w-3 h-3 mr-1" /> Crédito
                            </Badge>
                          )}
                          {t.tipo === 'debito' && (
                            <Badge
                              variant="secondary"
                              className="bg-red-100 text-red-800 hover:bg-red-200"
                            >
                              <ArrowDownRight className="w-3 h-3 mr-1" /> Débito
                            </Badge>
                          )}
                          {t.tipo === 'saque' && (
                            <Badge
                              variant="secondary"
                              className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                            >
                              <DollarSign className="w-3 h-3 mr-1" /> Saque
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell
                          className={`text-right font-bold whitespace-nowrap ${
                            t.tipo === 'credito' ? 'text-emerald-600' : 'text-red-600'
                          }`}
                        >
                          {t.tipo === 'credito' ? '+' : '-'} R${' '}
                          {Number(t.valor).toFixed(2).replace('.', ',')}
                        </TableCell>
                        {isAdmin && (
                          <TableCell>
                            {!t.descricao.startsWith('Estorno') &&
                              (checkIsEstornado(t) ? (
                                <span className="text-[10px] text-slate-400 italic">Estornado</span>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-amber-600 hover:text-amber-800 hover:bg-amber-50"
                                  onClick={() => handleEstornarTransaction(t)}
                                  title="Estornar Lançamento"
                                >
                                  <Undo2 className="w-3 h-3" />
                                </Button>
                              ))}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isSaqueDialogOpen} onOpenChange={setIsSaqueDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Saque</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-slate-600">
              Você está prestes a solicitar/registrar o saque do saldo total acumulado de{' '}
              <strong className="text-slate-900">R$ {balance.toFixed(2).replace('.', ',')}</strong>.
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Esta ação irá zerar o saldo total da carteira e registrar a saída no extrato do mês
              vigente.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaqueDialogOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={handleSaque}>
              Confirmar Saque
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isExtratoGlobalOpen} onOpenChange={setIsExtratoGlobalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <History className="w-5 h-5 text-amber-500" />
              Extrato Completo - Histórico Acumulado
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto mt-4 rounded-md border bg-white">
            <Table>
              <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Mês Ref.</TableHead>
                  <TableHead>Descrição (Origem)</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  {isAdmin && <TableHead className="w-10"></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {globalTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={isAdmin ? 6 : 5}
                      className="text-center py-8 text-slate-500"
                    >
                      Nenhuma movimentação registrada no histórico.
                    </TableCell>
                  </TableRow>
                ) : (
                  globalTransactions.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="text-slate-500 whitespace-nowrap text-xs">
                        {format(new Date(t.criado_em), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </TableCell>
                      <TableCell className="font-medium text-slate-700 text-xs whitespace-nowrap">
                        {t.mes_referencia}
                      </TableCell>
                      <TableCell className="font-medium text-slate-700 text-xs">
                        {t.descricao}
                      </TableCell>
                      <TableCell>
                        {t.tipo === 'credito' && (
                          <Badge
                            variant="secondary"
                            className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 text-[10px]"
                          >
                            <ArrowUpRight className="w-3 h-3 mr-1" /> Crédito
                          </Badge>
                        )}
                        {t.tipo === 'debito' && (
                          <Badge
                            variant="secondary"
                            className="bg-red-100 text-red-800 hover:bg-red-200 text-[10px]"
                          >
                            <ArrowDownRight className="w-3 h-3 mr-1" /> Débito
                          </Badge>
                        )}
                        {t.tipo === 'saque' && (
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-[10px]"
                          >
                            <DollarSign className="w-3 h-3 mr-1" /> Saque
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell
                        className={`text-right font-bold whitespace-nowrap text-xs ${t.tipo === 'credito' ? 'text-emerald-600' : 'text-red-600'}`}
                      >
                        {t.tipo === 'credito' ? '+' : '-'} R${' '}
                        {Number(t.valor).toFixed(2).replace('.', ',')}
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          {!t.descricao.startsWith('Estorno') &&
                            (checkIsEstornado(t) ? (
                              <span className="text-[10px] text-slate-400 italic">Estornado</span>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-amber-600 hover:text-amber-800 hover:bg-amber-50"
                                onClick={() => handleEstornarTransaction(t)}
                                title="Estornar Lançamento"
                              >
                                <Undo2 className="w-3 h-3" />
                              </Button>
                            ))}
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isNovoLancamentoOpen} onOpenChange={setIsNovoLancamentoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Lançamento Manual</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tipo de Lançamento</Label>
              <Select
                value={novoLancamento.tipo}
                onValueChange={(val) => setNovoLancamento({ ...novoLancamento, tipo: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credito">Crédito (Adiantamento/Bônus)</SelectItem>
                  <SelectItem value="debito">Débito (Desconto/Ajuste)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={novoLancamento.valor}
                onChange={(e) => setNovoLancamento({ ...novoLancamento, valor: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                placeholder="Ex: Adiantamento Feijão com Arroz"
                value={novoLancamento.descricao}
                onChange={(e) =>
                  setNovoLancamento({ ...novoLancamento, descricao: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNovoLancamentoOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleNovoLancamento}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Salvar Lançamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

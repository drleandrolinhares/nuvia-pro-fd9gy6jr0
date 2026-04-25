import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wallet, ArrowUpRight, ArrowDownRight, DollarSign, Plus } from 'lucide-react'
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
import { Input } from '@/components/ui/input'

function getPastMonths(count = 12) {
  const dates = []
  const now = new Date()
  for (let i = 0; i < count; i++) {
    const d = subMonths(now, i)
    dates.push(format(d, 'yyyy-MM'))
  }
  return dates
}

const ORIGENS_PREDEFINIDAS = [
  {
    id: 'feijao_arroz_credito',
    nome: 'Crédito: Bonificação Feijão com Arroz',
    tipo: 'credito',
    valorPadrao: 350,
  },
  {
    id: 'feijao_arroz_debito',
    nome: 'Débito: Bonificação Feijão com Arroz',
    tipo: 'debito',
    valorPadrao: 350,
  },
  { id: 'meta_extra', nome: 'Bônus: Meta Extra Atingida', tipo: 'credito', valorPadrao: 150 },
  { id: 'outros', nome: 'Outro (Lançamento Avulso)', tipo: 'credito', valorPadrao: null },
]

export function CarteiraTab() {
  const { user, profile } = useAuth()
  const isAdmin = profile?.role === 'admin' || profile?.role === 'gestor'
  const [users, setUsers] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<string>(user?.id || '')

  const pastMonths = getPastMonths()
  const [selectedMonth, setSelectedMonth] = useState(pastMonths[0])

  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [balance, setBalance] = useState(0)
  const [potencialTotal, setPotencialTotal] = useState(0)
  const [perdasTotal, setPerdasTotal] = useState(0)

  const [isSaqueDialogOpen, setIsSaqueDialogOpen] = useState(false)
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false)

  const [manualOrigem, setManualOrigem] = useState('outros')
  const [manualDesc, setManualDesc] = useState('')
  const [manualValor, setManualValor] = useState('')
  const [manualTipo, setManualTipo] = useState<'credito' | 'debito'>('credito')

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

  const handleOrigemChange = (val: string) => {
    setManualOrigem(val)
    const origem = ORIGENS_PREDEFINIDAS.find((o) => o.id === val)
    if (origem && origem.valorPadrao !== null) {
      setManualTipo(origem.tipo as 'credito' | 'debito')
      setManualValor(origem.valorPadrao.toString())
      setManualDesc(origem.nome)
    } else {
      setManualValor('')
      setManualDesc('')
    }
  }

  const loadUsers = async () => {
    const { data } = await supabase.from('usuarios').select('id, nome').order('nome')
    if (data) setUsers(data)
  }

  const loadTransactions = async (userId: string, month: string) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('carteira_transacoes')
      .select('*')
      .eq('usuario_id', userId)
      .eq('mes_referencia', month)
      .order('criado_em', { ascending: false })

    if (error) {
      toast.error('Erro ao carregar transações')
    } else if (data) {
      setTransactions(data)
      let pot = 0
      let per = 0
      let sq = 0
      data.forEach((t) => {
        if (t.tipo === 'credito') pot += Number(t.valor)
        else if (t.tipo === 'debito') per += Number(t.valor)
        else if (t.tipo === 'saque') sq += Number(t.valor)
      })
      setPotencialTotal(pot)
      setPerdasTotal(per)
      setBalance(pot - per - sq)
    }
    setLoading(false)
  }

  const handleSaque = async () => {
    if (balance <= 0) {
      toast.error('Saldo insuficiente para saque.')
      return
    }

    const { error } = await supabase.from('carteira_transacoes').insert({
      usuario_id: selectedUser,
      tipo: 'saque',
      valor: balance,
      descricao: 'Saque Efetuado: Resgate de Saldo',
      mes_referencia: selectedMonth,
    })

    if (error) {
      toast.error('Erro ao registrar saque.')
    } else {
      toast.success('Saque registrado com sucesso!')
      setIsSaqueDialogOpen(false)
      loadTransactions(selectedUser, selectedMonth)
    }
  }

  const handleManualLaunch = async () => {
    if (!manualDesc || !manualValor) {
      toast.error('Preencha todos os campos.')
      return
    }
    const { error } = await supabase.from('carteira_transacoes').insert({
      usuario_id: selectedUser,
      tipo: manualTipo,
      valor: Number(manualValor.replace(',', '.')),
      descricao: manualDesc,
      mes_referencia: selectedMonth,
    })

    if (error) {
      toast.error('Erro ao registrar lançamento.')
    } else {
      toast.success('Lançamento registrado com sucesso!')
      setIsManualDialogOpen(false)
      setManualDesc('')
      setManualValor('')
      setManualOrigem('outros')
      loadTransactions(selectedUser, selectedMonth)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm items-start sm:items-center">
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
              Perdas Acumuladas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {perdasTotal.toFixed(2).replace('.', ',')}
            </div>
            <p className="text-xs text-red-600/80 mt-1">Descontos ou metas não batidas</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-amber-500" />
                Saldo Atual
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight mb-2">
              R$ {balance.toFixed(2).replace('.', ',')}
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
            {isAdmin && (
              <Button size="sm" variant="outline" onClick={() => setIsManualDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Lançamento Manual
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-center text-slate-500">Carregando transações...</div>
            ) : transactions.length === 0 ? (
              <div className="py-8 text-center text-slate-500 italic">
                Nenhuma movimentação registrada.
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
              Você está prestes a solicitar/registrar o saque do saldo total disponível de{' '}
              <strong className="text-slate-900">R$ {balance.toFixed(2).replace('.', ',')}</strong>.
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Esta ação irá zerar o saldo atual da carteira e registrar a saída no extrato.
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

      <Dialog open={isManualDialogOpen} onOpenChange={setIsManualDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Lançamento Manual</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Origem da Movimentação</Label>
              <Select value={manualOrigem} onValueChange={handleOrigemChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORIGENS_PREDEFINIDAS.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={manualTipo}
                  onValueChange={(v: any) => setManualTipo(v)}
                  disabled={manualOrigem !== 'outros'}
                >
                  <SelectTrigger
                    className={manualOrigem !== 'outros' ? 'bg-slate-100 opacity-70' : ''}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credito">Crédito (+)</SelectItem>
                    <SelectItem value="debito">Débito (-)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={manualValor}
                  onChange={(e) => setManualValor(e.target.value)}
                  readOnly={manualOrigem !== 'outros'}
                  className={manualOrigem !== 'outros' ? 'bg-slate-100 opacity-70' : ''}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição Detalhada</Label>
              <Input
                placeholder="Ex: Bônus extra por meta atingida"
                value={manualDesc}
                onChange={(e) => setManualDesc(e.target.value)}
                readOnly={manualOrigem !== 'outros'}
                className={manualOrigem !== 'outros' ? 'bg-slate-100 opacity-70' : ''}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsManualDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleManualLaunch}>Registrar Lançamento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

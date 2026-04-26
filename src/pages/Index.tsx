import {
  ArrowDownRight,
  CircleDollarSign,
  Calendar,
  RefreshCcw,
  AlertCircle,
  Box,
  Wallet,
  TrendingDown,
  Cake,
  LayoutDashboard,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import { fetchProdutos, Produto } from '@/services/produtos'
import { SyncIndicator } from '@/components/ui/sync-indicator'
import { useCache } from '@/hooks/use-cache'
import { useAuth } from '@/hooks/use-auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { parseISO } from 'date-fns'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

const Index = () => {
  const { user } = useAuth()
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [todosUsuarios, setTodosUsuarios] = useState<any[]>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [possuiCarteira, setPossuiCarteira] = useState(false)
  const [saldoAtual, setSaldoAtual] = useState(0)
  const [saldoPerdido, setSaldoPerdido] = useState(0)
  const { dataVersion, invalidateCache } = useCache()

  const loadData = async () => {
    setLoading(true)
    const { data } = await fetchProdutos()
    if (data) {
      setProdutos(data)
    }

    if (user) {
      const { data: userData } = await supabase
        .from('usuarios')
        .select('possui_carteira')
        .eq('id', user.id)
        .single()

      if (userData) {
        setPossuiCarteira(userData.possui_carteira)
      }

      if (userData?.possui_carteira) {
        const { data: transacoes } = await supabase
          .from('carteira_transacoes')
          .select('tipo, valor')
          .eq('usuario_id', user.id)

        if (transacoes) {
          let creditos = 0
          let debitos = 0
          let saques = 0
          transacoes.forEach((t) => {
            if (t.tipo === 'credito') creditos += Number(t.valor)
            else if (t.tipo === 'debito') debitos += Number(t.valor)
            else if (t.tipo === 'saque') saques += Number(t.valor)
          })
          setSaldoAtual(creditos - debitos - saques)
          setSaldoPerdido(debitos)
        }
      }

      const { data: usuarios } = await supabase
        .from('usuarios')
        .select('id, nome, data_nascimento, avatar_url')
        .eq('status', 'ativo')
        .not('data_nascimento', 'is', null)

      if (usuarios) {
        setTodosUsuarios(usuarios)
      }
    }

    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [dataVersion, user])

  useEffect(() => {
    const channel = supabase
      .channel('dashboard-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'produtos' }, () =>
        invalidateCache(),
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'compras' }, () =>
        invalidateCache(),
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'compra_itens' }, () =>
        invalidateCache(),
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'entrada_produtos' }, () =>
        invalidateCache(),
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'saida_produtos' }, () =>
        invalidateCache(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [invalidateCache])

  const produtosDashboard = useMemo(() => {
    return produtos.map((p) => {
      const finalizedPurchases =
        p.compra_itens?.filter((ci) => ci.compras?.status === 'Finalizada') || []
      finalizedPurchases.sort(
        (a, b) =>
          new Date(b.compras?.data || 0).getTime() - new Date(a.compras?.data || 0).getTime(),
      )

      const latestCusto =
        finalizedPurchases.length > 0 ? finalizedPurchases[0].valor_unitario : p.custo_unitario
      return { ...p, custo_unitario: latestCusto }
    })
  }, [produtos])

  const aniversariantes = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const currentMonth = today.getMonth()

    return todosUsuarios
      .filter((u) => {
        if (!u.data_nascimento) return false
        const birthDate = parseISO(u.data_nascimento)
        const birthDateLocal = new Date(birthDate.getTime() + birthDate.getTimezoneOffset() * 60000)
        return birthDateLocal.getMonth() === selectedMonth
      })
      .map((u) => {
        const birthDate = parseISO(u.data_nascimento!)
        const birthDateLocal = new Date(birthDate.getTime() + birthDate.getTimezoneOffset() * 60000)
        const day = birthDateLocal.getDate()

        let isPast = false
        if (selectedMonth === currentMonth) {
          isPast = day < today.getDate()
        } else if (selectedMonth < currentMonth) {
          isPast = true
        }

        return {
          ...u,
          day,
          isPast,
        }
      })
      .sort((a, b) => a.day - b.day)
  }, [todosUsuarios, selectedMonth])

  const { itemsAvisos } = useMemo(() => {
    const itemsLowStock = produtosDashboard.filter(
      (p) => (p.quantidade_estoque || 0) <= (p.quantidade_minima || 0),
    )

    return {
      itemsAvisos: itemsLowStock,
    }
  }, [produtosDashboard])

  return (
    <div className="space-y-8 animate-fade-in-up relative">
      <div className="absolute top-6 right-6 z-10">
        <SyncIndicator isSyncing={loading} />
      </div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-slate-900 p-6 rounded-xl border-l-4 border-amber-500 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-800 rounded-lg">
            <LayoutDashboard className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white uppercase pr-24 sm:pr-0">
              Dashboard Nuvia
            </h1>
            <p className="text-slate-400 mt-1 text-sm uppercase tracking-wider font-medium">
              Visão Geral da Gestão de Estoque e Rotinas.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {possuiCarteira && (
          <>
            <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow flex flex-col h-[200px]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Saldo Atual
                </CardTitle>
                <Wallet className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center">
                <div className="text-4xl font-bold text-foreground">
                  {loading
                    ? '...'
                    : `R$ ${saldoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
                  Saldo disponível na carteira
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow flex flex-col h-[200px]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Saldo Perdido
                </CardTitle>
                <TrendingDown className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center">
                <div className="text-4xl font-bold text-destructive">
                  {loading
                    ? '...'
                    : `R$ ${saldoPerdido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
                  Penalidades e descontos
                </p>
              </CardContent>
            </Card>
          </>
        )}

        <Card
          className={cn(
            'border-border/50 shadow-sm hover:shadow-md transition-shadow flex flex-col h-[200px]',
            !possuiCarteira && 'md:col-span-1',
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground truncate">
                Aniversariantes
              </CardTitle>
              <Cake className="h-4 w-4 text-amber-500 shrink-0" />
            </div>
            <Select
              value={selectedMonth.toString()}
              onValueChange={(v) => setSelectedMonth(parseInt(v))}
            >
              <SelectTrigger className="w-[110px] h-7 text-xs ml-2">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                {MESES.map((mes, idx) => (
                  <SelectItem key={idx} value={idx.toString()} className="text-xs">
                    {mes}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              <div className="text-sm text-muted-foreground">Carregando...</div>
            ) : aniversariantes.length > 0 ? (
              <div className="space-y-3">
                {aniversariantes.map((a) => (
                  <div
                    key={a.id}
                    className={cn(
                      'flex items-center gap-3',
                      a.isPast ? 'opacity-50 grayscale' : '',
                    )}
                  >
                    <Avatar className="size-8 border border-border">
                      <AvatarImage
                        src={
                          a.avatar_url || `https://img.usecurling.com/ppl/thumbnail?seed=${a.id}`
                        }
                      />
                      <AvatarFallback>{a.nome.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-medium truncate">{a.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        Dia {a.day.toString().padStart(2, '0')}
                      </p>
                    </div>
                    {!a.isPast &&
                      selectedMonth === new Date().getMonth() &&
                      a.day === new Date().getDate() && (
                        <Badge className="bg-amber-500 hover:bg-amber-600 text-[10px] uppercase shrink-0">
                          Hoje!
                        </Badge>
                      )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium text-center">
                  Nenhum aniversariante neste mês
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-5 border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2">
            <AlertCircle className="size-5 text-destructive" />
            <CardTitle className="text-lg font-bold uppercase tracking-wider">
              Central de Alertas Operacionais
            </CardTitle>
          </CardHeader>
          <CardContent>
            {itemsAvisos.length > 0 ? (
              <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-2">
                {itemsAvisos.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/10"
                  >
                    <div>
                      <p className="font-semibold text-sm">{item.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.marca || 'Sem marca'} - {item.variacao || 'S/V'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-destructive text-sm">
                        {item.quantidade_estoque} em estoque
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Mínimo: {item.quantidade_minima}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-[200px] items-center justify-center rounded-lg border-2 border-dashed border-border/60 bg-muted/20">
                <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium">
                  Nenhum alerta no momento. Tudo em ordem.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold uppercase tracking-wider">
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button
              asChild
              variant="outline"
              className="w-full justify-start h-12 uppercase tracking-wider font-bold border-transparent bg-slate-200 text-slate-700 hover:bg-amber-500 hover:text-white transition-all shadow-sm"
            >
              <Link to="/operacional/comunicados">
                <Calendar className="mr-2 h-4 w-4" />
                Compromissos de Hoje
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start h-12 uppercase tracking-wider font-bold border-transparent bg-slate-200 text-slate-700 hover:bg-amber-500 hover:text-white transition-all shadow-sm"
            >
              <Link to="/estoque">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Atualizar Estoque
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Index

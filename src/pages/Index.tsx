import {
  ArrowDownRight,
  CircleDollarSign,
  Calendar,
  RefreshCcw,
  Package,
  Wallet,
  TrendingDown,
  Cake,
  LayoutDashboard,
  MessageSquare,
  ArrowRight,
  Target,
  Plus,
  Trash,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'
import { GestaoRH } from '@/components/rh/GestaoRH'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase/client'
import { fetchProdutos, Produto } from '@/services/produtos'
import { SyncIndicator } from '@/components/ui/sync-indicator'
import { useCache } from '@/hooks/use-cache'
import { useAuth } from '@/hooks/use-auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { parseISO, format } from 'date-fns'
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
  const { user, profile } = useAuth()
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [todosUsuarios, setTodosUsuarios] = useState<any[]>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [possuiCarteira, setPossuiCarteira] = useState(false)
  const [saldoAtual, setSaldoAtual] = useState(0)
  const [saldoPerdido, setSaldoPerdido] = useState(0)
  const [minhasDemandas, setMinhasDemandas] = useState<any[]>([])
  const [metaFaturamento, setMetaFaturamento] = useState(0)
  const [vendasDiarias, setVendasDiarias] = useState<any[]>([])
  const [modalVendasOpen, setModalVendasOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [novaVendaValor, setNovaVendaValor] = useState('')

  // Novos campos de venda
  const [pacienteNome, setPacienteNome] = useState('')
  const [valorTratamento, setValorTratamento] = useState('')
  const [formaPagamento, setFormaPagamento] = useState('')
  const [destinoPagamento, setDestinoPagamento] = useState('')
  const [destinoFiscal, setDestinoFiscal] = useState('')

  const [salvandoVendas, setSalvandoVendas] = useState(false)
  const { dataVersion, invalidateCache } = useCache()

  const loadData = async () => {
    setLoading(true)

    const todayDate = new Date()
    const startOfMonth = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1)
      .toISOString()
      .split('T')[0]
    const endOfMonth = new Date(todayDate.getFullYear(), todayDate.getMonth() + 1, 0)
      .toISOString()
      .split('T')[0]

    const [{ data: pData }, { data: configFiscal }, { data: vendas }] = await Promise.all([
      fetchProdutos(),
      supabase.from('gestao_fiscal_config').select('faturamento_previsto').single(),
      supabase
        .from('vendas_diarias')
        .select('*')
        .gte('data_venda', startOfMonth)
        .lte('data_venda', endOfMonth),
    ])

    if (pData) setProdutos(pData)
    if (configFiscal) setMetaFaturamento(configFiscal.faturamento_previsto)
    if (vendas) setVendasDiarias(vendas)

    if (user) {
      const [{ data: userData }, { data: usuarios }] = await Promise.all([
        supabase.from('usuarios').select('possui_carteira').eq('id', user.id).single(),
        supabase
          .from('usuarios')
          .select('id, nome, data_nascimento, avatar_url')
          .eq('status', 'ativo')
          .not('data_nascimento', 'is', null),
      ])

      if (userData) {
        setPossuiCarteira(userData.possui_carteira)
      }
      if (usuarios) {
        setTodosUsuarios(usuarios)
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

      const isAdmin =
        profile?.role === 'admin' ||
        user.email === 'drleandro@nuvia.com' ||
        user.email === 'drleandrolinhares@gmail.com'

      let query = supabase
        .from('sac_demandas')
        .select('id, paciente_nome, tipo, limite_primeiro_contato, status')
        .neq('status', 'resolvido')
        .order('limite_primeiro_contato', { ascending: true })

      if (!isAdmin) {
        query = query.eq('quem_resolve_id', user.id)
      }

      const { data: demandas } = await query

      if (demandas) {
        setMinhasDemandas(demandas)
      }
    }

    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [dataVersion, user, profile])

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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sac_demandas' }, () =>
        invalidateCache(),
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vendas_diarias' }, () =>
        invalidateCache(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [invalidateCache])

  const handleAddVenda = async () => {
    if (!novaVendaValor || Number(novaVendaValor) <= 0 || !pacienteNome) {
      return
    }
    setSalvandoVendas(true)
    try {
      const { error } = await supabase.from('vendas_diarias').insert({
        data_venda: selectedDate,
        valor: Number(novaVendaValor),
        usuario_id: user?.id,
        paciente_nome: pacienteNome,
        valor_tratamento: valorTratamento ? Number(valorTratamento) : null,
        forma_pagamento: formaPagamento,
        destino_pagamento: destinoPagamento,
        destino_fiscal: destinoFiscal,
      })
      if (error) throw error

      setNovaVendaValor('')
      setPacienteNome('')
      setValorTratamento('')
      setFormaPagamento('')
      setDestinoPagamento('')
      setDestinoFiscal('')
      invalidateCache()
    } catch (error) {
      console.error('Erro ao adicionar venda:', error)
    } finally {
      setSalvandoVendas(false)
    }
  }

  const handleDeleteVenda = async (id: string) => {
    try {
      const { error } = await supabase.from('vendas_diarias').delete().eq('id', id)
      if (error) throw error
      invalidateCache()
    } catch (error) {
      console.error('Erro ao deletar venda:', error)
    }
  }

  const totalVendasMes = vendasDiarias.reduce((acc, curr) => acc + Number(curr.valor), 0)
  const valorRestante = Math.max(0, metaFaturamento - totalVendasMes)
  const percentualAlcancado = metaFaturamento > 0 ? (totalVendasMes / metaFaturamento) * 100 : 0
  const percentualFaltante = Math.max(0, 100 - percentualAlcancado)

  const vendasDoDia = useMemo(() => {
    return vendasDiarias
      .filter((v) => v.data_venda === selectedDate)
      .sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime())
  }, [vendasDiarias, selectedDate])

  const totalDoDia = vendasDoDia.reduce((acc, curr) => acc + Number(curr.valor), 0)

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
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const itemsLowStock = produtosDashboard.filter((p) => {
      let isPastPrazo = false
      if (p.data_proxima_revisao) {
        const d = new Date(p.data_proxima_revisao)
        const localDate = new Date(d.getTime() + d.getTimezoneOffset() * 60000)
        localDate.setHours(0, 0, 0, 0)
        isPastPrazo = localDate <= today
      }
      const isLowStock = (p.quantidade_estoque || 0) <= (p.quantidade_minima || 0)

      return isLowStock || isPastPrazo
    })

    return {
      itemsAvisos: itemsLowStock,
    }
  }, [produtosDashboard])

  return (
    <div className="space-y-6 animate-fade-in-up relative pb-8">
      <div className="absolute top-6 right-6 z-10">
        <SyncIndicator isSyncing={loading} />
      </div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2 bg-slate-900 p-6 rounded-xl border-l-4 border-amber-500 shadow-sm">
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

      {/* NOVO BLOCO GESTÃO DE META */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm mb-6 animate-fade-in-down">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-md">
              <Target className="w-5 h-5 text-emerald-500" />
            </div>
            <h2 className="text-lg font-bold uppercase tracking-wider text-slate-100">
              Gestão de Meta
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {/* 1. Meta */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col justify-center">
            <span className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">
              Meta
            </span>
            <span className="text-xl font-bold text-slate-200">
              {loading
                ? '...'
                : `R$ ${metaFaturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            </span>
          </div>

          {/* 2. Vendas Atuais */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col justify-center relative group">
            <span className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">
              Vendas Atuais
            </span>
            <span className="text-xl font-bold text-emerald-400">
              {loading
                ? '...'
                : `R$ ${totalVendasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            </span>
            <Button
              onClick={() => setModalVendasOpen(true)}
              size="icon"
              className="absolute top-2 right-2 h-7 w-7 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-slate-950 rounded-md transition-colors"
              title="Lançar Venda Diária"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* 3. Valor Restante */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col justify-center">
            <span className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">
              Falta para Meta (R$)
            </span>
            <span className="text-xl font-bold text-amber-400">
              {loading
                ? '...'
                : `R$ ${valorRestante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            </span>
          </div>

          {/* 4. Meta Alcançada (%) */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col justify-center">
            <span className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">
              Meta Alcançada
            </span>
            <span className="text-xl font-bold text-emerald-400">
              {loading ? '...' : `${percentualAlcancado.toFixed(1)}%`}
            </span>
          </div>

          {/* 5. Falta para Meta (%) */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col justify-center">
            <span className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">
              Falta para Meta (%)
            </span>
            <span className="text-xl font-bold text-amber-400">
              {loading ? '...' : `${percentualFaltante.toFixed(1)}%`}
            </span>
          </div>
        </div>
      </div>

      {possuiCarteira && (
        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <Card className="border-slate-800 bg-slate-900 shadow-sm hover:shadow-md transition-shadow flex flex-col h-[140px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Saldo Total Acumulado
              </CardTitle>
              <Wallet className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center">
              <div className="text-4xl font-bold text-slate-100">
                {loading
                  ? '...'
                  : `R$ ${saldoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mt-1">
                Saldo global disponível na carteira
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900 shadow-sm hover:shadow-md transition-shadow flex flex-col h-[140px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">
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
              <p className="text-xs text-slate-500 uppercase tracking-wide mt-1">
                Penalidades e descontos
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Linha 1: SAC e Estoque */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        {/* SAC */}
        <Card className="border-slate-800 bg-slate-900 shadow-sm flex flex-col h-[400px]">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-md">
                <MessageSquare className="size-5 text-amber-500" />
              </div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-bold uppercase tracking-wider text-slate-100">
                  SAC
                </CardTitle>
                <Badge className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-2 py-0.5 rounded-full">
                  {minhasDemandas.length}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="h-8 text-xs font-bold uppercase tracking-wider text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 px-2"
            >
              <Link to="/operacional/sac">
                Ver Tudo <ArrowRight className="ml-1 size-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pt-4 custom-scrollbar">
            {minhasDemandas.length > 0 ? (
              <div className="flex flex-col gap-3 pr-2">
                {minhasDemandas.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950/50 hover:bg-slate-800/50 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-sm text-slate-200">
                        <Link
                          to={`/operacional/sac?demanda=${d.id}`}
                          className="hover:text-amber-400 hover:underline"
                        >
                          {d.paciente_nome}
                        </Link>
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-2 mt-1.5">
                        <span
                          className={cn(
                            'px-1.5 py-0.5 rounded text-[10px] uppercase font-bold shadow-sm',
                            d.tipo === 'reclamacao'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/20'
                              : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20',
                          )}
                        >
                          {d.tipo}
                        </span>
                        <span className="font-medium">
                          Prazo:{' '}
                          {d.limite_primeiro_contato
                            ? format(parseISO(d.limite_primeiro_contato), 'dd/MM/yyyy')
                            : '-'}
                        </span>
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        'uppercase text-[10px] tracking-wider font-bold shadow-sm border-0',
                        d.status === 'recebido' && 'text-red-400 bg-red-400/10',
                        d.status === 'sendo_tratado' && 'text-yellow-400 bg-yellow-400/10',
                      )}
                    >
                      {d.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-slate-800 bg-slate-900/50">
                <p className="text-sm text-slate-500 uppercase tracking-widest font-medium text-center px-4">
                  Nenhuma demanda pendente
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* GESTÃO DE ESTOQUE */}
        <Card className="border-slate-800 bg-slate-900 shadow-sm flex flex-col h-[400px]">
          <CardHeader className="flex flex-row items-center gap-3 pb-4 border-b border-slate-800">
            <div className="p-2 bg-amber-500/10 rounded-md">
              <Package className="size-5 text-amber-500" />
            </div>
            <CardTitle className="text-lg font-bold uppercase tracking-wider text-slate-100">
              Gestão de Estoque
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pt-4 custom-scrollbar">
            {itemsAvisos.length > 0 ? (
              <div className="flex flex-col gap-3 pr-2">
                {itemsAvisos.map((item) => (
                  <Link
                    key={item.id}
                    to={`/estoque?q=${encodeURIComponent(item.nome)}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950/50 hover:bg-slate-800 transition-colors cursor-pointer group"
                  >
                    <div>
                      <p className="font-semibold text-sm text-slate-200 group-hover:text-amber-400 transition-colors">
                        {item.nome}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {item.marca || 'Sem marca'} - {item.variacao || 'S/V'}
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      {item.data_proxima_revisao &&
                      new Date(
                        new Date(item.data_proxima_revisao).getTime() +
                          new Date(item.data_proxima_revisao).getTimezoneOffset() * 60000,
                      ) <= new Date(new Date().setHours(0, 0, 0, 0)) ? (
                        <p className="font-bold text-amber-600 text-[11px] uppercase bg-amber-50 px-2 py-1 rounded inline-block border border-amber-200 shadow-sm">
                          Prazo de Compra Atingido
                        </p>
                      ) : null}
                      {(item.quantidade_estoque || 0) <= (item.quantidade_minima || 0) && (
                        <p className="font-bold text-destructive text-sm bg-red-500/10 px-2 py-1 rounded inline-block">
                          {item.quantidade_estoque} em estoque
                        </p>
                      )}
                      <p className="text-xs text-slate-500">Mínimo: {item.quantidade_minima}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-slate-800 bg-slate-900/50">
                <p className="text-sm text-slate-500 uppercase tracking-widest font-medium text-center px-4">
                  Nenhum alerta no momento. Tudo em ordem.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Linha 2: Gestão de RH */}
      <div className="mb-6">
        <GestaoRH />
      </div>

      {/* Linha 3: Aniversariantes e Atalhos */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* ANIVERSARIANTES */}
        <Card className="border-slate-800 bg-slate-900 shadow-sm flex flex-col h-[400px]">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-md">
                <Cake className="size-5 text-amber-500" />
              </div>
              <CardTitle className="text-lg font-bold uppercase tracking-wider text-slate-100">
                Aniversariantes
              </CardTitle>
            </div>
            <Select
              value={selectedMonth.toString()}
              onValueChange={(v) => setSelectedMonth(parseInt(v))}
            >
              <SelectTrigger className="w-[120px] h-8 text-xs bg-slate-950 border-slate-800 text-slate-300">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-slate-300">
                {MESES.map((mes, idx) => (
                  <SelectItem
                    key={idx}
                    value={idx.toString()}
                    className="text-xs focus:bg-slate-800 focus:text-slate-100"
                  >
                    {mes}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pt-4 custom-scrollbar">
            {loading ? (
              <div className="text-sm text-slate-500">Carregando...</div>
            ) : aniversariantes.length > 0 ? (
              <div className="space-y-3 pr-2">
                {aniversariantes.map((a) => (
                  <div
                    key={a.id}
                    className={cn(
                      'flex items-center gap-3',
                      a.isPast ? 'opacity-50 grayscale' : '',
                    )}
                  >
                    <Avatar className="size-8 border border-slate-700">
                      <AvatarImage
                        src={
                          a.avatar_url || `https://img.usecurling.com/ppl/thumbnail?seed=${a.id}`
                        }
                      />
                      <AvatarFallback className="bg-slate-800 text-slate-300">
                        {a.nome.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-medium truncate text-slate-200">{a.nome}</p>
                      <p className="text-xs text-slate-500">
                        Dia {a.day.toString().padStart(2, '0')}
                      </p>
                    </div>
                    {!a.isPast &&
                      selectedMonth === new Date().getMonth() &&
                      a.day === new Date().getDate() && (
                        <Badge className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-2 py-0 uppercase shrink-0 font-bold border-0">
                          Hoje!
                        </Badge>
                      )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-slate-800 bg-slate-900/50">
                <p className="text-sm text-slate-500 uppercase tracking-widest font-medium text-center px-4">
                  Nenhum aniversariante neste mês
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ATALHOS */}
        <Card className="border-slate-800 bg-slate-900 shadow-sm flex flex-col h-[400px]">
          <CardHeader className="flex flex-row items-center gap-3 pb-4 border-b border-slate-800">
            <div className="p-2 bg-amber-500/10 rounded-md">
              <LayoutDashboard className="size-5 text-amber-500" />
            </div>
            <CardTitle className="text-lg font-bold uppercase tracking-wider text-slate-100">
              Atalhos
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 pt-6 flex flex-col gap-4">
            <Button
              asChild
              variant="outline"
              className="w-full justify-start h-14 uppercase tracking-wider font-bold border-slate-800 bg-slate-950 text-slate-300 hover:bg-amber-500 hover:text-slate-950 transition-all shadow-sm"
            >
              <Link to="/operacional/comunicados">
                <Calendar className="mr-3 h-5 w-5" />
                Compromissos de Hoje
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start h-14 uppercase tracking-wider font-bold border-slate-800 bg-slate-950 text-slate-300 hover:bg-amber-500 hover:text-slate-950 transition-all shadow-sm"
            >
              <Link to="/estoque">
                <RefreshCcw className="mr-3 h-5 w-5" />
                Atualizar Estoque
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Modal Lançamento de Vendas */}
      <Dialog open={modalVendasOpen} onOpenChange={setModalVendasOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lançamento de Vendas / Receitas</DialogTitle>
            <DialogDescription className="text-slate-400">
              Preencha os detalhes do lançamento. As entradas são totalizadas e compõem o
              faturamento do mês.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-[11px] text-slate-400 uppercase font-bold">Data *</Label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-sm focus-visible:ring-emerald-500 h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-slate-400 uppercase font-bold">
                  Nome do Paciente *
                </Label>
                <Input
                  type="text"
                  placeholder="Ex: João da Silva"
                  value={pacienteNome}
                  onChange={(e) => setPacienteNome(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-sm focus-visible:ring-emerald-500 h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-[11px] text-slate-400 uppercase font-bold">
                  Valor do Tratamento Total (R$)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={valorTratamento}
                  onChange={(e) => setValorTratamento(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-sm focus-visible:ring-emerald-500 h-9"
                  placeholder="0,00"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-slate-400 uppercase font-bold">
                  Valor Recebido / Entrada (R$) *
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={novaVendaValor}
                  onChange={(e) => setNovaVendaValor(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-sm focus-visible:ring-emerald-500 h-9 border-emerald-500/50 focus-visible:border-emerald-500"
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="text-[11px] text-slate-400 uppercase font-bold">
                  Forma de Pgto
                </Label>
                <Select value={formaPagamento} onValueChange={setFormaPagamento}>
                  <SelectTrigger className="bg-slate-950 border-slate-800 h-9 text-sm">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                    <SelectItem value="credito">Crédito</SelectItem>
                    <SelectItem value="debito">Débito</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-slate-400 uppercase font-bold">
                  Destino Pgto
                </Label>
                <Select value={destinoPagamento} onValueChange={setDestinoPagamento}>
                  <SelectTrigger className="bg-slate-950 border-slate-800 h-9 text-sm">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                    <SelectItem value="a vista">À Vista (Caixa)</SelectItem>
                    <SelectItem value="CC Sicoob PP">CC Sicoob PP</SelectItem>
                    <SelectItem value="CC Santander PJ">CC Santander PJ</SelectItem>
                    <SelectItem value="CC Sicoob Pf">CC Sicoob PF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-slate-400 uppercase font-bold">
                  Destino Fiscal
                </Label>
                <Select value={destinoFiscal} onValueChange={setDestinoFiscal}>
                  <SelectTrigger className="bg-slate-950 border-slate-800 h-9 text-sm">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                    <SelectItem value="PESSOA FISICA">Pessoa Física</SelectItem>
                    <SelectItem value="VITALI ODONTOLOGIA">Vitali Odontologia</SelectItem>
                    <SelectItem value="SOUZA FILHO ODONTOLOGIA">Souza Filho Odontologia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={handleAddVenda}
                disabled={
                  salvandoVendas || !novaVendaValor || Number(novaVendaValor) <= 0 || !pacienteNome
                }
                className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-6"
              >
                {salvandoVendas ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Lançar Recebimento
              </Button>
            </div>

            <div className="border border-slate-800 rounded-lg p-4 bg-slate-950/50 mt-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Lançamentos do Dia
                </h4>
                <span className="text-sm font-bold text-emerald-400">
                  Total: R$ {totalDoDia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
                {vendasDoDia.length > 0 ? (
                  vendasDoDia.map((v) => (
                    <div
                      key={v.id}
                      className="flex justify-between items-center bg-slate-900 p-2.5 rounded border border-slate-800 group hover:border-slate-700 transition-colors"
                    >
                      <div className="flex flex-col gap-0.5 max-w-[70%]">
                        <span className="text-sm font-bold text-slate-200 truncate">
                          {v.paciente_nome || 'Paciente não informado'}
                        </span>
                        <div className="flex gap-2 text-[10px] text-slate-500 uppercase font-medium">
                          <span>{v.destino_fiscal || 'S/ Destino Fiscal'}</span>
                          <span>•</span>
                          <span>{v.forma_pagamento || 'S/ Forma Pgto'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-bold text-emerald-400">
                            R${' '}
                            {Number(v.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-[10px] text-slate-500 uppercase font-medium">
                            {v.criado_em ? format(parseISO(v.criado_em), 'HH:mm') : ''}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteVenda(v.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-medium">
                      Nenhum recebimento hoje
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Index

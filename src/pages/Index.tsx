import {
  ArrowDownRight,
  CircleDollarSign,
  Calendar,
  RefreshCcw,
  AlertCircle,
  Box,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import { fetchProdutos, Produto } from '@/services/produtos'
import { SyncIndicator } from '@/components/ui/sync-indicator'

const Index = () => {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    const { data } = await fetchProdutos()
    if (data) {
      setProdutos(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const channel = supabase
      .channel('dashboard-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'produtos' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'compras' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'compra_itens' }, () =>
        loadData(),
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'entrada_produtos' }, () =>
        loadData(),
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'saida_produtos' }, () =>
        loadData(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const produtosDashboard = useMemo(() => {
    return produtos
      .filter((p) => p.compra_itens?.some((ci) => ci.compras?.status === 'Finalizada'))
      .map((p) => {
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

  const { capitalInvestido, unidadesTotais, avisosEstoque, itemsAvisos } = useMemo(() => {
    let cap = 0
    let uni = 0

    produtosDashboard.forEach((p) => {
      const valor = (p.custo_unitario || 0) * (p.quantidade_estoque || 0)
      cap += valor
      uni += p.quantidade_estoque || 0
    })

    const itemsLowStock = produtosDashboard.filter(
      (p) => (p.quantidade_estoque || 0) <= (p.quantidade_minima || 0),
    )

    return {
      capitalInvestido: cap,
      unidadesTotais: uni,
      avisosEstoque: itemsLowStock.length,
      itemsAvisos: itemsLowStock,
    }
  }, [produtosDashboard])

  return (
    <div className="space-y-8 animate-fade-in-up relative">
      <div className="absolute top-0 right-0 z-10">
        <SyncIndicator isSyncing={loading} />
      </div>
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground uppercase pr-24 sm:pr-0">
          Dashboard Nuvia
        </h1>
        <p className="text-muted-foreground uppercase text-sm font-medium tracking-wider mt-1">
          Visão Geral da Gestão de Estoque e Rotinas.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Avisos de Estoque
            </CardTitle>
            <ArrowDownRight className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{loading ? '...' : avisosEstoque}</div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
              Itens precisam de reposição
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Capital Investido
            </CardTitle>
            <CircleDollarSign className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground">
              {loading
                ? '...'
                : `R$ ${capitalInvestido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
              Valor em estoque clínico
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Itens em Estoque
            </CardTitle>
            <Box className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {loading ? '...' : unidadesTotais.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
              Total de unidades disponíveis
            </p>
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
              variant="outline"
              className="w-full justify-start h-12 uppercase tracking-wider font-semibold border-border hover:bg-secondary/10 hover:text-secondary hover:border-secondary transition-colors"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Compromissos de Hoje
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start h-12 uppercase tracking-wider font-semibold border-border hover:bg-secondary/10 hover:text-secondary hover:border-secondary transition-colors"
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

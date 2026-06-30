import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DollarSign } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { format, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ConfiguracaoFaixas } from '@/components/comissoes/configuracao-faixas'
import { ComissoesDashboardCards } from '@/components/comissoes/comissoes-dashboard-cards'
import { ComissoesTabela } from '@/components/comissoes/comissoes-tabela'
import {
  fetchComissoesPeriodo,
  type ComissaoVenda,
  type DashboardTotals,
} from '@/services/comissoes-dashboard'

export default function ControleComissoes() {
  const { toast } = useToast()
  const [mesAno, setMesAno] = useState(format(new Date(), 'yyyy-MM'))
  const [loading, setLoading] = useState(true)
  const [vendas, setVendas] = useState<ComissaoVenda[]>([])
  const [totals, setTotals] = useState<DashboardTotals>({
    totalComissaoDentista: 0,
    totalComissaoCRC: 0,
    totalVendas: 0,
  })

  const mesesOptions = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => {
        const d = subMonths(new Date(), i)
        return {
          value: format(d, 'yyyy-MM'),
          label: format(d, 'MMMM yyyy', { locale: ptBR }).replace(/^\w/, (c) => c.toUpperCase()),
        }
      }),
    [],
  )

  const competenciaLabel = mesesOptions.find((m) => m.value === mesAno)?.label || ''

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const { vendas: v, totals: t } = await fetchComissoesPeriodo(mesAno)
        setVendas(v)
        setTotals(t)
      } catch (error: any) {
        toast({
          title: 'Erro ao carregar dados',
          description: error.message,
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()

    const channel = supabase
      .channel(`comissoes-page-${Math.random()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vendas_confirmadas' }, () =>
        loadData(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'referencias_comissao_dentista' },
        () => loadData(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'referencias_comissao_crc' },
        () => loadData(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [mesAno])

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 rounded-lg">
            <DollarSign className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 uppercase">
              Controle de Comissões
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Gerencie comissões de Dentistas e CRC Comercial
            </p>
          </div>
        </div>
        <div className="w-full md:w-56">
          <Select value={mesAno} onValueChange={setMesAno}>
            <SelectTrigger className="bg-white dark:bg-slate-950">
              <SelectValue placeholder="Mês/Ano" />
            </SelectTrigger>
            <SelectContent>
              {mesesOptions.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <ComissoesDashboardCards totals={totals} competencia={competenciaLabel} />

      <Tabs defaultValue="dentistas" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="dentistas">Dentistas</TabsTrigger>
          <TabsTrigger value="crc">CRC</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="dentistas" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Comissões - Dentistas Avaliadores</CardTitle>
              <CardDescription>
                Comissões calculadas automaticamente com base nas regras de faixa de entrada (
                {competenciaLabel}).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ComissoesTabela vendas={vendas} tipo="dentista" loading={loading} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crc" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Comissões - CRC Comercial</CardTitle>
              <CardDescription>
                Comissões calculadas automaticamente com base nas regras de faixa de entrada (
                {competenciaLabel}).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ComissoesTabela vendas={vendas} tipo="crc" loading={loading} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuracoes" className="mt-6">
          <ConfiguracaoFaixas />
        </TabsContent>
      </Tabs>
    </div>
  )
}

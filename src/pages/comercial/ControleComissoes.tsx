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
import { DollarSign, Users, TrendingUp } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { format, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ConfiguracaoFaixas } from '@/components/comissoes/configuracao-faixas'
import { ComissoesDashboardCards } from '@/components/comissoes/comissoes-dashboard-cards'
import { ComissoesTabela } from '@/components/comissoes/comissoes-tabela'
import { ProfessionalCards } from '@/components/comissoes/professional-cards'
import {
  fetchComissoesPeriodo,
  type ComissaoVenda,
  type DashboardTotals,
  type ProfessionalSummary,
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
    totalEntries: 0,
  })
  const [profissionais, setProfissionais] = useState<ProfessionalSummary[]>([])

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
        const { vendas: v, totals: t, profissionais: p } = await fetchComissoesPeriodo(mesAno)
        setVendas(v)
        setTotals(t)
        setProfissionais(p)
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
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto bg-white min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-slate-900 p-6 rounded-xl border-l-4 border-amber-500 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-800 rounded-lg">
            <DollarSign className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white uppercase">
              Controle de Comissões
            </h1>
            <p className="text-slate-400 mt-1 text-sm uppercase tracking-wider font-medium">
              Cálculo agregado por profissional — Comissões de Dentistas e CRC Comercial
            </p>
          </div>
        </div>
        <div className="w-full md:w-56">
          <Select value={mesAno} onValueChange={setMesAno}>
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
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

      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-slate-600" />
        <h2 className="text-lg font-bold text-slate-950">Visão Geral</h2>
        <span className="text-sm text-slate-400">({competenciaLabel})</span>
      </div>
      <ComissoesDashboardCards totals={totals} competencia={competenciaLabel} />

      <div>
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-slate-600" />
          <h2 className="text-lg font-bold text-slate-950">
            Performance Individual por Profissional
          </h2>
          <span className="text-sm text-slate-400">({competenciaLabel})</span>
        </div>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <ProfessionalCards profissionais={profissionais} />
        )}
      </div>

      <Tabs defaultValue="dentistas" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md bg-slate-100">
          <TabsTrigger
            value="dentistas"
            className="data-[state=active]:bg-white data-[state=active]:text-slate-950"
          >
            Dentistas
          </TabsTrigger>
          <TabsTrigger
            value="crc"
            className="data-[state=active]:bg-white data-[state=active]:text-slate-950"
          >
            CRC
          </TabsTrigger>
          <TabsTrigger
            value="configuracoes"
            className="data-[state=active]:bg-white data-[state=active]:text-slate-950"
          >
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dentistas" className="mt-6">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-950">Comissões — Dentistas Avaliadores</CardTitle>
              <CardDescription className="text-slate-500">
                Taxa aplicada com base no percentual de entrada agregado do profissional (
                {competenciaLabel}).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ComissoesTabela vendas={vendas} tipo="dentista" loading={loading} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crc" className="mt-6">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-950">Comissões — CRC Comercial</CardTitle>
              <CardDescription className="text-slate-500">
                Taxa aplicada com base no percentual de entrada agregado do profissional (
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

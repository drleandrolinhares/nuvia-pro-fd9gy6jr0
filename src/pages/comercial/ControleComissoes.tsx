import { useState, useEffect, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DollarSign, Users, TrendingUp, BarChart3, Filter } from 'lucide-react'
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
  const [filtroDentista, setFiltroDentista] = useState<string>('todos')
  const [filtroCRC, setFiltroCRC] = useState<string>('todos')

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

  const dentistasOptions = useMemo(() => {
    const map = new Map<string, string>()
    vendas.forEach((v) => {
      if (v.dentista_avaliador && v.dentista_nome) {
        map.set(v.dentista_avaliador, v.dentista_nome)
      }
    })
    return Array.from(map.entries())
      .map(([id, nome]) => ({ id, nome }))
      .sort((a, b) => a.nome.localeCompare(b.nome))
  }, [vendas])

  const crcOptions = useMemo(() => {
    const map = new Map<string, string>()
    vendas.forEach((v) => {
      if (v.crc && v.crc_nome) {
        map.set(v.crc, v.crc_nome)
      }
    })
    return Array.from(map.entries())
      .map(([id, nome]) => ({ id, nome }))
      .sort((a, b) => a.nome.localeCompare(b.nome))
  }, [vendas])

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2 bg-slate-900 p-6 rounded-xl border-l-4 border-amber-500 shadow-lg">
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

      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-amber-500" />
        <h2 className="text-lg font-bold text-slate-900">Visão Geral</h2>
        <span className="text-sm text-slate-500">({competenciaLabel})</span>
      </div>
      <ComissoesDashboardCards totals={totals} competencia={competenciaLabel} />

      <Tabs defaultValue="dash" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl bg-slate-900 border border-slate-800 h-auto">
          <TabsTrigger
            value="dash"
            className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400 text-xs md:text-sm py-2"
          >
            <BarChart3 className="w-4 h-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">DASH POR VENDEDOR</span>
            <span className="sm:hidden">DASH</span>
          </TabsTrigger>
          <TabsTrigger
            value="dentistas"
            className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400 text-xs md:text-sm py-2"
          >
            DENTISTAS
          </TabsTrigger>
          <TabsTrigger
            value="crc"
            className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400 text-xs md:text-sm py-2"
          >
            CRC
          </TabsTrigger>
          <TabsTrigger
            value="configuracoes"
            className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400 text-xs md:text-sm py-2"
          >
            CONFIG.
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dash" className="mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900">
              Performance Individual por Profissional
            </h2>
            <span className="text-sm text-slate-500">({competenciaLabel})</span>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <ProfessionalCards profissionais={profissionais} />
          )}
        </TabsContent>

        <TabsContent value="dentistas" className="mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-slate-900">
                Comissões — Dentistas Avaliadores
              </h2>
              <span className="text-sm text-slate-500">({competenciaLabel})</span>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <Select value={filtroDentista} onValueChange={setFiltroDentista}>
                <SelectTrigger className="w-[240px] bg-white border-slate-300 text-slate-900">
                  <SelectValue placeholder="Todos os dentistas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os dentistas</SelectItem>
                  {dentistasOptions.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <ComissoesTabela
            vendas={vendas}
            tipo="dentista"
            loading={loading}
            profissionalFilter={filtroDentista}
          />
        </TabsContent>

        <TabsContent value="crc" className="mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-slate-900">Comissões — CRC Comercial</h2>
              <span className="text-sm text-slate-500">({competenciaLabel})</span>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <Select value={filtroCRC} onValueChange={setFiltroCRC}>
                <SelectTrigger className="w-[240px] bg-white border-slate-300 text-slate-900">
                  <SelectValue placeholder="Todos os agentes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os agentes</SelectItem>
                  {crcOptions.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <ComissoesTabela
            vendas={vendas}
            tipo="crc"
            loading={loading}
            profissionalFilter={filtroCRC}
          />
        </TabsContent>

        <TabsContent value="configuracoes" className="mt-6">
          <ConfiguracaoFaixas />
        </TabsContent>
      </Tabs>
    </div>
  )
}

import { useState, useEffect, useCallback } from 'react'
import {
  startOfDay,
  endOfDay,
  subDays,
  startOfMonth,
  endOfMonth,
  parseISO,
  format,
  subMonths,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { VendasFiltros } from './components/VendasFiltros'
import { VendasTabela } from './components/VendasTabela'
import { VendasModal } from './components/VendasModal'
import { VendasRankingDentistas } from './components/VendasRankingDentistas'
import { VendasConcretizadasLista } from './components/VendasConcretizadasLista'
import { Avaliacao, VendasFiltersState } from './types'
import { useAuth } from '@/hooks/use-auth'
import { VendasAtuaisWidget } from '@/components/financeiro/vendas-atuais-widget'

export default function Vendas() {
  const { toast } = useToast()
  const { profile } = useAuth()
  const [hasGerenciarVendas, setHasGerenciarVendas] = useState(false)
  const canEdit =
    profile?.role === 'admin' || profile?.role === 'crc_comercial' || hasGerenciarVendas
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const [loading, setLoading] = useState(true)
  const [dentistas, setDentistas] = useState<any[]>([])
  const [crcs, setCrcs] = useState<any[]>([])

  const [filters, setFilters] = useState<VendasFiltersState>({
    periodo: 'mes_atual',
    dataInicio: '',
    dataFim: '',
    status: 'todos',
    temperatura: 'todas',
    dentista: 'todos',
    crc: 'todos',
    tratamento: 'todos',
    valorRange: [0, 100000],
    search: '',
  })

  const [debouncedValorRange, setDebouncedValorRange] = useState(filters.valorRange)
  const [page, setPage] = useState(1)
  const itemsPerPage = 10
  const [totalCount, setTotalCount] = useState(0)
  const [sortColumn, setSortColumn] = useState('data_avaliacao')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValorRange(filters.valorRange), 500)
    return () => clearTimeout(handler)
  }, [filters.valorRange])

  useEffect(() => {
    Promise.all([
      supabase.from('dentistas_avaliadores').select('id, nome').eq('status', 'ativo'),
      supabase.from('crc_comercial').select('id, nome').eq('status', 'ativo'),
      supabase.rpc('has_permission', { permission_name: 'Gerenciar Vendas' }),
    ]).then(([d, c, p]) => {
      if (d.data) setDentistas(d.data)
      if (c.data) setCrcs(c.data)
      if (p.data) setHasGerenciarVendas(!!p.data)
    })
  }, [])

  const fetchAvaliacoes = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase.from('avaliacoes').select(
        `
        id, paciente_id, data_avaliacao, valor_orcamento, status, temperatura_lead, 
        proxima_data_contato, tipo_tratamento,
        pacientes!inner (id, nome), dentistas_avaliadores (id, nome), crc_comercial (id, nome),
        orcamentos (valor)
      `,
        { count: 'exact' },
      )

      if (filters.search) query = query.ilike('pacientes.nome', `%${filters.search}%`)
      if (filters.status !== 'todos') {
        query = query.eq('status', filters.status)
      } else {
        // Remove as vendas já concretizadas da visualização padrão de oportunidades,
        // pois elas agora possuem uma aba própria. Mantemos a lógica existente intacta.
        query = query
          .not('status', 'eq', 'Fechada em Comercial')
          .not('status', 'eq', 'Fechada em Avaliação')
          .not('status', 'eq', 'venda_concretizada')
      }

      if (filters.temperatura !== 'todas') query = query.eq('temperatura_lead', filters.temperatura)
      if (filters.dentista !== 'todos') query = query.eq('dentista_avaliador_id', filters.dentista)
      if (filters.crc !== 'todos') query = query.eq('crc_comercial_id', filters.crc)
      if (filters.tratamento !== 'todos') query = query.eq('tipo_tratamento', filters.tratamento)

      let sd, ed
      const today = new Date()
      switch (filters.periodo) {
        case 'hoje':
          sd = startOfDay(today)
          ed = endOfDay(today)
          break
        case 'ontem':
          sd = startOfDay(subDays(today, 1))
          ed = endOfDay(subDays(today, 1))
          break
        case 'ultimos_7':
          sd = startOfDay(subDays(today, 7))
          ed = endOfDay(today)
          break
        case 'ultimos_15':
          sd = startOfDay(subDays(today, 15))
          ed = endOfDay(today)
          break
        case 'mes_atual':
          sd = startOfMonth(today)
          ed = endOfMonth(today)
          break
        case 'personalizado':
          if (filters.dataInicio) sd = startOfDay(parseISO(filters.dataInicio))
          if (filters.dataFim) ed = endOfDay(parseISO(filters.dataFim))
          break
        default:
          if (filters.periodo && filters.periodo.match(/^\d{4}-\d{2}$/)) {
            const parsedDate = parseISO(`${filters.periodo}-01`)
            sd = startOfMonth(parsedDate)
            ed = endOfMonth(parsedDate)
          }
          break
      }
      if (sd) query = query.gte('data_avaliacao', format(sd, 'yyyy-MM-dd'))
      if (ed) query = query.lte('data_avaliacao', format(ed, 'yyyy-MM-dd'))

      query = query
        .gte('valor_orcamento', debouncedValorRange[0])
        .lte('valor_orcamento', debouncedValorRange[1])

      const from = (page - 1) * itemsPerPage
      const to = from + itemsPerPage - 1
      query = query.range(from, to)

      if (sortColumn && sortColumn !== 'pacientes.nome') {
        query = query.order(sortColumn, { ascending: sortDirection === 'asc' })
      }

      const { data, error, count } = await query
      if (error) throw error

      setAvaliacoes(data as any)
      setTotalCount(count || 0)
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [filters, debouncedValorRange, page, sortColumn, sortDirection, itemsPerPage, toast])

  useEffect(() => {
    fetchAvaliacoes()
  }, [fetchAvaliacoes])

  const handleSort = (col: string) => {
    if (sortColumn === col) setSortDirection((p) => (p === 'asc' ? 'desc' : 'asc'))
    else {
      setSortColumn(col)
      setSortDirection('asc')
    }
  }

  const monthOptions = useMemo(() => {
    const options = []
    const now = new Date()
    for (let i = 0; i < 12; i++) {
      const date = subMonths(now, i)
      options.push({
        value: format(date, 'yyyy-MM'),
        label: format(date, 'MMMM/yyyy', { locale: ptBR }).replace(/^\w/, (c) => c.toUpperCase()),
      })
    }
    return options
  }, [])

  const updateGlobalFilter = (key: keyof VendasFiltersState, value: any) => {
    setFilters((prev) => {
      const updated = { ...prev, [key]: value }
      if (key === 'dataInicio' && value && !prev.dataFim) {
        updated.dataFim = value
      }
      return updated
    })
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-slate-900 p-6 rounded-xl border-l-4 border-amber-500 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-800 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6 text-amber-500"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white uppercase">
              Gestão de Vendas
            </h1>
            <p className="text-slate-400 mt-1 text-sm uppercase tracking-wider font-medium">
              Acompanhe negociações e ranking de avaliadores
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <VendasAtuaisWidget />
          {canEdit && <VendasModal dentistas={dentistas} crcs={crcs} onSuccess={fetchAvaliacoes} />}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border">
        <div className="flex items-center gap-3">
          <label className="font-semibold text-slate-700 dark:text-slate-300 text-sm uppercase tracking-wider">
            Período Geral:
          </label>
          <div className="w-[180px]">
            <Select value={filters.periodo} onValueChange={(v) => updateGlobalFilter('periodo', v)}>
              <SelectTrigger className="bg-white dark:bg-slate-950">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tempos</SelectItem>
                <SelectItem value="hoje">Hoje</SelectItem>
                <SelectItem value="ontem">Ontem</SelectItem>
                <SelectItem value="ultimos_7">Últimos 7 dias</SelectItem>
                <SelectItem value="ultimos_15">Últimos 15 dias</SelectItem>
                <SelectItem value="mes_atual">Mês Atual</SelectItem>
                <SelectItem value="personalizado">Personalizado</SelectItem>
                {monthOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {filters.periodo === 'personalizado' && (
          <div className="flex items-center gap-2 bg-white dark:bg-slate-950 p-1.5 rounded-md border shadow-sm">
            <input
              type="date"
              value={filters.dataInicio}
              onChange={(e) => updateGlobalFilter('dataInicio', e.target.value)}
              className="border-0 bg-transparent text-sm focus:ring-0 px-2 outline-none"
              title="Data Inicial (opcional)"
            />
            <span className="text-muted-foreground text-sm font-medium px-2">até</span>
            <input
              type="date"
              value={filters.dataFim}
              onChange={(e) => updateGlobalFilter('dataFim', e.target.value)}
              className="border-0 bg-transparent text-sm focus:ring-0 px-2 outline-none"
              title="Data Final"
            />
          </div>
        )}
      </div>

      <Tabs defaultValue="oportunidades" className="space-y-4">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto gap-2 bg-slate-200/50 p-1 rounded-lg max-w-[800px]">
          <TabsTrigger
            value="oportunidades"
            className="data-[state=active]:bg-amber-500 data-[state=active]:text-white text-slate-600 font-bold uppercase tracking-wider text-xs rounded-md transition-all py-2"
          >
            Oportunidades Comerciais
          </TabsTrigger>
          <TabsTrigger
            value="concretizadas"
            className="data-[state=active]:bg-amber-500 data-[state=active]:text-white text-slate-600 font-bold uppercase tracking-wider text-xs rounded-md transition-all py-2"
          >
            Vendas Concretizadas
          </TabsTrigger>
          <TabsTrigger
            value="ranking"
            className="data-[state=active]:bg-amber-500 data-[state=active]:text-white text-slate-600 font-bold uppercase tracking-wider text-xs rounded-md transition-all py-2"
          >
            Ranking de Avaliadores
          </TabsTrigger>
        </TabsList>

        <TabsContent value="oportunidades" className="space-y-4 outline-none">
          <Card>
            <CardHeader>
              <CardTitle>Oportunidades Comerciais</CardTitle>
              <CardDescription>
                Acompanhamento de avaliações e negociações em andamento.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VendasFiltros
                filters={filters}
                setFilters={setFilters}
                dentistas={dentistas}
                crcs={crcs}
              />
              <VendasTabela
                avaliacoes={avaliacoes}
                loading={loading}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
                page={page}
                totalCount={totalCount}
                itemsPerPage={itemsPerPage}
                setPage={setPage}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="concretizadas" className="space-y-4 outline-none">
          <VendasConcretizadasLista
            onRevertSuccess={fetchAvaliacoes}
            periodo={filters.periodo}
            dataInicio={filters.dataInicio}
            dataFim={filters.dataFim}
          />
        </TabsContent>

        <TabsContent value="ranking" className="space-y-4 outline-none">
          <VendasRankingDentistas
            periodo={filters.periodo}
            dataInicio={filters.dataInicio}
            dataFim={filters.dataFim}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

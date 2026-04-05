import { useState, useEffect, useCallback } from 'react'
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, parseISO, format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { VendasFiltros } from './components/VendasFiltros'
import { VendasTabela } from './components/VendasTabela'
import { VendasModal } from './components/VendasModal'
import { VendasKPIs } from './components/VendasKPIs'
import { VendasRankingDentistas } from './components/VendasRankingDentistas'
import { useVendasKPIs } from './hooks/use-vendas-kpis'
import { Avaliacao, VendasFiltersState } from './types'
import { useAuth } from '@/hooks/use-auth'

export default function Vendas() {
  const { toast } = useToast()
  const { profile } = useAuth()
  const canEdit = profile?.role === 'admin' || profile?.role === 'crc_comercial'
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const [loading, setLoading] = useState(true)
  const [dentistas, setDentistas] = useState<any[]>([])
  const [crcs, setCrcs] = useState<any[]>([])

  const [filters, setFilters] = useState<VendasFiltersState>({
    periodo: 'todos',
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

  const { kpis, trends, loading: kpisLoading } = useVendasKPIs(filters, debouncedValorRange)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValorRange(filters.valorRange), 500)
    return () => clearTimeout(handler)
  }, [filters.valorRange])

  useEffect(() => {
    Promise.all([
      supabase.from('dentistas_avaliadores').select('id, nome').eq('status', 'ativo'),
      supabase.from('crc_comercial').select('id, nome').eq('status', 'ativo'),
    ]).then(([d, c]) => {
      if (d.data) setDentistas(d.data)
      if (c.data) setCrcs(c.data)
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
      if (filters.status !== 'todos') query = query.eq('status', filters.status)
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

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Gestão de Vendas</h2>
        {canEdit && <VendasModal dentistas={dentistas} crcs={crcs} onSuccess={fetchAvaliacoes} />}
      </div>

      <VendasKPIs kpis={kpis} trends={trends} loading={kpisLoading} />

      <VendasRankingDentistas />

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
    </div>
  )
}

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useRankingDentistas, RankingDentista } from '../hooks/use-ranking-dentistas'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowUpDown,
  Video,
  DollarSign,
  Eye,
  Target,
  Trophy,
  ClipboardList,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CriativosDentistaModal } from './CriativosDentistaModal'
import { VendasDetalhamentoDentistaModal } from './VendasDetalhamentoDentistaModal'
import { format, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function VendasRankingDentistas() {
  const [periodo, setPeriodo] = useState('mes_atual')
  const { ranking, loading, refetch } = useRankingDentistas(periodo)

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

  const [modalCriativos, setModalCriativos] = useState<{
    isOpen: boolean
    dentista: RankingDentista | null
  }>({
    isOpen: false,
    dentista: null,
  })

  const [modalDetalhes, setModalDetalhes] = useState<{
    isOpen: boolean
    dentista: RankingDentista | null
  }>({
    isOpen: false,
    dentista: null,
  })

  const [sortColumn, setSortColumn] = useState<keyof (typeof ranking)[0]>('valorTotalConversao')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const handleSort = (col: keyof (typeof ranking)[0]) => {
    if (sortColumn === col) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortColumn(col)
      setSortDirection('desc')
    }
  }

  const sortedRanking = useMemo(() => {
    return [...ranking].sort((a, b) => {
      let aVal = a[sortColumn]
      let bVal = b[sortColumn]

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [ranking, sortColumn, sortDirection])

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  const SortableHead = ({
    label,
    column,
    className,
  }: {
    label: string
    column: keyof (typeof ranking)[0]
    className?: string
  }) => {
    return (
      <TableHead className={className}>
        <Button
          variant="ghost"
          onClick={() => handleSort(column)}
          className="h-8 px-2 flex items-center hover:bg-transparent -ml-2 font-semibold whitespace-nowrap"
        >
          {label}
          {sortColumn === column ? (
            sortDirection === 'asc' ? (
              <ArrowUpIcon className="ml-2 h-4 w-4" />
            ) : (
              <ArrowDownIcon className="ml-2 h-4 w-4" />
            )
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground/50" />
          )}
        </Button>
      </TableHead>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
        <div className="space-y-1">
          <CardTitle>Ranking de Dentistas Avaliadores</CardTitle>
          <CardDescription>Performance de vendas e conversão da equipe clínica.</CardDescription>
        </div>
        <Select value={periodo} onValueChange={setPeriodo}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hoje">Hoje</SelectItem>
            <SelectItem value="ontem">Ontem</SelectItem>
            <SelectItem value="ultimos_7">Últimos 7 dias</SelectItem>
            <SelectItem value="ultimos_15">Últimos 15 dias</SelectItem>
            <SelectItem value="mes_atual">Mês Atual</SelectItem>
            <SelectItem value="todos">Todos</SelectItem>
            {monthOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>

      {!loading && ranking.length > 0 && (
        <div className="px-2 sm:px-6 pb-6 space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Top 3 Valor */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2 text-muted-foreground uppercase text-xs tracking-wider">
                <Trophy className="w-4 h-4 text-amber-500" /> Top 3 - Valor Fechado
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[...ranking]
                  .sort((a, b) => b.valorTotalConversao - a.valorTotalConversao)
                  .slice(0, 3)
                  .map((dentista, i) => (
                    <Card
                      key={dentista.id}
                      className={cn(
                        'border-l-4 shadow-sm',
                        i === 0
                          ? 'border-l-amber-500 bg-amber-500/5'
                          : i === 1
                            ? 'border-l-slate-400 bg-slate-400/5'
                            : 'border-l-amber-700 bg-amber-700/5',
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="text-xs font-bold text-muted-foreground mb-1">
                          #{i + 1} LUGAR
                        </div>
                        <div className="font-bold text-sm truncate" title={dentista.nome}>
                          {dentista.nome}
                        </div>
                        <div className="text-lg text-primary font-black mt-1">
                          {formatCurrency(dentista.valorTotalConversao)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>

            {/* Top 3 Conversão */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2 text-muted-foreground uppercase text-xs tracking-wider">
                <Target className="w-4 h-4 text-emerald-500" /> Top 3 - Taxa de Conversão
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[...ranking]
                  .sort((a, b) => b.conversao - a.conversao)
                  .slice(0, 3)
                  .map((dentista, i) => (
                    <Card
                      key={dentista.id}
                      className={cn(
                        'border-l-4 shadow-sm',
                        i === 0
                          ? 'border-l-emerald-500 bg-emerald-500/5'
                          : i === 1
                            ? 'border-l-emerald-400 bg-emerald-400/5'
                            : 'border-l-emerald-300 bg-emerald-300/5',
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="text-xs font-bold text-muted-foreground mb-1">
                          #{i + 1} LUGAR
                        </div>
                        <div className="font-bold text-sm truncate" title={dentista.nome}>
                          {dentista.nome}
                        </div>
                        <div className="text-lg text-emerald-600 dark:text-emerald-400 font-black mt-1">
                          {dentista.conversao.toFixed(1)}%
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>

            {/* Top 3 Avaliações */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2 text-muted-foreground uppercase text-xs tracking-wider">
                <ClipboardList className="w-4 h-4 text-blue-500" /> Top 3 - Avaliações
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[...ranking]
                  .sort((a, b) => b.avaliacoes - a.avaliacoes)
                  .slice(0, 3)
                  .map((dentista, i) => (
                    <Card
                      key={`av-${dentista.id}`}
                      className={cn(
                        'border-l-4 shadow-sm',
                        i === 0
                          ? 'border-l-blue-500 bg-blue-500/5'
                          : i === 1
                            ? 'border-l-blue-400 bg-blue-400/5'
                            : 'border-l-blue-300 bg-blue-300/5',
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="text-xs font-bold text-muted-foreground mb-1">
                          #{i + 1} LUGAR
                        </div>
                        <div className="font-bold text-sm truncate" title={dentista.nome}>
                          {dentista.nome}
                        </div>
                        <div className="text-lg text-blue-600 dark:text-blue-400 font-black mt-1">
                          {dentista.avaliacoes}{' '}
                          <span className="text-sm font-normal text-muted-foreground">avals</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>

            {/* Top 3 Comparecimentos */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2 text-muted-foreground uppercase text-xs tracking-wider">
                <Users className="w-4 h-4 text-purple-500" /> Top 3 - Comparecimentos
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[...ranking]
                  .sort((a, b) => b.comparecimentos - a.comparecimentos)
                  .slice(0, 3)
                  .map((dentista, i) => (
                    <Card
                      key={`comp-${dentista.id}`}
                      className={cn(
                        'border-l-4 shadow-sm',
                        i === 0
                          ? 'border-l-purple-500 bg-purple-500/5'
                          : i === 1
                            ? 'border-l-purple-400 bg-purple-400/5'
                            : 'border-l-purple-300 bg-purple-300/5',
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="text-xs font-bold text-muted-foreground mb-1">
                          #{i + 1} LUGAR
                        </div>
                        <div className="font-bold text-sm truncate" title={dentista.nome}>
                          {dentista.nome}
                        </div>
                        <div className="text-lg text-purple-600 dark:text-purple-400 font-black mt-1">
                          {dentista.comparecimentos}{' '}
                          <span className="text-sm font-normal text-muted-foreground">comps</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <CardContent className="px-2 sm:px-6">
        <div className="rounded-md border overflow-x-auto">
          <Table className="min-w-[1000px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px] text-center whitespace-nowrap">Posição</TableHead>
                <SortableHead label="Nome do Dentista" column="nome" className="min-w-[180px]" />
                <SortableHead label="Nº de Comparecimentos" column="comparecimentos" />
                <SortableHead label="Nº de Avaliações" column="avaliacoes" />
                <SortableHead label="Nº de Fechamentos" column="fechamentos" />
                <SortableHead label="% de Conversão" column="conversao" />
                <SortableHead label="T.M. Oportunidade" column="ticketOportunidade" />
                <SortableHead label="T.M. Conversão" column="ticketConversao" />
                <SortableHead
                  label="Criativos Gerados"
                  column="criativos"
                  className="min-w-[160px]"
                />
                <TableHead className="w-[80px] text-center whitespace-nowrap">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center">
                    Carregando ranking...
                  </TableCell>
                </TableRow>
              ) : sortedRanking.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center">
                    Nenhum dado encontrado para o período.
                  </TableCell>
                </TableRow>
              ) : (
                sortedRanking.map((item, index) => {
                  let badgeColor = 'bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                  let numberColor = 'text-red-600 dark:text-red-400'
                  if (index < 3) {
                    badgeColor =
                      'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                    numberColor = 'text-emerald-600 dark:text-emerald-400'
                  } else if (index < 6) {
                    badgeColor =
                      'bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                    numberColor = 'text-amber-600 dark:text-amber-400'
                  }

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="text-center font-medium">
                        <div
                          className={cn(
                            'inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-sm',
                            badgeColor,
                          )}
                        >
                          {index + 1}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{item.nome}</TableCell>
                      <TableCell>{item.comparecimentos}</TableCell>
                      <TableCell>{item.avaliacoes}</TableCell>
                      <TableCell>{item.fechamentos}</TableCell>
                      <TableCell className={cn('font-bold', numberColor)}>
                        {item.conversao.toFixed(1)}%
                      </TableCell>
                      <TableCell>{formatCurrency(item.ticketOportunidade)}</TableCell>
                      <TableCell>{formatCurrency(item.ticketConversao)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1.5 min-w-[120px] max-w-[150px]">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground font-medium">
                              {item.criativos} / {item.metaMensalCriativos || 0}
                            </span>
                            <span
                              className={cn(
                                'font-bold',
                                item.metaMensalCriativos > 0 &&
                                  item.criativos >= item.metaMensalCriativos
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-primary',
                              )}
                            >
                              {item.metaMensalCriativos > 0
                                ? Math.round((item.criativos / item.metaMensalCriativos) * 100)
                                : 0}
                              %
                            </span>
                          </div>
                          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                            <div
                              className={cn(
                                'h-full transition-all',
                                item.metaMensalCriativos > 0 &&
                                  item.criativos >= item.metaMensalCriativos
                                  ? 'bg-emerald-500'
                                  : 'bg-primary',
                              )}
                              style={{
                                width: `${Math.min(100, item.metaMensalCriativos > 0 ? (item.criativos / item.metaMensalCriativos) * 100 : 0)}%`,
                              }}
                            />
                          </div>
                          <Button
                            variant="ghost"
                            className="h-7 w-full text-xs mt-1 bg-muted/50 hover:bg-primary/10 hover:text-primary"
                            onClick={() => setModalCriativos({ isOpen: true, dentista: item })}
                          >
                            <Video className="w-3.5 h-3.5 mr-2" /> Gerenciar
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setModalDetalhes({ isOpen: true, dentista: item })}
                          title="Ver Histórico de Avaliações e Fechamentos"
                        >
                          <Eye className="w-4 h-4 text-muted-foreground hover:text-primary" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {modalCriativos.dentista && (
        <CriativosDentistaModal
          isOpen={modalCriativos.isOpen}
          onClose={() => setModalCriativos((prev) => ({ ...prev, isOpen: false }))}
          dentista={modalCriativos.dentista}
          onSuccess={refetch}
        />
      )}

      {modalDetalhes.dentista && (
        <VendasDetalhamentoDentistaModal
          isOpen={modalDetalhes.isOpen}
          onClose={() => setModalDetalhes((prev) => ({ ...prev, isOpen: false }))}
          dentistaId={modalDetalhes.dentista.id}
          dentistaNome={modalDetalhes.dentista.nome}
          periodo={periodo}
        />
      )}
    </Card>
  )
}

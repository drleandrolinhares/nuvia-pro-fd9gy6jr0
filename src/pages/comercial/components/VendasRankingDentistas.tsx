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
import { ArrowDownIcon, ArrowUpIcon, ArrowUpDown, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CriativosDentistaModal } from './CriativosDentistaModal'

export function VendasRankingDentistas() {
  const [periodo, setPeriodo] = useState('mes_atual')
  const { ranking, loading, refetch } = useRankingDentistas(periodo)

  const [modalCriativos, setModalCriativos] = useState<{
    isOpen: boolean
    dentista: RankingDentista | null
  }>({
    isOpen: false,
    dentista: null,
  })

  const [sortColumn, setSortColumn] = useState<keyof (typeof ranking)[0]>('conversao')
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
  }: {
    label: string
    column: keyof (typeof ranking)[0]
  }) => {
    return (
      <TableHead>
        <Button
          variant="ghost"
          onClick={() => handleSort(column)}
          className="h-8 px-2 flex items-center hover:bg-transparent -ml-2 font-semibold"
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
      <CardHeader className="flex flex-row items-center justify-between pb-2">
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
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px] text-center">Posição</TableHead>
                <SortableHead label="Nome do Dentista" column="nome" />
                <SortableHead label="Nº de Avaliações" column="avaliacoes" />
                <SortableHead label="Nº de Fechamentos" column="fechamentos" />
                <SortableHead label="% de Conversão" column="conversao" />
                <SortableHead label="T.M. Oportunidade" column="ticketOportunidade" />
                <SortableHead label="T.M. Conversão" column="ticketConversao" />
                <SortableHead label="Criativos Gerados" column="criativos" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    Carregando ranking...
                  </TableCell>
                </TableRow>
              ) : sortedRanking.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
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
    </Card>
  )
}

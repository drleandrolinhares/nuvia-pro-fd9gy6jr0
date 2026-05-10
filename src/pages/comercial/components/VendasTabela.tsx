import { useState } from 'react'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  FileText,
  Check,
  Edit2,
} from 'lucide-react'
import { ConfirmacaoVendaModal } from './ConfirmacaoVendaModal'
import { EditarOportunidadeModal } from './EditarOportunidadeModal'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Avaliacao } from '../types'
import { cn } from '@/lib/utils'

interface Props {
  avaliacoes: Avaliacao[]
  loading: boolean
  sortColumn: string
  sortDirection: 'asc' | 'desc'
  onSort: (col: string) => void
  page: number
  totalCount: number
  itemsPerPage: number
  setPage: React.Dispatch<React.SetStateAction<number>>
  dentistas?: any[]
  crcs?: any[]
  onSuccess?: () => void
}

export function VendasTabela({
  avaliacoes,
  loading,
  sortColumn,
  sortDirection,
  onSort,
  page,
  totalCount,
  itemsPerPage,
  setPage,
  dentistas = [],
  crcs = [],
  onSuccess = () => {},
}: Props) {
  const navigate = useNavigate()
  const [pagamentoModalOpen, setPagamentoModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [avaliacaoSelecionada, setAvaliacaoSelecionada] = useState<Avaliacao | null>(null)
  const [avaliacaoParaEditar, setAvaliacaoParaEditar] = useState<Avaliacao | null>(null)

  const getMaiorValor = (av: Avaliacao) => {
    const maxOrcamentos = av.orcamentos?.length
      ? Math.max(...av.orcamentos.map((o) => Number(o.valor)))
      : 0
    return Math.max(Number(av.valor_orcamento || 0), maxOrcamentos)
  }

  const SortableHead = ({ column, children }: { column: string; children: React.ReactNode }) => {
    const isActive = sortColumn === column
    return (
      <TableHead
        className="cursor-pointer hover:bg-white/10 text-white whitespace-nowrap"
        onClick={() => onSort(column)}
      >
        <div className="flex items-center gap-1">
          {children}
          {isActive ? (
            sortDirection === 'asc' ? (
              <ArrowUp className="w-3 h-3" />
            ) : (
              <ArrowDown className="w-3 h-3" />
            )
          ) : (
            <ArrowUpDown className="w-3 h-3 opacity-50" />
          )}
        </div>
      </TableHead>
    )
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  const formatarDataLocal = (dataStr: string | null | undefined) => {
    if (!dataStr) return '-'
    const [year, month, day] = dataStr.substring(0, 10).split('-')
    if (year && month && day) return `${day}/${month}/${year}`
    return dataStr
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader className="bg-[#1e3a5f]">
            <TableRow className="hover:bg-[#1e3a5f]">
              <TableHead className="text-white min-w-[150px]">Paciente</TableHead>
              <SortableHead column="data_avaliacao">Data Avaliação</SortableHead>
              <SortableHead column="data_fechamento">Data Venda</SortableHead>
              <SortableHead column="valor_orcamento">Valor</SortableHead>
              <TableHead className="text-white text-right">Entrada</TableHead>
              <TableHead className="text-white text-center">%</TableHead>
              <TableHead className="text-white">Avaliador</TableHead>
              <SortableHead column="status">Status</SortableHead>
              <SortableHead column="temperatura_lead">Temperatura</SortableHead>
              <TableHead className="w-[140px] text-white text-right pr-4">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : avaliacoes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  Nenhuma oportunidade encontrada.
                </TableCell>
              </TableRow>
            ) : (
              avaliacoes.map((av) => (
                <TableRow
                  key={av.id}
                  className="cursor-pointer even:bg-[#f5f5f5] odd:bg-white dark:even:bg-slate-800/50 dark:odd:bg-transparent hover:bg-muted/50 transition-colors"
                  onClick={(e) => {
                    if (!(e.target as HTMLElement).closest('.actions-cell')) {
                      navigate(`/comercial/pacientes?id=${av.paciente_id}`)
                    }
                  }}
                >
                  <TableCell className="font-medium">{av.pacientes?.nome || 'N/A'}</TableCell>
                  <TableCell>{formatarDataLocal(av.data_avaliacao)}</TableCell>
                  <TableCell>{formatarDataLocal(av.data_fechamento)}</TableCell>
                  <TableCell>{formatCurrency(getMaiorValor(av))}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(av.valor_entrada || 0)}
                  </TableCell>
                  <TableCell className="text-center font-medium text-slate-700 dark:text-slate-300">
                    {av.valor_entrada && getMaiorValor(av) > 0
                      ? Math.round((av.valor_entrada / getMaiorValor(av)) * 100)
                      : 0}
                    %
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {av.dentistas_avaliadores?.nome || av.crc_comercial?.nome || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        'capitalize whitespace-nowrap',
                        av.status === 'venda_concretizada' && 'bg-green-500/10 text-green-500',
                      )}
                    >
                      {av.status?.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        av.temperatura_lead === 'quente'
                          ? 'text-red-500 border-red-500 bg-red-500/10'
                          : av.temperatura_lead === 'morno'
                            ? 'text-amber-500 border-amber-500 bg-amber-500/10'
                            : 'text-blue-500 border-blue-500 bg-blue-500/10',
                      )}
                    >
                      {av.temperatura_lead}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className="actions-cell text-right pr-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-2">
                      {av.status !== 'Fechada em Comercial' &&
                        av.status !== 'Fechada em Avaliação' &&
                        av.status !== 'venda_concretizada' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 dark:border-green-500/50 dark:hover:bg-green-950/30 dark:text-green-500"
                            onClick={(e) => {
                              e.stopPropagation()
                              setAvaliacaoSelecionada(av)
                              setPagamentoModalOpen(true)
                            }}
                            title="Efetivar Venda"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Efetivar Venda</span>
                          </Button>
                        )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setAvaliacaoParaEditar(av)
                              setEditModalOpen(true)
                            }}
                          >
                            <Edit2 className="mr-2 h-4 w-4" /> Editar Oportunidade
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => navigate(`/comercial/pacientes?id=${av.paciente_id}`)}
                          >
                            <FileText className="mr-2 h-4 w-4" /> Ver Ficha
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
          <PaginationItem>
            <span className="text-sm text-muted-foreground px-4">
              Página {page} de {Math.max(1, Math.ceil(totalCount / itemsPerPage))}
            </span>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              onClick={() => setPage((p) => Math.min(Math.ceil(totalCount / itemsPerPage), p + 1))}
              className={
                page >= Math.ceil(totalCount / itemsPerPage)
                  ? 'pointer-events-none opacity-50'
                  : 'cursor-pointer'
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      {avaliacaoSelecionada && (
        <ConfirmacaoVendaModal
          isOpen={pagamentoModalOpen}
          onClose={() => {
            setPagamentoModalOpen(false)
            setAvaliacaoSelecionada(null)
          }}
          avaliacao={avaliacaoSelecionada}
        />
      )}

      {avaliacaoParaEditar && (
        <EditarOportunidadeModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false)
            setAvaliacaoParaEditar(null)
          }}
          avaliacao={avaliacaoParaEditar}
          dentistas={dentistas}
          crcs={crcs}
          onSuccess={onSuccess}
        />
      )}
    </div>
  )
}

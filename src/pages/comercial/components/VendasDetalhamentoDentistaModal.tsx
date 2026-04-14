import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format, parseISO, startOfMonth, endOfMonth, startOfDay, endOfDay, subDays } from 'date-fns'
import { supabase } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Props {
  isOpen: boolean
  onClose: () => void
  dentistaId: string
  dentistaNome: string
  periodo: string
}

export function VendasDetalhamentoDentistaModal({
  isOpen,
  onClose,
  dentistaId,
  dentistaNome,
  periodo,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [avaliacoes, setAvaliacoes] = useState<any[]>([])
  const [vendas, setVendas] = useState<any[]>([])

  useEffect(() => {
    if (!isOpen || !dentistaId) return

    let isMounted = true

    async function fetchData() {
      setLoading(true)
      try {
        let sd, ed
        const today = new Date()
        switch (periodo) {
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
          case 'todos':
            sd = null
            ed = null
            break
          default:
            if (periodo.match(/^\d{4}-\d{2}$/)) {
              const parsedDate = parseISO(`${periodo}-01`)
              sd = startOfMonth(parsedDate)
              ed = endOfMonth(parsedDate)
            }
            break
        }

        let avQuery = supabase
          .from('avaliacoes')
          .select(`
          id, data_avaliacao, valor_orcamento, status, temperatura_lead, tipo_tratamento,
          pacientes (nome)
        `)
          .eq('dentista_avaliador_id', dentistaId)

        if (sd && ed) {
          avQuery = avQuery
            .gte('data_avaliacao', format(sd, 'yyyy-MM-dd'))
            .lte('data_avaliacao', format(ed, 'yyyy-MM-dd'))
        }

        let vdQuery = supabase
          .from('vendas_confirmadas')
          .select(`
          id, data_fechamento, valor_tratamento, tratamento, paciente_nome
        `)
          .eq('dentista_avaliador', dentistaId)

        if (sd && ed) {
          vdQuery = vdQuery
            .gte('data_fechamento', format(sd, 'yyyy-MM-dd'))
            .lte('data_fechamento', format(ed, 'yyyy-MM-dd'))
        }

        // Order by date descending
        avQuery = avQuery.order('data_avaliacao', { ascending: false })
        vdQuery = vdQuery.order('data_fechamento', { ascending: false })

        const [avRes, vdRes] = await Promise.all([avQuery, vdQuery])

        if (isMounted) {
          setAvaliacoes(avRes.data || [])
          setVendas(vdRes.data || [])
        }
      } catch (err) {
        console.error(err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [isOpen, dentistaId, periodo])

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`)
    return format(d, 'dd/MM/yyyy')
  }

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl">Detalhamento: {dentistaNome}</DialogTitle>
          <DialogDescription>
            Histórico de avaliações e fechamentos do período selecionado.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex-1 flex items-center justify-center min-h-[300px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="avaliacoes" className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="avaliacoes">Avaliações ({avaliacoes.length})</TabsTrigger>
              <TabsTrigger value="fechamentos">Fechamentos ({vendas.length})</TabsTrigger>
            </TabsList>

            <TabsContent
              value="avaliacoes"
              className="flex-1 min-h-0 mt-4 border rounded-md overflow-auto"
            >
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Tratamento</TableHead>
                    <TableHead>Valor Orçado</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {avaliacoes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                        Nenhuma avaliação encontrada no período.
                      </TableCell>
                    </TableRow>
                  ) : (
                    avaliacoes.map((av) => (
                      <TableRow key={av.id}>
                        <TableCell className="whitespace-nowrap">
                          {formatDate(av.data_avaliacao)}
                        </TableCell>
                        <TableCell className="font-medium">{av.pacientes?.nome || '-'}</TableCell>
                        <TableCell className="capitalize">{av.tipo_tratamento || '-'}</TableCell>
                        <TableCell>{formatCurrency(av.valor_orcamento)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {av.status?.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent
              value="fechamentos"
              className="flex-1 min-h-0 mt-4 border rounded-md overflow-auto"
            >
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Tratamento</TableHead>
                    <TableHead>Valor Fechado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                        Nenhum fechamento encontrado no período.
                      </TableCell>
                    </TableRow>
                  ) : (
                    vendas.map((vd) => (
                      <TableRow key={vd.id}>
                        <TableCell className="whitespace-nowrap">
                          {formatDate(vd.data_fechamento)}
                        </TableCell>
                        <TableCell className="font-medium">{vd.paciente_nome}</TableCell>
                        <TableCell className="capitalize">{vd.tratamento || '-'}</TableCell>
                        <TableCell className="font-bold text-primary">
                          {formatCurrency(vd.valor_tratamento)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}

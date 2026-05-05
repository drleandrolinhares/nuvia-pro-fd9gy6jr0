import { useState, useEffect } from 'react'
import { format, parseISO, startOfDay, endOfDay, subDays, startOfMonth, endOfMonth } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase/client'
import { useCache } from '@/hooks/use-cache'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function HistoricoVendasModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const [periodo, setPeriodo] = useState('mes_atual')
  const [vendas, setVendas] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { dataVersion } = useCache()

  useEffect(() => {
    if (!open) return

    const fetchHistory = async () => {
      setLoading(true)

      const today = new Date()
      let sd: Date | undefined
      let ed: Date | undefined

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
      }

      const sdStr = sd ? format(sd, 'yyyy-MM-dd') : undefined
      const edStr = ed ? format(ed, 'yyyy-MM-dd') : undefined

      let qConf = supabase.from('vendas_confirmadas').select(`
          id, 
          paciente_nome, 
          data_fechamento, 
          valor_tratamento, 
          tratamento, 
          oportunidade_id,
          dentistas_avaliadores(nome)
        `)

      if (sdStr && edStr) {
        qConf = qConf.gte('data_fechamento', sdStr).lte('data_fechamento', edStr)
      }

      const { data } = await qConf

      const combinadas = []

      if (data) {
        data.forEach((v: any) => {
          combinadas.push({
            id: v.id,
            nome: v.paciente_nome || 'N/A',
            data: v.data_fechamento,
            valor: Number(v.valor_tratamento || 0),
            origem: v.oportunidade_id ? 'Fluxo Comercial' : 'Venda Avulsa',
            dentista: v.dentistas_avaliadores?.nome || '-',
          })
        })
      }

      combinadas.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())

      setVendas(combinadas)
      setLoading(false)
    }

    fetchHistory()
  }, [open, periodo, dataVersion])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <DialogTitle>Histórico de Vendas Consolidado</DialogTitle>
            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hoje">Hoje</SelectItem>
                <SelectItem value="ontem">Ontem</SelectItem>
                <SelectItem value="ultimos_7">Últimos 7 dias</SelectItem>
                <SelectItem value="ultimos_15">Últimos 15 dias</SelectItem>
                <SelectItem value="mes_atual">Este Mês</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </DialogHeader>

        <div className="rounded-md border mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Dentista Avaliador</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : vendas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                    Nenhuma venda encontrada no período.
                  </TableCell>
                </TableRow>
              ) : (
                vendas.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>{format(parseISO(v.data), 'dd/MM/yyyy')}</TableCell>
                    <TableCell className="font-medium">{v.nome}</TableCell>
                    <TableCell>{v.dentista}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          v.origem === 'Fluxo Comercial'
                            ? 'bg-amber-500/10 text-amber-600'
                            : 'bg-emerald-500/10 text-emerald-600'
                        }
                      >
                        {v.origem}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(v.valor)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
}

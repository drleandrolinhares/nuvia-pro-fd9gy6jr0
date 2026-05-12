import { useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Compass } from 'lucide-react'

export function BussolaComercial({
  origens,
  dados,
  mesReferencia,
}: {
  origens: any[]
  dados: any[]
  mesReferencia: string
}) {
  const mesFormatado = useMemo(() => {
    try {
      const data = parseISO(`${mesReferencia}-01`)
      return format(data, 'MMMM yyyy', { locale: ptBR }).toUpperCase()
    } catch {
      return mesReferencia
    }
  }, [mesReferencia])

  const dadosAjustados = useMemo(() => {
    return (dados || []).map((d: any) => {
      const fechamentos = Number(d.fechamentos_qtde_realizado || 0)
      return {
        ...d,
        leads_realizado: Math.max(Number(d.leads_realizado || 0), fechamentos),
        agendamentos_realizado: Math.max(Number(d.agendamentos_realizado || 0), fechamentos),
        comparecimentos_realizado: Math.max(Number(d.comparecimentos_realizado || 0), fechamentos),
      }
    })
  }, [dados])

  const matriz = useMemo(() => {
    return origens
      .map((origem) => {
        const d = dadosAjustados.find((x) => x.origem_id === origem.id) || {
          leads_realizado: 0,
          agendamentos_realizado: 0,
          comparecimentos_realizado: 0,
          fechamentos_qtde_realizado: 0,
          fechamentos_valor_realizado: 0,
          investimento: 0,
        }

        const txAgendamento =
          d.leads_realizado > 0 ? (d.agendamentos_realizado / d.leads_realizado) * 100 : 0
        const txComparecimento =
          d.agendamentos_realizado > 0
            ? (d.comparecimentos_realizado / d.agendamentos_realizado) * 100
            : 0
        const txConversao =
          d.comparecimentos_realizado > 0
            ? (d.fechamentos_qtde_realizado / d.comparecimentos_realizado) * 100
            : 0
        const ticketMedio =
          d.fechamentos_qtde_realizado > 0
            ? d.fechamentos_valor_realizado / d.fechamentos_qtde_realizado
            : 0
        const roas = d.investimento > 0 ? d.fechamentos_valor_realizado / d.investimento : 0

        const score = d.fechamentos_valor_realizado + txConversao * 100

        return {
          id: origem.id,
          nome: origem.nome,
          leads: d.leads_realizado,
          agendamentos: d.agendamentos_realizado,
          comparecimentos: d.comparecimentos_realizado,
          vendasQtd: d.fechamentos_qtde_realizado,
          vendasValor: d.fechamentos_valor_realizado,
          investimento: d.investimento,
          txAgendamento,
          txComparecimento,
          txConversao,
          ticketMedio,
          roas,
          score,
        }
      })
      .sort((a, b) => b.score - a.score)
  }, [origens, dadosAjustados])

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-xl text-white flex items-center gap-2">
            <Compass className="w-6 h-6 text-amber-500" />
            Matriz de Performance por Origem ({mesFormatado})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-slate-800 overflow-x-auto bg-slate-950/50">
            <Table>
              <TableHeader className="bg-slate-900">
                <TableRow className="border-slate-800 hover:bg-slate-900">
                  <TableHead className="text-slate-300 font-bold whitespace-nowrap">
                    Ranking
                  </TableHead>
                  <TableHead className="text-slate-300 font-bold">Origem</TableHead>
                  <TableHead className="text-right text-slate-300 font-bold">Leads</TableHead>
                  <TableHead className="text-right text-slate-300 font-bold whitespace-nowrap">
                    Agend. (%)
                  </TableHead>
                  <TableHead className="text-right text-slate-300 font-bold whitespace-nowrap">
                    Comp. (%)
                  </TableHead>
                  <TableHead className="text-right text-slate-300 font-bold whitespace-nowrap">
                    Conv. (%)
                  </TableHead>
                  <TableHead className="text-right text-slate-300 font-bold whitespace-nowrap">
                    Vendas (Qtd)
                  </TableHead>
                  <TableHead className="text-right text-slate-300 font-bold whitespace-nowrap">
                    Faturamento
                  </TableHead>
                  <TableHead className="text-right text-slate-300 font-bold whitespace-nowrap">
                    Ticket Médio
                  </TableHead>
                  <TableHead className="text-right text-slate-300 font-bold">ROAS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matriz.map((row, idx) => (
                  <TableRow
                    key={row.id}
                    className="border-slate-800 hover:bg-slate-800/50 transition-colors"
                  >
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          'font-bold',
                          idx === 0
                            ? 'bg-amber-500/20 text-amber-500 border-amber-500/30'
                            : idx === 1
                              ? 'bg-slate-300/20 text-slate-300 border-slate-300/30'
                              : idx === 2
                                ? 'bg-orange-700/20 text-orange-700 border-orange-700/30'
                                : 'bg-slate-800 text-slate-500 border-slate-700',
                        )}
                      >
                        #{idx + 1}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-slate-200 whitespace-nowrap">
                      {row.nome}
                    </TableCell>
                    <TableCell className="text-right text-slate-300 font-medium">
                      {row.leads}
                    </TableCell>
                    <TableCell className="text-right text-slate-300">
                      {row.txAgendamento.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right text-slate-300">
                      {row.txComparecimento.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right text-emerald-400 font-bold">
                      {row.txConversao.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right text-slate-300 font-medium">
                      {row.vendasQtd}
                    </TableCell>
                    <TableCell className="text-right font-bold text-emerald-500">
                      {formatCurrency(row.vendasValor)}
                    </TableCell>
                    <TableCell className="text-right text-slate-300 font-medium">
                      {formatCurrency(row.ticketMedio)}
                    </TableCell>
                    <TableCell className="text-right text-slate-300 font-bold">
                      {row.investimento > 0 ? `${row.roas.toFixed(2)}x` : '-'}
                    </TableCell>
                  </TableRow>
                ))}
                {matriz.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-slate-500">
                      Nenhum dado encontrado para o período selecionado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

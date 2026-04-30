import { useState, useEffect } from 'react'
import { getRelatorioPedidos } from '@/services/pedidos'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { BarChart3, Search } from 'lucide-react'

export default function RelatoriosPedidos() {
  const { toast } = useToast()
  const [dataInicio, setDataInicio] = useState(
    format(new Date(new Date().setDate(1)), 'yyyy-MM-dd'),
  )
  const [dataFim, setDataFim] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [relatorio, setRelatorio] = useState<any[]>([])

  const load = async () => {
    try {
      const data = await getRelatorioPedidos(dataInicio, dataFim)

      const agg = data.reduce((acc: any, curr: any) => {
        const uid = curr.usuario_id
        if (!acc[uid]) {
          acc[uid] = {
            nome: curr.usuario?.nome || 'Desconhecido',
            total_pedidos: 0,
            total_itens: 0,
            valor_total: 0,
          }
        }
        acc[uid].total_pedidos += 1
        acc[uid].valor_total += Number(curr.valor_total || 0)
        curr.itens?.forEach((i: any) => (acc[uid].total_itens += i.quantidade))
        return acc
      }, {})

      setRelatorio(Object.values(agg).sort((a: any, b: any) => b.valor_total - a.valor_total))
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl items-end sm:items-center">
        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-bold uppercase">Data Inicial</label>
            <Input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="bg-slate-950 border-slate-800 [color-scheme:dark]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-bold uppercase">Data Final</label>
            <Input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="bg-slate-950 border-slate-800 [color-scheme:dark]"
            />
          </div>
        </div>
        <Button
          onClick={load}
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold w-full sm:w-auto"
        >
          <Search className="w-4 h-4 mr-2" /> Buscar
        </Button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-white uppercase tracking-wider text-sm">
            Ranking de Consumo por Colaborador
          </h3>
        </div>
        <Table>
          <TableHeader className="bg-slate-950">
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead className="text-slate-400">Colaborador</TableHead>
              <TableHead className="text-slate-400 text-center">Pedidos Realizados</TableHead>
              <TableHead className="text-slate-400 text-center">Total Itens (UN)</TableHead>
              <TableHead className="text-slate-400 text-right">Valor Estimado Consumido</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-slate-900">
            {relatorio.length === 0 ? (
              <TableRow className="border-slate-800">
                <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                  Nenhum dado encontrado no período.
                </TableCell>
              </TableRow>
            ) : (
              relatorio.map((r, i) => (
                <TableRow key={i} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell className="font-medium text-slate-200">{r.nome}</TableCell>
                  <TableCell className="text-center text-slate-300">{r.total_pedidos}</TableCell>
                  <TableCell className="text-center text-slate-300">{r.total_itens}</TableCell>
                  <TableCell className="text-right font-bold text-amber-500">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      r.valor_total,
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

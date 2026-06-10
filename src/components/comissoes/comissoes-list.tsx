import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export function ComissoesList({ tipo }: { tipo: 'dentista' | 'crc' }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [vendas, setVendas] = useState<any[]>([])

  useEffect(() => {
    loadVendas()
  }, [tipo])

  const loadVendas = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('vendas_confirmadas')
        .select(`
          id,
          paciente_nome,
          data_fechamento,
          valor_tratamento,
          valor_entrada,
          percentual_entrada,
          percentual_comissao,
          valor_comissao,
          status_comissao,
          dentistas_avaliadores(nome),
          crc_comercial(nome)
        `)
        .order('data_fechamento', { ascending: false })

      if (tipo === 'dentista') {
        query = query.not('dentista_avaliador', 'is', null)
      } else {
        query = query.not('crc', 'is', null)
      }

      const { data, error } = await query
      if (error) throw error
      setVendas(data || [])
    } catch (err: any) {
      toast({
        title: 'Erro ao carregar comissões',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('vendas_confirmadas')
        .update({ status_comissao: status })
        .eq('id', id)

      if (error) throw error
      toast({
        title: 'Status atualizado',
        description: 'A situação da comissão foi alterada com sucesso.',
      })
      loadVendas()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const formatCurrency = (val: number | null | undefined) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

  if (loading)
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin text-amber-500 w-8 h-8" />
      </div>
    )

  return (
    <div className="rounded-md border border-slate-800 overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-950/50">
          <TableRow className="border-slate-800">
            <TableHead className="text-slate-400">Data</TableHead>
            <TableHead className="text-slate-400">Paciente</TableHead>
            <TableHead className="text-slate-400">
              {tipo === 'dentista' ? 'Dentista' : 'CRC'}
            </TableHead>
            <TableHead className="text-slate-400 text-right">Valor Trat.</TableHead>
            <TableHead className="text-slate-400 text-right">Entrada</TableHead>
            <TableHead className="text-slate-400 text-center">% Comissão</TableHead>
            <TableHead className="text-slate-400 text-right">Vlr. Comissão</TableHead>
            <TableHead className="text-slate-400 text-center">Status</TableHead>
            <TableHead className="text-slate-400 text-right">Ação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vendas.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-slate-500 py-8">
                Nenhuma comissão encontrada para este grupo.
              </TableCell>
            </TableRow>
          ) : (
            vendas.map((venda) => (
              <TableRow
                key={venda.id}
                className="border-slate-800 hover:bg-slate-800/50 transition-colors"
              >
                <TableCell className="text-slate-300 font-medium">
                  {new Date(venda.data_fechamento + 'T00:00:00').toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell className="text-slate-300">{venda.paciente_nome}</TableCell>
                <TableCell className="text-slate-300">
                  {tipo === 'dentista'
                    ? venda.dentistas_avaliadores?.nome || '-'
                    : venda.crc_comercial?.nome || '-'}
                </TableCell>
                <TableCell className="text-slate-300 text-right">
                  {formatCurrency(venda.valor_tratamento)}
                </TableCell>
                <TableCell className="text-slate-300 text-right">
                  <div className="flex flex-col items-end">
                    <span>{formatCurrency(venda.valor_entrada)}</span>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      {Number(venda.percentual_entrada).toFixed(1)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-slate-300 text-center">
                  {venda.percentual_comissao ? (
                    <Badge variant="outline" className="border-amber-500/30 text-amber-500">
                      {Number(venda.percentual_comissao).toFixed(1)}%
                    </Badge>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell className="text-emerald-400 font-semibold text-right">
                  {formatCurrency(venda.valor_comissao)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant="outline"
                    className={
                      venda.status_comissao === 'pago'
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
                        : 'border-amber-500/30 bg-amber-500/10 text-amber-500'
                    }
                  >
                    {venda.status_comissao === 'pago' ? 'Pago' : 'Em Aberto'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Select
                    value={venda.status_comissao || 'em_aberto'}
                    onValueChange={(val) => updateStatus(venda.id, val)}
                  >
                    <SelectTrigger className="w-[130px] h-8 bg-slate-900 border-slate-700 text-xs ml-auto shadow-sm">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      <SelectItem
                        value="em_aberto"
                        className="text-amber-500 focus:bg-amber-500/10"
                      >
                        Em Aberto
                      </SelectItem>
                      <SelectItem value="pago" className="text-emerald-500 focus:bg-emerald-500/10">
                        Pago
                      </SelectItem>
                      <SelectItem value="cancelado" className="text-red-400 focus:bg-red-400/10">
                        Cancelado
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

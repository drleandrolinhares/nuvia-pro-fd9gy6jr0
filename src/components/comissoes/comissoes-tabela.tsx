import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import type { ComissaoVenda } from '@/services/comissoes-dashboard'

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

const formatDate = (d: string | null) => {
  if (!d) return '-'
  const [y, m, day] = d.substring(0, 10).split('-')
  return `${day}/${m}/${y}`
}

export function ComissoesTabela({
  vendas,
  tipo,
  loading,
}: {
  vendas: ComissaoVenda[]
  tipo: 'dentista' | 'crc'
  loading: boolean
}) {
  const filtered = vendas.filter((v) => (tipo === 'dentista' ? v.dentista_avaliador : v.crc))

  const totalComissao = filtered.reduce(
    (acc, v) => acc + (tipo === 'dentista' ? v.valor_comissao_dentista : v.valor_comissao_crc),
    0,
  )

  const totalVendas = filtered.reduce((acc, v) => acc + v.valor_tratamento, 0)

  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 border-slate-200">
            <TableHead className="text-slate-700 font-semibold">Data</TableHead>
            <TableHead className="text-slate-700 font-semibold">Paciente</TableHead>
            <TableHead className="text-slate-700 font-semibold">
              {tipo === 'dentista' ? 'Dentista' : 'CRC'}
            </TableHead>
            <TableHead className="text-slate-700 font-semibold text-right">Valor Trat.</TableHead>
            <TableHead className="text-slate-700 font-semibold text-right">Entrada</TableHead>
            <TableHead className="text-slate-700 font-semibold text-center">% Ent.</TableHead>
            <TableHead className="text-slate-700 font-semibold text-center">% Comis.</TableHead>
            <TableHead className="text-slate-700 font-semibold text-right">Vlr. Comissão</TableHead>
            <TableHead className="text-slate-700 font-semibold">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-amber-500 mx-auto" />
              </TableCell>
            </TableRow>
          ) : filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-slate-500 py-8">
                Nenhuma comissão encontrada para este período.
              </TableCell>
            </TableRow>
          ) : (
            <>
              {filtered.map((v) => (
                <TableRow key={v.id} className="border-slate-200 hover:bg-slate-50">
                  <TableCell className="text-slate-700">{formatDate(v.data_fechamento)}</TableCell>
                  <TableCell className="font-medium text-slate-950">{v.paciente_nome}</TableCell>
                  <TableCell className="text-slate-700">
                    {tipo === 'dentista' ? v.dentista_nome || '-' : v.crc_nome || '-'}
                  </TableCell>
                  <TableCell className="text-right text-slate-700">
                    {formatCurrency(v.valor_tratamento)}
                  </TableCell>
                  <TableCell className="text-right text-slate-700">
                    {formatCurrency(v.valor_entrada)}
                  </TableCell>
                  <TableCell className="text-center text-slate-700">
                    {v.percentual_entrada.toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-center font-medium text-slate-950">
                    {(tipo === 'dentista'
                      ? v.percentual_comissao_dentista
                      : v.percentual_comissao_crc
                    ).toFixed(1)}
                    %
                  </TableCell>
                  <TableCell className="text-right font-semibold text-emerald-600">
                    {formatCurrency(
                      tipo === 'dentista' ? v.valor_comissao_dentista : v.valor_comissao_crc,
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        v.status_comissao === 'pago'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }
                    >
                      {v.status_comissao === 'pago' ? 'Pago' : 'Em Aberto'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-slate-50 border-slate-200 font-bold">
                <TableCell colSpan={3} className="text-right text-slate-950">
                  Total ({filtered.length} vendas):
                </TableCell>
                <TableCell className="text-right text-slate-950">
                  {formatCurrency(totalVendas)}
                </TableCell>
                <TableCell colSpan={3} className="text-right text-slate-950">
                  Comissão Total:
                </TableCell>
                <TableCell className="text-right text-emerald-600">
                  {formatCurrency(totalComissao)}
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

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
  profissionalFilter = 'todos',
}: {
  vendas: ComissaoVenda[]
  tipo: 'dentista' | 'crc'
  loading: boolean
  profissionalFilter?: string
}) {
  const filtered = vendas.filter((v) => {
    const matchesTipo = tipo === 'dentista' ? v.dentista_avaliador : v.crc
    if (!matchesTipo) return false
    if (profissionalFilter && profissionalFilter !== 'todos') {
      return tipo === 'dentista'
        ? v.dentista_avaliador === profissionalFilter
        : v.crc === profissionalFilter
    }
    return true
  })

  const totalComissao = filtered.reduce(
    (acc, v) => acc + (tipo === 'dentista' ? v.valor_comissao_dentista : v.valor_comissao_crc),
    0,
  )

  const totalVendas = filtered.reduce((acc, v) => acc + v.valor_tratamento, 0)

  return (
    <div className="rounded-lg border border-slate-800 overflow-hidden bg-slate-900">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-800/80 border-slate-800 hover:bg-slate-800/80">
            <TableHead className="text-slate-300 font-semibold">Data</TableHead>
            <TableHead className="text-slate-300 font-semibold">Paciente</TableHead>
            <TableHead className="text-slate-300 font-semibold">
              {tipo === 'dentista' ? 'Dentista' : 'CRC'}
            </TableHead>
            <TableHead className="text-slate-300 font-semibold text-right">Valor Trat.</TableHead>
            <TableHead className="text-slate-300 font-semibold text-right">Entrada</TableHead>
            <TableHead className="text-slate-300 font-semibold text-center">% Ent.</TableHead>
            <TableHead className="text-slate-300 font-semibold text-center">% Comis.</TableHead>
            <TableHead className="text-slate-300 font-semibold text-right">Vlr. Comissão</TableHead>
            <TableHead className="text-slate-300 font-semibold">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow className="border-slate-800">
              <TableCell colSpan={9} className="text-center py-8 bg-slate-900">
                <Loader2 className="w-6 h-6 animate-spin text-amber-500 mx-auto" />
              </TableCell>
            </TableRow>
          ) : filtered.length === 0 ? (
            <TableRow className="border-slate-800">
              <TableCell colSpan={9} className="text-center text-slate-400 py-8 bg-slate-900">
                Nenhuma comissão encontrada para este período.
              </TableCell>
            </TableRow>
          ) : (
            <>
              {filtered.map((v) => (
                <TableRow
                  key={v.id}
                  className="border-slate-800 hover:bg-slate-800/50 bg-slate-900"
                >
                  <TableCell className="text-slate-300">{formatDate(v.data_fechamento)}</TableCell>
                  <TableCell className="font-medium text-white">{v.paciente_nome}</TableCell>
                  <TableCell className="text-slate-300">
                    {tipo === 'dentista' ? v.dentista_nome || '-' : v.crc_nome || '-'}
                  </TableCell>
                  <TableCell className="text-right text-slate-300">
                    {formatCurrency(v.valor_tratamento)}
                  </TableCell>
                  <TableCell className="text-right text-slate-300">
                    {formatCurrency(v.valor_entrada)}
                  </TableCell>
                  <TableCell className="text-center text-slate-300">
                    {v.percentual_entrada.toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-center font-medium text-amber-400">
                    {(tipo === 'dentista'
                      ? v.percentual_comissao_dentista
                      : v.percentual_comissao_crc
                    ).toFixed(1)}
                    %
                  </TableCell>
                  <TableCell className="text-right font-semibold text-emerald-400">
                    {formatCurrency(
                      tipo === 'dentista' ? v.valor_comissao_dentista : v.valor_comissao_crc,
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        v.status_comissao === 'pago'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }
                    >
                      {v.status_comissao === 'pago' ? 'Pago' : 'Em Aberto'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-slate-800/80 border-slate-800 font-bold">
                <TableCell colSpan={3} className="text-right text-white">
                  Total ({filtered.length} vendas):
                </TableCell>
                <TableCell className="text-right text-white">
                  {formatCurrency(totalVendas)}
                </TableCell>
                <TableCell colSpan={3} className="text-right text-white">
                  Comissão Total:
                </TableCell>
                <TableCell className="text-right text-emerald-400">
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

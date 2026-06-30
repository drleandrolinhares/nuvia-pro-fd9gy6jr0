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

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 dark:bg-slate-900/50">
            <TableHead>Data</TableHead>
            <TableHead>Paciente</TableHead>
            <TableHead>{tipo === 'dentista' ? 'Dentista' : 'CRC'}</TableHead>
            <TableHead className="text-right">Valor Trat.</TableHead>
            <TableHead className="text-right">Entrada</TableHead>
            <TableHead className="text-center">% Ent.</TableHead>
            <TableHead className="text-center">% Comis.</TableHead>
            <TableHead className="text-right">Vlr. Comissão</TableHead>
            <TableHead>Status</TableHead>
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
                <TableRow key={v.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                  <TableCell>{formatDate(v.data_fechamento)}</TableCell>
                  <TableCell className="font-medium">{v.paciente_nome}</TableCell>
                  <TableCell>
                    {tipo === 'dentista' ? v.dentista_nome || '-' : v.crc_nome || '-'}
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(v.valor_tratamento)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(v.valor_entrada)}</TableCell>
                  <TableCell className="text-center">{v.percentual_entrada.toFixed(1)}%</TableCell>
                  <TableCell className="text-center font-medium">
                    {(tipo === 'dentista'
                      ? v.percentual_comissao_dentista
                      : v.percentual_comissao_crc
                    ).toFixed(1)}
                    %
                  </TableCell>
                  <TableCell className="text-right font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(
                      tipo === 'dentista' ? v.valor_comissao_dentista : v.valor_comissao_crc,
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        v.status_comissao === 'pago'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }
                    >
                      {v.status_comissao === 'pago' ? 'Pago' : 'Em Aberto'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-slate-100 dark:bg-slate-800/50 font-bold">
                <TableCell colSpan={7} className="text-right">
                  Total:
                </TableCell>
                <TableCell className="text-right text-emerald-600 dark:text-emerald-400">
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

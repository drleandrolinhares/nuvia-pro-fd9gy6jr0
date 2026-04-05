import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase/client'
import { startOfMonth, startOfYear, startOfQuarter } from 'date-fns'
import { Loader2 } from 'lucide-react'

export function RelatorioComissoes({
  isAdmin,
  dentistaId,
  crcId,
}: {
  isAdmin: boolean
  dentistaId: string | null
  crcId: string | null
}) {
  const [periodo, setPeriodo] = useState('mes')
  const [dados, setDados] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDados()
  }, [periodo, isAdmin, dentistaId, crcId])

  const fetchDados = async () => {
    setLoading(true)
    try {
      let dataInicio = startOfMonth(new Date())
      if (periodo === 'trimestre') dataInicio = startOfQuarter(new Date())
      if (periodo === 'ano') dataInicio = startOfYear(new Date())

      const inicioStr = dataInicio.toISOString()

      // Fetch dentista
      let queryDentista = supabase
        .from('comissoes_dentista')
        .select(`
        id, data_calculo, percentual_faixa, valor_comissao, status_pagamento,
        dentista_avaliador_id, dentistas_avaliadores(nome),
        vendas_concretizadas(data_concretizacao, valor_total_tratamento, avaliacoes(pacientes(nome)))
      `)
        .gte('data_calculo', inicioStr)

      if (!isAdmin && dentistaId) {
        queryDentista = queryDentista.eq('dentista_avaliador_id', dentistaId)
      } else if (!isAdmin && !dentistaId) {
        queryDentista = queryDentista.eq('id', '00000000-0000-0000-0000-000000000000') // impossible
      }

      // Fetch crc
      let queryCrc = supabase
        .from('comissoes_crc')
        .select(`
        id, data_calculo, percentual_faixa, valor_comissao, status_pagamento,
        crc_comercial_id, crc_comercial(nome),
        vendas_concretizadas(data_concretizacao, valor_total_tratamento, avaliacoes(pacientes(nome)))
      `)
        .gte('data_calculo', inicioStr)

      if (!isAdmin && crcId) {
        queryCrc = queryCrc.eq('crc_comercial_id', crcId)
      } else if (!isAdmin && !crcId) {
        queryCrc = queryCrc.eq('id', '00000000-0000-0000-0000-000000000000')
      }

      const [resDentista, resCrc] = await Promise.all([queryDentista, queryCrc])

      const formatado: any[] = []

      if (resDentista.data) {
        for (const item of resDentista.data as any[]) {
          const dentistaNome = Array.isArray(item.dentistas_avaliadores)
            ? item.dentistas_avaliadores[0]?.nome
            : item.dentistas_avaliadores?.nome
          const venda = Array.isArray(item.vendas_concretizadas)
            ? item.vendas_concretizadas[0]
            : item.vendas_concretizadas
          const avaliacao = venda?.avaliacoes
            ? Array.isArray(venda.avaliacoes)
              ? venda.avaliacoes[0]
              : venda.avaliacoes
            : null
          const pacienteNome = avaliacao?.pacientes
            ? Array.isArray(avaliacao.pacientes)
              ? avaliacao.pacientes[0]?.nome
              : avaliacao.pacientes?.nome
            : 'N/A'

          formatado.push({
            id: item.id,
            tipo: 'Dentista Avaliador',
            profissional: dentistaNome || 'N/A',
            data: venda?.data_concretizacao || item.data_calculo,
            paciente: pacienteNome,
            valor_venda: venda?.valor_total_tratamento || 0,
            percentual: item.percentual_faixa || 0,
            valor_comissao: item.valor_comissao || 0,
            status: item.status_pagamento || 'em_aberto',
          })
        }
      }

      if (resCrc.data) {
        for (const item of resCrc.data as any[]) {
          const crcNome = Array.isArray(item.crc_comercial)
            ? item.crc_comercial[0]?.nome
            : item.crc_comercial?.nome
          const venda = Array.isArray(item.vendas_concretizadas)
            ? item.vendas_concretizadas[0]
            : item.vendas_concretizadas
          const avaliacao = venda?.avaliacoes
            ? Array.isArray(venda.avaliacoes)
              ? venda.avaliacoes[0]
              : venda.avaliacoes
            : null
          const pacienteNome = avaliacao?.pacientes
            ? Array.isArray(avaliacao.pacientes)
              ? avaliacao.pacientes[0]?.nome
              : avaliacao.pacientes?.nome
            : 'N/A'

          formatado.push({
            id: item.id,
            tipo: 'CRC Comercial',
            profissional: crcNome || 'N/A',
            data: venda?.data_concretizacao || item.data_calculo,
            paciente: pacienteNome,
            valor_venda: venda?.valor_total_tratamento || 0,
            percentual: item.percentual_faixa || 0,
            valor_comissao: item.valor_comissao || 0,
            status: item.status_pagamento || 'em_aberto',
          })
        }
      }

      formatado.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      setDados(formatado)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  const totalGerado = dados.reduce((acc, curr) => acc + curr.valor_comissao, 0)
  const totalPago = dados
    .filter((d) => d.status === 'pago')
    .reduce((acc, curr) => acc + curr.valor_comissao, 0)
  const totalEmAberto = dados
    .filter((d) => d.status === 'em_aberto')
    .reduce((acc, curr) => acc + curr.valor_comissao, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-50 dark:bg-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Total Gerado (Período)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(totalGerado)}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600 dark:text-green-500">
              Comissões Pagas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">
              {formatCurrency(totalPago)}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-500">
              Em Aberto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">
              {formatCurrency(totalEmAberto)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Histórico de Comissões</CardTitle>
          </div>
          <div className="w-full md:w-48">
            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mes">Mês Atual</SelectItem>
                <SelectItem value="trimestre">Neste Trimestre</SelectItem>
                <SelectItem value="ano">Neste Ano</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    {isAdmin && <TableHead>Profissional</TableHead>}
                    <TableHead>Paciente</TableHead>
                    <TableHead className="text-right">Valor Venda</TableHead>
                    <TableHead className="text-right">%</TableHead>
                    <TableHead className="text-right">Comissão</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dados.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        {new Date(row.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <div className="font-medium">{row.profissional}</div>
                          <div className="text-xs text-muted-foreground">{row.tipo}</div>
                        </TableCell>
                      )}
                      <TableCell>{row.paciente}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(row.valor_venda)}
                      </TableCell>
                      <TableCell className="text-right">{row.percentual}%</TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {formatCurrency(row.valor_comissao)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            row.status === 'pago'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                          }
                        >
                          {row.status === 'pago' ? 'Pago' : 'Em Aberto'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {dados.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={isAdmin ? 7 : 6}
                        className="text-center py-6 text-muted-foreground"
                      >
                        Nenhuma comissão encontrada no período.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

import { useState, useEffect, useMemo } from 'react'
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
import { startOfMonth, startOfYear, startOfQuarter, format } from 'date-fns'
import { Loader2, DollarSign } from 'lucide-react'

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
      const inicioStr = format(dataInicio, 'yyyy-MM-dd')

      const [resVendas, resDentistas, resCrcs, resFaixasDentista, resFaixasCrc] = await Promise.all(
        [
          supabase.from('vendas_confirmadas').select('*').gte('data_fechamento', inicioStr),
          supabase.from('dentistas_avaliadores').select('id, nome'),
          supabase.from('crc_comercial').select('id, nome'),
          supabase.from('referencias_comissao_dentista').select('*'),
          supabase.from('referencias_comissao_crc').select('*'),
        ],
      )

      const formatado: any[] = []
      const getPercentual = (faixas: any[], perc: number) => {
        const f = faixas.find(
          (x) => perc >= (x.faixa_entrada_minima || 0) && perc <= (x.faixa_entrada_maxima || 100),
        )
        return f?.percentual_comissao || 0
      }

      const isCrcUser = !isAdmin && crcId && !dentistaId
      const isDentistaUser = !isAdmin && dentistaId && !crcId

      for (const v of resVendas.data || []) {
        if (v.dentista_avaliador && !isCrcUser) {
          if (isAdmin || dentistaId === v.dentista_avaliador) {
            const perc = getPercentual(resFaixasDentista.data || [], v.percentual_entrada)
            formatado.push({
              id: `dentista-${v.id}`,
              tipo: 'Dentista Avaliador',
              profissionalId: v.dentista_avaliador,
              profissional:
                resDentistas.data?.find((d) => d.id === v.dentista_avaliador)?.nome || 'N/A',
              data: v.data_fechamento,
              paciente: v.paciente_nome,
              valor_venda: v.valor_tratamento,
              percentual: perc,
              valor_comissao: (v.valor_tratamento * perc) / 100,
              status: 'em_aberto',
            })
          }
        }
        if (v.crc && !isDentistaUser) {
          if (isAdmin || crcId === v.crc) {
            const perc = getPercentual(resFaixasCrc.data || [], v.percentual_entrada)
            formatado.push({
              id: `crc-${v.id}`,
              tipo: 'CRC Comercial',
              profissionalId: v.crc,
              profissional: resCrcs.data?.find((c) => c.id === v.crc)?.nome || 'N/A',
              data: v.data_fechamento,
              paciente: v.paciente_nome,
              valor_venda: v.valor_tratamento,
              percentual: perc,
              valor_comissao: (v.valor_tratamento * perc) / 100,
              status: 'em_aberto',
            })
          }
        }
      }
      setDados(formatado.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const resumoAvaliadores = useMemo(() => {
    const res = new Map<
      string,
      { nome: string; totalVendas: number; totalComissao: number; qtde: number }
    >()
    dados
      .filter((d) => d.tipo === 'Dentista Avaliador')
      .forEach((d) => {
        const c = res.get(d.profissionalId) || {
          nome: d.profissional,
          totalVendas: 0,
          totalComissao: 0,
          qtde: 0,
        }
        c.totalVendas += d.valor_venda
        c.totalComissao += d.valor_comissao
        c.qtde += 1
        res.set(d.profissionalId, c)
      })
    return Array.from(res.values()).sort((a, b) => b.totalComissao - a.totalComissao)
  }, [dados])

  const resumoCrc = useMemo(() => {
    const res = new Map<
      string,
      { nome: string; totalVendas: number; totalComissao: number; qtde: number }
    >()
    dados
      .filter((d) => d.tipo === 'CRC Comercial')
      .forEach((d) => {
        const c = res.get(d.profissionalId) || {
          nome: d.profissional,
          totalVendas: 0,
          totalComissao: 0,
          qtde: 0,
        }
        c.totalVendas += d.valor_venda
        c.totalComissao += d.valor_comissao
        c.qtde += 1
        res.set(d.profissionalId, c)
      })
    return Array.from(res.values()).sort((a, b) => b.totalComissao - a.totalComissao)
  }, [dados])

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
  const [tG, tP, tA] = dados.reduce(
    (acc, curr) => {
      acc[0] += curr.valor_comissao
      if (curr.status === 'pago') acc[1] += curr.valor_comissao
      else acc[2] += curr.valor_comissao
      return acc
    },
    [0, 0, 0],
  )

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
              {formatCurrency(tG)}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Comissões Pagas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{formatCurrency(tP)}</div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-600">Em Aberto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">{formatCurrency(tA)}</div>
          </CardContent>
        </Card>
      </div>

      {isAdmin && (resumoAvaliadores.length > 0 || resumoCrc.length > 0) && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          {resumoAvaliadores.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-3 text-slate-800 dark:text-slate-100">
                Resumo por Dentista Avaliador
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {resumoAvaliadores.map((r) => (
                  <Card key={r.nome} className="bg-primary/5 border-primary/20 shadow-sm">
                    <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
                      <CardTitle className="text-sm font-bold text-primary uppercase">
                        {r.nome}
                      </CardTitle>
                      <DollarSign className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent className="px-4 pb-4 space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Vendas ({r.qtde}):</span>
                        <span className="font-semibold">{formatCurrency(r.totalVendas)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold">
                        <span className="text-primary">Comissão Gerada:</span>
                        <span className="text-primary">{formatCurrency(r.totalComissao)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {resumoCrc.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-3 text-slate-800 dark:text-slate-100">
                Resumo por CRC Comercial
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {resumoCrc.map((r) => (
                  <Card
                    key={r.nome}
                    className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 shadow-sm"
                  >
                    <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
                      <CardTitle className="text-sm font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                        {r.nome}
                      </CardTitle>
                      <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                    </CardHeader>
                    <CardContent className="px-4 pb-4 space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Vendas ({r.qtde}):</span>
                        <span className="font-semibold">{formatCurrency(r.totalVendas)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold">
                        <span className="text-emerald-700 dark:text-emerald-400">
                          Comissão Gerada:
                        </span>
                        <span className="text-emerald-700 dark:text-emerald-400">
                          {formatCurrency(r.totalComissao)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle>Histórico de Comissões</CardTitle>
          <div className="w-full md:w-48">
            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger>
                <SelectValue placeholder="Período" />
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
            <div className="rounded-md border overflow-x-auto">
              <Table className="min-w-[700px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    {isAdmin && <TableHead>Profissional</TableHead>}
                    <TableHead>Paciente</TableHead>
                    <TableHead className="text-right">Venda</TableHead>
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
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                          Em Aberto
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
                        Nenhuma comissão encontrada.
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

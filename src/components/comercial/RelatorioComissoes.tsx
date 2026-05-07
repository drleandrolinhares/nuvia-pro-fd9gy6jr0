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
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { startOfMonth, endOfMonth, format, subMonths, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Loader2, DollarSign, CalendarIcon } from 'lucide-react'

export function RelatorioComissoes({
  isAdmin,
  dentistaId,
  crcId,
}: {
  isAdmin: boolean
  dentistaId: string | null
  crcId: string | null
}) {
  const { toast } = useToast()

  const mesesOptions = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => {
      const d = subMonths(new Date(), i)
      return {
        value: format(d, 'yyyy-MM'),
        label: format(d, 'MMMM yyyy', { locale: ptBR }).replace(/^\w/, (c) => c.toUpperCase()),
      }
    })
  }, [])

  const [mesCompetencia, setMesCompetencia] = useState(format(new Date(), 'yyyy-MM'))
  const [dados, setDados] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [filtroProfissional, setFiltroProfissional] = useState<string>('todos')
  const [fecharModalOpen, setFecharModalOpen] = useState(false)
  const [profToClose, setProfToClose] = useState<any>(null)
  const [fechando, setFechando] = useState(false)

  const isCrcUser = !isAdmin && !!crcId && !dentistaId
  const canViewAll = isAdmin || isCrcUser

  useEffect(() => {
    fetchDados()
  }, [mesCompetencia, isAdmin, dentistaId, crcId, canViewAll])

  const profissionaisUnicos = useMemo(() => {
    const map = new Map<string, string>()
    dados.forEach((d) => {
      if (d.profissionalId && d.profissional) {
        map.set(d.profissionalId, d.profissional)
      }
    })
    return Array.from(map.entries())
      .map(([id, nome]) => ({ id, nome }))
      .sort((a, b) => a.nome.localeCompare(b.nome))
  }, [dados])

  const dadosFiltrados = useMemo(() => {
    if (filtroProfissional === 'todos') return dados
    return dados.filter((d) => d.profissionalId === filtroProfissional)
  }, [dados, filtroProfissional])

  const fetchDados = async () => {
    setLoading(true)
    try {
      const dataInicio = parseISO(`${mesCompetencia}-01`)
      const inicioStr = format(startOfMonth(dataInicio), 'yyyy-MM-dd')
      const fimStr = format(endOfMonth(dataInicio), 'yyyy-MM-dd')

      const [resVendas, resDentistas, resCrcs, resFaixasDentista, resFaixasCrc] = await Promise.all(
        [
          supabase
            .from('vendas_confirmadas')
            .select('*, faturas_comissoes(status_pagamento)')
            .gte('data_fechamento', inicioStr)
            .lte('data_fechamento', fimStr),
          supabase.from('dentistas_avaliadores').select('id, nome, usuario_id'),
          supabase.from('crc_comercial').select('id, nome, usuario_id'),
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

      for (const v of resVendas.data || []) {
        const statusFatura = v.faturas_comissoes?.status_pagamento
        let statusStr = 'em_aberto'
        if (v.fatura_comissao_id) {
          statusStr = statusFatura === 'pago' ? 'pago' : 'aguardando_pagamento'
        }

        const calcPercentualEntrada =
          v.valor_tratamento > 0 ? (v.valor_entrada / v.valor_tratamento) * 100 : 0

        if (v.dentista_avaliador) {
          if (canViewAll || dentistaId === v.dentista_avaliador) {
            const perc = getPercentual(resFaixasDentista.data || [], calcPercentualEntrada)
            const dentista = resDentistas.data?.find((d) => d.id === v.dentista_avaliador)
            formatado.push({
              id: `dentista-${v.id}`,
              vendaId: v.id,
              tipo: 'Dentista Avaliador',
              profissionalId: dentista?.usuario_id,
              profissionalOriginalId: v.dentista_avaliador,
              profissional: dentista?.nome || 'N/A',
              data: v.data_fechamento,
              paciente: v.paciente_nome,
              valor_venda: v.valor_tratamento,
              valor_entrada: v.valor_entrada || 0,
              percentual_entrada: calcPercentualEntrada,
              percentual: perc,
              valor_comissao: (v.valor_tratamento * perc) / 100,
              status: statusStr,
            })
          }
        }
        if (v.crc) {
          if (canViewAll || crcId === v.crc) {
            const perc = getPercentual(resFaixasCrc.data || [], calcPercentualEntrada)
            const crc = resCrcs.data?.find((c) => c.id === v.crc)
            formatado.push({
              id: `crc-${v.id}`,
              vendaId: v.id,
              tipo: 'CRC Comercial',
              profissionalId: crc?.usuario_id,
              profissionalOriginalId: v.crc,
              profissional: crc?.nome || 'N/A',
              data: v.data_fechamento,
              paciente: v.paciente_nome,
              valor_venda: v.valor_tratamento,
              valor_entrada: v.valor_entrada || 0,
              percentual_entrada: calcPercentualEntrada,
              percentual: perc,
              valor_comissao: (v.valor_tratamento * perc) / 100,
              status: statusStr,
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
    const res = new Map<string, any>()
    dadosFiltrados
      .filter((d) => d.tipo === 'Dentista Avaliador')
      .forEach((d) => {
        const c = res.get(d.profissionalId) || {
          profissionalId: d.profissionalId,
          tipo: d.tipo,
          nome: d.profissional,
          totalVendas: 0,
          totalComissao: 0,
          qtde: 0,
          vendasAbertas: [],
          totalComissaoAberta: 0,
        }
        c.totalVendas += d.valor_venda
        c.totalComissao += d.valor_comissao
        c.qtde += 1
        if (d.status === 'em_aberto') {
          c.vendasAbertas.push(d)
          c.totalComissaoAberta += d.valor_comissao
        }
        res.set(d.profissionalId, c)
      })
    return Array.from(res.values()).sort((a, b) => b.totalComissao - a.totalComissao)
  }, [dados])

  const resumoCrc = useMemo(() => {
    const res = new Map<string, any>()
    dadosFiltrados
      .filter((d) => d.tipo === 'CRC Comercial')
      .forEach((d) => {
        const c = res.get(d.profissionalId) || {
          profissionalId: d.profissionalId,
          tipo: d.tipo,
          nome: d.profissional,
          totalVendas: 0,
          totalComissao: 0,
          qtde: 0,
          vendasAbertas: [],
          totalComissaoAberta: 0,
        }
        c.totalVendas += d.valor_venda
        c.totalComissao += d.valor_comissao
        c.qtde += 1
        if (d.status === 'em_aberto') {
          c.vendasAbertas.push(d)
          c.totalComissaoAberta += d.valor_comissao
        }
        res.set(d.profissionalId, c)
      })
    return Array.from(res.values()).sort((a, b) => b.totalComissao - a.totalComissao)
  }, [dados])

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  const handleFecharFaturaProfissional = (prof: any) => {
    setProfToClose(prof)
    setFecharModalOpen(true)
  }

  const confirmFecharFatura = async () => {
    if (!profToClose) return
    if (!profToClose.profissionalId) {
      toast({
        title: 'Erro',
        description: 'O profissional não possui um usuário vinculado no sistema.',
        variant: 'destructive',
      })
      return
    }

    setFechando(true)
    try {
      const dataInicio = parseISO(`${mesCompetencia}-01`)
      const inicioStr = format(startOfMonth(dataInicio), 'yyyy-MM-dd')
      const fimStr = format(endOfMonth(dataInicio), 'yyyy-MM-dd')
      const dataFaturamento = format(new Date(), 'yyyy-MM-dd')

      const { data: faturamento, error: errFat } = await supabase
        .from('faturamento_comissoes')
        .insert({
          periodo_inicio: inicioStr,
          periodo_fim: fimStr,
          data_faturamento: dataFaturamento,
          data_pagamento_prevista: dataFaturamento,
        })
        .select()
        .single()
      if (errFat) throw errFat

      const { data: fatura, error: errFatura } = await supabase
        .from('faturas_comissoes')
        .insert({
          faturamento_id: faturamento.id,
          profissional_id: profToClose.profissionalId,
          tipo_profissional: profToClose.tipo,
          valor_total_comissao: profToClose.totalComissaoAberta,
          status_pagamento: 'em_aberto',
        })
        .select()
        .single()
      if (errFatura) throw errFatura

      for (const v of profToClose.vendasAbertas) {
        const { error: errVenda } = await supabase
          .from('vendas_confirmadas')
          .update({
            fatura_comissao_id: fatura.id,
            status_comissao: 'faturado',
            percentual_comissao: v.percentual,
            valor_comissao: v.valor_comissao,
          })
          .eq('id', v.vendaId)
        if (errVenda) throw errVenda
      }

      toast({
        title: 'Fatura Fechada',
        description: 'As comissões foram enviadas para fechamento com sucesso.',
      })
      setFecharModalOpen(false)
      setProfToClose(null)
      fetchDados()
    } catch (e: any) {
      toast({ title: 'Erro ao fechar fatura', description: e.message, variant: 'destructive' })
    } finally {
      setFechando(false)
    }
  }

  const [tG, tP, tA] = dadosFiltrados.reduce(
    (acc, curr) => {
      acc[0] += curr.valor_comissao
      if (curr.status === 'pago') acc[1] += curr.valor_comissao
      else acc[2] += curr.valor_comissao
      return acc
    },
    [0, 0, 0],
  )

  const competenciaLabel = mesesOptions.find((m) => m.value === mesCompetencia)?.label

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 rounded-lg">
            <CalendarIcon className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Filtros de Relatório</h2>
            <p className="text-xs text-slate-500">Selecione o mês e o profissional para análise</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {canViewAll && (
            <Select value={filtroProfissional} onValueChange={setFiltroProfissional}>
              <SelectTrigger className="bg-white font-medium w-full sm:w-56">
                <SelectValue placeholder="Todos os Profissionais" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Profissionais</SelectItem>
                {profissionaisUnicos.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select value={mesCompetencia} onValueChange={setMesCompetencia}>
            <SelectTrigger className="bg-white font-medium w-full sm:w-48">
              <SelectValue placeholder="Mês de Competência" />
            </SelectTrigger>
            <SelectContent>
              {mesesOptions.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Total Gerado ({competenciaLabel})
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

      {canViewAll && (resumoAvaliadores.length > 0 || resumoCrc.length > 0) && (
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
                      <CardTitle className="text-sm font-bold text-primary uppercase line-clamp-1">
                        {r.nome}
                      </CardTitle>
                      <DollarSign className="h-4 w-4 text-primary flex-shrink-0" />
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
                      {isAdmin && r.vendasAbertas.length > 0 && (
                        <div className="pt-3 border-t border-primary/10 mt-3 space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-amber-600 font-medium">Em Aberto:</span>
                            <span className="text-amber-600 font-bold">
                              {formatCurrency(r.totalComissaoAberta)}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            className="w-full bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                            onClick={() => handleFecharFaturaProfissional(r)}
                          >
                            Fechar Fatura do Mês
                          </Button>
                        </div>
                      )}
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
                      <CardTitle className="text-sm font-bold text-emerald-700 dark:text-emerald-400 uppercase line-clamp-1">
                        {r.nome}
                      </CardTitle>
                      <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-500 flex-shrink-0" />
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
                      {isAdmin && r.vendasAbertas.length > 0 && (
                        <div className="pt-3 border-t border-emerald-200/50 mt-3 space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-amber-600 font-medium">Em Aberto:</span>
                            <span className="text-amber-600 font-bold">
                              {formatCurrency(r.totalComissaoAberta)}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            className="w-full bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                            onClick={() => handleFecharFaturaProfissional(r)}
                          >
                            Fechar Fatura do Mês
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Comissões ({competenciaLabel})</CardTitle>
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
                    <TableHead>Data Venda</TableHead>
                    {canViewAll && <TableHead>Profissional</TableHead>}
                    <TableHead>Paciente</TableHead>
                    <TableHead className="text-right">Valor Venda</TableHead>
                    <TableHead className="text-right">Valor Entrada</TableHead>
                    <TableHead className="text-right">% Ent.</TableHead>
                    <TableHead className="text-right">% Comis.</TableHead>
                    <TableHead className="text-right">Comissão</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dadosFiltrados.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        {new Date(row.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                      </TableCell>
                      {canViewAll && (
                        <TableCell>
                          <div className="font-medium">{row.profissional}</div>
                          <div className="text-xs text-muted-foreground">{row.tipo}</div>
                        </TableCell>
                      )}
                      <TableCell>{row.paciente}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(row.valor_venda)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(row.valor_entrada || 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        {row.percentual_entrada ? row.percentual_entrada.toFixed(2) : '0.00'}%
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
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : row.status === 'aguardando_pagamento'
                                ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }
                        >
                          {row.status === 'pago'
                            ? 'Pago'
                            : row.status === 'aguardando_pagamento'
                              ? 'Aguardando Pagamento'
                              : 'Em Aberto'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {dadosFiltrados.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={canViewAll ? 9 : 8}
                        className="text-center py-6 text-muted-foreground"
                      >
                        Nenhuma comissão encontrada para o período selecionado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={fecharModalOpen} onOpenChange={setFecharModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
          <div className="p-6 pb-4">
            <DialogHeader>
              <DialogTitle className="text-xl">Conferência de Fatura Mensal</DialogTitle>
              <DialogDescription className="text-base text-slate-600">
                Revise as comissões consolidadas antes de enviar para pagamento.
              </DialogDescription>
            </DialogHeader>
          </div>

          {profToClose && (
            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
                    Profissional
                  </p>
                  <p className="text-sm font-semibold text-slate-900">{profToClose.nome}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
                    Competência
                  </p>
                  <p className="text-sm font-semibold text-slate-900">{competenciaLabel}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
                    Qtd. Vendas
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {profToClose.vendasAbertas.length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
                    Total a Pagar
                  </p>
                  <p className="text-xl font-bold text-emerald-600">
                    {formatCurrency(profToClose.totalComissaoAberta)}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  Detalhamento das Vendas
                </h3>
                <div className="rounded-lg border border-slate-200 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/80">
                        <TableHead className="font-semibold text-slate-700">Data</TableHead>
                        <TableHead className="font-semibold text-slate-700">Paciente</TableHead>
                        <TableHead className="text-right font-semibold text-slate-700">
                          Valor Venda
                        </TableHead>
                        <TableHead className="text-right font-semibold text-slate-700">
                          % Comis.
                        </TableHead>
                        <TableHead className="text-right font-semibold text-slate-700">
                          Valor Comis.
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profToClose.vendasAbertas.map((v: any) => (
                        <TableRow key={v.id} className="hover:bg-slate-50">
                          <TableCell className="text-slate-600">
                            {new Date(v.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                          </TableCell>
                          <TableCell className="font-medium text-slate-700">{v.paciente}</TableCell>
                          <TableCell className="text-right text-slate-600">
                            {formatCurrency(v.valor_venda)}
                          </TableCell>
                          <TableCell className="text-right text-slate-600">
                            {v.percentual}%
                          </TableCell>
                          <TableCell className="text-right font-semibold text-emerald-600">
                            {formatCurrency(v.valor_comissao)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="p-6 pt-4 border-t bg-slate-50 mt-auto">
            <Button variant="outline" onClick={() => setFecharModalOpen(false)} disabled={fechando}>
              Cancelar
            </Button>
            <Button
              onClick={confirmFecharFatura}
              disabled={fechando}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-sm"
            >
              {fechando ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
              Confirmar Fechamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

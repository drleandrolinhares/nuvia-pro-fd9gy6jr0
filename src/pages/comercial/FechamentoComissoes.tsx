import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, DollarSign, FileText } from 'lucide-react'
import { faturamentoService } from '@/services/faturamento'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { startOfMonth, endOfMonth, format, subMonths, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function FechamentoComissoes() {
  const { toast } = useToast()
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'
  const [loading, setLoading] = useState(true)
  const [faturas, setFaturas] = useState<any[]>([])

  const mesesOptions = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => {
      const d = subMonths(new Date(), i)
      return {
        value: format(d, 'yyyy-MM'),
        label: format(d, 'MMMM yyyy', { locale: ptBR }).replace(/^\w/, (c) => c.toUpperCase()),
      }
    })
  }, [])

  const [mesFiltro, setMesFiltro] = useState('todos')
  const [statusFiltro, setStatusFiltro] = useState<string>('todas')

  const [selectedFatura, setSelectedFatura] = useState<any>(null)
  const [detalhes, setDetalhes] = useState<any[]>([])
  const [loadingDetalhes, setLoadingDetalhes] = useState(false)
  const [formaPagamento, setFormaPagamento] = useState('')
  const [dataPagamento, setDataPagamento] = useState('')
  const [observacaoPagamento, setObservacaoPagamento] = useState('')
  const [pagando, setPagando] = useState(false)

  useEffect(() => {
    loadFaturas()
  }, [mesFiltro])

  const loadFaturas = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('faturas_comissoes')
        .select('*, faturamento_comissoes!inner(*), usuarios(nome)')
        .order('criado_em', { ascending: false })

      if (mesFiltro !== 'todos') {
        const dataInicio = parseISO(`${mesFiltro}-01`)
        const inicioStr = format(startOfMonth(dataInicio), 'yyyy-MM-dd')
        const fimStr = format(endOfMonth(dataInicio), 'yyyy-MM-dd')
        query = query
          .gte('faturamento_comissoes.periodo_inicio', inicioStr)
          .lte('faturamento_comissoes.periodo_inicio', fimStr)
      }

      const res = await query
      if (res.error) throw res.error

      setFaturas(res.data || [])
    } catch (error: any) {
      toast({ title: 'Erro ao buscar faturas', description: error.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleRowClick = async (fatura: any) => {
    setSelectedFatura(fatura)
    setDetalhes([])
    setLoadingDetalhes(true)
    setFormaPagamento('')
    setObservacaoPagamento('')
    setDataPagamento(new Date().toISOString().split('T')[0])
    try {
      let data = []
      try {
        data = (await faturamentoService.getFaturaDetalhes(fatura)) || []
      } catch (e) {
        // fallback em caso de erro no serviço legado
      }

      if (!data || data.length === 0) {
        const { data: vendas } = await supabase
          .from('vendas_confirmadas')
          .select('*')
          .eq('fatura_comissao_id', fatura.id)

        if (vendas && vendas.length > 0) {
          data = vendas.map((v: any) => ({
            id: v.id,
            vendas_concretizadas: {
              data_concretizacao: v.data_fechamento,
              valor_total_tratamento: v.valor_tratamento,
              valor_entrada: v.valor_entrada || 0,
              percentual_entrada: v.percentual_entrada || 0,
              avaliacoes: { pacientes: { nome: v.paciente_nome } },
            },
            percentual_faixa: v.percentual_comissao || 0,
            valor_comissao: v.valor_comissao || 0,
          }))
        }
      }
      setDetalhes(data || [])
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os detalhes da fatura.',
        variant: 'destructive',
      })
    } finally {
      setLoadingDetalhes(false)
    }
  }

  const handlePagar = async () => {
    if (!formaPagamento || !dataPagamento) {
      toast({
        title: 'Atenção',
        description: 'Preencha a forma e data de pagamento.',
        variant: 'destructive',
      })
      return
    }
    setPagando(true)
    try {
      const { error: errFat } = await supabase
        .from('faturas_comissoes')
        .update({
          status_pagamento: 'pago',
          forma_pagamento: formaPagamento,
          data_pagamento: dataPagamento,
          observacao_pagamento: observacaoPagamento,
        })
        .eq('id', selectedFatura.id)
      if (errFat) throw errFat

      await supabase
        .from('vendas_confirmadas')
        .update({
          status_comissao: 'pago',
        })
        .eq('fatura_comissao_id', selectedFatura.id)

      try {
        await faturamentoService.pagarFatura(
          selectedFatura.id,
          formaPagamento,
          dataPagamento,
          observacaoPagamento,
        )
      } catch (e) {
        // ignorar erro legado
      }

      toast({ title: 'Sucesso', description: 'Fatura marcada como paga com sucesso!' })
      setSelectedFatura(null)
      loadFaturas()
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } finally {
      setPagando(false)
    }
  }

  const faturasFinais = faturas.filter((f) => {
    const statusMatch = statusFiltro === 'todas' || f.status_pagamento === statusFiltro
    return statusMatch
  })

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

  const formatDate = (val: string) => {
    if (!val) return '-'
    const [y, m, d] = val.split('-')
    return `${d}/${m}/${y}`
  }

  const getCompetenciaLabel = (inicioStr: string) => {
    if (!inicioStr) return '-'
    const date = parseISO(inicioStr)
    return format(date, 'MMMM yyyy', { locale: ptBR }).replace(/^\w/, (c) => c.toUpperCase())
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg">Controle de Pagamentos</CardTitle>
            <CardDescription>
              Gerencie as faturas consolidadas prontas para pagamento.
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Select value={mesFiltro} onValueChange={setMesFiltro}>
              <SelectTrigger className="bg-white w-full sm:w-56">
                <SelectValue placeholder="Competência" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as Competências</SelectItem>
                {mesesOptions.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFiltro} onValueChange={setStatusFiltro}>
              <SelectTrigger className="bg-white w-full sm:w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todos os Status</SelectItem>
                <SelectItem value="em_aberto">Aguardando Pagamento</SelectItem>
                <SelectItem value="pago">Pagas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
          ) : faturasFinais.length === 0 ? (
            <div className="text-center p-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
              Nenhuma fatura encontrada para os filtros selecionados.
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Profissional</TableHead>
                    <TableHead>Competência</TableHead>
                    <TableHead>Período Base</TableHead>
                    <TableHead className="text-right">Total a Pagar</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {faturasFinais.map((f: any) => (
                    <TableRow
                      key={f.id}
                      className="cursor-pointer hover:bg-slate-50/80 transition-colors"
                      onClick={() => handleRowClick(f)}
                    >
                      <TableCell className="font-medium">
                        {f.usuarios?.nome || 'Desconhecido'}
                      </TableCell>
                      <TableCell className="text-slate-600 font-medium capitalize">
                        {getCompetenciaLabel(f.faturamento_comissoes?.periodo_inicio)}
                      </TableCell>
                      <TableCell className="text-slate-600 text-sm">
                        {formatDate(f.faturamento_comissoes?.periodo_inicio)} a{' '}
                        {formatDate(f.faturamento_comissoes?.periodo_fim)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-emerald-600">
                        {formatCurrency(f.valor_total_comissao)}
                      </TableCell>
                      <TableCell>
                        {f.status_pagamento === 'pago' ? (
                          <span className="text-emerald-600 font-medium">
                            {formatDate(f.data_pagamento)}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-sm">
                            Prev: {formatDate(f.faturamento_comissoes?.data_pagamento_prevista)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={f.status_pagamento === 'pago' ? 'default' : 'secondary'}
                          className={
                            f.status_pagamento === 'pago'
                              ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }
                        >
                          {f.status_pagamento === 'pago' ? 'Pago' : 'Aguardando'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedFatura} onOpenChange={(open) => !open && setSelectedFatura(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
          <div className="p-6 pb-4">
            <DialogHeader>
              <DialogTitle className="text-xl">Detalhes da Fatura Consolidada</DialogTitle>
              <DialogDescription className="text-base text-slate-600">
                <span className="font-semibold text-slate-900">
                  {selectedFatura?.usuarios?.nome}
                </span>{' '}
                • {selectedFatura?.tipo_profissional}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
                  Competência
                </p>
                <p className="text-sm font-semibold text-slate-900 capitalize">
                  {getCompetenciaLabel(selectedFatura?.faturamento_comissoes?.periodo_inicio)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
                  Vencimento Previsto
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {formatDate(selectedFatura?.faturamento_comissoes?.data_pagamento_prevista)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
                  Total a Pagar
                </p>
                <p className="text-xl font-bold text-emerald-600">
                  {formatCurrency(selectedFatura?.valor_total_comissao)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
                  Status
                </p>
                <Badge
                  variant={selectedFatura?.status_pagamento === 'pago' ? 'default' : 'secondary'}
                  className={
                    selectedFatura?.status_pagamento === 'pago'
                      ? 'bg-emerald-500 hover:bg-emerald-600'
                      : 'bg-amber-100 text-amber-800'
                  }
                >
                  {selectedFatura?.status_pagamento === 'pago' ? 'Pago' : 'Aguardando Pagamento'}
                </Badge>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-400" />
                Detalhamento das Vendas
              </h3>
              {loadingDetalhes ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                </div>
              ) : detalhes.length === 0 ? (
                <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  Nenhuma comissão detalhada encontrada para esta fatura.
                </div>
              ) : (
                <div className="rounded-lg border border-slate-200 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/80">
                        <TableHead className="font-semibold text-slate-700">Data Venda</TableHead>
                        <TableHead className="font-semibold text-slate-700">Paciente</TableHead>
                        <TableHead className="text-right font-semibold text-slate-700">
                          Valor Venda
                        </TableHead>
                        <TableHead className="text-right font-semibold text-slate-700">
                          Valor Entrada
                        </TableHead>
                        <TableHead className="text-right font-semibold text-slate-700">
                          % Ent.
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
                      {detalhes.map((d: any) => (
                        <TableRow key={d.id} className="hover:bg-slate-50">
                          <TableCell className="text-slate-600">
                            {formatDate(d.vendas_concretizadas?.data_concretizacao)}
                          </TableCell>
                          <TableCell className="font-medium text-slate-700">
                            {d.vendas_concretizadas?.avaliacoes?.pacientes?.nome || 'N/A'}
                          </TableCell>
                          <TableCell className="text-right text-slate-600">
                            {formatCurrency(d.vendas_concretizadas?.valor_total_tratamento)}
                          </TableCell>
                          <TableCell className="text-right text-slate-600">
                            {formatCurrency(d.vendas_concretizadas?.valor_entrada)}
                          </TableCell>
                          <TableCell className="text-right text-slate-600">
                            {d.vendas_concretizadas?.percentual_entrada}%
                          </TableCell>
                          <TableCell className="text-right text-slate-600">
                            {d.percentual_faixa}%
                          </TableCell>
                          <TableCell className="text-right font-semibold text-emerald-600">
                            {formatCurrency(d.valor_comissao)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            {isAdmin && selectedFatura?.status_pagamento === 'em_aberto' && (
              <div className="pt-6 mt-6 border-t border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  Registrar Efetivação do Pagamento
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start bg-slate-50 p-5 rounded-xl border border-slate-200">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-slate-700">Data do Pagamento</Label>
                      <Input
                        type="date"
                        value={dataPagamento}
                        onChange={(e) => setDataPagamento(e.target.value)}
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700">Forma de Pagamento</Label>
                      <Select value={formaPagamento} onValueChange={setFormaPagamento}>
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PIX">PIX</SelectItem>
                          <SelectItem value="Transferência Bancária">
                            Transferência Bancária
                          </SelectItem>
                          <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                          <SelectItem value="Outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-4 h-full flex flex-col">
                    <div className="space-y-2 flex-1">
                      <Label className="text-slate-700">Observação do Pagamento (opcional)</Label>
                      <Textarea
                        value={observacaoPagamento}
                        onChange={(e) => setObservacaoPagamento(e.target.value)}
                        className="bg-white resize-none h-[104px]"
                        placeholder="Ex: Comprovante enviado via WhatsApp"
                      />
                    </div>
                    <Button
                      onClick={handlePagar}
                      disabled={pagando}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
                    >
                      {pagando ? (
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      ) : (
                        <DollarSign className="w-5 h-5 mr-2" />
                      )}
                      CONFIRMAR PAGAMENTO
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {selectedFatura?.status_pagamento === 'pago' && (
              <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-4">
                <div className="bg-emerald-100 p-3 rounded-full flex-shrink-0">
                  <DollarSign className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-base font-semibold text-emerald-900">
                    Pagamento Realizado com Sucesso
                  </p>
                  <p className="text-sm text-emerald-700 mt-0.5">
                    Valor repassado via{' '}
                    <span className="font-semibold">{selectedFatura.forma_pagamento}</span> no dia{' '}
                    <span className="font-semibold">
                      {formatDate(selectedFatura.data_pagamento)}
                    </span>
                    .
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

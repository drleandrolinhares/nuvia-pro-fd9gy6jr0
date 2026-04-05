import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
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
import { Loader2, DollarSign, CalendarIcon, FileText } from 'lucide-react'
import { faturamentoService } from '@/services/faturamento'
import { supabase } from '@/lib/supabase/client'

export default function FechamentoComissoes() {
  const { toast } = useToast()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [faturas, setFaturas] = useState<any[]>([])

  // Form de Faturamento
  const [inicio, setInicio] = useState('')
  const [fim, setFim] = useState('')
  const [prevista, setPrevista] = useState('')
  const [faturando, setFaturando] = useState(false)

  // Detalhes do Modal
  const [selectedFatura, setSelectedFatura] = useState<any>(null)
  const [detalhes, setDetalhes] = useState<any[]>([])
  const [loadingDetalhes, setLoadingDetalhes] = useState(false)
  const [formaPagamento, setFormaPagamento] = useState('')
  const [dataPagamento, setDataPagamento] = useState('')
  const [observacaoPagamento, setObservacaoPagamento] = useState('')
  const [pagando, setPagando] = useState(false)
  const [statusFiltro, setStatusFiltro] = useState<string>('todas')

  useEffect(() => {
    checkAccess()
    loadFaturas()
  }, [])

  const checkAccess = async () => {
    const { data } = await supabase.rpc('is_admin')
    setIsAdmin(!!data)
  }

  const loadFaturas = async () => {
    setLoading(true)
    try {
      const data = await faturamentoService.getFaturas()
      setFaturas(data || [])
    } catch (error: any) {
      toast({ title: 'Erro ao buscar faturas', description: error.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleFaturar = async () => {
    if (!inicio || !fim || !prevista) {
      toast({
        title: 'Atenção',
        description: 'Preencha todos os campos de período.',
        variant: 'destructive',
      })
      return
    }
    if (new Date(inicio) > new Date(fim)) {
      toast({
        title: 'Atenção',
        description: 'Data de início não pode ser maior que o fim.',
        variant: 'destructive',
      })
      return
    }

    setFaturando(true)
    try {
      const res = await faturamentoService.faturar(inicio, fim, prevista)
      toast({
        title: 'Faturamento Concluído',
        description: `${res.profissionaisCount} profissionais faturados, total de ${formatCurrency(res.totalGeral)}.`,
      })
      setInicio('')
      setFim('')
      setPrevista('')
      loadFaturas()
    } catch (error: any) {
      toast({ title: 'Erro ao faturar', description: error.message, variant: 'destructive' })
    } finally {
      setFaturando(false)
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
      const data = await faturamentoService.getFaturaDetalhes(fatura)
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
      await faturamentoService.pagarFatura(
        selectedFatura.id,
        formaPagamento,
        dataPagamento,
        observacaoPagamento,
      )
      toast({ title: 'Sucesso', description: 'Fatura marcada como paga com sucesso!' })
      setSelectedFatura(null)
      loadFaturas()
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } finally {
      setPagando(false)
    }
  }

  const faturasFiltradas = faturas.filter(
    (f) => statusFiltro === 'todas' || f.status_pagamento === statusFiltro,
  )

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)
  const formatDate = (val: string) => {
    if (!val) return '-'
    const [y, m, d] = val.split('-')
    return `${d}/${m}/${y}`
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Fechamento de Comissões
        </h1>
        <p className="text-slate-500 mt-2">
          Automatize o fechamento do período e gerencie os pagamentos dos profissionais.
        </p>
      </div>

      {isAdmin && (
        <Card className="border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarIcon className="h-5 w-5 text-amber-500" />
              Configuração de Período
            </CardTitle>
            <CardDescription>
              Defina o período de vendas concluídas para gerar o fechamento consolidado.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Período de Aquisição (Início)</Label>
                <Input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Período de Aquisição (Fim)</Label>
                <Input type="date" value={fim} onChange={(e) => setFim(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Data Prevista de Pagamento</Label>
                <Input type="date" value={prevista} onChange={(e) => setPrevista(e.target.value)} />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end bg-slate-50/50 pt-4 border-t border-slate-100">
            <Button
              onClick={handleFaturar}
              disabled={faturando}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {faturando ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileText className="w-4 h-4 mr-2" />
              )}
              FATURAR PERÍODO
            </Button>
          </CardFooter>
        </Card>
      )}

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Faturas Geradas</CardTitle>
            <CardDescription>Histórico de todos os faturamentos de comissões.</CardDescription>
          </div>
          <div className="w-48">
            <Select value={statusFiltro} onValueChange={setStatusFiltro}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as Faturas</SelectItem>
                <SelectItem value="em_aberto">Em Aberto</SelectItem>
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
          ) : faturasFiltradas.length === 0 ? (
            <div className="text-center p-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
              Nenhuma fatura encontrada para o filtro selecionado.
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Profissional</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Período Faturado</TableHead>
                    <TableHead className="text-right">Total Comissão</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {faturasFiltradas.map((f: any) => (
                    <TableRow
                      key={f.id}
                      className="cursor-pointer hover:bg-slate-50/80 transition-colors"
                      onClick={() => handleRowClick(f)}
                    >
                      <TableCell className="font-medium">
                        {f.usuarios?.nome || 'Desconhecido'}
                      </TableCell>
                      <TableCell className="text-slate-600">{f.tipo_profissional}</TableCell>
                      <TableCell className="text-slate-600">
                        {formatDate(f.faturamento_comissoes?.periodo_inicio)} a{' '}
                        {formatDate(f.faturamento_comissoes?.periodo_fim)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-emerald-600">
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
                          {f.status_pagamento === 'pago' ? 'Pago' : 'Em Aberto'}
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
              <DialogTitle className="text-xl">Detalhes da Fatura</DialogTitle>
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
                  Período Referência
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {formatDate(selectedFatura?.faturamento_comissoes?.periodo_inicio)} a{' '}
                  {formatDate(selectedFatura?.faturamento_comissoes?.periodo_fim)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
                  Vencimento
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {formatDate(selectedFatura?.faturamento_comissoes?.data_pagamento_prevista)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
                  Total a Receber
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
                  {selectedFatura?.status_pagamento === 'pago' ? 'Pago' : 'Em Aberto'}
                </Badge>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-400" />
                Comissões Incluídas
              </h3>
              {loadingDetalhes ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                </div>
              ) : detalhes.length === 0 ? (
                <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  Nenhuma comissão correspondente encontrada para esta fatura.
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
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Registrar Pagamento</h3>
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

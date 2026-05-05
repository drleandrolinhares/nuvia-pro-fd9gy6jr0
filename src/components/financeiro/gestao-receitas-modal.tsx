import { useState, useEffect, useMemo, useCallback } from 'react'
import { format, subDays, startOfMonth, endOfMonth, parseISO } from 'date-fns'
import { Plus, Edit2, Loader2, Trash, CheckCircle2, Lock } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useCache } from '@/hooks/use-cache'

export function GestaoReceitasModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { user } = useAuth()
  const { toast } = useToast()
  const { dataVersion, invalidateCache } = useCache()

  const [modalTab, setModalTab] = useState('lancamento')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [novaVendaValor, setNovaVendaValor] = useState('')
  const [pacienteNome, setPacienteNome] = useState('')
  const [valorTratamento, setValorTratamento] = useState('')
  const [formaPagamento, setFormaPagamento] = useState('')
  const [destinoPagamento, setDestinoPagamento] = useState('')
  const [destinoFiscal, setDestinoFiscal] = useState('')
  const [salvandoVendas, setSalvandoVendas] = useState(false)
  const [editingVendaId, setEditingVendaId] = useState<string | null>(null)

  const [filtroVendas, setFiltroVendas] = useState('7d')
  const [dataInicioFiltro, setDataInicioFiltro] = useState(
    format(subDays(new Date(), 6), 'yyyy-MM-dd'),
  )
  const [dataFimFiltro, setDataFimFiltro] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [vendasHistorico, setVendasHistorico] = useState<any[]>([])
  const [fechamentosDiarios, setFechamentosDiarios] = useState<any[]>([])
  const [loadingHistorico, setLoadingHistorico] = useState(false)

  const fetchHistorico = useCallback(async () => {
    let sd = ''
    let ed = ''
    const today = new Date()
    const todayStr = format(today, 'yyyy-MM-dd')

    if (filtroVendas === 'hoje') {
      sd = todayStr
      ed = todayStr
    } else if (filtroVendas === '7d') {
      sd = format(subDays(today, 6), 'yyyy-MM-dd')
      ed = todayStr
    } else if (filtroVendas === '15d') {
      sd = format(subDays(today, 14), 'yyyy-MM-dd')
      ed = todayStr
    } else if (filtroVendas === 'mes') {
      sd = format(startOfMonth(today), 'yyyy-MM-dd')
      ed = format(endOfMonth(today), 'yyyy-MM-dd')
    } else if (filtroVendas === 'custom') {
      sd = dataInicioFiltro
      ed = dataFimFiltro
    }

    if (!sd || !ed) return

    setLoadingHistorico(true)
    try {
      const [vendasRes, fechamentosRes] = await Promise.all([
        supabase.from('vendas_diarias').select('*').gte('data_venda', sd).lte('data_venda', ed),
        supabase
          .from('caixa_diario_fechamentos')
          .select('*')
          .gte('data_referencia', sd)
          .lte('data_referencia', ed),
      ])

      if (vendasRes.data) setVendasHistorico(vendasRes.data)
      if (fechamentosRes.data) setFechamentosDiarios(fechamentosRes.data)
    } finally {
      setLoadingHistorico(false)
    }
  }, [filtroVendas, dataInicioFiltro, dataFimFiltro])

  useEffect(() => {
    if (open) {
      fetchHistorico()
    }
  }, [open, fetchHistorico, dataVersion])

  const handleEditVenda = (venda: any) => {
    setEditingVendaId(venda.id)
    setNovaVendaValor(venda.valor.toString())
    setPacienteNome(venda.paciente_nome || '')
    setValorTratamento(venda.valor_tratamento ? venda.valor_tratamento.toString() : '')
    setFormaPagamento(venda.forma_pagamento || '')
    setDestinoPagamento(venda.destino_pagamento || '')
    setDestinoFiscal(venda.destino_fiscal || '')
    setSelectedDate(venda.data_venda)
    setModalTab('lancamento')
  }

  const cancelEdit = () => {
    setEditingVendaId(null)
    setNovaVendaValor('')
    setPacienteNome('')
    setValorTratamento('')
    setFormaPagamento('')
    setDestinoPagamento('')
    setDestinoFiscal('')
  }

  const handleAddVenda = async () => {
    if (!novaVendaValor || Number(novaVendaValor) <= 0 || !pacienteNome) return

    const isConferido = fechamentosDiarios.find(
      (f) => f.data_referencia === selectedDate,
    )?.conferido
    if (isConferido) {
      toast({
        title: 'Atenção',
        description: 'O caixa deste dia já foi conferido e fechado. Não é possível alterar.',
        variant: 'destructive',
      })
      return
    }

    setSalvandoVendas(true)
    try {
      const payload = {
        data_venda: selectedDate,
        valor: Number(novaVendaValor),
        usuario_id: user?.id,
        paciente_nome: pacienteNome,
        valor_tratamento: valorTratamento ? Number(valorTratamento) : null,
        forma_pagamento: formaPagamento,
        destino_pagamento: destinoPagamento,
        destino_fiscal: destinoFiscal,
      }

      if (editingVendaId) {
        const { error } = await supabase
          .from('vendas_diarias')
          .update(payload)
          .eq('id', editingVendaId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('vendas_diarias').insert(payload)
        if (error) throw error
      }

      toast({
        title: 'Sucesso',
        description: editingVendaId
          ? 'Lançamento editado com sucesso!'
          : 'Lançamento registrado com sucesso!',
      })
      cancelEdit()
      invalidateCache()
      setModalTab('historico')
    } catch (error) {
      console.error('Erro ao adicionar/editar venda:', error)
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar o lançamento.',
        variant: 'destructive',
      })
    } finally {
      setSalvandoVendas(false)
    }
  }

  const handleDeleteVenda = async (id: string, date: string) => {
    const isConferido = fechamentosDiarios.find((f) => f.data_referencia === date)?.conferido
    if (isConferido) {
      toast({
        title: 'Atenção',
        description: 'O caixa deste dia já foi fechado. Não é possível excluir.',
        variant: 'destructive',
      })
      return
    }

    try {
      const { error } = await supabase.from('vendas_diarias').delete().eq('id', id)
      if (error) throw error
      invalidateCache()
      toast({ title: 'Sucesso', description: 'Lançamento excluído.' })
    } catch (error) {
      console.error('Erro ao deletar venda:', error)
    }
  }

  const handleFecharCaixa = async (date: string) => {
    try {
      const { error } = await supabase.from('caixa_diario_fechamentos').upsert(
        {
          data_referencia: date,
          conferido: true,
          conferido_por: user?.id,
          conferido_em: new Date().toISOString(),
        },
        { onConflict: 'data_referencia' },
      )

      if (error) throw error
      toast({ title: 'Sucesso', description: 'Caixa conferido e fechado!' })
      fetchHistorico()
    } catch (error: any) {
      console.error('Erro ao fechar caixa:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível fechar o caixa.',
        variant: 'destructive',
      })
    }
  }

  const vendasAgrupadas = useMemo(() => {
    const groups: Record<string, any[]> = {}
    vendasHistorico.forEach((v) => {
      if (!groups[v.data_venda]) groups[v.data_venda] = []
      groups[v.data_venda].push(v)
    })
    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a))
      .map((date) => ({
        date,
        vendas: groups[date].sort(
          (x, y) => new Date(y.criado_em).getTime() - new Date(x.criado_em).getTime(),
        ),
        total: groups[date].reduce((acc, curr) => acc + Number(curr.valor), 0),
        fechamento: fechamentosDiarios.find((f) => f.data_referencia === date),
      }))
  }, [vendasHistorico, fechamentosDiarios])

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen)
        if (!isOpen) {
          cancelEdit()
          setModalTab('lancamento')
        }
      }}
    >
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-3xl max-h-[90vh] flex flex-col overflow-hidden p-6">
        <DialogHeader className="shrink-0">
          <DialogTitle>Gestão de Vendas / Receitas</DialogTitle>
          <DialogDescription className="text-slate-400">
            Registre novos recebimentos e acompanhe o histórico de caixa.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={modalTab}
          onValueChange={setModalTab}
          className="w-full mt-4 flex flex-col overflow-hidden"
        >
          <TabsList className="grid w-full grid-cols-2 bg-slate-950 shrink-0 mb-4">
            <TabsTrigger
              value="lancamento"
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 font-bold uppercase tracking-wider text-xs"
            >
              {editingVendaId ? 'Editar Lançamento' : 'Novo Lançamento'}
            </TabsTrigger>
            <TabsTrigger
              value="historico"
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 font-bold uppercase tracking-wider text-xs"
            >
              Histórico e Conferência
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            <TabsContent value="lancamento" className="space-y-4 mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-[11px] text-slate-400 uppercase font-bold">Data *</Label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-sm focus-visible:ring-emerald-500 h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-slate-400 uppercase font-bold">
                    Nome do Paciente *
                  </Label>
                  <Input
                    type="text"
                    placeholder="Ex: João da Silva"
                    value={pacienteNome}
                    onChange={(e) => setPacienteNome(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-sm focus-visible:ring-emerald-500 h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-[11px] text-slate-400 uppercase font-bold">
                    Valor do Tratamento Total (R$)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={valorTratamento}
                    onChange={(e) => setValorTratamento(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-sm focus-visible:ring-emerald-500 h-9"
                    placeholder="0,00"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-slate-400 uppercase font-bold">
                    Valor Recebido / Entrada (R$) *
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={novaVendaValor}
                    onChange={(e) => setNovaVendaValor(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-sm focus-visible:ring-emerald-500 h-9 border-emerald-500/50 focus-visible:border-emerald-500"
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label className="text-[11px] text-slate-400 uppercase font-bold">
                    Forma de Pgto
                  </Label>
                  <Select value={formaPagamento} onValueChange={setFormaPagamento}>
                    <SelectTrigger className="bg-slate-950 border-slate-800 h-9 text-sm">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                      <SelectItem value="credito">Crédito</SelectItem>
                      <SelectItem value="debito">Débito</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-slate-400 uppercase font-bold">
                    Destino Pgto
                  </Label>
                  <Select value={destinoPagamento} onValueChange={setDestinoPagamento}>
                    <SelectTrigger className="bg-slate-950 border-slate-800 h-9 text-sm">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                      <SelectItem value="a vista">À Vista (Caixa)</SelectItem>
                      <SelectItem value="CC Sicoob PP">CC Sicoob PP</SelectItem>
                      <SelectItem value="CC Santander PJ">CC Santander PJ</SelectItem>
                      <SelectItem value="CC Sicoob Pf">CC Sicoob PF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-slate-400 uppercase font-bold">
                    Destino Fiscal
                  </Label>
                  <Select value={destinoFiscal} onValueChange={setDestinoFiscal}>
                    <SelectTrigger className="bg-slate-950 border-slate-800 h-9 text-sm">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                      <SelectItem value="PESSOA FISICA">Pessoa Física</SelectItem>
                      <SelectItem value="VITALI ODONTOLOGIA">Vitali Odontologia</SelectItem>
                      <SelectItem value="SOUZA FILHO ODONTOLOGIA">
                        Souza Filho Odontologia
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end pt-4 gap-2">
                {editingVendaId && (
                  <Button
                    variant="outline"
                    onClick={cancelEdit}
                    disabled={salvandoVendas}
                    className="h-9 px-4 border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    Cancelar Edição
                  </Button>
                )}
                <Button
                  onClick={handleAddVenda}
                  disabled={
                    salvandoVendas ||
                    !novaVendaValor ||
                    Number(novaVendaValor) <= 0 ||
                    !pacienteNome
                  }
                  className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-6"
                >
                  {salvandoVendas ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : editingVendaId ? (
                    <Edit2 className="h-4 w-4 mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  {editingVendaId ? 'Salvar Edição' : 'Lançar Recebimento'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="historico" className="space-y-4 mt-0">
              <div className="flex flex-col sm:flex-row gap-2 items-end sm:items-center justify-between bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Label className="text-xs uppercase font-bold text-slate-400 whitespace-nowrap">
                    Período:
                  </Label>
                  <Select value={filtroVendas} onValueChange={setFiltroVendas}>
                    <SelectTrigger className="bg-slate-900 border-slate-700 h-8 text-xs w-[140px]">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                      <SelectItem value="hoje">Hoje</SelectItem>
                      <SelectItem value="7d">Últimos 7 dias</SelectItem>
                      <SelectItem value="15d">Últimos 15 dias</SelectItem>
                      <SelectItem value="mes">Mês Atual</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {filtroVendas === 'custom' && (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Input
                      type="date"
                      value={dataInicioFiltro}
                      onChange={(e) => setDataInicioFiltro(e.target.value)}
                      className="h-8 bg-slate-900 border-slate-700 text-xs w-[120px]"
                    />
                    <span className="text-slate-500 text-xs">até</span>
                    <Input
                      type="date"
                      value={dataFimFiltro}
                      onChange={(e) => setDataFimFiltro(e.target.value)}
                      className="h-8 bg-slate-900 border-slate-700 text-xs w-[120px]"
                    />
                  </div>
                )}
              </div>

              <div className="border border-slate-800 rounded-lg bg-slate-950/30">
                {loadingHistorico ? (
                  <div className="p-8 text-center text-slate-500 flex flex-col items-center">
                    <Loader2 className="h-6 w-6 animate-spin mb-2" />
                    <span className="text-xs uppercase tracking-wider font-medium">
                      Carregando histórico...
                    </span>
                  </div>
                ) : vendasAgrupadas.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    <span className="text-xs uppercase tracking-wider font-medium">
                      Nenhum registro encontrado no período
                    </span>
                  </div>
                ) : (
                  <Accordion type="multiple" className="w-full">
                    {vendasAgrupadas.map((group) => (
                      <AccordionItem
                        key={group.date}
                        value={group.date}
                        className="border-slate-800 px-4"
                      >
                        <AccordionTrigger className="hover:no-underline py-3">
                          <div className="flex justify-between items-center w-full pr-4">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-sm text-slate-200">
                                {format(parseISO(group.date), 'dd/MM/yyyy')}
                              </span>
                              {group.fechamento?.conferido && (
                                <Badge
                                  variant="outline"
                                  className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold uppercase text-[10px] tracking-wider py-0"
                                >
                                  Conferido <CheckCircle2 className="w-3 h-3 ml-1 inline-block" />
                                </Badge>
                              )}
                            </div>
                            <span className="font-bold text-emerald-400 text-sm">
                              R$ {group.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <div className="space-y-2">
                            {group.vendas.map((v) => (
                              <div
                                key={v.id}
                                className="flex justify-between items-center bg-slate-900 p-2.5 rounded border border-slate-800 group hover:border-slate-700 transition-colors"
                              >
                                <div className="flex flex-col gap-0.5 max-w-[70%]">
                                  <span className="text-sm font-bold text-slate-200 truncate">
                                    {v.paciente_nome || 'Paciente não informado'}
                                  </span>
                                  <div className="flex gap-2 text-[10px] text-slate-500 uppercase font-medium">
                                    <span>{v.destino_fiscal || 'S/ Destino Fiscal'}</span>
                                    <span>•</span>
                                    <span>{v.forma_pagamento || 'S/ Forma Pgto'}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="flex flex-col items-end mr-2">
                                    <span className="text-sm font-bold text-emerald-400">
                                      R${' '}
                                      {Number(v.valor).toLocaleString('pt-BR', {
                                        minimumFractionDigits: 2,
                                      })}
                                    </span>
                                    <span className="text-[10px] text-slate-500 uppercase font-medium">
                                      {v.criado_em ? format(parseISO(v.criado_em), 'HH:mm') : ''}
                                    </span>
                                  </div>
                                  {!group.fechamento?.conferido && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-slate-500 hover:text-amber-400 hover:bg-amber-400/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => handleEditVenda(v)}
                                        title="Editar Lançamento"
                                      >
                                        <Edit2 className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-slate-500 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => handleDeleteVenda(v.id, group.date)}
                                        title="Excluir Lançamento"
                                      >
                                        <Trash className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}

                            {!group.fechamento?.conferido && (
                              <div className="flex justify-end mt-3 pt-3 border-t border-slate-800/50">
                                <Button
                                  size="sm"
                                  onClick={() => handleFecharCaixa(group.date)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs font-bold uppercase tracking-wider"
                                >
                                  <Lock className="w-3.5 h-3.5 mr-1.5" /> Finalizar Conferência do
                                  Dia
                                </Button>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

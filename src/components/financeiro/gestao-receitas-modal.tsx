import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { useCache } from '@/hooks/use-cache'
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  parseISO,
} from 'date-fns'
import { Loader2, Edit2 } from 'lucide-react'

export function GestaoReceitasModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { toast } = useToast()
  const { invalidateCache } = useCache()

  const [activeTab, setActiveTab] = useState('novo')
  const [loading, setLoading] = useState(false)

  const [dentistas, setDentistas] = useState<any[]>([])
  const [crcs, setCrcs] = useState<any[]>([])

  const [editingId, setEditingId] = useState<string | null>(null)
  const [pacienteNome, setPacienteNome] = useState('')
  const [dataFechamento, setDataFechamento] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [valorTratamento, setValorTratamento] = useState('')
  const [valorEntrada, setValorEntrada] = useState('')
  const [dentistaId, setDentistaId] = useState<string>('none')
  const [crcId, setCrcId] = useState<string>('none')
  const [observacoes, setObservacoes] = useState('')

  const [historicoPeriodo, setHistoricoPeriodo] = useState('mes')
  const [historicoDataInicio, setHistoricoDataInicio] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [historicoDataFim, setHistoricoDataFim] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [vendas, setVendas] = useState<any[]>([])
  const [loadingHistorico, setLoadingHistorico] = useState(false)

  useEffect(() => {
    if (open) {
      loadProfessionals()
      if (activeTab === 'historico') {
        loadHistorico()
      }
    } else {
      resetForm()
      setActiveTab('novo')
    }
  }, [open, activeTab, historicoPeriodo, historicoDataInicio, historicoDataFim])

  const loadProfessionals = async () => {
    const { data: dData } = await supabase
      .from('dentistas_avaliadores')
      .select('id, nome')
      .eq('status', 'ativo')
    const { data: cData } = await supabase
      .from('crc_comercial')
      .select('id, nome')
      .eq('status', 'ativo')
    if (dData) setDentistas(dData)
    if (cData) setCrcs(cData)
  }

  const loadHistorico = async () => {
    setLoadingHistorico(true)
    let startStr = format(new Date(), 'yyyy-MM-dd')
    let endStr = format(new Date(), 'yyyy-MM-dd')

    if (historicoPeriodo === 'hoje') {
      // Keep today
    } else if (historicoPeriodo === 'semana') {
      startStr = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
      endStr = format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
    } else if (historicoPeriodo === 'quinzena') {
      startStr = format(subDays(new Date(), 15), 'yyyy-MM-dd')
    } else if (historicoPeriodo === 'mes') {
      startStr = format(startOfMonth(new Date()), 'yyyy-MM-dd')
      endStr = format(endOfMonth(new Date()), 'yyyy-MM-dd')
    } else if (historicoPeriodo === 'personalizado') {
      startStr = historicoDataInicio || startStr
      endStr = historicoDataFim || endStr
    }

    const { data } = await supabase
      .from('vendas_confirmadas')
      .select('*, dentistas_avaliadores(nome), crc_comercial(nome)')
      .gte('data_fechamento', startStr)
      .lte('data_fechamento', endStr)
      .order('data_fechamento', { ascending: false })

    if (data) setVendas(data)
    setLoadingHistorico(false)
  }

  const resetForm = () => {
    setEditingId(null)
    setPacienteNome('')
    setDataFechamento(format(new Date(), 'yyyy-MM-dd'))
    setValorTratamento('')
    setValorEntrada('')
    setDentistaId('none')
    setCrcId('none')
    setObservacoes('')
  }

  const handleSave = async () => {
    if (!pacienteNome || !valorTratamento || !dataFechamento) {
      toast({ title: 'Preencha os campos obrigatórios', variant: 'destructive' })
      return
    }

    const vTratamento = parseFloat(valorTratamento.replace(',', '.')) || 0
    const vEntrada = parseFloat(valorEntrada.replace(',', '.')) || 0
    const pEntrada = vTratamento > 0 ? (vEntrada / vTratamento) * 100 : 0

    const payload = {
      paciente_nome: pacienteNome,
      data_fechamento: dataFechamento,
      valor_tratamento: vTratamento,
      valor_entrada: vEntrada,
      percentual_entrada: pEntrada,
      dentista_avaliador: dentistaId !== 'none' ? dentistaId : null,
      crc: crcId !== 'none' ? crcId : null,
      observacoes_fechamento: observacoes,
    }

    setLoading(true)
    if (editingId) {
      const { error } = await supabase
        .from('vendas_confirmadas')
        .update(payload)
        .eq('id', editingId)
      if (error) {
        toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' })
      } else {
        toast({ title: 'Venda atualizada com sucesso!' })
        resetForm()
        setActiveTab('historico')
        invalidateCache()
      }
    } else {
      const { error } = await supabase.from('vendas_confirmadas').insert(payload)
      if (error) {
        toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
      } else {
        toast({ title: 'Venda registrada com sucesso!' })
        resetForm()
        invalidateCache()
      }
    }
    setLoading(false)
  }

  const handleEdit = (venda: any) => {
    setEditingId(venda.id)
    setPacienteNome(venda.paciente_nome)
    setDataFechamento(venda.data_fechamento)
    setValorTratamento(venda.valor_tratamento.toString())
    setValorEntrada(venda.valor_entrada?.toString() || '0')
    setDentistaId(venda.dentista_avaliador || 'none')
    setCrcId(venda.crc || 'none')
    setObservacoes(venda.observacoes_fechamento || '')
    setActiveTab('novo')
  }

  const totalTratamento = vendas.reduce((acc, curr) => acc + Number(curr.valor_tratamento || 0), 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-slate-900 border-slate-800 text-slate-100 max-h-[90vh] overflow-hidden flex flex-col p-4">
        <DialogHeader className="mb-2">
          <DialogTitle>Gestão de Vendas Avulsas</DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 overflow-hidden flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-2 bg-slate-950/50">
            <TabsTrigger value="novo">
              {editingId ? 'Editar Lançamento' : 'Novo Lançamento'}
            </TabsTrigger>
            <TabsTrigger value="historico">Consultar Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="novo" className="flex-1 overflow-y-auto pr-2 space-y-3 pt-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Paciente *</Label>
                <Input
                  value={pacienteNome}
                  onChange={(e) => setPacienteNome(e.target.value)}
                  placeholder="Nome do paciente"
                  className="bg-slate-950 border-slate-800"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Data de Fechamento *</Label>
                <Input
                  type="date"
                  value={dataFechamento}
                  onChange={(e) => setDataFechamento(e.target.value)}
                  className="bg-slate-950 border-slate-800"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Valor Tratamento (R$) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={valorTratamento}
                  onChange={(e) => setValorTratamento(e.target.value)}
                  placeholder="0.00"
                  className="bg-slate-950 border-slate-800"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Valor Entrada (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={valorEntrada}
                  onChange={(e) => setValorEntrada(e.target.value)}
                  placeholder="0.00"
                  className="bg-slate-950 border-slate-800"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Dentista Avaliador</Label>
                <Select value={dentistaId} onValueChange={setDentistaId}>
                  <SelectTrigger className="bg-slate-950 border-slate-800">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {dentistas.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>CRC Comercial</Label>
                <Select value={crcId} onValueChange={setCrcId}>
                  <SelectTrigger className="bg-slate-950 border-slate-800">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {crcs.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Observações</Label>
                <Input
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Informações adicionais..."
                  className="bg-slate-950 border-slate-800"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800 mt-4">
              {editingId && (
                <Button variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              )}
              <Button
                onClick={handleSave}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {editingId ? 'Salvar Alterações' : 'Registrar Venda'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="historico" className="flex-1 overflow-hidden flex flex-col pt-3">
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <Select value={historicoPeriodo} onValueChange={setHistoricoPeriodo}>
                <SelectTrigger className="bg-slate-950 border-slate-800 w-full sm:w-[200px]">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hoje">Hoje</SelectItem>
                  <SelectItem value="semana">Esta Semana</SelectItem>
                  <SelectItem value="quinzena">Últimos 15 dias</SelectItem>
                  <SelectItem value="mes">Este Mês</SelectItem>
                  <SelectItem value="personalizado">Personalizado</SelectItem>
                </SelectContent>
              </Select>
              {historicoPeriodo === 'personalizado' && (
                <div className="flex gap-2 w-full sm:w-auto">
                  <Input
                    type="date"
                    value={historicoDataInicio}
                    onChange={(e) => setHistoricoDataInicio(e.target.value)}
                    className="bg-slate-950 border-slate-800"
                  />
                  <Input
                    type="date"
                    value={historicoDataFim}
                    onChange={(e) => setHistoricoDataFim(e.target.value)}
                    className="bg-slate-950 border-slate-800"
                  />
                </div>
              )}
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 mb-3 flex items-center justify-between">
              <span className="text-sm text-emerald-400 font-medium">Total do Período</span>
              <span className="text-lg font-bold text-emerald-400">
                R$ {totalTratamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex-1 overflow-auto border border-slate-800 rounded-md">
              <Table>
                <TableHeader className="bg-slate-950 sticky top-0 z-10">
                  <TableRow className="border-slate-800 hover:bg-slate-950">
                    <TableHead className="text-slate-400">Data</TableHead>
                    <TableHead className="text-slate-400">Paciente</TableHead>
                    <TableHead className="text-slate-400">Profissionais</TableHead>
                    <TableHead className="text-right text-slate-400">Valor</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingHistorico ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                        Carregando...
                      </TableCell>
                    </TableRow>
                  ) : vendas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                        Nenhuma venda encontrada no período.
                      </TableCell>
                    </TableRow>
                  ) : (
                    vendas.map((venda) => (
                      <TableRow key={venda.id} className="border-slate-800 hover:bg-slate-800/50">
                        <TableCell className="whitespace-nowrap text-slate-300">
                          {format(parseISO(venda.data_fechamento), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell className="font-medium text-slate-200">
                          {venda.paciente_nome}
                        </TableCell>
                        <TableCell className="text-xs text-slate-400">
                          <div className="flex flex-col gap-0.5">
                            <span title="Dentista">
                              D: {venda.dentistas_avaliadores?.nome || '-'}
                            </span>
                            <span title="CRC">C: {venda.crc_comercial?.nome || '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap text-emerald-400 font-medium">
                          R${' '}
                          {Number(venda.valor_tratamento).toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-white"
                            onClick={() => handleEdit(venda)}
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

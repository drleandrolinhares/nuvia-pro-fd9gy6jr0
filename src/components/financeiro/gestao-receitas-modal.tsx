import { useState, useEffect } from 'react'
import { format, subDays, startOfWeek, startOfMonth, startOfToday, endOfDay } from 'date-fns'
import { Loader2, Plus, Receipt, History } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useCache } from '@/hooks/use-cache'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'

type Venda = { id: string; data: string; paciente: string; valor: number; origem: string }

export function GestaoReceitasModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [tab, setTab] = useState('novo')
  const { user } = useAuth()
  const { mutate } = useCache()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [dataVenda, setDataVenda] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [valorVenda, setValorVenda] = useState('')
  const [paciente, setPaciente] = useState('')
  const [formaPgto, setFormaPgto] = useState('PIX')

  const [loadingHist, setLoadingHist] = useState(false)
  const [historico, setHistorico] = useState<Venda[]>([])
  const [filtro, setFiltro] = useState('mes')
  const [cStart, setCStart] = useState('')
  const [cEnd, setCEnd] = useState('')

  useEffect(() => {
    if (open && tab === 'historico') fetchHistorico()
  }, [open, tab, filtro, cStart, cEnd])

  const fetchHistorico = async () => {
    setLoadingHist(true)
    try {
      const today = new Date()
      let start = format(startOfMonth(today), 'yyyy-MM-dd')
      let end = format(endOfDay(today), 'yyyy-MM-dd')

      if (filtro === 'hoje') start = format(startOfToday(), 'yyyy-MM-dd')
      else if (filtro === 'semana')
        start = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd')
      else if (filtro === 'quinzena') start = format(subDays(today, 15), 'yyyy-MM-dd')
      else if (filtro === 'personalizado') {
        start = cStart || start
        end = cEnd || end
      }

      const [resD, resC] = await Promise.all([
        supabase
          .from('vendas_diarias')
          .select('id, data_venda, paciente_nome, valor')
          .gte('data_venda', start)
          .lte('data_venda', end),
        supabase
          .from('vendas_confirmadas')
          .select('id, data_fechamento, paciente_nome, valor_tratamento')
          .gte('data_fechamento', start)
          .lte('data_fechamento', end),
      ])

      const comb: Venda[] = []
      resD.data?.forEach((d) =>
        comb.push({
          id: d.id,
          data: d.data_venda,
          paciente: d.paciente_nome || '-',
          valor: Number(d.valor),
          origem: 'Avulsa',
        }),
      )
      resC.data?.forEach((c) =>
        comb.push({
          id: c.id,
          data: c.data_fechamento,
          paciente: c.paciente_nome || '-',
          valor: Number(c.valor_tratamento),
          origem: 'Comercial',
        }),
      )
      comb.sort((a, b) => b.data.localeCompare(a.data))

      setHistorico(comb)
    } catch (e) {
      toast({ title: 'Erro ao buscar', variant: 'destructive' })
    } finally {
      setLoadingHist(false)
    }
  }

  const salvar = async () => {
    if (!valorVenda || !dataVenda)
      return toast({ title: 'Preencha os campos obrigatórios', variant: 'destructive' })
    setLoading(true)
    const { error } = await supabase.from('vendas_diarias').insert({
      data_venda: dataVenda,
      valor: Number(valorVenda.replace(',', '.')),
      paciente_nome: paciente,
      forma_pagamento: formaPgto,
      usuario_id: user?.id,
    })
    setLoading(false)
    if (error) return toast({ title: 'Erro ao salvar', variant: 'destructive' })
    toast({ title: 'Salvo com sucesso' })
    setValorVenda('')
    setPaciente('')
    mutate()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-slate-900 border-slate-800 text-slate-100">
        <DialogHeader>
          <DialogTitle>Gestão de Receitas</DialogTitle>
          <DialogDescription>
            Lance novas vendas ou consulte o histórico unificado de vendas comerciais e avulsas.
          </DialogDescription>
        </DialogHeader>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2 bg-slate-950">
            <TabsTrigger
              value="novo"
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Lançamento
            </TabsTrigger>
            <TabsTrigger
              value="historico"
              className="data-[state=active]:bg-slate-800 data-[state=active]:text-white"
            >
              <History className="w-4 h-4 mr-2" />
              Consultar Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="novo" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={dataVenda}
                  onChange={(e) => setDataVenda(e.target.value)}
                  className="bg-slate-950 border-slate-800"
                />
              </div>
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={valorVenda}
                  onChange={(e) => setValorVenda(e.target.value)}
                  className="bg-slate-950 border-slate-800"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Paciente</Label>
              <Input
                placeholder="Ex: João Silva"
                value={paciente}
                onChange={(e) => setPaciente(e.target.value)}
                className="bg-slate-950 border-slate-800"
              />
            </div>
            <div className="space-y-2">
              <Label>Forma de Pagamento</Label>
              <Select value={formaPgto} onValueChange={setFormaPgto}>
                <SelectTrigger className="bg-slate-950 border-slate-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PIX">PIX</SelectItem>
                  <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                  <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                  <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="Boleto">Boleto</SelectItem>
                  <SelectItem value="Transferência">Transferência</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end pt-4">
              <Button
                onClick={salvar}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Receipt className="w-4 h-4 mr-2" />
                )}{' '}
                Registrar Venda
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="historico" className="space-y-4 pt-4">
            <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <Select value={filtro} onValueChange={setFiltro}>
                  <SelectTrigger className="w-[180px] bg-slate-950 border-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hoje">Hoje</SelectItem>
                    <SelectItem value="semana">Esta Semana</SelectItem>
                    <SelectItem value="quinzena">Últimos 15 Dias</SelectItem>
                    <SelectItem value="mes">Este Mês</SelectItem>
                    <SelectItem value="personalizado">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
                {filtro === 'personalizado' && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="date"
                      value={cStart}
                      onChange={(e) => setCStart(e.target.value)}
                      className="bg-slate-950 border-slate-800 w-auto"
                    />
                    <span className="text-slate-500">até</span>
                    <Input
                      type="date"
                      value={cEnd}
                      onChange={(e) => setCEnd(e.target.value)}
                      className="bg-slate-950 border-slate-800 w-auto"
                    />
                  </div>
                )}
              </div>
              <div className="bg-slate-950 px-4 py-2 rounded-md border border-slate-800 w-full sm:w-auto text-right">
                <span className="text-xs text-slate-500 uppercase block mb-1">
                  Total do Período
                </span>
                <span className="text-lg font-bold text-emerald-400">
                  R${' '}
                  {historico
                    .reduce((a, c) => a + c.valor, 0)
                    .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            <div className="border border-slate-800 rounded-md bg-slate-950/50">
              <ScrollArea className="h-[300px]">
                <Table>
                  <TableHeader className="bg-slate-900 sticky top-0 z-10">
                    <TableRow className="border-slate-800 hover:bg-slate-900">
                      <TableHead>Data</TableHead>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Origem</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingHist ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-slate-400">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                          Buscando histórico...
                        </TableCell>
                      </TableRow>
                    ) : historico.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                          Nenhuma venda encontrada neste período.
                        </TableCell>
                      </TableRow>
                    ) : (
                      historico.map((i) => (
                        <TableRow key={`${i.origem}-${i.id}`} className="border-slate-800/50">
                          <TableCell className="whitespace-nowrap">
                            {i.data.split('-').reverse().join('/')}
                          </TableCell>
                          <TableCell className="font-medium">{i.paciente}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                i.origem === 'Comercial'
                                  ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              }
                            >
                              {i.origem}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            R$ {i.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

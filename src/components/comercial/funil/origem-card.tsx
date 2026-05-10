import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EditarDadosDialog } from './editar-dados-dialog'
import {
  ArrowRight,
  Users,
  Calendar,
  CheckSquare,
  DollarSign,
  Target,
  UserMinus,
  List,
  FileDown,
  FileText,
  Loader2,
  Edit,
} from 'lucide-react'
import { EditarVendaModal } from './editar-venda-modal'
import { EditarLeadModal } from './editar-lead-modal'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export function OrigemCard({ origem, dado, mesReferencia, etapas, temperaturas, onUpdate }: any) {
  const [open, setOpen] = useState(false)
  const [modalType, setModalType] = useState<string | null>(null)
  const [vendas, setVendas] = useState<any[]>([])
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [filtroTipo, setFiltroTipo] = useState<string | null>(null)
  const [vendaEditando, setVendaEditando] = useState<any>(null)
  const [leadEditando, setLeadEditando] = useState<any>(null)

  const d = dado || {
    investimento: 0,
    meta_leads: 0,
    leads_realizado: 0,
    meta_agendamentos_qtde: 0,
    meta_agendamentos_perc: 0,
    agendamentos_realizado: 0,
    meta_comparecimentos_qtde: 0,
    meta_comparecimentos_perc: 0,
    comparecimentos_realizado: 0,
    faltas_realizado: 0,
    meta_fechamento_valor: 0,
    ticket_medio_esperado: 0,
    meta_fechamentos_perc: 0,
    fechamentos_qtde_realizado: 0,
    fechamentos_valor_realizado: 0,
  }

  const cpl = d.leads_realizado ? d.investimento / d.leads_realizado : 0
  const ticketMedio = d.fechamentos_qtde_realizado
    ? d.fechamentos_valor_realizado / d.fechamentos_qtde_realizado
    : 0

  const formatBrl = (v: number) =>
    Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const fetchVendas = async () => {
    setLoading(true)
    const [ano, mes] = mesReferencia.split('-')
    const dataInicio = `${mesReferencia}-01`
    const ultimoDia = new Date(Number(ano), Number(mes), 0).getDate()
    const dataFim = `${mesReferencia}-${ultimoDia}`

    const { data: vendasData } = await supabase
      .from('vendas_confirmadas')
      .select(`
        id,
        paciente_nome,
        data_fechamento,
        data_original,
        valor_tratamento,
        origem_id,
        dentista_avaliador,
        crc,
        forma_pagamento,
        avaliacoes (
          origem_id,
          data_avaliacao
        )
      `)
      .gte('data_fechamento', dataInicio)
      .lte('data_fechamento', dataFim)

    const filteredVendas = (vendasData || [])
      .filter((v: any) => {
        const vOrigem = v.origem_id || (v.avaliacoes && v.avaliacoes.origem_id)
        return vOrigem === origem.id
      })
      .map((v: any) => {
        const dataAvaliacao = v.data_original || v.avaliacoes?.data_avaliacao || v.data_fechamento
        let tipo = 'FECHAMENTO NO ATO'

        if (dataAvaliacao && v.data_fechamento) {
          const mesAvaliacao = dataAvaliacao.substring(0, 7)
          if (dataAvaliacao < v.data_fechamento && mesAvaliacao === mesReferencia) {
            tipo = 'FOLLOW DO MÊS'
          } else if (mesAvaliacao < mesReferencia) {
            tipo = 'FOLLOW RESGATE'
          }
        }

        return {
          ...v,
          data_avaliacao: dataAvaliacao,
          tipo,
        }
      })

    setVendas(filteredVendas)
    setLoading(false)
  }

  const fetchLeads = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('funil_leads')
      .select('*')
      .eq('origem_id', origem.id)
      .eq('mes_referencia', mesReferencia)
      .order('criado_em', { ascending: false })

    setLeads(data || [])
    setLoading(false)
  }

  const handleOpenVendas = () => {
    setModalType('vendas')
    setOpen(true)
    setFiltroTipo(null)
    fetchVendas()
  }

  const handleOpenLeads = (type: string) => {
    setModalType(type)
    setOpen(true)
    fetchLeads()
  }

  const vendasFiltradas = useMemo(() => {
    if (!filtroTipo) return vendas
    return vendas.filter((v) => v.tipo === filtroTipo)
  }, [vendas, filtroTipo])

  const leadsFiltrados = useMemo(() => {
    if (modalType === 'leads') return leads
    if (modalType === 'agendamentos') {
      return leads.filter((l) => {
        const isAgendado = [
          'agendado',
          'reagendado',
          'atendido',
          'faltou',
          'negociacao',
          'venda-fechada',
          'venda-perdida',
          'avaliacao',
          'fechamento',
          'em_follow_up',
        ].includes(l.status)
        return isAgendado || l.qtd_agendamentos > 0
      })
    }
    if (modalType === 'comparecimentos') {
      return leads.filter((l) =>
        [
          'atendido',
          'negociacao',
          'venda-fechada',
          'venda-perdida',
          'avaliacao',
          'fechamento',
          'em_follow_up',
        ].includes(l.status),
      )
    }
    if (modalType === 'faltas') {
      return leads.filter((l) => l.status === 'faltou' || l.qtd_faltas > 0)
    }
    return []
  }, [leads, modalType])

  const fechamentoNoAto = vendas.filter((v) => v.tipo === 'FECHAMENTO NO ATO').length
  const followDoMes = vendas.filter((v) => v.tipo === 'FOLLOW DO MÊS').length
  const followResgate = vendas.filter((v) => v.tipo === 'FOLLOW RESGATE').length

  const exportToCsv = () => {
    const headers = ['Paciente', 'Data Avaliação', 'Data Fechamento', 'Valor', 'Classificação']
    const rows = vendasFiltradas.map((v) => [
      `"${v.paciente_nome}"`,
      v.data_avaliacao ? format(new Date(v.data_avaliacao + 'T00:00:00'), 'dd/MM/yyyy') : '',
      v.data_fechamento ? format(new Date(v.data_fechamento + 'T00:00:00'), 'dd/MM/yyyy') : '',
      v.valor_tratamento,
      v.tipo,
    ])
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `Vendas_${origem.nome}_${mesReferencia}.csv`
    link.click()
  }

  const exportToPdf = () => {
    const printWindow = window.open('', '', 'width=800,height=600')
    if (!printWindow) return

    const html = `
      <html>
        <head>
          <title>Relatório de Vendas - ${origem.nome}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f4f4f4; color: #333; }
            h2 { color: #333; font-size: 18px; }
            .badge { padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 10px; }
            .bg-emerald { background-color: #d1fae5; color: #059669; }
            .bg-blue { background-color: #dbeafe; color: #2563eb; }
            .bg-amber { background-color: #fef3c7; color: #d97706; }
          </style>
        </head>
        <body>
          <h2>Análise de Vendas - ${origem.nome} (${mesReferencia})</h2>
          <table>
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Data Avaliação</th>
                <th>Data Fechamento</th>
                <th>Valor</th>
                <th>Classificação</th>
              </tr>
            </thead>
            <tbody>
              ${vendasFiltradas
                .map(
                  (v) => `
                <tr>
                  <td>${v.paciente_nome}</td>
                  <td>${v.data_avaliacao ? format(new Date(v.data_avaliacao + 'T00:00:00'), 'dd/MM/yyyy') : '-'}</td>
                  <td>${v.data_fechamento ? format(new Date(v.data_fechamento + 'T00:00:00'), 'dd/MM/yyyy') : '-'}</td>
                  <td>${formatBrl(v.valor_tratamento)}</td>
                  <td><span class="badge ${v.tipo === 'FECHAMENTO NO ATO' ? 'bg-emerald' : v.tipo === 'FOLLOW DO MÊS' ? 'bg-blue' : 'bg-amber'}">${v.tipo}</span></td>
                </tr>
              `,
                )
                .join('')}
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `
    printWindow.document.write(html)
    printWindow.document.close()
  }

  return (
    <>
      <Card className="bg-slate-900 border-slate-800 shadow-md relative overflow-hidden transition-all hover:border-slate-700 group">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-400 to-amber-600"></div>

        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-800/80 bg-slate-900/50 pl-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-md">
              <Target className="w-5 h-5 text-amber-500" />
            </div>
            <CardTitle className="text-xl font-bold text-white tracking-wide">
              {origem.nome}
            </CardTitle>
          </div>
          <div className="opacity-100 transition-opacity flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenVendas}
              className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300 h-8"
            >
              <List className="w-4 h-4 mr-2" /> Analisar Vendas
            </Button>
            <EditarDadosDialog
              origem={origem}
              dado={dado}
              mesReferencia={mesReferencia}
              onUpdate={onUpdate}
            />
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-8 pl-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center relative">
            <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-[2px] bg-slate-800 -z-10 -translate-y-1/2"></div>

            <div
              className="bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-inner relative hover:border-slate-700 hover:bg-slate-900 transition-colors flex flex-col items-center justify-center cursor-pointer"
              onClick={() => handleOpenLeads('leads')}
            >
              <div className="flex items-center justify-center mb-3">
                <Users className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                Leads
              </p>
              <p className="text-4xl font-bold text-white mt-1">{d.leads_realizado}</p>
            </div>

            <div
              className="bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-inner relative hover:border-slate-700 hover:bg-slate-900 transition-colors flex flex-col items-center justify-center cursor-pointer"
              onClick={() => handleOpenLeads('agendamentos')}
            >
              <div className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 items-center justify-center bg-slate-900 border border-slate-800 rounded-full w-6 h-6">
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </div>
              <div className="flex items-center justify-center mb-3">
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-sm font-semibold text-blue-400 mb-1 uppercase tracking-wider">
                Agend.
              </p>
              <p className="text-4xl font-bold text-white mt-1">{d.agendamentos_realizado}</p>
            </div>

            <div
              className="bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-inner relative hover:border-slate-700 hover:bg-slate-900 transition-colors flex flex-col items-center justify-center cursor-pointer"
              onClick={() => handleOpenLeads('comparecimentos')}
            >
              <div className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 items-center justify-center bg-slate-900 border border-slate-800 rounded-full w-6 h-6">
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </div>
              <div className="flex items-center justify-center mb-3">
                <CheckSquare className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-sm font-semibold text-purple-400 mb-1 uppercase tracking-wider">
                Comp.
              </p>
              <p className="text-4xl font-bold text-white mt-1">{d.comparecimentos_realizado}</p>
            </div>

            <div
              className="bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-inner relative hover:border-rose-900/50 hover:bg-slate-900 transition-colors flex flex-col items-center justify-center cursor-pointer"
              onClick={() => handleOpenLeads('faltas')}
            >
              <div className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 items-center justify-center bg-slate-900 border border-slate-800 rounded-full w-6 h-6">
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </div>
              <div className="flex items-center justify-center mb-3">
                <UserMinus className="w-5 h-5 text-rose-500" />
              </div>
              <p className="text-sm font-semibold text-rose-400 mb-1 uppercase tracking-wider">
                Falt.
              </p>
              <p className="text-4xl font-bold text-white mt-1">{d.faltas_realizado}</p>
            </div>

            <div
              className="bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-inner relative hover:border-emerald-900/50 hover:bg-slate-900 transition-colors flex flex-col items-center justify-center cursor-pointer"
              onClick={handleOpenVendas}
            >
              <div className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 items-center justify-center bg-slate-900 border border-slate-800 rounded-full w-6 h-6">
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </div>
              <div className="flex items-center justify-center mb-3">
                <DollarSign className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-sm font-semibold text-emerald-400 mb-1 uppercase tracking-wider">
                Fecham.
              </p>
              <p className="text-4xl font-bold text-emerald-400 mt-1">
                {d.fechamentos_qtde_realizado}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/30 p-5 rounded-xl border border-slate-800/60">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Target className="w-3.5 h-3.5" />
                Métricas de Aquisição
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Investimento Total</span>
                  <span className="text-white font-bold">{formatBrl(d.investimento)}</span>
                </div>
                <div className="h-px w-full bg-slate-800/50"></div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Custo por Lead (CPL)</span>
                  <span className="text-amber-400 font-bold">{formatBrl(cpl)}</span>
                </div>
              </div>
            </div>

            <div className="bg-emerald-950/20 p-5 rounded-xl border border-emerald-900/30">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5" />
                Resultado de Vendas
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Receita Gerada</span>
                  <span className="text-emerald-400 font-bold text-base">
                    {formatBrl(d.fechamentos_valor_realizado)}
                  </span>
                </div>
                <div className="h-px w-full bg-emerald-900/30"></div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Ticket Médio</span>
                  <span className="text-white font-bold">{formatBrl(ticketMedio)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl bg-slate-900 border-slate-800 text-slate-200">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {modalType === 'vendas'
                ? 'Análise de Vendas'
                : `Listagem de Pacientes - ${modalType === 'leads' ? 'Todos os Leads' : modalType === 'agendamentos' ? 'Agendamentos' : modalType === 'comparecimentos' ? 'Comparecimentos' : 'Faltas'}`}{' '}
              - {origem.nome} ({mesReferencia})
            </DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
          ) : modalType === 'vendas' ? (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-3 gap-4">
                <div
                  className={cn(
                    'p-4 rounded-xl border text-center cursor-pointer transition-all',
                    filtroTipo === 'FECHAMENTO NO ATO'
                      ? 'bg-emerald-950/40 border-emerald-500/50 ring-1 ring-emerald-500/50'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700',
                  )}
                  onClick={() =>
                    setFiltroTipo(filtroTipo === 'FECHAMENTO NO ATO' ? null : 'FECHAMENTO NO ATO')
                  }
                >
                  <p className="text-xs font-semibold text-emerald-500 mb-1 uppercase">
                    Fechamento no Ato
                  </p>
                  <p className="text-3xl font-bold text-white">{fechamentoNoAto}</p>
                </div>
                <div
                  className={cn(
                    'p-4 rounded-xl border text-center cursor-pointer transition-all',
                    filtroTipo === 'FOLLOW DO MÊS'
                      ? 'bg-blue-950/40 border-blue-500/50 ring-1 ring-blue-500/50'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700',
                  )}
                  onClick={() =>
                    setFiltroTipo(filtroTipo === 'FOLLOW DO MÊS' ? null : 'FOLLOW DO MÊS')
                  }
                >
                  <p className="text-xs font-semibold text-blue-500 mb-1 uppercase">
                    Follow do Mês
                  </p>
                  <p className="text-3xl font-bold text-white">{followDoMes}</p>
                </div>
                <div
                  className={cn(
                    'p-4 rounded-xl border text-center cursor-pointer transition-all',
                    filtroTipo === 'FOLLOW RESGATE'
                      ? 'bg-amber-950/40 border-amber-500/50 ring-1 ring-amber-500/50'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700',
                  )}
                  onClick={() =>
                    setFiltroTipo(filtroTipo === 'FOLLOW RESGATE' ? null : 'FOLLOW RESGATE')
                  }
                >
                  <p className="text-xs font-semibold text-amber-500 mb-1 uppercase">
                    Follow Resgate
                  </p>
                  <p className="text-3xl font-bold text-white">{followResgate}</p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-slate-300">
                  {filtroTipo ? `Listando: ${filtroTipo}` : 'Todas as Vendas'} (
                  {vendasFiltradas.length})
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportToCsv}
                    className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    <FileDown className="w-4 h-4 mr-2" /> Excel
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportToPdf}
                    className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    <FileText className="w-4 h-4 mr-2" /> PDF
                  </Button>
                </div>
              </div>

              <div className="border border-slate-800 rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader className="bg-slate-950 sticky top-0 z-10">
                    <TableRow className="border-slate-800">
                      <TableHead className="text-slate-400">Paciente</TableHead>
                      <TableHead className="text-slate-400 text-center">Data Avaliação</TableHead>
                      <TableHead className="text-slate-400 text-center">Data Fechamento</TableHead>
                      <TableHead className="text-slate-400 text-right">Valor</TableHead>
                      <TableHead className="text-slate-400 text-center">Classificação</TableHead>
                      <TableHead className="text-slate-400 w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendasFiltradas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                          Nenhuma venda encontrada para o filtro selecionado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      vendasFiltradas.map((v) => (
                        <TableRow key={v.id} className="border-slate-800 hover:bg-slate-800/50">
                          <TableCell className="font-medium text-slate-200">
                            {v.paciente_nome}
                          </TableCell>
                          <TableCell className="text-center text-slate-400">
                            {v.data_avaliacao
                              ? format(new Date(v.data_avaliacao + 'T00:00:00'), 'dd/MM/yyyy')
                              : '-'}
                          </TableCell>
                          <TableCell className="text-center text-slate-400">
                            {v.data_fechamento
                              ? format(new Date(v.data_fechamento + 'T00:00:00'), 'dd/MM/yyyy')
                              : '-'}
                          </TableCell>
                          <TableCell className="text-right font-medium text-emerald-400">
                            {formatBrl(v.valor_tratamento)}
                          </TableCell>
                          <TableCell className="text-center">
                            <span
                              className={cn(
                                'px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
                                v.tipo === 'FECHAMENTO NO ATO'
                                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                  : v.tipo === 'FOLLOW DO MÊS'
                                    ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                    : 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
                              )}
                            >
                              {v.tipo}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setVendaEditando(v)}
                              className="h-8 w-8 text-slate-400 hover:text-amber-500 hover:bg-amber-500/10"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="space-y-6 mt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-slate-300">
                  Total Encontrado: {leadsFiltrados.length}
                </h3>
              </div>

              <div className="border border-slate-800 rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader className="bg-slate-950 sticky top-0 z-10">
                    <TableRow className="border-slate-800">
                      <TableHead className="text-slate-400">Paciente</TableHead>
                      <TableHead className="text-slate-400">Telefone</TableHead>
                      <TableHead className="text-slate-400 text-center">Status</TableHead>
                      <TableHead className="text-slate-400 text-center">Temperatura</TableHead>
                      <TableHead className="text-slate-400 text-center">Data</TableHead>
                      <TableHead className="text-slate-400 w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leadsFiltrados.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                          Nenhum paciente encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      leadsFiltrados.map((l) => (
                        <TableRow key={l.id} className="border-slate-800 hover:bg-slate-800/50">
                          <TableCell className="font-medium text-slate-200">{l.nome}</TableCell>
                          <TableCell className="text-slate-400">{l.telefone || '-'}</TableCell>
                          <TableCell className="text-center">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                              {etapas?.find((e: any) => e.slug === l.status)?.nome ||
                                l.status ||
                                '-'}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                              {temperaturas?.find((t: any) => t.slug === l.temperatura)?.nome ||
                                l.temperatura ||
                                '-'}
                            </span>
                          </TableCell>
                          <TableCell className="text-center text-slate-400">
                            {l.criado_em ? format(new Date(l.criado_em), 'dd/MM/yyyy') : '-'}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setLeadEditando(l)}
                              className="h-8 w-8 text-slate-400 hover:text-amber-500 hover:bg-amber-500/10"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {leadEditando && (
        <EditarLeadModal
          open={!!leadEditando}
          onOpenChange={(isOpen: boolean) => !isOpen && setLeadEditando(null)}
          lead={leadEditando}
          etapas={etapas}
          temperaturas={temperaturas}
          onSaved={() => {
            fetchLeads()
            onUpdate()
          }}
        />
      )}

      {vendaEditando && (
        <EditarVendaModal
          open={!!vendaEditando}
          onOpenChange={(isOpen: boolean) => !isOpen && setVendaEditando(null)}
          venda={vendaEditando}
          onSaved={() => {
            fetchVendas()
            onUpdate()
          }}
        />
      )}
    </>
  )
}

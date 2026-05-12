import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Edit2,
  Loader2,
  Save,
  BarChart3,
  Zap,
  CalendarDays,
  History,
  FileDown,
  FileText,
  Edit,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { EditarVendaModal } from './editar-venda-modal'

const AnaliseCard = ({ title, desc, qtd, valor, color, Icon, isActive, onClick }: any) => {
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-500',
  }
  const iconColorMap: Record<string, string> = {
    emerald: 'text-emerald-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
  }
  const activeRingMap: Record<string, string> = {
    emerald: 'ring-2 ring-emerald-500 bg-opacity-30 border-emerald-500/50',
    blue: 'ring-2 ring-blue-500 bg-opacity-30 border-blue-500/50',
    purple: 'ring-2 ring-purple-500 bg-opacity-30 border-purple-500/50',
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        `p-5 rounded-xl border ${colorMap[color]} flex flex-col relative overflow-hidden group hover:bg-opacity-20 transition-all shadow-inner cursor-pointer`,
        isActive && activeRingMap[color],
      )}
    >
      <div className="flex items-center gap-2 mb-1 z-10">
        <Icon className={`w-4 h-4 ${iconColorMap[color]} shrink-0`} />
        <h4 className="font-bold text-sm uppercase tracking-wider whitespace-nowrap">{title}</h4>
      </div>
      <p className="text-xs opacity-70 mb-4 z-10">{desc}</p>
      <div className="mt-auto flex justify-between items-end z-10">
        <div>
          <p className="text-3xl font-bold">{qtd}</p>
          <p className="text-[10px] uppercase tracking-wider opacity-70 mt-1">Vendas</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold">
            {Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
          <p className="text-[10px] uppercase tracking-wider opacity-70 mt-1">Receita</p>
        </div>
      </div>
      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500 z-0">
        <Icon className="w-24 h-24" />
      </div>
    </div>
  )
}

export function EditarDadosDialog({
  open,
  onOpenChange,
  origem,
  dado,
  mesReferencia,
  onUpdate,
}: any) {
  const [loading, setLoading] = useState(false)
  const [vendas, setVendas] = useState<any[]>([])
  const [filtroTipo, setFiltroTipo] = useState<string | null>(null)
  const [vendaEditando, setVendaEditando] = useState<any>(null)

  const [analiseData, setAnaliseData] = useState({
    fechamentoNoAto: { qtd: 0, valor: 0 },
    followMes: { qtd: 0, valor: 0 },
    followResgate: { qtd: 0, valor: 0 },
    loading: true,
  })

  const [formData, setFormData] = useState({
    investimento: dado?.investimento || 0,
    meta_leads: dado?.meta_leads || 0,
    leads_realizado: dado?.leads_realizado || 0,
    meta_agendamentos_qtde: dado?.meta_agendamentos_qtde || 0,
    meta_agendamentos_perc: dado?.meta_agendamentos_perc || 0,
    agendamentos_realizado: dado?.agendamentos_realizado || 0,
    meta_comparecimentos_qtde: dado?.meta_comparecimentos_qtde || 0,
    meta_comparecimentos_perc: dado?.meta_comparecimentos_perc || 0,
    comparecimentos_realizado: dado?.comparecimentos_realizado || 0,
    meta_fechamento_valor: dado?.meta_fechamento_valor || 0,
    meta_fechamentos_perc: dado?.meta_fechamentos_perc || 0,
    ticket_medio_esperado: dado?.ticket_medio_esperado || 0,
    fechamentos_qtde_realizado: dado?.fechamentos_qtde_realizado || 0,
    fechamentos_valor_realizado: dado?.fechamentos_valor_realizado || 0,
  })

  useEffect(() => {
    if (open) {
      setFormData({
        investimento: dado?.investimento || 0,
        meta_leads: dado?.meta_leads || 0,
        leads_realizado: dado?.leads_realizado || 0,
        meta_agendamentos_qtde: dado?.meta_agendamentos_qtde || 0,
        meta_agendamentos_perc: dado?.meta_agendamentos_perc || 0,
        agendamentos_realizado: dado?.agendamentos_realizado || 0,
        meta_comparecimentos_qtde: dado?.meta_comparecimentos_qtde || 0,
        meta_comparecimentos_perc: dado?.meta_comparecimentos_perc || 0,
        comparecimentos_realizado: dado?.comparecimentos_realizado || 0,
        meta_fechamento_valor: dado?.meta_fechamento_valor || 0,
        meta_fechamentos_perc: dado?.meta_fechamentos_perc || 0,
        ticket_medio_esperado: dado?.ticket_medio_esperado || 0,
        fechamentos_qtde_realizado: dado?.fechamentos_qtde_realizado || 0,
        fechamentos_valor_realizado: dado?.fechamentos_valor_realizado || 0,
      })
      setFiltroTipo(null)
      fetchAnalise()
    }
  }, [open, dado, mesReferencia, origem.id])

  const fetchAnalise = async () => {
    try {
      setAnaliseData((prev) => ({ ...prev, loading: true }))
      const [ano, mes] = mesReferencia.split('-')
      const dataInicio = `${mesReferencia}-01`
      const ultimoDia = new Date(Number(ano), Number(mes), 0).getDate()
      const dataFim = `${mesReferencia}-${ultimoDia}`

      const { data: vendasData, error } = await supabase
        .from('vendas_confirmadas')
        .select(`
          id,
          paciente_nome,
          data_fechamento,
          data_original,
          valor_tratamento,
          oportunidade_id,
          origem_id,
          dentista_avaliador,
          crc,
          forma_pagamento,
          avaliacoes(origem_id, data_avaliacao)
        `)
        .gte('data_fechamento', dataInicio)
        .lte('data_fechamento', dataFim)

      if (error) throw error

      const vendasOrigem = (vendasData || [])
        .filter((v: any) => (v.origem_id || v.avaliacoes?.origem_id) === origem.id)
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

      const noAto = { qtd: 0, valor: 0 }
      const fMes = { qtd: 0, valor: 0 }
      const fResgate = { qtd: 0, valor: 0 }

      vendasOrigem.forEach((v: any) => {
        const valor = Number(v.valor_tratamento || 0)

        if (v.tipo === 'FECHAMENTO NO ATO') {
          noAto.qtd++
          noAto.valor += valor
        } else if (v.tipo === 'FOLLOW DO MÊS') {
          fMes.qtd++
          fMes.valor += valor
        } else if (v.tipo === 'FOLLOW RESGATE') {
          fResgate.qtd++
          fResgate.valor += valor
        }
      })

      setVendas(vendasOrigem)
      setAnaliseData({
        fechamentoNoAto: noAto,
        followMes: fMes,
        followResgate: fResgate,
        loading: false,
      })
    } catch (e: any) {
      console.error('Erro ao buscar dados de análise:', e)
      setAnaliseData((prev) => ({ ...prev, loading: false }))
    }
  }

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: Number(value) }))
  }

  const sanitizeUuid = (id: any) => {
    if (!id || typeof id !== 'string') return null
    const cleaned = id.trim()
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(cleaned) ? cleaned : null
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    const origemIdSanitizada = sanitizeUuid(origem?.id)
    if (!origemIdSanitizada) {
      toast.error('ID da origem inválido.')
      return
    }

    setLoading(true)
    try {
      const payload = {
        origem_id: origemIdSanitizada,
        mes_referencia: mesReferencia,
        ...formData,
      }

      let error
      const dadoIdSanitizado = sanitizeUuid(dado?.id)

      if (dadoIdSanitizado) {
        const { error: err } = await supabase
          .from('funil_dados_mensais')
          .update(payload)
          .eq('id', dadoIdSanitizado)
        error = err
      } else {
        const { error: err } = await supabase.from('funil_dados_mensais').insert([payload])
        error = err
      }

      if (error) throw error
      toast.success('Dados salvos com sucesso!')
      onUpdate()
      onOpenChange(false)
    } catch (error: any) {
      toast.error('Erro ao salvar: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const taxaAgendamento = formData.leads_realizado
    ? (formData.agendamentos_realizado / formData.leads_realizado) * 100
    : 0

  const taxaComparecimento = formData.agendamentos_realizado
    ? (formData.comparecimentos_realizado / formData.agendamentos_realizado) * 100
    : 0

  const taxaFechamento = formData.comparecimentos_realizado
    ? (formData.fechamentos_qtde_realizado / formData.comparecimentos_realizado) * 100
    : 0

  const taxaFaltas = formData.agendamentos_realizado
    ? ((dado?.faltas_realizado || 0) / formData.agendamentos_realizado) * 100
    : 0

  const formatBrl = (v: number) =>
    Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const vendasFiltradas = vendas.filter((v) => v.tipo === filtroTipo)

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
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-6xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-6 border-b border-slate-800 bg-slate-900/80 sticky top-0 z-20 backdrop-blur-sm shadow-sm">
            <DialogTitle className="text-xl flex items-center gap-2">
              Análise e Lançamentos: <span className="text-amber-500">{origem.nome}</span> (
              {mesReferencia})
            </DialogTitle>
          </DialogHeader>

          {/* Dashboard Section */}
          <div className="p-6 pb-0 space-y-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-500" />
              Análise de Conversão (Automático)
            </h3>

            {analiseData.loading ? (
              <div className="flex items-center justify-center py-12 bg-slate-950/50 rounded-xl border border-slate-800">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <AnaliseCard
                  title="Fechamento no Ato"
                  desc="Mesmo dia da avaliação"
                  qtd={analiseData.fechamentoNoAto.qtd}
                  valor={analiseData.fechamentoNoAto.valor}
                  color="emerald"
                  Icon={Zap}
                  isActive={filtroTipo === 'FECHAMENTO NO ATO'}
                  onClick={() =>
                    setFiltroTipo(filtroTipo === 'FECHAMENTO NO ATO' ? null : 'FECHAMENTO NO ATO')
                  }
                />
                <AnaliseCard
                  title="Fechamento por Follow do Mês"
                  desc="Mesmo mês da avaliação"
                  qtd={analiseData.followMes.qtd}
                  valor={analiseData.followMes.valor}
                  color="blue"
                  Icon={CalendarDays}
                  isActive={filtroTipo === 'FOLLOW DO MÊS'}
                  onClick={() =>
                    setFiltroTipo(filtroTipo === 'FOLLOW DO MÊS' ? null : 'FOLLOW DO MÊS')
                  }
                />
                <AnaliseCard
                  title="Fechamento por Follow Resgate"
                  desc="Meses após a avaliação"
                  qtd={analiseData.followResgate.qtd}
                  valor={analiseData.followResgate.valor}
                  color="purple"
                  Icon={History}
                  isActive={filtroTipo === 'FOLLOW RESGATE'}
                  onClick={() =>
                    setFiltroTipo(filtroTipo === 'FOLLOW RESGATE' ? null : 'FOLLOW RESGATE')
                  }
                />
              </div>
            )}
          </div>

          {/* Table Section */}
          {filtroTipo && (
            <div className="px-6 mt-4">
              <div className="border border-slate-800 rounded-lg overflow-hidden flex flex-col max-h-[300px]">
                <div className="flex justify-between items-center p-3 bg-slate-900 border-b border-slate-800 shrink-0">
                  <h3 className="text-sm font-semibold text-slate-300">
                    Pacientes: {filtroTipo} ({vendasFiltradas.length})
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportToCsv}
                      className="h-7 border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                    >
                      <FileDown className="w-3.5 h-3.5 mr-2" /> Excel
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportToPdf}
                      className="h-7 border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                    >
                      <FileText className="w-3.5 h-3.5 mr-2" /> PDF
                    </Button>
                  </div>
                </div>
                <div className="overflow-y-auto flex-1 bg-slate-950">
                  <Table>
                    <TableHeader className="bg-slate-950 sticky top-0 z-10 shadow-sm">
                      <TableRow className="border-slate-800">
                        <TableHead className="text-slate-400">Paciente</TableHead>
                        <TableHead className="text-slate-400 text-center">Data Avaliação</TableHead>
                        <TableHead className="text-slate-400 text-center">
                          Data Fechamento
                        </TableHead>
                        <TableHead className="text-slate-400 text-right">Valor</TableHead>
                        <TableHead className="text-slate-400 w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vendasFiltradas.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-slate-500">
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
            </div>
          )}

          <div className="px-6 py-4">
            <div className="h-px w-full bg-slate-800/60"></div>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="p-6 pt-0 space-y-6">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-blue-500" />
              Lançamento de Dados do Funil
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Investimento & Leads */}
              <div className="space-y-4">
                <div className="bg-slate-800/30 p-5 rounded-xl border border-slate-700/50">
                  <h4 className="font-bold text-slate-300 uppercase text-xs tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                    Investimento e Captação
                  </h4>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Valor Investido (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        name="investimento"
                        value={formData.investimento}
                        onChange={handleChange}
                        className="bg-slate-950 border-slate-700 focus-visible:ring-amber-500 font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-slate-300">Leads (Realizado)</Label>
                        <Input
                          type="number"
                          name="leads_realizado"
                          value={formData.leads_realizado}
                          onChange={handleChange}
                          className="bg-slate-950 border-slate-700 font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-400">Meta de Leads</Label>
                        <Input
                          type="number"
                          name="meta_leads"
                          value={formData.meta_leads}
                          onChange={handleChange}
                          className="bg-slate-950 border-slate-800 text-slate-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Agendamentos */}
              <div className="space-y-4">
                <div className="bg-blue-950/10 p-5 rounded-xl border border-blue-900/30">
                  <h4 className="font-bold text-blue-400 uppercase text-xs tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Agendamentos
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Qtd Realizado</Label>
                      <Input
                        type="number"
                        name="agendamentos_realizado"
                        value={formData.agendamentos_realizado}
                        onChange={handleChange}
                        className="bg-slate-950 border-slate-700 font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-400">Meta Qtde</Label>
                      <Input
                        type="number"
                        name="meta_agendamentos_qtde"
                        value={formData.meta_agendamentos_qtde}
                        onChange={handleChange}
                        className="bg-slate-950 border-slate-800 text-slate-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-400">Meta (% Agend.)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        name="meta_agendamentos_perc"
                        value={formData.meta_agendamentos_perc}
                        onChange={handleChange}
                        className="bg-slate-950 border-slate-800 text-slate-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300 flex items-center gap-2">
                        % Agendados
                        <span className="text-[9px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                          Auto
                        </span>
                      </Label>
                      <Input
                        type="text"
                        value={`${taxaAgendamento.toFixed(1)}%`}
                        disabled
                        className="bg-slate-900 border-slate-800 text-blue-400 font-bold cursor-not-allowed opacity-80"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Comparecimentos */}
              <div className="space-y-4">
                <div className="bg-purple-950/10 p-5 rounded-xl border border-purple-900/30">
                  <h4 className="font-bold text-purple-400 uppercase text-xs tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    Comparecimentos
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Qtd Realizado</Label>
                      <Input
                        type="number"
                        name="comparecimentos_realizado"
                        value={formData.comparecimentos_realizado}
                        onChange={handleChange}
                        className="bg-slate-950 border-slate-700 font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-400">Meta Qtde</Label>
                      <Input
                        type="number"
                        name="meta_comparecimentos_qtde"
                        value={formData.meta_comparecimentos_qtde}
                        onChange={handleChange}
                        className="bg-slate-950 border-slate-800 text-slate-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-400">Meta (% Comp.)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        name="meta_comparecimentos_perc"
                        value={formData.meta_comparecimentos_perc}
                        onChange={handleChange}
                        className="bg-slate-950 border-slate-800 text-slate-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300 flex items-center gap-2">
                        % Comparecidos
                        <span className="text-[9px] text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                          Auto
                        </span>
                      </Label>
                      <Input
                        type="text"
                        value={`${taxaComparecimento.toFixed(1)}%`}
                        disabled
                        className="bg-slate-900 border-slate-800 text-purple-400 font-bold cursor-not-allowed opacity-80"
                      />
                    </div>
                    <div className="space-y-2 col-span-2 mt-2">
                      <div className="flex justify-between items-center bg-slate-900/50 px-3 py-2 rounded text-xs border border-slate-800">
                        <span className="text-slate-400">Faltas (Automático):</span>
                        <span className="text-red-400 font-medium">
                          {dado?.faltas_realizado || 0} faltas ({taxaFaltas.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fechamentos */}
              <div className="space-y-4">
                <div className="bg-emerald-950/10 p-5 rounded-xl border border-emerald-900/30 h-full">
                  <h4 className="font-bold text-emerald-400 uppercase text-xs tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Fechamentos (Vendas)
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300 flex items-center gap-2">
                        Qtd Realizado
                        <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                          Auto
                        </span>
                      </Label>
                      <Input
                        type="number"
                        name="fechamentos_qtde_realizado"
                        value={formData.fechamentos_qtde_realizado}
                        disabled
                        className="bg-slate-900 border-slate-800 text-emerald-500 font-medium cursor-not-allowed opacity-80"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-400 flex items-center gap-2">
                        Meta Qtde
                        <span className="text-[9px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                          Auto
                        </span>
                      </Label>
                      <Input
                        type="number"
                        value={
                          formData.ticket_medio_esperado
                            ? Math.round(
                                formData.meta_fechamento_valor / formData.ticket_medio_esperado,
                              )
                            : 0
                        }
                        disabled
                        className="bg-slate-900 border-slate-800 text-slate-400 font-medium cursor-not-allowed opacity-70"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-400">Meta (% Conv.)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        name="meta_fechamentos_perc"
                        value={formData.meta_fechamentos_perc}
                        onChange={handleChange}
                        className="bg-slate-950 border-slate-800 text-slate-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300 flex items-center gap-2">
                        % Conversão
                        <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                          Auto
                        </span>
                      </Label>
                      <Input
                        type="text"
                        value={`${taxaFechamento.toFixed(1)}%`}
                        disabled
                        className="bg-slate-900 border-slate-800 text-emerald-400 font-bold cursor-not-allowed opacity-80"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-400">Meta Receita (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        name="meta_fechamento_valor"
                        value={formData.meta_fechamento_valor}
                        onChange={handleChange}
                        className="bg-slate-950 border-slate-800 text-slate-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-400">Ticket Médio Esp. (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        name="ticket_medio_esperado"
                        value={formData.ticket_medio_esperado}
                        onChange={handleChange}
                        className="bg-slate-950 border-slate-800 text-slate-400"
                      />
                    </div>
                    <div className="space-y-2 col-span-2 pt-2">
                      <Label className="text-slate-300 flex items-center gap-2">
                        Receita Realizada (R$)
                        <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                          Auto
                        </span>
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        name="fechamentos_valor_realizado"
                        value={formData.fechamentos_valor_realizado}
                        disabled
                        className="bg-slate-900 border-slate-800 text-emerald-500 font-bold cursor-not-allowed opacity-80"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-800">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="hover:bg-slate-800 hover:text-white"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-amber-500 text-slate-950 hover:bg-amber-600 font-bold px-6"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Salvar Dados do Funil
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {vendaEditando && (
        <EditarVendaModal
          open={!!vendaEditando}
          onOpenChange={(isOpen: boolean) => !isOpen && setVendaEditando(null)}
          venda={vendaEditando}
          onSaved={() => {
            fetchAnalise()
            onUpdate()
          }}
        />
      )}
    </>
  )
}

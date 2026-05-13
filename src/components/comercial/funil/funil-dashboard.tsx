import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OrigemCard } from './origem-card'
import { DashboardLeadsModal } from './dashboard-leads-modal'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Users,
  DollarSign,
  Target,
  TrendingUp,
  PieChart as PieChartIcon,
  CheckSquare,
  Percent,
  TableProperties,
  Calendar,
  UserMinus,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function FunilDashboard({
  origens,
  dados,
  mesReferencia,
  avaliacoes,
  leads,
  vendas,
  etapas,
  temperaturas,
  onUpdate,
}: any) {
  const isClassico = (origemId: string) => {
    const origem = origens.find((o: any) => o.id === origemId)
    if (!origem || origem.ativo === false) return false
    const nome = origem.nome?.toLowerCase() || ''
    return nome.includes('facebook') || nome.includes('instagram')
  }

  const isSecundario = (origemId: string) => {
    const origem = origens.find((o: any) => o.id === origemId)
    if (!origem || origem.ativo === false) return false
    const nome = origem.nome?.toLowerCase() || ''
    return !nome.includes('facebook') && !nome.includes('instagram') && !nome.includes('recorrente')
  }

  const dadosAjustados = useMemo(() => {
    return (dados || []).map((d: any) => {
      const origem = origens.find((o: any) => o.id === d.origem_id)
      const origemNome = origem?.nome?.toLowerCase() || ''
      const isRecorrente = origemNome.includes('recorrente')
      const fechamentos = Number(d.fechamentos_qtde_realizado || 0)

      if (isRecorrente) {
        return {
          ...d,
          leads_realizado: Math.max(Number(d.leads_realizado || 0), fechamentos),
          agendamentos_realizado: Math.max(Number(d.agendamentos_realizado || 0), fechamentos),
          comparecimentos_realizado: Math.max(
            Number(d.comparecimentos_realizado || 0),
            fechamentos,
          ),
        }
      }
      return { ...d }
    })
  }, [dados, origens])

  const calcTotais = (dadosList: any[]) => {
    return dadosList.reduce(
      (acc: any, curr: any) => {
        return {
          investimento: acc.investimento + Number(curr.investimento || 0),
          leads: acc.leads + Number(curr.leads_realizado || 0),
          agendamentos: acc.agendamentos + Number(curr.agendamentos_realizado || 0),
          comparecimentos: acc.comparecimentos + Number(curr.comparecimentos_realizado || 0),
          faltas: acc.faltas + Number(curr.faltas_realizado || 0),
          fechamentos: acc.fechamentos + Number(curr.fechamentos_qtde_realizado || 0),
          valor_fechado: acc.valor_fechado + Number(curr.fechamentos_valor_realizado || 0),
        }
      },
      {
        investimento: 0,
        leads: 0,
        agendamentos: 0,
        comparecimentos: 0,
        faltas: 0,
        fechamentos: 0,
        valor_fechado: 0,
      },
    )
  }

  const totaisGerais = useMemo(() => calcTotais(dadosAjustados), [dadosAjustados, origens])

  const leadsQualificados = useMemo(
    () =>
      dadosAjustados.reduce((acc: number, curr: any) => {
        const origem = origens.find((o: any) => o.id === curr.origem_id)
        if (!origem || origem.ativo === false) return acc
        return acc + Number(curr.leads_realizado || 0)
      }, 0),
    [dadosAjustados, origens],
  )
  const totaisClassico = useMemo(
    () => calcTotais(dadosAjustados.filter((d: any) => isClassico(d.origem_id))),
    [dadosAjustados, origens],
  )
  const totaisSecundario = useMemo(() => {
    const padrao = calcTotais(dadosAjustados.filter((d: any) => isSecundario(d.origem_id)))

    if (!leads) return { ...padrao, leads: 0 }

    const unifiedAgendamentos = new Map()
    const unifiedComparecimentos = new Map()
    const unifiedFaltas = new Map()

    ;(leads || []).forEach((lead: any) => {
      const oId = lead.origem_id
      if (!isSecundario(oId)) return

      const status = (lead.status || '').toLowerCase()
      if (['erro', 'rascunho', 'lixo', 'duplicado', 'teste', 'invalido'].includes(status)) return

      if (!lead.nome || String(lead.nome).trim() === '') return
      const nome = String(lead.nome).trim().toLowerCase()
      if (nome.includes('teste') || nome.includes('duplicado')) return

      const isAgendado = [
        'agendado',
        'reagendado',
        'atendido',
        'faltou',
        'negociacao',
        'venda-fechada',
        'venda_concretizada',
        'venda-perdida',
        'avaliacao',
        'fechamento',
        'em_follow_up',
      ].includes(status)
      const isCompareceu = [
        'atendido',
        'negociacao',
        'venda-fechada',
        'venda_concretizada',
        'venda-perdida',
        'avaliacao',
        'fechamento',
        'em_follow_up',
      ].includes(status)
      const isFaltante = status === 'faltou'

      if (isAgendado) unifiedAgendamentos.set(nome, true)
      if (isCompareceu) unifiedComparecimentos.set(nome, true)
      if (isFaltante) unifiedFaltas.set(nome, true)
    })

    ;(avaliacoes || []).forEach((av: any) => {
      const oId = av.origem_id
      if (!isSecundario(oId)) return

      const status = (av.status || '').toLowerCase()
      if (['erro', 'rascunho', 'lixo', 'duplicado', 'teste', 'invalido'].includes(status)) return

      if (!av.pacientes?.nome || String(av.pacientes.nome).trim() === '') return
      const nome = String(av.pacientes.nome).trim().toLowerCase()
      if (nome.includes('teste') || nome.includes('duplicado')) return

      unifiedAgendamentos.set(nome, true)
      unifiedComparecimentos.set(nome, true)
    })

    ;(vendas || []).forEach((v: any) => {
      const oId = v.origem_id || v.avaliacoes?.origem_id
      if (!isSecundario(oId)) return

      if (!v.paciente_nome || String(v.paciente_nome).trim() === '') return
      const nome = String(v.paciente_nome).trim().toLowerCase()
      if (nome.includes('teste') || nome.includes('duplicado')) return

      unifiedAgendamentos.set(nome, true)
      unifiedComparecimentos.set(nome, true)
    })

    return {
      ...padrao,
      leads: padrao.leads,
      agendamentos: unifiedAgendamentos.size,
      comparecimentos: unifiedComparecimentos.size,
      faltas: unifiedFaltas.size,
    }
  }, [dadosAjustados, origens, leads, avaliacoes, vendas])

  const avaliacoesAtuais = useMemo(() => {
    if (!avaliacoes) return []
    const map = new Map()
    avaliacoes.forEach((a: any) => {
      const status = (a.status || '').toLowerCase()
      if (['erro', 'rascunho', 'lixo', 'duplicado', 'teste', 'invalido'].includes(status)) {
        return
      }

      if (!a.pacientes?.nome || String(a.pacientes.nome).trim() === '') return
      const nome = String(a.pacientes.nome).trim().toLowerCase()
      if (nome.includes('teste') || nome.includes('duplicado')) return

      if (map.has(nome)) {
        const existing = map.get(nome)
        if (
          Number(a.valor_orcamento || 0) > Number(existing.valor_orcamento || 0) ||
          a.status === 'venda_concretizada' ||
          a.status === 'venda-fechada'
        ) {
          map.set(nome, a)
        }
      } else {
        map.set(nome, a)
      }
    })
    return Array.from(map.values())
  }, [avaliacoes])

  const totalAvaliacoes = Math.max(avaliacoesAtuais.length, totaisGerais.fechamentos)

  const calcValorOportunidades = (avs: any[], fechadoTotal: number) => {
    const totalOrcamentos = avs.reduce(
      (acc: number, curr: any) => acc + (Number(curr.valor_orcamento) || 0),
      0,
    )
    return Math.max(totalOrcamentos, fechadoTotal)
  }

  const valorOportunidadesClassico = useMemo(
    () =>
      calcValorOportunidades(
        avaliacoesAtuais.filter((a: any) => isClassico(a.origem_id)),
        totaisClassico.valor_fechado,
      ),
    [avaliacoesAtuais, origens, totaisClassico.valor_fechado],
  )

  const valorOportunidadesSecundario = useMemo(
    () =>
      calcValorOportunidades(
        avaliacoesAtuais.filter((a: any) => isSecundario(a.origem_id)),
        totaisSecundario.valor_fechado,
      ),
    [avaliacoesAtuais, origens, totaisSecundario.valor_fechado],
  )

  const conversaoTotalClassico =
    valorOportunidadesClassico > 0
      ? (totaisClassico.valor_fechado / valorOportunidadesClassico) * 100
      : 0
  const conversaoTotalSecundario =
    valorOportunidadesSecundario > 0
      ? (totaisSecundario.valor_fechado / valorOportunidadesSecundario) * 100
      : 0

  const pieData = useMemo(() => {
    return origens
      .filter((o: any) => o.ativo)
      .map((o: any) => {
        const d = dadosAjustados.find((x: any) => x.origem_id === o.id)
        return { name: o.nome, value: d ? Number(d.leads_realizado) : 0 }
      })
      .filter((x: any) => x.value > 0)
  }, [origens, dadosAjustados])

  const COLORS = [
    '#f59e0b',
    '#3b82f6',
    '#10b981',
    '#ef4444',
    '#8b5cf6',
    '#d946ef',
    '#f97316',
    '#06b6d4',
  ]

  const chartConfig = {
    value: { label: 'Leads', color: 'hsl(var(--chart-1))' },
  }

  const barData = useMemo(() => {
    return origens
      .filter((o: any) => o.ativo)
      .map((o: any) => {
        const d = dadosAjustados.find((x: any) => x.origem_id === o.id)
        return {
          name: o.nome,
          investimento: d ? Number(d.investimento) : 0,
          receita: d ? Number(d.fechamentos_valor_realizado) : 0,
        }
      })
      .filter((x: any) => x.investimento > 0 || x.receita > 0)
  }, [origens, dadosAjustados])

  const barChartConfig = {
    investimento: { label: 'Investimento', color: '#ef4444' },
    receita: { label: 'Receita', color: '#10b981' },
  }

  const matrizData = useMemo(() => {
    return origens
      .filter((o: any) => o.ativo)
      .map((o: any) => {
        const d = dadosAjustados.find((x: any) => x.origem_id === o.id) || {}
        const leads = Number(d.leads_realizado || 0)
        const vendas = Number(d.fechamentos_qtde_realizado || 0)
        const valor = Number(d.fechamentos_valor_realizado || 0)
        const ticketMedio = vendas > 0 ? valor / vendas : 0
        const conversao = leads > 0 ? (vendas / leads) * 100 : 0

        return {
          id: o.id,
          origem: o.nome,
          leads,
          vendas,
          valor,
          ticketMedio,
          conversao,
        }
      })
      .sort((a: any, b: any) => b.valor - a.valor)
  }, [origens, dados])

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean
    type: 'leads' | 'agendamentos' | 'comparecimentos' | 'faltas' | 'fechamentos' | 'oportunidades'
    origens: string[]
    title: string
  }>({
    isOpen: false,
    type: 'leads',
    origens: [],
    title: '',
  })

  const formatBrl = (v: number) =>
    Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const origensClassico = useMemo(
    () => origens.filter((o: any) => isClassico(o.id)).map((o: any) => o.id),
    [origens],
  )
  const origensSecundario = useMemo(
    () => origens.filter((o: any) => isSecundario(o.id)).map((o: any) => o.id),
    [origens],
  )

  const renderFunnelBlocks = (totais: any, origensFilter: string[], funilName: string) => {
    return (
      <div className="grid gap-3 text-center grid-cols-2 md:grid-cols-5">
        <div
          className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner flex flex-col items-center justify-center cursor-pointer hover:bg-slate-900 transition-colors"
          onClick={() =>
            setModalConfig({
              isOpen: true,
              type: 'leads',
              origens: origensFilter,
              title: `Leads - ${funilName}`,
            })
          }
        >
          <Users className="w-5 h-5 text-slate-400 mb-2" />
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Leads
          </span>
          <span className="text-2xl font-bold text-white">{totais.leads}</span>
        </div>
        <div
          className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner flex flex-col items-center justify-center relative cursor-pointer hover:bg-slate-900 transition-colors"
          onClick={() =>
            setModalConfig({
              isOpen: true,
              type: 'agendamentos',
              origens: origensFilter,
              title: `Agendamentos - ${funilName}`,
            })
          }
        >
          <ArrowRight className="hidden md:block w-3 h-3 text-slate-600 absolute -left-2 top-1/2 -translate-y-1/2" />
          <Calendar className="w-5 h-5 text-blue-500 mb-2" />
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Agendamento
          </span>
          <span className="text-2xl font-bold text-white">{totais.agendamentos}</span>
        </div>
        <div
          className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner flex flex-col items-center justify-center relative cursor-pointer hover:bg-slate-900 transition-colors"
          onClick={() =>
            setModalConfig({
              isOpen: true,
              type: 'comparecimentos',
              origens: origensFilter,
              title: `Comparecimentos - ${funilName}`,
            })
          }
        >
          <ArrowRight className="hidden md:block w-3 h-3 text-slate-600 absolute -left-2 top-1/2 -translate-y-1/2" />
          <CheckSquare className="w-5 h-5 text-purple-500 mb-2" />
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Comparecimento
          </span>
          <span className="text-2xl font-bold text-white">{totais.comparecimentos}</span>
        </div>
        <div
          className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner flex flex-col items-center justify-center relative cursor-pointer hover:bg-slate-900 transition-colors"
          onClick={() =>
            setModalConfig({
              isOpen: true,
              type: 'faltas',
              origens: origensFilter,
              title: `Faltas - ${funilName}`,
            })
          }
        >
          <ArrowRight className="hidden md:block w-3 h-3 text-slate-600 absolute -left-2 top-1/2 -translate-y-1/2" />
          <UserMinus className="w-5 h-5 text-rose-500 mb-2" />
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Faltas
          </span>
          <span className="text-2xl font-bold text-white">{totais.faltas}</span>
        </div>
        <div
          className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner flex flex-col items-center justify-center relative cursor-pointer hover:bg-slate-900 transition-colors"
          onClick={() =>
            setModalConfig({
              isOpen: true,
              type: 'fechamentos',
              origens: origensFilter,
              title: `Fechamentos - ${funilName}`,
            })
          }
        >
          <ArrowRight className="hidden md:block w-3 h-3 text-slate-600 absolute -left-2 top-1/2 -translate-y-1/2" />
          <DollarSign className="w-5 h-5 text-emerald-500 mb-2" />
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Fechamento
          </span>
          <span className="text-2xl font-bold text-emerald-400">{totais.fechamentos}</span>
        </div>
      </div>
    )
  }

  const renderOportunidadesBlocks = (
    valorOpp: number,
    conversao: number,
    totais: any,
    origensFilter: string[],
    funilName: string,
  ) => (
    <div className="grid grid-cols-4 gap-3 text-center">
      <div
        className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner flex flex-col items-center justify-center cursor-pointer hover:bg-slate-900 transition-colors"
        onClick={() =>
          setModalConfig({
            isOpen: true,
            type: 'oportunidades',
            origens: origensFilter,
            title: `Oportunidades Geradas - ${funilName}`,
          })
        }
      >
        <Target className="w-5 h-5 text-purple-500 mb-2" />
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Oport. Geradas
        </span>
        <span className="text-lg font-bold text-white">{formatBrl(valorOpp)}</span>
      </div>
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner flex flex-col items-center justify-center relative">
        <ArrowRight className="hidden sm:block w-3 h-3 text-slate-600 absolute -left-3 top-1/2 -translate-y-1/2" />
        <Percent className="w-5 h-5 text-blue-500 mb-2" />
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Conversão Total
        </span>
        <span className="text-2xl font-bold text-white">{conversao.toFixed(1)}%</span>
      </div>
      <div
        className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner flex flex-col items-center justify-center relative cursor-pointer hover:bg-slate-900 transition-colors"
        onClick={() =>
          setModalConfig({
            isOpen: true,
            type: 'fechamentos',
            origens: origensFilter,
            title: `Fechamentos - ${funilName}`,
          })
        }
      >
        <ArrowRight className="hidden sm:block w-3 h-3 text-slate-600 absolute -left-3 top-1/2 -translate-y-1/2" />
        <CheckSquare className="w-5 h-5 text-emerald-500 mb-2" />
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Fechamentos
        </span>
        <span className="text-2xl font-bold text-white">{totais.fechamentos}</span>
      </div>
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner flex flex-col items-center justify-center relative">
        <ArrowRight className="hidden sm:block w-3 h-3 text-slate-600 absolute -left-3 top-1/2 -translate-y-1/2" />
        <DollarSign className="w-5 h-5 text-amber-500 mb-2" />
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Ticket Médio
        </span>
        <span className="text-lg font-bold text-emerald-400">
          {formatBrl(totais.fechamentos > 0 ? totais.valor_fechado / totais.fechamentos : 0)}
        </span>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <Card className="bg-slate-900 border-slate-800 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-800/50 pb-4 bg-slate-900/50">
          <CardTitle className="text-white font-semibold text-lg flex items-center gap-2">
            <TableProperties className="w-5 h-5 text-amber-500" />
            Matriz de Vendas por Origem
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-950/50">
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400 font-semibold uppercase tracking-wider text-xs">
                    Origem
                  </TableHead>
                  <TableHead className="text-slate-400 font-semibold uppercase tracking-wider text-xs text-right">
                    Leads
                  </TableHead>
                  <TableHead className="text-slate-400 font-semibold uppercase tracking-wider text-xs text-right">
                    Vendas (Qtde)
                  </TableHead>
                  <TableHead className="text-slate-400 font-semibold uppercase tracking-wider text-xs text-right">
                    Valor Total
                  </TableHead>
                  <TableHead className="text-slate-400 font-semibold uppercase tracking-wider text-xs text-right">
                    Ticket Médio
                  </TableHead>
                  <TableHead className="text-slate-400 font-semibold uppercase tracking-wider text-xs text-right">
                    Conversão
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matrizData.length > 0 ? (
                  matrizData.map((row: any) => (
                    <TableRow
                      key={row.id}
                      className="border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                    >
                      <TableCell className="font-medium text-slate-300">{row.origem}</TableCell>
                      <TableCell className="text-right text-slate-300">{row.leads}</TableCell>
                      <TableCell className="text-right text-slate-300">{row.vendas}</TableCell>
                      <TableCell className="text-right text-emerald-400 font-medium">
                        {formatBrl(row.valor)}
                      </TableCell>
                      <TableCell className="text-right text-slate-300">
                        {formatBrl(row.ticketMedio)}
                      </TableCell>
                      <TableCell className="text-right text-amber-400">
                        {row.conversao.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-slate-500">
                      Nenhum dado encontrado para o período.
                    </TableCell>
                  </TableRow>
                )}
                {matrizData.length > 0 && (
                  <TableRow className="border-t-2 border-slate-800 bg-slate-950/30 hover:bg-slate-950/30">
                    <TableCell className="font-bold text-white uppercase text-xs tracking-wider">
                      Total
                    </TableCell>
                    <TableCell className="text-right font-bold text-white">
                      {matrizData.reduce((acc: number, r: any) => acc + r.leads, 0)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-white">
                      {matrizData.reduce((acc: number, r: any) => acc + r.vendas, 0)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-emerald-400">
                      {formatBrl(matrizData.reduce((acc: number, r: any) => acc + r.valor, 0))}
                    </TableCell>
                    <TableCell className="text-right font-bold text-white">
                      {matrizData.reduce((acc: number, r: any) => acc + r.vendas, 0) > 0
                        ? formatBrl(
                            matrizData.reduce((acc: number, r: any) => acc + r.valor, 0) /
                              matrizData.reduce((acc: number, r: any) => acc + r.vendas, 0),
                          )
                        : formatBrl(0)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-amber-400">
                      {matrizData.reduce((acc: number, r: any) => acc + r.leads, 0) > 0
                        ? (
                            (matrizData.reduce((acc: number, r: any) => acc + r.vendas, 0) /
                              matrizData.reduce((acc: number, r: any) => acc + r.leads, 0)) *
                            100
                          ).toFixed(1)
                        : '0.0'}
                      %
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-2 gap-4">
        <Card
          className="bg-slate-900 border-slate-800 shadow-sm transition-all hover:border-slate-700 cursor-pointer hover:bg-slate-800/50"
          onClick={() =>
            setModalConfig({
              isOpen: true,
              type: 'leads',
              origens: origens.map((o: any) => o.id),
              title: 'Leads Qualificados (Global)',
            })
          }
        >
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Leads Qualificados
            </CardTitle>
            <Users className="w-5 h-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{leadsQualificados}</div>
            <p className="text-xs text-slate-400 mt-1">Total de leads gerados</p>
          </CardContent>
        </Card>

        <Card
          className="bg-slate-900 border-slate-800 shadow-sm transition-all hover:border-slate-700 cursor-pointer hover:bg-slate-800/50"
          onClick={() =>
            setModalConfig({
              isOpen: true,
              type: 'oportunidades',
              origens: origens.map((o: any) => o.id),
              title: 'Avaliações Realizadas (Global)',
            })
          }
        >
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Avaliações Realizadas
            </CardTitle>
            <CheckSquare className="w-5 h-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{totalAvaliacoes}</div>
            <p className="text-xs text-slate-400 mt-1">Total de avaliações e vendas</p>
          </CardContent>
        </Card>
      </div>

      {/* Central de Conversão */}
      <div className="space-y-6 pt-2">
        <div className="flex items-center gap-4 py-2">
          <div className="h-px bg-slate-800 flex-1"></div>
          <div className="flex items-center gap-2 bg-slate-800 px-6 py-3 rounded-md border border-slate-700 shadow-sm">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <h3 className="text-sm font-bold text-white tracking-widest uppercase">
              Central de Conversão
            </h3>
          </div>
          <div className="h-px bg-slate-800 flex-1"></div>
        </div>

        {/* Funil Clássico */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-slate-900 border-slate-800 shadow-sm">
            <CardHeader className="border-b border-slate-800/50 pb-4">
              <CardTitle className="text-white font-semibold text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" />
                Funil Clássico (Tráfego Pago)
              </CardTitle>
              <p className="text-[11px] text-slate-400 mt-1.5 uppercase tracking-wider">
                Facebook e Instagram
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              {renderFunnelBlocks(totaisClassico, origensClassico, 'Funil Clássico')}
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 shadow-sm">
            <CardHeader className="border-b border-slate-800/50 pb-4">
              <div className="flex flex-col">
                <CardTitle className="text-white font-semibold text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-amber-500" />
                  Funil Clássico: Oportunidades em R$
                </CardTitle>
                <p className="text-[11px] text-slate-400 mt-1.5 uppercase tracking-wider">
                  Soma de avaliações do Funil Clássico
                </p>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {renderOportunidadesBlocks(
                valorOportunidadesClassico,
                conversaoTotalClassico,
                totaisClassico,
                origensClassico,
                'Funil Clássico',
              )}
            </CardContent>
          </Card>
        </div>

        {/* Funil Secundário */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card className="bg-slate-900 border-slate-800 shadow-sm">
            <CardHeader className="border-b border-slate-800/50 pb-4">
              <CardTitle className="text-white font-semibold text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-500" />
                Funil Secundário (Orgânico e Outros)
              </CardTitle>
              <p className="text-[11px] text-slate-400 mt-1.5 uppercase tracking-wider">
                Indicações, Google, Sorriso dos Sonhos e Campanhas
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              {renderFunnelBlocks(totaisSecundario, origensSecundario, 'Funil Secundário')}
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 shadow-sm">
            <CardHeader className="border-b border-slate-800/50 pb-4">
              <div className="flex flex-col">
                <CardTitle className="text-white font-semibold text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-500" />
                  Funil Secundário: Oportunidades em R$
                </CardTitle>
                <p className="text-[11px] text-slate-400 mt-1.5 uppercase tracking-wider">
                  Soma de avaliações do Funil Secundário
                </p>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {renderOportunidadesBlocks(
                valorOportunidadesSecundario,
                conversaoTotalSecundario,
                totaisSecundario,
                origensSecundario,
                'Funil Secundário',
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800 shadow-sm">
          <CardHeader className="border-b border-slate-800/50 pb-4">
            <CardTitle className="text-white font-semibold text-lg flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-amber-500" />
              Distribuição de Leads por Origem
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[320px] pt-6">
            {pieData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-full w-full">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {pieData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="flex flex-col h-full items-center justify-center text-slate-500 gap-2">
                <Users className="w-8 h-8 text-slate-700" />
                <span>Sem dados de leads no período</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 shadow-sm">
          <CardHeader className="border-b border-slate-800/50 pb-4">
            <CardTitle className="text-white font-semibold text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              Performance Financeira
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[320px] pt-6">
            {barData.length > 0 ? (
              <ChartContainer config={barChartConfig} className="h-full w-full">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `R$ ${value / 1000}k`}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent formatter={(value) => formatBrl(Number(value))} />
                    }
                  />
                  <Bar
                    dataKey="investimento"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                    name="Investimento"
                  />
                  <Bar dataKey="receita" fill="#10b981" radius={[4, 4, 0, 0]} name="Receita" />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex flex-col h-full items-center justify-center text-slate-500 gap-2">
                <DollarSign className="w-8 h-8 text-slate-700" />
                <span>Sem dados financeiros no período</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6 pt-4">
        <div className="flex items-center gap-4 py-2 mt-4">
          <div className="h-px bg-slate-800 flex-1"></div>
          <div className="flex items-center gap-2 bg-slate-800 px-6 py-3 rounded-md border border-slate-700 shadow-sm">
            <Target className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-white tracking-widest uppercase">
              Detalhamento da Cascata
            </h3>
          </div>
          <div className="h-px bg-slate-800 flex-1"></div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {origens
            .filter((o: any) => o.ativo)
            .map((origem: any) => (
              <OrigemCard
                key={origem.id}
                origem={origem}
                dado={dadosAjustados.find((d: any) => d.origem_id === origem.id)}
                mesReferencia={mesReferencia}
                etapas={etapas}
                temperaturas={temperaturas}
                onUpdate={onUpdate}
              />
            ))}
          {origens.filter((o: any) => o.ativo).length === 0 && (
            <div className="col-span-full p-12 text-center text-slate-400 bg-slate-900/50 rounded-lg border border-slate-800 flex flex-col items-center gap-3">
              <Target className="w-12 h-12 text-slate-700" />
              <p className="text-lg">Nenhuma origem ativa encontrada.</p>
              <p className="text-sm">
                Adicione fontes em "Origens" no topo da página para começar a analisar seu funil.
              </p>
            </div>
          )}
        </div>
      </div>

      <DashboardLeadsModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        type={modalConfig.type}
        origens={modalConfig.origens}
        mesReferencia={mesReferencia}
        title={modalConfig.title}
      />
    </div>
  )
}

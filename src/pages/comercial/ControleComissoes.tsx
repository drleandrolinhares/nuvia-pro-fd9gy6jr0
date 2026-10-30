import { useState, useEffect, useMemo, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DollarSign,
  Users,
  TrendingUp,
  BarChart3,
  Filter,
  CalendarClock,
  Settings,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { format, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ConfiguracaoFaixas } from '@/components/comissoes/configuracao-faixas'
import { ComissoesDashboardCards } from '@/components/comissoes/comissoes-dashboard-cards'
import { ComissoesTabela } from '@/components/comissoes/comissoes-tabela'
import { ProfessionalCards } from '@/components/comissoes/professional-cards'
import { BarraAcaoComissoes } from '@/components/comissoes/barra-acao-comissoes'
import { ModalRemoverComissao } from '@/components/comissoes/modal-remover-comissao'
import { PagamentosProgramadosTab } from '@/components/comissoes/pagamentos-programados-tab'
import {
  fetchComissoesPeriodo,
  type ComissaoVenda,
  type DashboardTotals,
  type ProfessionalSummary,
} from '@/services/comissoes-dashboard'
import { removerComissoesDoFechamento } from '@/services/comissao-ajustes'

export default function ControleComissoes() {
  const { toast } = useToast()
  const { profile } = useAuth()
  const [activeTab, setActiveTab] = useState('dash')
  const [mesAno, setMesAno] = useState(format(new Date(), 'yyyy-MM'))
  const [loading, setLoading] = useState(true)
  const [vendas, setVendas] = useState<ComissaoVenda[]>([])
  const [totals, setTotals] = useState<DashboardTotals>({
    totalComissaoDentista: 0,
    totalComissaoCRC: 0,
    totalVendas: 0,
    totalEntries: 0,
  })
  const [profissionais, setProfissionais] = useState<ProfessionalSummary[]>([])
  const [filtroDentista, setFiltroDentista] = useState<string>('todos')
  const [filtroCRC, setFiltroCRC] = useState<string>('todos')

  // Seleção de linhas para remoção
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [modalRemoverAberto, setModalRemoverAberto] = useState(false)
  const [salvandoRemocao, setSalvandoRemocao] = useState(false)

  const mesesOptions = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => {
        const d = subMonths(new Date(), i)
        return {
          value: format(d, 'yyyy-MM'),
          label: format(d, 'MMMM yyyy', { locale: ptBR }).replace(/^\w/, (c) => c.toUpperCase()),
        }
      }),
    [],
  )

  const competenciaLabel = mesesOptions.find((m) => m.value === mesAno)?.label || ''

  const dentistasOptions = useMemo(() => {
    const map = new Map<string, string>()
    vendas.forEach((v) => {
      if (v.dentista_avaliador && v.dentista_nome) {
        map.set(v.dentista_avaliador, v.dentista_nome)
      }
    })
    return Array.from(map.entries())
      .map(([id, nome]) => ({ id, nome }))
      .sort((a, b) => a.nome.localeCompare(b.nome))
  }, [vendas])

  const crcOptions = useMemo(() => {
    const map = new Map<string, string>()
    vendas.forEach((v) => {
      if (v.crc && v.crc_nome) {
        map.set(v.crc, v.crc_nome)
      }
    })
    return Array.from(map.entries())
      .map(([id, nome]) => ({ id, nome }))
      .sort((a, b) => a.nome.localeCompare(b.nome))
  }, [vendas])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const { vendas: v, totals: t, profissionais: p } = await fetchComissoesPeriodo(mesAno)
      setVendas(v)
      setTotals(t)
      setProfissionais(p)
      // Limpa IDs que já não existem no período
      setSelectedIds((prev) => {
        const next = new Set<string>()
        const validIds = new Set(v.map((item) => item.id))
        prev.forEach((id) => {
          if (validIds.has(id)) next.add(id)
        })
        return next
      })
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar dados',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [mesAno, toast])

  useEffect(() => {
    loadData()

    const channel = supabase
      .channel(`comissoes-page-${Math.random()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vendas_confirmadas' }, () =>
        loadData(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'referencias_comissao_dentista' },
        () => loadData(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'referencias_comissao_crc' },
        () => loadData(),
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comissao_ajustes' }, () =>
        loadData(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadData])

  // Gerenciamento de seleção
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleToggleSelectAll = (items: ComissaoVenda[]) => {
    setSelectedIds((prev) => {
      const allSelected = items.every((i) => prev.has(i.id))
      const next = new Set(prev)
      if (allSelected) {
        items.forEach((i) => next.delete(i.id))
      } else {
        items.forEach((i) => next.add(i.id))
      }
      return next
    })
  }

  const comissoesSelecionadas = useMemo(() => {
    return vendas.filter((v) => selectedIds.has(v.id))
  }, [vendas, selectedIds])

  const tipoAbaAtiva: 'dentista' | 'crc' = activeTab === 'crc' ? 'crc' : 'dentista'

  const totalComissoesSelecionadas = useMemo(() => {
    return comissoesSelecionadas.reduce((acc, v) => {
      return acc + (tipoAbaAtiva === 'dentista' ? v.valor_comissao_dentista : v.valor_comissao_crc)
    }, 0)
  }, [comissoesSelecionadas, tipoAbaAtiva])

  const totalTratamentoSelecionado = useMemo(() => {
    return comissoesSelecionadas.reduce((acc, v) => acc + v.valor_tratamento, 0)
  }, [comissoesSelecionadas])

  const handleConfirmarRemocao = async (dados: {
    tipo: 'cancelada' | 'programada'
    justificativa: string
    dataProgramada?: string
  }) => {
    if (comissoesSelecionadas.length === 0) return

    setSalvandoRemocao(true)
    try {
      const inputs = comissoesSelecionadas.map((v) => ({
        comissao_id: v.id,
        tipo: dados.tipo,
        justificativa: dados.justificativa,
        data_programada: dados.dataProgramada,
        usuario_id: profile?.id || null,
        usuario_nome: profile?.nome || 'Usuário do Sistema',
        dados_venda: v,
      }))

      await removerComissoesDoFechamento(inputs)

      toast({
        title:
          dados.tipo === 'programada'
            ? 'Comissões agendadas com sucesso!'
            : 'Comissões canceladas com sucesso!',
        description: `${comissoesSelecionadas.length} comissão(ões) removida(s) deste fechamento com recálculo automático e auditoria registrada.`,
      })

      setSelectedIds(new Set())
      await loadData()
    } catch (err: any) {
      toast({
        title: 'Erro ao remover comissões',
        description: err.message,
        variant: 'destructive',
      })
      throw err
    } finally {
      setSalvandoRemocao(false)
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto bg-white min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2 bg-slate-900 p-6 rounded-xl border-l-4 border-amber-500 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-800 rounded-lg">
            <DollarSign className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white uppercase">
              Controle de Comissões
            </h1>
            <p className="text-slate-400 mt-1 text-sm uppercase tracking-wider font-medium">
              Cálculo agregado por profissional — Comissões de Dentistas e CRC Comercial
            </p>
          </div>
        </div>
        <div className="w-full md:w-56">
          <Select value={mesAno} onValueChange={setMesAno}>
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
              <SelectValue placeholder="Mês/Ano" />
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

      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-amber-500" />
        <h2 className="text-lg font-bold text-slate-900">Visão Geral</h2>
        <span className="text-sm text-slate-500">({competenciaLabel})</span>
      </div>
      <ComissoesDashboardCards totals={totals} competencia={competenciaLabel} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 max-w-4xl bg-slate-900 border border-slate-800 h-auto p-1">
          <TabsTrigger
            value="dash"
            className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400 text-xs md:text-sm py-2"
          >
            <BarChart3 className="w-4 h-4 mr-1 md:mr-1.5" />
            <span className="hidden sm:inline">DASH POR VENDEDOR</span>
            <span className="sm:hidden">DASH</span>
          </TabsTrigger>
          <TabsTrigger
            value="dentistas"
            className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400 text-xs md:text-sm py-2"
          >
            DENTISTAS
          </TabsTrigger>
          <TabsTrigger
            value="crc"
            className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400 text-xs md:text-sm py-2"
          >
            CRC
          </TabsTrigger>
          <TabsTrigger
            value="programados"
            className="data-[state=active]:bg-slate-800 data-[state=active]:text-amber-400 text-slate-400 text-xs md:text-sm py-2 font-medium"
          >
            <CalendarClock className="w-4 h-4 mr-1 md:mr-1.5 text-amber-500" />
            <span className="hidden sm:inline">PAGAMENTOS PROGRAMADOS</span>
            <span className="sm:hidden">PROGRAMADOS</span>
          </TabsTrigger>
          <TabsTrigger
            value="configuracoes"
            className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400 text-xs md:text-sm py-2"
          >
            <Settings className="w-4 h-4 mr-1 md:mr-1.5" />
            CONFIG.
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dash" className="mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900">
              Performance Individual por Profissional
            </h2>
            <span className="text-sm text-slate-500">({competenciaLabel})</span>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <ProfessionalCards profissionais={profissionais} />
          )}
        </TabsContent>

        <TabsContent value="dentistas" className="mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-slate-900">
                Comissões — Dentistas Avaliadores
              </h2>
              <span className="text-sm text-slate-500">({competenciaLabel})</span>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <Select value={filtroDentista} onValueChange={setFiltroDentista}>
                <SelectTrigger className="w-[240px] bg-white border-slate-300 text-slate-900">
                  <SelectValue placeholder="Todos os dentistas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os dentistas</SelectItem>
                  {dentistasOptions.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <ComissoesTabela
            vendas={vendas}
            tipo="dentista"
            loading={loading}
            profissionalFilter={filtroDentista}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
          />
        </TabsContent>

        <TabsContent value="crc" className="mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-slate-900">Comissões — CRC Comercial</h2>
              <span className="text-sm text-slate-500">({competenciaLabel})</span>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <Select value={filtroCRC} onValueChange={setFiltroCRC}>
                <SelectTrigger className="w-[240px] bg-white border-slate-300 text-slate-900">
                  <SelectValue placeholder="Todos os agentes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os agentes</SelectItem>
                  {crcOptions.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <ComissoesTabela
            vendas={vendas}
            tipo="crc"
            loading={loading}
            profissionalFilter={filtroCRC}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
          />
        </TabsContent>

        <TabsContent value="programados" className="mt-6">
          <div className="flex items-center gap-2 mb-4">
            <CalendarClock className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900">Controle de Pagamentos Programados</h2>
            <span className="text-sm text-slate-500">({competenciaLabel})</span>
          </div>
          <PagamentosProgramadosTab
            competencia={competenciaLabel}
            onAtualizarDashboard={loadData}
          />
        </TabsContent>

        <TabsContent value="configuracoes" className="mt-6">
          <ConfiguracaoFaixas />
        </TabsContent>
      </Tabs>

      {/* Barra de Ação Flutuante ao Selecionar Linhas (Dentistas ou CRC) */}
      {(activeTab === 'dentistas' || activeTab === 'crc') && (
        <BarraAcaoComissoes
          quantidade={selectedIds.size}
          totalComissao={totalComissoesSelecionadas}
          totalVendas={totalTratamentoSelecionado}
          onRemover={() => setModalRemoverAberto(true)}
          onLimparSelecao={() => setSelectedIds(new Set())}
        />
      )}

      {/* Modal de Remoção com Justificativa Obrigatória */}
      <ModalRemoverComissao
        open={modalRemoverAberto}
        onOpenChange={setModalRemoverAberto}
        comissoes={comissoesSelecionadas}
        tipoAbaAtiva={tipoAbaAtiva}
        onConfirmar={handleConfirmarRemocao}
        loading={salvandoRemocao}
      />
    </div>
  )
}

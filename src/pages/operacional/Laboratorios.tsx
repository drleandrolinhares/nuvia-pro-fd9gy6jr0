import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { usePageState } from '@/hooks/use-page-state'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import {
  LaboratorioTipo,
  LaboratorioTrabalho,
  NovoLaboratorioTrabalho,
  LABORATORIOS_CONFIG,
  calcularDiasUteis,
  calcularDiasAtraso,
  calcularStatus,
  devePiscarAlerta,
  fetchLaboratoriosTrabalhos,
  createLaboratorioTrabalho,
  updateLaboratorioTrabalho,
  marcarComoEntregue,
  reabrirTrabalho,
  confirmarComLaboratorio,
  deleteLaboratorioTrabalho,
} from '@/services/laboratorios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  FlaskConical,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Edit2,
  Trash2,
  PhoneCall,
  Calendar,
  Layers,
  ArrowUpDown,
  FileSpreadsheet,
  RotateCcw,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function Laboratorios() {
  const { user, profile } = useAuth()
  const { toast } = useToast()

  // Filtros e busca persistidos
  const [labFiltro, setLabFiltro] = usePageState<LaboratorioTipo | 'todos'>(
    '/operacional/laboratorios',
    'labFiltro',
    'todos',
  )
  const [busca, setBusca] = usePageState('/operacional/laboratorios', 'busca', '')
  const [mostrarEntregues, setMostrarEntregues] = usePageState(
    '/operacional/laboratorios',
    'mostrarEntregues',
    false,
  )
  const [statusFiltro, setStatusFiltro] = usePageState<string>(
    '/operacional/laboratorios',
    'statusFiltro',
    'todos',
  )

  // Dados
  const [trabalhos, setTrabalhos] = useState<LaboratorioTrabalho[]>([])
  const [carregando, setCarregando] = useState(true)

  // Modais de Criação/Edição
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState<LaboratorioTrabalho | null>(null)
  const [salvando, setSalvando] = useState(false)

  // Confirmação de exclusão
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [excluindo, setExcluindo] = useState(false)

  // Form
  const [formData, setFormData] = useState<NovoLaboratorioTrabalho>({
    laboratorio: 'studio_acrilico',
    paciente: '',
    trabalho: '',
    data_envio: '',
    data_previsao_entrega: '',
    horario_previsto: '17:00',
    observacoes: '',
  })

  // Nome do operador logado
  const nomeUsuarioLogado = useMemo(() => {
    return (
      profile?.nome ||
      (user?.user_metadata as any)?.name ||
      user?.email?.split('@')[0] ||
      'Equipe Nuvia'
    )
  }, [profile, user])

  const carregarDados = async () => {
    setCarregando(true)
    try {
      // Sempre trazemos todos e entregues conforme o toggle
      const data = await fetchLaboratoriosTrabalhos(
        labFiltro === 'todos' ? undefined : labFiltro,
        mostrarEntregues,
      )
      setTrabalhos(data)
    } catch (err: any) {
      toast({
        title: 'Erro ao carregar dados',
        description: err.message || 'Falha na conexão com o banco de dados.',
        variant: 'destructive',
      })
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [labFiltro, mostrarEntregues])

  // Filtragem e Ordenação
  const trabalhosFiltrados = useMemo(() => {
    return trabalhos.filter((t) => {
      // Busca textual
      if (busca.trim()) {
        const q = busca.toLowerCase()
        const matchPaciente = t.paciente?.toLowerCase().includes(q)
        const matchTrabalho = t.trabalho?.toLowerCase().includes(q)
        const matchObs = t.observacoes?.toLowerCase().includes(q)
        const matchLab = LABORATORIOS_CONFIG[t.laboratorio]?.label.toLowerCase().includes(q)
        if (!matchPaciente && !matchTrabalho && !matchObs && !matchLab) {
          return false
        }
      }

      // Filtro de Status
      if (statusFiltro !== 'todos') {
        const st = calcularStatus(t.data_previsao_entrega, t.entregue, t.delivered_at)
        if (statusFiltro === 'alerta_1dia') {
          if (!devePiscarAlerta(t.data_previsao_entrega, t.entregue)) return false
        } else if (statusFiltro !== st) {
          return false
        }
      }

      return true
    })
  }, [trabalhos, busca, statusFiltro])

  // Contadores rápidos (Cards do topo)
  const metricas = useMemo(() => {
    let totalAtivos = 0
    let noPrazo = 0
    let atrasados = 0
    let alerta1Dia = 0
    let entregues = 0

    trabalhos.forEach((t) => {
      if (t.entregue) {
        entregues++
      } else {
        totalAtivos++
        const st = calcularStatus(t.data_previsao_entrega, t.entregue, t.delivered_at)
        if (st === 'ATRASADO') atrasados++
        if (st === 'NO PRAZO') noPrazo++
        if (devePiscarAlerta(t.data_previsao_entrega, t.entregue)) alerta1Dia++
      }
    })

    return { totalAtivos, noPrazo, atrasados, alerta1Dia, entregues }
  }, [trabalhos])

  // Handlers do Modal
  const abrirCriacao = (labPredefinido?: LaboratorioTipo) => {
    setEditando(null)
    setFormData({
      laboratorio: labPredefinido || (labFiltro !== 'todos' ? labFiltro : 'studio_acrilico'),
      paciente: '',
      trabalho: '',
      data_envio: format(new Date(), 'yyyy-MM-dd'),
      data_previsao_entrega: '',
      horario_previsto: '17:00',
      observacoes: '',
    })
    setModalOpen(true)
  }

  const abrirEdicao = (item: LaboratorioTrabalho) => {
    setEditando(item)
    setFormData({
      laboratorio: item.laboratorio,
      paciente: item.paciente,
      trabalho: item.trabalho,
      data_envio: item.data_envio || '',
      data_previsao_entrega: item.data_previsao_entrega || '',
      horario_previsto: item.horario_previsto ? item.horario_previsto.substring(0, 5) : '17:00',
      observacoes: item.observacoes || '',
    })
    setModalOpen(true)
  }

  const salvarFormulario = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.paciente.trim() || !formData.trabalho.trim()) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Informe o nome do paciente e a descrição do trabalho.',
        variant: 'destructive',
      })
      return
    }

    setSalvando(true)
    try {
      if (editando) {
        await updateLaboratorioTrabalho(editando.id, {
          laboratorio: formData.laboratorio,
          paciente: formData.paciente.trim(),
          trabalho: formData.trabalho.trim(),
          data_envio: formData.data_envio || null,
          data_previsao_entrega: formData.data_previsao_entrega || null,
          horario_previsto: formData.horario_previsto || '17:00',
          observacoes: formData.observacoes?.trim() || null,
        })
        toast({ title: 'Sucesso', description: 'Trabalho atualizado com sucesso.' })
      } else {
        await createLaboratorioTrabalho(
          {
            laboratorio: formData.laboratorio,
            paciente: formData.paciente.trim(),
            trabalho: formData.trabalho.trim(),
            data_envio: formData.data_envio || null,
            data_previsao_entrega: formData.data_previsao_entrega || null,
            horario_previsto: formData.horario_previsto || '17:00',
            observacoes: formData.observacoes?.trim() || null,
          },
          user?.id,
        )
        toast({ title: 'Sucesso', description: 'Novo trabalho adicionado à grade.' })
      }
      setModalOpen(false)
      carregarDados()
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar',
        description: err.message || 'Falha ao salvar registro.',
        variant: 'destructive',
      })
    } finally {
      setSalvando(false)
    }
  }

  // Ação Entregue
  const handleEntregar = async (item: LaboratorioTrabalho) => {
    try {
      await marcarComoEntregue(item.id)
      toast({
        title: 'Trabalho Entregue!',
        description: `${item.paciente} marcado como entregue e retirado da lista ativa.`,
      })
      // Atualizar localmente
      if (!mostrarEntregues) {
        setTrabalhos((prev) => prev.filter((t) => t.id !== item.id))
      } else {
        setTrabalhos((prev) =>
          prev.map((t) =>
            t.id === item.id ? { ...t, entregue: true, delivered_at: new Date().toISOString() } : t,
          ),
        )
      }
    } catch (err: any) {
      toast({
        title: 'Erro ao marcar entrega',
        description: err.message,
        variant: 'destructive',
      })
    }
  }

  // Ação Reabrir (se entregue)
  const handleReabrir = async (item: LaboratorioTrabalho) => {
    try {
      await reabrirTrabalho(item.id)
      toast({
        title: 'Trabalho Reaberto',
        description: `${item.paciente} retornou à lista ativa.`,
      })
      setTrabalhos((prev) =>
        prev.map((t) => (t.id === item.id ? { ...t, entregue: false, delivered_at: null } : t)),
      )
    } catch (err: any) {
      toast({
        title: 'Erro ao reabrir',
        description: err.message,
        variant: 'destructive',
      })
    }
  }

  // Ação Confirmar com Laboratório
  const handleConfirmarLaboratorio = async (item: LaboratorioTrabalho) => {
    try {
      const atualizado = await confirmarComLaboratorio(item.id, nomeUsuarioLogado)
      toast({
        title: 'Confirmação Registrada',
        description: `Confirmado com o laboratório por ${nomeUsuarioLogado}.`,
      })
      setTrabalhos((prev) =>
        prev.map((t) =>
          t.id === item.id
            ? {
                ...t,
                confirmado_por: atualizado.confirmado_por,
                confirmado_em: atualizado.confirmado_em,
              }
            : t,
        ),
      )
    } catch (err: any) {
      toast({
        title: 'Erro ao confirmar',
        description: err.message,
        variant: 'destructive',
      })
    }
  }

  // Ação Excluir
  const handleExcluir = async () => {
    if (!deleteId) return
    setExcluindo(true)
    try {
      await deleteLaboratorioTrabalho(deleteId)
      toast({ title: 'Excluído', description: 'Registro removido com sucesso.' })
      setTrabalhos((prev) => prev.filter((t) => t.id !== deleteId))
      setDeleteId(null)
    } catch (err: any) {
      toast({
        title: 'Erro ao excluir',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setExcluindo(false)
    }
  }

  // Formatação de data em padrão visual dd/MM
  const formatarDataVisual = (dataStr: string | null | undefined) => {
    if (!dataStr) return '—'
    const parts = dataStr.split('-').map(Number)
    if (parts.length < 3) return dataStr
    const d = new Date(parts[0], parts[1] - 1, parts[2])
    return format(d, 'dd/MM/yyyy')
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-950 text-slate-100 min-h-[calc(100vh-4rem)]">
      {/* Header com identidade Nuvia */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 sm:p-6 rounded-xl shadow-lg border-l-4 border-l-amber-500">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-500 shadow-inner">
            <FlaskConical className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white uppercase">
                LABORATÓRIOS
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-400 uppercase tracking-wider">
                Operacional
              </span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Grade estilo planilha para controle de próteses, coroas, barras e prazos com cálculo
              automático de dias úteis e alertas.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={carregarDados}
            disabled={carregando}
            className="border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white"
          >
            <RefreshCw className={cn('w-4 h-4 mr-2', carregando && 'animate-spin')} />
            Atualizar
          </Button>

          <Button
            onClick={() => abrirCriacao()}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold uppercase tracking-wider text-xs shadow-md transition-all"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Adicionar Trabalho
          </Button>
        </div>
      </div>

      {/* Cards de Métricas Rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Ativos */}
        <div
          onClick={() => setStatusFiltro('todos')}
          className={cn(
            'p-4 rounded-xl border transition-all cursor-pointer bg-slate-900/60 hover:border-amber-500/60',
            statusFiltro === 'todos'
              ? 'border-amber-500 ring-1 ring-amber-500/40'
              : 'border-slate-800',
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Casos Ativos
            </span>
            <FileSpreadsheet className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            {metricas.totalAtivos}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Em produção externa</p>
        </div>

        {/* No Prazo */}
        <div
          onClick={() => setStatusFiltro('NO PRAZO')}
          className={cn(
            'p-4 rounded-xl border transition-all cursor-pointer bg-slate-900/60 hover:border-emerald-500/60',
            statusFiltro === 'NO PRAZO'
              ? 'border-emerald-500 ring-1 ring-emerald-500/40'
              : 'border-slate-800',
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400">
              No Prazo
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-2">
            {metricas.noPrazo}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Dentro do cronograma</p>
        </div>

        {/* Alerta de 1 dia (Piscando) */}
        <div
          onClick={() => setStatusFiltro('alerta_1dia')}
          className={cn(
            'p-4 rounded-xl border transition-all cursor-pointer bg-slate-900/60 hover:border-rose-500/60',
            statusFiltro === 'alerta_1dia'
              ? 'border-rose-500 ring-1 ring-rose-500/40 bg-rose-950/20'
              : 'border-slate-800',
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-rose-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
              Alerta (≤ 1 Dia)
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-rose-400 mt-2">
            {metricas.alerta1Dia}
          </p>
          <p className="text-[11px] text-rose-300/80 mt-0.5 font-medium">
            Exige confirmação c/ laboratório
          </p>
        </div>

        {/* Atrasados */}
        <div
          onClick={() => setStatusFiltro('ATRASADO')}
          className={cn(
            'p-4 rounded-xl border transition-all cursor-pointer bg-slate-900/60 hover:border-red-500/60',
            statusFiltro === 'ATRASADO'
              ? 'border-red-500 ring-1 ring-red-500/40'
              : 'border-slate-800',
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-red-400">
              Atrasados
            </span>
            <Clock className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-red-400 mt-2">
            {metricas.atrasados}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Prazo excedido</p>
        </div>

        {/* Entregues */}
        <div
          onClick={() => setMostrarEntregues(!mostrarEntregues)}
          className={cn(
            'p-4 rounded-xl border transition-all cursor-pointer bg-slate-900/60 hover:border-slate-600',
            mostrarEntregues ? 'border-sky-500 ring-1 ring-sky-500/40' : 'border-slate-800',
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-sky-400">
              Entregues
            </span>
            <CheckCircle2 className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-300 mt-2">
            {metricas.entregues}
          </p>
          <p className="text-[11px] text-sky-400/90 mt-0.5 underline">
            {mostrarEntregues ? 'Ocultar entregues' : 'Exibir histórico'}
          </p>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900 p-3 sm:p-4 rounded-xl border border-slate-800">
        {/* Filtros de Laboratório */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <Button
            variant={labFiltro === 'todos' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLabFiltro('todos')}
            className={cn(
              'text-xs font-bold uppercase tracking-wider shrink-0 h-9',
              labFiltro === 'todos'
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-600'
                : 'border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-700',
            )}
          >
            <Layers className="w-3.5 h-3.5 mr-1.5" />
            Todos os Labs
          </Button>

          <Button
            variant={labFiltro === 'studio_acrilico' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLabFiltro('studio_acrilico')}
            className={cn(
              'text-xs font-bold uppercase tracking-wider shrink-0 h-9',
              labFiltro === 'studio_acrilico'
                ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-600'
                : 'border-slate-700 bg-slate-800/80 text-emerald-400 hover:bg-slate-700',
            )}
          >
            Studio Acrílico
          </Button>

          <Button
            variant={labFiltro === 'ceramicas' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLabFiltro('ceramicas')}
            className={cn(
              'text-xs font-bold uppercase tracking-wider shrink-0 h-9',
              labFiltro === 'ceramicas'
                ? 'bg-sky-500 text-slate-950 hover:bg-sky-600'
                : 'border-slate-700 bg-slate-800/80 text-sky-400 hover:bg-slate-700',
            )}
          >
            Soluções Cerâmicas
          </Button>
        </div>

        {/* Busca e Status */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar paciente, trabalho, obs..."
              className="pl-9 h-9 text-xs bg-slate-950 border-slate-700 text-slate-200 placeholder:text-slate-500"
            />
          </div>

          <Select value={statusFiltro} onValueChange={setStatusFiltro}>
            <SelectTrigger className="h-9 text-xs bg-slate-950 border-slate-700 text-slate-200 w-full sm:w-[160px]">
              <SelectValue placeholder="Filtrar status" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
              <SelectItem value="todos">Todos os Status</SelectItem>
              <SelectItem value="NO PRAZO">No Prazo</SelectItem>
              <SelectItem value="ATRASADO">Atrasado</SelectItem>
              <SelectItem value="alerta_1dia">Alerta (≤ 1 Dia)</SelectItem>
              <SelectItem value="SEM DATA">Sem Data</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grade tipo Excel */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            {/* Cabeçalho tipo Planilha */}
            <thead>
              <tr className="bg-slate-800/90 text-slate-300 border-b border-slate-700 font-bold uppercase tracking-wider">
                <th className="py-3 px-3.5 w-12 text-center text-slate-400 border-r border-slate-700/60">
                  #
                </th>
                <th className="py-3 px-3.5 border-r border-slate-700/60 min-w-[130px]">
                  Laboratório
                </th>
                <th className="py-3 px-3.5 border-r border-slate-700/60 min-w-[200px]">
                  C1: Paciente
                </th>
                <th className="py-3 px-3.5 border-r border-slate-700/60 min-w-[230px]">
                  C2: Trabalho
                </th>
                <th className="py-3 px-3 border-r border-slate-700/60 text-center min-w-[110px]">
                  C3: Data Envio
                </th>
                <th className="py-3 px-3 border-r border-slate-700/60 text-center min-w-[150px]">
                  <div className="flex items-center justify-center gap-1">
                    <span>C4: Previsão Entrega</span>
                    <ArrowUpDown className="w-3 h-3 text-amber-500" />
                  </div>
                </th>
                <th className="py-3 px-3 border-r border-slate-700/60 text-center min-w-[110px]">
                  C5: Dias Úteis
                </th>
                <th className="py-3 px-3.5 border-r border-slate-700/60 text-center min-w-[110px]">
                  C6: STATUS
                </th>
                <th className="py-3 px-3 border-r border-slate-700/60 text-center min-w-[100px]">
                  C7: Atraso
                </th>
                <th className="py-3 px-3.5 border-r border-slate-700/60 min-w-[220px]">
                  Confirmação com Laboratório
                </th>
                <th className="py-3 px-3 text-center min-w-[160px]">Ações</th>
              </tr>
            </thead>

            {/* Linhas da grade (Zebra) */}
            <tbody className="divide-y divide-slate-800/80">
              {carregando ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
                    Carregando grade de laboratórios...
                  </td>
                </tr>
              ) : trabalhosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <p className="font-semibold text-slate-300">Nenhum registro encontrado</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {mostrarEntregues
                        ? 'Nenhum trabalho corresponde aos filtros aplicados.'
                        : 'Nenhum trabalho pendente. Clique no botão acima para adicionar um novo trabalho ou ative o filtro de entregues.'}
                    </p>
                  </td>
                </tr>
              ) : (
                trabalhosFiltrados.map((item, index) => {
                  const diasUteis = calcularDiasUteis(item.data_envio, item.data_previsao_entrega)
                  const diasAtraso = calcularDiasAtraso(
                    item.data_previsao_entrega,
                    item.entregue,
                    item.delivered_at,
                  )
                  const status = calcularStatus(
                    item.data_previsao_entrega,
                    item.entregue,
                    item.delivered_at,
                  )
                  const piscar = devePiscarAlerta(item.data_previsao_entrega, item.entregue)
                  const labInfo = LABORATORIOS_CONFIG[item.laboratorio]

                  return (
                    <tr
                      key={item.id}
                      className={cn(
                        'transition-colors group',
                        index % 2 === 0 ? 'bg-slate-900/90' : 'bg-slate-950/70',
                        item.entregue && 'opacity-60 bg-slate-900/30',
                        piscar && !item.entregue
                          ? 'animate-blink-alert border-l-4 border-l-rose-500'
                          : 'hover:bg-slate-800/60',
                      )}
                    >
                      {/* Numeração */}
                      <td className="py-2.5 px-3.5 text-center text-slate-500 font-mono text-[11px] border-r border-slate-800/80">
                        {index + 1}
                      </td>

                      {/* Laboratório */}
                      <td className="py-2.5 px-3.5 border-r border-slate-800/80 whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] font-bold uppercase tracking-wider',
                            labInfo.corBadge,
                          )}
                        >
                          {labInfo.shortLabel}
                        </Badge>
                      </td>

                      {/* C1: Paciente */}
                      <td className="py-2.5 px-3.5 border-r border-slate-800/80 font-bold text-white text-[13px]">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate uppercase">{item.paciente}</span>
                          {item.observacoes && (
                            <span
                              className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-normal shrink-0"
                              title={item.observacoes}
                            >
                              Obs
                            </span>
                          )}
                        </div>
                      </td>

                      {/* C2: Trabalho */}
                      <td className="py-2.5 px-3.5 border-r border-slate-800/80 font-semibold text-slate-200">
                        <span className="uppercase tracking-tight">{item.trabalho}</span>
                        {item.observacoes && (
                          <p className="text-[11px] text-amber-300/80 italic font-normal mt-0.5 line-clamp-1">
                            {item.observacoes}
                          </p>
                        )}
                      </td>

                      {/* C3: Data Envio */}
                      <td className="py-2.5 px-3 text-center border-r border-slate-800/80 font-mono text-slate-300">
                        {item.data_envio ? formatarDataVisual(item.data_envio) : '—'}
                      </td>

                      {/* C4: Data Previsão de Entrega */}
                      <td className="py-2.5 px-3 text-center border-r border-slate-800/80">
                        {item.data_previsao_entrega ? (
                          <div className="flex flex-col items-center">
                            <span
                              className={cn(
                                'font-mono font-bold text-[13px]',
                                status === 'ATRASADO'
                                  ? 'text-red-400'
                                  : piscar
                                    ? 'text-rose-300 font-extrabold'
                                    : 'text-amber-400',
                              )}
                            >
                              {formatarDataVisual(item.data_previsao_entrega)}
                            </span>
                            {item.horario_previsto && (
                              <span className="text-[10px] text-slate-500 font-mono">
                                às {item.horario_previsto.substring(0, 5)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] text-slate-500 border-slate-700"
                          >
                            A confirmar
                          </Badge>
                        )}
                      </td>

                      {/* C5: Quantidade de Dias Úteis */}
                      <td className="py-2.5 px-3 text-center border-r border-slate-800/80 font-mono">
                        {diasUteis !== null ? (
                          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs">
                            {diasUteis} {diasUteis === 1 ? 'dia útil' : 'dias úteis'}
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>

                      {/* C6: STATUS */}
                      <td className="py-2.5 px-3.5 text-center border-r border-slate-800/80 whitespace-nowrap">
                        {status === 'ENTREGUE' ? (
                          <Badge className="bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[10px] font-extrabold tracking-wider">
                            ENTREGUE
                          </Badge>
                        ) : status === 'ATRASADO' ? (
                          <Badge className="bg-red-500/20 text-red-300 border border-red-500/50 text-[10px] font-extrabold tracking-wider animate-pulse">
                            ATRASADO
                          </Badge>
                        ) : status === 'NO PRAZO' ? (
                          <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold tracking-wider">
                            NO PRAZO
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] text-slate-400 border-slate-700"
                          >
                            SEM DATA
                          </Badge>
                        )}
                      </td>

                      {/* C7: Dias de Atraso */}
                      <td className="py-2.5 px-3 text-center border-r border-slate-800/80 font-mono">
                        {diasAtraso > 0 ? (
                          <span className="px-2 py-0.5 rounded bg-red-950/70 border border-red-800 text-red-400 font-bold text-xs">
                            +{diasAtraso} {diasAtraso === 1 ? 'dia' : 'dias'}
                          </span>
                        ) : (
                          <span className="text-slate-500 font-normal">0</span>
                        )}
                      </td>

                      {/* Confirmação com Laboratório (Etiqueta + Botão) */}
                      <td className="py-2.5 px-3.5 border-r border-slate-800/80">
                        {item.confirmado_por ? (
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                              <span className="text-emerald-300 font-bold text-[11px] truncate uppercase">
                                {item.confirmado_por}
                              </span>
                            </div>
                            {item.confirmado_em && (
                              <span className="text-[10px] text-slate-400 font-mono">
                                {format(new Date(item.confirmado_em), "dd/MM/yyyy 'às' HH:mm", {
                                  locale: ptBR,
                                })}
                              </span>
                            )}
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleConfirmarLaboratorio(item)}
                            className={cn(
                              'h-7 px-2.5 text-[10px] font-bold uppercase tracking-wider transition-all',
                              piscar && !item.entregue
                                ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-400 shadow-md animate-pulse-badge'
                                : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-amber-500 hover:text-slate-950',
                            )}
                          >
                            <PhoneCall className="w-3 h-3 mr-1" />
                            Confirmar com Lab
                          </Button>
                        )}
                      </td>

                      {/* Ações (Entregue, Editar, Excluir) */}
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {item.entregue ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleReabrir(item)}
                              title="Reabrir trabalho (voltar para a lista ativa)"
                              className="h-7 px-2 text-[11px] text-sky-400 hover:bg-sky-500/10 hover:text-sky-300"
                            >
                              <RotateCcw className="w-3.5 h-3.5 mr-1" />
                              Reabrir
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleEntregar(item)}
                              title="Marcar como entregue (retira da grade ativa)"
                              className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider shadow"
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Entregue
                            </Button>
                          )}

                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => abrirEdicao(item)}
                            title="Editar informações"
                            className="h-7 w-7 text-slate-400 hover:text-amber-400 hover:bg-slate-800"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>

                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDeleteId(item.id)}
                            title="Excluir trabalho"
                            className="h-7 w-7 text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé da Grade */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">
              Mostrando {trabalhosFiltrados.length} de {trabalhos.length} trabalhos
            </span>
            {mostrarEntregues && (
              <span className="text-[11px] px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                Incluindo histórico de entregues
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-rose-500/50 border border-rose-500" /> Tarja
              piscante: Vence em ≤ 1 dia (confirmar c/ lab)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500/50 border border-emerald-500" />{' '}
              No prazo
            </span>
          </div>
        </div>
      </div>

      {/* Modal de Inserção / Edição */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold uppercase tracking-wider text-amber-500 flex items-center gap-2">
              <FlaskConical className="w-5 h-5" />
              {editando ? 'Editar Trabalho de Laboratório' : 'Novo Trabalho de Laboratório'}
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Preencha os dados do caso. Os dias úteis e status de entrega são calculados
              automaticamente.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={salvarFormulario} className="space-y-4 pt-2">
            {/* Laboratório */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Laboratório Destino *
              </Label>
              <Select
                value={formData.laboratorio}
                onValueChange={(val: LaboratorioTipo) =>
                  setFormData((prev) => ({ ...prev, laboratorio: val }))
                }
              >
                <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                  <SelectItem value="studio_acrilico">STUDIO ACRÍLICO</SelectItem>
                  <SelectItem value="ceramicas">SOLUÇÕES CERÂMICAS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Paciente */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Nome do Paciente *
              </Label>
              <Input
                value={formData.paciente}
                onChange={(e) => setFormData((prev) => ({ ...prev, paciente: e.target.value }))}
                placeholder="Ex.: Maria Madalena de Jesus"
                className="bg-slate-950 border-slate-800 text-slate-100 uppercase"
                required
              />
            </div>

            {/* Trabalho */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Descrição do Trabalho *
              </Label>
              <Input
                value={formData.trabalho}
                onChange={(e) => setFormData((prev) => ({ ...prev, trabalho: e.target.value }))}
                placeholder="Ex.: BARRA + ACRILIZAÇÃO, COROA 36,37,47..."
                className="bg-slate-950 border-slate-800 text-slate-100 uppercase"
                required
              />
            </div>

            {/* Datas de Envio e Previsão */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Data de Envio
                </Label>
                <Input
                  type="date"
                  value={formData.data_envio || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, data_envio: e.target.value }))}
                  className="bg-slate-950 border-slate-800 text-slate-100 [color-scheme:dark]"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Previsão de Entrega
                </Label>
                <Input
                  type="date"
                  value={formData.data_previsao_entrega || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, data_previsao_entrega: e.target.value }))
                  }
                  className="bg-slate-950 border-slate-800 text-slate-100 [color-scheme:dark]"
                />
              </div>
            </div>

            {/* Horário e Cálculo prévio */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Horário Previsto
                </Label>
                <Input
                  type="time"
                  value={formData.horario_previsto || '17:00'}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, horario_previsto: e.target.value }))
                  }
                  className="bg-slate-950 border-slate-800 text-slate-100 [color-scheme:dark]"
                />
              </div>

              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300 block mb-0.5">
                  Dias úteis calculados:
                </span>
                {calcularDiasUteis(formData.data_envio, formData.data_previsao_entrega) !== null ? (
                  <span className="text-emerald-400 font-bold font-mono">
                    {calcularDiasUteis(formData.data_envio, formData.data_previsao_entrega)} dias
                    úteis
                  </span>
                ) : (
                  <span className="text-slate-500 italic">Defina as datas para calcular</span>
                )}
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Observações Adicionais
              </Label>
              <Textarea
                value={formData.observacoes || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Ex.: verificar orientação do Dr, cor A2, etc."
                rows={3}
                className="bg-slate-950 border-slate-800 text-slate-100 resize-none"
              />
            </div>

            <DialogFooter className="pt-3 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={salvando}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold uppercase tracking-wider text-xs"
              >
                {salvando ? 'Salvando...' : editando ? 'Atualizar Trabalho' : 'Cadastrar Trabalho'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmação de Exclusão */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-800 text-slate-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400">Excluir Trabalho?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Esta ação removerá o trabalho permanentemente da grade de laboratórios. Deseja
              prosseguir?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleExcluir}
              disabled={excluindo}
              className="bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              {excluindo ? 'Excluindo...' : 'Sim, Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

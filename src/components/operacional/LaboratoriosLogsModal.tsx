import { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  LaboratorioLog,
  LaboratorioLogAcao,
  fetchLaboratoriosLogs,
  LABORATORIOS_CONFIG,
  LaboratorioTipo,
} from '@/services/laboratorios'
import {
  History,
  Search,
  RefreshCw,
  PlusCircle,
  Edit3,
  Trash2,
  CheckCircle2,
  PhoneCall,
  RotateCcw,
  User,
  Calendar,
  Clock,
  Filter,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface LaboratoriosLogsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trabalhoIdFiltro?: string | null
  pacienteNomeFiltro?: string | null
}

const ACOES_CONFIG: Record<
  string,
  { label: string; corBadge: string; icon: React.ComponentType<{ className?: string }> }
> = {
  ADICIONADO: {
    label: 'ADICIONADO',
    corBadge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    icon: PlusCircle,
  },
  EDITADO: {
    label: 'EDITADO',
    corBadge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    icon: Edit3,
  },
  REMOVIDO: {
    label: 'REMOVIDO',
    corBadge: 'bg-red-500/15 text-red-400 border-red-500/30',
    icon: Trash2,
  },
  ENTREGUE: {
    label: 'ENTREGUE',
    corBadge: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    icon: CheckCircle2,
  },
  REABERTO: {
    label: 'REABERTO',
    corBadge: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    icon: RotateCcw,
  },
  CONFIRMADO_LAB: {
    label: 'CONFIRMADO C/ LAB',
    corBadge: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
    icon: PhoneCall,
  },
}

export function LaboratoriosLogsModal({
  open,
  onOpenChange,
  trabalhoIdFiltro,
  pacienteNomeFiltro,
}: LaboratoriosLogsModalProps) {
  const [logs, setLogs] = useState<LaboratorioLog[]>([])
  const [carregando, setCarregando] = useState(false)
  const [busca, setBusca] = useState('')
  const [filtroAcao, setFiltroAcao] = useState<string>('TODAS')

  const carregarLogs = async () => {
    setCarregando(true)
    try {
      const data = await fetchLaboratoriosLogs({
        trabalhoId: trabalhoIdFiltro || undefined,
        limite: 200,
      })
      setLogs(data)
    } catch (err) {
      console.error('Erro ao carregar logs de laboratório:', err)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    if (open) {
      carregarLogs()
    }
  }, [open, trabalhoIdFiltro])

  const logsFiltrados = useMemo(() => {
    return logs.filter((log) => {
      if (filtroAcao !== 'TODAS' && log.acao !== filtroAcao) {
        return false
      }

      if (busca.trim()) {
        const q = busca.toLowerCase()
        const matchUser = log.usuario_nome?.toLowerCase().includes(q)
        const matchPaciente = log.paciente?.toLowerCase().includes(q)
        const matchTrabalho = log.trabalho?.toLowerCase().includes(q)
        const matchDetalhes = log.detalhes?.toLowerCase().includes(q)
        const matchAcao = log.acao?.toLowerCase().includes(q)
        if (!matchUser && !matchPaciente && !matchTrabalho && !matchDetalhes && !matchAcao) {
          return false
        }
      }

      return true
    })
  }, [logs, filtroAcao, busca])

  const formatarDataHora = (dataStr: string) => {
    try {
      return format(new Date(dataStr), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })
    } catch {
      return dataStr
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-4xl w-[95vw] max-h-[88vh] flex flex-col p-0 overflow-hidden">
        {/* Cabeçalho */}
        <DialogHeader className="p-5 pb-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <History className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg sm:text-xl font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <span>Log de Auditoria</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-normal">
                    Laboratórios
                  </span>
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400 mt-0.5">
                  {pacienteNomeFiltro
                    ? `Histórico de alterações para o caso de ${pacienteNomeFiltro}.`
                    : 'Registro cronológico completo de quem adicionou, editou, entregou ou removeu trabalhos.'}
                </DialogDescription>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={carregarLogs}
              disabled={carregando}
              className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs shrink-0"
            >
              <RefreshCw className={cn('w-3.5 h-3.5 mr-1.5', carregando && 'animate-spin')} />
              Atualizar
            </Button>
          </div>

          {/* Filtros rápidos e busca */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 mt-4 pt-3 border-t border-slate-800/80">
            <div className="relative sm:col-span-7">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por usuário, paciente, trabalho ou detalhe..."
                className="pl-8 h-8 text-xs bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-500"
              />
            </div>

            <div className="sm:col-span-5 flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:block" />
              <Select value={filtroAcao} onValueChange={setFiltroAcao}>
                <SelectTrigger className="h-8 text-xs bg-slate-950 border-slate-800 text-slate-200">
                  <SelectValue placeholder="Filtrar por ação" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-200 text-xs">
                  <SelectItem value="TODAS">Todas as Ações ({logs.length})</SelectItem>
                  <SelectItem value="ADICIONADO">Adicionado</SelectItem>
                  <SelectItem value="EDITADO">Editado</SelectItem>
                  <SelectItem value="ENTREGUE">Entregue</SelectItem>
                  <SelectItem value="CONFIRMADO_LAB">Confirmado c/ Lab</SelectItem>
                  <SelectItem value="REABERTO">Reaberto</SelectItem>
                  <SelectItem value="REMOVIDO">Removido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogHeader>

        {/* Lista de Registros */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-slate-950/60 divide-y divide-slate-800/50">
          {carregando && logs.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
              <p className="text-xs">Carregando logs de auditoria...</p>
            </div>
          ) : logsFiltrados.length === 0 ? (
            <div className="py-14 text-center text-slate-400">
              <History className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p className="font-semibold text-slate-300 text-sm">
                Nenhum registro de log encontrado
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                {busca || filtroAcao !== 'TODAS'
                  ? 'Nenhum evento corresponde aos filtros aplicados.'
                  : 'Os próximos trabalhos adicionados, alterados ou entregues gerarão entradas automáticas aqui.'}
              </p>
            </div>
          ) : (
            logsFiltrados.map((log) => {
              const cfg = ACOES_CONFIG[log.acao] || {
                label: log.acao,
                corBadge: 'bg-slate-800 text-slate-300 border-slate-700',
                icon: History,
              }
              const Icone = cfg.icon
              const labInfo = log.laboratorio
                ? LABORATORIOS_CONFIG[log.laboratorio as LaboratorioTipo]
                : null

              return (
                <div
                  key={log.id}
                  className="pt-3 first:pt-0 pb-1 flex flex-col gap-2 hover:bg-slate-900/40 p-3 rounded-lg transition-colors border border-transparent hover:border-slate-800"
                >
                  {/* Linha 1: Badges, Ação, Usuário e Data/Hora */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 flex items-center gap-1',
                          cfg.corBadge,
                        )}
                      >
                        <Icone className="w-3 h-3" />
                        {cfg.label}
                      </Badge>

                      {labInfo && (
                        <Badge
                          variant="outline"
                          className={cn('text-[9px] font-semibold uppercase', labInfo.corBadge)}
                        >
                          {labInfo.shortLabel}
                        </Badge>
                      )}

                      {/* Usuário Logado que realizou a ação */}
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                        <User className="w-3 h-3 text-amber-400" />
                        {log.usuario_nome}
                      </span>
                    </div>

                    {/* Data e Hora Exata */}
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {formatarDataHora(log.criado_em)}
                    </div>
                  </div>

                  {/* Linha 2: Paciente e Trabalho */}
                  {(log.paciente || log.trabalho) && (
                    <div className="text-xs text-slate-200 flex flex-wrap items-center gap-x-3 gap-y-1">
                      {log.paciente && (
                        <div>
                          <span className="text-slate-500 uppercase text-[10px] mr-1 font-semibold">
                            Paciente:
                          </span>
                          <span className="font-bold text-white uppercase">{log.paciente}</span>
                        </div>
                      )}
                      {log.trabalho && (
                        <div>
                          <span className="text-slate-500 uppercase text-[10px] mr-1 font-semibold">
                            Trabalho:
                          </span>
                          <span className="text-slate-300 font-medium uppercase">
                            {log.trabalho}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Linha 3: Detalhes da alteração */}
                  {log.detalhes && (
                    <div className="text-xs text-slate-300 bg-slate-900/90 border border-slate-800 rounded p-2 text-[11px] leading-relaxed">
                      {log.detalhes}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Rodapé informativo */}
        <div className="p-3 px-5 border-t border-slate-800 bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <span>
            Exibindo <strong className="text-amber-400">{logsFiltrados.length}</strong> registro(s)
            de auditoria
          </span>
          <span className="text-slate-500">
            Registros ordenados por data/hora mais recente no topo.
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}

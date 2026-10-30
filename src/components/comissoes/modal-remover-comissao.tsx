import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import {
  CalendarClock,
  XCircle,
  AlertTriangle,
  Loader2,
  DollarSign,
  ShieldAlert,
} from 'lucide-react'
import type { ComissaoVenda } from '@/services/comissoes-dashboard'

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

export interface ModalRemoverComissaoProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  comissoes: ComissaoVenda[]
  tipoAbaAtiva: 'dentista' | 'crc'
  onConfirmar: (dados: {
    tipo: 'cancelada' | 'programada'
    justificativa: string
    dataProgramada?: string
  }) => Promise<void>
  loading?: boolean
}

export function ModalRemoverComissao({
  open,
  onOpenChange,
  comissoes,
  tipoAbaAtiva,
  onConfirmar,
  loading = false,
}: ModalRemoverComissaoProps) {
  const [tipoDestino, setTipoDestino] = useState<'programada' | 'cancelada'>('programada')
  const [justificativa, setJustificativa] = useState('')
  const [dataProgramada, setDataProgramada] = useState(() => {
    // Sugere o dia 10 do mês seguinte como padrão conveniente
    const hoje = new Date()
    const proximoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 10)
    const y = proximoMes.getFullYear()
    const m = String(proximoMes.getMonth() + 1).padStart(2, '0')
    const d = String(proximoMes.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  })
  const [erro, setErro] = useState<string | null>(null)

  const totalComissoes = comissoes.reduce((acc, v) => {
    return acc + (tipoAbaAtiva === 'dentista' ? v.valor_comissao_dentista : v.valor_comissao_crc)
  }, 0)

  const totalTratamentos = comissoes.reduce((acc, v) => acc + v.valor_tratamento, 0)

  const handleSubmit = async () => {
    setErro(null)

    if (!justificativa.trim()) {
      setErro('A justificativa é obrigatória para registrar este ajuste de fechamento.')
      return
    }

    if (tipoDestino === 'programada' && !dataProgramada) {
      setErro('Informe a data futura prevista para o pagamento programado.')
      return
    }

    try {
      await onConfirmar({
        tipo: tipoDestino,
        justificativa: justificativa.trim(),
        dataProgramada: tipoDestino === 'programada' ? dataProgramada : undefined,
      })
      // Resetar form ao concluir com sucesso
      setJustificativa('')
      onOpenChange(false)
    } catch (err: any) {
      setErro(err?.message || 'Erro ao processar remoção do fechamento.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-slate-900 border-slate-800 text-white p-6 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white tracking-tight">
                Remover do Fechamento Atual
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-sm mt-0.5">
                Ajuste{' '}
                {comissoes.length === 1
                  ? 'da comissão selecionada'
                  : `de ${comissoes.length} comissões selecionadas`}{' '}
                com registro de auditoria imutável.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Resumo da seleção */}
        <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/60 space-y-2 mt-2">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase tracking-wider font-semibold">
            <span>Resumo da Operação</span>
            <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10">
              {comissoes.length}{' '}
              {comissoes.length === 1 ? 'linha selecionada' : 'linhas selecionadas'}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Comissão Impactada</span>
              <span className="text-base font-bold text-emerald-400">
                {formatCurrency(totalComissoes)}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Volume dos Tratamentos</span>
              <span className="text-base font-bold text-white">
                {formatCurrency(totalTratamentos)}
              </span>
            </div>
          </div>
        </div>

        {/* Destino da Comissão */}
        <div className="space-y-3 pt-2">
          <Label className="text-sm font-semibold text-slate-200">
            Escolha o destino da comissão:
          </Label>

          <RadioGroup
            value={tipoDestino}
            onValueChange={(val) => setTipoDestino(val as 'programada' | 'cancelada')}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {/* Opção: Agendar Pagamento Futuro */}
            <label
              htmlFor="radio-programada"
              className={`flex flex-col p-3.5 rounded-xl border cursor-pointer transition-all ${
                tipoDestino === 'programada'
                  ? 'bg-amber-500/10 border-amber-500/60 shadow-sm'
                  : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <RadioGroupItem
                  value="programada"
                  id="radio-programada"
                  className="border-slate-400 text-amber-500"
                />
                <div className="flex items-center gap-1.5 font-semibold text-sm text-white">
                  <CalendarClock className="w-4 h-4 text-amber-400" />
                  Agendar Futuro
                </div>
              </div>
              <p className="text-xs text-slate-400 pl-6 leading-relaxed">
                Sai deste fechamento, mas <strong>NÃO perde a referência</strong>. Controlado na aba{' '}
                <span className="text-amber-400 font-medium">Pagamentos Programados</span>.
              </p>
            </label>

            {/* Opção: Cancelar Definitivamente */}
            <label
              htmlFor="radio-cancelada"
              className={`flex flex-col p-3.5 rounded-xl border cursor-pointer transition-all ${
                tipoDestino === 'cancelada'
                  ? 'bg-rose-500/10 border-rose-500/60 shadow-sm'
                  : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <RadioGroupItem
                  value="cancelada"
                  id="radio-cancelada"
                  className="border-slate-400 text-rose-500"
                />
                <div className="flex items-center gap-1.5 font-semibold text-sm text-white">
                  <XCircle className="w-4 h-4 text-rose-400" />
                  Cancelar Definitivo
                </div>
              </div>
              <p className="text-xs text-slate-400 pl-6 leading-relaxed">
                A comissão sai do fechamento para sempre com status <strong>Cancelada</strong> e
                justificativa arquivada.
              </p>
            </label>
          </RadioGroup>
        </div>

        {/* Data programada (apenas se 'programada') */}
        {tipoDestino === 'programada' && (
          <div className="space-y-1.5 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <Label
              htmlFor="data-programada"
              className="text-xs font-semibold text-amber-300 flex items-center gap-1.5"
            >
              <CalendarClock className="w-3.5 h-3.5" />
              Data Prevista para Pagamento Futuro *
            </Label>
            <Input
              id="data-programada"
              type="date"
              value={dataProgramada}
              onChange={(e) => setDataProgramada(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white focus:border-amber-500 focus:ring-amber-500"
            />
            <p className="text-[11px] text-slate-400">
              Você poderá reagendar ou alterar esta data a qualquer momento na aba Pagamentos
              Programados.
            </p>
          </div>
        )}

        {/* Justificativa Obrigatória */}
        <div className="space-y-1.5">
          <Label htmlFor="justificativa-remocao" className="text-xs font-semibold text-slate-200">
            Justificativa Obrigatória *
          </Label>
          <Textarea
            id="justificativa-remocao"
            placeholder="Ex.: Inconsistência no valor da entrada confirmada pelo paciente; comissão será paga no próximo mês após conciliação bancária."
            value={justificativa}
            onChange={(e) => setJustificativa(e.target.value)}
            rows={3}
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 resize-none focus:border-amber-500 focus:ring-amber-500 text-sm"
          />
        </div>

        {erro && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-slate-800">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="text-slate-400 hover:text-white hover:bg-slate-800"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className={`font-semibold text-white shadow-md ${
              tipoDestino === 'programada'
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-rose-600 hover:bg-rose-700'
            }`}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <DollarSign className="w-4 h-4 mr-1.5" />
            )}
            {tipoDestino === 'programada'
              ? 'Confirmar Agendamento Futuro'
              : 'Confirmar Cancelamento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

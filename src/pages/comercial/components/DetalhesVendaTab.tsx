import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
  User,
  Wallet,
  Banknote,
  CreditCard,
  Repeat,
  Percent,
  Layers,
  Receipt,
  AlertTriangle,
  FileText,
  Stethoscope,
  Contact,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'

type FormaPagamento = 'dinheiro' | 'pix' | 'cartao'

interface ProfissionalOpcao {
  id: string
  nome: string
}

interface DetalhesVendaState {
  paciente: string
  valorTotal: string
  valorEntrada: string
  formaPagamento: FormaPagamento
  parcelas: string
  dentistaAvaliador: string
  crcComercial: string
}

const STORAGE_KEY = 'nuvia-detalhes-venda'

const initialState: DetalhesVendaState = {
  paciente: '',
  valorTotal: '',
  valorEntrada: '',
  formaPagamento: 'dinheiro',
  parcelas: '',
  dentistaAvaliador: '',
  crcComercial: '',
}

const FORMA_LABEL: Record<FormaPagamento, string> = {
  dinheiro: 'Dinheiro',
  pix: 'Pix',
  cartao: 'Cartão',
}

const parseCurrency = (raw: string): number | null => {
  if (!raw) return null
  const digits = raw.replace(/\D/g, '')
  if (!digits) return null
  return parseInt(digits, 10) / 100
}

const parseParcelas = (raw: string): number | null => {
  if (!raw) return null
  const n = parseInt(raw.replace(/\D/g, ''), 10)
  return Number.isNaN(n) ? null : n
}

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

const formatDisplay = (raw: string) => {
  const num = parseCurrency(raw)
  if (num === null) return ''
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const emDash = <span className="text-slate-500">—</span>

function CampoMoeda({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}) {
  return (
    <div className="relative flex items-center">
      <span
        className={cn(
          'absolute left-3 font-medium',
          disabled ? 'text-slate-500' : 'text-slate-400',
        )}
      >
        R$
      </span>
      <Input
        inputMode="numeric"
        disabled={disabled}
        className="pl-10 text-right bg-slate-900/50 border-slate-800 h-9 font-medium shadow-sm transition-colors hover:border-slate-600 focus:bg-slate-800 focus:border-amber-500/50 text-slate-200 focus:text-white placeholder:text-slate-600"
        value={formatDisplay(value)}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 11))}
        placeholder="0,00"
      />
    </div>
  )
}

function LinhaResumo({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-slate-800 last:border-b-0">
      <div className="flex items-center gap-2.5 text-slate-400 text-xs uppercase tracking-wider font-semibold">
        {icon}
        {label}
      </div>
      <div className="text-right font-bold text-slate-100">{children}</div>
    </div>
  )
}

export function DetalhesVendaTab() {
  const [state, setState] = useState<DetalhesVendaState>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved) return { ...initialState, ...JSON.parse(saved) }
    } catch {
      /* ignore */
    }
    return initialState
  })

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* ignore */
    }
  }, [state])

  const update = <K extends keyof DetalhesVendaState>(key: K, value: DetalhesVendaState[K]) =>
    setState((prev) => ({ ...prev, [key]: value }))

  const [dentistas, setDentistas] = useState<ProfissionalOpcao[]>([])
  const [crcs, setCrcs] = useState<ProfissionalOpcao[]>([])

  useEffect(() => {
    let cancelado = false
    const carregar = async () => {
      try {
        const [dRes, cRes] = await Promise.all([
          supabase
            .from('dentistas_avaliadores')
            .select('id, nome')
            .eq('status', 'ativo')
            .order('nome'),
          supabase.from('crc_comercial').select('id, nome').eq('status', 'ativo').order('nome'),
        ])
        if (!cancelado) {
          setDentistas((dRes.data as ProfissionalOpcao[]) || [])
          setCrcs((cRes.data as ProfissionalOpcao[]) || [])
        }
      } catch {
        // degradação graciosa: listas permanecem vazias
        if (!cancelado) {
          setDentistas([])
          setCrcs([])
        }
      }
    }
    carregar()
    return () => {
      cancelado = true
    }
  }, [])

  const total = parseCurrency(state.valorTotal)
  const entrada = parseCurrency(state.valorEntrada)
  const parcelas = parseParcelas(state.parcelas)

  const entradaExcedeTotal = entrada !== null && total !== null && entrada > total
  const parcelasInvalidas = parcelas !== null && parcelas < 1

  const percentualEntrada =
    entrada !== null && total !== null && total > 0 && !entradaExcedeTotal
      ? Math.round((entrada / total) * 100)
      : null

  const saldoAParcelar =
    entrada !== null && total !== null && !entradaExcedeTotal ? total - entrada : null

  const valorParcela =
    saldoAParcelar !== null && parcelas !== null && parcelas >= 1 && !parcelasInvalidas
      ? saldoAParcelar / parcelas
      : null

  const dentistaNome = useMemo(
    () => dentistas.find((d) => d.id === state.dentistaAvaliador)?.nome || null,
    [dentistas, state.dentistaAvaliador],
  )
  const crcNome = useMemo(
    () => crcs.find((c) => c.id === state.crcComercial)?.nome || null,
    [crcs, state.crcComercial],
  )

  const resumoVazio = useMemo(
    () =>
      !state.paciente.trim() &&
      total === null &&
      entrada === null &&
      parcelas === null &&
      !dentistaNome &&
      !crcNome &&
      state.formaPagamento === initialState.formaPagamento,
    [state.paciente, total, entrada, parcelas, dentistaNome, crcNome, state.formaPagamento],
  )

  return (
    <Card className="bg-slate-900 border-slate-800 border-l-4 border-l-amber-500 shadow-sm">
      <CardHeader>
        <CardTitle className="text-white uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-500" />
          Detalhes da Venda
        </CardTitle>
        <CardDescription className="text-slate-400">
          Leia como a venda foi concretizada — composição de entrada e parcelamento. Somente
          leitura, nada é gravado.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário */}
          <div className="space-y-4 bg-slate-950/60 border border-slate-800 rounded-lg p-5">
            <div className="space-y-2">
              <Label className="text-slate-300 text-xs uppercase tracking-wider font-semibold flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-amber-500" />
                Nome do Paciente
              </Label>
              <Input
                value={state.paciente}
                onChange={(e) => update('paciente', e.target.value)}
                placeholder="Nome do paciente..."
                className="bg-slate-900/50 border-slate-800 h-9 text-slate-200 focus:text-white hover:border-slate-600 focus:bg-slate-800 focus:border-amber-500/50 placeholder:text-slate-600"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300 text-xs uppercase tracking-wider font-semibold flex items-center gap-2">
                <Wallet className="w-3.5 h-3.5 text-amber-500" />
                Valor Total da Venda
              </Label>
              <CampoMoeda value={state.valorTotal} onChange={(v) => update('valorTotal', v)} />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300 text-xs uppercase tracking-wider font-semibold flex items-center gap-2">
                <Banknote className="w-3.5 h-3.5 text-amber-500" />
                Valor da Entrada
              </Label>
              <CampoMoeda
                value={state.valorEntrada}
                onChange={(v) => update('valorEntrada', v)}
                disabled={total === null}
              />
              {entradaExcedeTotal && (
                <p className="text-xs text-red-400 flex items-center gap-1.5 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />A entrada não pode exceder o valor total
                  da venda.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300 text-xs uppercase tracking-wider font-semibold flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5 text-amber-500" />
                Forma de Pagamento da Entrada
              </Label>
              <Select
                value={state.formaPagamento}
                onValueChange={(v) => update('formaPagamento', v as FormaPagamento)}
              >
                <SelectTrigger className="bg-slate-900/50 border-slate-800 h-9 text-slate-100 hover:border-slate-600 focus:border-amber-500/50 [&>span]:text-slate-100">
                  <SelectValue placeholder="Forma de pagamento" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-100 [&_[role=option]]:text-slate-100 [&_[role=option]]:focus:bg-slate-800 [&_[role=option]]:focus:text-white [&_[role=option]]:data-[highlighted]:bg-slate-800 [&_[role=option]]:data-[highlighted]:text-white [&_[role=option]]:data-[state=checked]:text-amber-400">
                  <SelectItem
                    className="text-slate-100 focus:bg-slate-800 focus:text-white data-[highlighted]:bg-slate-800 data-[highlighted]:text-white data-[state=checked]:text-amber-400"
                    value="dinheiro"
                  >
                    Dinheiro
                  </SelectItem>
                  <SelectItem
                    className="text-slate-100 focus:bg-slate-800 focus:text-white data-[highlighted]:bg-slate-800 data-[highlighted]:text-white data-[state=checked]:text-amber-400"
                    value="pix"
                  >
                    Pix
                  </SelectItem>
                  <SelectItem
                    className="text-slate-100 focus:bg-slate-800 focus:text-white data-[highlighted]:bg-slate-800 data-[highlighted]:text-white data-[state=checked]:text-amber-400"
                    value="cartao"
                  >
                    Cartão
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300 text-xs uppercase tracking-wider font-semibold flex items-center gap-2">
                <Stethoscope className="w-3.5 h-3.5 text-amber-500" />
                Dentista Avaliador
              </Label>
              <Select
                value={state.dentistaAvaliador}
                onValueChange={(v) => update('dentistaAvaliador', v)}
              >
                <SelectTrigger className="bg-slate-900/50 border-slate-800 h-9 text-slate-100 hover:border-slate-600 focus:border-amber-500/50 [&>span]:text-slate-100">
                  <SelectValue placeholder="Selecione o dentista..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-100 [&_[role=option]]:text-slate-100 [&_[role=option]]:focus:bg-slate-800 [&_[role=option]]:focus:text-white [&_[role=option]]:data-[highlighted]:bg-slate-800 [&_[role=option]]:data-[highlighted]:text-white [&_[role=option]]:data-[state=checked]:text-amber-400">
                  {dentistas.length === 0 ? (
                    <div className="px-2 py-1.5 text-xs text-slate-500">
                      Nenhum profissional cadastrado
                    </div>
                  ) : (
                    dentistas.map((d) => (
                      <SelectItem
                        key={d.id}
                        value={d.id}
                        className="text-slate-100 focus:bg-slate-800 focus:text-white data-[highlighted]:bg-slate-800 data-[highlighted]:text-white data-[state=checked]:text-amber-400"
                      >
                        {d.nome}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300 text-xs uppercase tracking-wider font-semibold flex items-center gap-2">
                <Contact className="w-3.5 h-3.5 text-amber-500" />
                CRC Comercial
              </Label>
              <Select value={state.crcComercial} onValueChange={(v) => update('crcComercial', v)}>
                <SelectTrigger className="bg-slate-900/50 border-slate-800 h-9 text-slate-100 hover:border-slate-600 focus:border-amber-500/50 [&>span]:text-slate-100">
                  <SelectValue placeholder="Selecione o CRC..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-100 [&_[role=option]]:text-slate-100 [&_[role=option]]:focus:bg-slate-800 [&_[role=option]]:focus:text-white [&_[role=option]]:data-[highlighted]:bg-slate-800 [&_[role=option]]:data-[highlighted]:text-white [&_[role=option]]:data-[state=checked]:text-amber-400">
                  {crcs.length === 0 ? (
                    <div className="px-2 py-1.5 text-xs text-slate-500">
                      Nenhum profissional cadastrado
                    </div>
                  ) : (
                    crcs.map((c) => (
                      <SelectItem
                        key={c.id}
                        value={c.id}
                        className="text-slate-100 focus:bg-slate-800 focus:text-white data-[highlighted]:bg-slate-800 data-[highlighted]:text-white data-[state=checked]:text-amber-400"
                      >
                        {c.nome}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300 text-xs uppercase tracking-wider font-semibold flex items-center gap-2">
                <Repeat className="w-3.5 h-3.5 text-amber-500" />
                Quantidade de Parcelas
              </Label>
              <Input
                inputMode="numeric"
                type="number"
                min={1}
                value={state.parcelas}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 3)
                  update('parcelas', digits)
                }}
                onBlur={() => {
                  if (state.parcelas && parseParcelas(state.parcelas)! < 1) update('parcelas', '1')
                }}
                placeholder="Ex.: 12"
                className="bg-slate-900/50 border-slate-800 h-9 text-slate-200 focus:text-white hover:border-slate-600 focus:bg-slate-800 focus:border-amber-500/50 placeholder:text-slate-600"
              />
              {parcelasInvalidas && (
                <p className="text-xs text-red-400 flex items-center gap-1.5 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />A quantidade mínima de parcelas é 1.
                </p>
              )}
            </div>

            {/* Cálculos automáticos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-slate-900 border-l-4 border-amber-500 rounded-md p-3">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
                  <Percent className="w-3 h-3 text-amber-500" />
                  Percentual de Entrada
                </div>
                <div className="text-lg font-bold text-amber-400 mt-1">
                  {percentualEntrada !== null ? `${percentualEntrada}%` : emDash}
                </div>
              </div>
              <div className="bg-slate-900 border-l-4 border-amber-500 rounded-md p-3">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
                  <Layers className="w-3 h-3 text-amber-500" />
                  Saldo a Parcelar
                </div>
                <div className="text-lg font-bold text-emerald-400 mt-1">
                  {saldoAParcelar !== null ? formatCurrency(saldoAParcelar) : emDash}
                </div>
              </div>
              <div className="bg-slate-900 border-l-4 border-amber-500 rounded-md p-3">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
                  <Repeat className="w-3 h-3 text-amber-500" />
                  Valor de Cada Parcela
                </div>
                <div className="text-lg font-bold text-sky-400 mt-1">
                  {valorParcela !== null ? formatCurrency(valorParcela) : emDash}
                </div>
              </div>
            </div>
          </div>

          {/* Painel-resumo */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-5 flex flex-col">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 bg-slate-800 rounded-lg">
                <Receipt className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h3 className="text-white font-bold uppercase tracking-wider text-sm">
                  Como a venda foi realizada
                </h3>
                <p className="text-slate-500 text-xs">Composição completa da leitura</p>
              </div>
            </div>

            {resumoVazio ? (
              <div className="flex-1 flex items-center justify-center border border-dashed border-slate-800 rounded-lg p-8 text-center">
                <p className="text-slate-500 text-sm">
                  Preencha os campos ao lado para ver a composição da venda aqui.
                </p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center bg-slate-900 rounded-lg border border-slate-800 px-4 py-2">
                <LinhaResumo
                  icon={<User className="w-3.5 h-3.5 text-amber-500" />}
                  label="Paciente"
                >
                  {state.paciente.trim() ? (
                    <span className="uppercase tracking-wide">{state.paciente.trim()}</span>
                  ) : (
                    emDash
                  )}
                </LinhaResumo>
                <LinhaResumo
                  icon={<Wallet className="w-3.5 h-3.5 text-amber-500" />}
                  label="Valor Total"
                >
                  {total !== null ? formatCurrency(total) : emDash}
                </LinhaResumo>
                <LinhaResumo
                  icon={<Banknote className="w-3.5 h-3.5 text-amber-500" />}
                  label="Entrada"
                >
                  {entrada !== null && !entradaExcedeTotal ? (
                    <span>
                      {formatCurrency(entrada)}
                      <span className="text-slate-400 font-medium">
                        {' '}
                        · {FORMA_LABEL[state.formaPagamento]}
                      </span>
                    </span>
                  ) : (
                    emDash
                  )}
                </LinhaResumo>
                <LinhaResumo
                  icon={<Stethoscope className="w-3.5 h-3.5 text-amber-500" />}
                  label="Dentista Avaliador"
                >
                  {dentistaNome ? (
                    <span className="uppercase tracking-wide">{dentistaNome}</span>
                  ) : (
                    emDash
                  )}
                </LinhaResumo>
                <LinhaResumo
                  icon={<Contact className="w-3.5 h-3.5 text-amber-500" />}
                  label="CRC Comercial"
                >
                  {crcNome ? <span className="uppercase tracking-wide">{crcNome}</span> : emDash}
                </LinhaResumo>
                <LinhaResumo
                  icon={<Percent className="w-3.5 h-3.5 text-amber-500" />}
                  label="% de Entrada"
                >
                  {percentualEntrada !== null ? `${percentualEntrada}%` : emDash}
                </LinhaResumo>
                <LinhaResumo
                  icon={<Layers className="w-3.5 h-3.5 text-amber-500" />}
                  label="Saldo a Parcelar"
                >
                  {saldoAParcelar !== null ? formatCurrency(saldoAParcelar) : emDash}
                </LinhaResumo>
                <LinhaResumo
                  icon={<Repeat className="w-3.5 h-3.5 text-amber-500" />}
                  label="Parcelamento"
                >
                  {valorParcela !== null && parcelas !== null ? (
                    <span>
                      {parcelas}x {formatCurrency(valorParcela)}
                    </span>
                  ) : (
                    emDash
                  )}
                </LinhaResumo>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

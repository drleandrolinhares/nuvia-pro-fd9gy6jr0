import { useState, useMemo } from 'react'
import {
  formatCurrency,
  formatPercent,
  calcularFinanciamento,
  calcularFinanciamentoReverso,
} from './calculadora-utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  Copy,
  Check,
  Scale,
  Percent,
  Search,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react'

type ModoCET = 'direto' | 'reverso'

/**
 * Normaliza string monetária/percentual em pt-BR para float.
 * Trata tanto "12.000,00" (milhar com ponto e decimal com vírgula)
 * quanto "12000.50" ou "12000,50".
 */
const parsePtBrNumber = (raw: string): number => {
  if (!raw) return 0
  const trimmed = raw.trim()
  if (!trimmed) return 0

  // Se tem ponto e vírgula (ex: "12.000,50"), pontos são milhar e vírgula é decimal
  if (trimmed.includes('.') && trimmed.includes(',')) {
    const clean = trimmed.replace(/\./g, '').replace(',', '.')
    const v = parseFloat(clean)
    return isNaN(v) ? 0 : v
  }

  // Se tem apenas vírgula (ex: "1,99" ou "12000,50")
  if (trimmed.includes(',')) {
    const clean = trimmed.replace(',', '.')
    const v = parseFloat(clean)
    return isNaN(v) ? 0 : v
  }

  // Se tem apenas ponto:
  // Se parece formato brasileiro de milhar ex "12.000" (3 dígitos após ponto sem outro separador)
  // mas se for decimal de taxa ex "1.99" ou "0.5"?
  // Regra: se o número após o ponto tem exatamente 3 dígitos e a parte inteira é > 0, pode ser milhar pt-BR ("12.000" = 12000).
  // Porém se for "1.500" vs "1.50", "1.99" é decimal.
  const parts = trimmed.split('.')
  if (parts.length > 2) {
    // Vários pontos: são separadores de milhar ("1.000.000")
    const clean = trimmed.replace(/\./g, '')
    const v = parseFloat(clean)
    return isNaN(v) ? 0 : v
  } else if (parts.length === 2 && parts[1].length === 3 && parts[0].length >= 1) {
    // ex: "12.000" -> 12000
    const clean = trimmed.replace(/\./g, '')
    const v = parseFloat(clean)
    return isNaN(v) ? 0 : v
  }

  // Padrão parseFloat direto
  const v = parseFloat(trimmed)
  return isNaN(v) ? 0 : v
}

export function CalculadoraCET() {
  const [modo, setModo] = useState<ModoCET>('direto')

  // Inputs - Modo Direto (SABE A TAXA?)
  const [valorTotalInput, setValorTotalInput] = useState<string>('12000')
  const [entradaInput, setEntradaInput] = useState<string>('2000')
  const [parcelasInput, setParcelasInput] = useState<string>('12')
  const [taxaMensalInput, setTaxaMensalInput] = useState<string>('1.99')
  const [descontoAVistaInput, setDescontoAVistaInput] = useState<string>('10')

  // Inputs - Modo Reverso (SABE A PARCELA?)
  const [revValorTotalInput, setRevValorTotalInput] = useState<string>('12000')
  const [revEntradaInput, setRevEntradaInput] = useState<string>('')
  const [revParcelasInput, setRevParcelasInput] = useState<string>('12')
  const [revValorParcelaInput, setRevValorParcelaInput] = useState<string>('1100')
  const [revDescontoAVistaInput, setRevDescontoAVistaInput] = useState<string>('10')

  const [copied, setCopied] = useState(false)

  // Conversões numéricas - Modo Direto
  const valorTotal = useMemo(() => Math.max(0, parsePtBrNumber(valorTotalInput)), [valorTotalInput])
  const valorEntrada = useMemo(() => Math.max(0, parsePtBrNumber(entradaInput)), [entradaInput])
  const numParcelas = useMemo(() => {
    const v = parseInt(parcelasInput, 10)
    return isNaN(v) || v < 1 ? 1 : v
  }, [parcelasInput])
  const taxaMensal = useMemo(() => Math.max(0, parsePtBrNumber(taxaMensalInput)), [taxaMensalInput])
  const descontoAVista = useMemo(
    () => Math.max(0, parsePtBrNumber(descontoAVistaInput)),
    [descontoAVistaInput],
  )

  // Conversões numéricas - Modo Reverso
  const revValorTotal = useMemo(
    () => Math.max(0, parsePtBrNumber(revValorTotalInput)),
    [revValorTotalInput],
  )
  const revValorEntrada = useMemo(
    () => Math.max(0, parsePtBrNumber(revEntradaInput)),
    [revEntradaInput],
  )
  const revNumParcelas = useMemo(() => {
    const v = parseInt(revParcelasInput, 10)
    return isNaN(v) || v < 1 ? 1 : v
  }, [revParcelasInput])
  const revValorParcela = useMemo(
    () => Math.max(0, parsePtBrNumber(revValorParcelaInput)),
    [revValorParcelaInput],
  )
  const revDescontoAVista = useMemo(
    () => Math.max(0, parsePtBrNumber(revDescontoAVistaInput)),
    [revDescontoAVistaInput],
  )

  // Cálculo - Modo Direto
  const resultadoDireto = useMemo(() => {
    return calcularFinanciamento({
      valorTotal,
      valorEntrada,
      numParcelas,
      taxaMensalPercent: taxaMensal,
      descontoAVistaPercent: descontoAVista,
    })
  }, [valorTotal, valorEntrada, numParcelas, taxaMensal, descontoAVista])

  // Cálculo - Modo Reverso
  const resultadoReverso = useMemo(() => {
    return calcularFinanciamentoReverso({
      valorTotal: revValorTotal,
      valorEntrada: revValorEntrada,
      numParcelas: revNumParcelas,
      valorParcela: revValorParcela,
      descontoAVistaPercent: revDescontoAVista,
    })
  }, [revValorTotal, revValorEntrada, revNumParcelas, revValorParcela, revDescontoAVista])

  // Validação de estado válido para exibição de resultados
  const isDiretoValido = valorTotal > 0 && numParcelas >= 1
  const isReversoValido =
    revValorTotal > 0 &&
    revValorTotal > revValorEntrada &&
    revNumParcelas >= 1 &&
    revValorParcela > 0

  // Atalhos de parcelas
  const handleSetParcelasRapido = (qtd: number) => {
    if (modo === 'direto') {
      setParcelasInput(String(qtd))
    } else {
      setRevParcelasInput(String(qtd))
    }
  }

  // Copiar proposta adaptada ao modo ativo
  const handleCopyProposta = () => {
    if (modo === 'direto') {
      if (!isDiretoValido) return
      const texto = [
        `*PROPOSTA FINANCEIRA - NUVIA PRO*`,
        `• Valor do Tratamento: ${formatCurrency(valorTotal)}`,
        valorEntrada > 0 ? `• Entrada: ${formatCurrency(valorEntrada)}` : null,
        `• Financiado: ${formatCurrency(resultadoDireto.valorFinanciado)} em ${numParcelas}x de ${formatCurrency(resultadoDireto.valorParcela)}`,
        `• Total Parcelado: ${formatCurrency(resultadoDireto.totalParcelado)}`,
        descontoAVista > 0
          ? `• Opção À Vista (${formatPercent(descontoAVista)} desc.): ${formatCurrency(resultadoDireto.valorAVistaComDesconto)}`
          : null,
        `• Taxa de Juros: ${formatPercent(resultadoDireto.taxaMensalPercent)} a.m.`,
        `• CET Estimado: ${formatPercent(resultadoDireto.cetMensalPercent)} a.m. (${formatPercent(resultadoDireto.cetAnualPercent)} a.a.)`,
        descontoAVista > 0 ? `• Análise: ${resultadoDireto.recomendacao}` : null,
      ]
        .filter(Boolean)
        .join('\n')

      navigator.clipboard.writeText(texto)
      setCopied(true)
      toast.success('Proposta copiada para a área de transferência!', {
        description: `Parcela: ${numParcelas}x de ${formatCurrency(resultadoDireto.valorParcela)}`,
      })
      setTimeout(() => setCopied(false), 2000)
    } else {
      if (!isReversoValido) return
      const texto = [
        `*ANÁLISE DE FINANCIAMENTO - MODO REVERSO (NUVIA PRO)*`,
        `• Valor Total: ${formatCurrency(revValorTotal)}`,
        revValorEntrada > 0 ? `• Entrada: ${formatCurrency(revValorEntrada)}` : null,
        `• Valor Financiado: ${formatCurrency(resultadoReverso.valorFinanciado)}`,
        `• Plano Proposto: ${revNumParcelas}x de ${formatCurrency(revValorParcela)}`,
        `• Total Pago: ${formatCurrency(resultadoReverso.totalParcelado)}`,
        `• Juros Embutidos: ${formatCurrency(resultadoReverso.totalJuros)} (${formatPercent(resultadoReverso.jurosPercentual)})`,
        `• Taxa Real Embutida: ${formatPercent(resultadoReverso.taxaMensalPercent)} a.m.`,
        `• CET Real: ${formatPercent(resultadoReverso.cetMensalPercent)} a.m. (${formatPercent(resultadoReverso.cetAnualPercent)} a.a.)`,
        revDescontoAVista > 0
          ? `• À Vista (${formatPercent(revDescontoAVista)} desc.): ${formatCurrency(resultadoReverso.valorAVistaComDesconto)}`
          : null,
        revDescontoAVista > 0 ? `• Comparativo: ${resultadoReverso.recomendacao}` : null,
      ]
        .filter(Boolean)
        .join('\n')

      navigator.clipboard.writeText(texto)
      setCopied(true)
      toast.success('Análise de financiamento copiada!', {
        description: `Taxa real descoberta: ${formatPercent(resultadoReverso.taxaMensalPercent)} a.m.`,
      })
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const activeNumParcelas = modo === 'direto' ? numParcelas : revNumParcelas

  return (
    <div className="flex flex-col h-full space-y-3.5 pb-2">
      {/* SELETOR DE MODO NO TOPO */}
      <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl grid grid-cols-2 gap-1 shrink-0">
        <button
          type="button"
          onClick={() => setModo('direto')}
          className={`h-8 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            modo === 'direto'
              ? 'bg-secondary text-primary shadow-sm font-extrabold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Percent className="w-3.5 h-3.5" />
          <span>SABE A TAXA?</span>
        </button>

        <button
          type="button"
          onClick={() => setModo('reverso')}
          className={`h-8 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            modo === 'reverso'
              ? 'bg-secondary text-primary shadow-sm font-extrabold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>SABE A PARCELA?</span>
        </button>
      </div>

      {/* MODO DIRETO */}
      {modo === 'direto' && (
        <>
          {/* Formulário de Entradas - Direto */}
          <div className="space-y-3 bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-xl">
            {/* Valor Total do Tratamento/Venda */}
            <div className="space-y-1">
              <Label className="text-xs text-slate-300 font-medium flex items-center justify-between">
                <span>Valor Total do Tratamento (R$)</span>
                {valorTotal > 0 && (
                  <span className="text-[11px] text-secondary font-mono">
                    {formatCurrency(valorTotal)}
                  </span>
                )}
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">
                  R$
                </span>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={valorTotalInput}
                  onChange={(e) => setValorTotalInput(e.target.value)}
                  placeholder="0,00"
                  className="pl-9 bg-slate-950 border-slate-800 text-white font-mono text-sm focus-visible:ring-secondary"
                />
              </div>
            </div>

            {/* Entrada e Desconto à Vista */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-slate-300 font-medium">Entrada (R$)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">
                    R$
                  </span>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={entradaInput}
                    onChange={(e) => setEntradaInput(e.target.value)}
                    placeholder="0,00"
                    className="pl-9 bg-slate-950 border-slate-800 text-white font-mono text-sm focus-visible:ring-secondary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-slate-300 font-medium flex items-center justify-between">
                  <span>Desc. à Vista</span>
                  <span className="text-[10px] text-slate-400">(opcional)</span>
                </Label>
                <div className="relative">
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={descontoAVistaInput}
                    onChange={(e) => setDescontoAVistaInput(e.target.value)}
                    placeholder="0"
                    className="pr-8 bg-slate-950 border-slate-800 text-white font-mono text-sm focus-visible:ring-secondary"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* Nº Parcelas e Taxa Mensal */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-slate-300 font-medium">Nº de Parcelas</Label>
                <Input
                  type="number"
                  min="1"
                  max="120"
                  value={parcelasInput}
                  onChange={(e) => setParcelasInput(e.target.value)}
                  placeholder="12"
                  className="bg-slate-950 border-slate-800 text-white font-mono text-sm focus-visible:ring-secondary"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-slate-300 font-medium">Taxa Financiamento</Label>
                <div className="relative">
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={taxaMensalInput}
                    onChange={(e) => setTaxaMensalInput(e.target.value)}
                    placeholder="0.00"
                    className="pr-12 bg-slate-950 border-slate-800 text-white font-mono text-sm focus-visible:ring-secondary"
                  />
                  <span className="absolute right-2.5 top-2.5 text-[11px] text-slate-400 font-semibold">
                    % a.m.
                  </span>
                </div>
              </div>
            </div>

            {/* Botões rápidos de parcelamento */}
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="text-[10px] text-slate-400 font-medium">Atalhos:</span>
              {[6, 10, 12, 18, 24].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleSetParcelasRapido(n)}
                  className={`px-2 py-0.5 text-[11px] rounded font-mono transition-colors ${
                    numParcelas === n
                      ? 'bg-secondary text-primary font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {n}x
                </button>
              ))}
              <button
                type="button"
                onClick={() => setTaxaMensalInput('0')}
                className={`px-2 py-0.5 text-[11px] rounded transition-colors ml-auto ${
                  taxaMensal === 0
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                0% (s/ juros)
              </button>
            </div>
          </div>

          {/* Cartão de Resumo da Parcela e CET - Direto */}
          {isDiretoValido ? (
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-secondary/30 rounded-2xl p-4 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-secondary font-bold">
                  PARCELAMENTO PRICE & CET
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyProposta}
                  className="h-6 px-2 text-[11px] border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white flex items-center gap-1"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-secondary" />
                      <span>Copiar Proposta</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Valor da Parcela em Destaque */}
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-xs text-slate-400">Valor de Cada Parcela</div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight drop-shadow-sm flex items-baseline gap-1">
                    <span className="text-secondary text-xl sm:text-2xl font-bold">
                      {numParcelas}x de
                    </span>
                    <span>{formatCurrency(resultadoDireto.valorParcela)}</span>
                  </div>
                </div>
              </div>

              {/* Detalhamento do Financiamento */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block">Total Parcelado</span>
                  <span className="font-bold text-slate-200 font-mono">
                    {formatCurrency(resultadoDireto.totalParcelado)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Juros Embutidos</span>
                  <span
                    className={`font-bold font-mono ${
                      resultadoDireto.totalJurosFinanciamento > 0
                        ? 'text-amber-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {formatCurrency(resultadoDireto.totalJurosFinanciamento)}
                  </span>
                </div>
              </div>

              {/* Indicadores de CET */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 grid grid-cols-2 gap-2 text-center">
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">
                    CET Mensal
                  </div>
                  <div className="text-sm font-bold text-secondary font-mono">
                    {formatPercent(resultadoDireto.cetMensalPercent)} a.m.
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">
                    CET Anualizado
                  </div>
                  <div className="text-sm font-bold text-amber-300 font-mono">
                    {formatPercent(resultadoDireto.cetAnualPercent)} a.a.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-900/40 border border-dashed border-slate-800 rounded-xl">
              Informe o valor total do tratamento para ver os cálculos.
            </div>
          )}

          {/* COMPARADOR: À VISTA vs. PARCELADO */}
          {isDiretoValido && (
            <div
              className={`border rounded-2xl p-3.5 space-y-2.5 transition-all ${
                resultadoDireto.melhorOpcao === 'avista'
                  ? 'bg-emerald-950/25 border-emerald-500/40'
                  : resultadoDireto.melhorOpcao === 'parcelado'
                    ? 'bg-blue-950/25 border-blue-500/40'
                    : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-secondary" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Comparador: À Vista vs. Parcelado
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">
                    À Vista ({descontoAVista}% desc.)
                  </span>
                  <span className="text-sm font-bold text-emerald-400 font-mono block">
                    {formatCurrency(resultadoDireto.valorAVistaComDesconto)}
                  </span>
                </div>

                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">
                    Total Parcelado ({numParcelas}x)
                  </span>
                  <span className="text-sm font-bold text-slate-200 font-mono block">
                    {formatCurrency(resultadoDireto.totalParcelado)}
                  </span>
                </div>
              </div>

              {/* Recomendação Comercial */}
              <div className="flex items-start gap-2 pt-1 text-xs">
                {resultadoDireto.melhorOpcao === 'avista' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold text-slate-200">
                    {resultadoDireto.melhorOpcao === 'avista'
                      ? `À vista economiza ${formatCurrency(resultadoDireto.economiaAVista)}`
                      : resultadoDireto.melhorOpcao === 'parcelado'
                        ? `Parcelado mais vantajoso em ${formatCurrency(resultadoDireto.diferencaReal)}`
                        : 'Condições financeiras equivalentes'}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    {resultadoDireto.descontoAVistaPercent > 0
                      ? `Mesmo em parcelamento sem juros, o desconto à vista representa um ganho real de ${formatPercent(resultadoDireto.cetMensalPercent)} a.m.`
                      : 'Informe uma taxa de desconto à vista acima para calcular o custo de oportunidade exato.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* MODO REVERSO (SABE A PARCELA?) */}
      {modo === 'reverso' && (
        <>
          {/* Formulário de Entradas - Modo Reverso */}
          <div className="space-y-3 bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-xl">
            {/* Valor Financiado / Total */}
            <div className="space-y-1">
              <Label className="text-xs text-slate-300 font-medium flex items-center justify-between">
                <span>Valor Financiado / Total (R$)</span>
                {revValorTotal > 0 && (
                  <span className="text-[11px] text-secondary font-mono">
                    {formatCurrency(revValorTotal)}
                  </span>
                )}
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">
                  R$
                </span>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={revValorTotalInput}
                  onChange={(e) => setRevValorTotalInput(e.target.value)}
                  placeholder="0,00"
                  className="pl-9 bg-slate-950 border-slate-800 text-white font-mono text-sm focus-visible:ring-secondary"
                />
              </div>
            </div>

            {/* Entrada (opcional) e Desconto à Vista */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-slate-300 font-medium flex items-center justify-between">
                  <span>Entrada</span>
                  <span className="text-[10px] text-slate-400">(opcional)</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">
                    R$
                  </span>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={revEntradaInput}
                    onChange={(e) => setRevEntradaInput(e.target.value)}
                    placeholder="0,00"
                    className="pl-9 bg-slate-950 border-slate-800 text-white font-mono text-sm focus-visible:ring-secondary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-slate-300 font-medium flex items-center justify-between">
                  <span>Desc. à Vista</span>
                  <span className="text-[10px] text-slate-400">(opcional)</span>
                </Label>
                <div className="relative">
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={revDescontoAVistaInput}
                    onChange={(e) => setRevDescontoAVistaInput(e.target.value)}
                    placeholder="0"
                    className="pr-8 bg-slate-950 border-slate-800 text-white font-mono text-sm focus-visible:ring-secondary"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* Nº Parcelas e Valor de Cada Parcela */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-slate-300 font-medium">Nº de Parcelas</Label>
                <Input
                  type="number"
                  min="1"
                  max="120"
                  value={revParcelasInput}
                  onChange={(e) => setRevParcelasInput(e.target.value)}
                  placeholder="12"
                  className="bg-slate-950 border-slate-800 text-white font-mono text-sm focus-visible:ring-secondary"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-slate-300 font-medium">Valor da Parcela</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">
                    R$
                  </span>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={revValorParcelaInput}
                    onChange={(e) => setRevValorParcelaInput(e.target.value)}
                    placeholder="0,00"
                    className="pl-9 bg-slate-950 border-slate-800 text-white font-mono text-sm focus-visible:ring-secondary"
                  />
                </div>
              </div>
            </div>

            {/* Atalhos rápidos de parcelas */}
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="text-[10px] text-slate-400 font-medium">Atalhos:</span>
              {[6, 10, 12, 18, 24].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleSetParcelasRapido(n)}
                  className={`px-2 py-0.5 text-[11px] rounded font-mono transition-colors ${
                    activeNumParcelas === n
                      ? 'bg-secondary text-primary font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {n}x
                </button>
              ))}
              {revValorTotal > 0 && revNumParcelas > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const financiado = Math.max(0, revValorTotal - revValorEntrada)
                    const pmtSemJuros = (financiado / revNumParcelas).toFixed(2)
                    setRevValorParcelaInput(pmtSemJuros)
                  }}
                  className="px-2 py-0.5 text-[11px] rounded transition-colors ml-auto bg-slate-800 text-slate-400 hover:text-white"
                  title="Dividir sem acréscimo"
                >
                  S/ juros (1/{revNumParcelas})
                </button>
              )}
            </div>
          </div>

          {/* Cartão de Resumo - Modo Reverso (Taxa descoberta e CET) */}
          {isReversoValido ? (
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-secondary/30 rounded-2xl p-4 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-secondary font-bold flex items-center gap-1.5">
                  <Search className="w-3 h-3" />
                  TAXA REAL EMBUTIDA
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyProposta}
                  className="h-6 px-2 text-[11px] border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white flex items-center gap-1"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-secondary" />
                      <span>Copiar Proposta</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Taxa de Juros Descoberta em Destaque */}
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-xs text-slate-400">Taxa de Juros Nominal</div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight drop-shadow-sm flex items-baseline gap-1.5">
                    <span className="text-secondary text-2xl sm:text-3xl font-bold">
                      {formatPercent(resultadoReverso.taxaMensalPercent)}
                    </span>
                    <span className="text-xs text-slate-400 font-sans font-normal">ao mês</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] text-slate-400">Financiado</div>
                  <div className="text-sm font-bold text-slate-200 font-mono">
                    {formatCurrency(resultadoReverso.valorFinanciado)}
                  </div>
                </div>
              </div>

              {/* Detalhamento do Financiamento */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block">Total a Pagar</span>
                  <span className="font-bold text-slate-200 font-mono">
                    {formatCurrency(resultadoReverso.totalParcelado)}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    ({revNumParcelas}x de {formatCurrency(revValorParcela)})
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Juros Embutidos</span>
                  <span
                    className={`font-bold font-mono ${
                      resultadoReverso.totalJuros > 0 ? 'text-amber-400' : 'text-slate-400'
                    }`}
                  >
                    {formatCurrency(resultadoReverso.totalJuros)}
                  </span>
                  <span className="text-[10px] text-amber-500/80 block">
                    +{formatPercent(resultadoReverso.jurosPercentual, 1)} sobre o valor
                  </span>
                </div>
              </div>

              {/* Indicadores de CET Real */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 grid grid-cols-2 gap-2 text-center">
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">
                    CET Mensal
                  </div>
                  <div className="text-sm font-bold text-secondary font-mono">
                    {formatPercent(resultadoReverso.cetMensalPercent)} a.m.
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">
                    CET Anualizado
                  </div>
                  <div className="text-sm font-bold text-amber-300 font-mono">
                    {formatPercent(resultadoReverso.cetAnualPercent)} a.a.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-900/40 border border-dashed border-slate-800 rounded-xl space-y-1">
              <Info className="w-5 h-5 mx-auto text-slate-600 mb-1" />
              <p>
                Informe o valor financiado, parcelas e valor da parcela para calcular a taxa real.
              </p>
            </div>
          )}

          {/* COMPARADOR: À VISTA vs. PARCELADO - MODO REVERSO */}
          {isReversoValido && (
            <div
              className={`border rounded-2xl p-3.5 space-y-2.5 transition-all ${
                resultadoReverso.melhorOpcao === 'avista'
                  ? 'bg-emerald-950/25 border-emerald-500/40'
                  : resultadoReverso.melhorOpcao === 'parcelado'
                    ? 'bg-blue-950/25 border-blue-500/40'
                    : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-secondary" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Comparador: À Vista vs. Parcelado
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">
                    À Vista ({revDescontoAVista}% desc.)
                  </span>
                  <span className="text-sm font-bold text-emerald-400 font-mono block">
                    {formatCurrency(resultadoReverso.valorAVistaComDesconto)}
                  </span>
                </div>

                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">
                    Total Parcelado ({revNumParcelas}x)
                  </span>
                  <span className="text-sm font-bold text-slate-200 font-mono block">
                    {formatCurrency(resultadoReverso.totalParcelado)}
                  </span>
                </div>
              </div>

              {/* Recomendação Comercial */}
              <div className="flex items-start gap-2 pt-1 text-xs">
                {resultadoReverso.melhorOpcao === 'avista' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold text-slate-200">
                    {resultadoReverso.melhorOpcao === 'avista'
                      ? `À vista economiza ${formatCurrency(resultadoReverso.economiaAVista)}`
                      : resultadoReverso.melhorOpcao === 'parcelado'
                        ? `Parcelado mais vantajoso em ${formatCurrency(resultadoReverso.diferencaReal)}`
                        : 'Condições financeiras equivalentes'}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    {resultadoReverso.descontoAVistaPercent > 0
                      ? `Considerando o desconto à vista, o custo efetivo (CET) é de ${formatPercent(resultadoReverso.cetMensalPercent)} a.m. (${formatPercent(resultadoReverso.cetAnualPercent)} a.a.).`
                      : 'Adicione uma taxa de desconto à vista acima para ver a economia de oportunidade.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

import { useState, useMemo } from 'react'
import { formatCurrency, formatPercent, calcularFinanciamento } from './calculadora-utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Copy, Check, Scale, Percent, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react'

export function CalculadoraCET() {
  // Inputs da proposta
  const [valorTotalInput, setValorTotalInput] = useState<string>('12000')
  const [entradaInput, setEntradaInput] = useState<string>('2000')
  const [parcelasInput, setParcelasInput] = useState<string>('12')
  const [taxaMensalInput, setTaxaMensalInput] = useState<string>('1.99')
  const [descontoAVistaInput, setDescontoAVistaInput] = useState<string>('10')

  const [copied, setCopied] = useState(false)

  // Conversões numéricas seguras
  const valorTotal = useMemo(() => {
    const v = parseFloat(valorTotalInput.replace(/\./g, '').replace(',', '.'))
    return isNaN(v) ? 0 : Math.max(0, v)
  }, [valorTotalInput])

  const valorEntrada = useMemo(() => {
    const v = parseFloat(entradaInput.replace(/\./g, '').replace(',', '.'))
    return isNaN(v) ? 0 : Math.max(0, v)
  }, [entradaInput])

  const numParcelas = useMemo(() => {
    const v = parseInt(parcelasInput, 10)
    return isNaN(v) || v < 1 ? 1 : v
  }, [parcelasInput])

  const taxaMensal = useMemo(() => {
    const v = parseFloat(taxaMensalInput.replace(/\./g, '').replace(',', '.'))
    return isNaN(v) ? 0 : Math.max(0, v)
  }, [taxaMensalInput])

  const descontoAVista = useMemo(() => {
    const v = parseFloat(descontoAVistaInput.replace(/\./g, '').replace(',', '.'))
    return isNaN(v) ? 0 : Math.max(0, v)
  }, [descontoAVistaInput])

  // Cálculo completo do CET e comparador
  const resultado = useMemo(() => {
    return calcularFinanciamento({
      valorTotal,
      valorEntrada,
      numParcelas,
      taxaMensalPercent: taxaMensal,
      descontoAVistaPercent: descontoAVista,
    })
  }, [valorTotal, valorEntrada, numParcelas, taxaMensal, descontoAVista])

  // Atalhos de parcelamento rápido
  const handleSetParcelasRapido = (qtd: number) => {
    setParcelasInput(String(qtd))
  }

  // Copiar proposta para WhatsApp/Venda
  const handleCopyProposta = () => {
    const texto = [
      `*PROPOSTA FINANCEIRA - NUVIA PRO*`,
      `• Valor do Tratamento: ${formatCurrency(valorTotal)}`,
      valorEntrada > 0 ? `• Entrada: ${formatCurrency(valorEntrada)}` : null,
      `• Financiado: ${formatCurrency(resultado.valorFinanciado)} em ${numParcelas}x de ${formatCurrency(resultado.valorParcela)}`,
      `• Total Parcelado: ${formatCurrency(resultado.totalParcelado)}`,
      descontoAVista > 0
        ? `• Opção À Vista (${formatPercent(descontoAVista)} desc.): ${formatCurrency(resultado.valorAVistaComDesconto)}`
        : null,
      `• CET Estimado: ${formatPercent(resultado.cetMensalPercent)} a.m. (${formatPercent(resultado.cetAnualPercent)} a.a.)`,
      resultado.descontoAVistaPercent > 0 ? `• Análise: ${resultado.recomendacao}` : null,
    ]
      .filter(Boolean)
      .join('\n')

    navigator.clipboard.writeText(texto)
    setCopied(true)
    toast.success('Proposta copiada para a área de transferência!', {
      description: `Parcela: ${numParcelas}x de ${formatCurrency(resultado.valorParcela)}`,
    })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col h-full space-y-3.5">
      {/* Formulário de Entradas */}
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
            <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">R$</span>
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

      {/* Cartão de Resumo da Parcela e CET */}
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
              <span>{formatCurrency(resultado.valorParcela)}</span>
            </div>
          </div>
        </div>

        {/* Detalhamento do Financiamento */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <div>
            <span className="text-[11px] text-slate-400 block">Total Parcelado</span>
            <span className="font-bold text-slate-200 font-mono">
              {formatCurrency(resultado.totalParcelado)}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">Juros Embutidos</span>
            <span
              className={`font-bold font-mono ${
                resultado.totalJurosFinanciamento > 0 ? 'text-amber-400' : 'text-slate-400'
              }`}
            >
              {formatCurrency(resultado.totalJurosFinanciamento)}
            </span>
          </div>
        </div>

        {/* Indicadores de CET */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 grid grid-cols-2 gap-2 text-center">
          <div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">CET Mensal</div>
            <div className="text-sm font-bold text-secondary font-mono">
              {formatPercent(resultado.cetMensalPercent)} a.m.
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">CET Anualizado</div>
            <div className="text-sm font-bold text-amber-300 font-mono">
              {formatPercent(resultado.cetAnualPercent)} a.a.
            </div>
          </div>
        </div>
      </div>

      {/* COMPARADOR: À VISTA vs. PARCELADO */}
      <div
        className={`border rounded-2xl p-3.5 space-y-2.5 transition-all ${
          resultado.melhorOpcao === 'avista'
            ? 'bg-emerald-950/25 border-emerald-500/40'
            : resultado.melhorOpcao === 'parcelado'
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
              {formatCurrency(resultado.valorAVistaComDesconto)}
            </span>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase font-medium">
              Total Parcelado ({numParcelas}x)
            </span>
            <span className="text-sm font-bold text-slate-200 font-mono block">
              {formatCurrency(resultado.totalParcelado)}
            </span>
          </div>
        </div>

        {/* Recomendação Comercial */}
        <div className="flex items-start gap-2 pt-1 text-xs">
          {resultado.melhorOpcao === 'avista' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div>
            <div className="font-semibold text-slate-200">
              {resultado.melhorOpcao === 'avista'
                ? `À vista economiza ${formatCurrency(resultado.economiaAVista)}`
                : resultado.melhorOpcao === 'parcelado'
                  ? `Parcelado mais vantajoso em ${formatCurrency(resultado.diferencaReal)}`
                  : 'Condições financeiras equivalentes'}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
              {resultado.descontoAVistaPercent > 0
                ? `Mesmo em parcelamento sem juros, o desconto à vista representa um ganho real de ${formatPercent(resultado.cetMensalPercent)} a.m.`
                : 'Informe uma taxa de desconto à vista acima para calcular o custo de oportunidade exato.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

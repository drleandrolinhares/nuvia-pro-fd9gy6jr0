import { useState, useMemo } from 'react'
import {
  formatCurrency,
  formatPercent,
  calcularJurosSimples,
  calcularJurosCompostos,
  PeriodoJurosItem,
} from './calculadora-utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from 'sonner'
import { Copy, Check, TrendingUp, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'

export function CalculadoraJuros() {
  const [tipoJuros, setTipoJuros] = useState<'compostos' | 'simples'>('compostos')
  const [unidadeTempo, setUnidadeTempo] = useState<'meses' | 'anos'>('meses')

  // Inputs
  const [capitalInput, setCapitalInput] = useState<string>('10000')
  const [taxaInput, setTaxaInput] = useState<string>('1.5')
  const [tempoInput, setTempoInput] = useState<string>('12')

  const [copied, setCopied] = useState(false)
  const [showTable, setShowTable] = useState(false)

  // Parsing seguro dos inputs
  const capital = useMemo(() => {
    const val = parseFloat(capitalInput.replace(/\./g, '').replace(',', '.'))
    return isNaN(val) ? 0 : Math.max(0, val)
  }, [capitalInput])

  const taxa = useMemo(() => {
    const val = parseFloat(taxaInput.replace(/\./g, '').replace(',', '.'))
    return isNaN(val) ? 0 : Math.max(0, val)
  }, [taxaInput])

  const tempo = useMemo(() => {
    const val = parseFloat(tempoInput.replace(/\./g, '').replace(',', '.'))
    return isNaN(val) ? 0 : Math.max(0, val)
  }, [tempoInput])

  // Cálculo reativo
  const resultado = useMemo(() => {
    if (tipoJuros === 'simples') {
      return calcularJurosSimples(capital, taxa, tempo)
    } else {
      return calcularJurosCompostos(capital, taxa, tempo, 36)
    }
  }, [tipoJuros, capital, taxa, tempo])

  const handleCopyResumo = () => {
    const texto = [
      `*Simulação de Juros (${tipoJuros === 'compostos' ? 'Compostos' : 'Simples'}) - NUVIA PRO*`,
      `• Capital Inicial: ${formatCurrency(capital)}`,
      `• Taxa: ${formatPercent(taxa)} ao ${unidadeTempo === 'meses' ? 'mês' : 'ano'}`,
      `• Período: ${tempo} ${unidadeTempo === 'meses' ? (tempo === 1 ? 'mês' : 'meses') : tempo === 1 ? 'ano' : 'anos'}`,
      `• Total de Juros: ${formatCurrency(resultado.totalJuros)}`,
      `• Montante Final: ${formatCurrency(resultado.montante)}`,
    ].join('\n')

    navigator.clipboard.writeText(texto)
    setCopied(true)
    toast.success('Resumo de juros copiado!', {
      description: `Montante Final: ${formatCurrency(resultado.montante)}`,
    })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Seletor do Tipo de Juros */}
      <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl grid grid-cols-2 gap-1">
        <button
          type="button"
          onClick={() => setTipoJuros('compostos')}
          className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            tipoJuros === 'compostos'
              ? 'bg-secondary text-primary font-bold shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Juros Compostos
        </button>
        <button
          type="button"
          onClick={() => setTipoJuros('simples')}
          className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            tipoJuros === 'simples'
              ? 'bg-secondary text-primary font-bold shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Juros Simples
        </button>
      </div>

      {/* Formulário de Parâmetros */}
      <div className="space-y-3 bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-xl">
        {/* Capital */}
        <div className="space-y-1">
          <Label className="text-xs text-slate-300 font-medium flex items-center justify-between">
            <span>Capital Inicial (R$)</span>
            {capital > 0 && (
              <span className="text-[11px] text-secondary font-mono">
                {formatCurrency(capital)}
              </span>
            )}
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">R$</span>
            <Input
              type="text"
              inputMode="decimal"
              value={capitalInput}
              onChange={(e) => setCapitalInput(e.target.value)}
              placeholder="0,00"
              className="pl-9 bg-slate-950 border-slate-800 text-white font-mono text-sm focus-visible:ring-secondary"
            />
          </div>
        </div>

        {/* Taxa e Unidade */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-slate-300 font-medium">Taxa de Juros (%)</Label>
            <div className="relative">
              <Input
                type="text"
                inputMode="decimal"
                value={taxaInput}
                onChange={(e) => setTaxaInput(e.target.value)}
                placeholder="0.00"
                className="pr-8 bg-slate-950 border-slate-800 text-white font-mono text-sm focus-visible:ring-secondary"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">
                %
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-slate-300 font-medium">Periodicidade</Label>
            <div className="flex bg-slate-950 border border-slate-800 rounded-md p-1 h-9">
              <button
                type="button"
                onClick={() => setUnidadeTempo('meses')}
                className={`flex-1 text-xs font-semibold rounded transition-colors ${
                  unidadeTempo === 'meses'
                    ? 'bg-slate-800 text-secondary'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ao Mês
              </button>
              <button
                type="button"
                onClick={() => setUnidadeTempo('anos')}
                className={`flex-1 text-xs font-semibold rounded transition-colors ${
                  unidadeTempo === 'anos'
                    ? 'bg-slate-800 text-secondary'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ao Ano
              </button>
            </div>
          </div>
        </div>

        {/* Tempo */}
        <div className="space-y-1">
          <Label className="text-xs text-slate-300 font-medium">
            Tempo ({unidadeTempo === 'meses' ? 'Nº de meses' : 'Nº de anos'})
          </Label>
          <Input
            type="number"
            min="1"
            value={tempoInput}
            onChange={(e) => setTempoInput(e.target.value)}
            placeholder="12"
            className="bg-slate-950 border-slate-800 text-white font-mono text-sm focus-visible:ring-secondary"
          />
        </div>
      </div>

      {/* Cartão de Resultados */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-secondary/30 rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-secondary font-bold">
            RESULTADO • {tipoJuros === 'compostos' ? 'COMPOSTO' : 'SIMPLES'}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyResumo}
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
                <span>Copiar</span>
              </>
            )}
          </Button>
        </div>

        <div>
          <div className="text-xs text-slate-400">Montante Final Acumulado</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-secondary font-mono tracking-tight drop-shadow-sm">
            {formatCurrency(resultado.montante)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
          <div>
            <div className="text-[11px] text-slate-400">Total em Juros</div>
            <div className="text-sm font-bold text-emerald-400 font-mono">
              + {formatCurrency(resultado.totalJuros)}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Rentabilidade Total</div>
            <div className="text-sm font-bold text-slate-200 font-mono">
              {capital > 0 ? formatPercent((resultado.totalJuros / capital) * 100) : '0,00%'}
            </div>
          </div>
        </div>
      </div>

      {/* Mini-tabela de Evolução (para juros compostos) */}
      {tipoJuros === 'compostos' &&
        resultado.tabelaEvolucao &&
        resultado.tabelaEvolucao.length > 0 && (
          <div className="space-y-1.5 flex-1">
            <button
              type="button"
              onClick={() => setShowTable(!showTable)}
              className="w-full flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-secondary py-1 px-1 transition-colors"
            >
              <span>Evolução período a período ({resultado.tabelaEvolucao.length} períodos)</span>
              {showTable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showTable && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-[11px] text-left">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono sticky top-0">
                    <tr>
                      <th className="py-1.5 px-2.5">{unidadeTempo === 'meses' ? 'Mês' : 'Ano'}</th>
                      <th className="py-1.5 px-2.5">Juros</th>
                      <th className="py-1.5 px-2.5 text-right">Saldo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                    {resultado.tabelaEvolucao.map((row: PeriodoJurosItem) => (
                      <tr key={row.periodo} className="hover:bg-slate-800/40">
                        <td className="py-1.5 px-2.5 font-semibold text-slate-400">
                          #{row.periodo}
                        </td>
                        <td className="py-1.5 px-2.5 text-emerald-400">
                          +{formatCurrency(row.jurosPeriodo)}
                        </td>
                        <td className="py-1.5 px-2.5 text-right font-medium text-white">
                          {formatCurrency(row.saldoFinal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      <div className="text-[11px] text-slate-500 text-center font-mono pt-1">
        Fórmula: {tipoJuros === 'compostos' ? 'M = C · (1 + i)^t' : 'M = C · (1 + i · t)'}
      </div>
    </div>
  )
}

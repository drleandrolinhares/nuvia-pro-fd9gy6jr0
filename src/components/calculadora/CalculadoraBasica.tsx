import { useState, useEffect, useRef } from 'react'
import {
  formatCurrency,
  formatNumberPtBr,
  safeEvaluateExpression,
  HistoricoItem,
} from './calculadora-utils'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Copy, History, Trash2, Delete, Check } from 'lucide-react'

interface CalculadoraBasicaProps {
  onCopyResult?: (val: string) => void
  isActive?: boolean
}

const STORAGE_KEY_BASICA = 'nuvia_calc_basica_state'

interface BasicaSavedState {
  display: string
  expression: string
  historico: HistoricoItem[]
}

const getInitialBasicaState = (): BasicaSavedState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BASICA)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        display: typeof parsed.display === 'string' && parsed.display ? parsed.display : '0',
        expression: typeof parsed.expression === 'string' ? parsed.expression : '',
        historico: Array.isArray(parsed.historico) ? parsed.historico : [],
      }
    }
  } catch {
    // ignore
  }
  return {
    display: '0',
    expression: '',
    historico: [],
  }
}

export function CalculadoraBasica({ onCopyResult, isActive = true }: CalculadoraBasicaProps) {
  const [initial] = useState<BasicaSavedState>(getInitialBasicaState)
  const [display, setDisplay] = useState<string>(initial.display)
  const [expression, setExpression] = useState<string>(initial.expression)
  const [hasEvaluated, setHasEvaluated] = useState(false)
  const [copied, setCopied] = useState(false)
  const [historico, setHistorico] = useState<HistoricoItem[]>(initial.historico)
  const [showHistory, setShowHistory] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Salvar estado no localStorage sempre que display, expression ou historico mudar
  useEffect(() => {
    try {
      const stateToSave: BasicaSavedState = {
        display,
        expression,
        historico,
      }
      localStorage.setItem(STORAGE_KEY_BASICA, JSON.stringify(stateToSave))
    } catch {
      // ignore
    }
  }, [display, expression, historico])

  // Manipular clique de dígitos e vírgula
  const handleDigit = (digit: string) => {
    if (hasEvaluated) {
      setDisplay(digit === ',' ? '0,' : digit)
      setExpression('')
      setHasEvaluated(false)
      return
    }

    if (digit === ',') {
      if (!display.includes(',')) {
        setDisplay(display + ',')
      }
      return
    }

    if (display === '0' || display === 'Erro') {
      setDisplay(digit)
    } else {
      // Limitar a 14 dígitos para caber no display
      if (display.replace(/\D/g, '').length < 14) {
        setDisplay(display + digit)
      }
    }
  }

  // Manipular operadores (+, -, ×, ÷)
  const handleOperator = (op: string) => {
    setHasEvaluated(false)
    if (display === 'Erro') return

    const currentVal = display

    if (expression && !hasEvaluated) {
      // Se já tínhamos uma expressão prévia, resolver passo intermediário
      const fullExpr = `${expression} ${currentVal}`
      const evalRes = safeEvaluateExpression(fullExpr)
      if (evalRes.success && evalRes.result !== undefined) {
        const fmtRes = formatNumberPtBr(evalRes.result, 8)
        setExpression(`${fmtRes} ${op}`)
        setDisplay(fmtRes)
        return
      }
    }

    setExpression(`${currentVal} ${op}`)
    setDisplay('0')
  }

  // Igual (=)
  const handleEquals = () => {
    if (!expression || display === 'Erro') return

    const fullExpr = `${expression} ${display}`
    const evalRes = safeEvaluateExpression(fullExpr)

    if (evalRes.success && evalRes.result !== undefined) {
      const resNum = evalRes.result
      const resStr = formatNumberPtBr(resNum, 8)

      // Adiciona ao histórico da sessão
      const novoItem: HistoricoItem = {
        id: Math.random().toString(36).substring(2, 9),
        expressao: fullExpr,
        resultado: resNum,
        dataHora: new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      }
      setHistorico((prev) => [novoItem, ...prev.slice(0, 19)])

      setDisplay(resStr)
      setExpression('')
      setHasEvaluated(true)
    } else {
      setDisplay('Erro')
      setExpression('')
      setHasEvaluated(true)
    }
  }

  // Limpar tudo (C)
  const handleClear = () => {
    setDisplay('0')
    setExpression('')
    setHasEvaluated(false)
  }

  // Backspace (⌫)
  const handleBackspace = () => {
    if (hasEvaluated || display === 'Erro') {
      handleClear()
      return
    }
    if (display.length > 1) {
      setDisplay(display.slice(0, -1))
    } else {
      setDisplay('0')
    }
  }

  // Inverter sinal (±)
  const handlePlusMinus = () => {
    if (display === '0' || display === 'Erro') return
    if (display.startsWith('-')) {
      setDisplay(display.substring(1))
    } else {
      setDisplay('-' + display)
    }
  }

  // Porcentagem (%)
  const handlePercentage = () => {
    if (display === 'Erro') return
    const num = parseFloat(display.replace(/\./g, '').replace(',', '.'))
    if (!isNaN(num)) {
      if (expression) {
        // Ex: "500 +" com "10 %" -> 10% de 500 = 50
        const firstPart = parseFloat(expression.split(' ')[0].replace(/\./g, '').replace(',', '.'))
        if (!isNaN(firstPart)) {
          const pctVal = (firstPart * num) / 100
          setDisplay(formatNumberPtBr(pctVal, 6))
          return
        }
      }
      const val = num / 100
      setDisplay(formatNumberPtBr(val, 6))
    }
  }

  // Copiar valor exibido
  const handleCopy = () => {
    if (display === 'Erro') return
    navigator.clipboard.writeText(display)
    setCopied(true)
    toast.success('Copiado para a área de transferência', {
      description: display,
    })
    if (onCopyResult) onCopyResult(display)
    setTimeout(() => setCopied(false), 2000)
  }

  // Usar item do histórico
  const handleSelectHistoryItem = (item: HistoricoItem) => {
    setDisplay(formatNumberPtBr(item.resultado, 8))
    setExpression('')
    setHasEvaluated(true)
    setShowHistory(false)
  }

  // Suporte a teclado físico quando o painel estiver ativo
  useEffect(() => {
    if (!isActive) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Evitar interceptar se o foco estiver num input ou textarea
      const target = e.target as HTMLElement
      if (
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable
      ) {
        return
      }

      const key = e.key

      if (key >= '0' && key <= '9') {
        e.preventDefault()
        handleDigit(key)
      } else if (key === ',' || key === '.') {
        e.preventDefault()
        handleDigit(',')
      } else if (key === '+') {
        e.preventDefault()
        handleOperator('+')
      } else if (key === '-') {
        e.preventDefault()
        handleOperator('-')
      } else if (key === '*') {
        e.preventDefault()
        handleOperator('×')
      } else if (key === '/') {
        e.preventDefault()
        handleOperator('÷')
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault()
        handleEquals()
      } else if (key === 'Backspace') {
        e.preventDefault()
        handleBackspace()
      } else if (key === 'Escape') {
        // Se histórico aberto, fecha ele primeiro
        if (showHistory) {
          setShowHistory(false)
          e.stopPropagation()
          return
        }
        e.preventDefault()
        handleClear()
      } else if (key === '%') {
        e.preventDefault()
        handlePercentage()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isActive, display, expression, hasEvaluated, showHistory])

  return (
    <div ref={containerRef} className="flex flex-col h-full space-y-3">
      {/* Barra superior de ações */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            className={`h-7 px-2 text-xs flex items-center gap-1.5 transition-colors ${
              showHistory
                ? 'bg-secondary text-primary font-bold'
                : 'text-slate-400 hover:text-secondary hover:bg-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Histórico ({historico.length})</span>
          </Button>
          {historico.length > 0 && showHistory && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setHistorico([])}
              className="h-7 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
              title="Limpar histórico"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Limpar
            </Button>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="h-7 px-2.5 text-xs border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white flex items-center gap-1.5"
          title="Copiar resultado"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 text-secondary" />
              <span>Copiar</span>
            </>
          )}
        </Button>
      </div>

      {/* Histórico retrátil ou Tela de Display */}
      {showHistory ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 h-48 overflow-y-auto space-y-2">
          {historico.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">
              Nenhuma conta realizada nesta sessão.
            </p>
          ) : (
            historico.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectHistoryItem(item)}
                className="w-full text-left p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-secondary/40 transition-colors group flex items-center justify-between"
              >
                <div className="overflow-hidden">
                  <div className="text-[11px] text-slate-400 font-mono truncate">
                    {item.expressao}
                  </div>
                  <div className="text-sm font-bold text-secondary group-hover:text-amber-300 font-mono">
                    = {formatNumberPtBr(item.resultado, 6)}
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 shrink-0 ml-2">{item.dataHora}</span>
              </button>
            ))
          )}
        </div>
      ) : (
        /* Display da Calculadora */
        <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-secondary/30 rounded-2xl p-4 shadow-inner flex flex-col justify-end min-h-[110px]">
          <div className="text-right text-xs font-mono text-slate-400 min-h-[18px] tracking-wider truncate">
            {expression || '\u00A0'}
          </div>
          <div className="text-right text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight select-all truncate drop-shadow-sm mt-1">
            {display}
          </div>
          <div className="absolute top-2 left-3 flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest text-secondary font-bold">
              NUVIA BASIC
            </span>
          </div>
        </div>
      )}

      {/* Teclado da Calculadora */}
      <div className="grid grid-cols-4 gap-2 pt-1 flex-1">
        {/* Linha 1 */}
        <Button
          type="button"
          variant="outline"
          onClick={handleClear}
          className="h-12 text-sm font-bold bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border-red-500/30 transition-all active:scale-95"
        >
          C
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleBackspace}
          className="h-12 text-sm font-semibold bg-slate-850 hover:bg-slate-800 text-slate-300 border-slate-800 transition-all active:scale-95"
          title="Apagar dígito"
        >
          <Delete className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handlePercentage}
          className="h-12 text-sm font-semibold bg-slate-850 hover:bg-slate-800 text-slate-300 border-slate-800 transition-all active:scale-95"
        >
          %
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => handleOperator('÷')}
          className="h-12 text-base font-bold bg-amber-500/15 hover:bg-amber-500/25 text-secondary border-secondary/30 transition-all active:scale-95"
        >
          ÷
        </Button>

        {/* Linha 2 */}
        <Button
          type="button"
          variant="outline"
          onClick={() => handleDigit('7')}
          className="h-12 text-lg font-semibold bg-slate-900 hover:bg-slate-800 text-white border-slate-800 transition-all active:scale-95"
        >
          7
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => handleDigit('8')}
          className="h-12 text-lg font-semibold bg-slate-900 hover:bg-slate-800 text-white border-slate-800 transition-all active:scale-95"
        >
          8
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => handleDigit('9')}
          className="h-12 text-lg font-semibold bg-slate-900 hover:bg-slate-800 text-white border-slate-800 transition-all active:scale-95"
        >
          9
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => handleOperator('×')}
          className="h-12 text-base font-bold bg-amber-500/15 hover:bg-amber-500/25 text-secondary border-secondary/30 transition-all active:scale-95"
        >
          ×
        </Button>

        {/* Linha 3 */}
        <Button
          type="button"
          variant="outline"
          onClick={() => handleDigit('4')}
          className="h-12 text-lg font-semibold bg-slate-900 hover:bg-slate-800 text-white border-slate-800 transition-all active:scale-95"
        >
          4
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => handleDigit('5')}
          className="h-12 text-lg font-semibold bg-slate-900 hover:bg-slate-800 text-white border-slate-800 transition-all active:scale-95"
        >
          5
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => handleDigit('6')}
          className="h-12 text-lg font-semibold bg-slate-900 hover:bg-slate-800 text-white border-slate-800 transition-all active:scale-95"
        >
          6
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => handleOperator('-')}
          className="h-12 text-base font-bold bg-amber-500/15 hover:bg-amber-500/25 text-secondary border-secondary/30 transition-all active:scale-95"
        >
          −
        </Button>

        {/* Linha 4 */}
        <Button
          type="button"
          variant="outline"
          onClick={() => handleDigit('1')}
          className="h-12 text-lg font-semibold bg-slate-900 hover:bg-slate-800 text-white border-slate-800 transition-all active:scale-95"
        >
          1
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => handleDigit('2')}
          className="h-12 text-lg font-semibold bg-slate-900 hover:bg-slate-800 text-white border-slate-800 transition-all active:scale-95"
        >
          2
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => handleDigit('3')}
          className="h-12 text-lg font-semibold bg-slate-900 hover:bg-slate-800 text-white border-slate-800 transition-all active:scale-95"
        >
          3
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => handleOperator('+')}
          className="h-12 text-base font-bold bg-amber-500/15 hover:bg-amber-500/25 text-secondary border-secondary/30 transition-all active:scale-95"
        >
          +
        </Button>

        {/* Linha 5 */}
        <Button
          type="button"
          variant="outline"
          onClick={handlePlusMinus}
          className="h-12 text-base font-bold bg-slate-850 hover:bg-slate-800 text-slate-300 border-slate-800 transition-all active:scale-95"
          title="Inverter sinal"
        >
          ±
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => handleDigit('0')}
          className="h-12 text-lg font-semibold bg-slate-900 hover:bg-slate-800 text-white border-slate-800 transition-all active:scale-95"
        >
          0
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => handleDigit(',')}
          className="h-12 text-lg font-bold bg-slate-900 hover:bg-slate-800 text-white border-slate-800 transition-all active:scale-95"
        >
          ,
        </Button>
        <Button
          type="button"
          onClick={handleEquals}
          className="h-12 text-lg font-bold bg-secondary hover:bg-secondary/90 text-primary transition-all active:scale-95 shadow-md shadow-secondary/20"
        >
          =
        </Button>
      </div>

      <div className="text-[11px] text-slate-500 text-center pt-1 font-mono">
        Dica: use o teclado físico (0-9, +, -, *, /, Enter, Backspace)
      </div>
    </div>
  )
}

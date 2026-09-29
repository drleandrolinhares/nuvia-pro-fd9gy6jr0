/**
 * Utilitários de cálculo e formatação financeira para a Calculadora NUVIA PRO.
 * Todas as operações são 100% locais/em memória.
 */

export const formatCurrency = (value: number): string => {
  if (!Number.isFinite(value)) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export const formatNumberPtBr = (value: number, maxDecimals: number = 2): string => {
  if (!Number.isFinite(value)) return '0'
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  }).format(value)
}

export const formatPercent = (value: number, decimals: number = 2): string => {
  if (!Number.isFinite(value)) return '0,00%'
  return `${value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}%`
}

// ----------------------------------------------------
// ABA 1: Calculadora Básica
// ----------------------------------------------------

export interface HistoricoItem {
  id: string
  expressao: string
  resultado: number
  dataHora: string
}

/**
 * Avalia com segurança uma expressão matemática simples (+, -, *, /)
 * sem uso de eval(), com suporte a operadores padrão e porcentagem.
 */
export const safeEvaluateExpression = (
  expr: string,
): { success: boolean; result?: number; error?: string } => {
  try {
    // Limpa espaços
    const sanitized = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/,/g, '.')
      .replace(/\s+/g, '')

    if (!sanitized) return { success: false, error: 'Expressão vazia' }

    // Tokenizador simples para números e operadores básicos (+, -, *, /, %)
    // Suporta números com sinal negativo
    const tokens: (number | string)[] = []
    let currentNumber = ''

    for (let i = 0; i < sanitized.length; i++) {
      const char = sanitized[i]

      if ((char >= '0' && char <= '9') || char === '.') {
        currentNumber += char
      } else if (char === '-' && (i === 0 || ['+', '-', '*', '/'].includes(sanitized[i - 1]))) {
        // Sinal unário negativo
        currentNumber = '-'
      } else if (['+', '-', '*', '/'].includes(char)) {
        if (currentNumber !== '') {
          tokens.push(parseFloat(currentNumber))
          currentNumber = ''
        }
        tokens.push(char)
      } else if (char === '%') {
        if (currentNumber !== '') {
          tokens.push(parseFloat(currentNumber) / 100)
          currentNumber = ''
        } else if (tokens.length > 0 && typeof tokens[tokens.length - 1] === 'number') {
          const lastNum = tokens.pop() as number
          tokens.push(lastNum / 100)
        }
      }
    }

    if (currentNumber !== '') {
      tokens.push(parseFloat(currentNumber))
    }

    if (tokens.length === 0) return { success: false, error: 'Inválido' }

    // 1º passo: resolver multiplicações e divisões
    const intermediateTokens: (number | string)[] = []
    let idx = 0
    while (idx < tokens.length) {
      const token = tokens[idx]
      if (token === '*' || token === '/') {
        const prev = intermediateTokens.pop()
        const next = tokens[idx + 1]
        if (typeof prev !== 'number' || typeof next !== 'number') {
          return { success: false, error: 'Sintaxe inválida' }
        }
        if (token === '/' && next === 0) {
          return { success: false, error: 'Divisão por zero' }
        }
        const res = token === '*' ? prev * next : prev / next
        intermediateTokens.push(res)
        idx += 2
      } else {
        intermediateTokens.push(token)
        idx++
      }
    }

    // 2º passo: resolver somas e subtrações
    if (intermediateTokens.length === 0) return { success: false, error: 'Expressão inválida' }
    let total = typeof intermediateTokens[0] === 'number' ? intermediateTokens[0] : 0
    let currentOp = '+'

    for (let i = 1; i < intermediateTokens.length; i++) {
      const token = intermediateTokens[i]
      if (token === '+' || token === '-') {
        currentOp = token
      } else if (typeof token === 'number') {
        if (currentOp === '+') total += token
        else if (currentOp === '-') total -= token
      }
    }

    if (!Number.isFinite(total)) {
      return { success: false, error: 'Valor infinito ou indefinido' }
    }

    return { success: true, result: Math.round(total * 1000000) / 1000000 }
  } catch (err) {
    return { success: false, error: 'Erro no cálculo' }
  }
}

// ----------------------------------------------------
// ABA 2: Juros Simples e Compostos
// ----------------------------------------------------

export interface PeriodoJurosItem {
  periodo: number
  saldoInicial: number
  jurosPeriodo: number
  saldoFinal: number
}

export interface JurosResultado {
  montante: number
  totalJuros: number
  capital: number
  taxaEfetiva: number
  tempo: number
  tabelaEvolucao?: PeriodoJurosItem[]
}

/**
 * Juros Simples: M = C * (1 + i * t)
 * J = C * i * t
 */
export const calcularJurosSimples = (
  capital: number,
  taxaPercent: number,
  tempo: number,
): JurosResultado => {
  if (capital <= 0 || tempo <= 0 || taxaPercent < 0) {
    return { montante: capital, totalJuros: 0, capital, taxaEfetiva: taxaPercent, tempo }
  }
  const i = taxaPercent / 100
  const juros = capital * i * tempo
  const montante = capital + juros

  return {
    montante,
    totalJuros: juros,
    capital,
    taxaEfetiva: taxaPercent,
    tempo,
  }
}

/**
 * Juros Compostos: M = C * (1 + i)^t
 * J = M - C
 */
export const calcularJurosCompostos = (
  capital: number,
  taxaPercent: number,
  tempo: number,
  maxLinhasTabela: number = 36,
): JurosResultado => {
  if (capital <= 0 || tempo <= 0 || taxaPercent < 0) {
    return { montante: capital, totalJuros: 0, capital, taxaEfetiva: taxaPercent, tempo }
  }
  const i = taxaPercent / 100
  const montante = capital * Math.pow(1 + i, tempo)
  const totalJuros = montante - capital

  // Gerar evolução período a período (limitado a maxLinhasTabela para desempenho)
  const evolucao: PeriodoJurosItem[] = []
  let saldo = capital
  const linhasAGerar = Math.min(Math.round(tempo), maxLinhasTabela)

  for (let p = 1; p <= linhasAGerar; p++) {
    const jurosDoPeriodo = saldo * i
    const saldoFinal = saldo + jurosDoPeriodo
    evolucao.push({
      periodo: p,
      saldoInicial: saldo,
      jurosPeriodo: jurosDoPeriodo,
      saldoFinal,
    })
    saldo = saldoFinal
  }

  return {
    montante,
    totalJuros,
    capital,
    taxaEfetiva: taxaPercent,
    tempo,
    tabelaEvolucao: evolucao,
  }
}

// ----------------------------------------------------
// ABA 3: CET e Financiamento (Tabela Price + Comparador)
// ----------------------------------------------------

export interface FinanciamentoInput {
  valorTotal: number
  valorEntrada?: number
  numParcelas: number
  taxaMensalPercent: number
  descontoAVistaPercent?: number
}

export interface FinanciamentoResultado {
  valorTotal: number
  valorEntrada: number
  valorFinanciado: number
  numParcelas: number
  taxaMensalPercent: number
  valorParcela: number
  totalParcelado: number
  totalJurosFinanciamento: number
  descontoAVistaPercent: number
  valorAVistaComDesconto: number
  economiaAVista: number
  cetMensalPercent: number
  cetAnualPercent: number
  recomendacao: string
  melhorOpcao: 'avista' | 'parcelado' | 'equivalente'
  diferencaReal: number
}

export interface FinanciamentoReversoInput {
  valorTotal: number
  valorEntrada?: number
  numParcelas: number
  valorParcela: number
  descontoAVistaPercent?: number
}

export interface FinanciamentoReversoResultado {
  valorTotal: number
  valorEntrada: number
  valorFinanciado: number
  numParcelas: number
  valorParcela: number
  totalParcelado: number
  totalJuros: number
  jurosPercentual: number
  taxaMensalPercent: number
  cetMensalPercent: number
  cetAnualPercent: number
  descontoAVistaPercent: number
  valorAVistaComDesconto: number
  economiaAVista: number
  recomendacao: string
  melhorOpcao: 'avista' | 'parcelado' | 'equivalente'
  diferencaReal: number
}

/**
 * Cálculo da parcela pela tabela Price:
 * PMT = PV * (i / (1 - (1 + i)^(-n)))
 * Se i = 0 => PMT = PV / n
 */
export const calcularParcelaPrice = (pv: number, taxaMensalDecimal: number, n: number): number => {
  if (pv <= 0 || n <= 0) return 0
  if (taxaMensalDecimal <= 0) return pv / n
  const fator = Math.pow(1 + taxaMensalDecimal, n)
  return (pv * taxaMensalDecimal * fator) / (fator - 1)
}

/**
 * Calcula a Taxa Interna de Retorno (TIR mensal / CET)
 * Fluxo de caixa:
 * - Tempo 0: +Valor Líquido (se houver desconto à vista, o valor financiado efetivo é o valor que o cliente precisaria pagar à vista menos a entrada)
 * - Tempos 1..n: -Parcela
 *
 * Utiliza o método de Newton-Raphson com fallback para bisseção.
 */
export const calcularTIRMensal = (valorPresente: number, parcela: number, n: number): number => {
  if (valorPresente <= 0 || parcela <= 0 || n <= 0) return 0
  if (Math.abs(parcela * n - valorPresente) < 0.001) return 0

  // Se o total das parcelas for menor que o PV, a taxa é zero/negativa
  if (parcela * n < valorPresente) return 0

  // Chute inicial baseado em aproximação financeira: (Total - PV) / (PV * (n+1)/2)
  let i = ((parcela * n - valorPresente) / (valorPresente * (n + 1))) * 2
  if (!Number.isFinite(i) || i <= 0 || i > 2) {
    i = 0.015
  }

  // Newton-Raphson para f(i) = PV - PMT * (1 - (1+i)^(-n)) / i = 0
  let converged = false
  for (let iter = 0; iter < 60; iter++) {
    if (i <= 0) i = 0.0001
    const pot = Math.pow(1 + i, -n)
    const f = valorPresente - (parcela * (1 - pot)) / i

    // Derivada f'(i)
    const dPot = -n * Math.pow(1 + i, -n - 1)
    const dAn = (i * -dPot - (1 - pot)) / (i * i)
    const df = -parcela * dAn

    if (!Number.isFinite(df) || Math.abs(df) < 1e-12) break

    const nextI = i - f / df
    if (!Number.isFinite(nextI)) break

    if (Math.abs(nextI - i) < 1e-8) {
      i = nextI
      converged = true
      break
    }
    i = nextI
  }

  if (converged && Number.isFinite(i) && i >= 0 && i < 10) {
    return i * 100
  }

  // Fallback: Método da bisseção em [0, 20.0] (até 2000% a.m.)
  let low = 0.0
  let high = 20.0
  for (let step = 0; step < 70; step++) {
    const mid = (low + high) / 2
    const midPv = (parcela * (1 - Math.pow(1 + mid, -n))) / mid
    if (midPv > valorPresente) {
      low = mid
    } else {
      high = mid
    }
  }

  return ((low + high) / 2) * 100
}

/**
 * Modo Reverso: dado o valor financiado (ou total e entrada),
 * número de parcelas e valor de cada parcela, calcula:
 * - Taxa de juros real embutida (% a.m.)
 * - Total pago e juros embutidos (R$ e %)
 * - CET mensal e anualizado
 * - Comparação à vista vs. parcelado
 */
export const calcularFinanciamentoReverso = (
  input: FinanciamentoReversoInput,
): FinanciamentoReversoResultado => {
  const valorTotal = Math.max(0, input.valorTotal || 0)
  const valorEntrada = Math.min(valorTotal, Math.max(0, input.valorEntrada || 0))
  const numParcelas = Math.max(1, Math.round(input.numParcelas || 1))
  const valorParcela = Math.max(0, input.valorParcela || 0)
  const descontoAVistaPercent = Math.max(0, input.descontoAVistaPercent || 0)

  const valorFinanciado = Math.max(0, valorTotal - valorEntrada)
  const totalParcelasPagas = valorParcela * numParcelas
  const totalParcelado = valorEntrada + totalParcelasPagas

  // Juros sobre a operação financiada
  const totalJuros = Math.max(0, totalParcelado - valorTotal)
  const jurosPercentual = valorFinanciado > 0 ? (totalJuros / valorFinanciado) * 100 : 0

  // Taxa de juros nominal embutida (TIR da operação financiada)
  const taxaMensalPercent =
    valorFinanciado > 0 && valorParcela > 0
      ? calcularTIRMensal(valorFinanciado, valorParcela, numParcelas)
      : 0

  // Comparador À Vista
  const descontoReal = (valorTotal * descontoAVistaPercent) / 100
  const valorAVistaComDesconto = Math.max(0, valorTotal - descontoReal)
  const diferencaReal = Math.abs(totalParcelado - valorAVistaComDesconto)

  // CET real considerando oportunidade do desconto à vista
  const baseLiquidaFinanciada =
    descontoAVistaPercent > 0 ? Math.max(1, valorAVistaComDesconto - valorEntrada) : valorFinanciado

  let cetMensal = taxaMensalPercent
  if (descontoAVistaPercent > 0 && valorParcela > 0) {
    cetMensal = calcularTIRMensal(baseLiquidaFinanciada, valorParcela, numParcelas)
  }

  // CET Anualizado: (1 + i_m)^12 - 1
  const cetAnual = (Math.pow(1 + cetMensal / 100, 12) - 1) * 100

  let melhorOpcao: 'avista' | 'parcelado' | 'equivalente' = 'equivalente'
  let recomendacao = 'Os valores são equivalentes.'

  if (valorAVistaComDesconto < totalParcelado - 0.01) {
    melhorOpcao = 'avista'
    recomendacao = `À vista compensa em ${formatCurrency(diferencaReal)} de economia frente ao parcelamento total.`
  } else if (totalParcelado < valorAVistaComDesconto - 0.01) {
    melhorOpcao = 'parcelado'
    recomendacao = `Parcelado compensa em ${formatCurrency(diferencaReal)}.`
  }

  return {
    valorTotal,
    valorEntrada,
    valorFinanciado,
    numParcelas,
    valorParcela,
    totalParcelado,
    totalJuros,
    jurosPercentual,
    taxaMensalPercent,
    cetMensalPercent: cetMensal,
    cetAnualPercent: cetAnual,
    descontoAVistaPercent,
    valorAVistaComDesconto,
    economiaAVista: diferencaReal,
    recomendacao,
    melhorOpcao,
    diferencaReal,
  }
}

/**
 * Calcula o financiamento completo, parcelas, CET e comparação à vista vs. parcelado
 */
export const calcularFinanciamento = (input: FinanciamentoInput): FinanciamentoResultado => {
  const valorTotal = Math.max(0, input.valorTotal || 0)
  const valorEntrada = Math.min(valorTotal, Math.max(0, input.valorEntrada || 0))
  const numParcelas = Math.max(1, Math.round(input.numParcelas || 1))
  const taxaMensalPercent = Math.max(0, input.taxaMensalPercent || 0)
  const descontoAVistaPercent = Math.max(0, input.descontoAVistaPercent || 0)

  const valorFinanciado = Math.max(0, valorTotal - valorEntrada)
  const iDecimal = taxaMensalPercent / 100

  const valorParcela =
    valorFinanciado > 0 ? calcularParcelaPrice(valorFinanciado, iDecimal, numParcelas) : 0
  const totalParcelado = valorEntrada + valorParcela * numParcelas
  const totalJurosFinanciamento = Math.max(0, totalParcelado - valorTotal)

  // Comparador À Vista:
  // Se o cliente pagar à vista, ganha o desconto sobre o valor total
  const descontoReal = (valorTotal * descontoAVistaPercent) / 100
  const valorAVistaComDesconto = Math.max(0, valorTotal - descontoReal)

  // Diferença entre pagar à vista vs total financiado
  const diferencaReal = Math.abs(totalParcelado - valorAVistaComDesconto)

  // CET real:
  // Se houver desconto à vista, o custo de oportunidade é o valor que o cliente pagaria à vista menos a entrada.
  // Ex: Produto R$ 1.000 em 10x sem juros de R$ 100. À vista tem 10% desc = R$ 900.
  // Na prática o cliente está financiando R$ 900 para pagar 10x de R$ 100! CET > 0!
  const baseLiquidaFinanciada =
    descontoAVistaPercent > 0 ? Math.max(1, valorAVistaComDesconto - valorEntrada) : valorFinanciado

  let cetMensal = taxaMensalPercent
  if (descontoAVistaPercent > 0 && valorParcela > 0) {
    cetMensal = calcularTIRMensal(baseLiquidaFinanciada, valorParcela, numParcelas)
  }

  // CET Anualizado: (1 + i_m)^12 - 1
  const cetAnual = (Math.pow(1 + cetMensal / 100, 12) - 1) * 100

  let melhorOpcao: 'avista' | 'parcelado' | 'equivalente' = 'equivalente'
  let recomendacao = 'Os valores são equivalentes.'

  if (valorAVistaComDesconto < totalParcelado - 0.01) {
    melhorOpcao = 'avista'
    recomendacao = `À vista compensa em ${formatCurrency(diferencaReal)} de economia frente ao parcelamento total.`
  } else if (totalParcelado < valorAVistaComDesconto - 0.01) {
    melhorOpcao = 'parcelado'
    recomendacao = `Parcelado compensa em ${formatCurrency(diferencaReal)}.`
  }

  return {
    valorTotal,
    valorEntrada,
    valorFinanciado,
    numParcelas,
    taxaMensalPercent,
    valorParcela,
    totalParcelado,
    totalJurosFinanciamento,
    descontoAVistaPercent,
    valorAVistaComDesconto,
    economiaAVista: diferencaReal,
    cetMensalPercent: cetMensal,
    cetAnualPercent: cetAnual,
    recomendacao,
    melhorOpcao,
    diferencaReal,
  }
}

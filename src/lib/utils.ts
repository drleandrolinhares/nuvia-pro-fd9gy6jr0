/* General utility functions (exposes cn) */
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges multiple class names into a single string
 * @param inputs - Array of class names
 * @returns Merged class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converte valor numérico ou string formatada em pt-BR (ex: "298,50", "1.250,50", "1.000.000", "15") para number float.
 * Retorna 0 para valores vazios, nulos ou inválidos.
 */
export function parsePtBrNumber(raw: unknown): number {
  if (raw === undefined || raw === null || raw === '') return 0
  if (typeof raw === 'number') {
    return isNaN(raw) ? 0 : raw
  }

  const str = String(raw).trim()
  if (!str) return 0

  // Se tem ponto e vírgula (ex: "1.250,50"), pontos são milhar e vírgula é decimal
  if (str.includes('.') && str.includes(',')) {
    const clean = str.replace(/\./g, '').replace(',', '.')
    const v = parseFloat(clean)
    return isNaN(v) ? 0 : v
  }

  // Se tem apenas vírgula (ex: "298,50" ou "1,5")
  if (str.includes(',')) {
    const clean = str.replace(',', '.')
    const v = parseFloat(clean)
    return isNaN(v) ? 0 : v
  }

  // Se tem apenas ponto:
  // Se tem múltiplos pontos (ex: "1.000.000") -> são separadores de milhar
  const parts = str.split('.')
  if (parts.length > 2) {
    const clean = str.replace(/\./g, '')
    const v = parseFloat(clean)
    return isNaN(v) ? 0 : v
  } else if (parts.length === 2 && parts[1].length === 3 && parts[0].length >= 1) {
    // Ex: "12.000" -> 12000 (milhar brasileiro)
    const clean = str.replace(/\./g, '')
    const v = parseFloat(clean)
    return isNaN(v) ? 0 : v
  }

  // Decimal normal ou inteiro puro (ex: "298.50" ou "15")
  const v = parseFloat(str)
  return isNaN(v) ? 0 : v
}

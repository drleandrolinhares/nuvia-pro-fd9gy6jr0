/* ============================================================================
 * Regras de status do estoque — fonte única.
 *
 * Existem dois modos de controle, e cada produto usa UM deles:
 *
 * 1) CONTROLE POR QUANTIDADE (padrão)
 *    O produto é crítico quando quantidade_estoque <= quantidade_minima.
 *
 * 2) CONTROLE POR PRAZO (alerta_prazo_dias > 0)
 *    Itens que não são consumidos por dose (gesso, acrílico, resina) são
 *    revisados de tempo em tempo. `data_proxima_revisao` é a data em que a
 *    revisão vence. O produto SÓ entra em alerta quando essa data VENCE.
 *
 *    Antes de 24/11/2026 o código fazia:
 *        alerta = hoje >= (data_proxima_revisao - alerta_prazo_dias)
 *    ou seja, antecipava o alerta em `alerta_prazo_dias` dias. Como o
 *    formulário já gravava `data_proxima_revisao` como hoje + prazo, o
 *    resultado era (hoje + prazo) - prazo = hoje, e o item nascia crítico:
 *    ficava em alerta eterno, que é justamente o que o prazo deveria evitar.
 * ========================================================================== */

export interface RegrasProduto {
  /** dias combinados para reabastecer/revisar; 0 ou null = controle por quantidade */
  alerta_prazo_dias?: number | null
  /** data em que a revisão vence (yyyy-MM-dd) */
  data_proxima_revisao?: string | null
  quantidade_estoque?: number | null
  quantidade_minima?: number | null
}

/** normaliza 'yyyy-MM-dd' (ou ISO) para comparação por DIA, sem hora */
const soData = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()

const paraData = (v?: string | null): Date | null => {
  if (!v) return null
  const s = String(v).substring(0, 10)
  const [a, m, dia] = s.split('-').map(Number)
  if (!a || !m || !dia) return null
  return new Date(a, m - 1, dia)
}

/** o produto é controlado por prazo? */
export const usaControlePorPrazo = (p: RegrasProduto) => Number(p.alerta_prazo_dias ?? 0) > 0

/**
 * O produto está crítico hoje?
 * Por prazo: SOMENTE a partir do dia seguinte ao vencimento da revisão.
 * (No próprio dia do vencimento ainda está no prazo.)
 */
export function estaCritico(p: RegrasProduto, hoje: Date = new Date()): boolean {
  if (usaControlePorPrazo(p)) {
    const vence = paraData(p.data_proxima_revisao)
    if (!vence) return false
    return soData(hoje) > soData(vence)
  }
  return Number(p.quantidade_estoque ?? 0) <= Number(p.quantidade_minima ?? 0)
}

/** rótulo do alerta, para a tela saber se é "Prazo" ou "Mínimo" */
export function rotuloCritico(p: RegrasProduto): 'prazo' | 'minimo' {
  return usaControlePorPrazo(p) ? 'prazo' : 'minimo'
}

/** quantos dias faltam para vencer (negativo = venceu há N dias) */
export function diasParaVencer(p: RegrasProduto, hoje: Date = new Date()): number | null {
  const vence = paraData(p.data_proxima_revisao)
  if (!vence) return null
  return Math.round((soData(vence) - soData(hoje)) / 86400000)
}

/**
 * Data de vencimento a partir de uma data base + prazo em dias.
 * Usado quando o formulário grava o prazo.
 */
export function calcularProximaRevisao(dias: number, base: Date = new Date()): string {
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate())
  d.setDate(d.getDate() + dias)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

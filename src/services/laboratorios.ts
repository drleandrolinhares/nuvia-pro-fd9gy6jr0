import { supabase } from '@/lib/supabase/client'

export type LaboratorioTipo = 'studio_acrilico' | 'ceramicas'

export interface LaboratorioTrabalho {
  id: string
  tenant_id?: string
  laboratorio: LaboratorioTipo
  paciente: string
  trabalho: string
  data_envio: string | null
  data_previsao_entrega: string | null
  horario_previsto: string | null
  entregue: boolean
  delivered_at: string | null
  confirmado_por: string | null
  confirmado_em: string | null
  observacoes: string | null
  criado_em: string
  atualizado_em: string
  criado_por?: string | null
}

export interface NovoLaboratorioTrabalho {
  laboratorio: LaboratorioTipo
  paciente: string
  trabalho: string
  data_envio?: string | null
  data_previsao_entrega?: string | null
  horario_previsto?: string | null
  observacoes?: string | null
}

export interface UpdateLaboratorioTrabalho {
  laboratorio?: LaboratorioTipo
  paciente?: string
  trabalho?: string
  data_envio?: string | null
  data_previsao_entrega?: string | null
  horario_previsto?: string | null
  entregue?: boolean
  delivered_at?: string | null
  confirmado_por?: string | null
  confirmado_em?: string | null
  observacoes?: string | null
}

export type LaboratorioLogAcao =
  | 'ADICIONADO'
  | 'EDITADO'
  | 'REMOVIDO'
  | 'ENTREGUE'
  | 'REABERTO'
  | 'CONFIRMADO_LAB'

export interface LaboratorioLog {
  id: string
  tenant_id?: string
  trabalho_id?: string | null
  paciente: string | null
  trabalho: string | null
  laboratorio: string | null
  acao: LaboratorioLogAcao | string
  detalhes: string | null
  dados_anteriores?: Record<string, any> | null
  dados_novos?: Record<string, any> | null
  usuario_id?: string | null
  usuario_nome: string
  criado_em: string
}

export interface RegistrarLogInput {
  trabalho_id?: string | null
  paciente?: string | null
  trabalho?: string | null
  laboratorio?: string | null
  acao: LaboratorioLogAcao
  detalhes?: string | null
  dados_anteriores?: Record<string, any> | null
  dados_novos?: Record<string, any> | null
  usuario_id?: string | null
  usuario_nome: string
}

export const LABORATORIOS_CONFIG: Record<
  LaboratorioTipo,
  { label: string; shortLabel: string; corBadge: string; corBorda: string }
> = {
  studio_acrilico: {
    label: 'STUDIO ACRÍLICO',
    shortLabel: 'Studio Acrílico',
    corBadge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    corBorda: 'border-emerald-500',
  },
  ceramicas: {
    label: 'SOLUÇÕES CERÂMICAS',
    shortLabel: 'Soluções Cerâmicas',
    corBadge: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    corBorda: 'border-sky-500',
  },
}

/**
 * Calcula a quantidade de dias úteis entre duas datas (segunda a sexta).
 * Conforme o exemplo do usuário:
 * Envio: 08/09/2026 (terça), Previsão: 11/09/2026 (sexta) -> 3 dias úteis (dias 9, 10 e 11).
 */
export function calcularDiasUteis(
  dataEnvioStr: string | null | undefined,
  dataPrevisaoStr: string | null | undefined,
): number | null {
  if (!dataEnvioStr || !dataPrevisaoStr) return null

  const partsEnvio = dataEnvioStr.split('-').map(Number)
  const partsPrev = dataPrevisaoStr.split('-').map(Number)
  if (partsEnvio.length < 3 || partsPrev.length < 3) return null

  // Usar UTC/local consistente para evitar problemas de fuso
  const dInicio = new Date(partsEnvio[0], partsEnvio[1] - 1, partsEnvio[2])
  const dFim = new Date(partsPrev[0], partsPrev[1] - 1, partsPrev[2])

  if (isNaN(dInicio.getTime()) || isNaN(dFim.getTime())) return null
  if (dFim < dInicio) return 0

  let uteis = 0
  const cur = new Date(dInicio)
  cur.setDate(cur.getDate() + 1) // Inicia a contagem no dia seguinte ao envio

  while (cur <= dFim) {
    const day = cur.getDay()
    if (day !== 0 && day !== 6) {
      uteis++
    }
    cur.setDate(cur.getDate() + 1)
  }

  return uteis
}

/**
 * Calcula os dias de atraso em relação à data prevista de entrega.
 * Se a data de entrega ainda não chegou ou o trabalho já foi entregue sem atraso, retorna 0.
 * Se já passou da data de previsão e não foi entregue (ou entregue com atraso), calcula os dias corridos de atraso.
 */
export function calcularDiasAtraso(
  dataPrevisaoStr: string | null | undefined,
  entregue: boolean,
  deliveredAtStr: string | null | undefined,
): number {
  if (!dataPrevisaoStr) return 0

  const parts = dataPrevisaoStr.split('-').map(Number)
  if (parts.length < 3) return 0
  const dataPrevisao = new Date(parts[0], parts[1] - 1, parts[2], 23, 59, 59)

  let dataComparacao = new Date()
  if (entregue && deliveredAtStr) {
    dataComparacao = new Date(deliveredAtStr)
  }

  // Zera horas para comparação de dias de calendário
  const prevZero = new Date(parts[0], parts[1] - 1, parts[2]).getTime()
  const compZero = new Date(
    dataComparacao.getFullYear(),
    dataComparacao.getMonth(),
    dataComparacao.getDate(),
  ).getTime()

  if (compZero <= prevZero) return 0

  const diffMs = compZero - prevZero
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDias)
}

/**
 * Retorna o status calculado:
 * - 'ENTREGUE'
 * - 'ATRASADO'
 * - 'NO PRAZO'
 * - 'SEM DATA'
 */
export function calcularStatus(
  dataPrevisaoStr: string | null | undefined,
  entregue: boolean,
  deliveredAtStr: string | null | undefined,
): 'ENTREGUE' | 'ATRASADO' | 'NO PRAZO' | 'SEM DATA' {
  if (entregue) return 'ENTREGUE'
  if (!dataPrevisaoStr) return 'SEM DATA'

  const diasAtraso = calcularDiasAtraso(dataPrevisaoStr, entregue, deliveredAtStr)
  if (diasAtraso > 0) return 'ATRASADO'

  return 'NO PRAZO'
}

/**
 * Verifica se a tarja deve piscar:
 * "Colocar uma tarja piscando 1 dia antes do prazo de entrega para obrigar equipe a confirmar com o laboratório sobre o prazo de entrega"
 * Deve piscar se faltar 1 dia ou menos (ou se já estiver no dia da entrega ou atrasado) E não estiver entregue.
 */
export function devePiscarAlerta(
  dataPrevisaoStr: string | null | undefined,
  entregue: boolean,
): boolean {
  if (entregue || !dataPrevisaoStr) return false

  const parts = dataPrevisaoStr.split('-').map(Number)
  if (parts.length < 3) return false

  const hoje = new Date()
  const hojeZero = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).getTime()
  const prevZero = new Date(parts[0], parts[1] - 1, parts[2]).getTime()

  const diffMs = prevZero - hojeZero
  const diffDias = Math.round(diffMs / (1000 * 60 * 60 * 24))

  // 1 dia antes (diffDias === 1), no dia (diffDias === 0), ou já atrasado (diffDias < 0)
  return diffDias <= 1
}

// Queries no Supabase
export async function fetchLaboratoriosTrabalhos(
  filtroLaboratorio?: LaboratorioTipo | 'todos',
  incluirEntregues: boolean = false,
): Promise<LaboratorioTrabalho[]> {
  let query = supabase.from('laboratorios_trabalhos').select('*')

  if (filtroLaboratorio && filtroLaboratorio !== 'todos') {
    query = query.eq('laboratorio', filtroLaboratorio)
  }

  if (!incluirEntregues) {
    query = query.eq('entregue', false)
  }

  // Ordenação: data de previsão mais próxima primeiro (nulos no fim)
  query = query
    .order('data_previsao_entrega', { ascending: true, nullsFirst: false })
    .order('horario_previsto', { ascending: true, nullsFirst: false })
    .order('criado_em', { ascending: true })

  const { data, error } = await query

  if (error) {
    console.error('Erro ao buscar trabalhos de laboratórios:', error)
    throw error
  }

  return (data as LaboratorioTrabalho[]) || []
}

export async function createLaboratorioTrabalho(
  novo: NovoLaboratorioTrabalho,
  usuarioId?: string,
): Promise<LaboratorioTrabalho> {
  const payload: any = {
    laboratorio: novo.laboratorio,
    paciente: novo.paciente.trim(),
    trabalho: novo.trabalho.trim(),
    data_envio: novo.data_envio || null,
    data_previsao_entrega: novo.data_previsao_entrega || null,
    horario_previsto: novo.horario_previsto || '17:00',
    observacoes: novo.observacoes?.trim() || null,
    entregue: false,
    delivered_at: null,
  }

  if (usuarioId) {
    payload.criado_por = usuarioId
  }

  const { data, error } = await supabase
    .from('laboratorios_trabalhos')
    .insert(payload)
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar trabalho de laboratório:', error)
    throw error
  }

  return data as LaboratorioTrabalho
}

export async function updateLaboratorioTrabalho(
  id: string,
  atualizacao: UpdateLaboratorioTrabalho,
): Promise<LaboratorioTrabalho> {
  const { data, error } = await supabase
    .from('laboratorios_trabalhos')
    .update({
      ...atualizacao,
      atualizado_em: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Erro ao atualizar trabalho de laboratório:', error)
    throw error
  }

  return data as LaboratorioTrabalho
}

export async function marcarComoEntregue(id: string): Promise<LaboratorioTrabalho> {
  return updateLaboratorioTrabalho(id, {
    entregue: true,
    delivered_at: new Date().toISOString(),
  })
}

export async function reabrirTrabalho(id: string): Promise<LaboratorioTrabalho> {
  return updateLaboratorioTrabalho(id, {
    entregue: false,
    delivered_at: null,
  })
}

export async function confirmarComLaboratorio(
  id: string,
  nomeUsuario: string,
): Promise<LaboratorioTrabalho> {
  return updateLaboratorioTrabalho(id, {
    confirmado_por: nomeUsuario,
    confirmado_em: new Date().toISOString(),
  })
}

export async function deleteLaboratorioTrabalho(id: string): Promise<void> {
  const { error } = await supabase.from('laboratorios_trabalhos').delete().eq('id', id)
  if (error) {
    console.error('Erro ao excluir trabalho de laboratório:', error)
    throw error
  }
}

// ---------------------------------------------------------------------------
// AUDITORIA / LOGS DE INTERAÇÃO
// ---------------------------------------------------------------------------

/**
 * Registra uma entrada na tabela laboratorios_logs.
 * Não lança erro fatal para não travar a ação principal do usuário em caso de falha de rede isolada.
 */
export async function registrarLaboratorioLog(
  input: RegistrarLogInput,
): Promise<LaboratorioLog | null> {
  try {
    const payload: any = {
      trabalho_id: input.trabalho_id || null,
      paciente: input.paciente?.trim() || null,
      trabalho: input.trabalho?.trim() || null,
      laboratorio: input.laboratorio || null,
      acao: input.acao,
      detalhes: input.detalhes || null,
      dados_anteriores: input.dados_anteriores || null,
      dados_novos: input.dados_novos || null,
      usuario_id: input.usuario_id || null,
      usuario_nome: input.usuario_nome?.trim() || 'Usuário Desconhecido',
    }

    const { data, error } = await (supabase.from('laboratorios_logs' as any) as any)
      .insert(payload)
      .select()
      .single()

    if (error) {
      console.error('Erro ao registrar log de laboratório:', error)
      return null
    }

    return data as LaboratorioLog
  } catch (err) {
    console.error('Exceção ao registrar log de laboratório:', err)
    return null
  }
}

/**
 * Busca o histórico de logs de laboratórios em ordem cronológica decrescente.
 */
export async function fetchLaboratoriosLogs(filtros?: {
  trabalhoId?: string
  acao?: string
  busca?: string
  limite?: number
}): Promise<LaboratorioLog[]> {
  let query: any = (supabase.from('laboratorios_logs' as any) as any)
    .select('*')
    .order('criado_em', { ascending: false })

  if (filtros?.trabalhoId) {
    query = query.eq('trabalho_id', filtros.trabalhoId)
  }

  if (filtros?.acao && filtros.acao !== 'TODAS') {
    query = query.eq('acao', filtros.acao)
  }

  if (filtros?.busca && filtros.busca.trim()) {
    const q = filtros.busca.trim()
    query = query.or(
      `paciente.ilike.%${q}%,trabalho.ilike.%${q}%,usuario_nome.ilike.%${q}%,detalhes.ilike.%${q}%`,
    )
  }

  query = query.limit(filtros?.limite || 150)

  const { data, error } = await query

  if (error) {
    console.error('Erro ao buscar logs de laboratório:', error)
    throw error
  }

  return (data as LaboratorioLog[]) || []
}

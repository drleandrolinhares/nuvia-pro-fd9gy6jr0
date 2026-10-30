import { supabase } from '@/lib/supabase/client'

export type ComissaoAjusteTipo = 'cancelada' | 'programada'
export type ComissaoAjusteStatus = 'ativo' | 'pago' | 'cancelado' | 'revertido'

export type ComissaoAjusteLogAcao =
  | 'REMOVIDO_CANCELADO'
  | 'REMOVIDO_PROGRAMADO'
  | 'DATA_ALTERADA'
  | 'MARCADO_PAGO'
  | 'CANCELADO_DEFINITIVO'
  | 'REVERTIDO'

export interface ComissaoAjuste {
  id: string
  tenant_id?: string | null
  comissao_id: string
  tipo: ComissaoAjusteTipo
  justificativa: string
  data_programada?: string | null
  status: ComissaoAjusteStatus
  usuario_id?: string | null
  usuario_nome: string
  pago_em?: string | null
  pago_por?: string | null
  cancelado_em?: string | null
  cancelado_por?: string | null
  criado_em: string
  atualizado_em?: string | null
  // Dados populados da venda quando join realizado
  venda?: {
    id: string
    paciente_nome: string
    data_fechamento: string | null
    valor_tratamento: number
    valor_entrada: number
    percentual_entrada: number
    dentista_avaliador: string | null
    dentista_nome?: string | null
    crc: string | null
    crc_nome?: string | null
    status_comissao: string | null
  }
}

export interface ComissaoAjusteLog {
  id: string
  tenant_id?: string | null
  ajuste_id?: string | null
  comissao_id: string
  acao: ComissaoAjusteLogAcao
  justificativa: string
  data_programada_anterior?: string | null
  data_programada_nova?: string | null
  dados_anteriores?: Record<string, any> | null
  dados_novos?: Record<string, any> | null
  usuario_id?: string | null
  usuario_nome: string
  criado_em: string
}

export interface RemoverComissaoInput {
  comissao_id: string
  tipo: ComissaoAjusteTipo
  justificativa: string
  data_programada?: string | null
  usuario_id?: string | null
  usuario_nome: string
  dados_venda?: Record<string, any> | null
}

const LOCAL_STORAGE_KEY_AJUSTES = 'nuvia_comissao_ajustes_cache'
const LOCAL_STORAGE_KEY_LOGS = 'nuvia_comissao_ajuste_logs_cache'

function getLocalAjustes(): ComissaoAjuste[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_AJUSTES)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLocalAjustes(ajustes: ComissaoAjuste[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_AJUSTES, JSON.stringify(ajustes))
  } catch {
    // silent
  }
}

function getLocalLogs(): ComissaoAjusteLog[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_LOGS)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLocalLogs(logs: ComissaoAjusteLog[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_LOGS, JSON.stringify(logs))
  } catch {
    // silent
  }
}

function isMissingTableError(error: any): boolean {
  if (!error) return false
  const msg = typeof error.message === 'string' ? error.message.toLowerCase() : ''
  return (
    msg.includes('relation') ||
    msg.includes('does not exist') ||
    msg.includes('schema cache') ||
    msg.includes('not found') ||
    msg.includes('42p01')
  )
}

/**
 * Registra log de auditoria imutável (comissao_ajuste_logs).
 * Resiliente a falhas de schema cache e fallback local se tabela não existir.
 */
export async function registrarComissaoAjusteLog(input: {
  ajuste_id?: string | null
  comissao_id: string
  acao: ComissaoAjusteLogAcao
  justificativa: string
  data_programada_anterior?: string | null
  data_programada_nova?: string | null
  dados_anteriores?: Record<string, any> | null
  dados_novos?: Record<string, any> | null
  usuario_id?: string | null
  usuario_nome: string
}): Promise<ComissaoAjusteLog | null> {
  const payload: any = {
    ajuste_id: input.ajuste_id || null,
    comissao_id: input.comissao_id,
    acao: input.acao,
    justificativa: input.justificativa.trim(),
    data_programada_anterior: input.data_programada_anterior || null,
    data_programada_nova: input.data_programada_nova || null,
    dados_anteriores: input.dados_anteriores || null,
    dados_novos: input.dados_novos || null,
    usuario_id: input.usuario_id || null,
    usuario_nome: input.usuario_nome?.trim() || 'Usuário do Sistema',
  }

  try {
    const { data, error } = await (supabase.from('comissao_ajuste_logs' as any) as any)
      .insert(payload)
      .select()
      .single()

    if (error) {
      if (isMissingTableError(error)) {
        console.warn(
          'Tabela comissao_ajuste_logs ainda não criada no Supabase; gravando em storage resiliente.',
        )
      } else {
        console.error('Erro ao gravar log de auditoria:', error)
      }
      const localLog: ComissaoAjusteLog = {
        id: crypto.randomUUID ? crypto.randomUUID() : `log-${Date.now()}`,
        ...payload,
        criado_em: new Date().toISOString(),
      }
      const current = getLocalLogs()
      saveLocalLogs([localLog, ...current])
      return localLog
    }

    return data as ComissaoAjusteLog
  } catch (err) {
    console.warn('Exceção ao registrar log de auditoria de comissões, fallback local:', err)
    const localLog: ComissaoAjusteLog = {
      id: crypto.randomUUID ? crypto.randomUUID() : `log-${Date.now()}`,
      ...payload,
      criado_em: new Date().toISOString(),
    }
    const current = getLocalLogs()
    saveLocalLogs([localLog, ...current])
    return localLog
  }
}

/**
 * Busca todos os ajustes ativos (para filtrar cálculo de comissões do mês).
 * Retorna Map<comissao_id, ComissaoAjuste>.
 */
export async function fetchAjustesAtivosMap(): Promise<Map<string, ComissaoAjuste>> {
  const map = new Map<string, ComissaoAjuste>()

  // 1. Tentar banco Supabase
  try {
    const { data, error } = await (supabase.from('comissao_ajustes' as any) as any)
      .select('*')
      .eq('status', 'ativo')

    if (!error && data) {
      for (const item of data as ComissaoAjuste[]) {
        map.set(item.comissao_id, item)
      }
      return map
    }
  } catch {
    // degradação graciosa
  }

  // 2. Fallback de cache local
  const local = getLocalAjustes().filter((a) => a.status === 'ativo')
  for (const item of local) {
    map.set(item.comissao_id, item)
  }

  return map
}

/**
 * Busca todos os ajustes programados (aba Pagamentos Programados).
 */
export async function fetchAjustesProgramados(): Promise<ComissaoAjuste[]> {
  try {
    const { data, error } = await (supabase.from('comissao_ajustes' as any) as any)
      .select(`
        *,
        venda:vendas_confirmadas(
          id,
          paciente_nome,
          data_fechamento,
          valor_tratamento,
          valor_entrada,
          percentual_entrada,
          dentista_avaliador,
          dentistas_avaliadores(nome),
          crc,
          crc_comercial(nome),
          status_comissao
        )
      `)
      .eq('tipo', 'programada')
      .order('data_programada', { ascending: true })

    if (!error && data) {
      return (data as any[]).map((row) => ({
        id: row.id,
        tenant_id: row.tenant_id,
        comissao_id: row.comissao_id,
        tipo: row.tipo,
        justificativa: row.justificativa,
        data_programada: row.data_programada,
        status: row.status,
        usuario_id: row.usuario_id,
        usuario_nome: row.usuario_nome,
        pago_em: row.pago_em,
        pago_por: row.pago_por,
        cancelado_em: row.cancelado_em,
        cancelado_por: row.cancelado_por,
        criado_em: row.criado_em,
        atualizado_em: row.atualizado_em,
        venda: row.venda
          ? {
              id: row.venda.id,
              paciente_nome: row.venda.paciente_nome,
              data_fechamento: row.venda.data_fechamento,
              valor_tratamento: Number(row.venda.valor_tratamento) || 0,
              valor_entrada: Number(row.venda.valor_entrada) || 0,
              percentual_entrada: Number(row.venda.percentual_entrada) || 0,
              dentista_avaliador: row.venda.dentista_avaliador,
              dentista_nome: row.venda.dentistas_avaliadores?.nome || null,
              crc: row.venda.crc,
              crc_nome: row.venda.crc_comercial?.nome || null,
              status_comissao: row.venda.status_comissao,
            }
          : undefined,
      }))
    }
  } catch {
    // fallback
  }

  // Fallback local
  const local = getLocalAjustes().filter((a) => a.tipo === 'programada')
  return local
}

/**
 * Busca logs de auditoria de uma comissão específica ou de todos os ajustes.
 */
export async function fetchComissaoAjusteLogs(comissaoId?: string): Promise<ComissaoAjusteLog[]> {
  try {
    let query = (supabase.from('comissao_ajuste_logs' as any) as any)
      .select('*')
      .order('criado_em', { ascending: false })

    if (comissaoId) {
      query = query.eq('comissao_id', comissaoId)
    }

    const { data, error } = await query.limit(100)

    if (!error && data) {
      return data as ComissaoAjusteLog[]
    }
  } catch {
    // fallback
  }

  const local = getLocalLogs()
  if (comissaoId) {
    return local.filter((l) => l.comissao_id === comissaoId)
  }
  return local
}

/**
 * Remove comissões do fechamento atual:
 * Pode ser Cancelamento Definitivo ('cancelada') ou Pagamento Futuro ('programada').
 */
export async function removerComissoesDoFechamento(
  inputs: RemoverComissaoInput[],
): Promise<{ success: boolean; totalAjustados: number; error?: string }> {
  if (!inputs.length) return { success: true, totalAjustados: 0 }

  let dbOk = false
  const criados: ComissaoAjuste[] = []

  try {
    const payload = inputs.map((inp) => ({
      comissao_id: inp.comissao_id,
      tipo: inp.tipo,
      justificativa: inp.justificativa.trim(),
      data_programada: inp.tipo === 'programada' ? inp.data_programada || null : null,
      status: 'ativo',
      usuario_id: inp.usuario_id || null,
      usuario_nome: inp.usuario_nome?.trim() || 'Usuário do Sistema',
    }))

    const { data, error } = await (supabase.from('comissao_ajustes' as any) as any)
      .insert(payload)
      .select()

    if (!error && data) {
      dbOk = true
      criados.push(...(data as ComissaoAjuste[]))
    } else {
      console.warn('Fallback local ao remover comissões:', error?.message)
    }
  } catch (err: any) {
    console.warn('Exceção ao inserir em comissao_ajustes, usando fallback local:', err)
  }

  // Se banco não estava com a tabela criada ainda, cria localmente
  if (!dbOk) {
    const localAtuais = getLocalAjustes()
    const novos: ComissaoAjuste[] = inputs.map((inp) => ({
      id: crypto.randomUUID ? crypto.randomUUID() : `ajuste-${Date.now()}-${Math.random()}`,
      comissao_id: inp.comissao_id,
      tipo: inp.tipo,
      justificativa: inp.justificativa.trim(),
      data_programada: inp.tipo === 'programada' ? inp.data_programada || null : null,
      status: 'ativo',
      usuario_id: inp.usuario_id || null,
      usuario_nome: inp.usuario_nome,
      criado_em: new Date().toISOString(),
      venda: inp.dados_venda as any,
    }))
    saveLocalAjustes([...novos, ...localAtuais])
    criados.push(...novos)
  }

  // Registrar auditoria para cada ajuste
  for (let i = 0; i < inputs.length; i++) {
    const inp = inputs[i]
    const criado = criados[i]
    const acao: ComissaoAjusteLogAcao =
      inp.tipo === 'cancelada' ? 'REMOVIDO_CANCELADO' : 'REMOVIDO_PROGRAMADO'

    await registrarComissaoAjusteLog({
      ajuste_id: criado?.id || null,
      comissao_id: inp.comissao_id,
      acao,
      justificativa: inp.justificativa,
      data_programada_nova: inp.data_programada || null,
      dados_novos: {
        tipo: inp.tipo,
        data_programada: inp.data_programada || null,
        venda: inp.dados_venda || null,
      },
      usuario_id: inp.usuario_id || null,
      usuario_nome: inp.usuario_nome,
    })
  }

  return { success: true, totalAjustados: inputs.length }
}

/**
 * Altera a data programada de um pagamento futuro
 */
export async function alterarDataProgramada(input: {
  ajuste_id: string
  comissao_id: string
  data_anterior: string | null
  data_nova: string
  justificativa: string
  usuario_id?: string | null
  usuario_nome: string
}): Promise<boolean> {
  let dbOk = false

  try {
    const { error } = await (supabase.from('comissao_ajustes' as any) as any)
      .update({
        data_programada: input.data_nova,
        atualizado_em: new Date().toISOString(),
      })
      .eq('id', input.ajuste_id)

    if (!error) dbOk = true
  } catch {
    // fallback
  }

  if (!dbOk) {
    const local = getLocalAjustes()
    const idx = local.findIndex((a) => a.id === input.ajuste_id)
    if (idx >= 0) {
      local[idx].data_programada = input.data_nova
      saveLocalAjustes([...local])
    }
  }

  await registrarComissaoAjusteLog({
    ajuste_id: input.ajuste_id,
    comissao_id: input.comissao_id,
    acao: 'DATA_ALTERADA',
    justificativa: input.justificativa,
    data_programada_anterior: input.data_anterior,
    data_programada_nova: input.data_nova,
    dados_anteriores: { data_programada: input.data_anterior },
    dados_novos: { data_programada: input.data_nova },
    usuario_id: input.usuario_id || null,
    usuario_nome: input.usuario_nome,
  })

  return true
}

/**
 * Marca uma comissão programada como paga (a comissão volta ao fluxo normal e status pago)
 */
export async function marcarProgramadoComoPago(input: {
  ajuste_id: string
  comissao_id: string
  justificativa: string
  usuario_id?: string | null
  usuario_nome: string
}): Promise<boolean> {
  const agora = new Date().toISOString()
  let dbOk = false

  try {
    const { error } = await (supabase.from('comissao_ajustes' as any) as any)
      .update({
        status: 'pago',
        pago_em: agora,
        pago_por: input.usuario_id || null,
        atualizado_em: agora,
      })
      .eq('id', input.ajuste_id)

    if (!error) {
      dbOk = true
      // Atualizar status_comissao na venda
      await (supabase.from('vendas_confirmadas') as any)
        .update({ status_comissao: 'pago' })
        .eq('id', input.comissao_id)
    }
  } catch {
    // fallback
  }

  if (!dbOk) {
    const local = getLocalAjustes()
    const idx = local.findIndex((a) => a.id === input.ajuste_id)
    if (idx >= 0) {
      local[idx].status = 'pago'
      local[idx].pago_em = agora
      saveLocalAjustes([...local])
    }
  }

  await registrarComissaoAjusteLog({
    ajuste_id: input.ajuste_id,
    comissao_id: input.comissao_id,
    acao: 'MARCADO_PAGO',
    justificativa: input.justificativa,
    dados_anteriores: { status: 'ativo' },
    dados_novos: { status: 'pago', pago_em: agora },
    usuario_id: input.usuario_id || null,
    usuario_nome: input.usuario_nome,
  })

  return true
}

/**
 * Cancela definitivamente uma comissão programada
 */
export async function cancelarProgramadoDefinitivo(input: {
  ajuste_id: string
  comissao_id: string
  justificativa: string
  usuario_id?: string | null
  usuario_nome: string
}): Promise<boolean> {
  const agora = new Date().toISOString()
  let dbOk = false

  try {
    const { error } = await (supabase.from('comissao_ajustes' as any) as any)
      .update({
        status: 'cancelado',
        cancelado_em: agora,
        cancelado_por: input.usuario_id || null,
        atualizado_em: agora,
      })
      .eq('id', input.ajuste_id)

    if (!error) dbOk = true
  } catch {
    // fallback
  }

  if (!dbOk) {
    const local = getLocalAjustes()
    const idx = local.findIndex((a) => a.id === input.ajuste_id)
    if (idx >= 0) {
      local[idx].status = 'cancelado'
      local[idx].cancelado_em = agora
      saveLocalAjustes([...local])
    }
  }

  await registrarComissaoAjusteLog({
    ajuste_id: input.ajuste_id,
    comissao_id: input.comissao_id,
    acao: 'CANCELADO_DEFINITIVO',
    justificativa: input.justificativa,
    dados_anteriores: { status: 'ativo' },
    dados_novos: { status: 'cancelado', cancelado_em: agora },
    usuario_id: input.usuario_id || null,
    usuario_nome: input.usuario_nome,
  })

  return true
}

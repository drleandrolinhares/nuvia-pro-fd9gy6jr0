import { supabase } from '@/lib/supabase/client'

export type TipoCompromisso =
  | 'consulta'
  | 'viagem_pessoal'
  | 'viagem_trabalho'
  | 'reuniao'
  | 'congresso'
  | 'folga_ferias'
  | 'treinamento'
  | 'atendimento_externo'
  | 'acao_comercial'

export interface Compromisso {
  id: string
  usuario_id: string
  tipo_compromisso: TipoCompromisso
  data_inicio: string
  data_fim: string
  hora_inicio?: string | null
  hora_fim?: string | null
  eh_dia_inteiro: boolean
  descricao?: string | null
  arquivado: boolean
  setor?: string | null
  criado_em: string
  atualizado_em: string
  usuario?: {
    id: string
    nome: string
  }
  paciente_id?: string | null
  lead_id?: string | null
  status_acao?: string | null
  resultado_acao?: string | null
  concluido_em?: string | null
  concluido_por?: string | null
  cancelado_em?: string | null
  cancelado_por?: string | null
  motivo_cancelamento?: string | null
  reagendado?: boolean | null
  data_original?: string | null
  paciente?: { nome: string } | null
  lead?: { nome: string } | null
  concluido_por_user?: { id?: string; nome: string } | null
  cancelado_por_user?: { id?: string; nome: string } | null
}

export const getCompromissos = async (setor: string = 'operacional') => {
  try {
    const { data, error } = await (supabase.from('compromissos') as any)
      .select(`
        *, 
        usuario:usuarios!compromissos_usuario_id_fkey(id, nome),
        paciente:pacientes(nome),
        lead:funil_leads(nome),
        concluido_por_user:usuarios!compromissos_concluido_por_fkey(id, nome),
        cancelado_por_user:usuarios!compromissos_cancelado_por_fkey(id, nome)
      `)
      .eq('setor', setor)
      .order('data_inicio', { ascending: true })

    if (error) {
      // Fallback gracioso se a FK de cancelado_por ainda não tiver sido inferida no cache de schema
      const { data: fallbackData, error: fallbackError } = await (
        supabase.from('compromissos') as any
      )
        .select(`
          *, 
          usuario:usuarios!compromissos_usuario_id_fkey(id, nome),
          paciente:pacientes(nome),
          lead:funil_leads(nome),
          concluido_por_user:usuarios!compromissos_concluido_por_fkey(id, nome)
        `)
        .eq('setor', setor)
        .order('data_inicio', { ascending: true })

      if (fallbackError) throw fallbackError
      return fallbackData as unknown as Compromisso[]
    }

    return data as unknown as Compromisso[]
  } catch (err) {
    console.error('Erro ao buscar compromissos:', err)
    throw err
  }
}

/**
 * Remove colunas estendidas caso ocorra erro transitório de schema cache do Supabase
 * garantindo que a inserção ou atualização nunca falhe silenciosamente nem bloqueie o usuário.
 */
function sanitizeCompromissoPayload(payload: Partial<Compromisso>, omitExtendedCols: boolean) {
  const sanitized: any = { ...payload }
  if (omitExtendedCols) {
    delete sanitized.data_original
    delete sanitized.reagendado
    delete sanitized.motivo_cancelamento
    delete sanitized.cancelado_em
    delete sanitized.cancelado_por
  }
  return sanitized
}

export const createCompromisso = async (compromisso: Partial<Compromisso>) => {
  if (!compromisso.setor) compromisso.setor = 'operacional'

  const { data, error } = await (supabase.from('compromissos') as any)
    .insert([compromisso])
    .select()
    .single()

  if (error) {
    // Se o PostgREST acusar falta de colunas novas no schema cache, tenta fallback
    if (
      typeof error.message === 'string' &&
      (error.message.includes('schema cache') || error.message.includes('data_original'))
    ) {
      console.warn('Fallback de schema cache ao criar compromisso:', error.message)
      const sanitized = sanitizeCompromissoPayload(compromisso, true)
      const { data: retryData, error: retryError } = await (supabase.from('compromissos') as any)
        .insert([sanitized])
        .select()
        .single()
      if (retryError) throw retryError
      return retryData
    }
    throw error
  }
  return data
}

export const updateCompromisso = async (id: string, compromisso: Partial<Compromisso>) => {
  const { data, error } = await (supabase.from('compromissos') as any)
    .update(compromisso)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    // Se o PostgREST acusar falta de colunas novas no schema cache, tenta fallback
    if (
      typeof error.message === 'string' &&
      (error.message.includes('schema cache') || error.message.includes('data_original'))
    ) {
      console.warn('Fallback de schema cache ao atualizar compromisso:', error.message)
      const sanitized = sanitizeCompromissoPayload(compromisso, true)
      const { data: retryData, error: retryError } = await (supabase.from('compromissos') as any)
        .update(sanitized)
        .eq('id', id)
        .select()
        .single()
      if (retryError) throw retryError
      return retryData
    }
    throw error
  }
  return data
}

export const deleteCompromisso = async (id: string) => {
  const { error } = await supabase.from('compromissos').delete().eq('id', id)

  if (error) throw error
}

export const getUsuarios = async () => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nome')
    .eq('status', 'ativo')
    .order('nome')

  if (error) throw error
  return data
}

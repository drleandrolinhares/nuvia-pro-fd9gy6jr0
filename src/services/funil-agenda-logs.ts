import { supabase } from '@/lib/supabase/client'

export type FunilAgendaLogAcao =
  | 'CRIADO'
  | 'REAGENDADO'
  | 'EDITADO'
  | 'CONCLUIDO'
  | 'CANCELADO'
  | 'REATIVADO'

export interface FunilAgendaLog {
  id: string
  tenant_id?: string | null
  compromisso_id?: string | null
  lead_id?: string | null
  paciente_id?: string | null
  tipo: 'acao_comercial' | 'lead'
  acao: FunilAgendaLogAcao
  detalhes?: string | null
  data_anterior?: string | null
  data_nova?: string | null
  dados_anteriores?: Record<string, any> | null
  dados_novos?: Record<string, any> | null
  usuario_id?: string | null
  usuario_nome: string
  criado_em: string
}

export interface RegistrarAgendaLogInput {
  compromisso_id?: string | null
  lead_id?: string | null
  paciente_id?: string | null
  tipo?: 'acao_comercial' | 'lead'
  acao: FunilAgendaLogAcao
  detalhes?: string | null
  data_anterior?: string | null
  data_nova?: string | null
  dados_anteriores?: Record<string, any> | null
  dados_novos?: Record<string, any> | null
  usuario_id?: string | null
  usuario_nome: string
}

/**
 * Registra um log imutável de interação/carimbo na tabela funil_agenda_logs.
 * Não lança exceção para não quebrar fluxos caso ocorra erro transitório de rede.
 */
export async function registrarAgendaLog(
  input: RegistrarAgendaLogInput,
): Promise<FunilAgendaLog | null> {
  try {
    const payload: any = {
      compromisso_id: input.compromisso_id || null,
      lead_id: input.lead_id || null,
      paciente_id: input.paciente_id || null,
      tipo: input.tipo || 'acao_comercial',
      acao: input.acao,
      detalhes: input.detalhes?.trim() || null,
      data_anterior: input.data_anterior || null,
      data_nova: input.data_nova || null,
      dados_anteriores: input.dados_anteriores || null,
      dados_novos: input.dados_novos || null,
      usuario_id: input.usuario_id || null,
      usuario_nome: input.usuario_nome?.trim() || 'Usuário Desconhecido',
    }

    const { data, error } = await (supabase.from('funil_agenda_logs' as any) as any)
      .insert(payload)
      .select()
      .single()

    if (error) {
      console.error('Erro ao registrar log da agenda do funil:', error)
      return null
    }

    return data as FunilAgendaLog
  } catch (err) {
    console.error('Exceção ao registrar log da agenda do funil:', err)
    return null
  }
}

/**
 * Busca o histórico de logs carimbados de um compromisso ou lead específico.
 */
export async function fetchAgendaLogs(filtros: {
  compromissoId?: string | null
  leadId?: string | null
  pacienteId?: string | null
  limite?: number
}): Promise<FunilAgendaLog[]> {
  try {
    let query: any = (supabase.from('funil_agenda_logs' as any) as any)
      .select('*')
      .order('criado_em', { ascending: false })

    if (filtros.compromissoId) {
      query = query.eq('compromisso_id', filtros.compromissoId)
    } else if (filtros.leadId) {
      query = query.eq('lead_id', filtros.leadId)
    } else if (filtros.pacienteId) {
      query = query.eq('paciente_id', filtros.pacienteId)
    }

    query = query.limit(filtros.limite || 100)

    const { data, error } = await query

    if (error) {
      console.error('Erro ao buscar logs da agenda do funil:', error)
      return []
    }

    return (data as FunilAgendaLog[]) || []
  } catch (err) {
    console.error('Exceção ao buscar logs da agenda do funil:', err)
    return []
  }
}

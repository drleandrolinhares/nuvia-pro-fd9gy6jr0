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
  paciente?: { nome: string } | null
  lead?: { nome: string } | null
  concluido_por_user?: { nome: string } | null
}

export const getCompromissos = async (setor: string = 'operacional') => {
  const { data, error } = await supabase
    .from('compromissos')
    .select(`
      *, 
      usuario:usuarios!compromissos_usuario_id_fkey(id, nome),
      paciente:pacientes(nome),
      lead:funil_leads(nome),
      concluido_por_user:usuarios!compromissos_concluido_por_fkey(nome)
    `)
    .eq('setor', setor)
    .order('data_inicio', { ascending: true })

  if (error) throw error
  return data as Compromisso[]
}

export const createCompromisso = async (compromisso: Partial<Compromisso>) => {
  if (!compromisso.setor) compromisso.setor = 'operacional'

  const { data, error } = await supabase
    .from('compromissos')
    .insert([compromisso])
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateCompromisso = async (id: string, compromisso: Partial<Compromisso>) => {
  const { data, error } = await supabase
    .from('compromissos')
    .update(compromisso)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
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

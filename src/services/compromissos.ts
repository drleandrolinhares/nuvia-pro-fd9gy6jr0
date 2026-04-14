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
  criado_em: string
  atualizado_em: string
  usuario?: {
    id: string
    nome: string
  }
}

export const getCompromissos = async () => {
  const { data, error } = await supabase
    .from('compromissos')
    .select('*, usuario:usuarios(id, nome)')
    .order('data_inicio', { ascending: true })

  if (error) throw error
  return data as Compromisso[]
}

export const createCompromisso = async (compromisso: Partial<Compromisso>) => {
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

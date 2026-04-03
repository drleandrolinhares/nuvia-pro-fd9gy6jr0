import { supabase } from '@/lib/supabase/client'

export type CadastroItem = {
  id: string
  nome: string
  data_criacao?: string | null
}

export type AllowedTables = 'especialidades' | 'embalagens' | 'salas'

export const checkIsAdmin = async () => {
  const { data, error } = await supabase.rpc('is_admin')
  if (error) throw error
  return data
}

export const getItems = async (table: AllowedTables) => {
  const { data, error } = await supabase.from(table).select('id, nome, data_criacao').order('nome')
  if (error) throw error
  return data as CadastroItem[]
}

export const createItem = async (table: AllowedTables, nome: string) => {
  const { data, error } = await supabase
    .from(table)
    .insert([{ nome }])
    .select('id, nome, data_criacao')
    .single()
  if (error) throw error
  return data as CadastroItem
}

export const updateItem = async (table: AllowedTables, id: string, nome: string) => {
  const { data, error } = await supabase
    .from(table)
    .update({ nome })
    .eq('id', id)
    .select('id, nome, data_criacao')
    .single()
  if (error) throw error
  return data as CadastroItem
}

export const deleteItem = async (table: AllowedTables, id: string) => {
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) throw error
}

export type CampoPersonalizado = {
  id: string
  nome: string
  descricao?: string | null
  tipo?: string | null
}

export type EspecialidadeCampo = {
  especialidade_id: string
  campo_id: string
  ativo: boolean
}

export const getCamposPersonalizados = async () => {
  const { data, error } = await supabase.from('campos_personalizados').select('*').order('nome')
  if (error) throw error
  return data as CampoPersonalizado[]
}

export const getEspecialidadeCamposAtivos = async (especialidadeId: string) => {
  const { data, error } = await supabase
    .from('especialidade_campos')
    .select('campo_id')
    .eq('especialidade_id', especialidadeId)
    .eq('ativo', true)
  if (error) throw error
  return data.map((d) => d.campo_id) as string[]
}

export const salvarEspecialidadeCampos = async (
  especialidadeId: string,
  camposAtivosIds: string[],
) => {
  const { error: deleteError } = await supabase
    .from('especialidade_campos')
    .delete()
    .eq('especialidade_id', especialidadeId)

  if (deleteError) throw deleteError

  if (camposAtivosIds.length > 0) {
    const inserts = camposAtivosIds.map((campoId) => ({
      especialidade_id: especialidadeId,
      campo_id: campoId,
      ativo: true,
    }))

    const { error: insertError } = await supabase.from('especialidade_campos').insert(inserts)

    if (insertError) throw insertError
  }
}

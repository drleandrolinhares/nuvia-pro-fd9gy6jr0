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

export const getCampoOpcoes = async () => {
  const { data, error } = await supabase
    .from('campo_opcoes')
    .select('id, campo_id, nome, data_criacao')
    .order('nome')
  if (error) throw error
  return data
}

export const createCampoOpcao = async (campo_id: string, nome: string) => {
  const { data, error } = await supabase
    .from('campo_opcoes')
    .insert([{ campo_id, nome }])
    .select('id, nome, data_criacao')
    .single()
  if (error) throw error
  return data as CadastroItem
}

export const updateCampoOpcao = async (id: string, nome: string) => {
  const { data, error } = await supabase
    .from('campo_opcoes')
    .update({ nome })
    .eq('id', id)
    .select('id, nome, data_criacao')
    .single()
  if (error) throw error
  return data as CadastroItem
}

export const deleteCampoOpcao = async (id: string) => {
  const { error } = await supabase.from('campo_opcoes').delete().eq('id', id)
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

export const getEspecialidadeCampos = async (especialidadeId: string) => {
  const { data, error } = await supabase
    .from('especialidade_campos')
    .select('*, campos_personalizados(*)')
    .eq('especialidade_id', especialidadeId)
    .order('ordem', { ascending: true })

  if (error) throw error
  return data
}

export const salvarEspecialidadeCampos = async (especialidadeId: string, configs: any[]) => {
  const { error: deleteError } = await supabase
    .from('especialidade_campos')
    .delete()
    .eq('especialidade_id', especialidadeId)

  if (deleteError) throw deleteError

  if (configs.length > 0) {
    const inserts = configs.map((c) => ({
      especialidade_id: especialidadeId,
      campo_id: c.campo_id,
      ordem: c.ordem,
      ativo: c.ativo,
      label_customizado: c.label_customizado || null,
    }))
    const { error: insertError } = await supabase.from('especialidade_campos').insert(inserts)
    if (insertError) throw insertError
  }
}

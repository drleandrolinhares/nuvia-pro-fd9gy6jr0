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

export type CampoConfiguracao = {
  id?: string
  especialidade_id: string
  campo_id: string
  label_customizado: string | null
  ordem: number
  ativo: boolean
  campos_personalizados?: CampoPersonalizado
}

export const getCampoConfiguracoes = async (especialidadeId: string) => {
  const { data, error } = await supabase
    .from('campo_configuracao')
    .select('*, campos_personalizados(*)')
    .eq('especialidade_id', especialidadeId)
    .order('ordem', { ascending: true })

  if (error) throw error
  return data as CampoConfiguracao[]
}

export const salvarCampoConfiguracoes = async (
  especialidadeId: string,
  configs: CampoConfiguracao[],
) => {
  const { error: deleteError } = await supabase
    .from('campo_configuracao')
    .delete()
    .eq('especialidade_id', especialidadeId)

  if (deleteError) throw deleteError

  if (configs.length > 0) {
    const inserts = configs.map((c) => ({
      especialidade_id: especialidadeId,
      campo_id: c.campo_id,
      label_customizado: c.label_customizado,
      ordem: c.ordem,
      ativo: c.ativo,
    }))
    const { error: insertError } = await supabase.from('campo_configuracao').insert(inserts)
    if (insertError) throw insertError
  }
}

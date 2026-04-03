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

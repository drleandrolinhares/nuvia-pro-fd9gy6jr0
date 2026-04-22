import { supabase } from '@/lib/supabase/client'

export interface TarefaTerceiro {
  id: string
  categoria_slug: string
  titulo: string
  descricao: string | null
  paciente_nome: string | null
  terceiro_nome: string | null
  status: string
  data_prevista: string | null
  ordem: number
  criado_em: string
}

export interface TerceiroColuna {
  id: string
  categoria_slug: string
  titulo: string
  cor: string
  ordem: number
}

export const getColunas = async (categoriaSlug: string) => {
  const { data, error } = await supabase
    .from('terceiros_colunas' as any)
    .select('*')
    .eq('categoria_slug', categoriaSlug)
    .order('ordem', { ascending: true })

  if (error) throw error
  return data as TerceiroColuna[]
}

export const updateColuna = async (id: string, titulo: string) => {
  const { data, error } = await supabase
    .from('terceiros_colunas' as any)
    .update({ titulo })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as TerceiroColuna
}

export const getTarefas = async (categoriaSlug: string) => {
  const { data, error } = await supabase
    .from('terceiros_tarefas' as any)
    .select('*')
    .eq('categoria_slug', categoriaSlug)
    .order('ordem', { ascending: true })
    .order('criado_em', { ascending: false })

  if (error) throw error
  return data as TarefaTerceiro[]
}

export const updateTarefaStatus = async (id: string, status: string) => {
  const { data, error } = await supabase
    .from('terceiros_tarefas' as any)
    .update({ status, atualizado_em: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as TarefaTerceiro
}

export const createTarefa = async (tarefa: Partial<TarefaTerceiro>) => {
  const { data, error } = await supabase
    .from('terceiros_tarefas' as any)
    .insert([tarefa])
    .select()
    .single()

  if (error) throw error
  return data as TarefaTerceiro
}

export const updateTarefa = async (id: string, tarefa: Partial<TarefaTerceiro>) => {
  const { data, error } = await supabase
    .from('terceiros_tarefas' as any)
    .update({ ...tarefa, atualizado_em: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as TarefaTerceiro
}

export const deleteTarefa = async (id: string) => {
  const { error } = await supabase
    .from('terceiros_tarefas' as any)
    .delete()
    .eq('id', id)

  if (error) throw error
}

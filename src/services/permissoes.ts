import { supabase } from '@/lib/supabase/client'
import { Tables } from '@/lib/supabase/types'

export type Permissao = Tables<'permissoes'>
export type Cargo = Tables<'cargos'> & {
  cargo_permissoes: { permissao_id: string }[]
}

export type UsuarioComPermissoes = {
  id: string
  nome: string
  email: string
  cargo: { nome: string } | null
  usuario_permissoes: { permissao_id: string }[]
}

export async function checkIsAdmin() {
  const { data, error } = await supabase.rpc('is_admin')
  if (error) throw error
  return !!data
}

export async function getCargos() {
  const { data, error } = await supabase
    .from('cargos')
    .select('*, cargo_permissoes(permissao_id)')
    .order('nome')
  if (error) throw error
  return data as Cargo[]
}

export async function getPermissoes() {
  const { data, error } = await supabase
    .from('permissoes')
    .select('*')
    .order('modulo')
    .order('nome')
  if (error) throw error
  return data as Permissao[]
}

export async function getUsuariosComPermissoes() {
  const { data, error } = await supabase
    .from('usuarios')
    .select(
      'id, nome, email, cargo:cargos!usuarios_cargo_id_fkey(nome), usuario_permissoes(permissao_id)',
    )
    .order('nome')
  if (error) throw error
  return data as unknown as UsuarioComPermissoes[]
}

export async function saveCargo(
  cargoId: string | null,
  data: { nome: string; setor: string | null; descricao: string | null; permissoes: string[] },
) {
  let id = cargoId
  if (!id) {
    const { data: novoCargo, error } = await supabase
      .from('cargos')
      .insert({ nome: data.nome, setor: data.setor, descricao: data.descricao })
      .select()
      .single()
    if (error) throw error
    id = novoCargo.id
  } else {
    const { error } = await supabase
      .from('cargos')
      .update({ nome: data.nome, setor: data.setor, descricao: data.descricao })
      .eq('id', id)
    if (error) throw error
  }

  const { error: deleteError } = await supabase.from('cargo_permissoes').delete().eq('cargo_id', id)
  if (deleteError) throw deleteError

  if (data.permissoes.length > 0) {
    const { error: insertError } = await supabase
      .from('cargo_permissoes')
      .insert(data.permissoes.map((pid) => ({ cargo_id: id!, permissao_id: pid })))
    if (insertError) throw insertError
  }

  return id
}

export async function saveUsuarioPermissoes(usuarioId: string, permissoes: string[]) {
  const { error: deleteError } = await supabase
    .from('usuario_permissoes')
    .delete()
    .eq('usuario_id', usuarioId)
  if (deleteError) throw deleteError

  if (permissoes.length > 0) {
    const { error: insertError } = await supabase
      .from('usuario_permissoes')
      .insert(permissoes.map((pid) => ({ usuario_id: usuarioId, permissao_id: pid })))
    if (insertError) throw insertError
  }
}

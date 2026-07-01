import { supabase } from '@/lib/supabase/client'

export type Permissao = {
  id: string
  nome: string
  descricao: string | null
  modulo: string | null
}

export type Cargo = {
  id: string
  nome: string
  descricao: string | null
  setor: string | null
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
  if (error) {
    console.error('[permissoes] Error checking admin status:', error)
    return false
  }
  return !!data
}

export async function getCargos() {
  const { data, error } = await supabase
    .from('cargos')
    .select('id, nome, descricao, setor')
    .order('nome')
  if (error) {
    console.error('[permissoes] Error fetching cargos:', error)
    throw error
  }
  return (data || []).map((c: any) => ({ ...c, cargo_permissoes: [] })) as Cargo[]
}

export async function getPermissoes(): Promise<Permissao[]> {
  return []
}

export async function getUsuariosComPermissoes() {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nome, email, cargo:cargos!usuarios_cargo_id_fkey(nome)')
    .order('nome')
  if (error) {
    console.error('[permissoes] Error fetching usuarios:', error)
    throw error
  }
  return (data || []).map((u: any) => ({ ...u, usuario_permissoes: [] })) as UsuarioComPermissoes[]
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

  return id
}

export async function saveUsuarioPermissoes(_usuarioId: string, _permissoes: string[]) {
  // No-op: permissions tables have been removed from the database
}

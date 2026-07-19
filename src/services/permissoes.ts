import { supabase } from '@/lib/supabase/client'

export type Permissao = {
  id: string
  nome: string
  slug: string
  modulo: string | null
  descricao: string | null
  ordem: number
  ativo: boolean
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
  const { data, error } = await supabase
    .from('permissoes')
    .select('*')
    .eq('ativo', true)
    .order('ordem')
  if (error) {
    console.error('[permissoes] Error fetching permissoes:', error)
    return []
  }
  return (data || []) as Permissao[]
}

export async function getUsuarioPermissoes(usuarioId: string): Promise<string[]> {
  const { data, error } = await supabase.rpc('get_user_permissions', { p_user_id: usuarioId })
  if (error) {
    console.error('[permissoes] Error fetching user permissions:', error)
    return []
  }
  return (data || []) as string[]
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

  const usuarios = (data || []).map((u: any) => ({
    ...u,
    usuario_permissoes: [],
  })) as UsuarioComPermissoes[]

  const { data: userPerms, error: permsError } = await supabase
    .from('usuario_permissoes')
    .select('usuario_id, permissao_id')

  if (permsError) {
    console.error('[permissoes] Error fetching usuario_permissoes:', permsError)
    return usuarios
  }

  const permsMap = new Map<string, string[]>()
  if (userPerms) {
    userPerms.forEach((up: any) => {
      if (!permsMap.has(up.usuario_id)) permsMap.set(up.usuario_id, [])
      permsMap.get(up.usuario_id)!.push(up.permissao_id)
    })
  }

  return usuarios.map(
    (u) =>
      ({
        ...u,
        usuario_permissoes: (permsMap.get(u.id) || []).map((pid) => ({ permissao_id: pid })),
      }) as UsuarioComPermissoes,
  )
}

export async function saveUsuarioPermissoes(usuarioId: string, permissaoIds: string[]) {
  const { error: deleteError } = await supabase
    .from('usuario_permissoes')
    .delete()
    .eq('usuario_id', usuarioId)

  if (deleteError) throw deleteError

  if (permissaoIds.length > 0) {
    const inserts = permissaoIds.map((pid) => ({
      usuario_id: usuarioId,
      permissao_id: pid,
    }))

    const { error: insertError } = await supabase.from('usuario_permissoes').insert(inserts)

    if (insertError) throw insertError
  }
}

export async function resetUserPassword(usuarioId: string) {
  const { data, error } = await supabase.functions.invoke('update-user-password', {
    body: { userId: usuarioId, password: '123456' },
  })
  if (error) throw error
  if (data?.error) throw new Error(data.error)
  return data
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

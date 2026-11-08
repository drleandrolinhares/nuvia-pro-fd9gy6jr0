import { supabase } from '@/lib/supabase/client'

export type PermissaoTipo = 'pagina' | 'acao'

export type Permissao = {
  id: string
  nome: string
  slug: string
  modulo: string | null
  descricao: string | null
  ordem: number
  ativo: boolean
  tipo: PermissaoTipo
  parent_slug: string | null
  critica: boolean
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

/** Estado efetivo de uma permissão para um usuário. */
export type EstadoPermissao = 'herdada' | 'concedida' | 'negada'

export type PermissaoEfetiva = {
  permissao_id: string
  slug: string
  tipo: PermissaoTipo
  origem: 'cargo' | 'usuario' | 'negada' | 'nenhuma'
  concedida: boolean
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

  const cargos = (data || []).map((c: any) => ({ ...c, cargo_permissoes: [] })) as Cargo[]

  const { data: cargoPerms, error: permsError } = await supabase
    .from('cargo_permissoes')
    .select('cargo_id, permissao_id')

  if (permsError) {
    console.error('[permissoes] Error fetching cargo_permissoes:', permsError)
    return cargos
  }

  const permsMap = new Map<string, string[]>()
  if (cargoPerms) {
    cargoPerms.forEach((cp: any) => {
      if (!permsMap.has(cp.cargo_id)) permsMap.set(cp.cargo_id, [])
      permsMap.get(cp.cargo_id)!.push(cp.permissao_id)
    })
  }

  return cargos.map(
    (c) =>
      ({
        ...c,
        cargo_permissoes: (permsMap.get(c.id) || []).map((pid) => ({ permissao_id: pid })),
      }) as Cargo,
  )
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
  // Garante os defaults caso a migração ainda não tenha rodado em algum ambiente
  return ((data || []) as any[]).map((p) => ({
    ...p,
    tipo: (p.tipo || (String(p.nome).startsWith('Acessar ') ? 'pagina' : 'acao')) as PermissaoTipo,
    parent_slug: p.parent_slug ?? null,
    critica: !!p.critica,
  }))
}

export async function getUsuarioPermissoes(usuarioId: string): Promise<string[]> {
  const { data, error } = await supabase.rpc('get_user_permissions', { p_user_id: usuarioId })
  if (error) {
    console.error('[permissoes] Error fetching user permissions:', error)
    return []
  }
  return (data || []) as string[]
}

/**
 * Permissões concedidas e negadas de um usuário, já resolvidas pelo banco
 * (cargo ∪ concedidas − negadas). Usado pela tela de edição.
 */
export async function getPermissoesEfetivas(usuarioId: string): Promise<{
  efetivas: PermissaoEfetiva[]
  concedidas: Set<string>
  negadas: Set<string>
}> {
  const concedidas = new Set<string>()
  const negadas = new Set<string>()
  let efetivas: PermissaoEfetiva[] = []

  const { data, error } = await supabase.rpc('get_effective_permissions', {
    p_user_id: usuarioId,
  })

  if (!error && data) {
    efetivas = (data as any[]).map((r) => ({
      permissao_id: r.permissao_id,
      slug: r.slug,
      tipo: r.tipo,
      origem: r.origem,
      concedida: r.concedida,
    }))
    efetivas.forEach((e) => {
      if (e.origem === 'usuario') concedidas.add(e.permissao_id)
      if (e.origem === 'negada') negadas.add(e.permissao_id)
    })
    return { efetivas, concedidas, negadas }
  }

  // Fallback se a função ainda não existir no ambiente
  if (error) console.warn('[permissoes] get_effective_permissions indisponível:', error.message)

  const { data: up } = await supabase
    .from('usuario_permissoes')
    .select('permissao_id')
    .eq('usuario_id', usuarioId)
  ;(up || []).forEach((r: any) => concedidas.add(r.permissao_id))

  try {
    const { data: neg } = await supabase
      .from('usuario_permissoes_negadas')
      .select('permissao_id')
      .eq('usuario_id', usuarioId)
    ;(neg || []).forEach((r: any) => negadas.add(r.permissao_id))
  } catch {
    /* tabela pode não existir em ambiente antigo */
  }

  return { efetivas, concedidas, negadas }
}

export async function getUsuariosComPermissoes() {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nome, email, status, cargo:cargos!usuarios_cargo_id_fkey(nome)')
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

/**
 * Grava a configuração de um usuário em um único passo.
 * `concedidas` entram como exceção positiva; `negadas` como exceção negativa.
 * Tudo o que não estiver em nenhuma das listas volta a herdar do cargo.
 */
export async function saveUsuarioPermissoesConfig(
  usuarioId: string,
  concedidas: string[],
  negadas: string[],
) {
  const { error: delConc } = await supabase
    .from('usuario_permissoes')
    .delete()
    .eq('usuario_id', usuarioId)
  if (delConc) throw delConc

  if (concedidas.length > 0) {
    const { error } = await supabase
      .from('usuario_permissoes')
      .insert(concedidas.map((pid) => ({ usuario_id: usuarioId, permissao_id: pid })))
    if (error) throw error
  }

  const { error: delNeg } = await supabase
    .from('usuario_permissoes_negadas')
    .delete()
    .eq('usuario_id', usuarioId)
  if (delNeg) throw delNeg

  if (negadas.length > 0) {
    const { error } = await supabase
      .from('usuario_permissoes_negadas')
      .insert(negadas.map((pid) => ({ usuario_id: usuarioId, permissao_id: pid })))
    if (error) throw error
  }
}

/** Compatibilidade: grava apenas concessões. */
export async function saveUsuarioPermissoes(usuarioId: string, permissaoIds: string[]) {
  const { error: deleteError } = await supabase
    .from('usuario_permissoes')
    .delete()
    .eq('usuario_id', usuarioId)
  if (deleteError) throw deleteError

  if (permissaoIds.length > 0) {
    const { error: insertError } = await supabase
      .from('usuario_permissoes')
      .insert(permissaoIds.map((pid) => ({ usuario_id: usuarioId, permissao_id: pid })))
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

  const { error: deletePermsError } = await supabase
    .from('cargo_permissoes')
    .delete()
    .eq('cargo_id', id)
  if (deletePermsError) throw deletePermsError

  if (data.permissoes.length > 0) {
    const inserts = data.permissoes.map((pid) => ({
      cargo_id: id,
      permissao_id: pid,
    }))
    const { error: insertPermsError } = await supabase.from('cargo_permissoes').insert(inserts)
    if (insertPermsError) throw insertPermsError
  }

  return id
}

/**
 * Resolve o estado de exibição de uma permissão na tela de edição:
 *   herdada  → vem do cargo (ou não vem, e aparece desmarcada)
 *   concedida→ exceção positiva do usuário
 *   negada   → exceção negativa do usuário
 */
export function estadoPermissao(
  permissaoId: string,
  herdadasDoCargo: Set<string>,
  concedidas: Set<string>,
  negadas: Set<string>,
): EstadoPermissao {
  if (negadas.has(permissaoId)) return 'negada'
  if (concedidas.has(permissaoId)) return 'concedida'
  return 'herdada'
}

/** A permissão está efetivamente liberada? */
export function permissaoLiberada(
  permissaoId: string,
  herdadasDoCargo: Set<string>,
  concedidas: Set<string>,
  negadas: Set<string>,
): boolean {
  if (negadas.has(permissaoId)) return false
  if (concedidas.has(permissaoId)) return true
  return herdadasDoCargo.has(permissaoId)
}

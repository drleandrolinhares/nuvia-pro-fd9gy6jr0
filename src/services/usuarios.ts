import { supabase } from '@/lib/supabase/client'
import { Tables } from '@/lib/supabase/types'

export type UsuarioWithCargo = Tables<'usuarios'> & {
  cargo: Pick<Tables<'cargos'>, 'nome' | 'setor'> | null
}

export async function getUsuarios() {
  const { data, error } = await supabase
    .from('usuarios')
    .select(`
      *,
      cargo:cargos(nome, setor)
    `)
    .order('nome')

  if (error) throw error
  return data as UsuarioWithCargo[]
}

export async function getCargos() {
  const { data, error } = await supabase.from('cargos').select('*').order('nome')
  if (error) throw error
  return data
}

export async function updateUsuarioStatus(id: string, status: string) {
  const { error } = await supabase.from('usuarios').update({ status }).eq('id', id)
  if (error) throw error
}

export async function checkHasPermission(permissionName: string) {
  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (isAdmin) return true

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false

  // Verifica permissões individuais do usuário
  const { data: permissoes } = await supabase
    .from('usuario_permissoes')
    .select('permissao:permissoes(nome)')
    .eq('usuario_id', user.id)

  const hasUserPerm = (permissoes as any[])?.some((p) => p.permissao?.nome === permissionName)
  if (hasUserPerm) return true

  // Verifica permissões atreladas ao cargo do usuário
  const { data: usuario } = await supabase
    .from('usuarios')
    .select('cargo_id')
    .eq('id', user.id)
    .single()
  if (usuario?.cargo_id) {
    const { data: cargoPermissoes } = await supabase
      .from('cargo_permissoes')
      .select('permissao:permissoes(nome)')
      .eq('cargo_id', usuario.cargo_id)

    const hasCargoPerm = (cargoPermissoes as any[])?.some(
      (p) => p.permissao?.nome === permissionName,
    )
    if (hasCargoPerm) return true
  }

  return false
}

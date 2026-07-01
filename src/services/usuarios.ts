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
      cargo:cargos!usuarios_cargo_id_fkey(nome, setor)
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

export async function updateUsuarioRole(id: string, role: string) {
  const { error } = await supabase.from('usuarios').update({ role }).eq('id', id)
  if (error) throw error
}

export async function getColaboradorDetalhes(usuarioId: string) {
  const { data, error } = await supabase
    .from('colaboradores_detalhes')
    .select('*')
    .eq('usuario_id', usuarioId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function saveColaborador(data: any, isEdit: boolean, oldEmail?: string) {
  let userId = data.id

  if (!isEdit) {
    const { data: edgeData, error: edgeError } = await supabase.functions.invoke('create-user', {
      body: {
        email: data.email,
        password: data.password,
        nome: data.nome,
      },
    })
    if (edgeError) throw edgeError
    if (edgeData?.error) throw new Error(edgeData.error)
    userId = edgeData.user.id
  } else if (oldEmail && data.email !== oldEmail) {
    const { data: edgeData, error: edgeError } = await supabase.functions.invoke(
      'update-user-email',
      {
        body: {
          userId: userId,
          email: data.email,
        },
      },
    )
    if (edgeError) throw edgeError
    if (edgeData?.error) throw new Error(edgeData.error)
  }

  const { error: userError } = await supabase.from('usuarios').upsert({
    id: userId,
    email: data.email,
    nome: data.nome,
    cpf: data.cpf,
    data_nascimento: data.data_nascimento || null,
    telefone: data.telefone,
    endereco: data.endereco,
    cargo_id: data.cargo_id,
    cargo_secundario_id: data.cargo_secundario_id || null,
    data_admissao: data.data_admissao || null,
    salario: data.salario || null,
    status: data.status || 'ativo',
    possui_carteira: data.possui_carteira !== undefined ? data.possui_carteira : true,
    exigir_rotina: data.exigir_rotina !== undefined ? data.exigir_rotina : true,
    obrigatorio_pp_pdm: data.obrigatorio_pp_pdm !== undefined ? data.obrigatorio_pp_pdm : false,
    elegivel_ferias: data.elegivel_ferias !== undefined ? data.elegivel_ferias : false,
    horario_entrada: data.horario_entrada || null,
    inicio_lanche_manha: data.inicio_lanche_manha || null,
    fim_lanche_manha: data.fim_lanche_manha || null,
    saida_almoco: data.saida_almoco || null,
    retorno_almoco: data.retorno_almoco || null,
    inicio_lanche_tarde: data.inicio_lanche_tarde || null,
    fim_lanche_tarde: data.fim_lanche_tarde || null,
    horario_saida: data.horario_saida || null,
    dias_trabalho: data.dias_trabalho || [1, 2, 3, 4, 5],
  })
  if (userError) throw userError

  const { error: detalhesError } = await supabase.from('colaboradores_detalhes').upsert({
    usuario_id: userId,
    banco: data.banco,
    agencia: data.agencia,
    conta: data.conta,
    pix: data.pix,
    ctps: data.ctps,
    pis: data.pis,
    beneficiario_emergencia: data.beneficiario_emergencia,
  })
  if (detalhesError) throw detalhesError

  return userId
}

export async function checkHasPermission(_permissionName: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false
  return true
}

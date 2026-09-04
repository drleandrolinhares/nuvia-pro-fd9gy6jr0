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
    if (!data.cargo_id) {
      throw new Error(
        'O Cargo Principal é obrigatório. Selecione um cargo na aba "Profissional" antes de salvar.',
      )
    }

    // Ensure tenant_id is forwarded from the active session or data
    const sessionRes = await supabase.auth.getSession()
    const activeTenantId =
      data.tenant_id ||
      sessionRes.data.session?.user?.app_metadata?.tenant_id ||
      '00000000-0000-0000-0000-000000000001'

    const { data: edgeData, error: edgeError } = await supabase.functions.invoke('create-user', {
      body: {
        email: data.email,
        password: data.password,
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
        horario_entrada: data.horario_entrada || null,
        horario_saida: data.horario_saida || null,
        dias_trabalho: data.dias_trabalho || [1, 2, 3, 4, 5],
        obrigatorio_pp_pdm: data.obrigatorio_pp_pdm ?? false,
        obrigatorio_bonificacao: data.obrigatorio_bonificacao ?? false,
        possui_carteira: data.possui_carteira ?? true,
        exigir_rotina: data.exigir_rotina ?? true,
        elegivel_ferias: data.elegivel_ferias ?? false,
        acesso_chat: data.acesso_chat ?? true,
        pode_realizar_lancamento: data.pode_realizar_lancamento ?? false,
        banco: data.banco || null,
        agencia: data.agencia || null,
        conta: data.conta || null,
        pix: data.pix || null,
        ctps: data.ctps || null,
        pis: data.pis || null,
        dependentes: data.dependentes ?? 0,
        beneficiario_emergencia: data.beneficiario_emergencia || null,
        tenant_id: activeTenantId,
      },
    })

    if (edgeError) {
      let errorMsg = 'Erro ao criar usuário no servidor'
      try {
        if (edgeError.context) {
          const resp = edgeError.context.clone ? edgeError.context.clone() : edgeError.context
          const body = await resp.json()
          errorMsg = body.error || body.message || errorMsg
        } else {
          errorMsg = edgeError.message || errorMsg
        }
      } catch {
        errorMsg = edgeError.message || errorMsg
      }
      throw new Error(errorMsg)
    }
    if (edgeData?.error) throw new Error(edgeData.error)
    if (!edgeData?.user?.id)
      throw new Error('Resposta inválida do servidor: ID do usuário não retornado')

    userId = edgeData.user.id
    return userId
  }

  if (oldEmail && data.email !== oldEmail) {
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
    ...(data.tenant_id ? { tenant_id: data.tenant_id } : {}),
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
export async function checkHasPermission(permissionName: string) {
  const { data, error } = await supabase.rpc('has_permission', {
    permission_name: permissionName,
  })
  if (error) {
    console.error('[usuarios] Error checking permission:', error)
    return false
  }
  return !!data
}

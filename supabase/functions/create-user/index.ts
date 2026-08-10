import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Configuração do Supabase incompleta no servidor (URL ou ANON_KEY ausente)')
    }

    if (!serviceRoleKey) {
      throw new Error(
        'SUPABASE_SERVICE_ROLE_KEY não configurada no servidor. Contate o administrador.',
      )
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } },
    })

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      throw new Error('Não autorizado: usuário não autenticado')
    }

    const { data: hasPerm, error: permError } = await supabaseClient.rpc('has_permission', {
      permission_name: 'Gerenciar Colaboradores',
    })

    if (permError) {
      console.error('[create-user] Permission check error:', permError)
      throw new Error(`Erro ao verificar permissões: ${permError.message}`)
    }

    if (!hasPerm) {
      throw new Error('Sem permissão para criar usuários. Solicite acesso ao administrador.')
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    const body = await req.json()
    const {
      email,
      password,
      nome,
      cpf,
      data_nascimento,
      telefone,
      endereco,
      cargo_id,
      cargo_secundario_id,
      data_admissao,
      salario,
      status,
      horario_entrada,
      horario_saida,
      dias_trabalho,
      obrigatorio_pp_pdm,
      obrigatorio_bonificacao,
      possui_carteira,
      exigir_rotina,
      elegivel_ferias,
      acesso_chat,
      pode_realizar_lancamento,
      banco,
      agencia,
      conta,
      pix,
      ctps,
      pis,
      dependentes,
      beneficiario_emergencia,
    } = body

    if (!email || !password || !nome) {
      throw new Error('Campos obrigatórios não preenchidos (email, senha e nome são obrigatórios)')
    }

    if (password.length < 6) {
      throw new Error('A senha deve ter no mínimo 6 caracteres')
    }

    // 1. Create the user in Supabase Auth
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: nome },
    })

    if (authError) {
      const errMsg = authError.message.toLowerCase()
      if (
        errMsg.includes('already') ||
        errMsg.includes('exists') ||
        errMsg.includes('registered') ||
        errMsg.includes('duplicate')
      ) {
        throw new Error(
          `O e-mail "${email}" já está cadastrado no sistema. Utilize outro e-mail ou edite o usuário existente.`,
        )
      }
      throw new Error(authError.message)
    }

    const userId = authData.user.id

    // 2. Insert into public.usuarios using the same UUID
    // The trigger may have already inserted a minimal row — use upsert to update it with full data
    const { error: usuarioError } = await adminClient.from('usuarios').upsert(
      {
        id: userId,
        email,
        nome,
        cpf: cpf || null,
        data_nascimento: data_nascimento || null,
        telefone: telefone || null,
        endereco: endereco || null,
        cargo_id: cargo_id || null,
        cargo_secundario_id: cargo_secundario_id || null,
        data_admissao: data_admissao || null,
        salario: salario || null,
        status: status || 'ativo',
        role: 'user',
        horario_entrada: horario_entrada || null,
        horario_saida: horario_saida || null,
        dias_trabalho: dias_trabalho || [1, 2, 3, 4, 5],
        obrigatorio_pp_pdm: obrigatorio_pp_pdm ?? false,
        obrigatorio_bonificacao: obrigatorio_bonificacao ?? false,
        possui_carteira: possui_carteira ?? true,
        exigir_rotina: exigir_rotina ?? true,
        elegivel_ferias: elegivel_ferias ?? false,
        acesso_chat: acesso_chat ?? true,
        pode_realizar_lancamento: pode_realizar_lancamento ?? false,
      },
      { onConflict: 'id' },
    )

    if (usuarioError) {
      console.error('[create-user] Error inserting into usuarios:', usuarioError)
      // Try to clean up the auth user if the insert fails
      await adminClient.auth.admin.deleteUser(userId)
      throw new Error(`Erro ao cadastrar usuário: ${usuarioError.message}`)
    }

    // 3. Insert into public.colaboradores_detalhes when banking/payment data is provided
    if (banco || agencia || conta || pix || ctps || pis || beneficiario_emergencia) {
      const { error: detalhesError } = await adminClient.from('colaboradores_detalhes').upsert(
        {
          usuario_id: userId,
          banco: banco || null,
          agencia: agencia || null,
          conta: conta || null,
          pix: pix || null,
          ctps: ctps || null,
          pis: pis || null,
          dependentes: dependentes ?? 0,
          beneficiario_emergencia: beneficiario_emergencia || null,
        },
        { onConflict: 'usuario_id' },
      )

      if (detalhesError) {
        console.error('[create-user] Error inserting into colaboradores_detalhes:', detalhesError)
        throw new Error(`Erro ao salvar dados bancários: ${detalhesError.message}`)
      }
    }

    return new Response(JSON.stringify({ user: authData.user }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('[create-user] Error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

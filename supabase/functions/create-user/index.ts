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
    const { email, password, nome } = body

    if (!email || !password || !nome) {
      throw new Error('Campos obrigatórios não preenchidos (email, senha e nome são obrigatórios)')
    }

    if (password.length < 6) {
      throw new Error('A senha deve ter no mínimo 6 caracteres')
    }

    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: nome },
    })

    if (error) {
      const errMsg = error.message.toLowerCase()
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
      throw new Error(error.message)
    }

    return new Response(JSON.stringify({ user: data.user }), {
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

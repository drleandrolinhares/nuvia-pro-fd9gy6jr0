import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { usuario_id, tarefa_id, timestamp_cliente } = await req.json()

    if (!usuario_id || !tarefa_id || !timestamp_cliente) {
      throw new Error('Parâmetros faltando')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } },
    )

    const { data: tarefa, error: tarefaError } = await supabaseClient
      .from('tarefas_rotina')
      .select('horario_inicio, horario_fim')
      .eq('id', tarefa_id)
      .single()

    if (tarefaError || !tarefa) {
      throw new Error('Tarefa não encontrada')
    }

    // Assumindo fuso horário do Brasil (UTC-3) para a comparação correta
    const date = new Date(timestamp_cliente)
    const brtTime = new Date(date.getTime() - 3 * 60 * 60 * 1000)
    const currentHours = brtTime.getUTCHours()
    const currentMinutes = brtTime.getUTCMinutes()
    const currentTotalMinutes = currentHours * 60 + currentMinutes

    const [hInicio, mInicio] = tarefa.horario_inicio.split(':').map(Number)
    const inicioTotalMinutes = hInicio * 60 + mInicio

    const [hFim, mFim] = tarefa.horario_fim.split(':').map(Number)
    const fimTotalMinutes = hFim * 60 + mFim

    let valido = false
    if (inicioTotalMinutes <= fimTotalMinutes) {
      valido = currentTotalMinutes >= inicioTotalMinutes && currentTotalMinutes <= fimTotalMinutes
    } else {
      // Caso a tarefa cruze a meia-noite
      valido = currentTotalMinutes >= inicioTotalMinutes || currentTotalMinutes <= fimTotalMinutes
    }

    const hInicioStr = tarefa.horario_inicio.substring(0, 5)
    const hFimStr = tarefa.horario_fim.substring(0, 5)

    let mensagem = 'Tarefa marcada com sucesso'
    if (!valido) {
      mensagem = `Fora do horário permitido. Horário permitido: ${hInicioStr} - ${hFimStr}`
    }

    // Registra a tentativa de auditoria (falhas não impedem o retorno da função)
    try {
      await supabaseClient.from('auditoria_tarefas_rotina').insert({
        usuario_id,
        tarefa_id,
        timestamp_cliente,
        valido,
        mensagem,
      })
    } catch (e) {
      console.error('Erro ao salvar log de auditoria', e)
    }

    return new Response(JSON.stringify({ valido, mensagem }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

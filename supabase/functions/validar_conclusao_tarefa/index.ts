import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

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
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
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
    const brtTime = new Date(date.getTime() - (3 * 60 * 60 * 1000))
    const currentHours = brtTime.getUTCHours()
    const currentMinutes = brtTime.getUTCMinutes()
    const currentTotalMinutes = currentHours * 60 + currentMinutes

    let valido = false
    let mensagem = "Tarefa marcada com sucesso"

    if (!tarefa.horario_inicio) {
      valido = true
      mensagem = "Tarefa sob demanda concluída"
    } else {
      const [hInicio, mInicio] = tarefa.horario_inicio.split(':').map(Number)
      const inicioTotalMinutes = hInicio * 60 + mInicio
      const inicioComTolerancia = inicioTotalMinutes - 5 // 5 minutos de antecedência
      const hInicioStr = tarefa.horario_inicio.substring(0, 5)

      const [hFim, mFim] = tarefa.horario_fim ? tarefa.horario_fim.split(':').map(Number) : [0, 0]
      // O sistema agora permite conclusão a qualquer momento após o horário de início (com tolerância de 5 min)
      // Não bloqueia mais tarefas concluídas após o horário final. O cálculo de criticidade cuidará de indicar atrasos.

      // Avalia se cruza meia-noite (ex: 22:00 às 02:00)
      const cruzaMeiaNoite = tarefa.horario_fim && (hFim * 60 + mFim) < (hInicio * 60 + mInicio);

      if (cruzaMeiaNoite) {
        const fimTotalMinutes = hFim * 60 + mFim;
        if (currentTotalMinutes <= fimTotalMinutes || currentTotalMinutes >= inicioComTolerancia) {
          valido = true;
        } else {
          valido = false;
        }
      } else {
        if (currentTotalMinutes >= inicioComTolerancia) {
          valido = true;
        } else {
          valido = false;
        }
      }

      if (!valido) {
        mensagem = `Muito cedo para concluir. Horário permitido: a partir de ${hInicioStr}`
      }
    }

    // Registra a tentativa de auditoria (falhas não impedem o retorno da função)
    try {
      await supabaseClient.from('auditoria_tarefas_rotina').insert({
        usuario_id,
        tarefa_id,
        timestamp_cliente,
        valido,
        mensagem
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

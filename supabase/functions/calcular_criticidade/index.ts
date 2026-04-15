import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { tarefa_id, horario_fim, timestamp_conclusao } = await req.json()

    if (!timestamp_conclusao) {
      return new Response(
        JSON.stringify({
          minutos_atrasado: 0,
          nivel_criticidade: 'nao_concluida',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
      )
    }

    const concluidaEm = new Date(timestamp_conclusao)
    const [h, m] = horario_fim.split(':').map(Number)

    const prazo = new Date(concluidaEm)
    prazo.setHours(h, m, 0, 0)

    let minutos_atrasado = Math.floor((concluidaEm.getTime() - prazo.getTime()) / 60000)

    if (minutos_atrasado <= 0) {
      minutos_atrasado = 0
    }

    let nivel_criticidade = 'no_horario'
    if (minutos_atrasado > 0 && minutos_atrasado <= 60) {
      nivel_criticidade = 'tolerancia'
    } else if (minutos_atrasado > 60) {
      nivel_criticidade = 'critico'
    }

    return new Response(
      JSON.stringify({
        minutos_atrasado,
        nivel_criticidade,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

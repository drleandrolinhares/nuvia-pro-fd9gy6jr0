import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

Deno.serve(async (req: Request) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  }

  try {
    console.info('Recebendo requisição...')

    const body = await req.text()
    console.info(`Body: ${body}`)

    if (!body) {
      return new Response(JSON.stringify({ success: false, error: 'Body vazio' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { valorTotal, percentual } = JSON.parse(body)

    if (!valorTotal || !percentual) {
      return new Response(JSON.stringify({ success: false, error: 'Parâmetros faltando' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const valorEntrada = (valorTotal * percentual) / 100

    console.info(`Cálculo: ${valorTotal} * ${percentual}% = ${valorEntrada}`)

    return new Response(
      JSON.stringify({
        success: true,
        valorEntrada: parseFloat(valorEntrada.toFixed(2)),
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    )
  } catch (error) {
    console.error(`Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
})

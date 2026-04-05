import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

export const corsHeaders = {
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } },
    )

    const body = await req.json()
    const { valor_tratamento, percentual_entrada_padrao } = body

    if (valor_tratamento === undefined || percentual_entrada_padrao === undefined) {
      throw new Error('Missing valor_tratamento or percentual_entrada_padrao')
    }

    const valorTratamentoNum = Number(valor_tratamento)
    const percentualEntradaNum = Number(percentual_entrada_padrao)

    const valor_entrada = (valorTratamentoNum * percentualEntradaNum) / 100
    const valor_restante = valorTratamentoNum - valor_entrada

    // Fetch value ranges to determine max installments
    const { data: faixas, error: faixasError } = await supabaseClient
      .from('faixas_valores_parcelas')
      .select('*')

    if (faixasError) throw faixasError

    let max_parcelas = 1
    if (faixas && faixas.length > 0) {
      const faixaEncontrada = faixas.find(
        (f) =>
          valorTratamentoNum >= Number(f.valor_minimo) &&
          valorTratamentoNum <= Number(f.valor_maximo),
      )
      if (faixaEncontrada) {
        max_parcelas = faixaEncontrada.max_parcelas
      } else {
        const faixasOrdenadas = [...faixas].sort(
          (a, b) => Number(b.valor_maximo) - Number(a.valor_maximo),
        )
        if (
          faixasOrdenadas.length > 0 &&
          valorTratamentoNum > Number(faixasOrdenadas[0].valor_maximo)
        ) {
          max_parcelas = faixasOrdenadas[0].max_parcelas
        }
      }
    }

    // Fetch discounts
    const { data: descontos, error: descontosError } = await supabaseClient
      .from('descontos_por_prazo')
      .select('*')

    if (descontosError) throw descontosError

    const opcoes_parcelamento = []

    for (let i = 1; i <= max_parcelas; i++) {
      let faixa_numero = 4
      if (i === 1) faixa_numero = 1
      else if (i >= 2 && i <= 5) faixa_numero = 2
      else if (i >= 6 && i <= 9) faixa_numero = 3
      else faixa_numero = 4

      const descontoObj = descontos?.find((d) => d.faixa_numero === faixa_numero)
      const percentual_desconto = descontoObj ? Number(descontoObj.percentual_desconto) : 0

      const valor_desconto = (valor_restante * percentual_desconto) / 100
      const valor_final_restante = valor_restante - valor_desconto
      const valor_parcela = valor_final_restante / i

      opcoes_parcelamento.push({
        parcelas: i,
        faixa_aplicada: faixa_numero,
        percentual_desconto,
        valor_desconto,
        valor_final_restante,
        valor_parcela,
        valor_total_com_desconto: valor_entrada + valor_final_restante,
      })
    }

    return new Response(
      JSON.stringify({
        valor_tratamento: valorTratamentoNum,
        percentual_entrada_padrao: percentualEntradaNum,
        valor_entrada,
        valor_restante,
        max_parcelas,
        opcoes_parcelamento,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

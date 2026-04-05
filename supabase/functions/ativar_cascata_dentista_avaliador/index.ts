import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)

    const payload = await req.json()

    // O Webhook do Supabase envia o payload com a propriedade "type" (INSERT, UPDATE) e "record"
    if (payload.type === 'INSERT' || payload.type === 'UPDATE') {
      const record = payload.record
      if (!record || !record.id) {
        throw new Error('Record não encontrado no payload do webhook')
      }

      const { id: usuario_id, nome, email, cargo_id, status } = record

      if (cargo_id) {
        // Busca os detalhes do cargo para verificar o nome
        const { data: cargo, error: cargoError } = await supabaseClient
          .from('cargos')
          .select('nome')
          .eq('id', cargo_id)
          .single()

        if (cargoError) throw cargoError

        if (cargo && cargo.nome === 'Dentista Avaliador') {
          // Verifica se o dentista avaliador já existe na tabela destino
          const { data: existing } = await supabaseClient
            .from('dentistas_avaliadores')
            .select('id')
            .eq('usuario_id', usuario_id)
            .maybeSingle()

          if (!existing) {
            await supabaseClient.from('dentistas_avaliadores').insert({
              usuario_id,
              nome,
              email,
              status: status || 'ativo',
            })
          } else {
            await supabaseClient
              .from('dentistas_avaliadores')
              .update({
                nome,
                email,
                status: status || 'ativo',
              })
              .eq('usuario_id', usuario_id)
          }
        }

        if (cargo && cargo.nome === 'Dentista') {
          const { data: existing } = await supabaseClient
            .from('dentistas')
            .select('id')
            .eq('usuario_id', usuario_id)
            .maybeSingle()

          if (!existing) {
            await supabaseClient.from('dentistas').insert({
              usuario_id,
              nome,
              email,
              status: status || 'ativo',
            })
          } else {
            await supabaseClient
              .from('dentistas')
              .update({
                nome,
                email,
                status: status || 'ativo',
              })
              .eq('usuario_id', usuario_id)
          }
        }

        if (cargo && (cargo.nome === 'CRC' || cargo.nome === 'CRC Comercial')) {
          const { data: existing } = await supabaseClient
            .from('crc_comercial')
            .select('id')
            .eq('usuario_id', usuario_id)
            .maybeSingle()

          if (!existing) {
            await supabaseClient.from('crc_comercial').insert({
              usuario_id,
              nome,
              email,
              status: status || 'ativo',
            })
          } else {
            await supabaseClient
              .from('crc_comercial')
              .update({
                nome,
                email,
                status: status || 'ativo',
              })
              .eq('usuario_id', usuario_id)
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Cascata processada com sucesso' }),
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

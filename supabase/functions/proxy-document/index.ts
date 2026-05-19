import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const targetUrl = url.searchParams.get('url')

    if (!targetUrl) {
      throw new Error('URL parameter is missing')
    }

    const response = await fetch(targetUrl)

    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${response.statusText}`)
    }

    let contentType = response.headers.get('content-type') || 'application/octet-stream'

    // Força o tipo de conteúdo para PDF se a URL indicar que é um PDF
    if (targetUrl.toLowerCase().includes('.pdf')) {
      contentType = 'application/pdf'
    }

    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Content-Disposition': 'inline', // Força a exibição inline (na página) em vez de download
        'X-Frame-Options': 'ALLOWALL', // Permite o uso em iframes
        'Content-Security-Policy': 'frame-ancestors *;',
      },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

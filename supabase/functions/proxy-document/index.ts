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
    const url = new URL(req.url)
    const targetUrl = url.searchParams.get('url')

    if (!targetUrl) {
      throw new Error('URL parameter is missing')
    }

    // Proteção contra SSRF: apenas http(s) e nunca destinos internos/privados
    const target = new URL(targetUrl)

    if (target.protocol !== 'http:' && target.protocol !== 'https:') {
      throw new Error('Unsupported URL protocol')
    }

    const host = target.hostname.toLowerCase()
    const isBlockedHost =
      host === 'localhost' ||
      host === '0.0.0.0' ||
      host === '[::1]' ||
      host === '::1' ||
      host.endsWith('.localhost') ||
      host.endsWith('.internal') ||
      host.endsWith('.local') ||
      /^127\./.test(host) ||
      /^10\./.test(host) ||
      /^192\.168\./.test(host) ||
      /^169\.254\./.test(host) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(host)

    if (isBlockedHost) {
      throw new Error('URL not allowed')
    }

    const response = await fetch(target.toString(), { redirect: 'follow' })

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

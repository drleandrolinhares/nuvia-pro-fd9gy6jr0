import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  })

function normalizar(t: string | undefined): string {
  return String(t || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/\s*\(.*$/, '')
    .replace(/\s*-\s*(SBS|SBS-GM|FET|LS|GM).*$/, '')
    .trim()
}

function nomeLimpo(t: string | undefined): string {
  return String(t || '')
    .replace(/\s*\([0-9]+\)\s*$/, '')
    .replace(/\s*\((?:SBS(?:-GM)?|FET|LS|GM)\)\s*/g, ' ')
    .replace(/\s*-\s*(?:SBS(?:-GM)?|FET|LS|GM)\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function dataRef(x: any): string {
  return String(x.Date || x.CreateDate || '').slice(0, 10)
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const auth = req.headers.get('Authorization') || ''
    if (!auth.startsWith('Bearer ')) return json({ error: 'Nao autenticado' }, 401)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_PUBLISHABLE_KEY') || ''
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const comoUsuario = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: auth } },
      auth: { persistSession: false },
    })
    const { data: quem, error: erroAuth } = await comoUsuario.auth.getUser()
    if (erroAuth || !quem?.user) return json({ error: 'Sessao invalida' }, 401)

    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

    let ehAdmin = false
    let lista: string[] = []
    try {
      const rAdmin = await comoUsuario.rpc('is_admin')
      ehAdmin = rAdmin.data === true
      const { data: perms } = await comoUsuario.rpc('get_user_permissions', { p_user_id: quem.user.id })
      lista = Array.isArray(perms)
        ? perms.map((p: any) => (typeof p === 'string' ? p : (p?.permission ?? p?.nome ?? '')))
        : []
    } catch (_e) {
      ehAdmin = false
    }

    if (!ehAdmin) {
      const { data: u } = await admin
        .from('usuarios')
        .select('role, cargo_id, cargos:cargo_id(nome)')
        .eq('id', quem.user.id)
        .maybeSingle()
      const cargo = String((u as any)?.cargos?.nome || '').toLowerCase()
      const role = String((u as any)?.role || '').toLowerCase()
      const gabarito = ['admin', 'administrador', 'ceo', 'diretoria', 'diretor', 'gestor', 'master']
      if (gabarito.includes(role) || gabarito.includes(cargo)) ehAdmin = true
    }

    if (!ehAdmin && !lista.some((p) => /gest[aã]o de vendas/i.test(p))) {
      return json({ error: 'Sem permissao para atualizar vendas', _diag: { ehAdmin, permissoes: lista.length } }, 403)
    }

    const corpo = await req.json().catch(() => ({}) as any)
    const hoje = new Date()
    const mesRef: string =
      typeof (corpo as any)?.mes === 'string' && /^\d{4}-\d{2}$/.test((corpo as any).mes)
        ? (corpo as any).mes
        : `${hoje.getUTCFullYear()}-${String(hoje.getUTCMonth() + 1).padStart(2, '0')}`
    const [ano, mes] = mesRef.split('-').map(Number)
    const de = `${mesRef}-01`
    const ate = `${mesRef}-${String(new Date(Date.UTC(ano, mes, 0)).getUTCDate()).padStart(2, '0')}`

    const { data: cfg } = await admin
      .from('clinicorp_credencial')
      .select('usuario, token')
      .eq('ativo', true)
      .maybeSingle()
    if (!cfg?.usuario || !cfg?.token) {
      return json({ error: 'Credencial do Clinicorp nao configurada' }, 500)
    }
    const basic = btoa(`${cfg.usuario}:${cfg.token}`)

    const qs = new URLSearchParams({ subscriber_id: cfg.usuario, from: de, to: ate })
    const res = await fetch(`https://api.clinicorp.com/rest/v1/estimates/list?${qs}`, {
      headers: { Authorization: `Basic ${basic}`, Accept: 'application/json' },
    })
    if (!res.ok) {
      return json({ error: `Clinicorp recusou a consulta (HTTP ${res.status})` }, 502)
    }
    const brutos: any[] = await res.json()

    const abertos = brutos.filter((x) => x.Status === 'OPEN' && Number(x.Amount) > 0)
    const porPacienteDia = new Map<string, any>()
    const descartados: any[] = []
    for (const x of abertos) {
      const chave = `${x.PatientId}|${dataRef(x)}`
      const atual = porPacienteDia.get(chave)
      if (!atual) porPacienteDia.set(chave, x)
      else if (Number(x.Amount) > Number(atual.Amount)) {
        descartados.push({ paciente: nomeLimpo(atual.PatientName), data: dataRef(atual), valor: Number(atual.Amount) })
        porPacienteDia.set(chave, x)
      } else {
        descartados.push({ paciente: nomeLimpo(x.PatientName), data: dataRef(x), valor: Number(x.Amount) })
      }
    }
    const manter = [...porPacienteDia.values()]

    const { data: pacientes } = await admin.from('pacientes').select('id, nome')
    const indice = new Map<string, string>()
    for (const p of pacientes || []) indice.set(normalizar(p.nome), p.id)

    const agora = new Date().toISOString()
    const importadas: string[] = []
    const atualizadas: string[] = []
    const erros: string[] = []

    for (const x of manter) {
      const tid = Number(x.TreatmentId)
      const nome = nomeLimpo(x.PatientName)
      const valor = Number(x.Amount)
      const data = dataRef(x)

      const { data: existente } = await admin
        .from('avaliacoes')
        .select('id')
        .eq('clinicorp_treatment_id', tid)
        .maybeSingle()
      if (existente?.id) {
        const { error } = await admin
          .from('avaliacoes')
          .update({ valor_orcamento: valor, atualizado_em: agora })
          .eq('id', existente.id)
        if (error) erros.push(`${nome}: ${error.message}`)
        else atualizadas.push(nome)
        continue
      }

      let pacienteId = indice.get(normalizar(x.PatientName)) || null
      if (pacienteId) {
        const { data: jaExiste } = await admin
          .from('avaliacoes')
          .select('id')
          .eq('paciente_id', pacienteId)
          .eq('data_avaliacao', data)
          .eq('status', 'avaliacao_realizada')
          .is('clinicorp_treatment_id', null)
          .maybeSingle()
        if (jaExiste?.id) {
          const { error } = await admin
            .from('avaliacoes')
            .update({ clinicorp_treatment_id: tid, valor_orcamento: valor, atualizado_em: agora })
            .eq('id', jaExiste.id)
          if (error) erros.push(`${nome}: ${error.message}`)
          else atualizadas.push(nome)
          continue
        }
      } else {
        const { data: novo, error: e1 } = await admin
          .from('pacientes')
          .insert({ nome })
          .select('id')
          .single()
        if (e1 || !novo) {
          erros.push(`${nome}: nao foi possivel criar o paciente`)
          continue
        }
        pacienteId = novo.id
        indice.set(normalizar(x.PatientName), novo.id)
      }

      const { error } = await admin.from('avaliacoes').insert({
        paciente_id: pacienteId,
        data_avaliacao: data,
        valor_orcamento: valor,
        status: 'avaliacao_realizada',
        observacoes: 'Importado do Clinicorp',
        clinicorp_treatment_id: tid,
        criado_em: agora,
        atualizado_em: agora,
      })
      if (error) erros.push(`${nome}: ${error.message}`)
      else importadas.push(nome)
    }

    await admin.from('clinicorp_sincronizacao').insert({
      mes_referencia: mesRef,
      executado_em: agora,
      executado_por: quem.user.id,
      brutos: brutos.length,
      com_valor: abertos.length,
      importadas: importadas.length,
      atualizadas: atualizadas.length,
      descartadas_dedup: descartados.length,
      erros: erros.length,
      detalhe: { descartados, erros: erros.slice(0, 20) },
    })

    const total = manter.reduce((s, x) => s + Number(x.Amount), 0)

    return json({
      ok: true,
      mes: mesRef,
      periodo: { de, ate },
      abertos_clinicorp: abertos.length,
      importadas: importadas.length,
      atualizadas: atualizadas.length,
      deduplicadas: descartados.length,
      descartados,
      aberto_qtd: manter.length,
      aberto_valor: Number(total.toFixed(2)),
      erros,
      executado_em: agora,
    })
  } catch (erro: any) {
    return json({ error: erro?.message || 'Falha ao sincronizar' }, 400)
  }
})

import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

export type Lead = Database['public']['Tables']['funil_leads']['Row']
export type Etapa = Database['public']['Tables']['funil_etapas']['Row']

export const getEtapas = async () => {
  const { data, error } = await supabase
    .from('funil_etapas')
    .select('*')
    .eq('ativo', true)
    .order('ordem')

  if (error) throw error
  return data as Etapa[]
}

export const getLeads = async (searchQuery?: string) => {
  let query = supabase.from('funil_leads').select('*').order('criado_em', { ascending: false })

  if (searchQuery && searchQuery.trim().length > 0) {
    query = query.ilike('nome', `%${searchQuery.trim()}%`)
  } else {
    // Return a reasonable number to avoid heavy load when not searching
    query = query.limit(500)
  }

  const { data, error } = await query

  if (error) throw error
  return data as Lead[]
}

export type TimelineItem = {
  id: string
  type: 'historico' | 'nota' | 'compromisso'
  date: string
  title: string
  description?: string
  authorName?: string
  iconType?: string
}

export const getLeadTimeline = async (leadId: string): Promise<TimelineItem[]> => {
  const [histRes, notasRes, compRes] = await Promise.all([
    supabase
      .from('funil_leads_historico')
      .select('*, usuario:usuarios(nome)')
      .eq('lead_id', leadId),
    supabase.from('funil_leads_notas').select('*, usuario:usuarios(nome)').eq('lead_id', leadId),
    supabase.from('compromissos').select('*, usuario:usuarios(nome)').eq('lead_id', leadId),
  ])

  const timeline: TimelineItem[] = []

  if (histRes.data) {
    histRes.data.forEach((h: any) => {
      timeline.push({
        id: h.id,
        type: 'historico',
        date: h.criado_em,
        title: h.acao,
        description: h.detalhes,
        authorName: h.usuario?.nome,
        iconType: 'activity',
      })
    })
  }

  if (notasRes.data) {
    notasRes.data.forEach((n: any) => {
      timeline.push({
        id: n.id,
        type: 'nota',
        date: n.criado_em,
        title: 'Nota Adicionada',
        description: n.nota,
        authorName: n.usuario?.nome,
        iconType: 'message',
      })
    })
  }

  if (compRes.data) {
    compRes.data.forEach((c: any) => {
      // Only show completed appointments or ones with a specific result
      if (c.resultado_acao || c.concluido_em) {
        timeline.push({
          id: c.id,
          type: 'compromisso',
          date: c.concluido_em || c.criado_em,
          title: `Compromisso: ${c.tipo_compromisso.replace('_', ' ')}`,
          description: c.resultado_acao || 'Compromisso concluído',
          authorName: c.usuario?.nome,
          iconType: 'calendar',
        })
      }
    })
  }

  // Sort descending (newest first)
  return timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

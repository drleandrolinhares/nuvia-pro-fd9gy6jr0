import { supabase } from '@/lib/supabase/client'

/* ============================================================================
 * MANUTENÇÕES — camada de dados
 *
 * Referências usadas no desenho (pesquisa de 23/11/2026):
 *  - CMMS de mercado (MaintainX, Limble, Fiix, UpKeep): ativo → plano preventivo
 *    → ordem de serviço → custo; MTBF/MTTR e aderência à preventiva como
 *    indicadores centrais.
 *  - Clínica odontológica: RDC Anvisa 1.002/2025 (teste biológico semanal e
 *    Bowie & Dick diário na autoclave, levantamento radiométrico a cada 4 anos),
 *    PMOC/Lei 13.589/2018 para ar-condicionado.
 *  - Gestão: custo por setor e por ativo, série mensal, alertas de preventiva.
 * ========================================================================== */

export type Categoria =
  | 'Ar-condicionado'
  | 'Informática'
  | 'Odontológico'
  | 'Imagem (Raio-X)'
  | 'Esterilização'
  | 'Compressor/Vácuo'
  | 'Elétrica'
  | 'Hidráulica'
  | 'Estrutura física'
  | 'Mobiliário'
  | 'Telefonia'
  | 'Segurança'
  | 'Outros'

export const CATEGORIAS: Categoria[] = [
  'Ar-condicionado',
  'Informática',
  'Odontológico',
  'Imagem (Raio-X)',
  'Esterilização',
  'Compressor/Vácuo',
  'Elétrica',
  'Hidráulica',
  'Estrutura física',
  'Mobiliário',
  'Telefonia',
  'Segurança',
  'Outros',
]

export type TipoOrdem = 'preventiva' | 'corretiva' | 'preditiva' | 'melhoria'
export type StatusOrdem = 'aberta' | 'agendada' | 'em_execucao' | 'concluida' | 'cancelada'
export type Prioridade = 'urgente' | 'alta' | 'media' | 'baixa'
export type Criticidade = 'alta' | 'media' | 'baixa'
export type StatusAtivo = 'operando' | 'parado' | 'em_manutencao' | 'baixado'
export type TipoSetor = 'clinico' | 'comum' | 'administrativo' | 'tecnico'

export interface Setor {
  id: string
  nome: string
  tipo: TipoSetor
  andar?: string | null
  observacoes?: string | null
  ativo: boolean
  ordem: number
  qtd_ativos?: number
  qtd_ordens?: number
}

export interface Ativo {
  id: string
  codigo?: string | null
  nome: string
  categoria: Categoria
  setor_id?: string | null
  marca?: string | null
  modelo?: string | null
  numero_serie?: string | null
  data_aquisicao?: string | null
  valor_aquisicao?: number | null
  vida_util_meses?: number | null
  criticidade: Criticidade
  status: StatusAtivo
  frequencia_preventiva_dias?: number | null
  ultima_preventiva?: string | null
  proxima_preventiva?: string | null
  fornecedor_id?: string | null
  observacoes?: string | null
  ativo: boolean
  setor_nome?: string | null
}

export interface Ordem {
  id: string
  numero?: number
  ativo_id: string
  ativo_nome?: string | null
  ativo_categoria?: string | null
  setor_id?: string | null
  setor_nome?: string | null
  tipo: TipoOrdem
  origem: string
  prioridade: Prioridade
  status: StatusOrdem
  descricao_problema?: string | null
  descricao_servico?: string | null
  data_abertura: string
  data_agendada?: string | null
  data_execucao?: string | null
  data_conclusao?: string | null
  valor_mao_obra?: number | null
  valor_pecas?: number | null
  valor_total?: number | null
  forma_pagamento?: string | null
  data_pagamento?: string | null
  pago: boolean
  fornecedor_id?: string | null
  fornecedor_nome?: string | null
  executado_por?: string | null
  documento_nf?: string | null
  tem_garantia: boolean
  garantia_ate?: string | null
  gerou_proxima?: string | null
  observacoes?: string | null
}

export interface Fornecedor {
  id: string
  nome: string
  tipo?: string | null
  cnpj_cpf?: string | null
  telefone?: string | null
  email?: string | null
  contato?: string | null
  especialidades?: string[] | null
  avaliacao?: number | null
  ativo: boolean
}

const num = (v: any) => (v == null ? null : Number(v))

export async function listarSetores(): Promise<Setor[]> {
  const { data, error } = await supabase
    .from('manut_setores')
    .select('id,nome,tipo,andar,observacoes,ativo,ordem')
    .order('ordem')
    .order('nome')
  if (error) throw error
  return (data || []) as Setor[]
}

export async function salvarSetor(s: Partial<Setor>): Promise<void> {
  const { id, ...rest } = s as any
  if (id) {
    const { error } = await supabase.from('manut_setores').update(rest).eq('id', id)
    if (error) throw error
  } else {
    const { error } = await supabase.from('manut_setores').insert(rest)
    if (error) throw error
  }
}

/** Exclui um setor. Bloqueia se houver equipamento ou ordem vinculada — nesse caso, desative. */
export async function excluirSetor(id: string): Promise<void> {
  const { count: nAtivos } = await supabase
    .from('manut_ativos')
    .select('id', { count: 'exact', head: true })
    .eq('setor_id', id)
  if ((nAtivos ?? 0) > 0) {
    throw new Error(
      `Este setor tem ${nAtivos} equipamento(s) vinculado(s). Mova-os para outro setor antes de excluir — ou apenas desative.`,
    )
  }
  const { count: nOrdens } = await supabase
    .from('manut_ordens')
    .select('id', { count: 'exact', head: true })
    .eq('setor_id', id)
  if ((nOrdens ?? 0) > 0) {
    throw new Error(
      `Este setor tem ${nOrdens} ordem(ns) no histórico. Para não perder o histórico, apenas desative.`,
    )
  }
  const { error } = await supabase.from('manut_setores').delete().eq('id', id)
  if (error) throw error
}

/** Reordena os setores na ordem em que vierem no array. */
export async function reordenarSetores(ids: string[]): Promise<void> {
  await Promise.all(
    ids.map((id, i) =>
      supabase
        .from('manut_setores')
        .update({ ordem: i + 1 })
        .eq('id', id),
    ),
  )
}

export async function listarAtivos(): Promise<Ativo[]> {
  const { data, error } = await supabase
    .from('manut_ativos')
    .select('*, manut_setores(nome)')
    .eq('ativo', true)
    .order('nome')
  if (error) throw error
  return (data || []).map((a: any) => ({
    ...a,
    valor_aquisicao: num(a.valor_aquisicao),
    setor_nome: a.manut_setores?.nome ?? null,
  })) as Ativo[]
}

export async function salvarAtivo(a: Partial<Ativo>): Promise<void> {
  const { manut_setores, setor_nome, id, ...rest } = a as any
  void manut_setores
  void setor_nome
  // próxima preventiva derivada da última + frequência
  if (rest.frequencia_preventiva_dias && rest.ultima_preventiva) {
    const d = new Date(rest.ultima_preventiva + 'T12:00:00')
    d.setDate(d.getDate() + Number(rest.frequencia_preventiva_dias))
    rest.proxima_preventiva = d.toISOString().slice(0, 10)
  }
  if (id) {
    const { error } = await supabase.from('manut_ativos').update(rest).eq('id', id)
    if (error) throw error
  } else {
    const { error } = await supabase.from('manut_ativos').insert(rest)
    if (error) throw error
  }
}

export async function listarOrdens(limite = 400): Promise<Ordem[]> {
  const { data, error } = await supabase
    .from('manut_ordens')
    .select('*, manut_ativos(nome,categoria), manut_setores(nome), manut_fornecedores(nome)')
    .order('data_abertura', { ascending: false })
    .order('criado_em', { ascending: false })
    .limit(limite)
  if (error) throw error
  return (data || []).map((o: any) => ({
    ...o,
    ativo_nome: o.manut_ativos?.nome ?? null,
    ativo_categoria: o.manut_ativos?.categoria ?? null,
    setor_nome: o.manut_setores?.nome ?? null,
    fornecedor_nome: o.manut_fornecedores?.nome ?? null,
  })) as Ordem[]
}

export async function salvarOrdem(o: Partial<Ordem>): Promise<void> {
  const { manut_ativos, manut_setores, manut_fornecedores, id, ...rest } = o as any
  void manut_ativos
  void manut_setores
  void manut_fornecedores
  void rest.ativo_nome
  void rest.ativo_categoria
  void rest.setor_nome
  void rest.fornecedor_nome
  if (id) {
    const { error } = await supabase.from('manut_ordens').update(rest).eq('id', id)
    if (error) throw error
  } else {
    const { error } = await supabase.from('manut_ordens').insert(rest)
    if (error) throw error
  }
}

export async function excluirOrdem(id: string): Promise<void> {
  const { error } = await supabase.from('manut_ordens').delete().eq('id', id)
  if (error) throw error
}

export async function listarFornecedores(): Promise<Fornecedor[]> {
  const { data, error } = await supabase
    .from('manut_fornecedores')
    .select('*')
    .eq('ativo', true)
    .order('nome')
  if (error) throw error
  return (data || []) as Fornecedor[]
}

export async function salvarFornecedor(f: Partial<Fornecedor>): Promise<void> {
  const { id, ...rest } = f
  if (id) {
    const { error } = await supabase.from('manut_fornecedores').update(rest).eq('id', id)
    if (error) throw error
  } else {
    const { error } = await supabase.from('manut_fornecedores').insert(rest)
    if (error) throw error
  }
}

export interface Kpis {
  ordens_total: number
  ordens_preventiva: number
  ordens_corretiva: number
  custo_total: number
  custo_preventiva: number
  custo_corretiva: number
  custo_medio_ordem: number
  ativos_total: number
  ativos_criticos: number
  preventivas_atrasadas: number
  preventivas_30d: number
  mttr_dias: number
  aderencia_preventiva: number
}

export async function kpis(inicio: string, fim: string): Promise<Kpis> {
  const { data, error } = await supabase.rpc('manut_kpis', { p_inicio: inicio, p_fim: fim })
  if (error) throw error
  const r: any = Array.isArray(data) ? data[0] : data
  return {
    ordens_total: Number(r?.ordens_total) || 0,
    ordens_preventiva: Number(r?.ordens_preventiva) || 0,
    ordens_corretiva: Number(r?.ordens_corretiva) || 0,
    custo_total: Number(r?.custo_total) || 0,
    custo_preventiva: Number(r?.custo_preventiva) || 0,
    custo_corretiva: Number(r?.custo_corretiva) || 0,
    custo_medio_ordem: Number(r?.custo_medio_ordem) || 0,
    ativos_total: Number(r?.ativos_total) || 0,
    ativos_criticos: Number(r?.ativos_criticos) || 0,
    preventivas_atrasadas: Number(r?.preventivas_atrasadas) || 0,
    preventivas_30d: Number(r?.preventivas_30d) || 0,
    mttr_dias: Number(r?.mttr_dias) || 0,
    aderencia_preventiva: Number(r?.aderencia_preventiva) || 0,
  }
}

export async function custoPorSetor(inicio: string, fim: string) {
  const { data, error } = await supabase.rpc('manut_custo_por_setor', {
    p_inicio: inicio,
    p_fim: fim,
  })
  if (error) throw error
  return (data || []).map((r: any) => ({
    setor: r.setor as string,
    tipo_setor: r.tipo_setor as string,
    ordens: Number(r.ordens) || 0,
    custo: Number(r.custo) || 0,
    custo_corretiva: Number(r.custo_corretiva) || 0,
    custo_preventiva: Number(r.custo_preventiva) || 0,
  }))
}

export async function custoPorAtivo(inicio: string, fim: string) {
  const { data, error } = await supabase.rpc('manut_custo_por_ativo', {
    p_inicio: inicio,
    p_fim: fim,
  })
  if (error) throw error
  return (data || []).map((r: any) => ({
    ativo: r.ativo as string,
    categoria: r.categoria as string,
    setor: r.setor as string,
    ordens: Number(r.ordens) || 0,
    corretivas: Number(r.corretivas) || 0,
    custo: Number(r.custo) || 0,
    ultima_manutencao: r.ultima_manutencao as string | null,
    media_intervalo_dias: num(r.media_intervalo_dias),
  }))
}

export async function serieMensal(meses = 12) {
  const { data, error } = await supabase.rpc('manut_serie_mensal', { p_meses: meses })
  if (error) throw error
  return (data || []).map((r: any) => ({
    mes: r.mes as string,
    ordens: Number(r.ordens) || 0,
    custo: Number(r.custo) || 0,
    corretivas: Number(r.corretivas) || 0,
    preventivas: Number(r.preventivas) || 0,
  }))
}

export async function alertas() {
  const { data, error } = await supabase.rpc('manut_alertas')
  if (error) throw error
  return (data || []).map((r: any) => ({
    tipo: r.tipo as string,
    ativo: r.ativo as string,
    setor: r.setor as string,
    data: r.data as string | null,
    dias: num(r.dias),
    prioridade: r.prioridade as string,
  }))
}

export async function planosReferencia() {
  const { data, error } = await supabase
    .from('manut_planos_referencia')
    .select('*')
    .order('categoria')
  if (error) throw error
  return data || []
}

export const fmtBRL = (v: number | null | undefined) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v) || 0)

export const fmtData = (d?: string | null) => {
  if (!d) return '—'
  const [y, m, day] = d.substring(0, 10).split('-')
  return `${day}/${m}/${y}`
}

export const diasAte = (d?: string | null) => {
  if (!d) return null
  const alvo = new Date(d.substring(0, 10) + 'T12:00:00')
  const hoje = new Date()
  hoje.setHours(12, 0, 0, 0)
  return Math.round((alvo.getTime() - hoje.getTime()) / 86400000)
}

export const ROTULO_TIPO: Record<string, string> = {
  preventiva: 'Preventiva',
  corretiva: 'Corretiva',
  preditiva: 'Preditiva',
  melhoria: 'Melhoria',
}

export const ROTULO_STATUS: Record<string, string> = {
  aberta: 'Aberta',
  agendada: 'Agendada',
  em_execucao: 'Em execução',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
}

export const ROTULO_PRIORIDADE: Record<string, string> = {
  urgente: 'Urgente',
  alta: 'Alta',
  media: 'Média',
  baixa: 'Baixa',
}

export const ROTULO_SETOR: Record<string, string> = {
  clinico: 'Clínico',
  tecnico: 'Técnico',
  administrativo: 'Administrativo',
  comum: 'Área comum',
}

export const ROTULO_STATUS_ATIVO: Record<string, string> = {
  operando: 'Operando',
  parado: 'Parado',
  em_manutencao: 'Em manutenção',
  baixado: 'Baixado',
}

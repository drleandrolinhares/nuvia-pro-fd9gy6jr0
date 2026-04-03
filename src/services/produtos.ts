import { supabase } from '@/lib/supabase/client'

export interface Produto {
  id: string
  nome: string
  marca: string | null
  variacao: string | null
  categoria: string | null
  especialidade_id: string | null
  embalagem_id: string | null
  sala_id: string | null
  codigo_barras: string | null
  embalagem: string | null
  sala: string | null
  numero_armario: string | null
  validade: string | null
  lote: string | null
  custo_unitario: number
  quantidade_estoque: number
  quantidade_minima: number
  referencia_consumo?: 'qtd_comprada' | 'itens_embalagem' | null
  especialidades?: {
    nome: string
  } | null
  embalagens?: {
    nome: string
  } | null
  salas?: {
    nome: string
  } | null
}

export const fetchProdutos = async () => {
  const { data, error } = await supabase
    .from('produtos')
    .select(`
      *,
      especialidades (
        nome
      ),
      embalagens (
        nome
      ),
      salas (
        nome
      )
    `)
    .order('nome')

  return { data: data as Produto[] | null, error }
}

export const fetchEspecialidades = async () => {
  const { data, error } = await supabase.from('especialidades').select('*').order('nome')

  return { data, error }
}

export const fetchEmbalagens = async () => {
  const { data, error } = await supabase.from('embalagens').select('*').order('nome')

  return { data, error }
}

export const fetchSalas = async () => {
  const { data, error } = await supabase.from('salas').select('*').order('nome')

  return { data, error }
}

export const createProduto = async (produto: Partial<Produto>) => {
  const { data, error } = await supabase
    .from('produtos')
    .insert([produto])
    .select(`
      *,
      especialidades (
        nome
      ),
      embalagens (
        nome
      ),
      salas (
        nome
      )
    `)
    .single()

  return { data, error }
}

export const updateProduto = async (id: string, updates: Partial<Produto>) => {
  const { data, error } = await supabase
    .from('produtos')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  return { data, error }
}

export const deleteProduto = async (id: string) => {
  const { data, error } = await supabase.from('produtos').delete().eq('id', id)

  return { data, error }
}

export const fetchEspecialidadeCampos = async (especialidade_id: string) => {
  const { data, error } = await supabase
    .from('especialidade_campos')
    .select(`
      campo_id,
      campos_personalizados (
        id,
        nome,
        tipo
      )
    `)
    .eq('especialidade_id', especialidade_id)
    .eq('ativo', true)

  return { data: data as any[], error }
}

export const fetchProdutoCamposValores = async (produto_id: string) => {
  const { data, error } = await supabase
    .from('produto_campos_valores' as any)
    .select('campo_id, valor')
    .eq('produto_id', produto_id)

  return { data: data as any[], error }
}

export const upsertProdutoCamposValores = async (
  produto_id: string,
  campos: Record<string, string>,
) => {
  const records = Object.entries(campos).map(([campo_id, valor]) => ({
    produto_id,
    campo_id,
    valor,
  }))

  if (records.length === 0) return { data: null, error: null }

  const { data, error } = await supabase
    .from('produto_campos_valores' as any)
    .upsert(records, { onConflict: 'produto_id, campo_id' })

  return { data, error }
}

export const fetchProdutoMovimentacoes = async (produto_id: string) => {
  const [entradas, saidas] = await Promise.all([
    supabase
      .from('entrada_produtos')
      .select(`
        data_entrada, 
        quantidade_comprada, 
        preco_total, 
        fornecedores (nome)
      `)
      .eq('produto_id', produto_id)
      .order('data_entrada', { ascending: false })
      .limit(3),
    supabase
      .from('saida_produtos')
      .select(`
        data_saida, 
        quantidade, 
        tipo_saida, 
        descricao
      `)
      .eq('produto_id', produto_id)
      .order('data_saida', { ascending: false })
      .limit(3),
  ])

  return {
    entradas: entradas.data || [],
    saidas: saidas.data || [],
    error: entradas.error || saidas.error,
  }
}

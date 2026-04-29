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
  alerta_prazo_dias?: number | null
  data_proxima_revisao?: string | null
  consumo_estimado_valor?: number | null
  consumo_estimado_frequencia?: string | null
  especialidades?: {
    nome: string
  } | null
  embalagens?: {
    nome: string
  } | null
  salas?: {
    nome: string
  } | null
  compra_itens?:
    | {
        valor_unitario: number
        compras: {
          data: string
          status: string
        } | null
      }[]
    | null
  produto_campos_valores?:
    | {
        campo_id: string
        valor: string | null
        campos_personalizados?: {
          nome: string
        } | null
      }[]
    | null
}

export const formatProdutoVariacoes = (p: Produto | undefined) => {
  if (!p || !p.produto_campos_valores || p.produto_campos_valores.length === 0) return ''
  const parts = p.produto_campos_valores
    .filter((c) => c.valor && c.valor !== '-')
    .map((c) => {
      const nomeCampo = (c.campos_personalizados as any)?.nome || 'Var'
      return `${nomeCampo}: ${c.valor}`
    })
  return parts.join(' | ')
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
      ),
      compra_itens (
        valor_unitario,
        compras (
          data,
          status
        )
      ),
      produto_campos_valores (
        campo_id,
        valor,
        campos_personalizados (
          nome
        )
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
      ordem,
      campos:campos_personalizados (
        id,
        nome,
        tipo,
        opcoes,
        descricao
      )
    `)
    .eq('especialidade_id', especialidade_id)
    .eq('ativo', true)
    .order('ordem', { ascending: true })

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
  const [entradas, saidas, compras] = await Promise.all([
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
    supabase
      .from('compra_itens')
      .select(`
        qtd_comprada,
        valor_total,
        compras!inner (
          data,
          status,
          fornecedores (nome)
        )
      `)
      .eq('produto_id', produto_id)
      .eq('compras.status', 'Finalizada'),
  ])

  const formattedCompras = (compras.data || []).map((ci: any) => ({
    data_entrada: ci.compras?.data,
    quantidade_comprada: ci.qtd_comprada,
    preco_total: ci.valor_total,
    fornecedores: ci.compras?.fornecedores,
  }))

  const allEntradas = [...(entradas.data || []), ...formattedCompras]
    .sort(
      (a, b) => new Date(b.data_entrada || 0).getTime() - new Date(a.data_entrada || 0).getTime(),
    )
    .slice(0, 3)

  return {
    entradas: allEntradas,
    saidas: saidas.data || [],
    error: entradas.error || saidas.error || compras.error,
  }
}

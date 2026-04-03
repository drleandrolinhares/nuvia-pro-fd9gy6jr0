import { supabase } from '@/lib/supabase/client'

export interface UltimaCompra {
  id: string
  preco_unitario: number
  data_entrada: string
  fornecedores: {
    nome: string
  } | null
}

export const fetchUltimasCompras = async (produto_id: string) => {
  const { data, error } = await supabase
    .from('entrada_produtos')
    .select(`
      id,
      preco_unitario,
      data_entrada,
      fornecedores (
        nome
      )
    `)
    .eq('produto_id', produto_id)
    .order('data_entrada', { ascending: false })
    .limit(3)

  return { data: data as UltimaCompra[] | null, error }
}

export const registrarEntrada = async (dados: {
  produto_id: string
  fornecedor_id?: string | null
  quantidade_embalagem: number
  quantidade_comprada: number
  unidade_consumo: string
  preco_unitario: number
  preco_total: number
  data_entrada: string
  data_validade?: string | null
  numero_nfe?: string | null
  observacoes?: string
  observacoes_criticas?: string | null
}) => {
  // Fetch current product to get previous price and stock
  const { data: produto } = await supabase
    .from('produtos')
    .select('quantidade_estoque, custo_unitario')
    .eq('id', dados.produto_id)
    .single()

  const precoAnterior = produto?.custo_unitario || 0
  const estoqueAtual = produto?.quantidade_estoque || 0

  // Insert entrada
  const { data: entrada, error: entradaError } = await supabase
    .from('entrada_produtos')
    .insert({
      produto_id: dados.produto_id,
      fornecedor_id: dados.fornecedor_id || null,
      quantidade_embalagem: dados.quantidade_embalagem,
      quantidade_comprada: dados.quantidade_comprada,
      unidade_consumo: dados.unidade_consumo,
      preco_unitario: dados.preco_unitario,
      preco_total: dados.preco_total,
      data_entrada: dados.data_entrada,
      data_validade: dados.data_validade,
      numero_nfe: dados.numero_nfe,
      observacoes: dados.observacoes,
      observacoes_criticas: dados.observacoes_criticas,
    })
    .select()
    .single()

  if (entradaError) return { error: entradaError }

  // Insert history
  await supabase.from('historico_compras').insert({
    produto_id: dados.produto_id,
    fornecedor_id: dados.fornecedor_id || null,
    preco_anterior: precoAnterior,
    data_compra: dados.data_entrada,
  })

  // Update product stock and cost
  const totalItens = dados.quantidade_embalagem * dados.quantidade_comprada
  const novoEstoque = estoqueAtual + totalItens

  await supabase
    .from('produtos')
    .update({
      quantidade_estoque: novoEstoque,
      custo_unitario: dados.preco_unitario,
    })
    .eq('id', dados.produto_id)

  return { data: entrada, error: null }
}

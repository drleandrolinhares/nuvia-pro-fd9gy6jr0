import { supabase } from '@/lib/supabase/client'

export interface FornecedorBasico {
  id: string
  nome: string
}

export interface Compra {
  id: string
  fornecedor_id: string | null
  data: string
  nfe: string | null
  valor_total_compra: number
  status: string
  data_criacao: string
  fornecedores?: {
    nome: string
  } | null
}

export interface CompraItem {
  id?: string
  compra_id?: string
  produto_id: string
  produto_nome?: string
  valor_total: number
  qtd_comprada: number
  itens_embalagem: number | null
  referencia_consumo: string | null
  valor_unitario: number
}

export const fetchCompras = async () => {
  return await supabase
    .from('compras' as any)
    .select(`
      *,
      fornecedores(nome)
    `)
    .order('data_criacao', { ascending: false })
}

export const createCompra = async (
  compra: Omit<Compra, 'id' | 'data_criacao' | 'fornecedores'>,
  itens?: CompraItem[],
) => {
  const { data, error } = await supabase
    .from('compras' as any)
    .insert([compra])
    .select()
    .single()

  if (error) return { data: null, error }

  if (itens && itens.length > 0) {
    const itensPayload = itens.map((i) => ({
      compra_id: data.id,
      produto_id: i.produto_id,
      valor_total: i.valor_total,
      qtd_comprada: i.qtd_comprada,
      itens_embalagem: i.itens_embalagem,
      referencia_consumo: i.referencia_consumo,
      valor_unitario: i.valor_unitario,
    }))

    const { error: errItens } = await supabase.from('compra_itens' as any).insert(itensPayload)
    if (errItens) return { data, error: errItens }
  }

  return { data, error: null }
}

export const updateCompra = async (
  id: string,
  compra: Partial<Omit<Compra, 'id' | 'data_criacao' | 'fornecedores'>>,
  itens?: CompraItem[],
) => {
  const { data, error } = await supabase
    .from('compras' as any)
    .update(compra)
    .eq('id', id)
    .select()
    .single()

  if (error) return { data: null, error }

  if (itens) {
    await supabase
      .from('compra_itens' as any)
      .delete()
      .eq('compra_id', id)

    if (itens.length > 0) {
      const itensPayload = itens.map((i) => ({
        compra_id: id,
        produto_id: i.produto_id,
        valor_total: i.valor_total,
        qtd_comprada: i.qtd_comprada,
        itens_embalagem: i.itens_embalagem,
        referencia_consumo: i.referencia_consumo,
        valor_unitario: i.valor_unitario,
      }))
      const { error: errItens } = await supabase.from('compra_itens' as any).insert(itensPayload)
      if (errItens) return { data, error: errItens }
    }
  }

  return { data, error: null }
}

export const deleteCompra = async (id: string) => {
  return await supabase
    .from('compras' as any)
    .delete()
    .eq('id', id)
}

export const fetchFornecedoresBasico = async () => {
  return await supabase.from('fornecedores').select('id, nome').order('nome')
}

export const fetchUltimasComprasProduto = async (produtoId: string) => {
  return await supabase
    .from('compra_itens' as any)
    .select(`
      data_criacao,
      valor_unitario,
      qtd_comprada,
      compras (
        data,
        fornecedores (nome)
      )
    `)
    .eq('produto_id', produtoId)
    .order('data_criacao', { ascending: false })
    .limit(3)
}

export const fetchCompraItens = async (compraId: string) => {
  return await supabase
    .from('compra_itens' as any)
    .select(`
      *,
      produtos (nome, marca)
    `)
    .eq('compra_id', compraId)
}

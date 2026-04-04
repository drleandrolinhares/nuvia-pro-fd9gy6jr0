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
) => {
  return await supabase
    .from('compras' as any)
    .insert([compra])
    .select()
}

export const updateCompra = async (
  id: string,
  compra: Partial<Omit<Compra, 'id' | 'data_criacao' | 'fornecedores'>>,
) => {
  return await supabase
    .from('compras' as any)
    .update(compra)
    .eq('id', id)
    .select()
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

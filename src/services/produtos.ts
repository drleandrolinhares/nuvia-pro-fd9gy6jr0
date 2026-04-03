import { supabase } from '@/lib/supabase/client'

export interface Produto {
  id: string
  nome: string
  marca: string | null
  variacao: string | null
  categoria: string | null
  especialidade_id: string | null
  codigo_barras: string | null
  embalagem: string | null
  sala: string | null
  validade: string | null
  lote: string | null
  custo_unitario: number
  quantidade_estoque: number
  quantidade_minima: number
  especialidades?: {
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
      )
    `)
    .order('nome')

  return { data: data as Produto[] | null, error }
}

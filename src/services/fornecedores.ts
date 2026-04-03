import { supabase } from '@/lib/supabase/client'

export interface Fornecedor {
  id: string
  nome: string
  cnpj: string | null
  telefone: string | null
  email: string | null
  endereco: string | null
}

export const fetchFornecedores = async () => {
  const { data, error } = await supabase.from('fornecedores').select('*').order('nome')

  return { data: data as Fornecedor[] | null, error }
}

export const createFornecedor = async (nome: string) => {
  const { data, error } = await supabase.from('fornecedores').insert({ nome }).select().single()

  return { data: data as Fornecedor | null, error }
}

import { supabase } from '@/lib/supabase/client'

export interface Fornecedor {
  id: string
  nome: string
  cnpj: string | null
  telefone: string | null
  email: string | null
  endereco: string | null
  contato_principal: string | null
  observacoes: string | null
  url: string | null
  senha: string | null
  usuario_login: string | null
  criado_em: string | null
}

export const fetchFornecedores = async () => {
  const { data, error } = await supabase.from('fornecedores').select('*').order('nome')
  return { data: data as Fornecedor[] | null, error }
}

export const createFornecedor = async (fornecedor: Partial<Fornecedor>) => {
  const { data, error } = await supabase.from('fornecedores').insert(fornecedor).select().single()
  return { data: data as Fornecedor | null, error }
}

export const updateFornecedor = async (id: string, fornecedor: Partial<Fornecedor>) => {
  const { data, error } = await supabase
    .from('fornecedores')
    .update(fornecedor)
    .eq('id', id)
    .select()
    .single()
  return { data: data as Fornecedor | null, error }
}

export const deleteFornecedor = async (id: string) => {
  const { error } = await supabase.from('fornecedores').delete().eq('id', id)
  return { error }
}

import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

export type FaixaDentista = Database['public']['Tables']['referencias_comissao_dentista']['Row']
export type FaixaDentistaInsert =
  Database['public']['Tables']['referencias_comissao_dentista']['Insert']

export type FaixaCRC = Database['public']['Tables']['referencias_comissao_crc']['Row']
export type FaixaCRCInsert = Database['public']['Tables']['referencias_comissao_crc']['Insert']

export interface FaixaBase {
  id?: string
  faixa_entrada_minima: number | null
  faixa_entrada_maxima: number | null
  percentual_comissao: number | null
  status: string | null
}

export const comissoesService = {
  dentista: {
    async list() {
      const { data, error } = await supabase
        .from('referencias_comissao_dentista')
        .select('*')
        .order('faixa_entrada_minima', { ascending: true })
      if (error) throw error
      return data as FaixaBase[]
    },
    async save(faixa: any) {
      if (faixa.id) {
        const { data, error } = await supabase
          .from('referencias_comissao_dentista')
          .update(faixa)
          .eq('id', faixa.id)
          .select()
          .single()
        if (error) throw error
        return data
      } else {
        const { data, error } = await supabase
          .from('referencias_comissao_dentista')
          .insert(faixa)
          .select()
          .single()
        if (error) throw error
        return data
      }
    },
    async remove(id: string) {
      const { error } = await supabase.from('referencias_comissao_dentista').delete().eq('id', id)
      if (error) throw error
    },
  },
  crc: {
    async list() {
      const { data, error } = await supabase
        .from('referencias_comissao_crc')
        .select('*')
        .order('faixa_entrada_minima', { ascending: true })
      if (error) throw error
      return data as FaixaBase[]
    },
    async save(faixa: any) {
      if (faixa.id) {
        const { data, error } = await supabase
          .from('referencias_comissao_crc')
          .update(faixa)
          .eq('id', faixa.id)
          .select()
          .single()
        if (error) throw error
        return data
      } else {
        const { data, error } = await supabase
          .from('referencias_comissao_crc')
          .insert(faixa)
          .select()
          .single()
        if (error) throw error
        return data
      }
    },
    async remove(id: string) {
      const { error } = await supabase.from('referencias_comissao_crc').delete().eq('id', id)
      if (error) throw error
    },
  },
}

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'

export interface RoteiroSetor {
  id: string
  nome: string
  ordem: number
}

export interface Roteiro {
  id: string
  setor_id: string
  titulo: string
  objetivo: string | null
  tipo_comunicacao: string
  conteudo: string | null
  ordem: number
}

export function useRoteiros() {
  const [setores, setSetores] = useState<RoteiroSetor[]>([])
  const [roteiros, setRoteiros] = useState<Roteiro[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDados = useCallback(async () => {
    setLoading(true)
    try {
      const [setoresData, roteirosData] = await Promise.all([
        supabase
          .from('roteiros_setores' as any)
          .select('*')
          .order('ordem', { ascending: true }),
        supabase
          .from('roteiros' as any)
          .select('*')
          .order('ordem', { ascending: true }),
      ])

      if (setoresData.error) throw setoresData.error
      if (roteirosData.error) throw roteirosData.error

      setSetores(setoresData.data || [])
      setRoteiros(roteirosData.data || [])
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar roteiros',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDados()
  }, [fetchDados])

  return {
    setores,
    roteiros,
    loading,
    refresh: fetchDados,
  }
}

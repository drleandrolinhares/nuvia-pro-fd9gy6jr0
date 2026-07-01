import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

export function useConfigData() {
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [cargos, setCargos] = useState<any[]>([])
  const [permissoes, setPermissoes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const { toast } = useToast()

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const [uRes, cRes, pRes] = await Promise.all([
        supabase
          .from('usuarios')
          .select('*, cargos!usuarios_cargo_id_fkey(nome), colaboradores_detalhes(*)')
          .order('nome'),
        supabase.from('cargos').select('*, cargo_permissoes(permissao_id)'),
        supabase.from('permissoes').select('*'),
      ])

      let hasError = false
      if (uRes.error) {
        hasError = true
        console.error('[useConfigData] Error fetching usuarios:', uRes.error)
      }
      if (cRes.error) {
        hasError = true
        console.error('[useConfigData] Error fetching cargos:', cRes.error)
      }
      if (pRes.error) {
        hasError = true
        console.error('[useConfigData] Error fetching permissoes:', pRes.error)
      }

      setUsuarios(uRes.data || [])
      setCargos(cRes.data || [])
      setPermissoes(pRes.data || [])

      if (hasError) {
        setError(true)
        toast({
          title: 'Aviso',
          description: 'Alguns dados não puderam ser carregados completamente.',
          variant: 'destructive',
        })
      }
    } catch (error: any) {
      setError(true)
      toast({ title: 'Erro ao carregar dados', description: error.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { usuarios, cargos, permissoes, loading, error, refetch: fetchData }
}

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

export function useConfigData() {
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [cargos, setCargos] = useState<any[]>([])
  const [permissoes, setPermissoes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [uRes, cRes, pRes] = await Promise.all([
        supabase
          .from('usuarios')
          .select('*, cargos!usuarios_cargo_id_fkey(nome), colaboradores_detalhes(*)'),
        supabase.from('cargos').select('*, cargo_permissoes(permissao_id)'),
        supabase.from('permissoes').select('*'),
      ])

      if (uRes.error) throw uRes.error
      if (cRes.error) throw cRes.error
      if (pRes.error) throw pRes.error

      setUsuarios(uRes.data || [])
      setCargos(cRes.data || [])
      setPermissoes(pRes.data || [])
    } catch (error: any) {
      toast({ title: 'Erro ao carregar dados', description: error.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { usuarios, cargos, permissoes, loading, refetch: fetchData }
}

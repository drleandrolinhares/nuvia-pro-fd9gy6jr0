import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

interface UserProfile {
  id: string
  nome: string
  email: string
  role: string | null
  exigir_rotina?: boolean
  possui_carteira?: boolean
}

const normalizePermissionToKey = (name: string): string => {
  const lowerName = name.toLowerCase()
  if (lowerName.includes('estoque')) return 'financeiro_estoque'
  if (lowerName.includes('sac')) return 'operacional_sac'
  if (lowerName.includes('rotina')) return 'operacional_rotina'
  if (lowerName.includes('performance')) return 'operacional_performance'
  if (lowerName.includes('comunicados')) return 'operacional_comunicados'
  if (lowerName.includes('vendas')) return 'comercial_vendas'
  if (lowerName.includes('comissões') || lowerName.includes('comissoes'))
    return 'comercial_comissoes'
  if (lowerName.includes('pacientes')) return 'comercial_pacientes'
  if (lowerName.includes('negociaç') || lowerName.includes('negociac'))
    return 'comercial_negociacao'
  return lowerName.replace(/\s+/g, '_')
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  permissions: string[]
  acessoConfig: any
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [permissions, setPermissions] = useState<string[]>([])
  const [acessoConfig, setAcessoConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const fetchUserData = async (userId: string) => {
      try {
        const [profileRes, permsRes, cargoRes, configRes] = await Promise.all([
          supabase.from('usuarios').select('*').eq('id', userId).single(),
          supabase.from('usuario_permissoes').select('permissoes(nome)').eq('usuario_id', userId),
          supabase
            .from('usuarios')
            .select('cargo_id, cargo_secundario_id')
            .eq('id', userId)
            .single(),
          supabase
            .from('configuracoes_acesso' as any)
            .select('*')
            .single(),
        ])

        if (isMounted && configRes.data) {
          setAcessoConfig(configRes.data)
        }

        let newProfile = null
        let newPermissions: string[] = []

        if (!profileRes.error && profileRes.data) {
          newProfile = profileRes.data
        }

        const permSet = new Set<string>()
        const addPerm = (nome: string) => {
          permSet.add(nome)
          permSet.add(normalizePermissionToKey(nome))
        }

        if (permsRes.data) {
          permsRes.data.forEach((up: any) => {
            if (up.permissoes?.nome) addPerm(up.permissoes.nome)
          })
        }

        if (cargoRes.data) {
          const cargos = [cargoRes.data.cargo_id, cargoRes.data.cargo_secundario_id].filter(Boolean)
          if (cargos.length > 0) {
            const { data: cPerms } = await supabase
              .from('cargo_permissoes')
              .select('permissoes(nome)')
              .in('cargo_id', cargos)

            if (cPerms) {
              cPerms.forEach((cp: any) => {
                if (cp.permissoes?.nome) addPerm(cp.permissoes.nome)
              })
            }
          }
        }

        if (isMounted) {
          setProfile(newProfile)
          setPermissions(Array.from(permSet))
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        if (isMounted) {
          setProfile(null)
          setPermissions([])
        }
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserData(session.user.id).finally(() => {
          if (isMounted) setLoading(false)
        })
      } else {
        if (isMounted) {
          setProfile(null)
          setPermissions([])
          setAcessoConfig(null)
          setLoading(false)
        }
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserData(session.user.id).finally(() => {
          if (isMounted) setLoading(false)
        })
      } else {
        if (isMounted) {
          setProfile(null)
          setPermissions([])
          setAcessoConfig(null)
          setLoading(false)
        }
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return (
    <AuthContext.Provider
      value={{ user, session, profile, permissions, acessoConfig, signIn, signOut, loading }}
    >
      {children}
    </AuthContext.Provider>
  )
}

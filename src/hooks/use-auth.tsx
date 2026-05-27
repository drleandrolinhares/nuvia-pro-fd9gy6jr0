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
  pode_realizar_lancamento?: boolean
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  permissions: string[]
  acessoConfig: any
  isAdmin: boolean
  hasPermission: (p: string | string[]) => boolean
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

export const normalizeString = (str: string | null | undefined): string => {
  if (!str) return ''
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

export const isAdminRole = (role: string | null | undefined): boolean => {
  if (!role) return false
  const r = normalizeString(role)
  return [
    'admin',
    'adm',
    'administrador',
    'administradora',
    'ceo',
    'socia',
    'socio',
    'gestor',
    'gestora',
    'diretor',
    'diretora',
  ].includes(r)
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [permissions, setPermissions] = useState<string[]>([])
  const [acessoConfig, setAcessoConfig] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
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
          supabase.from('configuracoes_acesso').select('*').maybeSingle(),
        ])

        if (isMounted && configRes.data) {
          setAcessoConfig(configRes.data)
        }

        let newProfile = null
        let isAdm = false

        if (!profileRes.error && profileRes.data) {
          newProfile = profileRes.data
          if (newProfile?.role) {
            newProfile.role = normalizeString(newProfile.role)
          }
          if (isAdminRole(newProfile?.role)) {
            isAdm = true
          }
        }

        const permSet = new Set<string>()
        const addPerm = (nome: string) => {
          if (!nome) return
          permSet.add(normalizeString(nome))
        }

        const extractPermName = (row: any) => {
          if (!row) return null
          if (row.permissao?.nome) return row.permissao.nome
          if (row.permissoes?.nome) return row.permissoes.nome
          if (Array.isArray(row.permissoes) && row.permissoes[0]?.nome)
            return row.permissoes[0].nome
          if (Array.isArray(row.permissao) && row.permissao[0]?.nome) return row.permissao[0].nome
          return null
        }

        if (permsRes.data) {
          permsRes.data.forEach((up: any) => {
            const pNome = extractPermName(up)
            if (pNome) addPerm(pNome)
          })
        }

        if (cargoRes.data) {
          const cargosIds = [cargoRes.data.cargo_id, cargoRes.data.cargo_secundario_id].filter(
            Boolean,
          )
          if (cargosIds.length > 0) {
            const [cPermsRes, cNamesRes] = await Promise.all([
              supabase
                .from('cargo_permissoes')
                .select('permissoes(nome)')
                .in('cargo_id', cargosIds),
              supabase.from('cargos').select('nome').in('id', cargosIds),
            ])

            if (cPermsRes.data) {
              cPermsRes.data.forEach((cp: any) => {
                const pNome = extractPermName(cp)
                if (pNome) addPerm(pNome)
              })
            }

            if (cNamesRes.data) {
              cNamesRes.data.forEach((c: any) => {
                if (c.nome && isAdminRole(c.nome)) {
                  isAdm = true
                }
              })
            }
          }
        }

        if (isMounted) {
          setProfile(newProfile)
          setPermissions(Array.from(permSet))
          setIsAdmin(isAdm)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        if (isMounted) {
          setProfile(null)
          setPermissions([])
          setIsAdmin(false)
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
          setIsAdmin(false)
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

  const hasPermission = (p: string | string[]) => {
    if (isAdmin) return true
    if (Array.isArray(p)) {
      return p.some((perm) => permissions.includes(normalizeString(perm)))
    }
    return permissions.includes(normalizeString(p))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        permissions,
        acessoConfig,
        isAdmin,
        hasPermission,
        signIn,
        signOut,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

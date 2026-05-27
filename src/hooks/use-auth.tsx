import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

export const normalizeString = (str: string) => {
  if (!str) return ''
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

interface Profile {
  id: string
  email: string
  nome: string
  role: string | null
  status: string | null
  cargo_id: string | null
  cargo_secundario_id: string | null
  exigir_rotina: boolean
  cargo_principal_nome?: string
  cargo_secundario_nome?: string
  cargo_principal?: { nome: string } | null
  cargo_secundario?: { nome: string } | null
  avatar_url?: string | null
  [key: string]: any
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  permissions: string[]
  isAdmin: boolean
  acessoConfig: any | null
  signUp: (email: string, password: string, nome?: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  loading: boolean
  hasPermission: (perms: string | string[]) => boolean
  refreshProfile: () => Promise<void>
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
  const [profile, setProfile] = useState<Profile | null>(null)
  const [permissions, setPermissions] = useState<string[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [acessoConfig, setAcessoConfig] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfileData = async (userId: string) => {
    try {
      const { data: userProfile, error: profileError } = await supabase
        .from('usuarios')
        .select(`
          *,
          cargo_principal:cargos!usuarios_cargo_id_fkey(nome),
          cargo_secundario:cargos!usuarios_cargo_secundario_id_fkey(nome)
        `)
        .eq('id', userId)
        .single()

      if (profileError || !userProfile) {
        console.error('Error fetching profile', profileError)
        return null
      }

      const p: Profile = {
        ...userProfile,
        cargo_principal_nome: userProfile.cargo_principal?.nome || null,
        cargo_secundario_nome: userProfile.cargo_secundario?.nome || null,
        cargo_principal: userProfile.cargo_principal || null,
        cargo_secundario: userProfile.cargo_secundario || null,
      }

      const [userPermsRes, isAdmRes, acessoRes] = await Promise.all([
        supabase.from('usuario_permissoes').select('permissoes(nome)').eq('usuario_id', userId),
        supabase.rpc('is_admin'),
        supabase.from('configuracoes_acesso').select('*').limit(1).maybeSingle(),
      ])

      const cargoIds = [p.cargo_id, p.cargo_secundario_id].filter(Boolean)
      let cargoPermsData: any[] = []
      if (cargoIds.length > 0) {
        const { data } = await supabase
          .from('cargo_permissoes')
          .select('permissoes(nome)')
          .in('cargo_id', cargoIds)
        if (data) cargoPermsData = data
      }

      const permSet = new Set<string>()

      userPermsRes.data?.forEach((item: any) => {
        if (item.permissoes?.nome) permSet.add(normalizeString(item.permissoes.nome))
      })

      cargoPermsData?.forEach((item: any) => {
        if (item.permissoes?.nome) permSet.add(normalizeString(item.permissoes.nome))
      })

      // Fallback local admin check if RPC returns false/null unexpectedly
      let userIsAdmin = isAdmRes.data === true
      if (!userIsAdmin) {
        const checkAdm = (str: string | null | undefined) => {
          if (!str) return false
          const s = normalizeString(str)
          return ['admin', 'administrador', 'ceo', 'diretoria', 'diretor', 'gestor'].includes(s)
        }
        userIsAdmin =
          checkAdm(p.role) || checkAdm(p.cargo_principal_nome) || checkAdm(p.cargo_secundario_nome)
      }

      return {
        profile: p,
        permissions: Array.from(permSet),
        isAdmin: userIsAdmin,
        acessoConfig: acessoRes.data || null,
      }
    } catch (err) {
      console.error('Error in fetchProfileData:', err)
      return null
    }
  }

  const refreshProfile = async () => {
    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession()
    if (currentSession?.user) {
      const data = await fetchProfileData(currentSession.user.id)
      if (data) {
        setProfile(data.profile)
        setPermissions(data.permissions)
        setIsAdmin(data.isAdmin)
        setAcessoConfig(data.acessoConfig)
      }
    }
  }

  useEffect(() => {
    let mounted = true
    let userChannel: any = null

    const setupRealtime = (userId: string) => {
      if (userChannel) supabase.removeChannel(userChannel)
      userChannel = supabase
        .channel('user-profile-updates')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'usuarios', filter: `id=eq.${userId}` },
          () => {
            refreshProfile()
          },
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'usuario_permissoes',
            filter: `usuario_id=eq.${userId}`,
          },
          () => {
            refreshProfile()
          },
        )
        .subscribe()
    }

    const loadData = async (currentSession: Session | null) => {
      if (currentSession?.user) {
        const data = await fetchProfileData(currentSession.user.id)
        if (data && mounted) {
          setProfile(data.profile)
          setPermissions(data.permissions)
          setIsAdmin(data.isAdmin)
          setAcessoConfig(data.acessoConfig)
        }
        setupRealtime(currentSession.user.id)
      } else {
        if (mounted) {
          setProfile(null)
          setPermissions([])
          setIsAdmin(false)
          setAcessoConfig(null)
        }
        if (userChannel) supabase.removeChannel(userChannel)
      }
      if (mounted) setLoading(false)
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (!mounted) return
      setSession(currentSession)
      setUser(currentSession?.user ?? null)

      if (event === 'SIGNED_OUT') {
        setProfile(null)
        setPermissions([])
        setIsAdmin(false)
        setAcessoConfig(null)
        setLoading(false)
        if (userChannel) supabase.removeChannel(userChannel)
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        setLoading(true)
        loadData(currentSession)
      }
    })

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!mounted) return
      setSession(currentSession)
      setUser(currentSession?.user ?? null)
      loadData(currentSession)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
      if (userChannel) supabase.removeChannel(userChannel)
    }
  }, [])

  const signUp = async (email: string, password: string, nome?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nome: nome || email.split('@')[0] },
        emailRedirectTo: `${window.location.origin}/`,
      },
    })
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const hasPermission = (perms: string | string[]) => {
    if (isAdmin) return true
    if (profile?.status?.toLowerCase() === 'inativo') return false
    if (!perms || perms.length === 0) return true

    const permsArray = Array.isArray(perms) ? perms : [perms]
    const normalizedTargetPerms = permsArray.map(normalizeString)
    return normalizedTargetPerms.some((p) => permissions.includes(p))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        permissions,
        isAdmin,
        acessoConfig,
        signUp,
        signIn,
        signOut,
        loading,
        hasPermission,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

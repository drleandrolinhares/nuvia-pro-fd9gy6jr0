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

export const isAdminRole = (role: string | null | undefined) => {
  if (!role) return false
  const s = normalizeString(role)
  return ['admin', 'administrador', 'ceo', 'diretoria', 'diretor', 'gestor'].includes(s)
}

export const isGerenteAdministrativoRole = (...nomes: (string | null | undefined)[]) => {
  return nomes.some((nome) => !!nome && normalizeString(nome) === 'gerente administrativo')
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
  isGerenteAdministrativo: boolean
  acessoConfig: any | null
  signUp: (email: string, password: string, nome?: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  loading: boolean
  permissionsLoaded: boolean
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
  const [isGerenteAdministrativo, setIsGerenteAdministrativo] = useState(false)
  const [acessoConfig, setAcessoConfig] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [permissionsLoaded, setPermissionsLoaded] = useState(false)

  const fetchProfileData = async (userId: string) => {
    let userProfile: any = null

    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select(
          `*, cargo_principal:cargos!usuarios_cargo_id_fkey(nome), cargo_secundario:cargos!usuarios_cargo_secundario_id_fkey(nome)`,
        )
        .eq('id', userId)
        .single()

      if (!error && data) {
        userProfile = data
      }
    } catch (e) {
      console.error('[auth] Profile query with joins failed:', e)
    }

    if (!userProfile) {
      try {
        const { data, error } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', userId)
          .single()

        if (!error && data) {
          userProfile = data
        }
      } catch (e) {
        console.error('[auth] Error fetching profile (fallback):', e)
      }
    }

    if (!userProfile) {
      userProfile = {
        id: userId,
        email: '',
        nome: '',
        role: null,
        status: 'ativo',
        cargo_id: null,
        cargo_secundario_id: null,
        exigir_rotina: false,
      }
    }

    const p: Profile = {
      ...userProfile,
      cargo_principal_nome: userProfile.cargo_principal?.nome || null,
      cargo_secundario_nome: userProfile.cargo_secundario?.nome || null,
      cargo_principal: userProfile.cargo_principal || null,
      cargo_secundario: userProfile.cargo_secundario || null,
    }

    let userIsAdmin = false
    let acessoConfig: any = null
    let userPermissions: string[] = []

    try {
      const { data, error } = await supabase.rpc('is_admin')
      if (!error) userIsAdmin = data === true
    } catch (e) {
      console.error('[auth] Error checking admin status:', e)
    }

    if (!userIsAdmin) {
      userIsAdmin =
        isAdminRole(p.role) ||
        isAdminRole(p.cargo_principal_nome) ||
        isAdminRole(p.cargo_secundario_nome)
    }

    try {
      const { data, error } = await supabase
        .from('configuracoes_acesso')
        .select('*')
        .limit(1)
        .maybeSingle()
      if (!error) acessoConfig = data || null
    } catch (e) {
      console.error('[auth] Error fetching access config:', e)
    }

    try {
      const { data, error } = await supabase.rpc('get_user_permissions', { p_user_id: userId })
      if (!error) userPermissions = (data as string[]) || []
    } catch (e) {
      console.error('[auth] Error fetching permissions:', e)
    }

    const userIsGerenteAdm = isGerenteAdministrativoRole(
      p.cargo_principal_nome,
      p.cargo_secundario_nome,
    )

    return {
      profile: p,
      isAdmin: userIsAdmin,
      isGerenteAdministrativo: userIsGerenteAdm,
      acessoConfig,
      permissions: userPermissions,
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
        setIsAdmin(data.isAdmin)
        setIsGerenteAdministrativo(data.isGerenteAdministrativo)
        setAcessoConfig(data.acessoConfig)
        setPermissions(data.permissions || [])
        setPermissionsLoaded(true)
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
        .subscribe()
    }

    const loadData = async (currentSession: Session | null) => {
      if (currentSession?.user) {
        const data = await fetchProfileData(currentSession.user.id)
        if (data && mounted) {
          setProfile(data.profile)
          setIsAdmin(data.isAdmin)
          setIsGerenteAdministrativo(data.isGerenteAdministrativo)
          setAcessoConfig(data.acessoConfig)
          setPermissions(data.permissions || [])
          setPermissionsLoaded(true)
        }
        setupRealtime(currentSession.user.id)
      } else {
        if (mounted) {
          setProfile(null)
          setIsAdmin(false)
          setIsGerenteAdministrativo(false)
          setAcessoConfig(null)
          setPermissions([])
          setPermissionsLoaded(false)
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
        setIsAdmin(false)
        setIsGerenteAdministrativo(false)
        setAcessoConfig(null)
        setPermissions([])
        setPermissionsLoaded(false)
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

  useEffect(() => {
    if (!loading) return
    const timer = setTimeout(() => {
      console.warn('[auth] Loading timeout — proceeding with available data')
      setLoading(false)
    }, 8000)
    return () => clearTimeout(timer)
  }, [loading])

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
    const permArray = Array.isArray(perms) ? perms : [perms]
    return permArray.some((p) => permissions.includes(p))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        permissions,
        isAdmin,
        isGerenteAdministrativo,
        acessoConfig,
        signUp,
        signIn,
        signOut,
        loading,
        permissionsLoaded,
        hasPermission,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

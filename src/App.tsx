import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider, useAuth } from '@/hooks/use-auth'
import { CacheProvider } from '@/hooks/use-cache'
import Layout from './components/Layout'
import Index from './pages/Index'
import Estoque from './pages/Estoque'
import Configuracoes from './pages/Configuracoes'
import Colaboradores from './pages/Colaboradores'
import Fornecedores from './pages/Fornecedores'
import Perfil from './pages/Perfil'
import CadastrosBasicos from './pages/admin/CadastrosBasicos'
import RegistroUsuarios from './pages/admin/RegistroUsuarios'
import DescontosPorPrazo from './pages/configuracoes/DescontosPorPrazo'
import EntradaEFaixas from './pages/configuracoes/EntradaEFaixas'
import Placeholder from './pages/Placeholder'
import Comunicados from './pages/operacional/Comunicados'
import Negociacao from './pages/comercial/Negociacao'
import Vendas from './pages/comercial/Vendas'
import Pacientes from './pages/comercial/Pacientes'
import ControleComissoes from './pages/comercial/ControleComissoes'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import { Loader2 } from 'lucide-react'

import { supabase } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

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

const ProtectedRoute = ({
  allowedRoles,
  allowedPermissions,
  children,
}: {
  allowedRoles: string[]
  allowedPermissions?: string[]
  children: React.ReactNode
}) => {
  const { user, profile, loading } = useAuth()
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)

  const userRole = profile?.role || 'visualizacao'

  useEffect(() => {
    if (!user || userRole === 'admin') {
      setHasPermission(true)
      return
    }

    if (!allowedPermissions || allowedPermissions.length === 0) {
      setHasPermission(true)
      return
    }

    const checkPerms = async () => {
      try {
        const { data: userPerms } = await supabase
          .from('usuario_permissoes')
          .select('permissoes(nome)')
          .eq('usuario_id', user.id)

        const { data: userCargo } = await supabase
          .from('usuarios')
          .select('cargo_id, cargo_secundario_id')
          .eq('id', user.id)
          .single()

        let cargoPerms: any[] = []
        if (userCargo) {
          const cargos = [userCargo.cargo_id, userCargo.cargo_secundario_id].filter(Boolean)
          if (cargos.length > 0) {
            const { data: cPerms } = await supabase
              .from('cargo_permissoes')
              .select('permissoes(nome)')
              .in('cargo_id', cargos)
            if (cPerms) cargoPerms = cPerms
          }
        }

        const permSet = new Set<string>()
        const addPerm = (nome: string) => {
          permSet.add(nome)
          permSet.add(normalizePermissionToKey(nome))
        }

        userPerms?.forEach((up: any) => {
          if (up.permissoes?.nome) addPerm(up.permissoes.nome)
        })
        cargoPerms?.forEach((cp: any) => {
          if (cp.permissoes?.nome) addPerm(cp.permissoes.nome)
        })

        const hasAccess = allowedPermissions.some((p) => permSet.has(p))
        setHasPermission(hasAccess)
      } catch (error) {
        console.error('Error checking perms', error)
        setHasPermission(false)
      }
    }

    checkPerms()
  }, [user, allowedPermissions])

  if (loading) return null

  if (userRole === 'admin') return <>{children}</>

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole))
    return <Navigate to="/" replace />

  if (hasPermission === false) return <Navigate to="/" replace />

  if (hasPermission === null && allowedPermissions && allowedPermissions.length > 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}

const AppRoutes = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center flex-col gap-4">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        <p className="text-slate-400 font-medium">Carregando sistema...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/perfil" element={<Perfil />} />

        {/* Admin only routes */}
        <Route
          path="/estoque"
          element={
            <ProtectedRoute allowedRoles={[]} allowedPermissions={['financeiro_estoque']}>
              <Estoque />
            </ProtectedRoute>
          }
        />
        <Route
          path="/configuracoes"
          element={
            <ProtectedRoute allowedRoles={[]}>
              <Configuracoes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/colaboradores"
          element={
            <ProtectedRoute allowedRoles={[]}>
              <Colaboradores />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fornecedores"
          element={
            <ProtectedRoute allowedRoles={[]}>
              <Fornecedores />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/cadastros"
          element={
            <ProtectedRoute allowedRoles={[]}>
              <CadastrosBasicos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/registro"
          element={
            <ProtectedRoute allowedRoles={[]}>
              <RegistroUsuarios />
            </ProtectedRoute>
          }
        />
        <Route
          path="/configuracoes/descontos"
          element={
            <ProtectedRoute allowedRoles={[]}>
              <DescontosPorPrazo />
            </ProtectedRoute>
          }
        />
        <Route
          path="/configuracoes/faixas"
          element={
            <ProtectedRoute allowedRoles={[]}>
              <EntradaEFaixas />
            </ProtectedRoute>
          }
        />

        {/* Operacional Routes */}
        <Route
          path="/operacional/sac"
          element={
            <ProtectedRoute allowedRoles={[]} allowedPermissions={['operacional_sac']}>
              <Placeholder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operacional/rotina"
          element={
            <ProtectedRoute allowedRoles={[]} allowedPermissions={['operacional_rotina']}>
              <Placeholder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operacional/performance"
          element={
            <ProtectedRoute allowedRoles={[]} allowedPermissions={['operacional_performance']}>
              <Placeholder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operacional/comunicados"
          element={
            <ProtectedRoute allowedRoles={[]} allowedPermissions={['operacional_comunicados']}>
              <Comunicados />
            </ProtectedRoute>
          }
        />

        {/* Comercial Routes */}
        <Route
          path="/comercial/vendas"
          element={
            <ProtectedRoute allowedRoles={[]} allowedPermissions={['comercial_vendas']}>
              <Vendas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/comercial/negociacao"
          element={
            <ProtectedRoute allowedRoles={[]} allowedPermissions={['comercial_negociacao']}>
              <Negociacao />
            </ProtectedRoute>
          }
        />
        <Route
          path="/comercial/comissoes"
          element={
            <ProtectedRoute allowedRoles={[]} allowedPermissions={['comercial_comissoes']}>
              <ControleComissoes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/comercial/pacientes"
          element={
            <ProtectedRoute allowedRoles={[]} allowedPermissions={['comercial_pacientes']}>
              <Pacientes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/comercial/fiscal"
          element={
            <ProtectedRoute allowedRoles={[]}>
              <Placeholder />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <AuthProvider>
      <CacheProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppRoutes />
        </TooltipProvider>
      </CacheProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App

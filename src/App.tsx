import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider, useAuth } from '@/hooks/use-auth'
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
import Negociacao from './pages/comercial/Negociacao'
import Vendas from './pages/comercial/Vendas'
import Pacientes from './pages/comercial/Pacientes'
import ControleComissoes from './pages/comercial/ControleComissoes'
import FechamentoComissoes from './pages/comercial/FechamentoComissoes'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import { Loader2 } from 'lucide-react'

const ProtectedRoute = ({
  allowedRoles,
  children,
}: {
  allowedRoles: string[]
  children: React.ReactNode
}) => {
  const { profile, loading } = useAuth()
  if (loading) return null
  const userRole = profile?.role || 'visualizacao'
  if (userRole === 'admin') return <>{children}</>
  if (!allowedRoles.includes(userRole)) return <Navigate to="/" replace />
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
            <ProtectedRoute allowedRoles={[]}>
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
            <ProtectedRoute allowedRoles={[]}>
              <Placeholder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operacional/rotina"
          element={
            <ProtectedRoute allowedRoles={[]}>
              <Placeholder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operacional/performance"
          element={
            <ProtectedRoute allowedRoles={[]}>
              <Placeholder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operacional/comunicados"
          element={
            <ProtectedRoute allowedRoles={[]}>
              <Placeholder />
            </ProtectedRoute>
          }
        />

        {/* Comercial Routes */}
        <Route
          path="/comercial/vendas"
          element={
            <ProtectedRoute allowedRoles={['crc_comercial', 'visualizacao']}>
              <Vendas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/comercial/negociacao"
          element={
            <ProtectedRoute allowedRoles={['crc_comercial']}>
              <Negociacao />
            </ProtectedRoute>
          }
        />
        <Route
          path="/comercial/comissoes"
          element={
            <ProtectedRoute allowedRoles={['crc_comercial', 'dentista_avaliador']}>
              <ControleComissoes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/comercial/fechamento-comissoes"
          element={
            <ProtectedRoute allowedRoles={[]}>
              <FechamentoComissoes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/comercial/pacientes"
          element={
            <ProtectedRoute allowedRoles={['crc_comercial', 'visualizacao']}>
              <Pacientes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/comercial/relatorios"
          element={
            <ProtectedRoute allowedRoles={['visualizacao']}>
              <Placeholder />
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
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppRoutes />
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App

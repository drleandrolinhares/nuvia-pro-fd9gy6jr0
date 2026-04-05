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
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import { Loader2 } from 'lucide-react'

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
        <Route path="/estoque" element={<Estoque />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
        <Route path="/colaboradores" element={<Colaboradores />} />
        <Route path="/fornecedores" element={<Fornecedores />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/admin/cadastros" element={<CadastrosBasicos />} />
        <Route path="/admin/registro" element={<RegistroUsuarios />} />

        <Route path="/configuracoes/descontos" element={<DescontosPorPrazo />} />
        <Route path="/configuracoes/faixas" element={<EntradaEFaixas />} />

        {/* Operacional Routes */}
        <Route path="/operacional/sac" element={<Placeholder />} />
        <Route path="/operacional/rotina" element={<Placeholder />} />
        <Route path="/operacional/performance" element={<Placeholder />} />
        <Route path="/operacional/comunicados" element={<Placeholder />} />

        {/* Comercial Routes */}
        <Route path="/comercial/vendas" element={<Vendas />} />
        <Route path="/comercial/negociacao" element={<Negociacao />} />
        <Route path="/comercial/comissoes" element={<ControleComissoes />} />
        <Route path="/comercial/fechamento-comissoes" element={<Placeholder />} />
        <Route path="/comercial/pacientes" element={<Pacientes />} />
        <Route path="/comercial/relatorios" element={<Placeholder />} />
        <Route path="/comercial/fiscal" element={<Placeholder />} />

        {/* Financeiro Routes */}
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

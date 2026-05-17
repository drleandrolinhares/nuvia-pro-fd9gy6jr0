import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider, useAuth } from '@/hooks/use-auth'
import { CacheProvider } from '@/hooks/use-cache'
import { GlobalNormasPopup } from '@/components/normas/global-normas-popup'
import { SacNotificationPopup } from '@/components/sac/sac-notification-popup'
import Layout from './components/Layout'
import Index from './pages/Index'
import Estoque from './pages/Estoque'
import Fluxo from './pages/financeiro/Fluxo'
import Configuracoes from './pages/Configuracoes'
import Usuarios from './pages/Usuarios'
import Fornecedores from './pages/Fornecedores'
import Perfil from './pages/Perfil'
import CadastrosBasicos from './pages/admin/CadastrosBasicos'
import RegistroUsuarios from './pages/admin/RegistroUsuarios'
import DescontosPorPrazo from './pages/configuracoes/DescontosPorPrazo'
import ConfiguracaoRotinas from './pages/configuracoes/ConfiguracaoRotinas'
import EntradaEFaixas from './pages/configuracoes/EntradaEFaixas'
import Placeholder from './pages/Placeholder'
import Comunicados from './pages/operacional/Comunicados'
import SAC from './pages/operacional/SAC'
import Pedidos from './pages/operacional/pedidos/Pedidos'
import RotinaDiaria from './pages/operacional/RotinaDiaria'
import FET from './pages/operacional/FET'
import ProAgenda from './pages/operacional/ProAgenda'
import Roteiros from './pages/diretrizes/Roteiros'
import Performance from './pages/operacional/Performance'
import Parceiros from './pages/operacional/Parceiros'
import Negociacao from './pages/comercial/Negociacao'
import Vendas from './pages/comercial/Vendas'
import FunilVendas from './pages/comercial/FunilVendas'
import Pacientes from './pages/comercial/Pacientes'
import ControleComissoes from './pages/comercial/ControleComissoes'
import Precificacao from './pages/administrativo/Precificacao'
import GestaoFiscal from './pages/financeiro/GestaoFiscal'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import Chat from './pages/Chat'
import { Loader2, Lock } from 'lucide-react'
import SmartLock from './pages/configuracoes/SmartLock'
import ControleAcesso from './pages/configuracoes/ControleAcesso'

const AccessDeniedMessage = ({ message }: { message: string }) => {
  const { signOut } = useAuth()
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 max-w-md w-full text-center space-y-4 shadow-xl">
        <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-semibold text-white">Acesso Bloqueado</h2>
        <p className="text-slate-400">{message}</p>
        <p className="text-sm text-slate-500">
          Caso precise acessar o sistema fora do seu horário, entre em contato com um administrador.
        </p>
        <button
          onClick={() => signOut()}
          className="mt-4 px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 transition-colors"
        >
          Sair do Sistema
        </button>
      </div>
    </div>
  )
}

const AccessGuard = ({ children }: { children: React.ReactNode }) => {
  const { profile, acessoConfig, loading, user } = useAuth()
  const location = useLocation()
  const [checking, setChecking] = useState(true)
  const [blockReason, setBlockReason] = useState<string | null>(null)

  useEffect(() => {
    if (loading || !user) return

    const checkAbsences = async () => {
      try {
        const now = new Date()
        const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
          .toISOString()
          .split('T')[0]

        const { data: absences } = await supabase
          .from('ausencias')
          .select('*')
          .or(`data.gte.${today},recorrencia.in.(semanal,mensal)`)

        if (absences && absences.length > 0) {
          const appliesToDate = (absence: any, dateStr: string, dateObj: Date) => {
            if (absence.recorrencia === 'nenhuma' || !absence.recorrencia) {
              return absence.data === dateStr
            }
            if (absence.data > dateStr) return false
            if (absence.data_fim && absence.data_fim < dateStr) return false

            if (absence.recorrencia === 'semanal') {
              const dayOfWeek = dateObj.getDay()
              return (
                absence.dias_semana &&
                Array.isArray(absence.dias_semana) &&
                absence.dias_semana.includes(dayOfWeek)
              )
            }
            if (absence.recorrencia === 'mensal') {
              return absence.dia_mes === dateObj.getDate()
            }
            return false
          }

          const nowObj = new Date()
          const todayAbsences = absences.filter((a) => appliesToDate(a, today, nowObj))
          const fullDayGlobal = todayAbsences.find((a) => !a.usuario_id && !a.hora_inicio)
          const fullDayUser = todayAbsences.find((a) => a.usuario_id === user.id && !a.hora_inicio)

          if (fullDayGlobal) {
            setBlockReason(`Sistema em recesso/feriado: ${fullDayGlobal.descricao}`)
            setChecking(false)
            return
          }

          if (fullDayUser) {
            setBlockReason(
              `Acesso restrito: Você está de ${fullDayUser.tipo} (${fullDayUser.descricao})`,
            )
            setChecking(false)
            return
          }
        }
        setBlockReason(null)
      } catch (error) {
        console.error('Error checking absences', error)
      } finally {
        setChecking(false)
      }
    }

    if (profile?.role === 'admin') {
      setChecking(false)
    } else {
      checkAbsences()
    }
  }, [loading, user, profile])

  if (loading || checking) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    )
  }

  const userRole = profile?.role || 'visualizacao'
  const isAdmin = userRole === 'admin'

  if (!isAdmin && blockReason) {
    return <AccessDeniedMessage message={blockReason} />
  }

  if (!isAdmin && acessoConfig) {
    const now = new Date()
    const day = now.getDay()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`

    if (day === 0) {
      return <AccessDeniedMessage message="O acesso ao sistema não é permitido aos domingos." />
    }

    let inicio = ''
    let fim = ''

    switch (day) {
      case 1:
        inicio = acessoConfig.seg_inicio
        fim = acessoConfig.seg_fim
        break
      case 2:
        inicio = acessoConfig.ter_inicio
        fim = acessoConfig.ter_fim
        break
      case 3:
        inicio = acessoConfig.qua_inicio
        fim = acessoConfig.qua_fim
        break
      case 4:
        inicio = acessoConfig.qui_inicio
        fim = acessoConfig.qui_fim
        break
      case 5:
        inicio = acessoConfig.sex_inicio
        fim = acessoConfig.sex_fim
        break
      case 6:
        inicio = acessoConfig.sab_inicio
        fim = acessoConfig.sab_fim
        break
    }

    if (inicio && fim) {
      inicio = inicio.substring(0, 5)
      fim = fim.substring(0, 5)

      if (currentTimeStr < inicio || currentTimeStr > fim) {
        return (
          <AccessDeniedMessage
            message={`O acesso ao sistema hoje é permitido apenas das ${inicio} às ${fim}.`}
          />
        )
      }
    }

    if (day === 6 && !location.pathname.startsWith('/intranet/performance')) {
      return <Navigate to="/intranet/performance" replace />
    }
  }

  return <>{children}</>
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
  const { profile, permissions, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    )
  }

  const userRole = profile?.role || 'visualizacao'

  if (userRole === 'admin') return <>{children}</>

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(userRole))
    return <Navigate to="/" replace />

  if (allowedPermissions && allowedPermissions.length > 0) {
    let hasAccess = allowedPermissions.some((p) => permissions.includes(p))

    if (allowedPermissions.includes('operacional_rotina') && profile?.exigir_rotina) {
      hasAccess = true
    }

    const isSaturdayPerformance =
      new Date().getDay() === 6 && location.pathname.startsWith('/intranet/performance')
    if (!hasAccess && !isSaturdayPerformance) return <Navigate to="/" replace />
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
      <Route
        element={
          <AccessGuard>
            <Layout />
          </AccessGuard>
        }
      >
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/chat" element={<Chat />} />

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
          path="/financeiro/fluxo"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Fluxo />
            </ProtectedRoute>
          }
        />
        <Route
          path="/configuracoes"
          element={
            <ProtectedRoute
              allowedRoles={[]}
              allowedPermissions={['configuracoes_usuarios', 'configuracoes_permissoes']}
            >
              <Configuracoes />
            </ProtectedRoute>
          }
        />
        <Route path="/colaboradores" element={<Navigate to="/usuarios" replace />} />
        <Route
          path="/usuarios"
          element={
            <ProtectedRoute allowedRoles={[]}>
              <Usuarios />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fornecedores"
          element={
            <ProtectedRoute allowedRoles={[]} allowedPermissions={['configuracoes_fornecedores']}>
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
          path="/configuracoes/rotinas"
          element={
            <ProtectedRoute allowedRoles={[]}>
              <ConfiguracaoRotinas />
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
        <Route
          path="/configuracoes/smart-lock"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <SmartLock />
            </ProtectedRoute>
          }
        />
        <Route
          path="/configuracoes/acesso"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ControleAcesso />
            </ProtectedRoute>
          }
        />

        {/* Intranet Routes */}
        <Route
          path="/operacional/performance"
          element={<Navigate to="/intranet/performance" replace />}
        />
        <Route
          path="/intranet/performance"
          element={
            <ProtectedRoute allowedRoles={[]} allowedPermissions={['operacional_performance']}>
              <Performance />
            </ProtectedRoute>
          }
        />

        {/* Operacional Routes */}
        <Route
          path="/operacional/pedidos"
          element={
            <ProtectedRoute
              allowedRoles={[]}
              allowedPermissions={['operacional_pedidos', 'operacional_pedidos_gerenciar']}
            >
              <Pedidos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operacional/sac"
          element={
            <ProtectedRoute allowedRoles={[]} allowedPermissions={['operacional_sac']}>
              <SAC />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operacional/rotina"
          element={
            <ProtectedRoute allowedRoles={[]} allowedPermissions={['operacional_rotina']}>
              <RotinaDiaria />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operacional/fet"
          element={
            <ProtectedRoute
              allowedRoles={[]}
              allowedPermissions={['operacional_fet', 'Acessar FET']}
            >
              <FET />
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
        <Route
          path="/operacional/parceiros"
          element={
            <ProtectedRoute allowedRoles={[]} allowedPermissions={['operacional_terceiros']}>
              <Parceiros />
            </ProtectedRoute>
          }
        />

        {/* Administrativo Routes */}
        <Route
          path="/administrativo/precificacao"
          element={
            <ProtectedRoute allowedRoles={[]}>
              <Precificacao />
            </ProtectedRoute>
          }
        />

        {/* Diretrizes Routes */}
        <Route
          path="/diretrizes/pro-agenda"
          element={
            <ProtectedRoute
              allowedRoles={[]}
              allowedPermissions={['operacional_pro_agenda', 'Acessar Pro Agenda']}
            >
              <ProAgenda />
            </ProtectedRoute>
          }
        />
        <Route
          path="/diretrizes/roteiros"
          element={
            <ProtectedRoute allowedRoles={[]}>
              <Roteiros />
            </ProtectedRoute>
          }
        />

        {/* Comercial Routes */}
        <Route
          path="/comercial/funil"
          element={
            <ProtectedRoute
              allowedRoles={[]}
              allowedPermissions={['comercial_funil', 'Acessar Funil de Vendas']}
            >
              <FunilVendas />
            </ProtectedRoute>
          }
        />
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
          path="/financeiro/fiscal"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <GestaoFiscal />
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
          <GlobalNormasPopup />
          <SacNotificationPopup />
        </TooltipProvider>
      </CacheProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App

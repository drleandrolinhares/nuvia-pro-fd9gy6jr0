import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from './components/Layout'
import Index from './pages/Index'
import Estoque from './pages/Estoque'
import Configuracoes from './pages/Configuracoes'
import Placeholder from './pages/Placeholder'
import NotFound from './pages/NotFound'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Index />} />
          <Route path="/estoque" element={<Estoque />} />
          <Route path="/configuracoes" element={<Configuracoes />} />

          {/* Operacional Routes */}
          <Route path="/operacional/sac" element={<Placeholder />} />
          <Route path="/operacional/rotina" element={<Placeholder />} />
          <Route path="/operacional/relatorio" element={<Placeholder />} />
          <Route path="/operacional/performance" element={<Placeholder />} />
          <Route path="/operacional/comunicados" element={<Placeholder />} />

          {/* Comercial Routes */}
          <Route path="/comercial/vendas" element={<Placeholder />} />
          <Route path="/comercial/negociacao" element={<Placeholder />} />
          <Route path="/comercial/fiscal" element={<Placeholder />} />

          {/* Financeiro Routes */}
          <Route path="/financeiro/acessos" element={<Placeholder />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </BrowserRouter>
)

export default App

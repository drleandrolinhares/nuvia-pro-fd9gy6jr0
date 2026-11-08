import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from './app-sidebar'
import { AppHeader } from './app-header'
import { cn } from '@/lib/utils'
import { AlertCircle, Home, RefreshCcw, ShieldAlert } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] w-full flex-col items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-destructive/20 bg-card p-7 text-center shadow-card">
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Não foi possível exibir esta página
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Ocorreu uma instabilidade ao renderizar o conteúdo. Recarregue para tentar novamente —
              seus dados não foram alterados.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
              <Button variant="outline" onClick={() => window.location.reload()}>
                <RefreshCcw className="size-4" /> Recarregar
              </Button>
              <Button onClick={() => (window.location.href = '/')}>
                <Home className="size-4" /> Ir para Início
              </Button>
            </div>
            {this.state.error?.message && (
              <p className="mt-5 break-words rounded-lg bg-muted/60 p-2.5 text-left font-mono text-[11px] leading-relaxed text-muted-foreground">
                {this.state.error.message}
              </p>
            )}
            <p className="mt-3 text-[11px] text-muted-foreground">
              As outras páginas continuam funcionando — use o menu ou o botão “Ir para Início”.
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default function Layout() {
  const location = useLocation()
  const { user, hasTenant, loading } = useAuth()
  const isViewer = location.pathname.includes('/viewer')
  const isLaboratorios = location.pathname.startsWith('/operacional/laboratorios')
  const isFullWidth =
    location.pathname.includes('/precificacao') ||
    location.pathname.includes('/intranet/onboarding') ||
    location.pathname.includes('/intranet/treinamentos') ||
    isLaboratorios ||
    isViewer
  const isChat = location.pathname.startsWith('/chat')

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex h-dvh w-full flex-col overflow-hidden bg-background">
        <AppHeader />
        {user && !loading && !hasTenant && (
          <div className="flex items-center justify-between gap-2 border-b border-warning/25 bg-warning/[0.09] px-4 py-2 text-xs text-warning">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span className="leading-relaxed">
                <strong className="font-semibold">Atenção:</strong> sua conta ainda não está
                vinculada ao tenant da clínica. Alguns dados podem não carregar — contate o
                administrador do sistema.
              </span>
            </div>
          </div>
        )}
        <main
          id="conteudo"
          className={cn(
            'app-canvas flex-1 overflow-x-hidden',
            isChat ? 'overflow-hidden' : 'overflow-y-auto custom-scrollbar',
            isLaboratorios ? 'p-0' : !isChat && !isViewer && 'px-4 py-5 md:px-7 md:py-7',
            isViewer && 'p-0',
          )}
        >
          <div
            className={cn(
              'mx-auto h-full w-full',
              !isChat && !isViewer && 'pb-10',
              !isChat && (isFullWidth ? 'max-w-full' : 'max-w-[1560px]'),
            )}
          >
            {/* `key` na rota: o ErrorBoundary reinicia a cada navegação.
                Sem isso, um erro em UMA página deixava o app inteiro preso
                na tela de erro — as páginas seguintes não abriam mais. */}
            <ErrorBoundary key={location.pathname}>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

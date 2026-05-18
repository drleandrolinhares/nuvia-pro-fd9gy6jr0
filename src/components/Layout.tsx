import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from './app-sidebar'
import { AppHeader } from './app-header'
import { cn } from '@/lib/utils'
import { AlertCircle, Home, RefreshCcw } from 'lucide-react'

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
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 w-full h-full">
          <div className="bg-white dark:bg-slate-900 border border-red-500/20 rounded-lg p-6 max-w-md w-full text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Erro de Visualização
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Encontramos um problema ao tentar exibir esta página. Isso pode ter sido causado pelo
              tradutor do navegador ou uma instabilidade momentânea.
            </p>
            <div className="flex gap-3 justify-center mt-6">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 font-medium"
              >
                <RefreshCcw className="w-4 h-4" /> Recarregar
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                className="px-4 py-2 bg-amber-500 text-slate-900 font-bold rounded hover:bg-amber-600 transition-colors flex items-center gap-2"
              >
                <Home className="w-4 h-4" /> Ir para Início
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default function Layout() {
  const location = useLocation()
  const isFullWidth =
    location.pathname.includes('/precificacao') ||
    location.pathname.includes('/intranet/onboarding')
  const isChat = location.pathname.startsWith('/chat')

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background flex flex-col h-dvh w-full overflow-hidden">
        <AppHeader />
        <main
          className={cn(
            'flex-1 overflow-x-hidden',
            isChat ? 'overflow-hidden' : 'overflow-y-auto p-4 md:p-8',
          )}
        >
          <div
            className={cn(
              'mx-auto w-full h-full',
              !isChat && 'pb-16',
              !isChat && (isFullWidth ? 'max-w-full' : 'max-w-[1600px]'),
            )}
          >
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

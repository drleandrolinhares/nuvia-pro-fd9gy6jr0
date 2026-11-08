import { createContext, useContext, type ReactNode } from 'react'
import { useAuth } from '@/hooks/use-auth'

/**
 * Guarda de ação por permissão.
 *
 * Regra de compatibilidade (importante): uma ação só é bloqueada quando foi
 * NEGADA explicitamente para o usuário (ou quando ele nem tem acesso à página).
 * Ação sem configuração continua liberada — assim, ligar este catálogo não
 * retira nenhum acesso que a equipe já usa hoje, mas permite bloquear botões
 * específicos por pessoa.
 */
export function useCan() {
  const { hasPermission, deniedPermissions, isAdmin, profile } = useAuth()

  const can = (acao: string, paginaRequerida?: string): boolean => {
    if (isAdmin) return true
    if (profile?.status?.toLowerCase() === 'inativo') return false
    if (paginaRequerida && !hasPermission(paginaRequerida)) return false
    if (deniedPermissions.includes(acao)) return false
    return true
  }

  return { can }
}

const CanContext = createContext<{ can: (a: string, p?: string) => boolean } | null>(null)

export function CanProvider({ children }: { children: ReactNode }) {
  const { can } = useCan()
  return <CanContext.Provider value={{ can }}>{children}</CanContext.Provider>
}

/** Renderiza os filhos apenas quando a ação está liberada. */
export function Can({
  acao,
  pagina,
  children,
  fallback = null,
}: {
  acao: string
  pagina?: string
  children: ReactNode
  fallback?: ReactNode
}) {
  const ctx = useContext(CanContext)
  const { can } = useCan()
  const check = ctx?.can ?? can
  return <>{check(acao, pagina) ? children : fallback}</>
}

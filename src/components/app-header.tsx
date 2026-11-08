import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Calculator, ChevronRight, Clock, CornerDownLeft, Search } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useClock } from '@/hooks/use-clock'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { CalculadoraSheet } from '@/components/calculadora'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useAuth } from '@/hooks/use-auth'
import { navData } from './app-sidebar'
import { cn } from '@/lib/utils'

/** Títulos legíveis para rotas que não aparecem no menu principal */
const EXTRA_ROUTE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/perfil': 'Meu Perfil',
  '/chat': 'Chat',
  '/usuarios': 'Usuários',
  '/fornecedores': 'Fornecedores',
  '/estoque': 'Estoque',
  '/configuracoes': 'Parâmetros Gerais',
  '/configuracoes/rotinas': 'Rotinas',
  '/configuracoes/descontos': 'Descontos por Prazo',
  '/configuracoes/faixas': 'Entrada e Faixas',
  '/configuracoes/smart-lock': 'Smart Lock',
  '/configuracoes/acesso': 'Controle de Acesso',
  '/admin/cadastros': 'Cadastros Básicos',
  '/admin/registro': 'Registro de Usuários',
  '/operacional/performance': 'Performance',
  '/intranet/performance': 'Performance',
  '/intranet/onboarding': 'Onboarding',
  '/intranet/treinamentos': 'Treinamentos',
  '/operacional/pedidos': 'Pedidos',
  '/operacional/sac': 'SAC',
  '/operacional/rotina': 'Rotina Diária',
  '/operacional/fet': 'FET',
  '/operacional/comunicados': 'Comunicados',
  '/operacional/parceiros': 'Parceiros',
  '/operacional/laboratorios': 'Laboratórios',
  '/operacional/invisalign': 'Invisalign',
  '/administrativo/precificacao': 'Precificação',
  '/diretrizes/pro-agenda': 'Pro Agenda',
  '/diretrizes/roteiros': 'Roteiros',
  '/comercial/funil': 'Funil de Vendas',
  '/comercial/vendas': 'Gestão de Vendas',
  '/comercial/negociacao': 'Negociação',
  '/comercial/comissoes': 'Comissões',
  '/comercial/pacientes': 'Pacientes',
  '/financeiro/fiscal': 'Gestão Fiscal',
}

const KEBAB_TO_TITLE: Record<string, string> = {
  perfil: 'Meu Perfil',
  chat: 'Chat',
  usuarios: 'Usuários',
  fornecedores: 'Fornecedores',
  estoque: 'Estoque',
  configuracoes: 'Configurações',
  rotinas: 'Rotinas',
  descontos: 'Descontos',
  faixas: 'Faixas',
  acesso: 'Controle de Acesso',
  cadastros: 'Cadastros Básicos',
  registro: 'Registro de Usuários',
}

const prettifySegment = (segment: string) =>
  KEBAB_TO_TITLE[segment] ||
  segment
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

const findParentGroup = (pathname: string) => {
  for (const group of navData as any[]) {
    if (group.isDirectLink && group.url === pathname) return null
    if (group.items?.some((item: any) => pathname === item.url)) return group.title
  }
  return null
}

export function AppHeader() {
  const timeString = useClock()
  const location = useLocation()
  const navigate = useNavigate()
  const { hasPermission } = useAuth()
  const [calculadoraOpen, setCalculadoraOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)

  /** Itens navegáveis do menu, já filtrados por permissão */
  const searchableItems = useMemo(() => {
    const items: { title: string; url: string; group: string; icon?: any }[] = []

    for (const group of navData as any[]) {
      if (group.isDirectLink) {
        if (!group.permission || hasPermission(group.permission)) {
          items.push({
            title: group.title,
            url: group.url,
            group: 'Principal',
            icon: group.icon,
          })
        }
        continue
      }

      for (const item of group.items || []) {
        if (item.permission && !hasPermission(item.permission)) continue
        items.push({
          title: item.title,
          url: item.url,
          group: group.title,
          icon: item.icon,
        })
      }
    }

    return items
  }, [hasPermission])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setPaletteOpen((open) => !open)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const segments = location.pathname.split('/').filter(Boolean)
  const currentTitle =
    EXTRA_ROUTE_TITLES[location.pathname] ||
    (segments.length ? prettifySegment(segments[segments.length - 1]) : 'Dashboard')
  const parentGroup = findParentGroup(location.pathname)
  const groupTitle = parentGroup || (segments.length ? prettifySegment(segments[0]) : null)

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border/70 bg-card/85 px-3 backdrop-blur-md supports-[backdrop-filter]:bg-card/70 md:h-16 md:px-5">
      <SidebarTrigger
        className="size-9 shrink-0 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label="Alternar menu lateral"
      />

      <div className="flex min-w-0 flex-1 items-center">
        <nav aria-label="Trilha de navegação" className="min-w-0">
          <ol className="flex min-w-0 items-center gap-1.5 text-[13px]">
            <li className="hidden shrink-0 sm:block">
              <Link
                to="/"
                className="font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Início
              </Link>
            </li>
            {groupTitle && (
              <>
                <li className="hidden text-muted-foreground/40 sm:block" aria-hidden="true">
                  <ChevronRight className="size-3.5" />
                </li>
                <li className="hidden min-w-0 sm:block">
                  <span className="block truncate font-medium uppercase tracking-[0.08em] text-[11px] text-muted-foreground/80">
                    {groupTitle}
                  </span>
                </li>
              </>
            )}
            <li className="text-muted-foreground/40" aria-hidden="true">
              <ChevronRight className="size-3.5 sm:hidden" />
            </li>
            <li className="min-w-0">
              <span
                aria-current="page"
                className="block truncate text-[14px] font-semibold tracking-tight text-foreground"
              >
                {currentTitle}
              </span>
            </li>
          </ol>
        </nav>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
        <div className="hidden items-center gap-2 rounded-lg border border-border/70 bg-muted/45 px-2.5 py-1.5 text-muted-foreground xl:flex">
          <Clock className="size-3.5" aria-hidden="true" />
          <span className="tabular text-[11px] font-semibold tracking-[0.04em]">{timeString}</span>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => setPaletteOpen(true)}
          className="hidden h-9 w-56 justify-start gap-2 px-3 text-[13px] font-normal text-muted-foreground lg:flex xl:w-64"
          aria-label="Buscar módulos do sistema"
        >
          <Search className="size-4 shrink-0 opacity-60" />
          <span className="truncate">Buscar módulos…</span>
          <kbd className="ml-auto hidden shrink-0 items-center gap-0.5 rounded border border-border/80 bg-muted px-1.5 py-0.5 font-sans text-[10px] font-semibold text-muted-foreground xl:inline-flex">
            Ctrl K
          </kbd>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setPaletteOpen(true)}
          className="size-9 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
          aria-label="Buscar módulos do sistema"
        >
          <Search className="size-4" />
        </Button>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setCalculadoraOpen(true)}
              aria-label="Abrir Calculadora NUVIA"
              className="size-9 shrink-0"
            >
              <Calculator className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Calculadora NUVIA</TooltipContent>
        </Tooltip>

        <CalculadoraSheet open={calculadoraOpen} onOpenChange={setCalculadoraOpen} />
      </div>

      <CommandDialog open={paletteOpen} onOpenChange={setPaletteOpen}>
        <CommandInput placeholder="Buscar módulo, tela ou recurso…" />
        <CommandList className="max-h-[min(60vh,420px)]">
          <CommandEmpty>Nenhum módulo encontrado.</CommandEmpty>
          {Object.entries(
            searchableItems.reduce<Record<string, typeof searchableItems>>((acc, item) => {
              acc[item.group] = acc[item.group] || []
              acc[item.group].push(item)
              return acc
            }, {}),
          ).map(([group, items]) => (
            <CommandGroup key={group} heading={group}>
              {items.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.url
                return (
                  <CommandItem
                    key={`${group}-${item.url}`}
                    value={`${item.title} ${group}`}
                    onSelect={() => {
                      navigate(item.url)
                      setPaletteOpen(false)
                    }}
                    className={cn(
                      'flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2',
                      isActive && 'bg-accent/70',
                    )}
                  >
                    {Icon ? (
                      <Icon className="size-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <CornerDownLeft className="size-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="text-[13px] font-medium">{item.title}</span>
                    {isActive && (
                      <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        atual
                      </span>
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </header>
  )
}

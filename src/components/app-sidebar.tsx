import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Activity,
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  ChevronRight,
  Clock,
  Filter,
  FileBarChart,
  FileText,
  Handshake,
  Landmark,
  LayoutDashboard,
  ListTodo,
  LogOut,
  MapIcon,
  MessageSquare,
  ClipboardList,
  Package,
  Settings,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Lock,
  Truck,
  Users,
  User,
  Calculator,
  UserPlus,
  GraduationCap,
  FlaskConical,
  Sparkles,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

export const navData = [
  {
    title: 'DASHBOARD',
    url: '/',
    icon: LayoutDashboard,
    isDirectLink: true,
    permission: ['Acessar Dashboard'],
  },
  {
    title: 'CHAT',
    url: '/chat',
    icon: MessageSquare,
    isDirectLink: true,
    permission: ['Acessar Chat'],
  },
  {
    title: 'INTRANET',
    icon: Users,
    items: [
      {
        title: 'PERFORMANCE',
        url: '/intranet/performance',
        icon: BarChart3,
        permission: ['Acessar Performance'],
      },
      {
        title: 'ONBOARDING',
        url: '/intranet/onboarding',
        icon: UserPlus,
        permission: ['Acessar Onboarding'],
      },
      {
        title: 'TREINAMENTOS',
        url: '/intranet/treinamentos',
        icon: GraduationCap,
        permission: ['Acessar Treinamentos'],
      },
    ],
  },
  {
    title: 'OPERACIONAL',
    icon: Activity,
    items: [
      {
        title: 'COMUNICADOS',
        url: '/operacional/comunicados',
        icon: Bell,
        permission: ['Acessar Comunicados'],
      },
      {
        title: 'SAC',
        url: '/operacional/sac',
        icon: MessageSquare,
        permission: ['Acessar SAC'],
      },
      {
        title: 'LABORATÓRIOS',
        url: '/operacional/laboratorios',
        icon: FlaskConical,
        permission: ['Acessar Laboratórios', 'Acessar Gestão de Terceiros'],
      },
      {
        title: 'INVISALIGN',
        url: '/operacional/invisalign',
        icon: Sparkles,
        permission: ['Acessar Gestão de Terceiros', 'Acessar Laboratórios'],
      },
      {
        title: 'PARCEIROS',
        url: '/operacional/parceiros',
        icon: ClipboardList,
        permission: ['Acessar Gestão de Terceiros'],
      },
      {
        title: 'PEDIDOS',
        url: '/operacional/pedidos',
        icon: Package,
        permission: ['Acessar Pedidos'],
      },
      {
        title: 'FET',
        url: '/operacional/fet',
        icon: FileText,
        permission: ['Acessar FET'],
      },
      {
        title: 'ROTINA DIÁRIA',
        url: '/operacional/rotina',
        icon: Clock,
        permission: ['Acessar Rotina Diária'],
      },
    ],
  },
  {
    title: 'COMERCIAL',
    icon: Briefcase,
    items: [
      {
        title: 'FUNIL DE VENDAS',
        url: '/comercial/funil',
        icon: Filter,
        permission: ['Acessar Funil de Vendas'],
      },
      {
        title: 'GESTÃO DE VENDAS',
        url: '/comercial/vendas',
        icon: FileBarChart,
        permission: ['Acessar Gestão de Vendas'],
      },
      {
        title: 'COMISSÕES',
        url: '/comercial/comissoes',
        icon: Landmark,
        permission: ['Acessar Controle de Comissões'],
      },
      {
        title: 'NEGOCIAÇÃO',
        url: '/comercial/negociacao',
        icon: Handshake,
        permission: ['Acessar Negociações'],
      },
      {
        title: 'PACIENTES',
        url: '/comercial/pacientes',
        icon: Users,
        permission: ['Acessar Pacientes'],
      },
    ],
  },
  {
    title: 'FINANCEIRO',
    icon: ShieldCheck,
    items: [
      {
        title: 'GESTÃO FISCAL',
        url: '/financeiro/fiscal',
        icon: Landmark,
        permission: ['Acessar Gestão Fiscal'],
      },
      {
        title: 'ESTOQUE',
        url: '/estoque',
        icon: Package,
        permission: ['Acessar Estoque'],
      },
    ],
  },
  {
    title: 'ADMINISTRATIVO',
    icon: FileText,
    items: [
      {
        title: 'PRECIFICAÇÃO',
        url: '/administrativo/precificacao',
        icon: Calculator,
        permission: ['Acessar Precificação'],
      },
    ],
  },
  {
    title: 'DIRETRIZES',
    icon: BookOpen,
    items: [
      {
        title: 'PRO AGENDA',
        url: '/diretrizes/pro-agenda',
        icon: FileText,
        permission: ['Acessar Pro Agenda'],
      },
      {
        title: 'ROTEIROS',
        url: '/diretrizes/roteiros',
        icon: MapIcon,
        permission: ['Acessar Roteiros'],
      },
    ],
  },
  {
    title: 'CONFIGURAÇÕES',
    icon: Shield,
    items: [
      {
        title: 'PARÂMETROS GERAIS',
        url: '/configuracoes',
        icon: SlidersHorizontal,
        permission: ['Acessar Parâmetros Gerais'],
      },
      {
        title: 'USUÁRIOS',
        url: '/usuarios',
        icon: Users,
        permission: ['Acessar Usuários'],
      },
      {
        title: 'FORNECEDORES',
        url: '/fornecedores',
        icon: Truck,
        permission: ['Acessar Fornecedores'],
      },
      {
        title: 'ROTINA',
        url: '/configuracoes/rotinas',
        icon: ListTodo,
        permission: ['Acessar Configurações de Rotinas'],
      },
      {
        title: 'SMART LOCK',
        url: '/configuracoes/smart-lock',
        icon: Lock,
        permission: ['Acessar Smart Lock'],
      },
    ],
  },
]

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

const OPEN_GROUPS_KEY = 'nuvia_sidebar_open_groups'

/** Pill de contagem — discreto, dourado, sem "gritar" na navegação */
function NavBadge({ value, className }: { value: number; className?: string }) {
  return (
    <span
      className={cn(
        'ml-auto inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-secondary/95 px-1.5 text-[10px] font-extrabold leading-none text-secondary-foreground shadow-sm',
        className,
      )}
    >
      {value > 99 ? '99+' : value}
    </span>
  )
}

export function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, profile, signOut, isAdmin, hasPermission } = useAuth()
  const { state, isMobile, setOpenMobile } = useSidebar()

  const [badges, setBadges] = useState({
    pedidos: 0,
    comunicados: 0,
    sac: 0,
    chat: 0,
    laboratorios: 0,
  })

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(OPEN_GROUPS_KEY)
      if (raw) return JSON.parse(raw)
    } catch (e) {
      /* estado inicial padrão */
    }
    return {}
  })

  const toggleGroup = (title: string, open: boolean) => {
    setOpenGroups((prev) => {
      const next = { ...prev, [title]: open }
      try {
        localStorage.setItem(OPEN_GROUPS_KEY, JSON.stringify(next))
      } catch (e) {
        /* preferência não persistida — não interrompe a navegação */
      }
      return next
    })
  }

  const fetchChatCountStandalone = async () => {
    if (!user?.id) return
    try {
      const { data } = await supabase.rpc('get_unread_chat_count', {
        p_usuario_id: user.id,
      })
      setBadges((prev) => {
        if (prev.chat !== (data || 0)) {
          return { ...prev, chat: data || 0 }
        }
        return prev
      })
    } catch (e) {
      console.error('Erro chat RT', e)
    }
  }

  useEffect(() => {
    const fetchCounts = async () => {
      if (!user?.id) return

      let newBadges = { pedidos: 0, comunicados: 0, sac: 0, chat: 0, laboratorios: 0 }

      try {
        const { count } = await supabase
          .from('sac_demandas')
          .select('*', { count: 'exact', head: true })
          .neq('status', 'resolvido')
        newBadges.sac = count || 0
      } catch (e) {
        console.error('Erro sac', e)
      }

      try {
        const lastVisitPedidos =
          localStorage.getItem('last_visit_pedidos') || '2000-01-01T00:00:00.000Z'
        const { count } = await supabase
          .from('pedidos_materiais')
          .select('*', { count: 'exact', head: true })
          .gt('data_criacao', lastVisitPedidos)
        newBadges.pedidos = count || 0
      } catch (e) {
        console.error('Erro pedidos', e)
      }

      try {
        const lastVisitComunicados =
          localStorage.getItem('last_visit_comunicados') || '2000-01-01T00:00:00.000Z'
        const { count } = await supabase
          .from('compromissos')
          .select('*', { count: 'exact', head: true })
          .gt('criado_em', lastVisitComunicados)
        newBadges.comunicados = count || 0
      } catch (e) {
        console.error('Erro comunicados', e)
      }

      try {
        const { data } = await supabase.rpc('get_unread_chat_count', {
          p_usuario_id: user.id,
        })
        newBadges.chat = data || 0
      } catch (e) {
        console.error('Erro chat', e)
      }

      try {
        // Alerta de laboratórios: trabalhos pendentes que vencem hoje/amanhã ou atrasados
        const hoje = new Date()
        const d1 = new Date(hoje.getTime() + 24 * 60 * 60 * 1000)
        const d1Str = d1.toISOString().split('T')[0]
        const { count } = await supabase
          .from('laboratorios_trabalhos')
          .select('*', { count: 'exact', head: true })
          .eq('entregue', false)
          .not('data_previsao_entrega', 'is', null)
          .lte('data_previsao_entrega', d1Str)
        newBadges.laboratorios = count || 0
      } catch (e) {
        console.error('Erro badges laboratorios', e)
      }

      setBadges(newBadges)
    }

    if (user?.id) fetchCounts()

    const channel = supabase
      .channel(`sidebar_badges_${user?.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sac_demandas' }, fetchCounts)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'pedidos_materiais' },
        fetchCounts,
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'compromissos' },
        fetchCounts,
      )
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_mensagens' }, () =>
        fetchChatCountStandalone(),
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'chat_participantes' },
        () => fetchChatCountStandalone(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  useEffect(() => {
    const handleChatRead = () => {
      fetchChatCountStandalone()
    }
    window.addEventListener('chat_read', handleChatRead)
    window.addEventListener('chat_updated', handleChatRead)

    if (location.pathname === '/operacional/pedidos') {
      localStorage.setItem('last_visit_pedidos', new Date().toISOString())
      setBadges((prev) => ({ ...prev, pedidos: 0 }))
    }
    if (location.pathname === '/operacional/comunicados') {
      localStorage.setItem('last_visit_comunicados', new Date().toISOString())
      setBadges((prev) => ({ ...prev, comunicados: 0 }))
    }

    fetchChatCountStandalone()

    return () => {
      window.removeEventListener('chat_read', handleChatRead)
      window.removeEventListener('chat_updated', handleChatRead)
    }
  }, [location.pathname, user?.id])

  useEffect(() => {
    const interval = setInterval(() => {
      fetchChatCountStandalone()
    }, 30000) // Ajustado para não sobrecarregar
    return () => clearInterval(interval)
  }, [user?.id])

  const getBadge = (title: string) => {
    if (title === 'PEDIDOS' && badges.pedidos > 0) return badges.pedidos
    if (title === 'COMUNICADOS' && badges.comunicados > 0) return badges.comunicados
    if (title === 'SAC' && badges.sac > 0) return badges.sac
    if (title === 'CHAT' && badges.chat > 0) return badges.chat
    if (title === 'LABORATÓRIOS' && badges.laboratorios > 0) return badges.laboratorios
    return null
  }

  const getGroupBadge = (items: any[]) => {
    if (!items) return null
    let total = 0
    items.forEach((item) => {
      const b = getBadge(item.title)
      if (b && typeof b === 'number') total += b

      if (item.subItems) {
        item.subItems.forEach((subItem: any) => {
          const subB = getBadge(subItem.title)
          if (subB && typeof subB === 'number') total += subB
        })
      }
    })
    return total > 0 ? total : null
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  const closeMobile = () => {
    if (isMobile) setOpenMobile(false)
  }

  const displayName =
    profile?.nome || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário'
  const initials =
    displayName
      .split(' ')
      .filter(Boolean)
      .map((n: string) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'US'
  const roleLabel =
    profile?.cargo_principal_nome ||
    profile?.cargo_principal?.nome ||
    (isAdmin ? 'Administrador' : 'Colaborador')

  return (
    <Sidebar className="border-r border-sidebar-border/80" data-state={state}>
      <SidebarHeader className="border-b border-white/[0.06] px-3 py-3.5">
        <Link
          to="/"
          onClick={closeMobile}
          className="group flex items-center gap-3 rounded-lg px-2 py-1 outline-none transition-colors hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-sidebar-ring/60"
        >
          <div className="relative grid size-9 shrink-0 place-items-center rounded-[10px] bg-gradient-to-br from-[hsl(var(--gold))] to-[hsl(var(--gold-strong))] shadow-[0_2px_10px_-2px_hsl(var(--gold)/0.55)]">
            <span className="text-[15px] font-extrabold leading-none tracking-tighter text-[hsl(var(--navy-deep))]">
              N
            </span>
          </div>
          <div className="flex min-w-0 flex-col leading-none">
            <span className="text-[15px] font-extrabold tracking-[0.14em] text-white">
              NUVIA
              <span className="ml-1 font-semibold tracking-[0.10em] text-[hsl(var(--gold))]">
                PRO
              </span>
            </span>
            <span className="mt-1 truncate text-[10px] font-medium uppercase tracking-[0.16em] text-sidebar-foreground/45">
              Odontologia
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        {navData.map((group: any) => {
          if (group.isDirectLink) {
            if (group.permission) {
              if (!hasPermission(group.permission)) return null
            }
            const active = location.pathname === group.url
            const Icon = group.icon
            const badge = getBadge(group.title)

            return (
              <SidebarGroup key={group.title} className="p-0">
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={group.title}
                      className={cn(
                        'relative h-9 gap-2.5 rounded-lg px-2.5 text-[13px] font-semibold text-sidebar-foreground/72',
                        'hover:bg-white/[0.06] hover:text-white',
                        'data-[active=true]:bg-white/[0.09] data-[active=true]:text-white',
                        'data-[active=true]:before:absolute data-[active=true]:before:left-0 data-[active=true]:before:top-1/2 data-[active=true]:before:h-5 data-[active=true]:before:w-[3px] data-[active=true]:before:-translate-y-1/2 data-[active=true]:before:rounded-r-full data-[active=true]:before:bg-[hsl(var(--gold))]',
                      )}
                    >
                      <Link to={group.url} onClick={closeMobile}>
                        {Icon && (
                          <Icon
                            className={cn(
                              'size-[17px] shrink-0',
                              active ? 'text-[hsl(var(--gold))]' : 'text-sidebar-foreground/55',
                            )}
                          />
                        )}
                        <span className="truncate">{group.title}</span>
                        {badge && <NavBadge value={badge} />}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>
            )
          }

          const filteredItems =
            group.items?.filter((item: any) => {
              if (item.title === 'ROTINA DIÁRIA' && profile?.exigir_rotina === false) {
                return false
              }

              if (item.permission) {
                return hasPermission(item.permission)
              }

              return false // Zero Trust: must have explicit permission mapping
            }) || []

          if (filteredItems.length === 0) return null

          const groupActive = filteredItems.some(
            (item: any) =>
              location.pathname === item.url || location.pathname.startsWith(`${item.url}/`),
          )
          const isOpen = openGroups[group.title] ?? false
          const GroupIcon = group.icon
          const groupBadge = getGroupBadge(filteredItems)

          return (
            <Collapsible
              key={group.title}
              open={isOpen}
              onOpenChange={(open) => toggleGroup(group.title, open)}
              className="group/collapsible py-0.5"
            >
              <SidebarGroup className="p-0">
                <SidebarGroupLabel asChild>
                  <CollapsibleTrigger
                    className={cn(
                      'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[10.5px] font-bold uppercase tracking-[0.14em]',
                      'text-sidebar-foreground/42 transition-colors hover:bg-white/[0.04] hover:text-sidebar-foreground/75',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/50',
                      groupActive && 'text-sidebar-foreground/70',
                    )}
                  >
                    {GroupIcon && <GroupIcon className="size-[13px] shrink-0 opacity-70" />}
                    <span className="truncate">{group.title}</span>
                    <span className="ml-auto flex items-center gap-1.5">
                      {groupBadge && (
                        <NavBadge value={groupBadge} className="h-[18px] text-[10px]" />
                      )}
                      <ChevronRight
                        className={cn(
                          'size-3.5 shrink-0 opacity-50 transition-transform duration-200',
                          isOpen && 'rotate-90',
                        )}
                      />
                    </span>
                  </CollapsibleTrigger>
                </SidebarGroupLabel>

                <CollapsibleContent>
                  <SidebarGroupContent className="pt-0.5">
                    <SidebarMenu>
                      {filteredItems.map((item: any) => {
                        const ItemIcon = item.icon
                        const active =
                          location.pathname === item.url ||
                          location.pathname.startsWith(`${item.url}/`)

                        if (item.subItems) {
                          return (
                            <Collapsible key={item.title} className="group/sub">
                              <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                  <SidebarMenuButton className="h-9 gap-2.5 rounded-lg px-2.5 text-[13px] font-medium text-sidebar-foreground/72 hover:bg-white/[0.06] hover:text-white">
                                    {ItemIcon && <ItemIcon className="size-[17px] opacity-60" />}
                                    <span className="truncate">{item.title}</span>
                                    <ChevronRight className="ml-auto size-3.5 opacity-40 transition-transform group-data-[state=open]/sub:rotate-90" />
                                  </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <SidebarMenuSub className="ml-4 border-l border-white/[0.08] py-1 pl-2">
                                    {item.subItems.map((sub: any) => (
                                      <SidebarMenuSubItem key={sub.title}>
                                        <SidebarMenuSubButton
                                          asChild
                                          isActive={location.pathname === sub.url}
                                          className="h-8 rounded-md text-[12.5px] text-sidebar-foreground/65 hover:bg-white/[0.06] hover:text-white data-[active=true]:bg-white/[0.09] data-[active=true]:font-semibold data-[active=true]:text-white"
                                        >
                                          <Link to={sub.url} onClick={closeMobile}>
                                            <span className="truncate">{sub.title}</span>
                                          </Link>
                                        </SidebarMenuSubButton>
                                      </SidebarMenuSubItem>
                                    ))}
                                  </SidebarMenuSub>
                                </CollapsibleContent>
                              </SidebarMenuItem>
                            </Collapsible>
                          )
                        }

                        return (
                          <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                              asChild
                              isActive={active}
                              tooltip={item.title}
                              className={cn(
                                'relative h-9 gap-2.5 rounded-lg px-2.5 text-[13px] font-medium text-sidebar-foreground/72',
                                'hover:bg-white/[0.06] hover:text-white',
                                'data-[active=true]:bg-white/[0.09] data-[active=true]:font-semibold data-[active=true]:text-white',
                                'data-[active=true]:before:absolute data-[active=true]:before:left-0 data-[active=true]:before:top-1/2 data-[active=true]:before:h-5 data-[active=true]:before:w-[3px] data-[active=true]:before:-translate-y-1/2 data-[active=true]:before:rounded-r-full data-[active=true]:before:bg-[hsl(var(--gold))]',
                              )}
                            >
                              <Link to={item.url} onClick={closeMobile}>
                                {ItemIcon && (
                                  <ItemIcon
                                    className={cn(
                                      'size-[17px] shrink-0',
                                      active
                                        ? 'text-[hsl(var(--gold))]'
                                        : 'text-sidebar-foreground/55',
                                    )}
                                  />
                                )}
                                <span className="truncate">{item.title}</span>
                                {getBadge(item.title) && (
                                  <NavBadge value={getBadge(item.title) as number} />
                                )}
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        )
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          )
        })}
      </SidebarContent>

      <SidebarFooter className="border-t border-white/[0.06] p-2.5">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left outline-none',
                    'transition-colors hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-sidebar-ring/50',
                    'data-[state=open]:bg-white/[0.07]',
                  )}
                >
                  <Avatar className="size-8 shrink-0 ring-1 ring-white/10">
                    <AvatarImage
                      src={
                        (profile as any)?.avatar_url ||
                        user?.user_metadata?.avatar_url ||
                        `https://img.usecurling.com/ppl/thumbnail?gender=male&seed=${user?.id || '1'}`
                      }
                    />
                    <AvatarFallback className="bg-[hsl(var(--gold))] text-[11px] font-extrabold text-[hsl(var(--navy-deep))]">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-1 flex-col leading-tight">
                    <span className="truncate text-[12.5px] font-semibold text-white">
                      {displayName}
                    </span>
                    <span className="truncate text-[11px] text-sidebar-foreground/45">
                      {roleLabel}
                    </span>
                  </div>
                  <Settings className="size-4 shrink-0 text-sidebar-foreground/35" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="end" className="mb-1 w-60">
                <DropdownMenuLabel className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-semibold">{displayName}</span>
                  <span className="text-[11px] font-normal text-muted-foreground">
                    {user?.email || 'sem e-mail'}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigate('/perfil')}
                  className="cursor-pointer gap-2.5"
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Meu Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer gap-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sair do Sistema</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

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

/** Contador discreto — não compete com o rótulo do menu */
function NavBadge({ value }: { value: number }) {
  return (
    <span className="ml-auto inline-flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-destructive px-1 text-[9.5px] font-bold leading-none text-destructive-foreground">
      {value > 99 ? '99+' : value}
    </span>
  )
}

export function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, profile, signOut, isAdmin, hasPermission } = useAuth()
  const { isMobile, setOpenMobile } = useSidebar()

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
      /* preferência não persistida — não interrompe a navegação */
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
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="px-3 py-3">
        <Link
          to="/"
          onClick={closeMobile}
          className="flex items-center gap-2.5 rounded-lg px-1.5 py-1 outline-none transition-colors hover:bg-sidebar-accent/70 focus-visible:ring-2 focus-visible:ring-sidebar-ring/40"
        >
          <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary">
            <span className="text-[13px] font-extrabold leading-none tracking-tighter text-primary-foreground">
              N
            </span>
          </div>
          <div className="flex min-w-0 flex-col leading-none">
            <span className="text-[14px] font-bold tracking-[0.06em] text-foreground">
              NUVIA<span className="ml-1 font-semibold text-secondary">PRO</span>
            </span>
            <span className="mt-1 truncate text-[9.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Odontologia
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 pb-2">
        {navData.map((group: any) => {
          if (group.isDirectLink) {
            if (group.permission && !hasPermission(group.permission)) return null

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
                        'h-9 rounded-lg px-2.5 text-[13px] font-semibold',
                        'text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground',
                        'data-[active=true]:bg-secondary/15 data-[active=true]:font-semibold data-[active=true]:text-foreground',
                      )}
                    >
                      <Link to={group.url} onClick={closeMobile}>
                        {Icon && (
                          <Icon
                            className={cn(
                              'size-[17px] shrink-0',
                              active
                                ? 'text-secondary-foreground dark:text-secondary'
                                : 'text-muted-foreground',
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
          const isOpen = openGroups[group.title] ?? groupActive
          const GroupIcon = group.icon
          const groupBadge = getGroupBadge(filteredItems)

          return (
            <Collapsible
              key={group.title}
              open={isOpen}
              onOpenChange={(open) => toggleGroup(group.title, open)}
              className="group/collapsible"
            >
              <SidebarGroup className="p-0">
                <SidebarGroupLabel asChild>
                  <CollapsibleTrigger
                    className={cn(
                      'flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-[10px] font-bold uppercase tracking-[0.09em]',
                      'text-muted-foreground/70 transition-colors hover:bg-sidebar-accent/60 hover:text-foreground',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/40',
                      groupActive && 'text-muted-foreground',
                    )}
                  >
                    {GroupIcon && <GroupIcon className="size-3 shrink-0 opacity-45" />}
                    <span className="truncate">{group.title}</span>
                    <span className="ml-auto flex items-center gap-1.5">
                      {groupBadge && <NavBadge value={groupBadge} />}
                      <ChevronRight
                        className={cn(
                          'size-3.5 shrink-0 opacity-40 transition-transform duration-200',
                          isOpen && 'rotate-90',
                        )}
                      />
                    </span>
                  </CollapsibleTrigger>
                </SidebarGroupLabel>

                <CollapsibleContent>
                  <SidebarGroupContent>
                    {/* Trilho vertical: marca onde começa a hierarquia filha.
                        Sem ele, item-filho e rótulo do grupo parecem irmãos. */}
                    <div className="relative ml-4 border-l-2 border-border-strong/70 py-0.5 pl-2.5">
                      <SidebarMenu className="gap-0.5">
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
                                    <SidebarMenuButton className="h-8 rounded-md px-2 text-[12.5px] font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground">
                                      {ItemIcon && (
                                        <ItemIcon className="size-[15px] shrink-0 text-muted-foreground/80" />
                                      )}
                                      <span className="truncate">{item.title}</span>
                                      <ChevronRight className="ml-auto size-3 opacity-40 transition-transform group-data-[state=open]/sub:rotate-90" />
                                    </SidebarMenuButton>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent>
                                    <SidebarMenuSub className="ml-1.5 border-l border-border-strong/60 py-0.5 pl-2">
                                      {item.subItems.map((sub: any) => (
                                        <SidebarMenuSubItem key={sub.title}>
                                          <SidebarMenuSubButton
                                            asChild
                                            isActive={location.pathname === sub.url}
                                            className="h-7 rounded-md text-[12px] text-muted-foreground hover:bg-sidebar-accent hover:text-foreground data-[active=true]:bg-secondary/15 data-[active=true]:font-semibold data-[active=true]:text-foreground"
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
                                  'h-8 rounded-md px-2 text-[12.5px] font-medium',
                                  'text-sidebar-foreground transition-colors',
                                  'hover:bg-sidebar-accent hover:text-foreground',
                                  'data-[active=true]:bg-secondary/15 data-[active=true]:font-semibold data-[active=true]:text-foreground',
                                )}
                              >
                                <Link to={item.url} onClick={closeMobile}>
                                  {ItemIcon && (
                                    <ItemIcon
                                      className={cn(
                                        'size-[15px] shrink-0',
                                        active
                                          ? 'text-secondary-foreground dark:text-secondary'
                                          : 'text-muted-foreground/80',
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
                    </div>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          )
        })}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2.5">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left outline-none',
                    'transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring/40',
                    'data-[state=open]:bg-sidebar-accent',
                  )}
                >
                  <Avatar className="size-8 shrink-0 ring-1 ring-border">
                    <AvatarImage
                      src={
                        (profile as any)?.avatar_url ||
                        user?.user_metadata?.avatar_url ||
                        `https://img.usecurling.com/ppl/thumbnail?gender=male&seed=${user?.id || '1'}`
                      }
                    />
                    <AvatarFallback className="bg-muted text-[11px] font-bold text-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-1 flex-col leading-tight">
                    <span className="truncate text-[12.5px] font-semibold text-foreground">
                      {displayName}
                    </span>
                    <span className="truncate text-[11px] text-muted-foreground">{roleLabel}</span>
                  </div>
                  <Settings className="size-4 shrink-0 text-muted-foreground/70" />
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

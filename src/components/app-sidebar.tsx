import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Activity,
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  ChevronRight,
  Clock,
  CloudCog,
  Database,
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

const navData = [
  {
    title: 'DASHBOARD',
    url: '/',
    icon: LayoutDashboard,
    isDirectLink: true,
  },
  {
    title: 'CHAT',
    url: '/chat',
    icon: MessageSquare,
    isDirectLink: true,
  },
  {
    title: 'INTRANET',
    icon: Users,
    items: [
      {
        title: 'PERFORMANCE',
        url: '/intranet/performance',
        icon: BarChart3,
        permission: ['operacional_performance', 'Acessar Performance'],
      },
      {
        title: 'ONBOARDING',
        url: '/intranet/onboarding',
        icon: UserPlus,
      },
      {
        title: 'TREINAMENTOS',
        url: '/intranet/treinamentos',
        icon: GraduationCap,
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
        permission: ['operacional_comunicados', 'Acessar Comunicados'],
      },
      {
        title: 'SAC',
        url: '/operacional/sac',
        icon: MessageSquare,
        permission: ['operacional_sac', 'Acessar SAC'],
      },
      {
        title: 'PARCEIROS',
        url: '/operacional/parceiros',
        icon: ClipboardList,
        permission: ['operacional_terceiros', 'Acessar Gestão de Terceiros'],
      },
      {
        title: 'PEDIDOS',
        url: '/operacional/pedidos',
        icon: Package,
        permission: ['operacional_pedidos', 'operacional_pedidos_gerenciar'],
      },
      {
        title: 'FET',
        url: '/operacional/fet',
        icon: FileText,
        permission: ['operacional_fet', 'Acessar FET'],
      },
      {
        title: 'ROTINA DIÁRIA',
        url: '/operacional/rotina',
        icon: Clock,
        permission: ['operacional_rotina', 'Acessar Rotina Diária'],
        hideRole: ['admin', 'gestor', 'CEO', 'SÓCIA', 'ceo', 'sócia'],
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
        permission: ['comercial_funil', 'Acessar Funil de Vendas'],
      },
      {
        title: 'GESTÃO DE VENDAS',
        url: '/comercial/vendas',
        icon: FileBarChart,
        permission: ['comercial_vendas', 'Acessar Gestão de Vendas'],
      },
      {
        title: 'COMISSÕES',
        url: '/comercial/comissoes',
        icon: Landmark,
        permission: ['comercial_comissoes', 'Acessar Controle de Comissões'],
      },
      {
        title: 'NEGOCIAÇÃO',
        url: '/comercial/negociacao',
        icon: Handshake,
        permission: ['comercial_negociacao', 'Acessar Negociações'],
      },
      {
        title: 'PACIENTES',
        url: '/comercial/pacientes',
        icon: Users,
        permission: ['comercial_pacientes', 'Acessar Pacientes'],
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
        permission: ['financeiro_fiscal', 'Acessar Financeiro', 'Acessar Gestão Fiscal'],
      },
      {
        title: 'FLUXO DE CAIXA',
        url: '/financeiro/fluxo',
        icon: Activity,
        permission: ['financeiro_fluxo', 'Acessar Financeiro', 'Acessar Fluxo de Caixa'],
      },
      {
        title: 'ESTOQUE',
        url: '/estoque',
        icon: Package,
        permission: ['financeiro_estoque', 'Acessar Estoque', 'Gerenciar Estoque'],
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
        showRole: ['admin'],
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
        permission: ['operacional_pro_agenda', 'Acessar Pro Agenda'],
      },
      {
        title: 'ROTEIROS',
        url: '/diretrizes/roteiros',
        icon: MapIcon,
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
        permission: ['configuracoes_usuarios', 'configuracoes_permissoes'],
      },
      { title: 'USUÁRIOS', url: '/usuarios', icon: Users, showRole: ['admin'] },
      {
        title: 'FORNECEDORES',
        url: '/fornecedores',
        icon: Truck,
        permission: ['configuracoes_fornecedores'],
      },
      {
        title: 'ROTINA',
        url: '/configuracoes/rotinas',
        icon: ListTodo,
        showRole: ['admin'],
      },
      {
        title: 'SMART LOCK',
        url: '/configuracoes/smart-lock',
        icon: Lock,
        showRole: ['admin'],
      },
    ],
  },
]

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, profile, permissions, signOut } = useAuth()

  const [badges, setBadges] = useState({
    pedidos: 0,
    comunicados: 0,
    sac: 0,
    chat: 0,
  })

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

      let newBadges = { pedidos: 0, comunicados: 0, sac: 0, chat: 0 }

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

  return (
    <Sidebar className="border-r-sidebar-border">
      <SidebarHeader className="p-4 mb-8">
        <Link to="/" className="flex items-center gap-3 px-2 py-2">
          <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
            <CloudCog className="size-6" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="text-xl font-bold text-secondary tracking-widest">NUVIA</span>
            <span className="text-[10px] text-sidebar-foreground/70 tracking-[0.2em] uppercase">
              Odontologia
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 pt-2">
        {navData.map((group: any) => {
          const role = profile?.role?.toLowerCase() || 'visualizacao'

          if (group.showRole && !group.showRole.includes(role) && role !== 'admin') {
            return null
          }

          if (group.isDirectLink) {
            return (
              <SidebarGroup key={group.title} className="py-1 mb-2">
                <SidebarGroupLabel
                  asChild
                  className="text-sidebar-foreground/70 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 cursor-pointer rounded-md"
                >
                  <Link to={group.url} className="flex w-full items-center justify-between py-2">
                    <div className="flex items-center gap-2 font-bold tracking-wider text-xs text-amber-500 uppercase">
                      {group.icon && <group.icon className="size-4 text-amber-500" />}
                      {group.title}
                    </div>
                    {getBadge(group.title) && (
                      <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[20px] text-center shrink-0">
                        {getBadge(group.title)}
                      </span>
                    )}
                  </Link>
                </SidebarGroupLabel>
              </SidebarGroup>
            )
          }

          const filteredItems =
            group.items?.filter((item: any) => {
              if (item.title === 'ROTINA DIÁRIA') {
                if (profile?.exigir_rotina === false) return false
                if (profile?.exigir_rotina === true) return true
              }

              if (
                item.hideRole &&
                item.hideRole.some((r: string) => r.toLowerCase() === role?.toLowerCase())
              )
                return false

              if (role === 'admin') return true
              if (item.permission) {
                if (Array.isArray(item.permission)) {
                  return item.permission.some((p: string) => permissions.includes(p))
                }
                return permissions.includes(item.permission)
              }
              if (item.showRole && !item.showRole.includes(role)) return false
              return true
            }) || []

          if (filteredItems.length === 0) return null

          return (
            <Collapsible
              key={group.title}
              defaultOpen={group.defaultOpen}
              className="group/collapsible py-1"
            >
              <SidebarGroup>
                <SidebarGroupLabel
                  asChild
                  className="text-sidebar-foreground/70 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 cursor-pointer rounded-md"
                >
                  <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
                    <div className="flex items-center gap-2 font-bold tracking-wider text-xs text-amber-500 uppercase">
                      {group.icon && <group.icon className="size-4 text-amber-500" />}
                      {group.title}
                    </div>
                    <div className="flex items-center gap-2">
                      {getGroupBadge(filteredItems) && (
                        <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[20px] text-center shrink-0">
                          {getGroupBadge(filteredItems)}
                        </span>
                      )}
                      <ChevronRight className="size-4 transition-transform group-data-[state=open]/collapsible:rotate-90 text-amber-500/50" />
                    </div>
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent className="pt-1">
                    <SidebarMenu>
                      {filteredItems.map((item: any) => {
                        const ItemIcon = item.icon

                        if (item.subItems) {
                          return (
                            <Collapsible key={item.title} className="group/sub">
                              <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                  <SidebarMenuButton className="pl-8 justify-between hover:bg-sidebar-accent text-white hover:text-white w-full font-medium">
                                    <div className="flex items-center gap-2">
                                      {ItemIcon && <ItemIcon />}
                                      <span>{item.title}</span>
                                    </div>
                                    <ChevronRight className="size-4 transition-transform group-data-[state=open]/sub:rotate-90 text-white/50" />
                                  </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <SidebarMenuSub className="ml-10 border-l border-sidebar-border pr-0 mr-0 mt-1">
                                    {item.subItems.map((sub: any) => (
                                      <SidebarMenuSubItem key={sub.title}>
                                        <SidebarMenuSubButton
                                          asChild
                                          isActive={location.pathname === sub.url}
                                          className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-white text-white hover:text-white data-[active=true]:font-bold py-1.5 h-auto font-medium"
                                        >
                                          <Link to={sub.url}>
                                            <span>{sub.title}</span>
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
                              isActive={location.pathname === item.url}
                              className="pl-8 data-[active=true]:bg-sidebar-accent data-[active=true]:text-white text-white hover:text-white data-[active=true]:font-bold font-medium"
                            >
                              <Link
                                to={item.url}
                                className="flex items-center justify-between w-full"
                              >
                                <div className="flex items-center gap-2">
                                  {ItemIcon && <ItemIcon />}
                                  <span>{item.title}</span>
                                </div>
                                {getBadge(item.title) && (
                                  <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[20px] text-center shrink-0">
                                    {getBadge(item.title)}
                                  </span>
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

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 px-2 py-2 mb-2 cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md transition-colors w-full outline-none">
                  <Avatar className="size-9 border border-sidebar-border">
                    <AvatarImage
                      src={
                        (profile as any)?.avatar_url ||
                        user?.user_metadata?.avatar_url ||
                        `https://img.usecurling.com/ppl/thumbnail?gender=male&seed=${user?.id || '1'}`
                      }
                    />
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      {user?.user_metadata?.name?.substring(0, 2)?.toUpperCase() ||
                        user?.email?.substring(0, 2)?.toUpperCase() ||
                        'US'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col overflow-hidden flex-1 text-left">
                    <span className="text-sm font-medium truncate text-sidebar-foreground">
                      {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário'}
                    </span>
                    <span className="text-xs text-sidebar-foreground/60 truncate">
                      {user?.email || ''}
                    </span>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="end" className="w-56 mb-2">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/perfil')} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Meu Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
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

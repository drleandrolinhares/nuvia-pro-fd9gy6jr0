import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Activity,
  BarChart3,
  Bell,
  Briefcase,
  ChevronRight,
  Clock,
  CloudCog,
  Database,
  FileBarChart,
  FileText,
  Handshake,
  Landmark,
  LayoutDashboard,
  ListTodo,
  LogOut,
  MessageSquare,
  ClipboardList,
  Package,
  Settings,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Truck,
  Users,
  User,
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
    title: 'SISTEMA',
    items: [{ title: 'Dashboard', url: '/', icon: LayoutDashboard }],
  },
  {
    title: 'OPERACIONAL',
    icon: Activity,
    items: [
      {
        title: 'SAC',
        url: '/operacional/sac',
        icon: MessageSquare,
        permission: ['operacional_sac', 'Acessar SAC'],
      },
      {
        title: 'Rotina Diária',
        url: '/operacional/rotina',
        icon: Clock,
        permission: ['operacional_rotina', 'Acessar Rotina Diária'],
        hideRole: ['admin', 'gestor', 'CEO', 'SÓCIA', 'ceo', 'sócia'],
      },
      {
        title: 'PERFORMANCE',
        url: '/operacional/performance',
        icon: BarChart3,
        permission: ['operacional_performance', 'Acessar Performance'],
      },
      {
        title: 'COMUNICADOS',
        url: '/operacional/comunicados',
        icon: Bell,
        permission: ['operacional_comunicados', 'Acessar Comunicados'],
      },
      {
        title: 'PARCEIROS',
        url: '/operacional/parceiros',
        icon: ClipboardList,
        permission: ['operacional_terceiros', 'Acessar Gestão de Terceiros'],
      },
    ],
  },
  {
    title: 'COMERCIAL',
    icon: Briefcase,
    items: [
      {
        title: 'Gestão de Vendas',
        url: '/comercial/vendas',
        icon: FileBarChart,
        permission: ['comercial_vendas', 'Acessar Gestão de Vendas'],
      },
      {
        title: 'Controle de Comissões',
        url: '/comercial/comissoes',
        icon: Landmark,
        permission: ['comercial_comissoes', 'Acessar Controle de Comissões'],
      },
      {
        title: 'Pacientes',
        url: '/comercial/pacientes',
        icon: Users,
        permission: ['comercial_pacientes', 'Acessar Pacientes'],
      },
      {
        title: 'Negociação',
        url: '/comercial/negociacao',
        icon: Handshake,
        permission: ['comercial_negociacao', 'Acessar Negociações'],
      },
    ],
  },
  {
    title: 'FINANCEIRO',
    icon: ShieldCheck,
    defaultOpen: true,
    items: [
      {
        title: 'Estoque',
        url: '/estoque',
        icon: Package,
        permission: ['financeiro_estoque', 'Acessar Estoque', 'Gerenciar Estoque'],
      },
    ],
  },
  {
    title: 'CONFIGURAÇÕES',
    icon: Shield,
    items: [
      { title: 'Cadastros Básicos', url: '/admin/cadastros', icon: Database, showRole: ['admin'] },
      {
        title: 'Parâmetros Gerais',
        url: '/configuracoes',
        icon: SlidersHorizontal,
        permission: [
          'configuracoes_geral',
          'configuracoes_usuarios',
          'configuracoes_permissoes',
          'configuracoes_parametros',
          'configuracoes_fornecedores',
        ],
      },
      { title: 'Colaboradores', url: '/colaboradores', icon: Users, showRole: ['admin'] },
      {
        title: 'Fornecedores',
        url: '/fornecedores',
        icon: Truck,
        permission: ['configuracoes_fornecedores'],
      },
      {
        title: 'Configuração de Rotinas',
        url: '/configuracoes/rotinas',
        icon: ListTodo,
        showRole: ['admin'],
      },
      {
        title: 'NEGOCIAÇÃO DADOS',
        icon: FileText,
        showRole: ['admin'],
        subItems: [
          { title: 'Descontos por Prazo', url: '/configuracoes/descontos' },
          { title: 'Entrada Padrão e Faixas', url: '/configuracoes/faixas' },
        ],
      },
    ],
  },
]

export function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, profile, permissions, signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <Sidebar className="border-r-sidebar-border">
      <SidebarHeader className="p-4">
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

      <SidebarContent className="px-2">
        {navData.map((group: any) => {
          const role = profile?.role || 'visualizacao'

          if (group.showRole && !group.showRole.includes(role) && role !== 'admin') {
            return null
          }

          const filteredItems = group.items.filter((item: any) => {
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
          })

          if (filteredItems.length === 0) return null

          const SingleItemIcon = filteredItems[0]?.icon

          return filteredItems.length === 1 && !group.icon ? (
            <SidebarGroup key={group.title} className="py-2">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === filteredItems[0].url}
                    className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground font-semibold"
                  >
                    <Link to={filteredItems[0].url}>
                      {SingleItemIcon && <SingleItemIcon />}
                      <span>{filteredItems[0].title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          ) : (
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
                    <div className="flex items-center gap-2 font-bold tracking-wider text-xs text-amber-500">
                      {group.icon && <group.icon className="size-4 text-amber-500" />}
                      {group.title}
                    </div>
                    <ChevronRight className="size-4 transition-transform group-data-[state=open]/collapsible:rotate-90 text-sidebar-foreground/50" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent className="pt-1">
                    <SidebarMenu>
                      {filteredItems.map((item: any) => {
                        const ItemIcon = item.icon

                        if (item.subItems) {
                          return (
                            <Collapsible key={item.title} className="group/sub" defaultOpen>
                              <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                  <SidebarMenuButton className="pl-8 justify-between hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full">
                                    <div className="flex items-center gap-2">
                                      {ItemIcon && <ItemIcon />}
                                      <span>{item.title}</span>
                                    </div>
                                    <ChevronRight className="size-4 transition-transform group-data-[state=open]/sub:rotate-90" />
                                  </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <SidebarMenuSub className="ml-10 border-l border-sidebar-border pr-0 mr-0 mt-1">
                                    {item.subItems.map((sub: any) => (
                                      <SidebarMenuSubItem key={sub.title}>
                                        <SidebarMenuSubButton
                                          asChild
                                          isActive={location.pathname === sub.url}
                                          className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:font-semibold py-1.5 h-auto"
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
                              className="pl-8 data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:font-semibold"
                            >
                              <Link to={item.url}>
                                {ItemIcon && <ItemIcon />}
                                <span>{item.title}</span>
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

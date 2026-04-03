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
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  Settings,
  ShieldCheck,
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
      { title: 'SAC', url: '/operacional/sac', icon: MessageSquare },
      { title: 'Rotina Diária', url: '/operacional/rotina', icon: Clock },
      { title: 'Relatório de Rotina', url: '/operacional/relatorio', icon: FileText },
      { title: 'Performance', url: '/operacional/performance', icon: BarChart3 },
      { title: 'Comunicados', url: '/operacional/comunicados', icon: Bell },
    ],
  },
  {
    title: 'COMERCIAL',
    icon: Briefcase,
    items: [
      { title: 'Gestão de Vendas', url: '/comercial/vendas' },
      { title: 'Negociação', url: '/comercial/negociacao' },
      { title: 'Gestão Fiscal', url: '/comercial/fiscal' },
    ],
  },
  {
    title: 'FINANCEIRO',
    icon: ShieldCheck,
    defaultOpen: true,
    items: [
      { title: 'Central de Acessos', url: '/financeiro/acessos' },
      { title: 'Estoque', url: '/estoque', icon: Package },
    ],
  },
  {
    title: 'CONFIGURAÇÕES',
    icon: Settings,
    items: [
      { title: 'Cadastros Básicos', url: '/admin/cadastros', icon: Database },
      { title: 'Parâmetros Gerais', url: '/configuracoes' },
      { title: 'Colaboradores', url: '/colaboradores', icon: Users },
      { title: 'Fornecedores', url: '/fornecedores', icon: Truck },
    ],
  },
]

export function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

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
        {navData.map((group) => {
          const SingleItemIcon = group.items[0]?.icon

          return group.items.length === 1 && !group.icon ? (
            <SidebarGroup key={group.title} className="py-2">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === group.items[0].url}
                    className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground font-semibold"
                  >
                    <Link to={group.items[0].url}>
                      {SingleItemIcon && <SingleItemIcon />}
                      <span>{group.items[0].title}</span>
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
                    <div className="flex items-center gap-2 font-bold tracking-wider text-xs">
                      {group.icon && <group.icon className="size-4 text-secondary" />}
                      {group.title}
                    </div>
                    <ChevronRight className="size-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent className="pt-1">
                    <SidebarMenu>
                      {group.items.map((item) => {
                        const ItemIcon = item.icon
                        return (
                          <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                              asChild
                              isActive={location.pathname === item.url}
                              className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:font-semibold"
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
                      src={`https://img.usecurling.com/ppl/thumbnail?gender=male&seed=${user?.id || '1'}`}
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

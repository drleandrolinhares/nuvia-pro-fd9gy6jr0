import { Link, useLocation } from 'react-router-dom'
import {
  Activity,
  BarChart3,
  Bell,
  Briefcase,
  ChevronRight,
  Clock,
  CloudCog,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  Settings,
  ShieldCheck,
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
    items: [{ title: 'Parâmetros Gerais', url: '/configuracoes' }],
  },
]

export function AppSidebar() {
  const location = useLocation()

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
            <div className="flex items-center gap-3 px-2 py-2 mb-2">
              <Avatar className="size-9 border border-sidebar-border">
                <AvatarImage src="https://img.usecurling.com/ppl/thumbnail?gender=male&seed=1" />
                <AvatarFallback className="bg-secondary text-secondary-foreground">
                  LS
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium truncate text-sidebar-foreground">
                  drleandro@nuvia.com
                </span>
                <span className="text-xs text-sidebar-foreground/60 truncate">
                  LEANDRO DE SOUZA
                </span>
              </div>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton className="text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 transition-colors">
              <LogOut className="size-4" />
              <span>SAIR DO SISTEMA</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

import { Link, useLocation } from 'react-router-dom'
import { Clock, Search, TerminalSquare } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useClock } from '@/hooks/use-clock'
import { Input } from '@/components/ui/input'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

export function AppHeader() {
  const timeString = useClock()
  const location = useLocation()

  // Simple breadcrumb generator based on path
  const generateBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean)
    if (paths.length === 0) return [{ title: 'DASHBOARD', url: '/' }]

    let currentUrl = ''
    return [
      { title: 'SISTEMA', url: '/' },
      ...paths.map((path) => {
        currentUrl += `/${path}`
        return {
          title: path.toUpperCase(),
          url: currentUrl,
        }
      }),
    ]
  }

  const breadcrumbs = generateBreadcrumbs()

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-sidebar-border bg-sidebar px-4 md:px-6">
      <div className="flex flex-1 items-center gap-4">
        <SidebarTrigger className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" />

        <div className="hidden md:block">
          <Breadcrumb>
            <BreadcrumbList className="text-sidebar-foreground/60 sm:gap-2">
              <TerminalSquare className="size-4 text-secondary" />
              {breadcrumbs.map((crumb, i) => (
                <div key={crumb.url} className="flex items-center gap-2">
                  {i > 0 && <BreadcrumbSeparator className="text-sidebar-foreground/40" />}
                  <BreadcrumbItem>
                    {i === breadcrumbs.length - 1 ? (
                      <BreadcrumbPage className="font-semibold text-secondary">
                        {crumb.title}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild className="hover:text-sidebar-foreground">
                        <Link to={crumb.url}>{crumb.title}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center gap-2 px-4 py-1.5 rounded-full border border-sidebar-border bg-sidebar-accent/30">
          <Clock className="size-4 text-secondary" />
          <span className="text-xs font-semibold text-sidebar-foreground tracking-wider">
            {timeString}
          </span>
        </div>

        <div className="relative w-full max-w-sm hidden md:flex items-center">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-sidebar-foreground/50" />
          <Input
            type="search"
            placeholder="Buscar módulos..."
            className="w-full bg-sidebar-accent/50 border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/50 pl-9 pr-12 focus-visible:ring-secondary"
          />
          <div className="absolute right-2.5 top-2.5 flex items-center gap-1">
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-sidebar-border bg-sidebar-accent px-1.5 font-mono text-[10px] font-medium text-sidebar-foreground/70">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>
      </div>
    </header>
  )
}

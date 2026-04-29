import { Outlet, useLocation } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from './app-sidebar'
import { AppHeader } from './app-header'
import { cn } from '@/lib/utils'

export default function Layout() {
  const location = useLocation()
  const isFullWidth = location.pathname.includes('/precificacao')

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background flex flex-col h-dvh w-full overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8">
          <div
            className={cn('mx-auto w-full pb-16', isFullWidth ? 'max-w-[98%]' : 'max-w-[1600px]')}
          >
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

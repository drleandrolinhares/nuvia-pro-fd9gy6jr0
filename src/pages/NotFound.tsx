/* 404 Page - Displays when a user attempts to access a non-existent route */
import { useLocation, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { ArrowLeft, Compass, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

const NotFound = () => {
  const location = useLocation()

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname)
  }, [location.pathname])

  return (
    <div className="app-canvas flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-7 text-center shadow-card">
        <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-accent text-accent-foreground">
          <Compass className="size-6" />
        </div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Erro 404
        </p>
        <h1 className="mt-1.5 text-xl font-bold tracking-tight text-foreground">
          Página não encontrada
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          O endereço{' '}
          <code className="rounded bg-muted px-1.5 py-0.5 text-[12px] text-foreground">
            {location.pathname}
          </code>{' '}
          não existe ou foi movido.
        </p>

        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="size-4" /> Voltar
          </Button>
          <Button asChild>
            <Link to="/">
              <Home className="size-4" /> Ir para o início
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default NotFound

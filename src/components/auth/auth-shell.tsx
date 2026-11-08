import { ReactNode, type ElementType } from 'react'
import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'

/**
 * Moldura compartilhada das telas de autenticação.
 * Mantém a identidade visual (navy + ouro) e concentra o conteúdo
 * em um único cartão — menos ruído, foco na tarefa.
 */
export function AuthShell({
  title,
  subtitle,
  icon: Icon,
  children,
  footer,
}: {
  title: string
  subtitle: string
  icon: ElementType
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="app-canvas relative flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(620px_260px_at_50%_-30%,hsl(var(--secondary)/0.14),transparent_70%)]"
      />

      <div className="relative w-full max-w-[420px]">
        <header className="mb-7 flex flex-col items-center text-center">
          <div className="mb-3 grid size-11 place-items-center rounded-xl bg-gradient-to-br from-[hsl(var(--gold))] to-[hsl(var(--gold-strong))] shadow-[0_6px_20px_-6px_hsl(var(--gold)/0.6)]">
            <span className="text-base font-extrabold leading-none tracking-tighter text-[hsl(var(--navy-deep))]">
              N
            </span>
          </div>
          <Link
            to="/"
            className="text-[15px] font-extrabold tracking-[0.16em] text-foreground outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2"
          >
            NUVIA<span className="ml-1 font-semibold text-secondary">PRO</span>
          </Link>
          <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Odontologia
          </span>
        </header>

        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-card sm:p-7">
          <div className="mb-5 flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
              <Icon className="size-[18px]" />
            </span>
            <div className="min-w-0">
              <h1 className="text-lg font-bold leading-tight tracking-tight text-foreground">
                {title}
              </h1>
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{subtitle}</p>
            </div>
          </div>

          {children}
        </div>

        {footer}

        <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground/70">
          <Lock className="size-3" />
          Ambiente restrito a colaboradores autorizados
        </p>
      </div>
    </div>
  )
}

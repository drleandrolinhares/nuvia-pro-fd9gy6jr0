import type { ElementType, ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Cabeçalho padrão de página.
 *
 * Substitui as faixas escuras "bg-slate-900 border-l-4 border-amber-500"
 * que cada tela repetia à mão. Fundo claro, hierarquia tipográfica,
 * ícone discreto e ações à direita — o mesmo padrão em todo o sistema.
 */
export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
  eyebrow,
  className,
}: {
  title: string
  description?: string
  icon?: ElementType
  actions?: ReactNode
  eyebrow?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 pb-1 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-foreground/70">
            <Icon className="size-[18px]" />
          </span>
        )}
        <div className="min-w-0">
          {eyebrow && (
            <div className="mb-1 text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              {eyebrow}
            </div>
          )}
          <h1 className="truncate text-xl font-bold leading-tight tracking-tight text-foreground sm:text-[1.4rem]">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{description}</p>
          )}
        </div>
      </div>

      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

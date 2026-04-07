import { useState, useEffect } from 'react'
import { CheckCircle2, RefreshCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SyncIndicatorProps {
  isSyncing: boolean
  className?: string
}

export function SyncIndicator({ isSyncing, className }: SyncIndicatorProps) {
  const [status, setStatus] = useState<'idle' | 'syncing' | 'success'>('idle')

  useEffect(() => {
    if (isSyncing) {
      setStatus('syncing')
    } else if (status === 'syncing') {
      setStatus('success')
      const timer = setTimeout(() => {
        setStatus('idle')
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isSyncing, status])

  if (status === 'idle') return null

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1 bg-background border border-border rounded-full shadow-sm animate-in fade-in zoom-in duration-200',
        className,
      )}
    >
      {status === 'syncing' ? (
        <>
          <RefreshCcw className="h-3 w-3 animate-spin text-amber-500" />
          <span className="text-[10px] font-bold tracking-wider text-amber-500 uppercase">
            Sincronizando
          </span>
        </>
      ) : (
        <>
          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
          <span className="text-[10px] font-bold tracking-wider text-emerald-500 uppercase">
            Atualizado
          </span>
        </>
      )}
    </div>
  )
}

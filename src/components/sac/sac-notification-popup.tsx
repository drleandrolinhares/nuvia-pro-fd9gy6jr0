import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { AlertCircle, Loader2 } from 'lucide-react'
import { parseISO, format } from 'date-fns'

export function SacNotificationPopup() {
  const { user } = useAuth()
  const [pendingDemandas, setPendingDemandas] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [ciente, setCiente] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const { toast } = useToast()

  const fetchPending = async () => {
    if (!user) return
    try {
      const { data: demandas } = await supabase
        .from('sac_demandas')
        .select('id, paciente_nome, tipo, limite_primeiro_contato')
        .eq('quem_resolve_id', user.id)
        .neq('status', 'resolvido')
        .order('criado_em', { ascending: true })

      if (!demandas || demandas.length === 0) {
        setPendingDemandas([])
        return
      }

      const { data: historico } = await supabase
        .from('sac_historico')
        .select('demanda_id')
        .eq('usuario_id', user.id)
        .eq('acao', 'Ciência')

      const histSet = new Set(historico?.map((h) => h.demanda_id) || [])
      const pending = demandas.filter((d) => !histSet.has(d.id))
      setPendingDemandas(pending)
    } catch (error) {
      console.error('Error fetching pending SAC demands', error)
    }
  }

  useEffect(() => {
    fetchPending()

    if (!user) return

    const channel = supabase
      .channel('sac-demandas-popup')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sac_demandas',
          filter: `quem_resolve_id=eq.${user.id}`,
        },
        () => {
          fetchPending()
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sac_demandas',
          filter: `quem_resolve_id=eq.${user.id}`,
        },
        () => {
          fetchPending()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const currentDemanda = pendingDemandas[currentIndex]

  const handleConfirm = async () => {
    if (!currentDemanda || !user || isConfirming) return

    setIsConfirming(true)
    try {
      // First check if already exists to prevent duplicate insertion
      const { data: existing } = await supabase
        .from('sac_historico')
        .select('id')
        .eq('demanda_id', currentDemanda.id)
        .eq('usuario_id', user.id)
        .eq('acao', 'Ciência')
        .maybeSingle()

      if (!existing) {
        const { error } = await supabase.from('sac_historico').insert({
          demanda_id: currentDemanda.id,
          usuario_id: user.id,
          acao: 'Ciência',
          detalhes: 'Usuário deu ciência na nova demanda atribuída',
        })
        if (error) throw error
      }

      toast({ title: 'Ciência registrada com sucesso' })
      setCiente(false)

      if (currentIndex < pendingDemandas.length - 1) {
        setCurrentIndex((prev) => prev + 1)
      } else {
        // Re-fetch to make sure we didn't miss anything while confirming
        fetchPending()
        setCurrentIndex(0)
      }
    } catch (e: any) {
      toast({ title: 'Erro ao registrar ciência', description: e.message, variant: 'destructive' })
    } finally {
      setIsConfirming(false)
    }
  }

  if (!currentDemanda || pendingDemandas.length === 0) return null

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-slate-100 shadow-2xl [&>button]:hidden outline-none">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-500 uppercase tracking-wider text-lg">
            <AlertCircle className="w-5 h-5" />
            Nova Demanda Atribuída
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Você foi designado como responsável por uma nova demanda no SAC. Confirme a ciência para
            continuar.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800/60 shadow-inner">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-semibold">
              Paciente
            </p>
            <p className="text-lg font-bold text-slate-100">{currentDemanda.paciente_nome}</p>

            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-800/50">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">
                  Tipo
                </p>
                <span className="px-2 py-1 rounded text-xs uppercase font-bold bg-slate-800 text-slate-200 border border-slate-700">
                  {currentDemanda.tipo}
                </span>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">
                  Prazo (1º Contato)
                </p>
                <p className="text-sm font-bold text-amber-500">
                  {currentDemanda.limite_primeiro_contato
                    ? format(parseISO(currentDemanda.limite_primeiro_contato), 'dd/MM/yyyy')
                    : '-'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3 pt-2 bg-slate-800/30 p-3 rounded-lg border border-slate-700/50">
            <Checkbox
              id="ciencia"
              checked={ciente}
              onCheckedChange={(checked) => setCiente(checked === true)}
              className="mt-0.5 border-slate-500 data-[state=checked]:bg-amber-500 data-[state=checked]:text-slate-950 data-[state=checked]:border-amber-500"
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="ciencia"
                className="text-sm font-medium leading-none cursor-pointer text-slate-200"
              >
                Estou ciente desta demanda
              </label>
              <p className="text-xs text-slate-400 mt-1">
                Reconheço que sou o responsável e cumprirei o prazo estipulado.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-stretch">
          <Button
            disabled={!ciente || isConfirming}
            onClick={handleConfirm}
            className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold uppercase tracking-widest transition-all disabled:opacity-50 disabled:bg-slate-700 disabled:text-slate-500"
          >
            {isConfirming ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Confirmando...
              </span>
            ) : (
              'Confirmar Ciência'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

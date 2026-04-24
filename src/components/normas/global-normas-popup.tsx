import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
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
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { AlertCircle, FileSignature, LogOut } from 'lucide-react'

export function GlobalNormasPopup() {
  const { user, signOut } = useAuth()
  const { toast } = useToast()
  const [pendingNormas, setPendingNormas] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const [isChecked, setIsChecked] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) {
      setPendingNormas([])
      return
    }

    const fetchNormas = async () => {
      const { data: normas } = await supabase
        .from('normas_internas')
        .select('*')
        .eq('ativo', true)
        .order('criado_em', { ascending: true })

      if (!normas || normas.length === 0) return

      const { data: aceites } = await supabase
        .from('normas_aceites')
        .select('norma_id')
        .eq('usuario_id', user.id)

      const aceitesIds = new Set(aceites?.map((a) => a.norma_id) || [])

      const pending = normas.filter((n) => {
        if (aceitesIds.has(n.id)) return false
        if (n.todos_usuarios === false && Array.isArray(n.usuarios_alvo)) {
          return n.usuarios_alvo.includes(user.id)
        }
        return true
      })

      setPendingNormas(pending)
    }

    fetchNormas()
  }, [user])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 10) {
      setHasScrolledToBottom(true)
    }
  }

  useEffect(() => {
    if (pendingNormas.length > 0) {
      setHasScrolledToBottom(false)
      setIsChecked(false)

      setTimeout(() => {
        if (contentRef.current) {
          if (contentRef.current.scrollHeight <= contentRef.current.clientHeight + 10) {
            setHasScrolledToBottom(true)
          }
        }
      }, 100)
    }
  }, [currentIndex, pendingNormas])

  if (pendingNormas.length === 0) return null

  const currentNorma = pendingNormas[currentIndex]

  const handleSign = async () => {
    if (!isChecked || !user) return
    setIsSubmitting(true)

    try {
      const { error } = await supabase.from('normas_aceites').insert({
        norma_id: currentNorma.id,
        usuario_id: user.id,
      })

      if (error) throw error

      toast({
        title: 'Assinatura registrada',
        description: 'Sua ciência foi registrada com sucesso.',
      })

      if (currentIndex < pendingNormas.length - 1) {
        setCurrentIndex((prev) => prev + 1)
      } else {
        setPendingNormas([])
      }
    } catch (err: any) {
      toast({
        title: 'Erro ao assinar',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden outline-none [&>button]:hidden sm:rounded-xl"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="bg-destructive/10 border-b border-destructive/20 p-4 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <AlertCircle className="size-6 text-destructive" />
            <div>
              <h2 className="font-bold text-destructive uppercase">Aviso Importante</h2>
              <p className="text-sm text-destructive/80">
                Leitura e assinatura obrigatória ({currentIndex + 1} de {pendingNormas.length})
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut()}
            className="text-destructive hover:bg-destructive/20 hover:text-destructive"
          >
            <LogOut className="size-4 mr-2" />
            Sair do Sistema
          </Button>
        </div>

        <DialogHeader className="px-6 py-4 border-b border-border/50 shrink-0 bg-background">
          <DialogTitle className="text-2xl uppercase tracking-wider leading-tight">
            {currentNorma.titulo}
          </DialogTitle>
          <DialogDescription className="mt-2">
            Leia atentamente o documento abaixo. Para habilitar a assinatura, é necessário rolar o
            texto até o final.
          </DialogDescription>
        </DialogHeader>

        <div
          className="flex-1 overflow-y-auto p-6 bg-muted/30 relative"
          onScroll={handleScroll}
          ref={contentRef}
        >
          <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none whitespace-pre-wrap bg-background p-6 sm:p-8 rounded-lg border border-border shadow-sm min-h-full">
            {currentNorma.conteudo}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border/50 shrink-0 bg-background flex flex-col sm:flex-row sm:justify-between items-center gap-4">
          <div className="flex items-center space-x-3 w-full sm:w-auto p-3 sm:p-0 bg-muted/50 sm:bg-transparent rounded-lg sm:rounded-none">
            <Checkbox
              id="aceite"
              checked={isChecked}
              onCheckedChange={(c) => setIsChecked(!!c)}
              disabled={!hasScrolledToBottom}
              className="size-5"
            />
            <Label
              htmlFor="aceite"
              className={`text-sm font-semibold leading-snug cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-50 ${!hasScrolledToBottom ? 'text-muted-foreground' : 'text-foreground'}`}
            >
              Declaro que li e compreendi totalmente o conteúdo deste documento.
            </Label>
          </div>
          <Button
            onClick={handleSign}
            disabled={!isChecked || isSubmitting}
            className="w-full sm:w-auto uppercase tracking-wider font-bold h-12 px-8"
          >
            <FileSignature className="size-5 mr-2" />
            {isSubmitting ? 'Registrando...' : 'Assinar Eletronicamente'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

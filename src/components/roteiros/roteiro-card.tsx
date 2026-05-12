import { useState } from 'react'
import { Roteiro } from '@/hooks/use-roteiros'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Copy,
  Edit2,
  Trash2,
  Check,
  MessageSquare,
  Video,
  Mic,
  Eye,
  EyeOff,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export function RoteiroCard({
  roteiro,
  onEdit,
  onRefresh,
}: {
  roteiro: Roteiro
  onEdit: () => void
  onRefresh: () => void
}) {
  const [copied, setCopied] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleCopy = () => {
    if (roteiro.conteudo) {
      navigator.clipboard.writeText(roteiro.conteudo)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({ title: 'Conteúdo copiado!' })
    }
  }

  const handleDelete = async () => {
    try {
      await supabase
        .from('roteiros' as any)
        .delete()
        .eq('id', roteiro.id)
      toast({ title: 'Roteiro removido' })
      onRefresh()
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  const getIcon = () => {
    const tipo = roteiro.tipo_comunicacao.toLowerCase()
    if (tipo.includes('vídeo') || tipo.includes('video')) return <Video className="w-3 h-3 mr-1" />
    if (tipo.includes('áudio') || tipo.includes('audio')) return <Mic className="w-3 h-3 mr-1" />
    return <MessageSquare className="w-3 h-3 mr-1" />
  }

  return (
    <>
      <Card className="bg-slate-900 border-slate-700 flex flex-col hover:border-slate-600 transition-colors shadow-none overflow-hidden">
        {/* Top Header - Full Width */}
        <div className="p-4 border-b border-slate-700 flex justify-between items-start gap-4 bg-slate-900/80">
          <div className="flex flex-col gap-2">
            <CardTitle className="text-lg font-semibold text-white leading-tight">
              {roteiro.titulo}
            </CardTitle>
            {roteiro.quando && (
              <Badge
                variant="outline"
                className="text-amber-400 border-amber-500/30 bg-amber-500/10 w-fit"
              >
                <Clock className="w-3 h-3 mr-1" />
                {roteiro.quando}
              </Badge>
            )}
          </div>
          <div className="flex gap-1 shrink-0 -mt-1 -mr-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800"
              onClick={onEdit}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row flex-1">
          {/* Info Section (Left on Desktop) */}
          <div className="p-4 md:w-1/3 border-b md:border-b-0 md:border-r border-slate-700 flex flex-col">
            <div className="mb-4">
              <Badge
                variant="secondary"
                className="bg-slate-800 text-slate-200 border border-slate-600 hover:bg-slate-700 w-fit"
              >
                {getIcon()}
                {roteiro.tipo_comunicacao}
              </Badge>
            </div>

            {roteiro.objetivo && (
              <div className="mt-auto">
                <p className="text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Objetivo
                </p>
                <p className="text-sm text-slate-300 leading-relaxed">{roteiro.objetivo}</p>
              </div>
            )}
          </div>

          {/* Content Section (Right on Desktop) */}
          <div className="p-4 md:w-2/3 flex flex-col relative group bg-slate-900/50">
            <div className="flex justify-between items-center mb-2">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Conteúdo
              </p>
            </div>

            <div
              className={cn(
                'bg-slate-950 rounded-md p-4 text-sm text-slate-100 whitespace-pre-wrap font-mono border border-slate-700 flex-1 relative transition-all duration-200',
                !isExpanded &&
                  roteiro.conteudo &&
                  roteiro.conteudo.length > 250 &&
                  'max-h-[150px] overflow-hidden',
              )}
            >
              {roteiro.conteudo || (
                <span className="text-slate-500 italic">Sem conteúdo cadastrado.</span>
              )}

              {!isExpanded && roteiro.conteudo && roteiro.conteudo.length > 250 && (
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
              )}

              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10">
                {roteiro.conteudo && roteiro.conteudo.length > 250 && (
                  <Button
                    size="icon"
                    variant="secondary"
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 shadow-none h-8 w-8"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="secondary"
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 shadow-none h-8 w-8"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir roteiro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O roteiro será permanentemente removido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

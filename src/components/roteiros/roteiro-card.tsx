import { useState } from 'react'
import { Roteiro } from '@/hooks/use-roteiros'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Copy, Edit2, Trash2, Check, MessageSquare, Video, Mic } from 'lucide-react'
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
      <Card className="bg-slate-900 border-slate-700 flex flex-col hover:border-slate-600 transition-colors shadow-sm">
        <CardHeader className="p-4 pb-3 flex flex-row items-start justify-between space-y-0 border-b border-slate-800/50">
          <div className="space-y-2 pr-2">
            <CardTitle className="text-base font-semibold text-slate-100 leading-tight">
              {roteiro.titulo}
            </CardTitle>
            <Badge
              variant="secondary"
              className="bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700"
            >
              {getIcon()}
              {roteiro.tipo_comunicacao}
            </Badge>
          </div>
          <div className="flex gap-1 -mr-2 -mt-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-slate-100 hover:bg-slate-800"
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
        </CardHeader>
        <CardContent className="p-4 pt-4 flex-1 flex flex-col">
          {roteiro.objetivo && (
            <div className="mb-4">
              <p className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">
                Objetivo
              </p>
              <p className="text-sm text-slate-300">{roteiro.objetivo}</p>
            </div>
          )}
          <div className="mt-auto relative group flex-1 flex flex-col">
            <p className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">
              Conteúdo
            </p>
            <div className="bg-slate-950 rounded-md p-3.5 text-sm text-slate-200 min-h-[100px] whitespace-pre-wrap font-mono border border-slate-700/80 shadow-inner flex-1">
              {roteiro.conteudo || (
                <span className="text-slate-500 italic">Sem conteúdo cadastrado.</span>
              )}
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="absolute top-7 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-sm"
              onClick={handleCopy}
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </CardContent>
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

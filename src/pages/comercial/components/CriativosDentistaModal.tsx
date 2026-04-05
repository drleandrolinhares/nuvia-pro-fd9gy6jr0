import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { supabase } from '@/lib/supabase/client'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Plus, Video } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RankingDentista } from '../hooks/use-ranking-dentistas'

interface CriativosDentistaModalProps {
  isOpen: boolean
  onClose: () => void
  dentista: RankingDentista
  onSuccess: () => void
}

export function CriativosDentistaModal({
  isOpen,
  onClose,
  dentista,
  onSuccess,
}: CriativosDentistaModalProps) {
  const [criativos, setCriativos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingAdd, setLoadingAdd] = useState(false)
  const [descricao, setDescricao] = useState('')
  const [dataCriacao, setDataCriacao] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [metaMensal, setMetaMensal] = useState<number>(dentista.metaMensalCriativos || 0)
  const [savingMeta, setSavingMeta] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setMetaMensal(dentista.metaMensalCriativos || 0)
  }, [dentista.metaMensalCriativos])

  const handleUpdateMeta = async () => {
    setSavingMeta(true)
    const { error } = await supabase
      .from('dentistas_avaliadores')
      .update({ meta_mensal_criativos: metaMensal })
      .eq('id', dentista.id)

    setSavingMeta(false)
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Meta atualizada com sucesso.' })
      onSuccess()
    }
  }

  const fetchCriativos = async () => {
    setLoading(true)
    const hoje = new Date()
    const start = format(startOfMonth(hoje), 'yyyy-MM-dd')
    const end = format(endOfMonth(hoje), 'yyyy-MM-dd')

    const { data, error } = await supabase
      .from('criativos_gerados')
      .select('*')
      .eq('dentista_avaliador_id', dentista.id)
      .gte('data_criacao', start)
      .lte('data_criacao', end)
      .order('data_criacao', { ascending: false })

    if (!error && data) {
      setCriativos(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (isOpen && dentista.id) {
      fetchCriativos()
    }
    // eslint-react-hooks/exhaustive-deps
  }, [isOpen, dentista.id])

  const getSafeDate = (dateStr: string) => {
    if (!dateStr) return new Date()
    const [year, month, day] = dateStr.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  const handleAdd = async () => {
    if (!descricao.trim()) return

    setLoadingAdd(true)
    const { error } = await supabase.from('criativos_gerados').insert({
      dentista_avaliador_id: dentista.id,
      descricao_video: descricao.trim(),
      data_criacao: dataCriacao,
      mes_referencia: format(startOfMonth(getSafeDate(dataCriacao)), 'yyyy-MM-dd'),
    })

    setLoadingAdd(false)

    if (error) {
      toast({
        title: 'Erro ao adicionar',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Sucesso',
        description: 'Vídeo registrado com sucesso.',
      })
      setDescricao('')
      fetchCriativos()
      onSuccess()
    }
  }

  const meta = metaMensal || 0
  const percent = meta > 0 ? Math.min(100, Math.round((criativos.length / meta) * 100)) : 0
  let colorClass = 'bg-red-500'
  if (percent >= 100) colorClass = 'bg-emerald-500'
  else if (percent >= 50) colorClass = 'bg-amber-500'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="w-5 h-5 text-primary" />
            Gestão de Criativos - {dentista.nome}
          </DialogTitle>
          <DialogDescription>
            Acompanhe a meta mensal e registre novos vídeos lançados no mês atual.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          {/* Progress */}
          <div className="space-y-3 mb-6 p-4 border rounded-lg bg-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-muted-foreground">Meta Mensal (Vídeos)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    className="w-24 h-9"
                    value={metaMensal || ''}
                    onChange={(e) => setMetaMensal(Number(e.target.value) || 0)}
                    min={0}
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-9"
                    onClick={handleUpdateMeta}
                    disabled={savingMeta || metaMensal === (dentista.metaMensalCriativos || 0)}
                  >
                    {savingMeta && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
                    Atualizar
                  </Button>
                </div>
              </div>
              <div className="text-right flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">Progresso</span>
                <span className="text-lg font-bold">
                  {criativos.length} / {meta}{' '}
                  <span className="text-sm font-medium text-muted-foreground ml-1">
                    ({percent}%)
                  </span>
                </span>
              </div>
            </div>
            <div className="w-full bg-secondary rounded-full h-3 overflow-hidden mt-2">
              <div
                className={cn('h-full transition-all duration-500', colorClass)}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          {/* Add Form */}
          <div className="flex flex-col sm:flex-row gap-3 items-end mb-6 p-4 bg-muted/50 rounded-lg border">
            <div className="space-y-1.5 w-full sm:w-[150px]">
              <Label>Data de Lançamento</Label>
              <Input
                type="date"
                value={dataCriacao}
                onChange={(e) => setDataCriacao(e.target.value)}
              />
            </div>
            <div className="space-y-1.5 flex-1 w-full">
              <Label>Descrição / Título do Vídeo</Label>
              <Input
                placeholder="Ex: Vídeo sobre Lentes de Contato..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && descricao.trim() && !loadingAdd) {
                    e.preventDefault()
                    handleAdd()
                  }
                }}
              />
            </div>
            <Button
              onClick={handleAdd}
              disabled={!descricao.trim() || loadingAdd}
              className="w-full sm:w-auto"
            >
              {loadingAdd ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Registrar
            </Button>
          </div>

          {/* List */}
          <div className="border rounded-md overflow-hidden">
            <ScrollArea className="h-[250px]">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                  <TableRow>
                    <TableHead className="w-[120px]">Data</TableHead>
                    <TableHead>Descrição</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={2} className="h-24 text-center">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ) : criativos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                        Nenhum vídeo registrado neste mês.
                      </TableCell>
                    </TableRow>
                  ) : (
                    criativos.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="w-[120px]">
                          {c.data_criacao.split('-').reverse().join('/')}
                        </TableCell>
                        <TableCell>{c.descricao_video}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

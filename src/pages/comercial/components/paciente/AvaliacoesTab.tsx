import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { Plus, Edit, Trash, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

export function AvaliacoesTab({ pacienteId }: { pacienteId: string }) {
  const { toast } = useToast()
  const [avaliacoes, setAvaliacoes] = useState<any[]>([])
  const [dentistas, setDentistas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [editAvaliacao, setEditAvaliacao] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const fetchDados = async () => {
    setLoading(true)
    const { data: avData } = await supabase
      .from('avaliacoes')
      .select('*, dentistas_avaliadores(nome)')
      .eq('paciente_id', pacienteId)
      .order('data_avaliacao', { ascending: false })

    if (avData) setAvaliacoes(avData)

    const { data: dData } = await supabase
      .from('dentistas_avaliadores')
      .select('id, nome')
      .eq('status', 'ativo')

    if (dData) setDentistas(dData)
    setLoading(false)
  }

  useEffect(() => {
    fetchDados()
  }, [pacienteId])

  const handleSave = async () => {
    if (!editAvaliacao) return
    try {
      setSaving(true)
      const payload = {
        data_avaliacao: editAvaliacao.data_avaliacao
          ? editAvaliacao.data_avaliacao.substring(0, 10)
          : format(new Date(), 'yyyy-MM-dd'),
        valor_orcamento: Number(editAvaliacao.valor_orcamento) || 0,
        status: editAvaliacao.status || 'avaliacao_realizada',
        dentista_avaliador_id: editAvaliacao.dentista_avaliador_id || null,
        paciente_id: pacienteId,
      }

      if (editAvaliacao.id) {
        const { error } = await supabase
          .from('avaliacoes')
          .update({ ...payload, atualizado_em: new Date().toISOString() })
          .eq('id', editAvaliacao.id)
        if (error) throw error
        toast({ title: 'Sucesso', description: 'Avaliação atualizada com sucesso.' })
      } else {
        const { error } = await supabase.from('avaliacoes').insert([payload])
        if (error) throw error
        toast({ title: 'Sucesso', description: 'Avaliação criada com sucesso.' })
      }

      setEditAvaliacao(null)
      fetchDados()
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta avaliação?')) return
    try {
      const { error } = await supabase.from('avaliacoes').delete().eq('id', id)
      if (error) throw error
      toast({ title: 'Sucesso', description: 'Avaliação excluída.' })
      fetchDados()
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    }
  }

  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

  const formatarData = (dataStr: string | null) => {
    if (!dataStr) return '-'
    const str = dataStr.substring(0, 10)
    const partes = str.split('-')
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`
    }
    return str
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Histórico de Avaliações</CardTitle>
        <Button size="sm" onClick={() => setEditAvaliacao({})}>
          <Plus className="w-4 h-4 mr-2" /> Nova Avaliação
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Valor do Orçamento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dentista Avaliador</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : avaliacoes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    Nenhuma avaliação encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                avaliacoes.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>{formatarData(a.data_avaliacao)}</TableCell>
                    <TableCell className="font-medium">
                      {a.valor_orcamento ? formatBRL(a.valor_orcamento) : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          'capitalize',
                          a.status === 'venda_concretizada' &&
                            'bg-green-500/10 text-green-600 border-green-500/20',
                        )}
                      >
                        {a.status?.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{a.dentistas_avaliadores?.nome || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditAvaliacao(a)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(a.id)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog open={!!editAvaliacao} onOpenChange={(o) => !o && setEditAvaliacao(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editAvaliacao?.id ? 'Editar Avaliação' : 'Nova Avaliação'}</DialogTitle>
            </DialogHeader>
            {editAvaliacao && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Data da Avaliação</Label>
                  <Input
                    type="date"
                    value={
                      editAvaliacao.data_avaliacao
                        ? editAvaliacao.data_avaliacao.substring(0, 10)
                        : format(new Date(), 'yyyy-MM-dd')
                    }
                    onChange={(e) =>
                      setEditAvaliacao({ ...editAvaliacao, data_avaliacao: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor do Orçamento (R$)</Label>
                  <Input
                    type="number"
                    value={editAvaliacao.valor_orcamento || ''}
                    onChange={(e) =>
                      setEditAvaliacao({ ...editAvaliacao, valor_orcamento: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={editAvaliacao.status || 'avaliacao_realizada'}
                    onValueChange={(val) => setEditAvaliacao({ ...editAvaliacao, status: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="avaliacao_realizada">Avaliação Realizada</SelectItem>
                      <SelectItem value="orcamento_pendente">Orçamento Pendente</SelectItem>
                      <SelectItem value="venda_concretizada">Venda Concretizada</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Dentista Avaliador</Label>
                  <Select
                    value={editAvaliacao.dentista_avaliador_id || 'none'}
                    onValueChange={(val) =>
                      setEditAvaliacao({
                        ...editAvaliacao,
                        dentista_avaliador_id: val === 'none' ? null : val,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um dentista" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {dentistas.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditAvaliacao(null)} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

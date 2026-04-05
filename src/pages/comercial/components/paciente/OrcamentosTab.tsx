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

export function OrcamentosTab({ pacienteId }: { pacienteId: string }) {
  const { toast } = useToast()
  const [orcamentos, setOrcamentos] = useState<any[]>([])
  const [avaliacoes, setAvaliacoes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editOrcamento, setEditOrcamento] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const fetchDados = async () => {
    setLoading(true)
    const { data: orcData } = await supabase
      .from('orcamentos')
      .select('*, avaliacoes!inner(paciente_id)')
      .eq('avaliacoes.paciente_id', pacienteId)
      .order('data_orcamento', { ascending: false })

    if (orcData) setOrcamentos(orcData)

    const { data: avData } = await supabase
      .from('avaliacoes')
      .select('id, data_avaliacao, valor_orcamento')
      .eq('paciente_id', pacienteId)
      .order('data_avaliacao', { ascending: false })

    if (avData) setAvaliacoes(avData)

    setLoading(false)
  }

  useEffect(() => {
    fetchDados()
  }, [pacienteId])

  const handleSave = async () => {
    if (!editOrcamento) return
    try {
      setSaving(true)

      const payload = {
        valor: Number(editOrcamento.valor) || 0,
        status: editOrcamento.status || 'ativo',
        ordem: Number(editOrcamento.ordem) || 1,
        avaliacao_id: editOrcamento.avaliacao_id,
      }

      if (!payload.avaliacao_id) {
        throw new Error('Selecione uma avaliação vinculada')
      }

      if (editOrcamento.id) {
        const { error } = await supabase
          .from('orcamentos')
          .update(payload)
          .eq('id', editOrcamento.id)
        if (error) throw error
        toast({ title: 'Sucesso', description: 'Orçamento atualizado com sucesso.' })
      } else {
        const { error } = await supabase.from('orcamentos').insert([payload])
        if (error) throw error
        toast({ title: 'Sucesso', description: 'Orçamento criado com sucesso.' })
      }

      setEditOrcamento(null)
      fetchDados()
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este orçamento?')) return
    try {
      const { error } = await supabase.from('orcamentos').delete().eq('id', id)
      if (error) throw error
      toast({ title: 'Sucesso', description: 'Orçamento excluído.' })
      fetchDados()
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    }
  }

  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Orçamentos Gerados</CardTitle>
        <Button size="sm" onClick={() => setEditOrcamento({})}>
          <Plus className="w-4 h-4 mr-2" /> Novo Orçamento
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ordem</TableHead>
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
              ) : orcamentos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    Nenhum orçamento encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                orcamentos.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>
                      {o.data_orcamento ? format(new Date(o.data_orcamento), 'dd/MM/yyyy') : '-'}
                    </TableCell>
                    <TableCell className="font-medium">{formatBRL(o.valor)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {o.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{o.ordem || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditOrcamento(o)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(o.id)}
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

        <Dialog open={!!editOrcamento} onOpenChange={(o) => !o && setEditOrcamento(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editOrcamento?.id ? 'Editar Orçamento' : 'Novo Orçamento'}</DialogTitle>
            </DialogHeader>
            {editOrcamento && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Avaliação Vinculada</Label>
                  <Select
                    value={editOrcamento.avaliacao_id || ''}
                    onValueChange={(val) =>
                      setEditOrcamento({ ...editOrcamento, avaliacao_id: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma avaliação" />
                    </SelectTrigger>
                    <SelectContent>
                      {avaliacoes.map((av) => (
                        <SelectItem key={av.id} value={av.id}>
                          Avaliação de{' '}
                          {av.data_avaliacao
                            ? format(new Date(av.data_avaliacao), 'dd/MM/yyyy')
                            : 'Data Indefinida'}
                          {av.valor_orcamento ? ` - ${formatBRL(av.valor_orcamento)}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Valor (R$)</Label>
                  <Input
                    type="number"
                    value={editOrcamento.valor || ''}
                    onChange={(e) => setEditOrcamento({ ...editOrcamento, valor: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ordem (Número)</Label>
                  <Input
                    type="number"
                    value={editOrcamento.ordem || ''}
                    onChange={(e) => setEditOrcamento({ ...editOrcamento, ordem: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={editOrcamento.status || 'ativo'}
                    onValueChange={(val) => setEditOrcamento({ ...editOrcamento, status: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="aprovado">Aprovado</SelectItem>
                      <SelectItem value="recusado">Recusado</SelectItem>
                      <SelectItem value="vencido">Vencido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOrcamento(null)} disabled={saving}>
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

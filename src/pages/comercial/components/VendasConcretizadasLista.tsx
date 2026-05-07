import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Edit2, Trash2, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'

export function VendasConcretizadasLista({ onRevertSuccess }: { onRevertSuccess: () => void }) {
  const { toast } = useToast()
  const [vendas, setVendas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dentistas, setDentistas] = useState<any[]>([])
  const [crcs, setCrcs] = useState<any[]>([])
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedVenda, setSelectedVenda] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const fetchVendas = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('vendas_confirmadas')
      .select('*, dentistas_avaliadores(nome), crc_comercial(nome)')
      .order('data_fechamento', { ascending: false })
    if (data) setVendas(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchVendas()
    supabase
      .from('dentistas_avaliadores')
      .select('id, nome')
      .eq('status', 'ativo')
      .then(({ data }) => setDentistas(data || []))
    supabase
      .from('crc_comercial')
      .select('id, nome')
      .eq('status', 'ativo')
      .then(({ data }) => setCrcs(data || []))
  }, [])

  const handleEdit = (venda: any) => {
    setSelectedVenda({
      id: venda.id,
      paciente_nome: venda.paciente_nome || '',
      data_fechamento: venda.data_fechamento ? venda.data_fechamento.substring(0, 10) : '',
      valor_tratamento: venda.valor_tratamento || 0,
      valor_entrada: venda.valor_entrada || 0,
      dentista_avaliador: venda.dentista_avaliador || 'nenhum',
      crc: venda.crc || 'nenhum',
      forma_pagamento: venda.forma_pagamento || 'Pix',
      destino_pagamento: venda.destino_pagamento || 'SICOOB PF 16004-0',
      destino_fiscal: venda.destino_fiscal || 'PESSOA FISICA',
    })
    setEditModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        'Deseja realmente excluir esta venda? Essa ação é irreversível e atualizará relatórios.',
      )
    )
      return
    try {
      const { error } = await supabase.from('vendas_confirmadas').delete().eq('id', id)
      if (error) throw error
      toast({ title: 'Sucesso', description: 'Venda excluída com sucesso!' })
      fetchVendas()
      onRevertSuccess()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const saveEdit = async () => {
    setSaving(true)
    try {
      const dentista =
        selectedVenda.dentista_avaliador !== 'nenhum' ? selectedVenda.dentista_avaliador : null
      const crc = selectedVenda.crc !== 'nenhum' ? selectedVenda.crc : null
      const { error } = await supabase
        .from('vendas_confirmadas')
        .update({
          paciente_nome: selectedVenda.paciente_nome,
          data_fechamento: selectedVenda.data_fechamento,
          valor_tratamento: Number(selectedVenda.valor_tratamento),
          valor_entrada: Number(selectedVenda.valor_entrada),
          percentual_entrada:
            Number(selectedVenda.valor_tratamento) > 0
              ? (Number(selectedVenda.valor_entrada) / Number(selectedVenda.valor_tratamento)) * 100
              : 0,
          dentista_avaliador: dentista,
          crc: crc,
          forma_pagamento: selectedVenda.forma_pagamento,
          destino_pagamento: selectedVenda.destino_pagamento,
          destino_fiscal: selectedVenda.destino_fiscal,
        })
        .eq('id', selectedVenda.id)

      if (error) throw error
      toast({ title: 'Sucesso', description: 'Venda atualizada com sucesso!' })
      setEditModalOpen(false)
      fetchVendas()
      onRevertSuccess()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  const formatDate = (d: string) => {
    if (!d) return '-'
    const [y, m, day] = d.substring(0, 10).split('-')
    return `${day}/${m}/${y}`
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-white dark:bg-slate-900 overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-100 dark:bg-slate-800">
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Valor Total</TableHead>
              <TableHead>Entrada</TableHead>
              <TableHead>% Ent.</TableHead>
              <TableHead>Avaliador</TableHead>
              <TableHead>CRC</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : vendas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Nenhuma venda encontrada.
                </TableCell>
              </TableRow>
            ) : (
              vendas.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.paciente_nome}</TableCell>
                  <TableCell>{formatDate(v.data_fechamento)}</TableCell>
                  <TableCell>{formatCurrency(v.valor_tratamento)}</TableCell>
                  <TableCell>{formatCurrency(v.valor_entrada)}</TableCell>
                  <TableCell>
                    {v.valor_tratamento > 0
                      ? ((v.valor_entrada / v.valor_tratamento) * 100).toFixed(2)
                      : '0.00'}
                    %
                  </TableCell>
                  <TableCell>{v.dentistas_avaliadores?.nome || '-'}</TableCell>
                  <TableCell>{v.crc_comercial?.nome || '-'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(v)}
                      title="Editar Venda"
                    >
                      <Edit2 className="w-4 h-4 text-blue-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(v.id)}
                      title="Excluir Venda"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Venda Concretizada</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Paciente</Label>
                <Input
                  value={selectedVenda?.paciente_nome || ''}
                  onChange={(e) =>
                    setSelectedVenda({ ...selectedVenda, paciente_nome: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={selectedVenda?.data_fechamento || ''}
                  onChange={(e) =>
                    setSelectedVenda({ ...selectedVenda, data_fechamento: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Valor Total</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={selectedVenda?.valor_tratamento || ''}
                  onChange={(e) =>
                    setSelectedVenda({ ...selectedVenda, valor_tratamento: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Valor Entrada</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={selectedVenda?.valor_entrada || ''}
                  onChange={(e) =>
                    setSelectedVenda({ ...selectedVenda, valor_entrada: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Dentista Avaliador</Label>
                <Select
                  value={selectedVenda?.dentista_avaliador}
                  onValueChange={(v) =>
                    setSelectedVenda({ ...selectedVenda, dentista_avaliador: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Nenhum" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhum">Nenhum</SelectItem>
                    {dentistas.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>CRC Comercial</Label>
                <Select
                  value={selectedVenda?.crc}
                  onValueChange={(v) => setSelectedVenda({ ...selectedVenda, crc: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Nenhum" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhum">Nenhum</SelectItem>
                    {crcs.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>F. Pagamento</Label>
                <Select
                  value={selectedVenda?.forma_pagamento}
                  onValueChange={(v) => setSelectedVenda({ ...selectedVenda, forma_pagamento: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pix">Pix</SelectItem>
                    <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="Crédito">Crédito</SelectItem>
                    <SelectItem value="Débito">Débito</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                    <SelectItem value="Transferência">Transferência</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Destino Pgto</Label>
                <Select
                  value={selectedVenda?.destino_pagamento}
                  onValueChange={(v) =>
                    setSelectedVenda({ ...selectedVenda, destino_pagamento: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SICOOB PF 16004-0">SICOOB PF 16004-0</SelectItem>
                    <SelectItem value="SANTANDER PJ VO">SANTANDER PJ VO</SelectItem>
                    <SelectItem value="SICOOB PJ SFO">SICOOB PJ SFO</SelectItem>
                    <SelectItem value="EM MÃOS">EM MÃOS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Destino Fiscal</Label>
                <Select
                  value={selectedVenda?.destino_fiscal}
                  onValueChange={(v) => setSelectedVenda({ ...selectedVenda, destino_fiscal: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PESSOA FISICA">PF</SelectItem>
                    <SelectItem value="VITALI ODONTOLOGIA">VITALI</SelectItem>
                    <SelectItem value="SOUZA FILHO ODONTOLOGIA">SFO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveEdit} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

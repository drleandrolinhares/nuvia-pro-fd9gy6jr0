import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { Badge } from '@/components/ui/badge'
import { FaixaBase } from '@/services/comissoes'

interface ManagerProps {
  service: {
    list: () => Promise<FaixaBase[]>
    save: (faixa: any) => Promise<any>
    remove: (id: string) => Promise<void>
  }
}

export function FaixasManager({ service }: ManagerProps) {
  const [faixas, setFaixas] = useState<FaixaBase[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    faixa_entrada_minima: 0,
    faixa_entrada_maxima: 0,
    percentual_comissao: 0,
    status: 'ativo',
  })

  const loadFaixas = async () => {
    try {
      setLoading(true)
      const data = await service.list()
      setFaixas(data)
    } catch (error) {
      toast.error('Erro ao carregar faixas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFaixas()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.faixa_entrada_maxima <= formData.faixa_entrada_minima) {
      toast.error('A faixa máxima deve ser maior que a mínima')
      return
    }

    try {
      await service.save({
        id: editingId || undefined,
        faixa_entrada_minima: Number(formData.faixa_entrada_minima),
        faixa_entrada_maxima: Number(formData.faixa_entrada_maxima),
        percentual_comissao: Number(formData.percentual_comissao),
        status: formData.status,
      })
      toast.success(editingId ? 'Faixa atualizada com sucesso' : 'Faixa criada com sucesso')
      setOpen(false)
      loadFaixas()
    } catch (error) {
      toast.error('Erro ao salvar faixa')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta faixa?')) return
    try {
      await service.remove(id)
      toast.success('Faixa excluída com sucesso')
      loadFaixas()
    } catch (error) {
      toast.error('Erro ao excluir faixa')
    }
  }

  const openEdit = (f: FaixaBase) => {
    setEditingId(f.id!)
    setFormData({
      faixa_entrada_minima: f.faixa_entrada_minima || 0,
      faixa_entrada_maxima: f.faixa_entrada_maxima || 0,
      percentual_comissao: f.percentual_comissao || 0,
      status: f.status || 'ativo',
    })
    setOpen(true)
  }

  const openAdd = () => {
    setEditingId(null)
    setFormData({
      faixa_entrada_minima: 0,
      faixa_entrada_maxima: 0,
      percentual_comissao: 0,
      status: 'ativo',
    })
    setOpen(true)
  }

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin text-amber-500 w-8 h-8" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openAdd} className="bg-amber-500 hover:bg-amber-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Adicionar Faixa
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Entrada Mínima (%)</TableHead>
              <TableHead>Entrada Máxima (%)</TableHead>
              <TableHead>Comissão (%)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {faixas.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Nenhuma faixa cadastrada.
                </TableCell>
              </TableRow>
            )}
            {faixas.map((f) => (
              <TableRow key={f.id}>
                <TableCell>{f.faixa_entrada_minima}%</TableCell>
                <TableCell>{f.faixa_entrada_maxima}%</TableCell>
                <TableCell>{f.percentual_comissao}%</TableCell>
                <TableCell>
                  <Badge variant={f.status === 'ativo' ? 'default' : 'secondary'}>{f.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(f)}>
                    <Pencil className="w-4 h-4 text-blue-500" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(f.id!)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Faixa' : 'Nova Faixa'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mínima (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.faixa_entrada_minima}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      faixa_entrada_minima: parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Máxima (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.faixa_entrada_maxima}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      faixa_entrada_maxima: parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Comissão (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.percentual_comissao}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      percentual_comissao: parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val) => setFormData({ ...formData, status: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-amber-500 hover:bg-amber-600 w-full sm:w-auto">
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { FaixaBase } from '@/services/comissoes'

const schema = z
  .object({
    id: z.string().optional(),
    faixa_entrada_minima: z.coerce.number().min(0, 'Mínimo 0'),
    faixa_entrada_maxima: z.coerce.number().min(0, 'Mínimo 0'),
    percentual_comissao: z.coerce.number().min(0, 'Mínimo 0'),
    status: z.string().default('ativo'),
  })
  .refine((data) => data.faixa_entrada_maxima > data.faixa_entrada_minima, {
    message: 'Máxima > Mínima',
    path: ['faixa_entrada_maxima'],
  })

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

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      faixa_entrada_minima: 0,
      faixa_entrada_maxima: 0,
      percentual_comissao: 0,
      status: 'ativo',
    },
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

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      await service.save(values)
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
    form.reset({
      id: f.id,
      faixa_entrada_minima: f.faixa_entrada_minima || 0,
      faixa_entrada_maxima: f.faixa_entrada_maxima || 0,
      percentual_comissao: f.percentual_comissao || 0,
      status: f.status || 'ativo',
    })
    setOpen(true)
  }

  const openAdd = () => {
    setEditingId(null)
    form.reset({
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="faixa_entrada_minima"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mínima (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="faixa_entrada_maxima"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Máxima (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="percentual_comissao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comissão (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ativo">Ativo</SelectItem>
                          <SelectItem value="inativo">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-amber-500 hover:bg-amber-600 w-full sm:w-auto">
                  Salvar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

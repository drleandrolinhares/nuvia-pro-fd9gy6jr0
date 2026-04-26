import { useState, useEffect, useCallback } from 'react'
import { format, addDays, parseISO } from 'date-fns'
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const demandaSchema = z.object({
  tipo: z.enum(['reclamacao', 'sugestao']),
  paciente_nome: z.string().min(1, 'Obrigatório'),
  quem_recebeu_id: z.string().min(1, 'Obrigatório'),
  quem_resolve_id: z.string().min(1, 'Obrigatório'),
  status: z.enum(['recebido', 'sendo_tratado', 'resolvido']).default('recebido'),
})

type DemandaFormValues = z.infer<typeof demandaSchema>

export default function SACPage() {
  const [demandas, setDemandas] = useState<any[]>([])
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const { toast } = useToast()

  const form = useForm<DemandaFormValues>({
    resolver: zodResolver(demandaSchema),
    defaultValues: {
      tipo: 'reclamacao',
      paciente_nome: '',
      quem_recebeu_id: '',
      quem_resolve_id: '',
      status: 'recebido',
    },
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [usersRes, demandasRes] = await Promise.all([
        supabase.from('usuarios').select('id, nome').eq('status', 'ativo').order('nome'),
        supabase
          .from('sac_demandas' as any)
          .select(`
          *,
          quem_recebeu:usuarios!sac_demandas_quem_recebeu_id_fkey(nome),
          quem_resolve:usuarios!sac_demandas_quem_resolve_id_fkey(nome)
        `)
          .order('criado_em', { ascending: false }),
      ])
      if (usersRes.error) throw usersRes.error
      if (demandasRes.error) throw demandasRes.error
      setUsuarios(usersRes.data || [])
      setDemandas(demandasRes.data || [])
    } catch (error: any) {
      toast({ title: 'Erro ao carregar', description: error.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const onSubmit = async (values: DemandaFormValues) => {
    try {
      const dtRec = new Date()
      const limite = addDays(dtRec, values.tipo === 'reclamacao' ? 1 : 2)
      const payload = { ...values }

      if (editingId) {
        const { error } = await supabase
          .from('sac_demandas' as any)
          .update(payload)
          .eq('id', editingId)
        if (error) throw error
        toast({ title: 'Atualizado com sucesso' })
      } else {
        const { error } = await supabase.from('sac_demandas' as any).insert({
          ...payload,
          data_recebimento: format(dtRec, 'yyyy-MM-dd'),
          limite_primeiro_contato: format(limite, 'yyyy-MM-dd'),
        })
        if (error) throw error
        toast({ title: 'Registrado com sucesso' })
      }
      setIsOpen(false)
      form.reset()
      setEditingId(null)
      fetchData()
    } catch (error: any) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
    }
  }

  const handleEdit = (d: any) => {
    setEditingId(d.id)
    form.reset({
      tipo: d.tipo,
      paciente_nome: d.paciente_nome,
      quem_recebeu_id: d.quem_recebeu_id,
      quem_resolve_id: d.quem_resolve_id,
      status: d.status,
    })
    setIsOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir?')) return
    try {
      const { error } = await supabase
        .from('sac_demandas' as any)
        .delete()
        .eq('id', id)
      if (error) throw error
      fetchData()
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SAC</h1>
          <p className="text-muted-foreground mt-2">Gestão de Sugestões e Reclamações</p>
        </div>
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open)
            if (!open) {
              form.reset()
              setEditingId(null)
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Nova Demanda
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar' : 'Nova'} Demanda</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tipo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="reclamacao">Reclamação</SelectItem>
                            <SelectItem value="sugestao">Sugestão</SelectItem>
                          </SelectContent>
                        </Select>
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
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger disabled={!editingId}>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="recebido">Recebido</SelectItem>
                            <SelectItem value="sendo_tratado">Sendo Tratado</SelectItem>
                            <SelectItem value="resolvido">Resolvido</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="paciente_nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paciente</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quem_recebeu_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quem Recebeu?</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {usuarios.map((u) => (
                            <SelectItem key={u.id} value={u.id}>
                              {u.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quem_resolve_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quem Resolve?</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {usuarios.map((u) => (
                            <SelectItem key={u.id} value={u.id}>
                              {u.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    Salvar
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>TIPO</TableHead>
              <TableHead>DATA RECEBIMENTO</TableHead>
              <TableHead>LIMITE CONTATO</TableHead>
              <TableHead>PACIENTE</TableHead>
              <TableHead>QUEM RECEBEU</TableHead>
              <TableHead>QUEM RESOLVE</TableHead>
              <TableHead>STATUS</TableHead>
              <TableHead className="w-[100px] text-right">AÇÕES</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center h-24">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : demandas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                  Nenhuma demanda registrada.
                </TableCell>
              </TableRow>
            ) : (
              demandas.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <span
                      className={cn(
                        'px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider',
                        d.tipo === 'reclamacao'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800',
                      )}
                    >
                      {d.tipo === 'reclamacao' ? 'RECLAMAÇÃO' : 'SUGESTÃO'}
                    </span>
                  </TableCell>
                  <TableCell>{format(parseISO(d.data_recebimento), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{format(parseISO(d.limite_primeiro_contato), 'dd/MM/yyyy')}</TableCell>
                  <TableCell className="font-medium">{d.paciente_nome}</TableCell>
                  <TableCell>{d.quem_recebeu?.nome || '-'}</TableCell>
                  <TableCell>{d.quem_resolve?.nome || '-'}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider text-white shadow-sm',
                        d.status === 'recebido' && 'bg-red-600',
                        d.status === 'sendo_tratado' && 'bg-yellow-500',
                        d.status === 'resolvido' && 'bg-green-600',
                      )}
                    >
                      {d.status.replace('_', ' ')}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(d)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(d.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

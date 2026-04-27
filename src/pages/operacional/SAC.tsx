import { useState, useEffect, useCallback } from 'react'
import { format, addDays, parseISO } from 'date-fns'
import { Plus, Edit2, Trash2, Loader2, MessageSquare, History, CheckCircle2 } from 'lucide-react'
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
import { useAuth } from '@/hooks/use-auth'

const demandaSchema = z.object({
  tipo: z.enum(['reclamacao', 'sugestao']),
  paciente_nome: z.string().min(1, 'Obrigatório'),
  quem_recebeu_id: z.string().min(1, 'Obrigatório'),
  quem_resolve_id: z.string().min(1, 'Obrigatório'),
  status: z.enum(['recebido', 'sendo_tratado', 'resolvido']).default('recebido'),
})

type DemandaFormValues = z.infer<typeof demandaSchema>

export default function SACPage() {
  const { user } = useAuth()
  const [demandas, setDemandas] = useState<any[]>([])
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [historico, setHistorico] = useState<any[]>([])
  const [loadingHistorico, setLoadingHistorico] = useState(false)

  const [isResolvedOpen, setIsResolvedOpen] = useState(false)
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

  const loadHistorico = useCallback(async () => {
    setLoadingHistorico(true)
    try {
      const { data, error } = await supabase
        .from('sac_historico' as any)
        .select(`
          *,
          usuario:usuarios!sac_historico_usuario_id_fkey(nome),
          demanda:sac_demandas!sac_historico_demanda_id_fkey(paciente_nome)
        `)
        .order('criado_em', { ascending: false })
        .limit(100)
      if (error) throw error
      setHistorico(data || [])
    } catch (e: any) {
      toast({ title: 'Erro ao carregar histórico', description: e.message, variant: 'destructive' })
    } finally {
      setLoadingHistorico(false)
    }
  }, [toast])

  useEffect(() => {
    if (isHistoryOpen) loadHistorico()
  }, [isHistoryOpen, loadHistorico])

  const onSubmit = async (values: DemandaFormValues) => {
    try {
      const dtRec = new Date()
      const limite = addDays(dtRec, values.tipo === 'reclamacao' ? 1 : 2)

      if (editingId) {
        const old = demandas.find((d) => d.id === editingId)
        const changes = []
        if (old.status !== values.status) {
          changes.push(
            `Status: ${old.status.replace('_', ' ')} -> ${values.status.replace('_', ' ')}`,
          )
        }
        if (old.quem_resolve_id !== values.quem_resolve_id) {
          const oldName = usuarios.find((u) => u.id === old.quem_resolve_id)?.nome || '-'
          const newName = usuarios.find((u) => u.id === values.quem_resolve_id)?.nome || '-'
          changes.push(`Responsável: ${oldName} -> ${newName}`)
        }

        const { error } = await supabase
          .from('sac_demandas' as any)
          .update({
            status: values.status,
            quem_resolve_id: values.quem_resolve_id,
          })
          .eq('id', editingId)
        if (error) throw error

        if (changes.length > 0 && user) {
          await supabase.from('sac_historico' as any).insert({
            demanda_id: editingId,
            usuario_id: user.id,
            acao: 'Edição',
            detalhes: changes.join(' | '),
          })
        }
        toast({ title: 'Atualizado com sucesso' })
      } else {
        const payload = { ...values }
        const { data: newDemanda, error } = await supabase
          .from('sac_demandas' as any)
          .insert({
            ...payload,
            data_recebimento: format(dtRec, 'yyyy-MM-dd'),
            limite_primeiro_contato: format(limite, 'yyyy-MM-dd'),
          })
          .select()
          .single()

        if (error) throw error

        if (user && newDemanda) {
          await supabase.from('sac_historico' as any).insert({
            demanda_id: newDemanda.id,
            usuario_id: user.id,
            acao: 'Criação',
            detalhes: 'Demanda registrada',
          })
        }
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

  const ativas = demandas.filter((d) => d.status !== 'resolvido')
  const resolvidas = demandas.filter((d) => d.status === 'resolvido')

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="bg-slate-900 border border-slate-800 border-l-4 border-l-amber-500 p-6 rounded-lg shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded-lg">
              <MessageSquare className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">SAC</h1>
              <p className="text-slate-400 mt-1">Gestão de Sugestões e Reclamações</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-slate-800 text-slate-100 border-slate-700 hover:bg-slate-700"
                >
                  <History className="w-4 h-4 mr-2" /> Rastrear Edições
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                  <DialogTitle>Histórico de Edições</DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto flex-1 mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-800 hover:!bg-transparent data-[state=selected]:bg-transparent">
                        <TableHead className="text-white font-semibold">DATA/HORA</TableHead>
                        <TableHead className="text-white font-semibold">USUÁRIO</TableHead>
                        <TableHead className="text-white font-semibold">PACIENTE</TableHead>
                        <TableHead className="text-white font-semibold">AÇÃO / DETALHES</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingHistorico ? (
                        <TableRow className="border-slate-800 hover:!bg-transparent data-[state=selected]:bg-transparent">
                          <TableCell colSpan={4} className="text-center h-24">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
                          </TableCell>
                        </TableRow>
                      ) : historico.length === 0 ? (
                        <TableRow className="border-slate-800 hover:!bg-transparent data-[state=selected]:bg-transparent">
                          <TableCell colSpan={4} className="text-center h-24 text-slate-400">
                            Nenhum histórico registrado.
                          </TableCell>
                        </TableRow>
                      ) : (
                        historico.map((h) => (
                          <TableRow
                            key={h.id}
                            className="border-slate-800 hover:!bg-transparent data-[state=selected]:bg-transparent"
                          >
                            <TableCell className="text-white whitespace-nowrap">
                              {format(parseISO(h.criado_em), 'dd/MM/yyyy HH:mm')}
                            </TableCell>
                            <TableCell className="text-white font-medium">
                              {h.usuario?.nome || '-'}
                            </TableCell>
                            <TableCell className="text-white">
                              {h.demanda?.paciente_nome || '-'}
                            </TableCell>
                            <TableCell className="text-white">
                              <span className="font-semibold text-amber-400">{h.acao}</span>
                              {h.detalhes && (
                                <span className="block text-sm text-slate-400 mt-1">
                                  {h.detalhes}
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isResolvedOpen} onOpenChange={setIsResolvedOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-green-600/10 text-green-500 border-green-600/30 hover:bg-green-600/20"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Histórico de Soluções
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                  <DialogTitle>Demandas Concluídas (Resolvidas)</DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto flex-1 mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-800 hover:!bg-transparent data-[state=selected]:bg-transparent">
                        <TableHead className="text-white font-semibold">TIPO</TableHead>
                        <TableHead className="text-white font-semibold">DATA</TableHead>
                        <TableHead className="text-white font-semibold">PACIENTE</TableHead>
                        <TableHead className="text-white font-semibold">QUEM RECEBEU</TableHead>
                        <TableHead className="text-white font-semibold">QUEM RESOLVEU</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resolvidas.length === 0 ? (
                        <TableRow className="border-slate-800 hover:!bg-transparent data-[state=selected]:bg-transparent">
                          <TableCell colSpan={5} className="text-center h-24 text-slate-400">
                            Nenhuma demanda resolvida.
                          </TableCell>
                        </TableRow>
                      ) : (
                        resolvidas.map((d) => (
                          <TableRow
                            key={d.id}
                            className="border-slate-800 hover:!bg-transparent data-[state=selected]:bg-transparent"
                          >
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
                            <TableCell className="text-white whitespace-nowrap">
                              {format(parseISO(d.data_recebimento), 'dd/MM/yyyy')}
                            </TableCell>
                            <TableCell className="font-medium text-white">
                              {d.paciente_nome}
                            </TableCell>
                            <TableCell className="text-white">
                              {d.quem_recebeu?.nome || '-'}
                            </TableCell>
                            <TableCell className="text-white">
                              {d.quem_resolve?.nome || '-'}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </DialogContent>
            </Dialog>

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
                <Button className="gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold">
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
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              disabled={!!editingId}
                            >
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
                            <Input placeholder="Nome..." {...field} disabled={!!editingId} />
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
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={!!editingId}
                          >
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
                      <Button
                        type="submit"
                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold"
                        disabled={form.formState.isSubmitting}
                      >
                        Salvar
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="border border-slate-800 bg-slate-900 rounded-md shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-800 hover:!bg-transparent data-[state=selected]:bg-transparent">
              <TableHead className="text-white font-semibold">TIPO</TableHead>
              <TableHead className="text-white font-semibold">DATA RECEBIMENTO</TableHead>
              <TableHead className="text-white font-semibold">LIMITE CONTATO</TableHead>
              <TableHead className="text-white font-semibold">PACIENTE</TableHead>
              <TableHead className="text-white font-semibold">QUEM RECEBEU</TableHead>
              <TableHead className="text-white font-semibold">QUEM RESOLVE</TableHead>
              <TableHead className="text-white font-semibold">STATUS</TableHead>
              <TableHead className="w-[100px] text-right text-white font-semibold">AÇÕES</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="border-slate-800 hover:!bg-transparent data-[state=selected]:bg-transparent">
                <TableCell colSpan={8} className="text-center h-24">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
                </TableCell>
              </TableRow>
            ) : ativas.length === 0 ? (
              <TableRow className="border-slate-800 hover:!bg-transparent data-[state=selected]:bg-transparent">
                <TableCell colSpan={8} className="text-center h-24 text-slate-400">
                  Nenhuma demanda ativa registrada.
                </TableCell>
              </TableRow>
            ) : (
              ativas.map((d) => (
                <TableRow
                  key={d.id}
                  className="border-slate-800 hover:!bg-transparent data-[state=selected]:bg-transparent"
                >
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
                  <TableCell className="text-white">
                    {format(parseISO(d.data_recebimento), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell className="text-white">
                    {format(parseISO(d.limite_primeiro_contato), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell className="font-medium text-white">{d.paciente_nome}</TableCell>
                  <TableCell className="text-white">{d.quem_recebeu?.nome || '-'}</TableCell>
                  <TableCell className="text-white">{d.quem_resolve?.nome || '-'}</TableCell>
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
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(d)}
                        className="text-slate-300 hover:text-white hover:bg-slate-800"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(d.id)}
                        className="text-red-500 hover:text-red-400 hover:bg-slate-800"
                      >
                        <Trash2 className="w-4 h-4" />
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

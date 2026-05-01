import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { format, addDays, parseISO, differenceInDays, startOfDay } from 'date-fns'
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  MessageSquare,
  History,
  CheckCircle2,
  Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
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

const demandaSchema = z
  .object({
    tipo: z.enum(['reclamacao', 'sugestao']),
    setor: z.string().optional(),
    paciente_nome: z.string().min(1, 'Obrigatório'),
    quem_recebeu_id: z.string().optional(),
    quem_resolve_id: z.string().min(1, 'Obrigatório'),
    descricao: z.string().optional(),
    solucao: z.string().optional(),
    status: z.enum(['recebido', 'sendo_tratado', 'resolvido']).default('recebido'),
    data_prevista: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.status === 'sendo_tratado' || val.status === 'resolvido') {
      if (!val.data_prevista) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Obrigatório',
          path: ['data_prevista'],
        })
      }
      if (!val.solucao || val.solucao.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Obrigatório',
          path: ['solucao'],
        })
      }
    }
  })

type DemandaFormValues = z.infer<typeof demandaSchema>

export default function SACPage() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [demandas, setDemandas] = useState<any[]>([])
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [historico, setHistorico] = useState<any[]>([])
  const [loadingHistorico, setLoadingHistorico] = useState(false)

  const [isResolvedOpen, setIsResolvedOpen] = useState(false)

  const [orientacao, setOrientacao] = useState('')
  const [tempOrientacao, setTempOrientacao] = useState('')
  const [orientacaoEditMode, setOrientacaoEditMode] = useState(false)

  const [orientacaoDataSolucao, setOrientacaoDataSolucao] = useState('')
  const [tempOrientacaoDataSolucao, setTempOrientacaoDataSolucao] = useState('')
  const [orientacaoDataSolucaoEditMode, setOrientacaoDataSolucaoEditMode] = useState(false)

  const [isAdmin, setIsAdmin] = useState(false)

  const { toast } = useToast()

  const form = useForm<DemandaFormValues>({
    resolver: zodResolver(demandaSchema),
    defaultValues: {
      tipo: 'reclamacao',
      setor: '',
      paciente_nome: '',
      quem_recebeu_id: '',
      quem_resolve_id: '',
      descricao: '',
      solucao: '',
      status: 'recebido',
      data_prevista: '',
    },
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [usersRes, demandasRes, configRes] = await Promise.all([
        supabase.from('usuarios').select('id, nome, role').eq('status', 'ativo').order('nome'),
        supabase
          .from('sac_demandas' as any)
          .select(`
          *,
          quem_recebeu:usuarios!sac_demandas_quem_recebeu_id_fkey(nome),
          quem_resolve:usuarios!sac_demandas_quem_resolve_id_fkey(nome)
        `)
          .order('criado_em', { ascending: false }),
        supabase
          .from('sac_configuracoes' as any)
          .select('orientacao_status, orientacao_data_solucao')
          .single(),
      ])
      if (usersRes.error) throw usersRes.error
      if (demandasRes.error) throw demandasRes.error

      setUsuarios(usersRes.data || [])
      setDemandas(demandasRes.data || [])

      if (configRes.data) {
        setOrientacao(configRes.data.orientacao_status)
        setTempOrientacao(configRes.data.orientacao_status)

        const dataSolucaoVal =
          configRes.data.orientacao_data_solucao ||
          'Se o status do caso estiver como SENDO TRATADO, esta data representará a data prevista para a solução.\nSe o status estiver como RESOLVIDO, a data significará a data da solução do caso.'
        setOrientacaoDataSolucao(dataSolucaoVal)
        setTempOrientacaoDataSolucao(dataSolucaoVal)
      }

      if (user) {
        const loggedUser = usersRes.data?.find((u) => u.id === user.id)
        setIsAdmin(
          loggedUser?.role === 'admin' ||
            user.email === 'drleandro@nuvia.com' ||
            user.email === 'drleandrolinhares@gmail.com',
        )
      }
    } catch (error: any) {
      toast({ title: 'Erro ao carregar', description: error.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast, user])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    const demandaId = searchParams.get('demanda')
    if (demandaId && demandas.length > 0 && !isOpen) {
      const d = demandas.find((item) => item.id === demandaId)
      if (d) {
        setEditingId(d.id)
        form.reset({
          tipo: d.tipo,
          setor: d.setor || '',
          paciente_nome: d.paciente_nome,
          quem_recebeu_id: d.quem_recebeu_id || '',
          quem_resolve_id: d.quem_resolve_id || '',
          descricao: d.descricao || '',
          solucao: d.solucao || '',
          status: d.status,
          data_prevista: d.data_prevista || '',
        })
        setIsOpen(true)
        searchParams.delete('demanda')
        setSearchParams(searchParams, { replace: true })
      }
    }
  }, [demandas, searchParams, setSearchParams, isOpen, form])

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

  const handleSaveOrientacao = async () => {
    try {
      const { error } = await supabase
        .from('sac_configuracoes' as any)
        .update({ orientacao_status: tempOrientacao })
        .eq('id', '00000000-0000-0000-0000-000000000001')
      if (error) throw error
      setOrientacao(tempOrientacao)
      setOrientacaoEditMode(false)
      toast({ title: 'Orientação atualizada com sucesso' })
    } catch (e: any) {
      toast({ title: 'Erro ao salvar orientação', description: e.message, variant: 'destructive' })
    }
  }

  const handleSaveOrientacaoDataSolucao = async () => {
    try {
      const { error } = await supabase
        .from('sac_configuracoes' as any)
        .update({ orientacao_data_solucao: tempOrientacaoDataSolucao })
        .eq('id', '00000000-0000-0000-0000-000000000001')
      if (error) throw error
      setOrientacaoDataSolucao(tempOrientacaoDataSolucao)
      setOrientacaoDataSolucaoEditMode(false)
      toast({ title: 'Orientação atualizada com sucesso' })
    } catch (e: any) {
      toast({ title: 'Erro ao salvar orientação', description: e.message, variant: 'destructive' })
    }
  }

  const onSubmit = async (values: DemandaFormValues) => {
    if (!editingId) {
      let hasError = false
      if (!values.setor) {
        form.setError('setor', { type: 'manual', message: 'Obrigatório' })
        hasError = true
      }
      if (!values.descricao) {
        form.setError('descricao', { type: 'manual', message: 'Obrigatório' })
        hasError = true
      }
      if (hasError) return
    }

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
        if (
          old.data_prevista !== values.data_prevista &&
          (values.status === 'sendo_tratado' || values.status === 'resolvido')
        ) {
          changes.push(
            `Data da Solução: ${old.data_prevista ? format(parseISO(old.data_prevista), 'dd/MM/yyyy') : '-'} -> ${values.data_prevista ? format(parseISO(values.data_prevista), 'dd/MM/yyyy') : '-'}`,
          )
        }
        if (
          old.solucao !== values.solucao &&
          (values.status === 'sendo_tratado' || values.status === 'resolvido')
        ) {
          changes.push(`Solução atualizada`)
        }

        const { error } = await supabase
          .from('sac_demandas' as any)
          .update({
            status: values.status,
            quem_resolve_id: values.quem_resolve_id,
            data_prevista: values.data_prevista || null,
            solucao: values.solucao || null,
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
        const payload = {
          ...values,
          data_prevista: values.data_prevista || null,
          solucao: values.solucao || null,
        }
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
      setor: d.setor || '',
      paciente_nome: d.paciente_nome,
      quem_recebeu_id: d.quem_recebeu_id || '',
      quem_resolve_id: d.quem_resolve_id || '',
      descricao: d.descricao || '',
      solucao: d.solucao || '',
      status: d.status,
      data_prevista: d.data_prevista || '',
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

  const diffDays = (start: string, end: string) => {
    try {
      const s = startOfDay(parseISO(start))
      const e = startOfDay(parseISO(end))
      return Math.max(0, differenceInDays(e, s))
    } catch {
      return 0
    }
  }

  const [mesReferencia, setMesReferencia] = useState(() => format(new Date(), 'yyyy-MM'))

  const demandasDoMes = demandas.filter((d) => d.data_recebimento?.startsWith(mesReferencia))

  const recTotal = demandasDoMes.filter((d) => d.tipo === 'reclamacao').length
  const recRecebido = demandasDoMes.filter(
    (d) => d.tipo === 'reclamacao' && d.status === 'recebido',
  ).length
  const recSendoTratado = demandasDoMes.filter(
    (d) => d.tipo === 'reclamacao' && d.status === 'sendo_tratado',
  ).length
  const recResolvido = demandasDoMes.filter(
    (d) => d.tipo === 'reclamacao' && d.status === 'resolvido',
  )
  const recResolvidoCount = recResolvido.length
  const recMediaDias =
    recResolvidoCount > 0
      ? recResolvido.reduce(
          (acc, d) => acc + diffDays(d.data_recebimento, d.data_prevista || d.atualizado_em),
          0,
        ) / recResolvidoCount
      : 0

  const sugTotal = demandasDoMes.filter((d) => d.tipo === 'sugestao').length
  const sugRecebido = demandasDoMes.filter(
    (d) => d.tipo === 'sugestao' && d.status === 'recebido',
  ).length
  const sugSendoTratado = demandasDoMes.filter(
    (d) => d.tipo === 'sugestao' && d.status === 'sendo_tratado',
  ).length
  const sugResolvido = demandasDoMes.filter(
    (d) => d.tipo === 'sugestao' && d.status === 'resolvido',
  )
  const sugResolvidoCount = sugResolvido.length
  const sugMediaDias =
    sugResolvidoCount > 0
      ? sugResolvido.reduce(
          (acc, d) => acc + diffDays(d.data_recebimento, d.data_prevista || d.atualizado_em),
          0,
        ) / sugResolvidoCount
      : 0

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
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col bg-slate-900 border-slate-800 text-slate-100">
                <DialogHeader>
                  <DialogTitle className="text-slate-100">Histórico de Edições</DialogTitle>
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
              <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden flex flex-col bg-slate-900 border-slate-800 text-slate-100">
                <DialogHeader>
                  <DialogTitle className="text-slate-100">
                    Demandas Concluídas (Resolvidas)
                  </DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto flex-1 mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-800 hover:!bg-transparent data-[state=selected]:bg-transparent">
                        <TableHead className="text-white font-semibold">TIPO</TableHead>
                        <TableHead className="text-white font-semibold">SETOR</TableHead>
                        <TableHead className="text-white font-semibold">DATA</TableHead>
                        <TableHead className="text-white font-semibold">PACIENTE</TableHead>
                        <TableHead className="text-white font-semibold text-center">
                          DESC.
                        </TableHead>
                        <TableHead className="text-white font-semibold text-center">SOL.</TableHead>
                        <TableHead className="text-white font-semibold">QUEM RECEBEU</TableHead>
                        <TableHead className="text-white font-semibold">QUEM RESOLVEU</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resolvidas.length === 0 ? (
                        <TableRow className="border-slate-800 hover:!bg-transparent data-[state=selected]:bg-transparent">
                          <TableCell colSpan={8} className="text-center h-24 text-slate-400">
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
                              {d.setor || '-'}
                            </TableCell>
                            <TableCell className="text-white whitespace-nowrap">
                              {d.criado_em
                                ? format(parseISO(d.criado_em), 'dd/MM/yyyy HH:mm')
                                : format(parseISO(d.data_recebimento), 'dd/MM/yyyy')}
                            </TableCell>
                            <TableCell className="font-medium text-white">
                              {d.paciente_nome}
                            </TableCell>
                            <TableCell className="text-center">
                              {d.descricao ? (
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <button
                                      type="button"
                                      className="text-amber-500 hover:text-amber-400 p-1.5 rounded hover:bg-amber-500/10 transition-colors inline-flex items-center justify-center"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-80 bg-slate-900 border-slate-800 text-slate-200 text-sm whitespace-pre-wrap break-words z-50">
                                    {d.descricao}
                                  </PopoverContent>
                                </Popover>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {d.solucao ? (
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <button
                                      type="button"
                                      className="text-blue-500 hover:text-blue-400 p-1.5 rounded hover:bg-blue-500/10 transition-colors inline-flex items-center justify-center"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-80 bg-slate-900 border-slate-800 text-slate-200 text-sm whitespace-pre-wrap break-words z-50">
                                    {d.solucao}
                                  </PopoverContent>
                                </Popover>
                              ) : (
                                '-'
                              )}
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
                  setOrientacaoEditMode(false)
                  setOrientacaoDataSolucaoEditMode(false)
                }
              }}
            >
              <DialogTrigger asChild>
                <Button className="gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold">
                  <Plus className="w-4 h-4" /> Nova Demanda
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] bg-slate-900 border-slate-800 text-slate-100 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-slate-100">
                    {editingId ? 'Editar' : 'Nova'} Demanda
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="tipo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-200">Tipo</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              disabled={!!editingId}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-100 disabled:opacity-50">
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                                <SelectItem
                                  value="reclamacao"
                                  className="focus:bg-slate-800 focus:text-slate-100"
                                >
                                  Reclamação
                                </SelectItem>
                                <SelectItem
                                  value="sugestao"
                                  className="focus:bg-slate-800 focus:text-slate-100"
                                >
                                  Sugestão
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="setor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-200">Setor</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              disabled={!!editingId}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-100 disabled:opacity-50">
                                  <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                                <SelectItem
                                  value="Administrativo"
                                  className="focus:bg-slate-800 focus:text-slate-100"
                                >
                                  Administrativo
                                </SelectItem>
                                <SelectItem
                                  value="Comercial"
                                  className="focus:bg-slate-800 focus:text-slate-100"
                                >
                                  Comercial
                                </SelectItem>
                                <SelectItem
                                  value="Financeiro"
                                  className="focus:bg-slate-800 focus:text-slate-100"
                                >
                                  Financeiro
                                </SelectItem>
                                <SelectItem
                                  value="Operacional"
                                  className="focus:bg-slate-800 focus:text-slate-100"
                                >
                                  Operacional
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="paciente_nome"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-200">Paciente</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nome..."
                                {...field}
                                disabled={!!editingId}
                                className="bg-slate-950 border-slate-800 text-slate-100 disabled:opacity-50"
                              />
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
                            <FormLabel className="text-slate-200">Quem Recebeu?</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              disabled={!!editingId}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-100 disabled:opacity-50">
                                  <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                                {usuarios.map((u) => (
                                  <SelectItem
                                    key={u.id}
                                    value={u.id}
                                    className="focus:bg-slate-800 focus:text-slate-100"
                                  >
                                    {u.nome}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="descricao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-200">Descrição do Problema</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Descreva detalhadamente..."
                              {...field}
                              disabled={!!editingId}
                              className="bg-slate-950 border-slate-800 text-slate-100 min-h-[80px] disabled:opacity-50 resize-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-4 mt-2">
                      <FormField
                        control={form.control}
                        name="quem_resolve_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-200">Quem Resolve?</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-100">
                                  <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                                {usuarios.map((u) => (
                                  <SelectItem
                                    key={u.id}
                                    value={u.id}
                                    className="focus:bg-slate-800 focus:text-slate-100"
                                  >
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
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center gap-2 mb-2">
                              <FormLabel className="text-slate-200 mb-0">Status</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button
                                    type="button"
                                    className="text-amber-500 hover:text-amber-400 focus:outline-none flex items-center justify-center transition-colors"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent
                                  side="top"
                                  className="w-80 bg-slate-900 border-slate-800 text-slate-200 text-sm z-50"
                                >
                                  {orientacaoEditMode ? (
                                    <div className="space-y-3">
                                      <Textarea
                                        value={tempOrientacao}
                                        onChange={(e) => setTempOrientacao(e.target.value)}
                                        className="bg-slate-950 border-slate-800 min-h-[120px] text-slate-200"
                                      />
                                      <div className="flex justify-end gap-2">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                                          onClick={() => {
                                            setOrientacaoEditMode(false)
                                            setTempOrientacao(orientacao)
                                          }}
                                        >
                                          Cancelar
                                        </Button>
                                        <Button
                                          size="sm"
                                          className="bg-amber-500 hover:bg-amber-600 text-slate-950"
                                          onClick={handleSaveOrientacao}
                                        >
                                          Salvar
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="space-y-3">
                                      <p className="leading-relaxed font-medium">{orientacao}</p>
                                      {isAdmin && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="w-full text-amber-500 hover:text-amber-400 hover:bg-amber-500/10"
                                          onClick={() => setOrientacaoEditMode(true)}
                                        >
                                          Editar Orientação
                                        </Button>
                                      )}
                                    </div>
                                  )}
                                </PopoverContent>
                              </Popover>
                            </div>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              disabled={!editingId}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-100 disabled:opacity-50">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                                <SelectItem
                                  value="recebido"
                                  className="focus:bg-slate-800 focus:text-slate-100"
                                >
                                  Recebido
                                </SelectItem>
                                <SelectItem
                                  value="sendo_tratado"
                                  className="focus:bg-slate-800 focus:text-slate-100"
                                >
                                  Sendo Tratado
                                </SelectItem>
                                <SelectItem
                                  value="resolvido"
                                  className="focus:bg-slate-800 focus:text-slate-100"
                                >
                                  Resolvido
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {(form.watch('status') === 'sendo_tratado' ||
                      form.watch('status') === 'resolvido') && (
                      <div className="animate-fade-in-down grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="data_prevista"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center gap-2 mb-2">
                                <FormLabel className="text-slate-200 mb-0">
                                  Data da Solução
                                </FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <button
                                      type="button"
                                      className="text-amber-500 hover:text-amber-400 focus:outline-none flex items-center justify-center transition-colors"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </button>
                                  </PopoverTrigger>
                                  <PopoverContent
                                    side="top"
                                    className="w-80 bg-slate-900 border-slate-800 text-slate-200 text-sm z-50"
                                  >
                                    {orientacaoDataSolucaoEditMode ? (
                                      <div className="space-y-3">
                                        <Textarea
                                          value={tempOrientacaoDataSolucao}
                                          onChange={(e) =>
                                            setTempOrientacaoDataSolucao(e.target.value)
                                          }
                                          className="bg-slate-950 border-slate-800 min-h-[120px] text-slate-200"
                                        />
                                        <div className="flex justify-end gap-2">
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                                            onClick={() => {
                                              setOrientacaoDataSolucaoEditMode(false)
                                              setTempOrientacaoDataSolucao(orientacaoDataSolucao)
                                            }}
                                          >
                                            Cancelar
                                          </Button>
                                          <Button
                                            size="sm"
                                            className="bg-amber-500 hover:bg-amber-600 text-slate-950"
                                            onClick={handleSaveOrientacaoDataSolucao}
                                          >
                                            Salvar
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="space-y-3">
                                        <p className="leading-relaxed font-medium whitespace-pre-wrap">
                                          {orientacaoDataSolucao}
                                        </p>
                                        {isAdmin && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full text-amber-500 hover:text-amber-400 hover:bg-amber-500/10"
                                            onClick={() => setOrientacaoDataSolucaoEditMode(true)}
                                          >
                                            Editar Orientação
                                          </Button>
                                        )}
                                      </div>
                                    )}
                                  </PopoverContent>
                                </Popover>
                              </div>
                              <FormControl>
                                <Input
                                  type="date"
                                  {...field}
                                  className="bg-slate-950 border-slate-800 text-slate-100 w-full"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="solucao"
                          render={({ field }) => (
                            <FormItem className="col-span-1 md:col-span-2">
                              <FormLabel className="text-slate-200">Solução Proposta</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Descreva detalhadamente a solução adotada..."
                                  {...field}
                                  className="bg-slate-950 border-slate-800 text-slate-100 min-h-[80px] resize-none"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

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

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Painel de Acompanhamento</h2>
            <p className="text-sm text-slate-400">Indicadores mensais de demandas</p>
          </div>
          <Input
            type="month"
            value={mesReferencia}
            onChange={(e) => setMesReferencia(e.target.value)}
            className="w-full sm:w-48 bg-slate-950 border-slate-800 text-slate-100"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Reclamações */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <h3 className="font-semibold text-slate-200 uppercase tracking-wider text-sm">
                Reclamações
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/50 flex flex-col justify-center">
                <p className="text-[10px] sm:text-xs text-slate-400 font-semibold tracking-wider mb-1">
                  TOTAL
                </p>
                <p className="text-2xl font-bold text-slate-100">{recTotal}</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/50 flex flex-col justify-center">
                <p className="text-[10px] sm:text-xs text-slate-400 font-semibold tracking-wider mb-1">
                  RECEBIDO
                </p>
                <p className="text-2xl font-bold text-red-500">{recRecebido}</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/50 flex flex-col justify-center">
                <p className="text-[10px] sm:text-xs text-slate-400 font-semibold tracking-wider mb-1">
                  TRATANDO
                </p>
                <p className="text-2xl font-bold text-yellow-500">{recSendoTratado}</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/50 flex flex-col justify-center">
                <p className="text-[10px] sm:text-xs text-slate-400 font-semibold tracking-wider mb-1">
                  RESOLVIDO
                </p>
                <p className="text-2xl font-bold text-green-500">{recResolvidoCount}</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/50 col-span-2 flex flex-col justify-center">
                <p className="text-[10px] sm:text-xs text-slate-400 font-semibold tracking-wider mb-1">
                  MÉDIA DE DIAS (RESOLUÇÃO)
                </p>
                <p className="text-2xl font-bold text-blue-400">
                  {recMediaDias.toFixed(1)}{' '}
                  <span className="text-sm font-normal text-slate-500">dias</span>
                </p>
              </div>
            </div>
          </div>

          {/* Sugestões */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <h3 className="font-semibold text-slate-200 uppercase tracking-wider text-sm">
                Sugestões
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/50 flex flex-col justify-center">
                <p className="text-[10px] sm:text-xs text-slate-400 font-semibold tracking-wider mb-1">
                  TOTAL
                </p>
                <p className="text-2xl font-bold text-slate-100">{sugTotal}</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/50 flex flex-col justify-center">
                <p className="text-[10px] sm:text-xs text-slate-400 font-semibold tracking-wider mb-1">
                  RECEBIDO
                </p>
                <p className="text-2xl font-bold text-red-500">{sugRecebido}</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/50 flex flex-col justify-center">
                <p className="text-[10px] sm:text-xs text-slate-400 font-semibold tracking-wider mb-1">
                  TRATANDO
                </p>
                <p className="text-2xl font-bold text-yellow-500">{sugSendoTratado}</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/50 flex flex-col justify-center">
                <p className="text-[10px] sm:text-xs text-slate-400 font-semibold tracking-wider mb-1">
                  RESOLVIDO
                </p>
                <p className="text-2xl font-bold text-green-500">{sugResolvidoCount}</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/50 col-span-2 flex flex-col justify-center">
                <p className="text-[10px] sm:text-xs text-slate-400 font-semibold tracking-wider mb-1">
                  MÉDIA DE DIAS (RESOLUÇÃO)
                </p>
                <p className="text-2xl font-bold text-blue-400">
                  {sugMediaDias.toFixed(1)}{' '}
                  <span className="text-sm font-normal text-slate-500">dias</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border border-slate-800 bg-slate-900 rounded-md shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-800 hover:!bg-transparent data-[state=selected]:bg-transparent">
              <TableHead className="text-white font-semibold">TIPO</TableHead>
              <TableHead className="text-white font-semibold whitespace-nowrap">SETOR</TableHead>
              <TableHead className="text-white font-semibold whitespace-nowrap">
                DATA REC.
              </TableHead>
              <TableHead className="text-white font-semibold whitespace-nowrap">
                LIM. CONTATO
              </TableHead>
              <TableHead className="text-white font-semibold w-[150px]">PACIENTE</TableHead>
              <TableHead className="text-white font-semibold w-[120px]">RESPONSÁVEL</TableHead>
              <TableHead className="text-white font-semibold text-center">DESC.</TableHead>
              <TableHead className="text-white font-semibold text-center">SOL.</TableHead>
              <TableHead className="text-white font-semibold whitespace-nowrap">
                DATA SOLUÇÃO
              </TableHead>
              <TableHead className="text-white font-semibold">STATUS</TableHead>
              <TableHead className="w-[80px] text-right text-white font-semibold">AÇÕES</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="border-slate-800 hover:!bg-transparent data-[state=selected]:bg-transparent">
                <TableCell colSpan={11} className="text-center h-24">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
                </TableCell>
              </TableRow>
            ) : ativas.length === 0 ? (
              <TableRow className="border-slate-800 hover:!bg-transparent data-[state=selected]:bg-transparent">
                <TableCell colSpan={11} className="text-center h-24 text-slate-400">
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
                        'px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider whitespace-nowrap',
                        d.tipo === 'reclamacao'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800',
                      )}
                    >
                      {d.tipo === 'reclamacao' ? 'RECLAMAÇÃO' : 'SUGESTÃO'}
                    </span>
                  </TableCell>
                  <TableCell className="text-white whitespace-nowrap">{d.setor || '-'}</TableCell>
                  <TableCell className="text-white whitespace-nowrap">
                    {d.criado_em
                      ? format(parseISO(d.criado_em), 'dd/MM/yyyy HH:mm')
                      : format(parseISO(d.data_recebimento), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell className="text-white whitespace-nowrap">
                    {format(parseISO(d.limite_primeiro_contato), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell
                    className="font-medium text-white max-w-[150px] truncate"
                    title={d.paciente_nome}
                  >
                    {d.paciente_nome}
                  </TableCell>
                  <TableCell
                    className="text-white max-w-[120px] truncate"
                    title={d.quem_resolve?.nome || '-'}
                  >
                    {d.quem_resolve?.nome || '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    {d.descricao ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="text-amber-500 hover:text-amber-400 p-1.5 rounded hover:bg-amber-500/10 transition-colors inline-flex items-center justify-center"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 bg-slate-900 border-slate-800 text-slate-200 text-sm whitespace-pre-wrap break-words z-50">
                          {d.descricao}
                        </PopoverContent>
                      </Popover>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {d.solucao ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="text-blue-500 hover:text-blue-400 p-1.5 rounded hover:bg-blue-500/10 transition-colors inline-flex items-center justify-center"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 bg-slate-900 border-slate-800 text-slate-200 text-sm whitespace-pre-wrap break-words z-50">
                          {d.solucao}
                        </PopoverContent>
                      </Popover>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className="text-white whitespace-nowrap">
                    {d.data_prevista ? format(parseISO(d.data_prevista), 'dd/MM/yyyy') : '-'}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider shadow-sm whitespace-nowrap',
                        d.status === 'recebido' && 'bg-red-600 text-white',
                        d.status === 'sendo_tratado' && 'bg-yellow-500 text-yellow-800',
                        d.status === 'resolvido' && 'bg-green-600 text-white',
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
                        className="text-slate-300 hover:text-white hover:bg-slate-800 h-8 w-8"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(d.id)}
                        className="text-red-500 hover:text-red-400 hover:bg-slate-800 h-8 w-8"
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

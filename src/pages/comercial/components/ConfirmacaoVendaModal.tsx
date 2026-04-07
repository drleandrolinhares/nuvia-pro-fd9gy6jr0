import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Check, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const formSchema = z
  .object({
    paciente_nome: z.string().min(1, 'Nome do paciente é obrigatório'),
    paciente_telefone: z.string().optional().nullable(),
    data_avaliacao: z.string().optional().nullable(),
    dentista_avaliador_id: z.string().optional().nullable(),
    crc_comercial_id: z.string().optional().nullable(),
    valor_orcamento: z.coerce.number().min(0, 'Valor não pode ser negativo'),
    tipo_tratamento: z.string().optional().nullable(),
    observacoes: z.string().optional().nullable(),
    data_fechamento: z.string().min(1, 'Data de fechamento é obrigatória'),
    valor_entrada: z.coerce.number().min(0, 'Valor não pode ser negativo'),
    observacoes_fechamento: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.valor_entrada > data.valor_orcamento) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Valor da entrada não pode ser maior que o valor do tratamento',
        path: ['valor_entrada'],
      })
    }

    if (data.data_fechamento && data.data_avaliacao) {
      if (data.data_fechamento < data.data_avaliacao) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Data de fechamento não pode ser anterior à data da avaliação',
          path: ['data_fechamento'],
        })
      }
    }
  })

type FormValues = z.infer<typeof formSchema>

interface Props {
  isOpen: boolean
  onClose: () => void
  avaliacao: any
}

export function ConfirmacaoVendaModal({ isOpen, onClose, avaliacao }: Props) {
  const [loading, setLoading] = useState(false)
  const [dentistas, setDentistas] = useState<any[]>([])
  const [crcs, setCrcs] = useState<any[]>([])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      paciente_nome: '',
      paciente_telefone: '',
      data_avaliacao: '',
      dentista_avaliador_id: '',
      crc_comercial_id: '',
      valor_orcamento: 0,
      tipo_tratamento: '',
      observacoes: '',
      data_fechamento: '',
      valor_entrada: 0,
      observacoes_fechamento: '',
    },
  })

  useEffect(() => {
    if (isOpen) {
      // Carregar listas de profissionais
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

      // Preencher formulário
      const today = new Date().toISOString().split('T')[0]
      form.reset({
        paciente_nome: avaliacao.pacientes?.nome || '',
        paciente_telefone: avaliacao.pacientes?.telefone || '',
        data_avaliacao: avaliacao.data_avaliacao || today,
        dentista_avaliador_id: avaliacao.dentista_avaliador_id || '',
        crc_comercial_id: avaliacao.crc_comercial_id || '',
        valor_orcamento: avaliacao.valor_orcamento || 0,
        tipo_tratamento: avaliacao.tipo_tratamento || '',
        observacoes: avaliacao.observacoes || '',
        data_fechamento: avaliacao.data_fechamento || today,
        valor_entrada: avaliacao.valor_entrada || 0,
        observacoes_fechamento: avaliacao.observacoes_fechamento || '',
      })
    }
  }, [isOpen, avaliacao, form])

  const valorOrcamento = form.watch('valor_orcamento') || 0
  const valorEntrada = form.watch('valor_entrada') || 0
  const percentualEntrada = valorOrcamento > 0 ? (valorEntrada / valorOrcamento) * 100 : 0

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true)

      // 1. Atualizar Paciente
      if (avaliacao.paciente_id) {
        const { error: pacError } = await supabase
          .from('pacientes')
          .update({
            nome: data.paciente_nome,
            telefone: data.paciente_telefone,
          })
          .eq('id', avaliacao.paciente_id)

        if (pacError) throw pacError
      }

      // 2. Inserir em vendas_confirmadas
      const { error: vcError } = await supabase.from('vendas_confirmadas' as any).insert({
        oportunidade_id: avaliacao.id,
        paciente_nome: data.paciente_nome,
        telefone: data.paciente_telefone || null,
        data_original: data.data_avaliacao || null,
        dentista_avaliador:
          data.dentista_avaliador_id && data.dentista_avaliador_id !== 'nenhum'
            ? data.dentista_avaliador_id
            : null,
        crc:
          data.crc_comercial_id && data.crc_comercial_id !== 'nenhum'
            ? data.crc_comercial_id
            : null,
        valor_tratamento: data.valor_orcamento,
        tratamento: data.tipo_tratamento || null,
        observacoes: data.observacoes || null,
        data_fechamento: data.data_fechamento,
        valor_entrada: data.valor_entrada,
        percentual_entrada: percentualEntrada,
        observacoes_fechamento: data.observacoes_fechamento || null,
      })

      if (vcError) throw vcError

      // 3. Atualizar Avaliação (Fechamento)
      const novoStatus =
        data.crc_comercial_id && data.crc_comercial_id !== 'nenhum'
          ? 'Fechada em Comercial'
          : 'Fechada em Avaliação'

      const { error: avError } = await supabase
        .from('avaliacoes')
        .update({
          data_avaliacao: data.data_avaliacao || null,
          dentista_avaliador_id:
            data.dentista_avaliador_id && data.dentista_avaliador_id !== 'nenhum'
              ? data.dentista_avaliador_id
              : null,
          crc_comercial_id:
            data.crc_comercial_id && data.crc_comercial_id !== 'nenhum'
              ? data.crc_comercial_id
              : null,
          valor_orcamento: data.valor_orcamento,
          tipo_tratamento: data.tipo_tratamento || null,
          observacoes: data.observacoes || null,
          data_fechamento: data.data_fechamento || null,
          valor_entrada: data.valor_entrada,
          observacoes_fechamento: data.observacoes_fechamento || null,
          status: novoStatus,
        })
        .eq('id', avaliacao.id)

      if (avError) throw avError

      toast.success('Venda registrada com sucesso!')
      onClose()
      window.location.reload() // Refresh para atualizar a tabela
    } catch (error: any) {
      console.error(error)
      toast.error('Erro ao registrar venda', { description: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl flex flex-col max-h-[90vh] bg-slate-50">
        <DialogHeader>
          <DialogTitle className="text-xl">Confirmação de Venda</DialogTitle>
          <DialogDescription>
            Revise e preencha os dados abaixo para concretizar a venda.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-4 -mr-4 pl-1 pb-2">
          <Form {...form}>
            <form id="venda-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Sessão 1: Dados do Paciente */}
              <div className="bg-white p-4 rounded-lg border shadow-sm space-y-4">
                <h3 className="font-semibold text-slate-800 border-b pb-2">Dados do Paciente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="paciente_nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Paciente</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="paciente_telefone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Sessão 2: Dados da Avaliação */}
              <div className="bg-white p-4 rounded-lg border shadow-sm space-y-4">
                <h3 className="font-semibold text-slate-800 border-b pb-2">Dados da Avaliação</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="data_avaliacao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data da Avaliação</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dentista_avaliador_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dentista Avaliador</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um dentista" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="nenhum">Nenhum</SelectItem>
                            {dentistas.map((d) => (
                              <SelectItem key={d.id} value={d.id}>
                                {d.nome}
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
                    name="crc_comercial_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CRC Comercial</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um CRC" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="nenhum">Nenhum</SelectItem>
                            {crcs.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.nome}
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
                    name="tipo_tratamento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Especialidade / Tratamento</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="valor_orcamento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor do Tratamento (R$)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="observacoes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observações da Avaliação</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              value={field.value || ''}
                              className="resize-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Sessão 3: Fechamento */}
              <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100 shadow-sm space-y-4">
                <h3 className="font-semibold text-emerald-800 border-b border-emerald-100 pb-2">
                  Dados de Fechamento da Venda
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="data_fechamento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Fechamento</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="valor_entrada"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor da Entrada (R$)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-2">
                    <Label>Percentual da Entrada (%)</Label>
                    <Input
                      readOnly
                      value={percentualEntrada.toFixed(2)}
                      className="bg-emerald-100/50 font-medium text-emerald-800 border-emerald-200"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <FormField
                      control={form.control}
                      name="observacoes_fechamento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observações do Fechamento / Pagamento</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              value={field.value || ''}
                              className="resize-none bg-white"
                              placeholder="Detalhes sobre parcelamento, forma de pagamento, etc."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </div>

        <DialogFooter className="pt-4 border-t mt-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="venda-form"
            disabled={loading || !form.formState.isValid}
            className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            Confirmar Pagamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

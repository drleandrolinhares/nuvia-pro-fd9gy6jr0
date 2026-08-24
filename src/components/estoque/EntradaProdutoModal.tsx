import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Check,
  ChevronsUpDown,
  CalendarIcon,
  Loader2,
  ScanBarcode,
  Calculator,
  PackagePlus,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

import {
  Produto,
  fetchEspecialidades,
  fetchEmbalagens,
  fetchSalas,
  createProduto,
  updateProduto,
  fetchEspecialidadeCampos,
  fetchProdutoCamposValores,
  upsertProdutoCamposValores,
  formatProdutoVariacoes,
} from '@/services/produtos'
import { fetchUltimasCompras, registrarEntrada, UltimaCompra } from '@/services/entrada_produtos'
import { supabase } from '@/lib/supabase/client'

const formSchema = z.object({
  codigo_barras: z.string().optional(),
  nome_material: z.string().min(1, 'Obrigatório'),
  marca: z.string().optional(),
  especialidade_id: z.string().optional(),
  embalagem_id: z.string().optional(),
  fornecedor_id: z.string().optional(),

  quantidade_comprada: z.number().min(1, 'Deve ser maior que zero'),
  itens_embalagem: z.number().min(1, 'Deve ser maior que zero'),
  valor_total: z.number().min(0, 'Obrigatório'),

  referencia_consumo: z.enum(['qtd_comprada', 'itens_embalagem']),

  data_entrada: z.date(),
  data_validade: z.string().optional(),
  numero_nfe: z.string().optional(),

  sala_id: z.string().optional(),
  numero_armario: z.string().optional(),
  estoque_minimo: z.number().min(0).optional(),

  controle_prazo: z.boolean().default(false),
  alerta_prazo_dias: z.union([z.string(), z.number()]).optional(),

  estimar_consumo: z.boolean().default(false),
  consumo_estimado_valor: z.union([z.string(), z.number()]).optional(),
  consumo_estimado_frequencia: z.string().optional(),

  observacoes: z.string().optional(),
  observacoes_criticas: z.string().optional(),

  manter_campos: z.boolean().default(false),
  campos_dinamicos: z.any().optional(),
})

type EntradaFormValues = z.infer<typeof formSchema>

interface EntradaProdutoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  produtos: Produto[]
  onSuccess: () => void
}

const labelClass = 'text-blue-950 font-bold text-[11px] uppercase tracking-wider'
const inputClass =
  'focus-visible:ring-fuchsia-500 focus-visible:border-fuchsia-500 border-slate-300 h-9'

export function EntradaProdutoModal({
  open,
  onOpenChange,
  produtos,
  onSuccess,
}: EntradaProdutoModalProps) {
  const [localProdutos, setLocalProdutos] = useState<Produto[]>([])
  const [especialidades, setEspecialidades] = useState<{ id: string; nome: string }[]>([])
  const [embalagens, setEmbalagens] = useState<{ id: string; nome: string }[]>([])
  const [salas, setSalas] = useState<{ id: string; nome: string }[]>([])
  const [fornecedores, setFornecedores] = useState<{ id: string; nome: string }[]>([])
  const [historico, setHistorico] = useState<UltimaCompra[]>([])
  const [loading, setLoading] = useState(false)
  const [camposDinamicosConfig, setCamposDinamicosConfig] = useState<any[]>([])
  const [campoOpcoes, setCampoOpcoes] = useState<Record<string, any[]>>({})

  const [openProduto, setOpenProduto] = useState(false)
  const [selectedProdutoId, setSelectedProdutoId] = useState<string | null>(null)

  const { toast } = useToast()

  const form = useForm<EntradaFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      codigo_barras: '',
      nome_material: '',
      marca: '',
      especialidade_id: '',
      embalagem_id: '',
      fornecedor_id: '',
      quantidade_comprada: 1,
      itens_embalagem: 1,
      valor_total: 0,
      referencia_consumo: 'qtd_comprada',
      data_entrada: new Date(),
      data_validade: '',
      numero_nfe: '',
      sala_id: '',
      numero_armario: '',
      estoque_minimo: 0,
      controle_prazo: false,
      alerta_prazo_dias: '',
      estimar_consumo: false,
      consumo_estimado_valor: '',
      consumo_estimado_frequencia: 'MES',
      observacoes: '',
      observacoes_criticas: '',
      manter_campos: false,
      campos_dinamicos: {},
    },
  })

  const watchedEspecialidadeId = form.watch('especialidade_id')

  useEffect(() => {
    setLocalProdutos(produtos)
  }, [produtos])

  useEffect(() => {
    fetchEspecialidades().then((res) => {
      if (res.data) setEspecialidades(res.data)
    })
    fetchEmbalagens().then((res) => {
      if (res.data) setEmbalagens(res.data)
    })
    fetchSalas().then((res) => {
      if (res.data) setSalas(res.data)
    })

    supabase
      .from('fornecedores')
      .select('id, nome')
      .order('nome')
      .then(({ data }) => {
        if (data) setFornecedores(data)
      })

    supabase
      .from('campo_opcoes')
      .select('id, campo_id, especialidade_id, nome')
      .order('nome')
      .then(({ data }) => {
        if (data) {
          const map: Record<string, any[]> = {}
          data.forEach((o) => {
            if (!map[o.campo_id]) map[o.campo_id] = []
            map[o.campo_id].push({ id: o.id, nome: o.nome, especialidade_id: o.especialidade_id })
          })
          setCampoOpcoes(map)
        }
      })

    const especialidadesSub = supabase
      .channel('especialidades-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'especialidades' }, () => {
        fetchEspecialidades().then((res) => {
          if (res.data) setEspecialidades(res.data)
        })
      })
      .subscribe()

    const embalagensSub = supabase
      .channel('embalagens-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'embalagens' }, () => {
        fetchEmbalagens().then((res) => {
          if (res.data) setEmbalagens(res.data)
        })
      })
      .subscribe()

    const salasSub = supabase
      .channel('salas-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'salas' }, () => {
        fetchSalas().then((res) => {
          if (res.data) setSalas(res.data)
        })
      })
      .subscribe()

    const fornecedoresSub = supabase
      .channel('fornecedores-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fornecedores' }, () => {
        supabase
          .from('fornecedores')
          .select('id, nome')
          .order('nome')
          .then(({ data }) => {
            if (data) setFornecedores(data)
          })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(especialidadesSub)
      supabase.removeChannel(embalagensSub)
      supabase.removeChannel(salasSub)
      supabase.removeChannel(fornecedoresSub)
    }
  }, [])

  useEffect(() => {
    if (watchedEspecialidadeId && watchedEspecialidadeId !== 'none') {
      fetchEspecialidadeCampos(watchedEspecialidadeId).then((res) => {
        if (res.data) setCamposDinamicosConfig(res.data)
        else setCamposDinamicosConfig([])
      })
    } else {
      setCamposDinamicosConfig([])
    }
  }, [watchedEspecialidadeId])

  useEffect(() => {
    if (open) {
      if (!form.getValues('manter_campos')) {
        form.reset({
          codigo_barras: '',
          nome_material: '',
          marca: '',
          especialidade_id: '',
          embalagem_id: '',
          fornecedor_id: '',
          quantidade_comprada: 1,
          itens_embalagem: 1,
          valor_total: 0,
          referencia_consumo: 'qtd_comprada',
          data_entrada: new Date(),
          data_validade: '',
          numero_nfe: '',
          sala_id: '',
          numero_armario: '',
          estoque_minimo: 0,
          observacoes: '',
          observacoes_criticas: '',
          manter_campos: false,
          controle_prazo: false,
          alerta_prazo_dias: '',
          estimar_consumo: false,
          consumo_estimado_valor: '',
          consumo_estimado_frequencia: 'MES',
          campos_dinamicos: {},
        })
        setSelectedProdutoId(null)
        setHistorico([])
      }
    }
  }, [open, form])

  useEffect(() => {
    if (selectedProdutoId) {
      fetchUltimasCompras(selectedProdutoId).then((res) => {
        if (res.data) setHistorico(res.data)
      })
    } else {
      setHistorico([])
    }
  }, [selectedProdutoId])

  const handleProdutoSelect = (produto: Produto | null) => {
    if (produto) {
      setSelectedProdutoId(produto.id)
      form.setValue('codigo_barras', produto.codigo_barras || '')
      form.setValue('marca', produto.marca || '')
      form.setValue('especialidade_id', produto.especialidade_id || '')
      form.setValue('embalagem_id', produto.embalagem_id || '')
      form.setValue('sala_id', produto.sala_id || '')
      form.setValue('numero_armario', produto.numero_armario || '')
      form.setValue('estoque_minimo', produto.quantidade_minima || 0)
      form.setValue('controle_prazo', !!produto.alerta_prazo_dias)
      form.setValue('alerta_prazo_dias', produto.alerta_prazo_dias || '')
      form.setValue('estimar_consumo', !!produto.consumo_estimado_valor)
      form.setValue('consumo_estimado_valor', produto.consumo_estimado_valor || '')
      form.setValue(
        'consumo_estimado_frequencia',
        (produto.consumo_estimado_frequencia?.toUpperCase() as any) || 'MES',
      )
      if (produto.validade) {
        const parts = produto.validade.split('-')
        if (parts.length >= 2) {
          form.setValue('data_validade', `${parts[1]}/${parts[0]}`)
        }
      } else {
        form.setValue('data_validade', '')
      }
      if (
        produto.referencia_consumo === 'itens_embalagem' ||
        produto.referencia_consumo === 'qtd_comprada'
      ) {
        form.setValue('referencia_consumo', produto.referencia_consumo)
      }

      fetchProdutoCamposValores(produto.id).then((res) => {
        if (res.data) {
          const values: Record<string, string> = {}
          res.data.forEach((item) => {
            values[item.campo_id] = item.valor
          })
          form.setValue('campos_dinamicos', values)
        }
      })
    } else {
      setSelectedProdutoId(null)
      form.setValue('codigo_barras', '')
      form.setValue('marca', '')
      form.setValue('especialidade_id', '')
      form.setValue('embalagem_id', '')
      form.setValue('sala_id', '')
      form.setValue('numero_armario', '')
      form.setValue('estoque_minimo', 0)
      form.setValue('data_validade', '')
      form.setValue('referencia_consumo', 'qtd_comprada')
      form.setValue('campos_dinamicos', {})
      setHistorico([])
    }
  }
  const qtyComprada = Number(form.watch('quantidade_comprada')) || 1
  const itensEmb = Number(form.watch('itens_embalagem')) || 1
  const refConsumo = form.watch('referencia_consumo')
  const valorTotal = Number(form.watch('valor_total')) || 0

  const totalAdicionado = refConsumo === 'itens_embalagem' ? qtyComprada * itensEmb : qtyComprada
  const valorAtribuido = totalAdicionado > 0 ? valorTotal / totalAdicionado : 0
  const estoqueAtual = selectedProdutoId
    ? Number(localProdutos.find((p) => p.id === selectedProdutoId)?.quantidade_estoque || 0)
    : 0
  const estoquePosAdicao = Number(estoqueAtual) + Number(totalAdicionado)
  const ultimaCompra = historico.length > 0 ? historico[0] : null

  const onSubmit = async (values: EntradaFormValues) => {
    setLoading(true)
    let finalProdutoId = selectedProdutoId

    let dataValidadeParsed = null
    if (values.data_validade) {
      const [mes, ano] = values.data_validade.split('/')
      if (mes && ano && mes.length === 2 && ano.length === 4) {
        dataValidadeParsed = `${ano}-${mes}-01`
      }
    }

    const precoTotalCalc = values.valor_total
    const embalagemObj = embalagens.find((e) => e.id === values.embalagem_id)
    const totalAdicSubmit =
      refConsumo === 'itens_embalagem'
        ? values.quantidade_comprada * values.itens_embalagem
        : values.quantidade_comprada
    const valorAtribSubmit = totalAdicSubmit > 0 ? precoTotalCalc / totalAdicSubmit : 0

    let dataProximaRevisaoParsed = null
    const alertaDias = Number(values.alerta_prazo_dias) || null
    if (values.controle_prazo && alertaDias) {
      const d = new Date()
      d.setDate(d.getDate() + alertaDias)
      dataProximaRevisaoParsed = d.toISOString().split('T')[0]
    }

    const consumoEstimadoValor = Number(values.consumo_estimado_valor) || null

    if (!finalProdutoId) {
      const { data: novoProduto, error } = await createProduto({
        nome: values.nome_material.trim().toUpperCase(),
        codigo_barras: values.codigo_barras,
        marca: values.marca ? values.marca.trim().toUpperCase() : undefined,
        especialidade_id: values.especialidade_id || null,
        embalagem_id: values.embalagem_id || null,
        sala_id: values.sala_id || null,
        numero_armario: values.numero_armario || null,
        quantidade_minima: values.estoque_minimo,
        quantidade_estoque: 0,
        custo_unitario: valorAtribSubmit,
        validade: dataValidadeParsed,
        referencia_consumo: values.referencia_consumo,
        alerta_prazo_dias: values.controle_prazo ? alertaDias : null,
        data_proxima_revisao: dataProximaRevisaoParsed,
        consumo_estimado_valor: values.estimar_consumo ? consumoEstimadoValor : null,
        consumo_estimado_frequencia: values.estimar_consumo
          ? values.consumo_estimado_frequencia
          : null,
      })
      if (error || !novoProduto) {
        toast({ title: 'Erro', description: 'Erro ao criar produto.', variant: 'destructive' })
        setLoading(false)
        return
      }
      finalProdutoId = novoProduto.id
      setLocalProdutos((prev) => [...prev, novoProduto])
    } else {
      await updateProduto(finalProdutoId, {
        codigo_barras: values.codigo_barras,
        marca: values.marca ? values.marca.trim().toUpperCase() : undefined,
        especialidade_id: values.especialidade_id || null,
        embalagem_id: values.embalagem_id || null,
        sala_id: values.sala_id || null,
        numero_armario: values.numero_armario || null,
        quantidade_minima: values.estoque_minimo,
        validade: dataValidadeParsed,
        referencia_consumo: values.referencia_consumo,
        alerta_prazo_dias: values.controle_prazo ? alertaDias : null,
        data_proxima_revisao: dataProximaRevisaoParsed,
        consumo_estimado_valor: values.estimar_consumo ? consumoEstimadoValor : null,
        consumo_estimado_frequencia: values.estimar_consumo
          ? values.consumo_estimado_frequencia
          : null,
      })
    }
    const obsFinal = []
    if (values.observacoes) obsFinal.push(values.observacoes)

    const { error: entradaError } = await registrarEntrada({
      produto_id: finalProdutoId,
      fornecedor_id: values.fornecedor_id || null,
      quantidade_embalagem: values.itens_embalagem,
      quantidade_comprada: values.quantidade_comprada,
      unidade_consumo: embalagemObj ? embalagemObj.nome : 'Unidade',
      preco_unitario: valorAtribSubmit,
      preco_total: precoTotalCalc,
      data_entrada: values.data_entrada.toISOString(),
      data_validade: dataValidadeParsed,
      numero_nfe: values.numero_nfe || null,
      observacoes: obsFinal.length > 0 ? obsFinal.join('\n') : undefined,
      observacoes_criticas: values.observacoes_criticas || null,
    })

    if (
      !entradaError &&
      values.campos_dinamicos &&
      typeof values.campos_dinamicos === 'object' &&
      Object.keys(values.campos_dinamicos).length > 0
    ) {
      await upsertProdutoCamposValores(
        finalProdutoId,
        values.campos_dinamicos as Record<string, string>,
      )
    }

    setLoading(false)

    if (entradaError) {
      toast({ title: 'Erro', description: entradaError.message, variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Produto cadastrado e entrada registrada!' })
      onSuccess()

      if (values.manter_campos) {
        form.setValue('quantidade_comprada', 1)
        form.setValue('itens_embalagem', 1)
        form.setValue('valor_total', 0)
        form.setValue('campos_dinamicos', {})
        form.setValue('codigo_barras', '')
        setSelectedProdutoId(null)
      } else {
        onOpenChange(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-slate-800">
            <PackagePlus className="w-5 h-5 text-fuchsia-600" />
            Entrada de Produtos
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="codigo_barras"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>Código de Barras</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <ScanBarcode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          className={cn(inputClass, 'pl-9')}
                          placeholder="Scan ou digite..."
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nome_material"
                render={({ field }) => (
                  <FormItem className="flex flex-col relative md:col-span-2">
                    <FormLabel className={labelClass}>Nome do Material</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className={inputClass}
                        placeholder="Digite o nome do material..."
                        autoComplete="off"
                        onChange={(e) => {
                          field.onChange(e)
                          setSelectedProdutoId(null)
                          setOpenProduto(true)
                        }}
                        onFocus={() => setOpenProduto(true)}
                        onBlur={() => setTimeout(() => setOpenProduto(false), 200)}
                      />
                    </FormControl>
                    {openProduto && (
                      <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-md shadow-lg p-1">
                        {localProdutos.filter((p) => {
                          const searchTerm = field.value?.toLowerCase() || ''
                          return (
                            p.nome.toLowerCase().includes(searchTerm) ||
                            (p.marca?.toLowerCase() || '').includes(searchTerm) ||
                            formatProdutoVariacoes(p).toLowerCase().includes(searchTerm)
                          )
                        }).length > 0 ? (
                          <>
                            {localProdutos
                              .filter((p) => {
                                const searchTerm = field.value?.toLowerCase() || ''
                                return (
                                  p.nome.toLowerCase().includes(searchTerm) ||
                                  (p.marca?.toLowerCase() || '').includes(searchTerm) ||
                                  formatProdutoVariacoes(p).toLowerCase().includes(searchTerm)
                                )
                              })
                              .map((p) => (
                                <div
                                  key={p.id}
                                  className="px-3 py-2 text-sm cursor-pointer hover:bg-fuchsia-50 hover:text-fuchsia-700 rounded transition-colors flex flex-col"
                                  onClick={() => {
                                    field.onChange(p.nome)
                                    handleProdutoSelect(p)
                                    setOpenProduto(false)
                                  }}
                                >
                                  <span className="font-medium text-slate-800">
                                    {p.nome}{' '}
                                    {formatProdutoVariacoes(p)
                                      ? ` - ${formatProdutoVariacoes(p)}`
                                      : ''}
                                  </span>
                                  {p.marca && (
                                    <span className="text-xs text-slate-500">Marca: {p.marca}</span>
                                  )}
                                </div>
                              ))}
                            {field.value &&
                              !localProdutos.find(
                                (p) => p.nome.toLowerCase() === field.value.toLowerCase(),
                              ) && (
                                <div
                                  className="px-3 py-2 text-sm cursor-pointer text-fuchsia-600 font-medium hover:bg-fuchsia-50 rounded transition-colors flex items-center border-t border-slate-100 mt-1 pt-2"
                                  onClick={() => {
                                    setSelectedProdutoId(null)
                                    setOpenProduto(false)
                                  }}
                                >
                                  <PackagePlus className="w-4 h-4 mr-2" />+ Criar Novo Produto "
                                  {field.value}"
                                </div>
                              )}
                          </>
                        ) : (
                          <div className="px-3 py-4 text-sm text-slate-500 text-center flex flex-col items-center justify-center gap-2">
                            <span>Nenhum produto encontrado.</span>
                            {field.value && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="mt-2 text-fuchsia-600 border-fuchsia-200 hover:bg-fuchsia-50 w-full"
                                onClick={() => {
                                  setSelectedProdutoId(null)
                                  setOpenProduto(false)
                                }}
                              >
                                <PackagePlus className="w-4 h-4 mr-2" />
                                Criar "{field.value}"
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    <FormMessage />
                    {selectedProdutoId && (
                      <div className="flex flex-col gap-1 mt-2">
                        {formatProdutoVariacoes(
                          localProdutos.find((p) => p.id === selectedProdutoId),
                        ) && (
                          <p className="text-[11px] text-fuchsia-600 font-bold uppercase">
                            Variação:{' '}
                            {formatProdutoVariacoes(
                              localProdutos.find((p) => p.id === selectedProdutoId),
                            )}
                          </p>
                        )}
                        <p className="text-[11px] text-amber-600 font-bold uppercase flex items-center bg-amber-50 w-fit px-2 py-0.5 rounded border border-amber-200">
                          Critério atual do produto:{' '}
                          {localProdutos.find((p) => p.id === selectedProdutoId)
                            ?.referencia_consumo === 'itens_embalagem'
                            ? 'Itens na Embalagem'
                            : 'Quantidade Comprada'}
                        </p>
                      </div>
                    )}
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="marca"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>Marca do Produto</FormLabel>
                    <FormControl>
                      <Input className={inputClass} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="especialidade_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>Especialidade</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val)
                        form.setValue('campos_dinamicos', {})
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className={inputClass}>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {especialidades.map((esp) => (
                          <SelectItem key={esp.id} value={esp.id}>
                            {esp.nome}
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
                name="embalagem_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>Embalagem de Compra</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className={inputClass}>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {embalagens.map((emb) => (
                          <SelectItem key={emb.id} value={emb.id}>
                            {emb.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {camposDinamicosConfig.length > 0 && (
              <div className="bg-[#1a2a4a] p-5 rounded-xl border border-[#1a2a4a] shadow-md">
                <h3 className="text-[#d4af37] font-extrabold mb-5 text-xs tracking-widest border-b border-[#d4af37]/30 pb-2 uppercase">
                  DADOS ADICIONAIS -{' '}
                  {especialidades.find((e) => e.id === watchedEspecialidadeId)?.nome || 'MATERIAL'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {camposDinamicosConfig.map((config) => {
                    const campo = config.campos || config.campos_personalizados
                    if (!campo) return null
                    const labelName = config.label_customizado || campo.nome

                    const options = (campoOpcoes[campo.id] || []).filter(
                      (o: any) =>
                        !o.especialidade_id || o.especialidade_id === watchedEspecialidadeId,
                    )
                    const isDynamicDropdown = options.length > 0 || campo.tipo === 'select'

                    return (
                      <FormField
                        key={config.campo_id}
                        control={form.control}
                        name={`campos_dinamicos.${config.campo_id}` as any}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#d4af37] font-bold text-[11px] uppercase tracking-wider">
                              {labelName}
                            </FormLabel>
                            <FormControl>
                              {isDynamicDropdown ? (
                                <Select onValueChange={field.onChange} value={field.value || ''}>
                                  <SelectTrigger className="bg-slate-800 border-[#1a2a4a] text-white font-bold h-9 focus:ring-[#d4af37]">
                                    <SelectValue placeholder="Selecione..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {options.map((opt) => (
                                      <SelectItem key={opt.id} value={opt.nome}>
                                        {opt.nome}
                                      </SelectItem>
                                    ))}
                                    {options.length === 0 && (
                                      <SelectItem value="none" disabled>
                                        Sem opções cadastradas
                                      </SelectItem>
                                    )}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Input
                                  type={campo.tipo === 'number' ? 'number' : 'text'}
                                  className="bg-slate-800 border-[#1a2a4a] text-white font-bold h-9 focus-visible:ring-[#d4af37] focus-visible:border-[#d4af37]"
                                  {...field}
                                  value={field.value || ''}
                                />
                              )}
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )
                  })}
                </div>
              </div>
            )}

            <div className="bg-slate-50/80 p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-blue-950 font-extrabold mb-5 text-xs tracking-widest border-b pb-2">
                INFORMAÇÕES DE COMPRA E EMBALAGEM
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <FormField
                  control={form.control}
                  name="fornecedor_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClass}>Fornecedor</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className={inputClass}>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {fornecedores.map((f) => (
                            <SelectItem key={f.id} value={f.id}>
                              {f.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <FormField
                  control={form.control}
                  name="valor_total"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClass}>Valor Total da Compra</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Calculator className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            type="number"
                            step="0.01"
                            className={cn(inputClass, 'pl-9')}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantidade_comprada"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClass}>Qtd Comprada</FormLabel>
                      <FormControl>
                        <Input type="number" className={inputClass} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="itens_embalagem"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClass}>Itens na Embalagem</FormLabel>
                      <FormControl>
                        <Input type="number" className={inputClass} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col space-y-2">
                  <span className={labelClass}>Valor Atribuído (Unitário)</span>
                  <div className="h-9 px-3 bg-slate-100/80 border border-slate-200 rounded-md flex items-center text-sm font-semibold text-slate-700">
                    R${' '}
                    {valorAtribuido.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <span className={labelClass}>Estoque Atual</span>
                  <div className="h-9 px-3 bg-slate-100/80 border border-slate-200 rounded-md flex items-center text-sm font-semibold text-slate-700">
                    {estoqueAtual}
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <span className={labelClass}>Estoque Pós Adição</span>
                  <div className="h-9 px-3 bg-fuchsia-50 border border-fuchsia-100 rounded-md flex items-center text-sm font-bold text-fuchsia-700">
                    {estoquePosAdicao}
                  </div>
                </div>
              </div>{' '}
              <div className="mt-6 bg-slate-200/50 p-4 rounded-lg border border-slate-200">
                <FormField
                  control={form.control}
                  name="referencia_consumo"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className={cn(labelClass, 'flex items-center gap-2')}>
                        Referência de Consumo no Estoque
                        {selectedProdutoId && (
                          <span className="text-[10px] text-amber-600 font-bold bg-amber-100 px-2 py-0.5 rounded-full lowercase tracking-normal">
                            Sugerido pelo cadastro:{' '}
                            {localProdutos.find((p) => p.id === selectedProdutoId)
                              ?.referencia_consumo === 'itens_embalagem'
                              ? 'Itens na Embalagem'
                              : 'Qtd Comprada'}
                          </span>
                        )}
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex flex-col md:flex-row md:space-x-6 space-y-2 md:space-y-0"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0 bg-white px-3 py-2 rounded-md border border-slate-200 shadow-sm flex-1 cursor-pointer">
                            <FormControl>
                              <RadioGroupItem
                                value="qtd_comprada"
                                className="text-fuchsia-600 border-slate-300"
                              />
                            </FormControl>
                            <FormLabel className="font-semibold text-sm cursor-pointer w-full">
                              Quantidade Comprada
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0 bg-white px-3 py-2 rounded-md border border-slate-200 shadow-sm flex-1 cursor-pointer">
                            <FormControl>
                              <RadioGroupItem
                                value="itens_embalagem"
                                className="text-fuchsia-600 border-slate-300"
                              />
                            </FormControl>
                            <FormLabel className="font-semibold text-sm cursor-pointer w-full">
                              Itens na Embalagem
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="data_entrada"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className={labelClass}>Data de Entrada</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              inputClass,
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground',
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'dd/MM/yyyy', { locale: ptBR })
                            ) : (
                              <span>Selecionar...</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="data_validade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>Data de Validade (MM/AAAA)</FormLabel>
                    <FormControl>
                      <Input placeholder="MM/AAAA" className={inputClass} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="numero_nfe"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>Número da NFe</FormLabel>
                    <FormControl>
                      <Input className={inputClass} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sala_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className={labelClass}>Sala de Armazenamento</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              'justify-between w-full font-normal',
                              inputClass,
                              !field.value && 'text-muted-foreground',
                            )}
                          >
                            {field.value
                              ? salas.find((s) => s.id === field.value)?.nome
                              : 'Selecione...'}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0">
                        <Command>
                          <CommandInput placeholder="Buscar sala..." />
                          <CommandList>
                            <CommandEmpty className="p-4 text-center text-sm text-slate-500">
                              NENHUMA SALA CADASTRADA
                            </CommandEmpty>
                            <CommandGroup>
                              {salas.map((sala) => (
                                <CommandItem
                                  key={sala.id}
                                  value={sala.nome}
                                  onSelect={() => form.setValue('sala_id', sala.id)}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      sala.id === field.value ? 'opacity-100' : 'opacity-0',
                                    )}
                                  />
                                  {sala.nome}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="numero_armario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>Número do Armário</FormLabel>
                    <FormControl>
                      <Input className={inputClass} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="estoque_minimo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>Estoque Mínimo</FormLabel>
                    <FormControl>
                      <Input type="number" className={inputClass} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="bg-slate-50/80 p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-blue-950 font-extrabold mb-5 text-xs tracking-widest border-b pb-2">
                PLANEJAMENTO DE CONSUMO
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
                <div className="space-y-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                  <FormField
                    control={form.control}
                    name="controle_prazo"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm font-bold text-slate-800">
                            Controle de Estoque por Prazo
                          </FormLabel>
                          <p className="text-[11px] text-slate-500">
                            Ao invés do estoque mínimo, alertar para compra após o prazo.
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-fuchsia-600"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  {form.watch('controle_prazo') && (
                    <FormField
                      control={form.control}
                      name="alerta_prazo_dias"
                      render={({ field }) => (
                        <FormItem className="pt-2 border-t border-slate-100">
                          <FormLabel className={labelClass}>Dias para Reabastecimento</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="1"
                                className={cn(inputClass, 'w-24')}
                                {...field}
                              />
                              <span className="text-sm text-slate-500 font-medium">dias</span>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <div className="space-y-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                  <FormField
                    control={form.control}
                    name="estimar_consumo"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm font-bold text-slate-800">
                            Estimar Consumo Médio
                          </FormLabel>
                          <p className="text-[11px] text-slate-500">
                            Defina uma média de consumo para previsão de estoque.
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-fuchsia-600"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  {form.watch('estimar_consumo') && (
                    <div className="flex items-start gap-4 pt-2 border-t border-slate-100">
                      <FormField
                        control={form.control}
                        name="consumo_estimado_valor"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel className={labelClass}>Quantidade</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                className={inputClass}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="consumo_estimado_frequencia"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel className={labelClass}>Por</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className={inputClass}>
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="DIA">Dia</SelectItem>
                                <SelectItem value="SEMANA">Semana</SelectItem>
                                <SelectItem value="QUINZENA">Quinzena</SelectItem>
                                <SelectItem value="MES">Mês</SelectItem>
                                <SelectItem value="BIMESTRE">Bimestre</SelectItem>
                                <SelectItem value="TRIMESTRE">Trimestre</SelectItem>
                                <SelectItem value="SEMESTRE">Semestre</SelectItem>
                                <SelectItem value="ANO">Ano</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-slate-50/80 p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-blue-950 font-extrabold mb-5 text-xs tracking-widest border-b pb-2">
                HISTÓRICO E NOTAS
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div className="flex flex-col space-y-2">
                  <span className={labelClass}>Marca / Fornec. Última Compra</span>
                  <div className="h-9 px-3 bg-slate-100/80 border border-slate-200 rounded-md flex items-center text-sm font-semibold text-slate-700 truncate">
                    {ultimaCompra?.fornecedores?.nome || '-'}
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <span className={labelClass}>Valor da Última Compra</span>
                  <div className="h-9 px-3 bg-slate-100/80 border border-slate-200 rounded-md flex items-center text-sm font-semibold text-slate-700">
                    {ultimaCompra
                      ? `R$ ${ultimaCompra.preco_unitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                      : '-'}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="observacoes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClass}>Observações</FormLabel>
                      <FormControl>
                        <Textarea className={cn(inputClass, 'resize-none h-20')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="observacoes_criticas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClass}>Observações Críticas</FormLabel>
                      <FormControl>
                        <Textarea
                          className={cn(
                            inputClass,
                            'resize-none h-20 bg-yellow-50 placeholder:text-yellow-700/40 text-yellow-900 border-yellow-300 focus-visible:ring-yellow-400 focus-visible:border-yellow-400',
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t mt-6">
              <FormField
                control={form.control}
                name="manter_campos"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-fuchsia-600"
                      />
                    </FormControl>
                    <FormLabel className="text-xs font-bold text-slate-600 uppercase cursor-pointer tracking-wide">
                      Manter preenchido (Cadastro Sequencial)
                    </FormLabel>
                  </FormItem>
                )}
              />

              <div className="flex gap-3 w-full md:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="w-full md:w-32 border-slate-300"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-48 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold shadow-sm"
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Cadastrar Produto
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

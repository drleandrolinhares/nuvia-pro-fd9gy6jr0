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
} from '@/services/produtos'
import { fetchUltimasCompras, registrarEntrada, UltimaCompra } from '@/services/entrada_produtos'

const formSchema = z.object({
  codigo_barras: z.string().optional(),
  nome_material: z.string().min(1, 'Obrigatório'),
  marca: z.string().optional(),
  especialidade_id: z.string().optional(),
  embalagem_id: z.string().optional(),

  quantidade_comprada: z.coerce.number().min(1, 'Deve ser maior que zero'),
  itens_embalagem: z.coerce.number().min(1, 'Deve ser maior que zero'),
  valor_atribuido: z.coerce.number().min(0, 'Obrigatório'),

  referencia_consumo: z.enum(['quantidade_comprada', 'itens_embalagem']),

  data_entrada: z.date({ required_error: 'Selecione a data' }),
  data_validade: z.string().optional(),
  numero_nfe: z.string().optional(),

  sala_id: z.string().optional(),
  numero_armario: z.string().optional(),
  estoque_minimo: z.coerce.number().min(0).optional(),

  observacoes: z.string().optional(),
  observacoes_criticas: z.string().optional(),

  manter_campos: z.boolean().default(false),
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
  const [historico, setHistorico] = useState<UltimaCompra[]>([])
  const [loading, setLoading] = useState(false)

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
      quantidade_comprada: 1,
      itens_embalagem: 1,
      valor_atribuido: 0,
      referencia_consumo: 'quantidade_comprada',
      data_entrada: new Date(),
      data_validade: '',
      numero_nfe: '',
      sala_id: '',
      numero_armario: '',
      estoque_minimo: 0,
      observacoes: '',
      observacoes_criticas: '',
      manter_campos: false,
    },
  })

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
  }, [])

  useEffect(() => {
    if (open) {
      if (!form.getValues('manter_campos')) {
        form.reset({
          codigo_barras: '',
          nome_material: '',
          marca: '',
          especialidade_id: '',
          embalagem_id: '',
          quantidade_comprada: 1,
          itens_embalagem: 1,
          valor_atribuido: 0,
          referencia_consumo: 'quantidade_comprada',
          data_entrada: new Date(),
          data_validade: '',
          numero_nfe: '',
          sala_id: '',
          numero_armario: '',
          estoque_minimo: 0,
          observacoes: '',
          observacoes_criticas: '',
          manter_campos: false,
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
      if (produto.validade) {
        const parts = produto.validade.split('-')
        if (parts.length >= 2) {
          form.setValue('data_validade', `${parts[1]}/${parts[0]}`)
        }
      } else {
        form.setValue('data_validade', '')
      }
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
      setHistorico([])
    }
  }

  const qtyComprada = form.watch('quantidade_comprada') || 1
  const itensEmb = form.watch('itens_embalagem') || 1
  const refConsumo = form.watch('referencia_consumo')
  const valorAtribuido = form.watch('valor_atribuido') || 0

  const precoTotal = qtyComprada * valorAtribuido
  const totalAdicionado = refConsumo === 'itens_embalagem' ? qtyComprada * itensEmb : qtyComprada
  const estoqueAtual = selectedProdutoId
    ? localProdutos.find((p) => p.id === selectedProdutoId)?.quantidade_estoque || 0
    : 0
  const estoquePosAdicao = estoqueAtual + totalAdicionado
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

    if (!finalProdutoId) {
      const { data: novoProduto, error } = await createProduto({
        nome: values.nome_material,
        codigo_barras: values.codigo_barras,
        marca: values.marca,
        especialidade_id: values.especialidade_id || null,
        embalagem_id: values.embalagem_id || null,
        sala_id: values.sala_id || null,
        numero_armario: values.numero_armario || null,
        quantidade_minima: values.estoque_minimo,
        quantidade_estoque: 0,
        custo_unitario: 0,
        validade: dataValidadeParsed,
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
        marca: values.marca,
        especialidade_id: values.especialidade_id || null,
        embalagem_id: values.embalagem_id || null,
        sala_id: values.sala_id || null,
        numero_armario: values.numero_armario || null,
        quantidade_minima: values.estoque_minimo,
        validade: dataValidadeParsed,
      })
    }

    const obsFinal = []
    if (values.observacoes) obsFinal.push(values.observacoes)

    const precoTotalCalc = values.quantidade_comprada * values.valor_atribuido
    const embalagemObj = embalagens.find((e) => e.id === values.embalagem_id)

    const { error: entradaError } = await registrarEntrada({
      produto_id: finalProdutoId,
      fornecedor_id: null,
      quantidade_embalagem: refConsumo === 'itens_embalagem' ? values.itens_embalagem : 1,
      quantidade_comprada: values.quantidade_comprada,
      unidade_consumo: embalagemObj ? embalagemObj.nome : 'Unidade',
      preco_unitario: values.valor_atribuido,
      preco_total: precoTotalCalc,
      data_entrada: values.data_entrada.toISOString(),
      data_validade: dataValidadeParsed,
      numero_nfe: values.numero_nfe || null,
      observacoes: obsFinal.length > 0 ? obsFinal.join('\n') : undefined,
      observacoes_criticas: values.observacoes_criticas || null,
    })

    setLoading(false)

    if (entradaError) {
      toast({ title: 'Erro', description: entradaError.message, variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Produto cadastrado e entrada registrada!' })
      onSuccess()

      if (values.manter_campos) {
        form.setValue('quantidade_comprada', 1)
        form.setValue('itens_embalagem', 1)
        form.setValue('valor_atribuido', 0)
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
                    {openProduto &&
                      localProdutos.filter((p) =>
                        p.nome.toLowerCase().includes(field.value?.toLowerCase() || ''),
                      ).length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-md shadow-lg p-1">
                          {localProdutos
                            .filter((p) =>
                              p.nome.toLowerCase().includes(field.value?.toLowerCase() || ''),
                            )
                            .map((p) => (
                              <div
                                key={p.id}
                                className="px-3 py-2 text-sm cursor-pointer hover:bg-fuchsia-50 hover:text-fuchsia-700 rounded transition-colors"
                                onClick={() => {
                                  field.onChange(p.nome)
                                  handleProdutoSelect(p)
                                  setOpenProduto(false)
                                }}
                              >
                                {p.nome}
                              </div>
                            ))}
                        </div>
                      )}
                    <FormMessage />
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
                    <Select onValueChange={field.onChange} value={field.value}>
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

            <div className="bg-slate-50/80 p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-blue-950 font-extrabold mb-5 text-xs tracking-widest border-b pb-2">
                INFORMAÇÕES DE COMPRA E EMBALAGEM
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
                <FormField
                  control={form.control}
                  name="valor_atribuido"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClass}>Valor Atribuído (Unitário)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" className={inputClass} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col space-y-2">
                  <span className={labelClass}>Estoque Atual</span>
                  <div className="h-9 px-3 bg-slate-100/80 border border-slate-200 rounded-md flex items-center text-sm font-semibold text-slate-700">
                    {estoqueAtual}
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <span className={labelClass}>Valor Total da Compra</span>
                  <div className="relative h-9 bg-slate-100/80 border border-slate-200 rounded-md flex items-center text-sm font-semibold text-slate-700 pl-9">
                    <Calculator className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    R${' '}
                    {precoTotal.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <span className={labelClass}>Estoque Pós Adição</span>
                  <div className="h-9 px-3 bg-fuchsia-50 border border-fuchsia-100 rounded-md flex items-center text-sm font-bold text-fuchsia-700">
                    {estoquePosAdicao}
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <FormField
                  control={form.control}
                  name="referencia_consumo"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className={labelClass}>Referência de Consumo no Estoque</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col md:flex-row md:space-x-6 space-y-2 md:space-y-0"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem
                                value="quantidade_comprada"
                                className="text-fuchsia-600 border-slate-300"
                              />
                            </FormControl>
                            <FormLabel className="font-normal text-sm">Qtd Comprada</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem
                                value="itens_embalagem"
                                className="text-fuchsia-600 border-slate-300"
                              />
                            </FormControl>
                            <FormLabel className="font-normal text-sm">
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
                              : 'Selecione a sala...'}
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

import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Check,
  ChevronsUpDown,
  Plus,
  CalendarIcon,
  Loader2,
  PackagePlus,
  History,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

import { Produto } from '@/services/produtos'
import { fetchFornecedores, createFornecedor, Fornecedor } from '@/services/fornecedores'
import { fetchUltimasCompras, registrarEntrada, UltimaCompra } from '@/services/entrada_produtos'
import { CriarProdutoModal } from './CriarProdutoModal'
import { supabase } from '@/lib/supabase/client'

const entradaSchema = z.object({
  produto_id: z.string().min(1, 'Selecione um produto'),
  fornecedor_id: z.string().min(1, 'Selecione um fornecedor'),
  quantidade_embalagem: z.coerce.number().min(1, 'Deve ser maior que zero'),
  quantidade_comprada: z.coerce.number().min(1, 'Deve ser maior que zero'),
  unidade_consumo: z.string().min(1, 'Selecione a unidade'),
  preco_unitario: z.coerce.number().min(0.01, 'Preço inválido'),
  local_compra: z.string().optional(),
  data_entrada: z.date({ required_error: 'Selecione a data' }),
  observacoes: z.string().optional(),
})

type EntradaFormValues = z.infer<typeof entradaSchema>

interface EntradaProdutoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  produtos: Produto[]
  onSuccess: () => void
}

export function EntradaProdutoModal({
  open,
  onOpenChange,
  produtos,
  onSuccess,
}: EntradaProdutoModalProps) {
  const [localProdutos, setLocalProdutos] = useState<Produto[]>([])
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [historico, setHistorico] = useState<UltimaCompra[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingHistorico, setLoadingHistorico] = useState(false)

  const [openProduto, setOpenProduto] = useState(false)
  const [openFornecedor, setOpenFornecedor] = useState(false)
  const [searchFornecedor, setSearchFornecedor] = useState('')
  const [searchProduto, setSearchProduto] = useState('')

  const [openCriarProduto, setOpenCriarProduto] = useState(false)
  const [canManageEstoque, setCanManageEstoque] = useState(false)

  useEffect(() => {
    setLocalProdutos(produtos)
  }, [produtos])

  useEffect(() => {
    supabase.rpc('has_permission', { permission_name: 'Gerenciar Estoque' }).then(({ data }) => {
      if (data) setCanManageEstoque(true)
    })
  }, [])

  const { toast } = useToast()

  const form = useForm<EntradaFormValues>({
    resolver: zodResolver(entradaSchema),
    defaultValues: {
      produto_id: '',
      fornecedor_id: '',
      quantidade_embalagem: 1,
      quantidade_comprada: 1,
      unidade_consumo: '',
      preco_unitario: 0,
      local_compra: '',
      data_entrada: new Date(),
      observacoes: '',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        produto_id: '',
        fornecedor_id: '',
        quantidade_embalagem: 1,
        quantidade_comprada: 1,
        unidade_consumo: '',
        preco_unitario: 0,
        local_compra: '',
        data_entrada: new Date(),
        observacoes: '',
      })
      fetchFornecedores().then((res) => {
        if (res.data) setFornecedores(res.data)
      })
    }
  }, [open, form])

  const selectedProdutoId = form.watch('produto_id')

  useEffect(() => {
    if (selectedProdutoId) {
      setLoadingHistorico(true)
      fetchUltimasCompras(selectedProdutoId).then((res) => {
        if (res.data) setHistorico(res.data)
        setLoadingHistorico(false)
      })
    } else {
      setHistorico([])
    }
  }, [selectedProdutoId])

  const handleCreateFornecedor = async (nome: string) => {
    if (!nome.trim()) return
    const { data, error } = await createFornecedor(nome)
    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível criar fornecedor',
        variant: 'destructive',
      })
      return
    }
    if (data) {
      setFornecedores((prev) => [...prev, data].sort((a, b) => a.nome.localeCompare(b.nome)))
      form.setValue('fornecedor_id', data.id)
      setOpenFornecedor(false)
      toast({ title: 'Sucesso', description: 'Fornecedor criado com sucesso' })
    }
  }

  const qtyComprada = form.watch('quantidade_comprada')
  const precoUnitario = form.watch('preco_unitario')

  const precoTotal = useMemo(() => {
    return (Number(qtyComprada) || 0) * (Number(precoUnitario) || 0)
  }, [qtyComprada, precoUnitario])

  const onSubmit = async (values: EntradaFormValues) => {
    setLoading(true)

    const obsFinal = values.local_compra
      ? `Local de Compra: ${values.local_compra}\n${values.observacoes || ''}`
      : values.observacoes

    const { error } = await registrarEntrada({
      ...values,
      preco_total: precoTotal,
      data_entrada: values.data_entrada.toISOString(),
      observacoes: obsFinal,
    })

    setLoading(false)

    if (error) {
      toast({
        title: 'Erro ao registrar entrada',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({ title: 'Sucesso', description: 'Entrada registrada com sucesso!' })
      onSuccess()
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-slate-800">
            <PackagePlus className="w-5 h-5 text-amber-500" />
            Nova Entrada de Produto
          </DialogTitle>
          <DialogDescription>
            Registre a entrada de materiais no estoque. O custo médio e o estoque serão atualizados
            automaticamente.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="produto_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col pt-2">
                    <FormLabel>Produto *</FormLabel>
                    <Popover open={openProduto} onOpenChange={setOpenProduto}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              'justify-between w-full',
                              !field.value && 'text-muted-foreground',
                            )}
                          >
                            {field.value
                              ? localProdutos.find((p) => p.id === field.value)?.nome
                              : 'Selecione um produto'}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] md:w-[400px] p-0">
                        <Command>
                          <CommandInput
                            placeholder="Buscar produto..."
                            onValueChange={setSearchProduto}
                          />
                          <CommandList>
                            <CommandEmpty>
                              <div className="p-2 flex flex-col gap-2">
                                <span className="text-sm text-slate-500 text-center py-2">
                                  Nenhum produto encontrado.
                                </span>
                                {canManageEstoque && (
                                  <Button
                                    variant="secondary"
                                    className="w-full justify-start text-sm"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      setOpenProduto(false)
                                      setOpenCriarProduto(true)
                                    }}
                                  >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Criar Novo Produto
                                  </Button>
                                )}
                              </div>
                            </CommandEmpty>
                            <CommandGroup>
                              {localProdutos.map((produto) => (
                                <CommandItem
                                  key={produto.id}
                                  value={produto.nome}
                                  onSelect={() => {
                                    form.setValue('produto_id', produto.id)
                                    setOpenProduto(false)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      produto.id === field.value ? 'opacity-100' : 'opacity-0',
                                    )}
                                  />
                                  {produto.nome}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                            {canManageEstoque && localProdutos.length > 0 && (
                              <div className="p-2 border-t">
                                <Button
                                  variant="ghost"
                                  className="w-full justify-start text-sm text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    setOpenProduto(false)
                                    setOpenCriarProduto(true)
                                  }}
                                >
                                  <Plus className="mr-2 h-4 w-4" />
                                  Criar Novo Produto
                                </Button>
                              </div>
                            )}
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
                name="fornecedor_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col pt-2">
                    <FormLabel>Fornecedor *</FormLabel>
                    <Popover open={openFornecedor} onOpenChange={setOpenFornecedor}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              'justify-between w-full',
                              !field.value && 'text-muted-foreground',
                            )}
                          >
                            {field.value
                              ? fornecedores.find((f) => f.id === field.value)?.nome
                              : 'Selecione ou crie'}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] md:w-[400px] p-0">
                        <Command>
                          <CommandInput
                            placeholder="Buscar fornecedor..."
                            onValueChange={setSearchFornecedor}
                          />
                          <CommandList>
                            <CommandEmpty>
                              <div className="p-2">
                                <Button
                                  variant="secondary"
                                  className="w-full justify-start text-sm"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    handleCreateFornecedor(searchFornecedor)
                                  }}
                                >
                                  <Plus className="mr-2 h-4 w-4" />
                                  Criar "{searchFornecedor}"
                                </Button>
                              </div>
                            </CommandEmpty>
                            <CommandGroup>
                              {fornecedores.map((f) => (
                                <CommandItem
                                  key={f.id}
                                  value={f.nome}
                                  onSelect={() => {
                                    form.setValue('fornecedor_id', f.id)
                                    setOpenFornecedor(false)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      f.id === field.value ? 'opacity-100' : 'opacity-0',
                                    )}
                                  />
                                  {f.nome}
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
            </div>

            {selectedProdutoId && (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 animate-fade-in">
                <div className="flex items-center gap-2 mb-3">
                  <History className="w-4 h-4 text-slate-500" />
                  <h4 className="text-sm font-semibold text-slate-700">Últimas Compras</h4>
                </div>
                {loadingHistorico ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                  </div>
                ) : historico.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">
                    Nenhum histórico para este produto.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {historico.map((h) => (
                      <Card key={h.id} className="shadow-none border-slate-200 bg-white">
                        <CardContent className="p-3 flex flex-col gap-1">
                          <span
                            className="text-xs font-bold text-slate-600 truncate"
                            title={h.fornecedores?.nome || 'Desconhecido'}
                          >
                            {h.fornecedores?.nome || 'Desconhecido'}
                          </span>
                          <span className="text-sm font-bold text-slate-900">
                            R${' '}
                            {h.preco_unitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-xs text-slate-500">
                            {format(parseISO(h.data_entrada), 'dd/MM/yyyy')}
                          </span>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="quantidade_embalagem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Itens p/ Embalagem *</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
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
                    <FormLabel>Qtd. Comprada *</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unidade_consumo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Und. Consumo *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Caixa">Caixa</SelectItem>
                        <SelectItem value="Unidade">Unidade</SelectItem>
                        <SelectItem value="Frasco">Frasco</SelectItem>
                        <SelectItem value="Pote">Pote</SelectItem>
                        <SelectItem value="Rolo">Rolo</SelectItem>
                        <SelectItem value="Pacote">Pacote</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="preco_unitario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Unitário (R$) *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>Preço Total (R$)</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    readOnly
                    disabled
                    value={precoTotal.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    className="bg-slate-50 font-bold text-slate-700 disabled:opacity-100"
                  />
                </FormControl>
              </FormItem>
              <FormField
                control={form.control}
                name="data_entrada"
                render={({ field }) => (
                  <FormItem className="flex flex-col pt-2.5">
                    <FormLabel>Data da Compra *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground',
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'dd/MM/yyyy', { locale: ptBR })
                            ) : (
                              <span>Selecionar data</span>
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
                          disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="local_compra"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local de Compra (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Dental Cremer, Mercado Livre..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="observacoes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detalhes adicionais..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Salvar Entrada
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>

      <CriarProdutoModal
        open={openCriarProduto}
        onOpenChange={setOpenCriarProduto}
        initialNome={searchProduto}
        onSuccess={(novoProduto) => {
          setLocalProdutos((prev) =>
            [...prev, novoProduto].sort((a, b) => a.nome.localeCompare(b.nome)),
          )
          form.setValue('produto_id', novoProduto.id)
        }}
      />
    </Dialog>
  )
}

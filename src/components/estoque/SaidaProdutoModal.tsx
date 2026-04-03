import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
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
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { Produto } from '@/services/produtos'
import { Loader2, Search, Check, PackageMinus } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { cn } from '@/lib/utils'

const formSchema = z
  .object({
    produto_id: z.string().min(1, 'Selecione um produto'),
    quantidade: z.coerce.number().min(1, 'A quantidade deve ser maior que 0'),
    tipo_saida: z.enum(['definitiva', 'parcial']),
    quantidade_devolver: z.coerce.number().optional(),
    descricao: z.string().optional(),
    observacoes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.tipo_saida === 'parcial') {
      if (!data.descricao || data.descricao.trim().length === 0) {
        ctx.addIssue({
          path: ['descricao'],
          message: 'A descrição é obrigatória para baixa parcial',
          code: z.ZodIssueCode.custom,
        })
      }
      if (data.quantidade_devolver === undefined || data.quantidade_devolver <= 0) {
        ctx.addIssue({
          path: ['quantidade_devolver'],
          message: 'A quantidade a devolver é obrigatória',
          code: z.ZodIssueCode.custom,
        })
      }
    }
  })

interface SaidaProdutoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  produtos: Produto[]
  onSuccess: () => void
}

export function SaidaProdutoModal({
  open,
  onOpenChange,
  produtos,
  onSuccess,
}: SaidaProdutoModalProps) {
  const [loading, setLoading] = useState(false)
  const [openCombobox, setOpenCombobox] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      produto_id: '',
      quantidade: 1,
      tipo_saida: 'definitiva',
      quantidade_devolver: 1,
      descricao: '',
      observacoes: '',
    },
  })

  const tipoSaida = form.watch('tipo_saida')
  const quantidade = form.watch('quantidade')

  useEffect(() => {
    if (tipoSaida === 'parcial' && quantidade) {
      form.setValue('quantidade_devolver', quantidade)
    }
  }, [tipoSaida, quantidade, form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const selectedProduto = produtos.find((p) => p.id === values.produto_id)
    if (selectedProduto && selectedProduto.quantidade_estoque < values.quantidade) {
      toast({
        title: 'Estoque insuficiente',
        description: `O produto possui apenas ${selectedProduto.quantidade_estoque} itens em estoque.`,
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    const { error } = await supabase.from('saida_produtos').insert({
      produto_id: values.produto_id,
      quantidade: values.quantidade,
      tipo_saida: values.tipo_saida,
      quantidade_devolver: values.tipo_saida === 'parcial' ? values.quantidade_devolver : null,
      descricao: values.descricao,
      observacoes: values.observacoes,
      usuario_id: user?.id,
    } as any)

    setLoading(false)

    if (error) {
      toast({
        title: 'Erro ao registrar saída',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Saída registrada com sucesso',
        description: 'O estoque foi atualizado.',
      })
      form.reset()
      onSuccess()
      onOpenChange(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) form.reset()
        onOpenChange(val)
      }}
    >
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackageMinus className="w-5 h-5 text-amber-500" />
            Nova Saída de Produto
          </DialogTitle>
          <DialogDescription>
            Registre a saída de um produto e atualize o estoque automaticamente.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="produto_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Produto *</FormLabel>
                  <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            'justify-between font-normal border-slate-300 w-full',
                            !field.value && 'text-slate-500',
                          )}
                        >
                          {field.value
                            ? produtos.find((p) => p.id === field.value)?.nome
                            : 'Buscar produto por nome ou marca...'}
                          <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Buscar produto..." />
                        <CommandList>
                          <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                          <CommandGroup>
                            {produtos.map((produto) => (
                              <CommandItem
                                key={produto.id}
                                value={`${produto.nome} ${produto.marca || ''} ${produto.id}`}
                                onSelect={() => {
                                  form.setValue('produto_id', produto.id, { shouldValidate: true })
                                  setOpenCombobox(false)
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4 text-amber-500',
                                    produto.id === field.value ? 'opacity-100' : 'opacity-0',
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span className="font-medium">{produto.nome}</span>
                                  {produto.marca && (
                                    <span className="text-xs text-slate-500">{produto.marca}</span>
                                  )}
                                </div>
                                <span className="ml-auto text-xs font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">
                                  Estoque: {produto.quantidade_estoque}
                                </span>
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade a Sair *</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" className="border-slate-300" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tipo_saida"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Tipo de Saída *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="definitiva" className="text-amber-500" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer text-sm">
                            Saída Definitiva
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="parcial" className="text-amber-500" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer text-sm">
                            Baixa Parcial
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {tipoSaida === 'parcial' && (
              <FormField
                control={form.control}
                name="quantidade_devolver"
                render={({ field }) => (
                  <FormItem className="animate-fade-in-down bg-amber-50 p-3 rounded-lg border border-amber-100">
                    <FormLabel className="text-amber-900 font-semibold">
                      Quantidade a Devolver *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        className="bg-white border-amber-200 focus-visible:ring-amber-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição {tipoSaida === 'parcial' && '*'}</FormLabel>
                  <FormControl>
                    <Input
                      className="border-slate-300"
                      placeholder="Motivo ou destino da saída..."
                      {...field}
                    />
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
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Informações adicionais (opcional)..."
                      className="resize-none h-20 border-slate-300"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Salvar Saída
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

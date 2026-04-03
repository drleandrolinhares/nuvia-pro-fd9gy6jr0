import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, PackagePlus } from 'lucide-react'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

import { createProduto, fetchEspecialidades, Produto } from '@/services/produtos'

const formSchema = z.object({
  codigo_barras: z.string().optional(),
  nome: z.string().min(1, 'Nome é obrigatório'),
  marca: z.string().optional(),
  especialidade_id: z.string().optional(),
  embalagem: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface CriarProdutoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialNome?: string
  onSuccess: (produto: Produto) => void
}

export function CriarProdutoModal({
  open,
  onOpenChange,
  initialNome = '',
  onSuccess,
}: CriarProdutoModalProps) {
  const [especialidades, setEspecialidades] = useState<{ id: string; nome: string }[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      codigo_barras: '',
      nome: initialNome,
      marca: '',
      especialidade_id: 'none',
      embalagem: '',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        codigo_barras: '',
        nome: initialNome,
        marca: '',
        especialidade_id: 'none',
        embalagem: '',
      })
      fetchEspecialidades().then((res) => {
        if (res.data) setEspecialidades(res.data)
      })
    }
  }, [open, form, initialNome])

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    const payload = {
      ...values,
      especialidade_id: values.especialidade_id === 'none' ? null : values.especialidade_id,
      quantidade_estoque: 0,
      quantidade_minima: 0,
      custo_unitario: 0,
    }

    const { data, error } = await createProduto(payload)
    setLoading(false)

    if (error) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível criar o produto.',
        variant: 'destructive',
      })
    } else if (data) {
      toast({ title: 'Sucesso', description: 'Produto criado com sucesso.' })
      onSuccess(data as Produto)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-slate-800">
            <PackagePlus className="w-5 h-5 text-amber-500" />
            Criar Novo Produto
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="codigo_barras"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código de Barras</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 7891234567890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Material *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Luva de Procedimento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="marca"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marca do Produto</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Supermax" {...field} />
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
                  <FormLabel>Especialidade</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Geral / Nenhuma</SelectItem>
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
              name="embalagem"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Embalagem de Compra</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Salvar Produto
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
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
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'
import { Roteiro } from '@/hooks/use-roteiros'
import { Loader2 } from 'lucide-react'

const schema = z.object({
  titulo: z.string().min(1, 'Obrigatório'),
  objetivo: z.string().optional(),
  tipo_comunicacao: z.string().min(1, 'Obrigatório'),
  conteudo: z.string().optional(),
})

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  setorId: string
  roteiro?: Roteiro
  onSuccess: () => void
}

export function RoteiroDialog({ open, onOpenChange, setorId, roteiro, onSuccess }: Props) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      titulo: '',
      objetivo: '',
      tipo_comunicacao: '',
      conteudo: '',
    },
  })

  useEffect(() => {
    if (open) {
      if (roteiro) {
        form.reset({
          titulo: roteiro.titulo,
          objetivo: roteiro.objetivo || '',
          tipo_comunicacao: roteiro.tipo_comunicacao,
          conteudo: roteiro.conteudo || '',
        })
      } else {
        form.reset({
          titulo: '',
          objetivo: '',
          tipo_comunicacao: '',
          conteudo: '',
        })
      }
    }
  }, [open, roteiro, form])

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      if (roteiro) {
        await supabase
          .from('roteiros' as any)
          .update(values)
          .eq('id', roteiro.id)
        toast({ title: 'Roteiro atualizado' })
      } else {
        await supabase.from('roteiros' as any).insert({ ...values, setor_id: setorId })
        toast({ title: 'Roteiro criado' })
      }
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{roteiro ? 'Editar Roteiro' : 'Novo Roteiro'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Confirmação de Consulta" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tipo_comunicacao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comunicação (Formato)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Mensagem de Texto, Áudio, Vídeo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="objetivo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Objetivo</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Para que serve este roteiro?"
                      className="resize-none h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="conteudo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conteúdo</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Cole aqui o texto, script ou estrutura..."
                      className="h-40 font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

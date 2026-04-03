import { useState, useEffect } from 'react'
import { Plus, Search, Truck, Pencil, Trash2, Loader2, MoreHorizontal } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import {
  Fornecedor,
  fetchFornecedores,
  createFornecedor,
  updateFornecedor,
  deleteFornecedor,
} from '@/services/fornecedores'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase/client'

const formSchema = z.object({
  nome: z.string().min(2, 'Obrigatório'),
  cnpj: z.string().optional(),
  contato_principal: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email('E-mail inválido').or(z.literal('')).optional(),
  endereco: z.string().optional(),
  observacoes: z.string().optional(),
})

export function FornecedoresTab() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      cnpj: '',
      contato_principal: '',
      telefone: '',
      email: '',
      endereco: '',
      observacoes: '',
    },
  })

  useEffect(() => {
    loadFornecedores()
    const sub = supabase
      .channel('fornecedores')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'fornecedores' },
        loadFornecedores,
      )
      .subscribe()
    return () => {
      supabase.removeChannel(sub)
    }
  }, [])

  const loadFornecedores = async () => {
    setLoading(true)
    const { data } = await fetchFornecedores()
    if (data) setFornecedores(data)
    setLoading(false)
  }

  const handleOpenSheet = (fornecedor?: Fornecedor) => {
    if (fornecedor) {
      setEditingId(fornecedor.id)
      form.reset({
        nome: fornecedor.nome || '',
        cnpj: fornecedor.cnpj || '',
        contato_principal: fornecedor.contato_principal || '',
        telefone: fornecedor.telefone || '',
        email: fornecedor.email || '',
        endereco: fornecedor.endereco || '',
        observacoes: fornecedor.observacoes || '',
      })
    } else {
      setEditingId(null)
      form.reset({
        nome: '',
        cnpj: '',
        contato_principal: '',
        telefone: '',
        email: '',
        endereco: '',
        observacoes: '',
      })
    }
    setSheetOpen(true)
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true)
    let error
    if (editingId) {
      const res = await updateFornecedor(editingId, values)
      error = res.error
    } else {
      const res = await createFornecedor(values)
      error = res.error
    }

    setLoading(false)
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Fornecedor salvo com sucesso!' })
      setSheetOpen(false)
      loadFornecedores()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este fornecedor?')) return
    setLoading(true)
    const { error } = await deleteFornecedor(id)
    setLoading(false)
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Fornecedor excluído!' })
      loadFornecedores()
    }
  }

  const filtrados = fornecedores.filter(
    (f) =>
      f.nome.toLowerCase().includes(busca.toLowerCase()) ||
      f.cnpj?.includes(busca) ||
      f.contato_principal?.toLowerCase().includes(busca.toLowerCase()),
  )

  return (
    <Card className="border-border/50 shadow-sm animate-fade-in-up">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <CardTitle className="uppercase tracking-wider flex items-center gap-2">
            <Truck className="w-5 h-5 text-fuchsia-600" />
            Fornecedores
          </CardTitle>
          <CardDescription>
            Gerencie a lista de fornecedores de materiais e equipamentos.
          </CardDescription>
        </div>
        <Button
          onClick={() => handleOpenSheet()}
          className="bg-fuchsia-600 hover:bg-fuchsia-700 font-bold tracking-wide"
        >
          <Plus className="w-4 h-4 mr-2" />
          NOVO FORNECEDOR
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, CNPJ ou contato..."
            className="pl-9 max-w-md"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-bold text-xs uppercase tracking-wider">
                  Fornecedor
                </TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">
                  Contato Principal
                </TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider hidden md:table-cell">
                  Telefone
                </TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider hidden lg:table-cell">
                  E-mail
                </TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && fornecedores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : filtrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhum fornecedor encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filtrados.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell>
                      <div className="font-semibold text-slate-900">{f.nome}</div>
                      {f.cnpj && <div className="text-xs text-muted-foreground">{f.cnpj}</div>}
                    </TableCell>
                    <TableCell className="text-sm">{f.contato_principal || '-'}</TableCell>
                    <TableCell className="text-sm hidden md:table-cell">
                      {f.telefone || '-'}
                    </TableCell>
                    <TableCell className="text-sm hidden lg:table-cell">{f.email || '-'}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenSheet(f)}>
                            <Pencil className="w-4 h-4 mr-2" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(f.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-5 h-5 text-fuchsia-600" />
              {editingId ? 'Editar Fornecedor' : 'Novo Fornecedor'}
            </SheetTitle>
            <SheetDescription>
              Preencha os detalhes do fornecedor. Campos com * são obrigatórios.
            </SheetDescription>
          </SheetHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider">
                      Nome da Empresa / Fantasia *
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider">
                        CNPJ
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contato_principal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider">
                        Contato Principal (Nome)
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider">
                        Telefone / WhatsApp
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider">
                        E-mail
                      </FormLabel>
                      <FormControl>
                        <Input {...field} type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="endereco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider">
                      Endereço Completo
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel className="text-xs font-bold uppercase tracking-wider">
                      Observações / Acordos / Detalhes
                    </FormLabel>
                    <FormControl>
                      <Textarea className="h-24 resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 font-bold"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                SALVAR FORNECEDOR
              </Button>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
    </Card>
  )
}

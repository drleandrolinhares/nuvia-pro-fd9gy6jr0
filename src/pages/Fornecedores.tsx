import { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Truck,
  Pencil,
  Trash2,
  Loader2,
  MoreHorizontal,
  Eye,
  EyeOff,
  ExternalLink,
} from 'lucide-react'
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
  url: z.string().optional(),
  usuario_login: z.string().optional(),
  senha: z.string().optional(),
  endereco: z.string().optional(),
  observacoes: z.string().optional(),
})

export default function Fornecedores() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      cnpj: '',
      contato_principal: '',
      telefone: '',
      email: '',
      url: '',
      usuario_login: '',
      senha: '',
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

  const handleOpenSheet = (f?: Fornecedor) => {
    setEditingId(f?.id || null)
    form.reset({
      nome: f?.nome || '',
      cnpj: f?.cnpj || '',
      contato_principal: f?.contato_principal || '',
      telefone: f?.telefone || '',
      email: f?.email || '',
      url: f?.url || '',
      usuario_login: f?.usuario_login || '',
      senha: f?.senha || '',
      endereco: f?.endereco || '',
      observacoes: f?.observacoes || '',
    })
    setShowPassword(false)
    setSheetOpen(true)
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true)
    const res = editingId
      ? await updateFornecedor(editingId, values)
      : await createFornecedor(values)
    setLoading(false)
    if (res.error) {
      toast({ title: 'Erro', description: res.error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Fornecedor salvo!' })
      setSheetOpen(false)
      loadFornecedores()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este fornecedor?')) return
    setLoading(true)
    const { error } = await deleteFornecedor(id)
    setLoading(false)
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    else loadFornecedores()
  }

  const openUrl = (url: string) => {
    const validUrl = url.startsWith('http') ? url : `https://${url}`
    window.open(validUrl, '_blank')
  }

  const filtrados = fornecedores.filter(
    (f) =>
      f.nome.toLowerCase().includes(busca.toLowerCase()) ||
      f.cnpj?.includes(busca) ||
      f.contato_principal?.toLowerCase().includes(busca.toLowerCase()),
  )

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Truck className="w-6 h-6 text-fuchsia-600" />
            FORNECEDORES
          </h1>
          <p className="text-slate-500">Gerencie a lista de fornecedores, portais e acessos.</p>
        </div>
        <Button
          onClick={() => handleOpenSheet()}
          className="bg-fuchsia-600 hover:bg-fuchsia-700 font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> NOVO FORNECEDOR
        </Button>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar fornecedor..."
            className="pl-9 max-w-md bg-white"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-bold text-xs uppercase">Fornecedor</TableHead>
                <TableHead className="font-bold text-xs uppercase hidden md:table-cell">
                  Contato
                </TableHead>
                <TableHead className="font-bold text-xs uppercase hidden lg:table-cell">
                  E-mail
                </TableHead>
                <TableHead className="font-bold text-xs uppercase">Portal de Acesso</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && fornecedores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
                  </TableCell>
                </TableRow>
              ) : filtrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                    Nenhum fornecedor encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filtrados.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell>
                      <div className="font-semibold text-slate-900">{f.nome}</div>
                      {f.cnpj && <div className="text-xs text-slate-500">{f.cnpj}</div>}
                    </TableCell>
                    <TableCell className="text-sm hidden md:table-cell">
                      {f.contato_principal || '-'}
                    </TableCell>
                    <TableCell className="text-sm hidden lg:table-cell">{f.email || '-'}</TableCell>
                    <TableCell>
                      {f.url ? (
                        <div
                          onClick={() => openUrl(f.url!)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-sm font-medium text-slate-700 cursor-pointer transition-colors"
                        >
                          <ExternalLink className="w-4 h-4 text-fuchsia-600" />
                          Acessar Portal
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">-</span>
                      )}
                    </TableCell>
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
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="uppercase flex items-center gap-2">
              <Truck className="w-5 h-5 text-fuchsia-600" />
              {editingId ? 'Editar Fornecedor' : 'Novo Fornecedor'}
            </SheetTitle>
            <SheetDescription>Preencha os detalhes do fornecedor.</SheetDescription>
          </SheetHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase">Nome da Empresa *</FormLabel>
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
                      <FormLabel className="text-xs font-bold uppercase">CNPJ</FormLabel>
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
                      <FormLabel className="text-xs font-bold uppercase">Contato (Nome)</FormLabel>
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
                      <FormLabel className="text-xs font-bold uppercase">Telefone</FormLabel>
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
                      <FormLabel className="text-xs font-bold uppercase">E-mail</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border space-y-4">
                <h3 className="text-xs font-bold uppercase text-fuchsia-700 flex items-center gap-2">
                  Central de Acesso
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase text-slate-600">
                          URL
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="www.portal.com.br" className="bg-white" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="usuario_login"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase text-slate-600">
                          Usuário/Login
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="usuario ou email" className="bg-white" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="senha"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase text-slate-600">
                          Senha
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              className="bg-white"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                              ) : (
                                <Eye className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="endereco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase">Endereço</FormLabel>
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
                    <FormLabel className="text-xs font-bold uppercase">Observações</FormLabel>
                    <FormControl>
                      <Textarea className="h-20 resize-none" {...field} />
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
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} SALVAR
              </Button>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
    </div>
  )
}

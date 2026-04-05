import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, User, Shield, Save, Camera } from 'lucide-react'

import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import {
  getMeuPerfil,
  updateMeusDadosPessoais,
  updateMinhaSenha,
  uploadAvatar,
} from '@/services/perfil'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const perfilSchema = z.object({
  nome: z.string().min(3, 'Nome é obrigatório'),
  cpf: z.string().optional(),
  data_nascimento: z.string().optional(),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  banco: z.string().optional(),
  agencia: z.string().optional(),
  conta: z.string().optional(),
  pix: z.string().optional(),
  ctps: z.string().optional(),
  pis: z.string().optional(),
  beneficiario_emergencia: z.string().optional(),
})

const senhaSchema = z
  .object({
    senhaAtual: z.string().min(6, 'Senha atual é obrigatória'),
    novaSenha: z.string().min(6, 'A nova senha deve ter no mínimo 6 caracteres'),
    confirmarSenha: z.string().min(6, 'A confirmação de senha é obrigatória'),
  })
  .refine((data) => data.novaSenha === data.confirmarSenha, {
    message: 'As senhas não coincidem',
    path: ['confirmarSenha'],
  })

export default function Perfil() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [savingPerfil, setSavingPerfil] = useState(false)
  const [savingSenha, setSavingSenha] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [perfilData, setPerfilData] = useState<any>(null)

  const perfilForm = useForm<z.infer<typeof perfilSchema>>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      nome: '',
      cpf: '',
      data_nascimento: '',
      telefone: '',
      endereco: '',
      banco: '',
      agencia: '',
      conta: '',
      pix: '',
      ctps: '',
      pis: '',
      beneficiario_emergencia: '',
    },
  })

  const senhaForm = useForm<z.infer<typeof senhaSchema>>({
    resolver: zodResolver(senhaSchema),
    defaultValues: {
      senhaAtual: '',
      novaSenha: '',
      confirmarSenha: '',
    },
  })

  useEffect(() => {
    if (user) {
      loadPerfil()
    }
  }, [user])

  async function loadPerfil() {
    try {
      setLoading(true)
      const data = await getMeuPerfil(user!.id)
      const userData = data || {}
      setPerfilData(userData)

      perfilForm.reset({
        nome: userData.nome || user?.user_metadata?.name || '',
        cpf: userData.cpf || '',
        data_nascimento: userData.data_nascimento || '',
        telefone: userData.telefone || '',
        endereco: userData.endereco || '',
        banco: userData.detalhes?.banco || '',
        agencia: userData.detalhes?.agencia || '',
        conta: userData.detalhes?.conta || '',
        pix: userData.detalhes?.pix || '',
        ctps: userData.detalhes?.ctps || '',
        pis: userData.detalhes?.pis || '',
        beneficiario_emergencia: userData.detalhes?.beneficiario_emergencia || '',
      })
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados do perfil.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      const file = event.target.files?.[0]
      if (!file) return
      setUploadingAvatar(true)
      const url = await uploadAvatar(user!.id, file)
      setPerfilData((prev: any) => ({ ...prev, avatar_url: url }))
      toast({ title: 'Sucesso', description: 'Foto atualizada com sucesso.' })
    } catch (error: any) {
      toast({ title: 'Erro', description: 'Erro ao atualizar foto.', variant: 'destructive' })
    } finally {
      setUploadingAvatar(false)
    }
  }

  async function onSubmitPerfil(values: z.infer<typeof perfilSchema>) {
    try {
      setSavingPerfil(true)
      await updateMeusDadosPessoais(user!.id, values)
      toast({
        title: 'Sucesso',
        description: 'Perfil atualizado com sucesso.',
      })
      loadPerfil()
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar perfil.',
        variant: 'destructive',
      })
    } finally {
      setSavingPerfil(false)
    }
  }

  async function onSubmitSenha(values: z.infer<typeof senhaSchema>) {
    try {
      setSavingSenha(true)
      await updateMinhaSenha(user!.email!, values.senhaAtual, values.novaSenha)
      toast({
        title: 'Sucesso',
        description: 'Senha alterada com sucesso.',
      })
      senhaForm.reset()
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao alterar senha.',
        variant: 'destructive',
      })
    } finally {
      setSavingSenha(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-8 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Meu Perfil
        </h1>
        <p className="text-muted-foreground">
          Gerencie suas informações pessoais e credenciais de acesso.
        </p>
      </div>

      <Tabs defaultValue="dados" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="dados" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Dados Cadastrais
          </TabsTrigger>
          <TabsTrigger value="seguranca" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Segurança
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dados" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Dados Profissionais</CardTitle>
                  <CardDescription>Informações restritas da empresa.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center gap-4 mb-6 pb-6 border-b border-border/50">
                    <div className="relative">
                      <Avatar className="w-24 h-24 border-2 border-primary/20 shadow-sm">
                        <AvatarImage
                          src={
                            perfilData?.avatar_url ||
                            `https://img.usecurling.com/ppl/thumbnail?gender=male&seed=${user?.id || '1'}`
                          }
                        />
                        <AvatarFallback className="text-2xl">
                          {perfilData?.nome?.substring(0, 2)?.toUpperCase() ||
                            user?.user_metadata?.name?.substring(0, 2)?.toUpperCase() ||
                            'US'}
                        </AvatarFallback>
                      </Avatar>
                      <label
                        htmlFor="avatar-upload"
                        className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-md"
                      >
                        {uploadingAvatar ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Camera className="w-4 h-4" />
                        )}
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarUpload}
                          disabled={uploadingAvatar}
                        />
                      </label>
                    </div>
                    <span className="text-sm text-muted-foreground font-medium">Alterar Foto</span>
                  </div>

                  <div>
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                      Cargo Principal
                    </Label>
                    <p className="font-medium text-sm mt-1">
                      {perfilData?.cargo?.nome || 'Não definido'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                      Cargo Secundário
                    </Label>
                    <p className="font-medium text-sm mt-1">
                      {perfilData?.cargo_secundario?.nome || 'Não definido'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                      Data de Admissão
                    </Label>
                    <p className="font-medium text-sm mt-1">
                      {perfilData?.data_admissao
                        ? new Date(perfilData.data_admissao).toLocaleDateString('pt-BR')
                        : 'Não definida'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                      Status
                    </Label>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span
                          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${perfilData?.status === 'inativo' ? 'bg-destructive' : 'bg-emerald-500'}`}
                        ></span>
                        <span
                          className={`relative inline-flex rounded-full h-2.5 w-2.5 ${perfilData?.status === 'inativo' ? 'bg-destructive' : 'bg-emerald-500'}`}
                        ></span>
                      </span>
                      <p className="font-medium text-sm capitalize">
                        {perfilData?.status || 'Ativo'}
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border/50 text-xs text-muted-foreground bg-muted/30 p-3 rounded-md mt-4">
                    A edição destes dados é restrita aos administradores do sistema.
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Pessoais</CardTitle>
                  <CardDescription>Mantenha seus dados sempre atualizados.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...perfilForm}>
                    <form onSubmit={perfilForm.handleSubmit(onSubmitPerfil)} className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground mb-4">
                          Dados Pessoais
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={perfilForm.control}
                            name="nome"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nome Completo</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={perfilForm.control}
                            name="cpf"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CPF</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="000.000.000-00" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={perfilForm.control}
                            name="data_nascimento"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Data de Nascimento</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={perfilForm.control}
                            name="telefone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Telefone</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="(00) 00000-0000" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={perfilForm.control}
                            name="endereco"
                            render={({ field }) => (
                              <FormItem className="sm:col-span-2">
                                <FormLabel>Endereço Completo</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground mb-4">
                          Dados Bancários
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={perfilForm.control}
                            name="banco"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Banco</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={perfilForm.control}
                            name="agencia"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Agência</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={perfilForm.control}
                            name="conta"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Conta</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={perfilForm.control}
                            name="pix"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Chave PIX</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground mb-4">
                          Documentação & Emergência
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={perfilForm.control}
                            name="ctps"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CTPS</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={perfilForm.control}
                            name="pis"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>PIS</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={perfilForm.control}
                            name="beneficiario_emergencia"
                            render={({ field }) => (
                              <FormItem className="sm:col-span-2">
                                <FormLabel>Contato de Emergência (Nome e Telefone)</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={savingPerfil}>
                          {savingPerfil && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          <Save className="mr-2 h-4 w-4" />
                          Salvar Alterações
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="seguranca">
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle>Alterar Senha</CardTitle>
              <CardDescription>
                Sua senha deve ter no mínimo 6 caracteres. Recomendamos usar uma combinação de
                letras, números e símbolos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...senhaForm}>
                <form onSubmit={senhaForm.handleSubmit(onSubmitSenha)} className="space-y-5">
                  <FormField
                    control={senhaForm.control}
                    name="senhaAtual"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha Atual</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={senhaForm.control}
                    name="novaSenha"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nova Senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={senhaForm.control}
                    name="confirmarSenha"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar Nova Senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-4 flex justify-end">
                    <Button type="submit" disabled={savingSenha}>
                      {savingSenha && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Atualizar Senha
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

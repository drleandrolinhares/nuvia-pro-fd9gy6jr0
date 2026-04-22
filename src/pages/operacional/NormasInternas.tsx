import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import {
  FileText,
  Plus,
  Users,
  CheckCircle2,
  Clock,
  FileSignature,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Norma {
  id: string
  titulo: string
  conteudo: string
  ativo: boolean
  criado_em: string
}

interface Aceite {
  id: string
  norma_id: string
  usuario_id: string
  aceito_em: string
  norma?: Norma
}

interface Usuario {
  id: string
  nome: string
  email: string
  status: string
}

export default function NormasInternas() {
  const { profile, user } = useAuth()
  const { toast } = useToast()
  const isAdmin = profile?.role === 'admin'

  const [normas, setNormas] = useState<Norma[]>([])
  const [aceites, setAceites] = useState<Aceite[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'lista' | 'nova' | 'detalhes'>('lista')
  const [selectedNorma, setSelectedNorma] = useState<Norma | null>(null)

  const [titulo, setTitulo] = useState('')
  const [conteudo, setConteudo] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [isAdmin, user])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (isAdmin) {
        const [resNormas, resAceites, resUsuarios] = await Promise.all([
          supabase.from('normas_internas').select('*').order('criado_em', { ascending: false }),
          supabase.from('normas_aceites').select('*'),
          supabase.from('usuarios').select('id, nome, email, status').eq('status', 'ativo'),
        ])
        if (resNormas.data) setNormas(resNormas.data)
        if (resAceites.data) setAceites(resAceites.data)
        if (resUsuarios.data) setUsuarios(resUsuarios.data)
      } else {
        const resAceites = await supabase
          .from('normas_aceites')
          .select('*, norma:normas_internas(*)')
          .eq('usuario_id', user?.id)
        if (resAceites.data) setAceites(resAceites.data)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNorma = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!titulo || !conteudo) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase.from('normas_internas').insert({
        titulo,
        conteudo,
        criado_por: user?.id,
      })

      if (error) throw error

      toast({ title: 'Sucesso', description: 'Norma criada com sucesso.' })
      setView('lista')
      setTitulo('')
      setConteudo('')
      fetchData()
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderAdminView = () => {
    if (view === 'nova') {
      return (
        <Card className="animate-fade-in-up border-border/50 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setView('lista')}>
                <ArrowLeft className="size-4" />
              </Button>
              <div>
                <CardTitle className="uppercase tracking-wider">Novo Documento</CardTitle>
                <CardDescription>Crie uma nova norma ou comunicado obrigatório.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateNorma} className="space-y-6">
              <div className="space-y-2">
                <Label>Título do Documento</Label>
                <Input
                  placeholder="Ex: PROIBIDO USO DE CELULAR PESSOAL EM HORARIO DE TRABALHO"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Conteúdo da Norma</Label>
                <Textarea
                  placeholder="Escreva aqui todas as orientações e regras..."
                  className="min-h-[300px] resize-y"
                  value={conteudo}
                  onChange={(e) => setConteudo(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => setView('lista')}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Publicar Norma'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )
    }

    if (view === 'detalhes' && selectedNorma) {
      const aceitesDaNorma = aceites.filter((a) => a.norma_id === selectedNorma.id)
      const aceitesSet = new Set(aceitesDaNorma.map((a) => a.usuario_id))

      const signedUsers = usuarios.filter((u) => aceitesSet.has(u.id))
      const pendingUsers = usuarios.filter((u) => !aceitesSet.has(u.id))

      return (
        <div className="space-y-6 animate-fade-in-up">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" onClick={() => setView('lista')}>
                    <ArrowLeft className="size-4" />
                  </Button>
                  <div>
                    <CardTitle className="uppercase tracking-wider">
                      {selectedNorma.titulo}
                    </CardTitle>
                    <CardDescription>
                      Criado em{' '}
                      {format(
                        new Date(selectedNorma.criado_em),
                        "dd 'de' MMMM 'de' yyyy, 'às' HH:mm",
                        { locale: ptBR },
                      )}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={selectedNorma.ativo ? 'default' : 'secondary'}>
                  {selectedNorma.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap bg-muted/30 p-6 rounded-lg border border-border">
                {selectedNorma.conteudo}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="uppercase tracking-wider text-lg flex items-center gap-2">
                <Users className="size-5" />
                Relatório de Assinaturas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="pendentes">
                <TabsList className="mb-4">
                  <TabsTrigger value="pendentes" className="flex gap-2">
                    <Clock className="size-4" />
                    Pendentes ({pendingUsers.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="assinados"
                    className="flex gap-2 text-emerald-600 data-[state=active]:text-emerald-700"
                  >
                    <CheckCircle2 className="size-4" />
                    Assinados ({signedUsers.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="pendentes" className="space-y-4">
                  {pendingUsers.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
                      <CheckCircle2 className="size-12 text-emerald-500/50 mb-3" />
                      <p>Todos os colaboradores ativos já assinaram esta norma.</p>
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {pendingUsers.map((u) => (
                        <div
                          key={u.id}
                          className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card"
                        >
                          <div className="size-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                            <Clock className="size-5" />
                          </div>
                          <div className="overflow-hidden">
                            <p className="font-medium text-sm truncate">{u.nome}</p>
                            <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="assinados" className="space-y-4">
                  {signedUsers.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
                      <AlertCircle className="size-12 text-muted-foreground/50 mb-3" />
                      <p>Nenhum colaborador assinou esta norma ainda.</p>
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {signedUsers.map((u) => {
                        const aceite = aceitesDaNorma.find((a) => a.usuario_id === u.id)
                        return (
                          <div
                            key={u.id}
                            className="flex items-center gap-3 p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5"
                          >
                            <div className="size-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600 shrink-0">
                              <CheckCircle2 className="size-5" />
                            </div>
                            <div className="overflow-hidden">
                              <p className="font-medium text-sm truncate">{u.nome}</p>
                              <p className="text-xs text-emerald-600/80 truncate">
                                {aceite
                                  ? format(new Date(aceite.aceito_em), 'dd/MM/yyyy HH:mm')
                                  : ''}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )
    }

    return (
      <Card className="border-border/50 shadow-sm animate-fade-in-up">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <div>
            <CardTitle className="uppercase tracking-wider">Documentos Ativos</CardTitle>
            <CardDescription>
              Gerencie as normas internas e acompanhe as assinaturas.
            </CardDescription>
          </div>
          <Button onClick={() => setView('nova')} className="uppercase tracking-wider font-bold">
            <Plus className="size-4 mr-2" /> Novo Documento
          </Button>
        </CardHeader>
        <CardContent>
          {normas.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground flex flex-col items-center">
              <FileText className="size-12 opacity-20 mb-4" />
              <p>Nenhuma norma cadastrada ainda.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {normas.map((norma) => {
                const totalAssinaturas = aceites.filter((a) => a.norma_id === norma.id).length
                const totalPendentes = usuarios.length - totalAssinaturas

                return (
                  <div
                    key={norma.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedNorma(norma)
                      setView('detalhes')
                    }}
                  >
                    <div className="space-y-1 mb-4 sm:mb-0">
                      <div className="flex items-center gap-2">
                        <FileSignature className="size-5 text-primary" />
                        <h4 className="font-bold uppercase tracking-wide">{norma.titulo}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Criado em {format(new Date(norma.criado_em), 'dd/MM/yyyy')}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="flex gap-2">
                        <Badge
                          variant="outline"
                          className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        >
                          {totalAssinaturas} Assinados
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-amber-500/10 text-amber-600 border-amber-500/20"
                        >
                          {totalPendentes} Pendentes
                        </Badge>
                      </div>
                      <Badge variant={norma.ativo ? 'default' : 'secondary'}>
                        {norma.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const renderUserView = () => {
    return (
      <Card className="border-border/50 shadow-sm animate-fade-in-up">
        <CardHeader>
          <CardTitle className="uppercase tracking-wider">Meus Documentos Assinados</CardTitle>
          <CardDescription>
            Histórico de normas internas e comunicados que você deu ciência.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {aceites.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground flex flex-col items-center">
              <FileText className="size-12 opacity-20 mb-4" />
              <p>Você ainda não assinou nenhum documento.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {aceites.map((aceite) => (
                <div
                  key={aceite.id}
                  className="p-4 rounded-lg border border-border bg-card space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-5 text-emerald-500" />
                      <h4 className="font-bold uppercase tracking-wide">{aceite.norma?.titulo}</h4>
                    </div>
                  </div>

                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-muted-foreground line-clamp-3">
                    {aceite.norma?.conteudo}
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between text-xs font-medium text-muted-foreground">
                    <span>Assinado eletronicamente</span>
                    <span>{format(new Date(aceite.aceito_em), "dd/MM/yyyy 'às' HH:mm")}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground uppercase">
          Normas Internas
        </h1>
        <p className="text-muted-foreground uppercase text-sm font-medium tracking-wider mt-1">
          {isAdmin ? 'Gestão de Documentos e Compliance' : 'Meus Documentos Oficiais'}
        </p>
      </div>

      {isAdmin ? renderAdminView() : renderUserView()}
    </div>
  )
}

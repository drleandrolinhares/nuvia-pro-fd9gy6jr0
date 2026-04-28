import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { format, subMonths, addMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Check, X, Clock, Plus, Loader2, Star, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type GoogleReview = {
  id: string
  usuario_id: string
  paciente_nome: string
  data_contato: string
  data_comentario: string
  status: 'pendente' | 'validado' | 'invalidado'
  mes_referencia: string
  criado_em: string
}

export function GoogleTab() {
  const { profile } = useAuth()
  const isManager = profile?.role === 'admin' || profile?.role === 'gestor'
  const { toast } = useToast()

  const [currentDate, setCurrentDate] = useState(new Date())
  const currentMonthStr = format(currentDate, 'yyyy-MM')

  const [users, setUsers] = useState<any[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string>('all')
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const [loading, setLoading] = useState(true)

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [nome, setNome] = useState('')
  const [dataContato, setDataContato] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [dataComentario, setDataComentario] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchUsers = async () => {
    if (!isManager) return
    const { data } = await supabase
      .from('usuarios')
      .select('id, nome')
      .eq('status', 'ativo')
      .order('nome')
    if (data) setUsers(data)
  }

  const fetchReviews = async () => {
    setLoading(true)
    let query = supabase
      .from('performance_google_reviews')
      .select('*')
      .eq('mes_referencia', currentMonthStr)
      .order('criado_em', { ascending: false })

    if (!isManager) {
      query = query.eq('usuario_id', profile?.id)
    } else if (selectedUserId !== 'all') {
      query = query.eq('usuario_id', selectedUserId)
    }

    const { data, error } = await query
    if (!error && data) setReviews(data as any)
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [isManager])

  useEffect(() => {
    fetchReviews()
  }, [currentMonthStr, selectedUserId, isManager])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome || !dataContato || !dataComentario) return

    setIsSubmitting(true)
    const { error } = await supabase.from('performance_google_reviews').insert({
      usuario_id: profile?.id,
      paciente_nome: nome,
      data_contato: dataContato,
      data_comentario: dataComentario,
      mes_referencia: format(new Date(), 'yyyy-MM'),
    } as any)

    setIsSubmitting(false)

    if (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Avaliação registrada', description: 'Registro pendente de validação.' })
      setIsAddOpen(false)
      setNome('')
      fetchReviews()
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('performance_google_reviews')
      .update({ status: newStatus } as any)
      .eq('id', id)
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Status atualizado' })
      fetchReviews()
    }
  }

  const handleGerarAdiantamentos = async () => {
    const { error } = await supabase.rpc('gerar_adiantamento_mes_google', {
      p_mes: currentMonthStr,
    } as any)
    if (error) toast({ title: 'Erro ao gerar', description: error.message, variant: 'destructive' })
    else toast({ title: 'Adiantamentos gerados para o mês' })
  }

  const handleProcessarFechamento = async () => {
    const { error } = await supabase.rpc('processar_fechamento_mes_google', {
      p_mes: currentMonthStr,
    } as any)
    if (error)
      toast({ title: 'Erro no fechamento', description: error.message, variant: 'destructive' })
    else toast({ title: 'Fechamento processado com sucesso' })
  }

  const validReviews = reviews.filter((r) => r.status === 'validado').length
  const pendingReviews = reviews.filter((r) => r.status === 'pendente').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
            &lt;
          </Button>
          <div className="font-semibold w-40 text-center uppercase tracking-wider text-slate-700 dark:text-slate-200">
            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
          </div>
          <Button variant="outline" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
            &gt;
          </Button>
        </div>

        {isManager && (
          <div className="flex flex-wrap gap-2">
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Todos os colaboradores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os colaboradores</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleGerarAdiantamentos}>
              Gerar Adiantamentos
            </Button>
            <Button
              variant="default"
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={handleProcessarFechamento}
            >
              Processar Fechamento
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-50 dark:bg-slate-900 border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              Total Registrado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{reviews.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-50 dark:bg-slate-900 border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Validados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {validReviews} <span className="text-sm font-normal text-slate-500">/ 5 meta</span>
            </p>
          </CardContent>
        </Card>
        <Card className="bg-slate-50 dark:bg-slate-900 border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{pendingReviews}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Lançamentos do Mês</CardTitle>
            <CardDescription>Avaliações positivas no Google</CardDescription>
          </div>
          {!isManager && (
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                  <Plus className="w-4 h-4 mr-2" /> Novo Lançamento
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Avaliação Google</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome Completo do Paciente</Label>
                    <Input
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Nome do paciente ativo"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data do Contato</Label>
                    <Input
                      type="date"
                      value={dataContato}
                      onChange={(e) => setDataContato(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data do Comentário</Label>
                    <Input
                      type="date"
                      value={dataComentario}
                      onChange={(e) => setDataComentario(e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Check className="w-4 h-4 mr-2" />
                    )}
                    Salvar Lançamento
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 text-slate-500">Nenhum lançamento encontrado.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800 dark:text-slate-400">
                  <tr>
                    {isManager && <th className="px-4 py-3 rounded-tl-lg">Colaborador</th>}
                    <th className={cn('px-4 py-3', !isManager && 'rounded-tl-lg')}>Paciente</th>
                    <th className="px-4 py-3">Data Contato</th>
                    <th className="px-4 py-3">Data Comentário</th>
                    <th className="px-4 py-3">Status</th>
                    {isManager && <th className="px-4 py-3 rounded-tr-lg">Ações</th>}
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review) => {
                    const userName =
                      users.find((u) => u.id === review.usuario_id)?.nome || 'Desconhecido'
                    return (
                      <tr
                        key={review.id}
                        className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        {isManager && (
                          <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                            {userName}
                          </td>
                        )}
                        <td className="px-4 py-3">{review.paciente_nome}</td>
                        <td className="px-4 py-3">
                          {format(new Date(review.data_contato), 'dd/MM/yyyy')}
                        </td>
                        <td className="px-4 py-3">
                          {format(new Date(review.data_comentario), 'dd/MM/yyyy')}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              'px-2 py-1 text-xs font-medium rounded-full',
                              review.status === 'validado'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : review.status === 'invalidado'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
                            )}
                          >
                            {review.status.toUpperCase()}
                          </span>
                        </td>
                        {isManager && (
                          <td className="px-4 py-3 flex gap-2">
                            {review.status !== 'validado' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => handleUpdateStatus(review.id, 'validado')}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                            {review.status !== 'invalidado' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleUpdateStatus(review.id, 'invalidado')}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

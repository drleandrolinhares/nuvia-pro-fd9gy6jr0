import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Filter, Plus, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'

export default function Vendas() {
  const { toast } = useToast()
  const [avaliacoes, setAvaliacoes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [statusFilter, setStatusFilter] = useState('todos')
  const [tempFilter, setTempFilter] = useState('todas')
  const [search, setSearch] = useState('')

  const [pacientes, setPacientes] = useState<any[]>([])
  const [dentistas, setDentistas] = useState<any[]>([])
  const [crcs, setCrcs] = useState<any[]>([])

  const [formData, setFormData] = useState({
    paciente_id: '',
    dentista_avaliador_id: '',
    crc_comercial_id: '',
    valor_orcamento: '',
    tipo_tratamento: '',
    status: 'avaliacao_realizada',
    temperatura_lead: 'morno',
    proxima_data_contato: '',
  })

  const fetchAvaliacoes = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('avaliacoes')
        .select(`
          *,
          pacientes (nome),
          dentistas_avaliadores (nome),
          crc_comercial (nome)
        `)
        .order('criado_em', { ascending: false })

      if (statusFilter !== 'todos') {
        query = query.eq('status', statusFilter)
      }
      if (tempFilter !== 'todas') {
        query = query.eq('temperatura_lead', tempFilter)
      }

      const { data, error } = await query

      if (error) throw error

      let filteredData = data || []
      if (search) {
        filteredData = filteredData.filter((item: any) =>
          item.pacientes?.nome?.toLowerCase().includes(search.toLowerCase()),
        )
      }

      setAvaliacoes(filteredData)
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const fetchDependencies = async () => {
    try {
      const [pacientesRes, dentistasRes, crcsRes] = await Promise.all([
        supabase.from('pacientes').select('id, nome'),
        supabase.from('dentistas_avaliadores').select('id, nome').eq('status', 'ativo'),
        supabase.from('crc_comercial').select('id, nome').eq('status', 'ativo'),
      ])

      if (pacientesRes.data) setPacientes(pacientesRes.data)
      if (dentistasRes.data) setDentistas(dentistasRes.data)
      if (crcsRes.data) setCrcs(crcsRes.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchAvaliacoes()
    fetchDependencies()
  }, [statusFilter, tempFilter, search])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload: any = {
        paciente_id: formData.paciente_id,
        status: formData.status,
        temperatura_lead: formData.temperatura_lead,
      }

      if (formData.dentista_avaliador_id)
        payload.dentista_avaliador_id = formData.dentista_avaliador_id
      if (formData.crc_comercial_id) payload.crc_comercial_id = formData.crc_comercial_id
      if (formData.valor_orcamento) payload.valor_orcamento = Number(formData.valor_orcamento)
      if (formData.tipo_tratamento) payload.tipo_tratamento = formData.tipo_tratamento
      if (formData.proxima_data_contato)
        payload.proxima_data_contato = formData.proxima_data_contato

      const { error } = await supabase.from('avaliacoes').insert(payload)
      if (error) throw error

      toast({ title: 'Sucesso', description: 'Oportunidade cadastrada com sucesso!' })
      setIsModalOpen(false)
      fetchAvaliacoes()
      setFormData({
        paciente_id: '',
        dentista_avaliador_id: '',
        crc_comercial_id: '',
        valor_orcamento: '',
        tipo_tratamento: '',
        status: 'avaliacao_realizada',
        temperatura_lead: 'morno',
        proxima_data_contato: '',
      })
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Gestão de Vendas</h2>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nova Oportunidade
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Nova Oportunidade</DialogTitle>
                <DialogDescription>
                  Registre uma nova avaliação ou oportunidade comercial.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Paciente</Label>
                  <Select
                    value={formData.paciente_id}
                    onValueChange={(v) => setFormData({ ...formData, paciente_id: v })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {pacientes.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Avaliador</Label>
                    <Select
                      value={formData.dentista_avaliador_id}
                      onValueChange={(v) => setFormData({ ...formData, dentista_avaliador_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Opcional" />
                      </SelectTrigger>
                      <SelectContent>
                        {dentistas.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>CRC</Label>
                    <Select
                      value={formData.crc_comercial_id}
                      onValueChange={(v) => setFormData({ ...formData, crc_comercial_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Opcional" />
                      </SelectTrigger>
                      <SelectContent>
                        {crcs.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Valor Orçamento</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Ex: 5000.00"
                      value={formData.valor_orcamento}
                      onChange={(e) =>
                        setFormData({ ...formData, valor_orcamento: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Tratamento</Label>
                    <Input
                      placeholder="Ex: Implante"
                      value={formData.tipo_tratamento}
                      onChange={(e) =>
                        setFormData({ ...formData, tipo_tratamento: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(v) => setFormData({ ...formData, status: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="avaliacao_realizada">Avaliação Realizada</SelectItem>
                        <SelectItem value="em_negociacao">Em Negociação</SelectItem>
                        <SelectItem value="follow_up">Follow Up</SelectItem>
                        <SelectItem value="venda_concretizada">Venda Concretizada</SelectItem>
                        <SelectItem value="perdido">Perdido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Temperatura</Label>
                    <Select
                      value={formData.temperatura_lead}
                      onValueChange={(v) => setFormData({ ...formData, temperatura_lead: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quente">Quente</SelectItem>
                        <SelectItem value="morno">Morno</SelectItem>
                        <SelectItem value="frio">Frio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Próximo Contato</Label>
                  <Input
                    type="date"
                    value={formData.proxima_data_contato}
                    onChange={(e) =>
                      setFormData({ ...formData, proxima_data_contato: e.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Salvar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <CardTitle>Oportunidades Comerciais</CardTitle>
              <CardDescription>
                Acompanhamento de avaliações e negociações em andamento.
              </CardDescription>
            </div>
            <div className="flex gap-2 items-center flex-wrap">
              <Input
                placeholder="Buscar paciente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-[200px]"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos Status</SelectItem>
                  <SelectItem value="avaliacao_realizada">Avaliação Realizada</SelectItem>
                  <SelectItem value="em_negociacao">Em Negociação</SelectItem>
                  <SelectItem value="follow_up">Follow Up</SelectItem>
                  <SelectItem value="venda_concretizada">Venda Concretizada</SelectItem>
                </SelectContent>
              </Select>
              <Select value={tempFilter} onValueChange={setTempFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Temperatura" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="quente">Quente</SelectItem>
                  <SelectItem value="morno">Morno</SelectItem>
                  <SelectItem value="frio">Frio</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Temperatura</TableHead>
                    <TableHead>Próximo Contato</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {avaliacoes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        Nenhuma oportunidade encontrada.
                      </TableCell>
                    </TableRow>
                  ) : (
                    avaliacoes.map((av) => (
                      <TableRow key={av.id}>
                        <TableCell className="font-medium">{av.pacientes?.nome || 'N/A'}</TableCell>
                        <TableCell>
                          {av.data_avaliacao
                            ? format(new Date(av.data_avaliacao), 'dd/MM/yyyy')
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(av.valor_orcamento || 0)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={av.status === 'venda_concretizada' ? 'default' : 'secondary'}
                            className="capitalize"
                          >
                            {av.status?.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              av.temperatura_lead === 'quente'
                                ? 'text-red-500 border-red-500'
                                : av.temperatura_lead === 'morno'
                                  ? 'text-amber-500 border-amber-500'
                                  : 'text-blue-500 border-blue-500'
                            }
                          >
                            {av.temperatura_lead}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {av.proxima_data_contato
                            ? format(new Date(av.proxima_data_contato), 'dd/MM/yyyy')
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

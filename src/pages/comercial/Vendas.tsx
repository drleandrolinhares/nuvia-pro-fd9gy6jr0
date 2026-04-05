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
import { Textarea } from '@/components/ui/textarea'
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

  const [isCreatingPaciente, setIsCreatingPaciente] = useState(false)

  const initialFormState = {
    paciente_id: '',
    novo_paciente_nome: '',
    telefone: '',
    data_avaliacao: format(new Date(), 'yyyy-MM-dd'),
    dentista_avaliador_id: '',
    crc_comercial_id: '',
    valor_orcamento: '',
    tipo_tratamento: '',
    observacoes: '',
    status: 'avaliacao_realizada',
    temperatura_lead: 'morno',
  }

  const [formData, setFormData] = useState(initialFormState)

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
        supabase.from('pacientes').select('id, nome, telefone').order('nome'),
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

  const handlePacienteChange = (val: string) => {
    const p = pacientes.find((x) => x.id === val)
    setFormData({
      ...formData,
      paciente_id: val,
      telefone: p?.telefone || '',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      let currentPacienteId = formData.paciente_id

      if (isCreatingPaciente) {
        if (!formData.novo_paciente_nome) throw new Error('Nome do paciente é obrigatório')
        const { data: newPaciente, error: pacError } = await supabase
          .from('pacientes')
          .insert({
            nome: formData.novo_paciente_nome,
            telefone: formData.telefone,
          })
          .select('id')
          .single()

        if (pacError) throw pacError
        currentPacienteId = newPaciente.id
      } else {
        if (!currentPacienteId) throw new Error('Selecione um paciente ou crie um novo')
      }

      const payload: any = {
        paciente_id: currentPacienteId,
        dentista_avaliador_id: formData.dentista_avaliador_id,
        crc_comercial_id: formData.crc_comercial_id,
        data_avaliacao: formData.data_avaliacao,
        valor_orcamento: Number(formData.valor_orcamento),
        tipo_tratamento: formData.tipo_tratamento,
        observacoes: formData.observacoes,
        status: formData.status,
        temperatura_lead: formData.temperatura_lead,
      }

      const { error } = await supabase.from('avaliacoes').insert(payload)
      if (error) throw error

      toast({ title: 'Sucesso', description: 'Avaliação cadastrada com sucesso!' })
      setIsModalOpen(false)
      fetchAvaliacoes()
      fetchDependencies()
      setFormData(initialFormState)
      setIsCreatingPaciente(false)
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
        <Dialog
          open={isModalOpen}
          onOpenChange={(open) => {
            setIsModalOpen(open)
            if (!open) {
              setFormData(initialFormState)
              setIsCreatingPaciente(false)
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nova Oportunidade
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Nova Avaliação</DialogTitle>
                <DialogDescription>
                  Registre uma nova avaliação ou oportunidade comercial.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>
                    Paciente <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex items-center gap-2">
                    {!isCreatingPaciente ? (
                      <Select
                        value={formData.paciente_id}
                        onValueChange={handlePacienteChange}
                        required
                      >
                        <SelectTrigger className="flex-1">
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
                    ) : (
                      <Input
                        placeholder="Nome do novo paciente"
                        value={formData.novo_paciente_nome}
                        onChange={(e) =>
                          setFormData({ ...formData, novo_paciente_nome: e.target.value })
                        }
                        required
                        className="flex-1"
                      />
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsCreatingPaciente(!isCreatingPaciente)
                        setFormData({
                          ...formData,
                          paciente_id: '',
                          novo_paciente_nome: '',
                          telefone: '',
                        })
                      }}
                    >
                      {isCreatingPaciente ? 'Cancelar' : 'Novo Paciente'}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>
                      Telefone <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="tel"
                      placeholder="Ex: (11) 99999-9999"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>
                      Data da Avaliação <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="date"
                      value={formData.data_avaliacao}
                      onChange={(e) => setFormData({ ...formData, data_avaliacao: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>
                      Dentista Avaliador <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.dentista_avaliador_id}
                      onValueChange={(v) => setFormData({ ...formData, dentista_avaliador_id: v })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
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
                    <Label>
                      CRC Responsável <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.crc_comercial_id}
                      onValueChange={(v) => setFormData({ ...formData, crc_comercial_id: v })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
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
                    <Label>
                      Valor do Orçamento <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Ex: 5000.00"
                      value={formData.valor_orcamento}
                      onChange={(e) =>
                        setFormData({ ...formData, valor_orcamento: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>
                      Tipo de Tratamento <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.tipo_tratamento}
                      onValueChange={(v) => setFormData({ ...formData, tipo_tratamento: v })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ortodontia">Ortodontia</SelectItem>
                        <SelectItem value="implante">Implante</SelectItem>
                        <SelectItem value="protese">Prótese</SelectItem>
                        <SelectItem value="estetica">Estética</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>
                    Observações <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    placeholder="Descreva os detalhes da avaliação..."
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    required
                    rows={3}
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
                    <TableHead>Data Avaliação</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Temperatura</TableHead>
                    <TableHead>Próximo Contato</TableHead>
                    <TableHead>Responsável</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {avaliacoes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
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
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {av.crc_comercial?.nome || av.dentistas_avaliadores?.nome || '-'}
                          </span>
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

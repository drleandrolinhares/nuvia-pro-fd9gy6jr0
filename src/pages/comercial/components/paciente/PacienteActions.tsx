import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import {
  Edit,
  DollarSign,
  Phone,
  Calendar,
  Thermometer,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react'

export function PacienteActions({
  pacienteId,
  onUpdate,
}: {
  pacienteId: string
  onUpdate: () => void
}) {
  const { profile } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [avaliacao, setAvaliacao] = useState<any>(null)

  const fetchAvaliacao = async () => {
    const { data } = await supabase
      .from('avaliacoes')
      .select('*')
      .eq('paciente_id', pacienteId)
      .order('data_avaliacao', { ascending: false })
      .limit(1)
      .single()
    setAvaliacao(data)
  }

  // Lists
  const [dentistas, setDentistas] = useState<any[]>([])
  const [crcs, setCrcs] = useState<any[]>([])
  const [usuarios, setUsuarios] = useState<any[]>([])

  // Modal States
  const [openEditAval, setOpenEditAval] = useState(false)
  const [openAddOrc, setOpenAddOrc] = useState(false)
  const [openContato, setOpenContato] = useState(false)
  const [openFollowUp, setOpenFollowUp] = useState(false)
  const [openConcretizar, setOpenConcretizar] = useState(false)
  const [openPerdido, setOpenPerdido] = useState(false)

  // Form States
  const [formAval, setFormAval] = useState<any>({})
  const [formOrc, setFormOrc] = useState({
    valor: '',
    data_orcamento: format(new Date(), 'yyyy-MM-dd'),
    ordem: '1',
  })
  const [formContato, setFormContato] = useState({ canal: '', resultado: '', resumo: '', obs: '' })
  const [formFollowUp, setFormFollowUp] = useState({
    data: '',
    hora: '',
    responsavel: profile?.id || '',
    obs: '',
  })
  const [formVenda, setFormVenda] = useState({ valor_total: '', percentual: '0', entrada: '0' })
  const [motivoPerdido, setMotivoPerdido] = useState('')

  useEffect(() => {
    if (pacienteId) fetchAvaliacao()
  }, [pacienteId])

  useEffect(() => {
    supabase
      .from('dentistas_avaliadores')
      .select('id, nome')
      .eq('status', 'ativo')
      .then(({ data }) => setDentistas(data || []))
    supabase
      .from('crc_comercial')
      .select('id, nome')
      .eq('status', 'ativo')
      .then(({ data }) => setCrcs(data || []))
    supabase
      .from('usuarios')
      .select('id, nome')
      .eq('status', 'ativo')
      .then(({ data }) => setUsuarios(data || []))
  }, [])

  useEffect(() => {
    if (openEditAval && avaliacao) {
      setFormAval({
        data_avaliacao: avaliacao.data_avaliacao || '',
        dentista_avaliador_id: avaliacao.dentista_avaliador_id || '',
        crc_comercial_id: avaliacao.crc_comercial_id || '',
        valor_orcamento: avaliacao.valor_orcamento || '',
        tipo_tratamento: avaliacao.tipo_tratamento || '',
        observacoes: avaliacao.observacoes || '',
      })
    }
  }, [openEditAval, avaliacao])

  useEffect(() => {
    if (openConcretizar && avaliacao) {
      setFormVenda({
        valor_total: avaliacao.valor_orcamento?.toString() || '',
        percentual: '30',
        entrada: ((avaliacao.valor_orcamento || 0) * 0.3).toFixed(2),
      })
    }
  }, [openConcretizar, avaliacao])

  const handlePercentualChange = (pct: string) => {
    const vTotal = Number(formVenda.valor_total) || 0
    const p = Number(pct) || 0
    setFormVenda({ ...formVenda, percentual: pct, entrada: ((vTotal * p) / 100).toFixed(2) })
  }

  const handleValorTotalChange = (val: string) => {
    const vTotal = Number(val) || 0
    const p = Number(formVenda.percentual) || 0
    setFormVenda({ ...formVenda, valor_total: val, entrada: ((vTotal * p) / 100).toFixed(2) })
  }

  const execUpdate = () => {
    fetchAvaliacao()
    onUpdate()
  }

  const handleSaveAvaliacao = async () => {
    setLoading(true)
    const { error } = await supabase
      .from('avaliacoes')
      .update({
        data_avaliacao: formAval.data_avaliacao,
        dentista_avaliador_id: formAval.dentista_avaliador_id,
        crc_comercial_id: formAval.crc_comercial_id,
        valor_orcamento: Number(formAval.valor_orcamento),
        tipo_tratamento: formAval.tipo_tratamento,
        observacoes: formAval.observacoes,
      })
      .eq('id', avaliacao.id)
    setLoading(false)
    if (error) return toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    toast({ title: 'Sucesso', description: 'Avaliação atualizada.' })
    setOpenEditAval(false)
    execUpdate()
  }

  const handleSaveOrcamento = async () => {
    setLoading(true)
    const { error } = await supabase.from('orcamentos').insert({
      avaliacao_id: avaliacao.id,
      valor: Number(formOrc.valor),
      data_orcamento: formOrc.data_orcamento,
      ordem: Number(formOrc.ordem),
    })
    setLoading(false)
    if (error) return toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    toast({ title: 'Sucesso', description: 'Orçamento adicionado.' })
    setOpenAddOrc(false)
    execUpdate()
  }

  const handleSaveContato = async () => {
    setLoading(true)
    const { error } = await supabase.from('contatos_follow_up').insert({
      avaliacao_id: avaliacao.id,
      data_contato: new Date().toISOString(),
      responsavel_id: profile?.id,
      canal: formContato.canal,
      resultado: formContato.resultado,
      resumo_conversa: formContato.resumo,
      observacoes: formContato.obs,
    })
    setLoading(false)
    if (error) return toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    toast({ title: 'Sucesso', description: 'Contato registrado.' })
    setOpenContato(false)
    execUpdate()
  }

  const handleSaveFollowUp = async () => {
    setLoading(true)
    const dataHora = new Date(
      `${formFollowUp.data}T${formFollowUp.hora || '00:00'}:00`,
    ).toISOString()
    const { error } = await supabase.from('contatos_follow_up').insert({
      avaliacao_id: avaliacao.id,
      data_contato: dataHora,
      responsavel_id: formFollowUp.responsavel,
      observacoes: formFollowUp.obs,
    })
    setLoading(false)
    if (error) return toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    toast({ title: 'Sucesso', description: 'Follow-up agendado.' })
    setOpenFollowUp(false)
    execUpdate()
  }

  const handleSetTemp = async (temp: string) => {
    const { error } = await supabase
      .from('avaliacoes')
      .update({ temperatura_lead: temp })
      .eq('id', avaliacao.id)
    if (error) return toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    toast({ title: 'Temperatura atualizada', description: `Nova temperatura: ${temp}` })
    execUpdate()
  }

  const handleConcretizar = async () => {
    setLoading(true)
    const { error } = await supabase.from('vendas_concretizadas').insert({
      avaliacao_id: avaliacao.id,
      valor_total_tratamento: Number(formVenda.valor_total),
      percentual_entrada: Number(formVenda.percentual),
      valor_entrada: Number(formVenda.entrada),
      dentista_avaliador_id: avaliacao.dentista_avaliador_id,
      crc_comercial_id: avaliacao.crc_comercial_id,
      crc_participou: !!avaliacao.crc_comercial_id,
    })
    if (!error) {
      await supabase
        .from('avaliacoes')
        .update({ status: 'venda_concretizada' })
        .eq('id', avaliacao.id)
      toast({ title: 'Parabéns!', description: 'Venda concretizada com sucesso.' })
      setOpenConcretizar(false)
      execUpdate()
    } else {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    }
    setLoading(false)
  }

  const handlePerdido = async () => {
    setLoading(true)
    const novoObs = avaliacao.observacoes
      ? `${avaliacao.observacoes}\nMotivo perda: ${motivoPerdido}`
      : `Motivo perda: ${motivoPerdido}`
    const { error } = await supabase
      .from('avaliacoes')
      .update({ status: 'perdido', observacoes: novoObs })
      .eq('id', avaliacao.id)
    setLoading(false)
    if (error) return toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    toast({ title: 'Status Atualizado', description: 'Oportunidade marcada como perdida.' })
    setOpenPerdido(false)
    execUpdate()
  }

  const canAction = profile?.role === 'admin' || profile?.role === 'crc_comercial'
  if (!canAction || !avaliacao) return null

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 p-4 bg-muted/30 border rounded-lg shadow-sm">
        <span className="text-sm font-medium text-muted-foreground mr-2">
          Ações da Oportunidade:
        </span>
        <Button variant="outline" size="sm" onClick={() => setOpenEditAval(true)}>
          <Edit className="w-4 h-4 mr-2" /> Editar Avaliação
        </Button>
        <Button variant="outline" size="sm" onClick={() => setOpenAddOrc(true)}>
          <DollarSign className="w-4 h-4 mr-2" /> Adicionar Orçamento
        </Button>
        <Button variant="outline" size="sm" onClick={() => setOpenContato(true)}>
          <Phone className="w-4 h-4 mr-2" /> Registrar Contato
        </Button>
        <Button variant="outline" size="sm" onClick={() => setOpenFollowUp(true)}>
          <Calendar className="w-4 h-4 mr-2" /> Agendar Follow-up
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Thermometer className="w-4 h-4 mr-2" /> Temp. Lead
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleSetTemp('quente')}>🔥 Quente</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSetTemp('morno')}>☀️ Morno</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSetTemp('frio')}>❄️ Frio</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          className="bg-green-600 hover:bg-green-700 text-white"
          size="sm"
          onClick={() => setOpenConcretizar(true)}
        >
          <CheckCircle className="w-4 h-4 mr-2" /> Concretizar Venda
        </Button>
        <Button variant="destructive" size="sm" onClick={() => setOpenPerdido(true)}>
          <XCircle className="w-4 h-4 mr-2" /> Marcar Perdido
        </Button>
      </div>

      {/* 1. Editar Avaliação */}
      <Dialog open={openEditAval} onOpenChange={setOpenEditAval}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Avaliação</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={formAval.data_avaliacao}
                  onChange={(e) => setFormAval({ ...formAval, data_avaliacao: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Valor</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formAval.valor_orcamento}
                  onChange={(e) => setFormAval({ ...formAval, valor_orcamento: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Dentista</Label>
                <Select
                  value={formAval.dentista_avaliador_id}
                  onValueChange={(v) => setFormAval({ ...formAval, dentista_avaliador_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
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
                  value={formAval.crc_comercial_id}
                  onValueChange={(v) => setFormAval({ ...formAval, crc_comercial_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
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
            <div className="grid gap-2">
              <Label>Tratamento</Label>
              <Select
                value={formAval.tipo_tratamento}
                onValueChange={(v) => setFormAval({ ...formAval, tipo_tratamento: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
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
            <div className="grid gap-2">
              <Label>Observações</Label>
              <Textarea
                value={formAval.observacoes}
                onChange={(e) => setFormAval({ ...formAval, observacoes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEditAval(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveAvaliacao} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. Adicionar Orçamento */}
      <Dialog open={openAddOrc} onOpenChange={setOpenAddOrc}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Orçamento</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Valor Total</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formOrc.valor}
                  onChange={(e) => setFormOrc({ ...formOrc, valor: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={formOrc.data_orcamento}
                  onChange={(e) => setFormOrc({ ...formOrc, data_orcamento: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Ordem (Ex: 1 para principal, 2 para alternativo)</Label>
              <Input
                type="number"
                value={formOrc.ordem}
                onChange={(e) => setFormOrc({ ...formOrc, ordem: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenAddOrc(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveOrcamento} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3. Registrar Contato */}
      <Dialog open={openContato} onOpenChange={setOpenContato}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Contato</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Canal</Label>
                <Select
                  value={formContato.canal}
                  onValueChange={(v) => setFormContato({ ...formContato, canal: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                    <SelectItem value="Telefone">Telefone</SelectItem>
                    <SelectItem value="Presencial">Presencial</SelectItem>
                    <SelectItem value="Email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Resultado</Label>
                <Select
                  value={formContato.resultado}
                  onValueChange={(v) => setFormContato({ ...formContato, resultado: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Atendeu">Atendeu</SelectItem>
                    <SelectItem value="Não Atendeu">Não Atendeu</SelectItem>
                    <SelectItem value="Sem Interesse">Sem Interesse</SelectItem>
                    <SelectItem value="Agendou Retorno">Agendou Retorno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Resumo da Conversa</Label>
              <Textarea
                value={formContato.resumo}
                onChange={(e) => setFormContato({ ...formContato, resumo: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Observações Internas</Label>
              <Textarea
                value={formContato.obs}
                onChange={(e) => setFormContato({ ...formContato, obs: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenContato(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveContato} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 4. Agendar Follow-up */}
      <Dialog open={openFollowUp} onOpenChange={setOpenFollowUp}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agendar Follow-up</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={formFollowUp.data}
                  onChange={(e) => setFormFollowUp({ ...formFollowUp, data: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Hora (opcional)</Label>
                <Input
                  type="time"
                  value={formFollowUp.hora}
                  onChange={(e) => setFormFollowUp({ ...formFollowUp, hora: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Responsável</Label>
              <Select
                value={formFollowUp.responsavel}
                onValueChange={(v) => setFormFollowUp({ ...formFollowUp, responsavel: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {usuarios.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Observações do Agendamento</Label>
              <Textarea
                value={formFollowUp.obs}
                onChange={(e) => setFormFollowUp({ ...formFollowUp, obs: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenFollowUp(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveFollowUp} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 6. Concretizar Venda */}
      <Dialog open={openConcretizar} onOpenChange={setOpenConcretizar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Concretizar Venda</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Valor Total do Tratamento</Label>
              <Input
                type="number"
                step="0.01"
                value={formVenda.valor_total}
                onChange={(e) => handleValorTotalChange(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Percentual de Entrada (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formVenda.percentual}
                  onChange={(e) => handlePercentualChange(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Valor da Entrada</Label>
                <Input type="number" step="0.01" value={formVenda.entrada} disabled />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenConcretizar(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleConcretizar}
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={loading}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Confirmar Venda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 7. Marcar como Perdido */}
      <Dialog open={openPerdido} onOpenChange={setOpenPerdido}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar como Perdido</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Motivo da perda</Label>
              <Textarea
                placeholder="Descreva por que a venda não foi fechada..."
                value={motivoPerdido}
                onChange={(e) => setMotivoPerdido(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenPerdido(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handlePerdido} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

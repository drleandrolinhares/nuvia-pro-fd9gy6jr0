import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Loader2, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/supabase/client'

interface Props {
  dentistas: any[]
  crcs: any[]
  onSuccess: () => void
}

const initialForm = {
  tipo_lancamento: 'oportunidade',
  paciente_id: '',
  novo_paciente_nome: '',
  telefone: '',
  data_avaliacao: format(new Date(), 'yyyy-MM-dd'),
  dentista_avaliador_id: '',
  crc_comercial_id: '',
  valor_orcamento: '',
  valor_entrada: '',
  destino_fiscal: 'PESSOA FISICA',
  forma_pagamento: 'Pix',
  destino_pagamento: 'SICOOB PF 16004-0',
  tipo_tratamento: 'outro',
  observacoes: '',
  status: 'avaliacao_realizada',
  temperatura_lead: 'morno',
}

export function VendasModal({ dentistas, crcs, onSuccess }: Props) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [pacientes, setPacientes] = useState<any[]>([])
  const [avaliadores, setAvaliadores] = useState<any[]>([])
  const [crcsList, setCrcsList] = useState<any[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState(initialForm)

  useEffect(() => {
    if (open) {
      supabase
        .from('pacientes')
        .select('id, nome, telefone')
        .order('nome')
        .then(({ data }) => {
          if (data) setPacientes(data)
        })
      supabase
        .from('dentistas_avaliadores')
        .select('id, nome, especialidade')
        .order('nome')
        .then(({ data }) => {
          if (data) setAvaliadores(data)
        })
      supabase
        .from('crc_comercial')
        .select('id, nome')
        .order('nome')
        .then(({ data }) => {
          if (data) setCrcsList(data)
        })
    } else {
      setFormData(initialForm)
      setIsCreating(false)
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      let currentPacienteId = formData.paciente_id

      if (isCreating) {
        if (!formData.novo_paciente_nome) throw new Error('Nome do paciente obrigatório')
        const { data, error } = await supabase
          .from('pacientes')
          .insert({ nome: formData.novo_paciente_nome, telefone: formData.telefone })
          .select('id')
          .single()
        if (error) throw error
        currentPacienteId = data.id
      } else if (!currentPacienteId) throw new Error('Selecione um paciente')

      if (!formData.data_avaliacao) throw new Error('Data da venda é obrigatória')
      if (!formData.dentista_avaliador_id) throw new Error('Selecione o Dentista Avaliador')
      if (!formData.crc_comercial_id) throw new Error('Selecione o CRC Comercial')
      if (!formData.valor_orcamento) throw new Error('Informe o valor do tratamento')
      if (!formData.valor_entrada) throw new Error('Informe o valor da entrada')

      const payload: any = {
        paciente_id: currentPacienteId,
        dentista_avaliador_id: formData.dentista_avaliador_id,
        crc_comercial_id: formData.crc_comercial_id,
        data_avaliacao: formData.data_avaliacao,
        valor_orcamento: Number(formData.valor_orcamento),
        valor_entrada: Number(formData.valor_entrada),
        destino_fiscal: formData.destino_fiscal,
        tipo_tratamento: formData.tipo_tratamento,
        observacoes: formData.observacoes,
        status:
          formData.tipo_lancamento === 'venda_concretizada'
            ? 'venda_concretizada'
            : formData.status,
        temperatura_lead: formData.temperatura_lead,
      }

      const { error } = await supabase.from('avaliacoes').insert(payload)
      if (error) throw error

      const pNome = isCreating
        ? formData.novo_paciente_nome
        : pacientes.find((x) => x.id === currentPacienteId)?.nome

      if (formData.tipo_lancamento === 'venda_concretizada') {
        await supabase.from('vendas_diarias').insert({
          crc_comercial_id: formData.crc_comercial_id,
          dentista_avaliador_id: formData.dentista_avaliador_id,
          data_venda: formData.data_avaliacao,
          valor: Number(formData.valor_entrada),
          valor_tratamento: Number(formData.valor_orcamento),
          destino_fiscal: formData.destino_fiscal,
          forma_pagamento: formData.forma_pagamento,
          destino_pagamento: formData.destino_pagamento,
          paciente_nome: pNome || 'Paciente Cadastrado',
        })
      }

      toast({
        title: 'Sucesso',
        description:
          formData.tipo_lancamento === 'venda_concretizada'
            ? 'Venda cadastrada com sucesso!'
            : 'Oportunidade cadastrada com sucesso!',
      })
      setOpen(false)
      onSuccess()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Lançar Venda
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Lançar Venda / Avaliação</DialogTitle>
            <DialogDescription>Registre uma nova venda centralizada no sistema.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2 bg-slate-100 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 mb-2">
              <Label className="text-base font-semibold text-slate-800 dark:text-slate-200">
                Tipo de Lançamento *
              </Label>
              <Select
                value={formData.tipo_lancamento}
                onValueChange={(v) => setFormData({ ...formData, tipo_lancamento: v })}
                required
              >
                <SelectTrigger className="bg-white dark:bg-slate-900 border-amber-500/50 focus:ring-amber-500">
                  <SelectValue placeholder="Selecione o tipo..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="oportunidade"
                    className="font-medium text-blue-600 dark:text-blue-400"
                  >
                    🎯 Oportunidade (Follow-up)
                  </SelectItem>
                  <SelectItem
                    value="venda_concretizada"
                    className="font-medium text-emerald-600 dark:text-emerald-400"
                  >
                    💰 Venda Concretizada
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Paciente *</Label>
                <div className="flex gap-2">
                  {!isCreating ? (
                    <Select
                      value={formData.paciente_id}
                      onValueChange={(v) => {
                        const p = pacientes.find((x) => x.id === v)
                        setFormData({ ...formData, paciente_id: v, telefone: p?.telefone || '' })
                      }}
                      required
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Selecione..." />
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
                      placeholder="Nome do paciente"
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
                    onClick={() => setIsCreating(!isCreating)}
                  >
                    {isCreating ? 'Cancelar' : 'Novo'}
                  </Button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Telefone *</Label>
                <Input
                  required
                  type="tel"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Data da Venda *</Label>
                <Input
                  required
                  type="date"
                  value={formData.data_avaliacao}
                  onChange={(e) => setFormData({ ...formData, data_avaliacao: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Avaliador *</Label>
                <Select
                  value={formData.dentista_avaliador_id}
                  onValueChange={(v) => setFormData({ ...formData, dentista_avaliador_id: v })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {avaliadores.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>CRC *</Label>
                <Select
                  value={formData.crc_comercial_id}
                  onValueChange={(v) => setFormData({ ...formData, crc_comercial_id: v })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {crcsList.map((c) => (
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
                <Label>Valor do Tratamento *</Label>
                <Input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valor_orcamento}
                  onChange={(e) => setFormData({ ...formData, valor_orcamento: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Valor da Entrada *</Label>
                <Input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valor_entrada}
                  onChange={(e) => setFormData({ ...formData, valor_entrada: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Forma de Pgto *</Label>
                <Select
                  value={formData.forma_pagamento}
                  onValueChange={(v) => setFormData({ ...formData, forma_pagamento: v })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pix">Pix</SelectItem>
                    <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="Crédito">Crédito</SelectItem>
                    <SelectItem value="Débito">Débito</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                    <SelectItem value="Transferência">Transferência</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Destino Pgto *</Label>
                <Select
                  value={formData.destino_pagamento}
                  onValueChange={(v) => setFormData({ ...formData, destino_pagamento: v })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SICOOB PF 16004-0">SICOOB PF 16004-0</SelectItem>
                    <SelectItem value="SANTANDER PJ VO">SANTANDER PJ VO</SelectItem>
                    <SelectItem value="SICOOB PJ SFO">SICOOB PJ SFO</SelectItem>
                    <SelectItem value="EM MÃOS">EM MÃOS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Destino Fiscal *</Label>
                <Select
                  value={formData.destino_fiscal}
                  onValueChange={(v) => setFormData({ ...formData, destino_fiscal: v })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PESSOA FISICA">PESSOA FISICA</SelectItem>
                    <SelectItem value="VITALI ODONTOLOGIA">VITALI ODONTOLOGIA</SelectItem>
                    <SelectItem value="SOUZA FILHO ODONTOLOGIA">SOUZA FILHO ODONTOLOGIA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Tratamento *</Label>
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
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

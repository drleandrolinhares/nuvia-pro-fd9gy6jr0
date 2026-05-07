import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Loader2, Plus, CheckCircle2 } from 'lucide-react'
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
  dentistas?: any[]
  crcs?: any[]
  onSuccess: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  prefilledData?: {
    telefone?: string
    nome?: string
    origem_id?: string
    lead_id?: string
  }
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
  origem_id: '',
  observacoes: '',
  status: 'avaliacao_realizada',
  temperatura_lead: 'morno',
}

export function VendasModal({
  dentistas,
  crcs,
  onSuccess,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  prefilledData,
}: Props) {
  const { toast } = useToast()
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen
  const setOpen = isControlled ? setControlledOpen : setUncontrolledOpen

  const [saving, setSaving] = useState(false)
  const [searchingPhone, setSearchingPhone] = useState(false)

  const [avaliadoresList, setAvaliadoresList] = useState<any[]>(dentistas || [])
  const [crcsList, setCrcsList] = useState<any[]>(crcs || [])
  const [origensList, setOrigensList] = useState<any[]>([])

  const [formData, setFormData] = useState(initialForm)

  useEffect(() => {
    if (dentistas && dentistas.length > 0) setAvaliadoresList(dentistas)
  }, [dentistas])

  useEffect(() => {
    if (crcs && crcs.length > 0) setCrcsList(crcs)
  }, [crcs])

  useEffect(() => {
    if (open) {
      // Sempre buscar para garantir dados atualizados e contornar filtros incorretos do componente pai
      supabase
        .from('dentistas_avaliadores')
        .select('id, nome, especialidade')
        .or('status.eq.ativo,status.eq.Ativo,status.is.null')
        .order('nome')
        .then(({ data }) => {
          if (data) setAvaliadoresList(data)
        })

      supabase
        .from('crc_comercial')
        .select('id, nome')
        .or('status.eq.ativo,status.eq.Ativo,status.is.null')
        .order('nome')
        .then(({ data }) => {
          if (data) setCrcsList(data)
        })
      supabase
        .from('funil_origens')
        .select('id, nome')
        .eq('ativo', true)
        .order('ordem')
        .then(({ data }) => {
          if (data) setOrigensList(data)
        })

      if (prefilledData) {
        setFormData((prev) => ({
          ...prev,
          telefone: prefilledData.telefone || prev.telefone,
          novo_paciente_nome: prefilledData.nome || prev.novo_paciente_nome,
          origem_id: prefilledData.origem_id || prev.origem_id,
        }))
        if (prefilledData.telefone) {
          supabase
            .from('pacientes')
            .select('id, nome')
            .eq('telefone', prefilledData.telefone)
            .maybeSingle()
            .then(({ data }) => {
              if (data)
                setFormData((prev) => ({
                  ...prev,
                  paciente_id: data.id,
                  novo_paciente_nome: data.nome,
                }))
            })
        }
      }
    } else {
      if (!isControlled) setFormData(initialForm)
    }
  }, [open, prefilledData])

  const handlePhoneSearch = async () => {
    if (!formData.telefone || formData.telefone.length < 8) return
    setSearchingPhone(true)
    try {
      let pId = ''
      let pNome = formData.novo_paciente_nome
      let oId = formData.origem_id

      const { data: pac } = await supabase
        .from('pacientes')
        .select('id, nome')
        .eq('telefone', formData.telefone)
        .maybeSingle()
      if (pac) {
        pId = pac.id
        pNome = pac.nome
        toast({ title: 'Paciente vinculado automaticamente!' })
      }

      const { data: lead } = await supabase
        .from('funil_leads')
        .select('origem_id, nome')
        .eq('telefone', formData.telefone)
        .order('criado_em', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (lead) {
        if (!pId && !pNome) pNome = lead.nome
        if (lead.origem_id && !oId) oId = lead.origem_id
      }

      setFormData((prev) => ({
        ...prev,
        paciente_id: pId,
        novo_paciente_nome: pNome,
        origem_id: oId,
      }))
    } catch (e) {
      console.error(e)
    } finally {
      setSearchingPhone(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      let currentPacienteId = formData.paciente_id

      if (!currentPacienteId) {
        if (!formData.novo_paciente_nome) throw new Error('Nome do paciente obrigatório')
        const { data, error } = await supabase
          .from('pacientes')
          .insert({ nome: formData.novo_paciente_nome, telefone: formData.telefone })
          .select('id')
          .single()
        if (error) throw error
        currentPacienteId = data.id
      }

      if (!formData.data_avaliacao) throw new Error('Data da venda é obrigatória')
      if (!formData.dentista_avaliador_id) throw new Error('Selecione o Dentista Avaliador')
      if (!formData.crc_comercial_id) throw new Error('Selecione o CRC Comercial')
      if (!formData.valor_orcamento) throw new Error('Informe o valor do tratamento')
      if (!formData.valor_entrada) throw new Error('Informe o valor da entrada')
      if (!formData.origem_id) throw new Error('Selecione a Origem do Paciente')

      const payload: any = {
        paciente_id: currentPacienteId,
        dentista_avaliador_id: formData.dentista_avaliador_id,
        crc_comercial_id: formData.crc_comercial_id,
        data_avaliacao: formData.data_avaliacao,
        valor_orcamento: Number(formData.valor_orcamento),
        valor_entrada: Number(formData.valor_entrada),
        destino_fiscal: formData.destino_fiscal,
        origem_id: formData.origem_id,
        observacoes: formData.observacoes,
        status:
          formData.tipo_lancamento === 'venda_concretizada'
            ? 'venda_concretizada'
            : formData.status,
        temperatura_lead: formData.temperatura_lead,
      }

      const { error } = await supabase.from('avaliacoes').insert(payload)
      if (error) throw error

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
          paciente_nome: formData.novo_paciente_nome || 'Paciente Cadastrado',
          origem_id: formData.origem_id,
        })
      }

      const { data: existingLead } = await supabase
        .from('funil_leads')
        .select('id')
        .eq('telefone', formData.telefone)
        .order('criado_em', { ascending: false })
        .limit(1)
        .maybeSingle()

      const leadStatus = formData.tipo_lancamento === 'venda_concretizada' ? 'fechado' : 'atendido'

      if (existingLead) {
        await supabase
          .from('funil_leads')
          .update({
            status: leadStatus,
            origem_id: formData.origem_id,
            nome: formData.novo_paciente_nome,
          })
          .eq('id', existingLead.id)
      } else {
        await supabase.from('funil_leads').insert({
          nome: formData.novo_paciente_nome,
          telefone: formData.telefone,
          origem_id: formData.origem_id,
          mes_referencia: format(new Date(), 'yyyy-MM'),
          status: leadStatus,
          temperatura: formData.temperatura_lead,
        })
      }

      toast({
        title: 'Sucesso',
        description:
          formData.tipo_lancamento === 'venda_concretizada'
            ? 'Venda cadastrada com sucesso!'
            : 'Oportunidade cadastrada com sucesso!',
      })

      if (!isControlled) {
        setFormData(initialForm)
      }
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
      {!isControlled && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Lançar Venda
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Lançar Venda / Avaliação</DialogTitle>
            <DialogDescription>
              Registre uma nova venda centralizada no sistema e no funil.
            </DialogDescription>
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
                <Label>Telefone *</Label>
                <div className="relative">
                  <Input
                    required
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    onBlur={handlePhoneSearch}
                    disabled={saving || searchingPhone}
                  />
                  {searchingPhone && (
                    <Loader2 className="absolute right-2 top-2 h-4 w-4 animate-spin text-slate-400" />
                  )}
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Paciente *</Label>
                <Input
                  placeholder="Nome do paciente"
                  value={formData.novo_paciente_nome}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      novo_paciente_nome: e.target.value,
                      paciente_id: '',
                    })
                  }
                  required
                  disabled={saving}
                />
                {formData.paciente_id && (
                  <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3 h-3" /> Paciente vinculado
                  </span>
                )}
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
                    {avaliadoresList.map((d) => (
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
              <Label>Origem do Paciente *</Label>
              <Select
                value={formData.origem_id}
                onValueChange={(v) => setFormData({ ...formData, origem_id: v })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a origem..." />
                </SelectTrigger>
                <SelectContent>
                  {origensList.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.nome}
                    </SelectItem>
                  ))}
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

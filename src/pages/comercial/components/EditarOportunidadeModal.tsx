import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/supabase/client'
import { Loader2, Trash2 } from 'lucide-react'
import { Avaliacao } from '../types'
import { useAuth } from '@/hooks/use-auth'

interface Props {
  isOpen: boolean
  onClose: () => void
  avaliacao: Avaliacao | null
  dentistas: any[]
  crcs: any[]
  onSuccess: () => void
}

export function EditarOportunidadeModal({
  isOpen,
  onClose,
  avaliacao,
  dentistas,
  crcs,
  onSuccess,
}: Props) {
  const { toast } = useToast()
  const { profile } = useAuth()
  const [saving, setSaving] = useState(false)
  const [origens, setOrigens] = useState<any[]>([])

  const isAdmin = profile?.role === 'admin'
  const [hasVenda, setHasVenda] = useState(false)

  const [formData, setFormData] = useState({
    data_avaliacao: '',
    data_fechamento: '',
    valor_orcamento: '',
    valor_entrada: '',
    dentista_avaliador_id: '',
    crc_comercial_id: '',
    origem_id: '',
    destino_fiscal: '',
    status: '',
    temperatura_lead: '',
  })

  useEffect(() => {
    supabase
      .from('funil_origens')
      .select('id, nome')
      .eq('ativo', true)
      .order('ordem')
      .then(({ data }) => setOrigens(data || []))
  }, [])

  useEffect(() => {
    if (avaliacao && isOpen) {
      supabase
        .from('vendas_confirmadas')
        .select('id')
        .eq('oportunidade_id', avaliacao.id)
        .then(({ data }) => {
          setHasVenda(!!(data && data.length > 0))
        })

      setFormData({
        data_avaliacao: avaliacao.data_avaliacao ? avaliacao.data_avaliacao.substring(0, 10) : '',
        data_fechamento: avaliacao.data_fechamento
          ? avaliacao.data_fechamento.substring(0, 10)
          : '',
        valor_orcamento: avaliacao.valor_orcamento ? String(avaliacao.valor_orcamento) : '',
        valor_entrada: avaliacao.valor_entrada ? String(avaliacao.valor_entrada) : '',
        dentista_avaliador_id: avaliacao.dentista_avaliador_id || '',
        crc_comercial_id: avaliacao.crc_comercial_id || '',
        origem_id: avaliacao.origem_id || '',
        destino_fiscal: avaliacao.destino_fiscal || '',
        status: avaliacao.status || '',
        temperatura_lead: avaliacao.temperatura_lead || '',
      })
    }
  }, [avaliacao, isOpen])

  const handleDelete = async () => {
    if (!avaliacao) return

    if (hasVenda) {
      if (
        !confirm(
          'ATENÇÃO: Esta oportunidade possui uma venda vinculada! Tem certeza que deseja excluí-la? Isso pode gerar inconsistências financeiras no histórico de vendas.',
        )
      )
        return
    } else {
      if (
        !confirm(
          'Deseja realmente excluir esta oportunidade? Esta ação não pode ser desfeita e os dados serão permanentemente perdidos.',
        )
      )
        return
    }

    setSaving(true)
    try {
      const { error } = await supabase.from('avaliacoes').delete().eq('id', avaliacao.id)
      if (error) throw error

      toast({ title: 'Sucesso', description: 'Oportunidade excluída com sucesso!' })
      onSuccess()
      onClose()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleSave = async () => {
    if (!avaliacao) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('avaliacoes')
        .update({
          data_avaliacao: formData.data_avaliacao || null,
          data_fechamento: formData.data_fechamento || null,
          valor_orcamento: formData.valor_orcamento ? Number(formData.valor_orcamento) : null,
          valor_entrada: formData.valor_entrada ? Number(formData.valor_entrada) : null,
          dentista_avaliador_id:
            formData.dentista_avaliador_id === 'nenhum'
              ? null
              : formData.dentista_avaliador_id || null,
          crc_comercial_id:
            formData.crc_comercial_id === 'nenhum' ? null : formData.crc_comercial_id || null,
          origem_id: formData.origem_id === 'nenhum' ? null : formData.origem_id || null,
          destino_fiscal:
            formData.destino_fiscal === 'nenhum' ? null : formData.destino_fiscal || null,
          status: formData.status || null,
          temperatura_lead: formData.temperatura_lead || null,
        })
        .eq('id', avaliacao.id)

      if (error) throw error

      const nomePaciente = (avaliacao as any).pacientes?.nome
      const origemUpdate = formData.origem_id === 'nenhum' ? null : formData.origem_id || null

      if (nomePaciente && origemUpdate) {
        await supabase
          .from('funil_leads')
          .update({ origem_id: origemUpdate })
          .ilike('nome', nomePaciente)
        await supabase
          .from('vendas_confirmadas')
          .update({ origem_id: origemUpdate })
          .ilike('paciente_nome', nomePaciente)
      }

      toast({ title: 'Sucesso', description: 'Oportunidade atualizada com sucesso!' })
      onSuccess()
      onClose()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  if (!avaliacao) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Oportunidade</DialogTitle>
          <DialogDescription>
            Atualize as datas, valores e responsáveis da oportunidade comercial.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Data Avaliação</Label>
              <Input
                type="date"
                value={formData.data_avaliacao}
                onChange={(e) => setFormData({ ...formData, data_avaliacao: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Data Venda (Fechamento)</Label>
              <Input
                type="date"
                value={formData.data_fechamento}
                onChange={(e) => setFormData({ ...formData, data_fechamento: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Valor Orçamento</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.valor_orcamento}
                onChange={(e) => setFormData({ ...formData, valor_orcamento: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Valor Entrada</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.valor_entrada}
                onChange={(e) => setFormData({ ...formData, valor_entrada: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Avaliador</Label>
              <Select
                value={formData.dentista_avaliador_id}
                onValueChange={(v) => setFormData({ ...formData, dentista_avaliador_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Nenhum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhum">Nenhum</SelectItem>
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
                  <SelectValue placeholder="Nenhum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhum">Nenhum</SelectItem>
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
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="avaliacao_realizada">Avaliação Realizada</SelectItem>
                  <SelectItem value="em_negociacao">Em Negociação</SelectItem>
                  <SelectItem value="follow_up">Follow Up</SelectItem>
                  <SelectItem value="venda_concretizada">Venda Concretizada</SelectItem>
                  <SelectItem value="perdido">Perdido</SelectItem>
                  <SelectItem value="adiado">Adiado</SelectItem>
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
                  <SelectValue placeholder="Temperatura" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quente">Quente</SelectItem>
                  <SelectItem value="morno">Morno</SelectItem>
                  <SelectItem value="frio">Frio</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Origem</Label>
              <Select
                value={formData.origem_id}
                onValueChange={(v) => setFormData({ ...formData, origem_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Origem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhum">Nenhuma</SelectItem>
                  {origens.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Destino Fiscal</Label>
              <Select
                value={formData.destino_fiscal}
                onValueChange={(v) => setFormData({ ...formData, destino_fiscal: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Destino Fiscal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PESSOA FISICA">PESSOA FISICA</SelectItem>
                  <SelectItem value="VITALI ODONTOLOGIA">VITALI ODONTOLOGIA</SelectItem>
                  <SelectItem value="SOUZA FILHO ODONTOLOGIA">SOUZA FILHO ODONTOLOGIA</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="flex sm:justify-between w-full">
          {isAdmin ? (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={saving}
              className="mr-auto bg-red-500 hover:bg-red-600 text-white"
              type="button"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir Oportunidade
            </Button>
          ) : (
            <div className="mr-auto" />
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={saving} type="button">
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving} type="button">
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvar Alterações
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/supabase/client'
import { comissoesService } from '@/services/comissoes'
import type { FaixaBase } from '@/services/comissoes'
import { Separator } from '@/components/ui/separator'

interface Props {
  avaliacaoId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ConcretizarVendaModal({ avaliacaoId, open, onOpenChange, onSuccess }: Props) {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [avaliacao, setAvaliacao] = useState<any>(null)
  const [faixasDentista, setFaixasDentista] = useState<FaixaBase[]>([])
  const [faixasCRC, setFaixasCRC] = useState<FaixaBase[]>([])
  const [valorTotalStr, setValorTotalStr] = useState<string>('0')
  const [valorEntradaStr, setValorEntradaStr] = useState<string>('')
  const [crcParticipou, setCrcParticipou] = useState(false)
  const [dataConcretizacao, setDataConcretizacao] = useState<string>(
    format(new Date(), 'yyyy-MM-dd'),
  )

  const valorTotal = Number(valorTotalStr) || 0
  const valorEntrada = Number(valorEntradaStr) || 0
  const percentualEntrada = valorTotal > 0 ? (valorEntrada / valorTotal) * 100 : 0

  useEffect(() => {
    if (open && avaliacaoId) {
      supabase
        .from('avaliacoes')
        .select('*')
        .eq('id', avaliacaoId)
        .single()
        .then(({ data }) => {
          setAvaliacao(data)
          if (data) {
            const vTotal = data.valor_orcamento || 0
            setValorTotalStr(vTotal.toString())
            setValorEntradaStr('')
            setCrcParticipou(!!data.crc_comercial_id)
          }
        })

      comissoesService.dentista.list().then(setFaixasDentista)
      comissoesService.crc.list().then(setFaixasCRC)
    } else {
      setValorTotalStr('0')
      setValorEntradaStr('')
      setCrcParticipou(false)
      setAvaliacao(null)
      setDataConcretizacao(format(new Date(), 'yyyy-MM-dd'))
    }
  }, [open, avaliacaoId])

  const getComissao = (faixas: FaixaBase[], percentual: number) => {
    const faixa = faixas.find((f) => {
      if (f.status !== 'ativo') return false
      const min = f.faixa_entrada_minima ?? 0
      const max = f.faixa_entrada_maxima ?? Infinity
      return percentual >= min && percentual <= max
    })
    return faixa?.percentual_comissao ?? 0
  }

  const percentualDentista = getComissao(faixasDentista, percentualEntrada)
  const comissaoDentista = (valorTotal * percentualDentista) / 100
  const percentualCRC = crcParticipou ? getComissao(faixasCRC, percentualEntrada) : 0
  const comissaoCRC = (valorTotal * percentualCRC) / 100

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!avaliacao) return
    setSaving(true)

    try {
      const { data: venda, error: vendaError } = await supabase
        .from('vendas_concretizadas')
        .insert({
          avaliacao_id: avaliacaoId,
          valor_total_tratamento: valorTotal,
          valor_entrada: valorEntrada,
          percentual_entrada: percentualEntrada,
          dentista_avaliador_id: avaliacao.dentista_avaliador_id,
          crc_participou: crcParticipou,
          crc_comercial_id: crcParticipou ? avaliacao.crc_comercial_id : null,
          data_concretizacao: dataConcretizacao,
        })
        .select('id')
        .single()

      if (vendaError) throw vendaError

      if (avaliacao.dentista_avaliador_id) {
        const { error: dentistaError } = await supabase.from('comissoes_dentista').insert({
          venda_id: venda.id,
          dentista_avaliador_id: avaliacao.dentista_avaliador_id,
          percentual_faixa: percentualDentista,
          valor_comissao: comissaoDentista,
          status_pagamento: 'gerada',
          data_calculo: dataConcretizacao,
        })
        if (dentistaError) throw dentistaError
      }

      if (crcParticipou && avaliacao.crc_comercial_id) {
        const { error: crcError } = await supabase.from('comissoes_crc').insert({
          venda_id: venda.id,
          crc_comercial_id: avaliacao.crc_comercial_id,
          percentual_faixa: percentualCRC,
          valor_comissao: comissaoCRC,
          status_pagamento: 'gerada',
          data_calculo: dataConcretizacao,
        })
        if (crcError) throw crcError
      }

      await supabase
        .from('avaliacoes')
        .update({ status: 'venda_concretizada' })
        .eq('id', avaliacaoId)

      toast({ title: 'Venda concretizada com sucesso!' })
      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      toast({
        title: 'Erro ao concretizar venda',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Concretizar Venda</DialogTitle>
            <DialogDescription>
              Informe os valores para calcular as comissões e registrar o fechamento.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Valor Total do Tratamento</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={valorTotalStr}
                  readOnly
                  className="bg-slate-100 dark:bg-slate-800 cursor-not-allowed"
                />
              </div>
              <div className="grid gap-2">
                <Label>Data do Fechamento</Label>
                <Input
                  required
                  type="date"
                  value={dataConcretizacao}
                  onChange={(e) => setDataConcretizacao(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Valor da Entrada (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max={valorTotal}
                  value={valorEntradaStr}
                  onChange={(e) => setValorEntradaStr(e.target.value)}
                  placeholder="Ex: 5000.00"
                  className="bg-white dark:bg-slate-950"
                />
              </div>
              <div className="grid gap-2">
                <Label>Percentual de Entrada (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={percentualEntrada.toFixed(2)}
                  readOnly
                  className="bg-slate-100 dark:bg-slate-800 cursor-not-allowed font-medium text-slate-600"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="crc-participou"
                checked={crcParticipou}
                onCheckedChange={setCrcParticipou}
              />
              <Label htmlFor="crc-participou">CRC Comercial participou da venda?</Label>
            </div>

            <div className="mt-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border space-y-3">
              <h4 className="font-semibold text-sm">Resumo das Comissões</h4>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Percentual de Entrada:</span>
                  <span className="font-medium">{percentualEntrada.toFixed(2)}%</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Dentista Avaliador ({percentualDentista}%):
                  </span>
                  <span className="font-medium text-emerald-600">
                    R$ {comissaoDentista.toFixed(2)}
                  </span>
                </div>
                {crcParticipou && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CRC Comercial ({percentualCRC}%):</span>
                    <span className="font-medium text-emerald-600">
                      R$ {comissaoCRC.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || valorTotal <= 0}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Confirmar Fechamento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

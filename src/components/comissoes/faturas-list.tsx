import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export function FaturasList({ tipo }: { tipo: 'dentista' | 'crc' }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [faturas, setFaturas] = useState<any[]>([])

  useEffect(() => {
    loadFaturas()
  }, [tipo])

  const loadFaturas = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('faturas_comissoes')
        .select(`
          *,
          usuarios(nome),
          faturamento_comissoes(periodo_inicio, periodo_fim)
        `)
        .eq('tipo_profissional', tipo)
        .order('criado_em', { ascending: false })

      if (error) throw error
      setFaturas(data || [])
    } catch (err: any) {
      toast({ title: 'Erro ao carregar faturas', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('faturas_comissoes')
        .update({ status_pagamento: status })
        .eq('id', id)
      if (error) throw error
      toast({
        title: 'Status atualizado',
        description: 'A situação da fatura foi alterada com sucesso.',
      })
      loadFaturas()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const formatCurrency = (val: number | null | undefined) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

  if (loading)
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin text-amber-500 w-8 h-8" />
      </div>
    )

  return (
    <div className="rounded-md border border-slate-800 overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-950/50">
          <TableRow className="border-slate-800">
            <TableHead className="text-slate-400">Data Geração</TableHead>
            <TableHead className="text-slate-400">Profissional</TableHead>
            <TableHead className="text-slate-400">Período Avaliado</TableHead>
            <TableHead className="text-slate-400 text-right">Valor Total Fatura</TableHead>
            <TableHead className="text-slate-400 text-center">Status</TableHead>
            <TableHead className="text-slate-400 text-right">Ação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {faturas.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                Nenhuma fatura de agrupamento encontrada.
              </TableCell>
            </TableRow>
          ) : (
            faturas.map((fat) => (
              <TableRow
                key={fat.id}
                className="border-slate-800 hover:bg-slate-800/50 transition-colors"
              >
                <TableCell className="text-slate-300 font-medium">
                  {new Date(fat.criado_em).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell className="text-slate-300">{fat.usuarios?.nome || '-'}</TableCell>
                <TableCell className="text-slate-300">
                  {fat.faturamento_comissoes?.periodo_inicio
                    ? new Date(
                        fat.faturamento_comissoes.periodo_inicio + 'T00:00:00',
                      ).toLocaleDateString('pt-BR')
                    : '-'}
                  {' a '}
                  {fat.faturamento_comissoes?.periodo_fim
                    ? new Date(
                        fat.faturamento_comissoes.periodo_fim + 'T00:00:00',
                      ).toLocaleDateString('pt-BR')
                    : '-'}
                </TableCell>
                <TableCell className="text-emerald-400 font-bold text-right">
                  {formatCurrency(fat.valor_total_comissao)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant="outline"
                    className={
                      fat.status_pagamento === 'pago'
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
                        : 'border-amber-500/30 bg-amber-500/10 text-amber-500'
                    }
                  >
                    {fat.status_pagamento === 'pago' ? 'Pago' : 'Em Aberto'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Select
                    value={fat.status_pagamento || 'em_aberto'}
                    onValueChange={(val) => updateStatus(fat.id, val)}
                  >
                    <SelectTrigger className="w-[130px] h-8 bg-slate-900 border-slate-700 text-xs ml-auto shadow-sm">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      <SelectItem
                        value="em_aberto"
                        className="text-amber-500 focus:bg-amber-500/10"
                      >
                        Em Aberto
                      </SelectItem>
                      <SelectItem value="pago" className="text-emerald-500 focus:bg-emerald-500/10">
                        Pago
                      </SelectItem>
                      <SelectItem value="cancelado" className="text-red-400 focus:bg-red-400/10">
                        Cancelado
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

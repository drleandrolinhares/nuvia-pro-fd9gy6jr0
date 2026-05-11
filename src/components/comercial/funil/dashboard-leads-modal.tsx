import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { supabase } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export interface DashboardLeadsModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'leads' | 'agendamentos' | 'comparecimentos' | 'faltas' | 'fechamentos' | 'oportunidades'
  origens: string[]
  mesReferencia: string
  title: string
}

export function DashboardLeadsModal({
  isOpen,
  onClose,
  type,
  origens,
  mesReferencia,
  title,
}: DashboardLeadsModalProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    const fetchData = async () => {
      setLoading(true)
      try {
        if (type === 'oportunidades') {
          let query = supabase.from('avaliacoes').select(`
              id,
              valor_orcamento,
              status,
              data_avaliacao,
              pacientes ( nome )
            `)

          if (origens && origens.length > 0) {
            query = query.in('origem_id', origens)
          }

          const { data: avaliacoes, error } = await query

          if (error) throw error

          const filtered = (avaliacoes || []).filter((a) => {
            if (!a.data_avaliacao) return false
            return a.data_avaliacao.startsWith(mesReferencia)
          })

          setData(filtered)
        } else {
          let query = supabase.from('funil_leads').select('*').eq('mes_referencia', mesReferencia)

          if (origens && origens.length > 0) {
            query = query.in('origem_id', origens)
          }

          const { data: leads, error } = await query

          if (error) throw error

          let filtered = leads || []

          if (type === 'agendamentos') {
            filtered = filtered.filter((l) =>
              [
                'agendado',
                'reagendado',
                'atendido',
                'faltou',
                'negociacao',
                'venda-fechada',
                'venda-perdida',
                'avaliacao',
                'fechamento',
                'em_follow_up',
              ].includes(l.status || ''),
            )
          } else if (type === 'comparecimentos') {
            filtered = filtered.filter((l) =>
              [
                'atendido',
                'negociacao',
                'venda-fechada',
                'venda-perdida',
                'avaliacao',
                'fechamento',
                'em_follow_up',
              ].includes(l.status || ''),
            )
          } else if (type === 'fechamentos') {
            filtered = filtered.filter((l) =>
              ['fechamento', 'venda-fechada'].includes(l.status || ''),
            )
          } else if (type === 'faltas') {
            filtered = filtered.filter(
              (l) => l.status === 'faltou' || (l.qtd_faltas && l.qtd_faltas > 0),
            )
          }

          setData(filtered)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isOpen, type, origens, mesReferencia])

  const formatBrl = (v: number) =>
    Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-slate-900 border-slate-800 text-slate-200">
        <DialogHeader>
          <DialogTitle className="text-white">{title}</DialogTitle>
        </DialogHeader>

        <div className="mt-4 max-h-[60vh] overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
          ) : data.length === 0 ? (
            <div className="text-center p-8 text-slate-500">Nenhum registro encontrado.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400">Nome do Paciente</TableHead>
                  {type === 'oportunidades' ? (
                    <>
                      <TableHead className="text-slate-400">Data Avaliação</TableHead>
                      <TableHead className="text-slate-400">Status</TableHead>
                      <TableHead className="text-slate-400 text-right">Valor</TableHead>
                    </>
                  ) : (
                    <>
                      <TableHead className="text-slate-400">Telefone</TableHead>
                      <TableHead className="text-slate-400">Status</TableHead>
                      {type === 'agendamentos' && (
                        <TableHead className="text-slate-400">Data Agendamento</TableHead>
                      )}
                      <TableHead className="text-slate-400 text-center">Contatos</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item: any) => (
                  <TableRow key={item.id} className="border-slate-800/50 hover:bg-slate-800/30">
                    {type === 'oportunidades' ? (
                      <>
                        <TableCell className="font-medium text-slate-300">
                          {item.pacientes?.nome || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {item.data_avaliacao
                            ? new Date(item.data_avaliacao).toLocaleDateString('pt-BR', {
                                timeZone: 'UTC',
                              })
                            : '-'}
                        </TableCell>
                        <TableCell className="capitalize">
                          {item.status?.replace(/_/g, ' ') || '-'}
                        </TableCell>
                        <TableCell className="text-right text-emerald-400">
                          {formatBrl(item.valor_orcamento || 0)}
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="font-medium text-slate-300">{item.nome}</TableCell>
                        <TableCell>{item.telefone || '-'}</TableCell>
                        <TableCell className="capitalize">
                          {item.status?.replace(/-/g, ' ') || '-'}
                        </TableCell>
                        {type === 'agendamentos' && (
                          <TableCell>
                            {item.data_agendamento
                              ? new Date(item.data_agendamento).toLocaleString('pt-BR')
                              : '-'}
                          </TableCell>
                        )}
                        <TableCell className="text-center">
                          {item.quantidade_contatos || 0}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

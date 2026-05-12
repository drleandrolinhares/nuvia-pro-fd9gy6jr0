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
        const [ano, mes] = mesReferencia.split('-')
        const dataInicio = `${mesReferencia}-01`
        const ultimoDia = new Date(Number(ano), Number(mes), 0).getDate()
        const dataFim = `${mesReferencia}-${ultimoDia}`

        const { data: origensData } = await supabase.from('funil_origens').select('*')

        const { data: pastVendas } = await supabase
          .from('vendas_confirmadas')
          .select('paciente_nome')
          .lt('data_fechamento', dataInicio)

        const { data: currentVendas } = await supabase
          .from('vendas_confirmadas')
          .select('paciente_nome')
          .gte('data_fechamento', dataInicio)
          .lte('data_fechamento', dataFim)

        const pacientesRecorrentes = new Set(
          (pastVendas || []).map((v) => v.paciente_nome?.toLowerCase().trim()).filter(Boolean),
        )

        const vendasNomes = new Set(
          (currentVendas || []).map((v) => v.paciente_nome?.toLowerCase().trim()).filter(Boolean),
        )

        const getOrigemDisplayNome = (id: string) =>
          (origensData || []).find((o) => o.id === id)?.nome || 'Não informada'
        const getOrigemNome = (id: string) =>
          (origensData || []).find((o) => o.id === id)?.nome?.toLowerCase() || ''
        const isRecorrenteOrigem = (id: string) => getOrigemNome(id).includes('recorrente')

        if (type === 'oportunidades') {
          const { data: rawAvaliacoes, error } = await supabase
            .from('avaliacoes')
            .select(`
              id,
              origem_id,
              valor_orcamento,
              status,
              data_avaliacao,
              pacientes ( nome, telefone )
            `)
            .gte('data_avaliacao', dataInicio)
            .lte('data_avaliacao', dataFim)

          if (error) throw error

          const filtered = (rawAvaliacoes || [])
            .filter((a: any) => {
              if (origens && origens.length > 0 && !origens.includes(a.origem_id)) return false
              if (
                (a.status || '').toLowerCase() === 'venda-fechada' ||
                (a.status || '').toLowerCase() === 'venda_concretizada'
              )
                return false
              const nome = a.pacientes?.nome?.toLowerCase().trim()
              if (nome && vendasNomes.has(nome)) return false
              return true
            })
            .map((a) => ({
              id: a.id,
              nome: a.pacientes?.nome || 'N/A',
              telefone: a.pacientes?.telefone || '-',
              status: a.status || 'Avaliação',
              data: a.data_avaliacao,
              valor: a.valor_orcamento || 0,
              fonte: 'Avaliação',
              origem_nome: getOrigemDisplayNome(a.origem_id),
            }))

          const deduplicated = Array.from(
            new Map(
              filtered.map((item) => [
                item.nome ? String(item.nome).trim().toLowerCase() : item.id,
                item,
              ]),
            ).values(),
          ).sort((a: any, b: any) => (a.nome || '').localeCompare(b.nome || ''))

          setData(deduplicated)
          return
        }

        if (type === 'fechamentos') {
          const { data: rawVendas, error } = await supabase
            .from('vendas_confirmadas')
            .select(
              'id, paciente_nome, valor_tratamento, oportunidade_id, origem_id, avaliacoes(origem_id), telefone, data_fechamento, status_comissao',
            )
            .gte('data_fechamento', dataInicio)
            .lte('data_fechamento', dataFim)

          if (error) throw error

          const filtered = (rawVendas || [])
            .filter((v: any) => {
              const oId = v.origem_id || v.avaliacoes?.origem_id
              if (origens && origens.length > 0 && !origens.includes(oId)) return false
              return true
            })
            .map((v: any) => ({
              id: v.id,
              nome: v.paciente_nome,
              telefone: v.telefone || '-',
              status: 'venda_concretizada',
              data: v.data_fechamento,
              valor: v.valor_tratamento || 0,
              fonte: 'Venda Confirmada',
              origem_nome: getOrigemDisplayNome(v.origem_id || v.avaliacoes?.origem_id),
            }))

          const deduplicated = Array.from(
            new Map(
              filtered.map((item) => [
                item.nome ? String(item.nome).trim().toLowerCase() : item.id,
                item,
              ]),
            ).values(),
          ).sort((a: any, b: any) => (a.nome || '').localeCompare(b.nome || ''))

          setData(deduplicated)
          return
        }

        // For leads, agendamentos, comparecimentos, faltas
        const { data: rawLeads } = await supabase
          .from('funil_leads')
          .select('*')
          .eq('mes_referencia', mesReferencia)

        const { data: rawAvaliacoes } = await supabase
          .from('avaliacoes')
          .select(
            'id, origem_id, valor_orcamento, status, pacientes(nome, telefone), data_avaliacao',
          )
          .gte('data_avaliacao', dataInicio)
          .lte('data_avaliacao', dataFim)

        const { data: rawVendas } = await supabase
          .from('vendas_confirmadas')
          .select(
            'id, paciente_nome, valor_tratamento, oportunidade_id, origem_id, avaliacoes(origem_id), telefone, data_fechamento',
          )
          .gte('data_fechamento', dataInicio)
          .lte('data_fechamento', dataFim)

        const unifiedList: any[] = []

        ;(rawLeads || []).forEach((lead: any) => {
          const oId = lead.origem_id
          if (origens && origens.length > 0 && !origens.includes(oId)) return

          const nome = lead.nome?.toLowerCase().trim()
          const isRecorrente =
            isRecorrenteOrigem(oId) || (nome ? pacientesRecorrentes.has(nome) : false)

          const status = (lead.status || '').toLowerCase()

          const isAgendado = [
            'agendado',
            'reagendado',
            'atendido',
            'faltou',
            'negociacao',
            'venda-fechada',
            'venda_concretizada',
            'venda-perdida',
            'avaliacao',
            'fechamento',
            'em_follow_up',
          ].includes(status)
          const isCompareceu = [
            'atendido',
            'negociacao',
            'venda-fechada',
            'venda_concretizada',
            'venda-perdida',
            'avaliacao',
            'fechamento',
            'em_follow_up',
          ].includes(status)
          const isFaltante = status === 'faltou'

          const isVendaFechada =
            status === 'venda-fechada' || status === 'venda_concretizada' || status === 'fechamento'
          const isInVendas = nome ? vendasNomes.has(nome) : false

          let include = false
          if (type === 'leads') {
            include = true
          }
          if (type === 'agendamentos' && isAgendado && !isRecorrente) include = true
          if (type === 'comparecimentos' && isCompareceu && !isRecorrente) include = true
          if (type === 'faltas' && isFaltante && !isRecorrente) include = true

          if (include) {
            unifiedList.push({
              id: lead.id,
              nome: lead.nome,
              telefone: lead.telefone,
              status: lead.status,
              data: lead.data_agendamento || lead.criado_em,
              contatos: lead.quantidade_contatos,
              fonte: 'Lead',
              origem_nome: getOrigemDisplayNome(lead.origem_id),
            })
          }
        })

        ;(rawAvaliacoes || []).forEach((av: any) => {
          const oId = av.origem_id
          if (origens && origens.length > 0 && !origens.includes(oId)) return

          const nome = av.pacientes?.nome?.toLowerCase().trim()
          const isRecorrente =
            isRecorrenteOrigem(oId) || (nome ? pacientesRecorrentes.has(nome) : false)

          const isInVendas = nome ? vendasNomes.has(nome) : false
          const isVendaFechada =
            (av.status || '').toLowerCase() === 'venda-fechada' ||
            (av.status || '').toLowerCase() === 'venda_concretizada'

          let include = false
          if (type === 'leads') {
            include = false
          }
          if (type === 'agendamentos' && !isRecorrente) include = true
          if (type === 'comparecimentos' && !isRecorrente) include = true

          if (include) {
            unifiedList.push({
              id: av.id,
              nome: av.pacientes?.nome || 'N/A',
              telefone: av.pacientes?.telefone || '-',
              status: av.status || 'avaliacao',
              data: av.data_avaliacao,
              contatos: 1,
              fonte: 'Avaliação',
              origem_nome: getOrigemDisplayNome(av.origem_id),
            })
          }
        })

        ;(rawVendas || []).forEach((v: any) => {
          const oId = v.origem_id || v.avaliacoes?.origem_id
          if (origens && origens.length > 0 && !origens.includes(oId)) return

          const nome = v.paciente_nome?.toLowerCase().trim()
          const isRecorrente =
            isRecorrenteOrigem(oId) || (nome ? pacientesRecorrentes.has(nome) : false)

          let include = false
          if (type === 'leads') {
            include = false
          }
          if (type === 'agendamentos' && !isRecorrente) include = true
          if (type === 'comparecimentos' && !isRecorrente) include = true

          if (include) {
            unifiedList.push({
              id: v.id,
              nome: v.paciente_nome,
              telefone: v.telefone || '-',
              status: 'venda_concretizada',
              data: v.data_fechamento,
              contatos: 1,
              fonte: 'Venda Confirmada',
              origem_nome: getOrigemDisplayNome(v.origem_id || v.avaliacoes?.origem_id),
            })
          }
        })

        const deduplicated = Array.from(
          new Map(
            unifiedList.map((item) => [
              item.nome ? String(item.nome).trim().toLowerCase() : item.id,
              item,
            ]),
          ).values(),
        ).sort((a: any, b: any) => (a.nome || '').localeCompare(b.nome || ''))

        setData(deduplicated)
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
                  {type === 'oportunidades' || type === 'fechamentos' ? (
                    <>
                      <TableHead className="text-slate-400">
                        Data {type === 'fechamentos' ? 'Fechamento' : 'Avaliação'}
                      </TableHead>
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
                  <TableHead className="text-slate-400">Origem</TableHead>
                  <TableHead className="text-slate-400 text-right">Fonte</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item: any) => (
                  <TableRow key={item.id} className="border-slate-800/50 hover:bg-slate-800/30">
                    <TableCell className="font-medium text-slate-300">{item.nome}</TableCell>
                    {type === 'oportunidades' || type === 'fechamentos' ? (
                      <>
                        <TableCell>
                          {item.data
                            ? new Date(item.data).toLocaleDateString('pt-BR', {
                                timeZone: 'UTC',
                              })
                            : '-'}
                        </TableCell>
                        <TableCell className="capitalize">
                          {item.status?.replace(/-/g, ' ') || '-'}
                        </TableCell>
                        <TableCell className="text-right text-emerald-400 font-medium">
                          {formatBrl(item.valor || 0)}
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>{item.telefone || '-'}</TableCell>
                        <TableCell className="capitalize">
                          {item.status?.replace(/-/g, ' ') || '-'}
                        </TableCell>
                        {type === 'agendamentos' && (
                          <TableCell>
                            {item.data ? new Date(item.data).toLocaleString('pt-BR') : '-'}
                          </TableCell>
                        )}
                        <TableCell className="text-center">{item.contatos || 0}</TableCell>
                      </>
                    )}
                    <TableCell className="text-slate-300">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        {item.origem_nome}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-xs text-slate-500">
                      {item.fonte}
                    </TableCell>
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

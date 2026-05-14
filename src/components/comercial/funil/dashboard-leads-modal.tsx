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
        const validOrigens = new Set(
          (origensData || []).filter((o) => o.ativo !== false).map((o) => o.id),
        )

        const normalizeNome = (n: any) => {
          if (!n) return ''
          return String(n)
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim()
            .toLowerCase()
            .replace(/\s+/g, ' ')
        }

        const { data: currentVendas } = await supabase
          .from('vendas_confirmadas')
          .select('id, oportunidade_id')
          .gte('data_fechamento', dataInicio)
          .lte('data_fechamento', dataFim)

        const vendasOportunidadesIds = new Set(
          (currentVendas || []).map((v) => v.oportunidade_id).filter(Boolean),
        )

        const getOrigemDisplayNome = (id: string) =>
          (origensData || []).find((o) => o.id === id)?.nome || 'Não informada'

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
              const oId = a.origem_id
              if (origens && origens.length > 0 && !origens.includes(oId)) return false
              if (!oId || !validOrigens.has(oId)) return false

              const status = (a.status || '').toLowerCase()
              if (['erro', 'rascunho', 'lixo', 'duplicado', 'teste', 'invalido'].includes(status))
                return false

              if (!a.pacientes?.nome || String(a.pacientes.nome).trim() === '') return false
              const nome = normalizeNome(a.pacientes.nome)
              if (nome.includes('teste') || nome.includes('duplicado')) return false

              return true
            })
            .map((a: any) => ({
              id: a.id,
              nome: a.pacientes.nome,
              telefone: a.pacientes?.telefone || '-',
              status: a.status || 'Avaliação',
              data: a.data_avaliacao,
              valor: a.valor_orcamento || 0,
              fonte: 'Avaliação',
              origem_nome: getOrigemDisplayNome(a.origem_id),
            }))

          const uniqueOps = new Map()
          filtered.forEach((a: any) => {
            const n = normalizeNome(a.nome)
            if (!uniqueOps.has(n)) {
              uniqueOps.set(n, a)
            } else {
              const existing = uniqueOps.get(n)
              if ((a.valor || 0) > (existing.valor || 0)) {
                uniqueOps.set(n, a)
              }
            }
          })

          setData(
            Array.from(uniqueOps.values()).sort((a: any, b: any) =>
              (a.nome || '').localeCompare(b.nome || ''),
            ),
          )
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
              if (!oId || !validOrigens.has(oId)) return false

              if (!v.paciente_nome || String(v.paciente_nome).trim() === '') return false
              const nome = normalizeNome(v.paciente_nome)
              if (nome.includes('teste') || nome.includes('duplicado')) return false

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

          const uniqueVendas = new Map()
          filtered.forEach((v: any) => {
            const n = normalizeNome(v.nome)
            if (!uniqueVendas.has(n)) {
              uniqueVendas.set(n, v)
            } else {
              const existing = uniqueVendas.get(n)
              if ((v.valor || 0) > (existing.valor || 0)) {
                uniqueVendas.set(n, v)
              }
            }
          })

          setData(
            Array.from(uniqueVendas.values()).sort((a: any, b: any) =>
              (a.nome || '').localeCompare(b.nome || ''),
            ),
          )
          return
        }

        // For leads, agendamentos, comparecimentos, faltas
        const { data: rawLeads } = await supabase
          .from('funil_leads')
          .select('*')
          .eq('mes_referencia', mesReferencia)

        const unifiedList: any[] = []
        const deduplicatedLeadsMap = new Map()

        ;(rawLeads || []).forEach((lead: any) => {
          const oId = lead.origem_id
          if (origens && origens.length > 0 && !origens.includes(oId)) return
          if (!oId || !validOrigens.has(oId)) return

          const status = (lead.status || '').toLowerCase()
          if (['erro', 'rascunho', 'lixo', 'duplicado', 'teste', 'invalido'].includes(status))
            return

          if (!lead.nome || String(lead.nome).trim() === '') return
          const nome = normalizeNome(lead.nome)
          if (nome.includes('teste') || nome.includes('duplicado')) return

          const dedupKey = nome

          if (!deduplicatedLeadsMap.has(dedupKey)) {
            deduplicatedLeadsMap.set(dedupKey, { ...lead })
          } else {
            const existing = deduplicatedLeadsMap.get(dedupKey)
            if (!existing.telefone && lead.telefone) {
              existing.telefone = lead.telefone
            }

            const isAgendado1 = [
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
            ].includes((existing.status || '').toLowerCase())
            const isAgendado2 = [
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

            const isCompareceu1 = [
              'atendido',
              'negociacao',
              'venda-fechada',
              'venda_concretizada',
              'venda-perdida',
              'avaliacao',
              'fechamento',
              'em_follow_up',
            ].includes((existing.status || '').toLowerCase())
            const isCompareceu2 = [
              'atendido',
              'negociacao',
              'venda-fechada',
              'venda_concretizada',
              'venda-perdida',
              'avaliacao',
              'fechamento',
              'em_follow_up',
            ].includes(status)

            const isFaltante1 = (existing.status || '').toLowerCase() === 'faltou'
            const isFaltante2 = status === 'faltou'

            existing._isAgendado = isAgendado1 || isAgendado2 || existing._isAgendado
            existing._isCompareceu = isCompareceu1 || isCompareceu2 || existing._isCompareceu
            existing._isFaltante = isFaltante1 || isFaltante2 || existing._isFaltante

            deduplicatedLeadsMap.set(dedupKey, existing)
          }
        })

        const uniqueLeads = Array.from(deduplicatedLeadsMap.values())

        uniqueLeads.forEach((lead: any) => {
          const status = (lead.status || '').toLowerCase()
          const isAgendado =
            lead._isAgendado !== undefined
              ? lead._isAgendado
              : [
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
          const isCompareceu =
            lead._isCompareceu !== undefined
              ? lead._isCompareceu
              : [
                  'atendido',
                  'negociacao',
                  'venda-fechada',
                  'venda_concretizada',
                  'venda-perdida',
                  'avaliacao',
                  'fechamento',
                  'em_follow_up',
                ].includes(status)
          const isFaltante = lead._isFaltante !== undefined ? lead._isFaltante : status === 'faltou'

          let include = false
          if (type === 'leads') {
            include = true
          }
          if (type === 'agendamentos' && isAgendado) include = true
          if (type === 'comparecimentos' && isCompareceu) include = true
          if (type === 'faltas' && isFaltante) include = true

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

        setData(unifiedList.sort((a: any, b: any) => (a.nome || '').localeCompare(b.nome || '')))
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

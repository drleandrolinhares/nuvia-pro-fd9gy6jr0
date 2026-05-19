import { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { supabase } from '@/lib/supabase/client'
import { Loader2, Search, Link as LinkIcon, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { EditarOportunidadeModal } from '@/pages/comercial/components/EditarOportunidadeModal'
import { EditarLeadModal } from './editar-lead-modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'

export function DashboardLeadsModal({
  isOpen,
  onClose,
  type,
  origens,
  mesReferencia,
  title,
  onUpdate,
  etapas,
  temperaturas,
}: any) {
  const [data, setData] = useState<any[]>([])
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAvaliacao, setSelectedAvaliacao] = useState<any>(null)
  const [dentistas, setDentistas] = useState<any[]>([])
  const [crcs, setCrcs] = useState<any[]>([])
  const [origensList, setOrigensList] = useState<any[]>([])

  useEffect(() => {
    if (isOpen) {
      setData([])
      setSearchTerm('')
      fetchData()
      fetchOptions()

      const channel = supabase
        .channel(`modal-leads-${Math.random()}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'funil_leads' }, () => {
          fetchData()
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'avaliacoes' }, () => {
          fetchData()
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [isOpen, type, origens, mesReferencia])

  const fetchOptions = async () => {
    const [dRes, cRes, oRes] = await Promise.all([
      supabase.from('dentistas_avaliadores').select('id, nome').eq('status', 'ativo'),
      supabase.from('crc_comercial').select('id, nome').eq('status', 'ativo'),
      supabase.from('funil_origens').select('id, nome'),
    ])
    setDentistas(dRes.data || [])
    setCrcs(cRes.data || [])
    setOrigensList(oRes.data || [])
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [ano, mes] = mesReferencia.split('-')
      const dataInicio = `${mesReferencia}-01`
      const ultimoDia = new Date(Number(ano), Number(mes), 0).getDate()
      const dataFim = `${mesReferencia}-${ultimoDia}`

      const { data: dbOrigens } = await supabase.from('funil_origens').select('id, nome')

      let validOrigens = origens || []

      if (type === 'fechamentos') {
        let query = supabase
          .from('vendas_confirmadas')
          .select('*, avaliacoes(*, pacientes(nome))')
          .gte('data_fechamento', dataInicio)
          .lte('data_fechamento', dataFim)
          .limit(10000)

        const { data: vendas } = await query

        const filtered = (vendas || []).filter((v: any) => {
          const oId = v.origem_id || v.avaliacoes?.origem_id

          if (validOrigens && validOrigens.length > 0) {
            if (!validOrigens.includes(oId)) return false
          }

          return true
        })

        filtered.sort(
          (a: any, b: any) =>
            new Date(b.data_fechamento || 0).getTime() - new Date(a.data_fechamento || 0).getTime(),
        )
        setData(filtered.map((v: any) => ({ ...v, _isVenda: true })))
      } else {
        const { data: leads } = await supabase
          .from('funil_leads')
          .select('*')
          .or(
            `mes_referencia.eq.${mesReferencia},and(data_avaliacao.gte.${dataInicio},data_avaliacao.lte.${dataFim})`,
          )
          .order('criado_em', { ascending: false })
          .limit(3000)

        const filtered = (leads || []).filter((lead: any) => {
          const status = (lead.status || '').toLowerCase()
          if (!lead.nome || String(lead.nome).trim() === '') {
            lead.nome = 'Lead sem nome'
          }

          if (origens && origens.length > 0) {
            if (!origens.includes(lead.origem_id)) return false
          }

          if (['lixo', 'teste', 'duplicado', 'erro', 'invalido', 'rascunho'].includes(status)) {
            return false
          }

          const dateStr = lead.data_avaliacao || lead.criado_em || ''
          const itemDate = dateStr.substring(0, 7)

          if (itemDate !== mesReferencia) return false

          if (type === 'leads') return true

          const isAgendado =
            [
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
            ].includes(status) || (lead.qtd_agendamentos || 0) > 0
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
          const isFaltante = status === 'faltou' || (lead.qtd_faltas || 0) > 0

          if (type === 'agendamentos') return isAgendado
          if (type === 'comparecimentos') return isCompareceu
          if (type === 'faltas') return isFaltante
          return true
        })

        filtered.sort(
          (a: any, b: any) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime(),
        )
        setData(filtered)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, itemType: string) => {
    if (
      !confirm(
        'ATENÇÃO: Deseja realmente excluir este registro? Esta ação removerá os dados do banco.',
      )
    )
      return

    setLoading(true)
    try {
      if (itemType === 'venda') {
        await supabase.from('vendas_confirmadas').delete().eq('id', id)
      } else if (id.startsWith('venda-direta-')) {
        const realId = id.replace('venda-direta-', '')
        await supabase.from('vendas_confirmadas').delete().eq('id', realId)
      } else {
        await supabase.from('funil_leads').delete().eq('id', id)
      }
      toast({ title: 'Sucesso', description: 'Registro excluído com sucesso.' })
      await fetchData()
      if (onUpdate) await onUpdate()
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (val: any) => {
    if (!val) return 'R$ 0,00'
    return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const formatDate = (date: any) => {
    if (!date) return '-'
    try {
      return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR })
    } catch {
      return date
    }
  }

  const filteredData = useMemo(() => {
    if (!searchTerm) return data
    const term = searchTerm.toLowerCase()
    return data.filter((item: any) => {
      const nome = item._isVenda
        ? item.paciente_nome
        : item._isAvaliacao
          ? item.pacientes?.nome || 'Paciente não identificado'
          : item.nome || ''
      return nome.toLowerCase().includes(term)
    })
  }, [data, searchTerm, type])

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-5xl max-h-[85vh] flex flex-col bg-slate-900 border-slate-800 p-0 overflow-hidden shadow-2xl">
          <DialogHeader className="p-6 pb-4 border-b border-slate-800 bg-slate-950/50">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <DialogTitle className="text-xl text-white">{title}</DialogTitle>
              </div>
              <DialogDescription className="text-slate-400">
                Listagem detalhada dos registros do período selecionado.
              </DialogDescription>
            </div>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="Pesquisar por nome do paciente ou lead..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-500"
              />
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-auto p-6 pt-0 mt-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                <p>Carregando dados completos (Auditoria)...</p>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-12 text-slate-500 bg-slate-900/50 rounded-lg border border-slate-800/50">
                Nenhum registro encontrado para este filtro na base de dados.
              </div>
            ) : (
              <div className="rounded-md border border-slate-800 overflow-hidden bg-slate-950/30">
                <Table>
                  <TableHeader className="bg-slate-900/80">
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableHead className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider w-[120px]">
                        Data
                      </TableHead>
                      <TableHead className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                        Paciente / Lead
                      </TableHead>
                      <TableHead className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                        Origem
                      </TableHead>
                      <TableHead className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                        Status & Vínculos
                      </TableHead>
                      {type === 'fechamentos' ? (
                        <TableHead className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider text-right">
                          Valor
                        </TableHead>
                      ) : null}
                      <TableHead className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider text-center w-[80px]">
                        Ações
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((row: any) => {
                      const isVenda = row._isVenda
                      const isOportunidade = row._isAvaliacao
                      const isLead = !isVenda && !isOportunidade
                      const hasVenda =
                        isOportunidade &&
                        row.vendas_confirmadas &&
                        row.vendas_confirmadas.length > 0

                      return (
                        <TableRow
                          key={row.id}
                          className={`border-slate-800/50 transition-colors cursor-pointer hover:bg-slate-800 group`}
                          onClick={() => {
                            if (isOportunidade) {
                              setSelectedAvaliacao(row)
                            } else if (isVenda && row.avaliacoes) {
                              setSelectedAvaliacao(row.avaliacoes)
                            } else if (isLead) {
                              setSelectedLead(row)
                            }
                          }}
                        >
                          <TableCell className="text-slate-300 font-medium">
                            {formatDate(
                              isVenda ? row.data_fechamento : row.data_avaliacao || row.criado_em,
                            )}
                          </TableCell>
                          <TableCell className="text-white font-medium">
                            <div className="flex items-center gap-2">
                              {isVenda
                                ? row.paciente_nome
                                : isOportunidade
                                  ? row.pacientes?.nome || 'Paciente não identificado'
                                  : row.nome}
                              {row._isVendaDireta && (
                                <span className="text-[10px] text-emerald-500 uppercase tracking-wider font-bold">
                                  (Venda Direta)
                                </span>
                              )}
                              {(isOportunidade || (isVenda && row.avaliacoes)) && (
                                <span className="opacity-0 group-hover:opacity-100 text-[10px] text-amber-500 uppercase tracking-wider font-bold transition-opacity">
                                  Editar
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-400 text-sm">
                            {origensList.find((o) => o.id === row.origem_id)?.nome || '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-slate-800 text-slate-300">
                                {isVenda
                                  ? 'Venda Confirmada'
                                  : (row.status || 'Pendente').replace(/_/g, ' ')}
                              </span>
                              {isOportunidade && hasVenda && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                  <LinkIcon className="w-3 h-3" />
                                  Venda Vinculada
                                </span>
                              )}
                              {isOportunidade && !hasVenda && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
                                  Sem Venda
                                </span>
                              )}
                            </div>
                          </TableCell>
                          {isOportunidade || isVenda ? (
                            <TableCell className="text-right text-emerald-400 font-semibold">
                              {formatCurrency(isVenda ? row.valor_tratamento : row.valor_orcamento)}
                            </TableCell>
                          ) : null}
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/20 opacity-70 hover:opacity-100"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(
                                  row.id,
                                  isVenda ? 'venda' : isOportunidade ? 'oportunidade' : 'lead',
                                )
                              }}
                              title="Excluir Registro"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {selectedAvaliacao && (
        <EditarOportunidadeModal
          isOpen={!!selectedAvaliacao}
          onClose={() => setSelectedAvaliacao(null)}
          avaliacao={selectedAvaliacao}
          dentistas={dentistas}
          crcs={crcs}
          onSuccess={async () => {
            await fetchData()
            setSelectedAvaliacao(null)
            if (onUpdate) await onUpdate()
          }}
        />
      )}

      {selectedLead && (
        <EditarLeadModal
          open={!!selectedLead}
          onOpenChange={(isOpen: boolean) => !isOpen && setSelectedLead(null)}
          lead={selectedLead}
          etapas={etapas}
          temperaturas={temperaturas}
          onSaved={async () => {
            await fetchData()
            setSelectedLead(null)
            if (onUpdate) await onUpdate()
          }}
        />
      )}
    </>
  )
}

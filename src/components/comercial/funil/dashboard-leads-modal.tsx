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
import { Loader2, Search, Link as LinkIcon } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { EditarOportunidadeModal } from '@/pages/comercial/components/EditarOportunidadeModal'
import { Input } from '@/components/ui/input'

export function DashboardLeadsModal({ isOpen, onClose, type, origens, mesReferencia, title }: any) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAvaliacao, setSelectedAvaliacao] = useState<any>(null)
  const [dentistas, setDentistas] = useState<any[]>([])
  const [crcs, setCrcs] = useState<any[]>([])
  const [origensList, setOrigensList] = useState<any[]>([])

  useEffect(() => {
    if (isOpen) {
      fetchData()
      fetchOptions()
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
      const start = `${mesReferencia}-01`
      const end = `${mesReferencia}-${new Date(Number(ano), Number(mes), 0).getDate()}`

      if (type === 'oportunidades' || type === 'fechamentos') {
        const { data: avaliacoes } = await supabase
          .from('avaliacoes')
          .select(`*, pacientes(nome), vendas_confirmadas(id)`)
          .in('origem_id', origens)
          .gte(type === 'fechamentos' ? 'data_fechamento' : 'data_avaliacao', start)
          .lte(type === 'fechamentos' ? 'data_fechamento' : 'data_avaliacao', end)
          .order(type === 'fechamentos' ? 'data_fechamento' : 'data_avaliacao', {
            ascending: false,
          })

        setData(
          (avaliacoes || []).filter((a: any) => {
            const status = (a.status || '').toLowerCase()
            if (['erro', 'rascunho', 'lixo', 'duplicado', 'teste', 'invalido'].includes(status))
              return false
            if (!a.pacientes?.nome || String(a.pacientes.nome).trim() === '') return false
            const nome = String(a.pacientes.nome).trim().toLowerCase()
            if (nome.includes('teste') || nome.includes('duplicado')) return false
            return true
          }),
        )
      } else {
        const { data: leads } = await supabase
          .from('funil_leads')
          .select('*')
          .in('origem_id', origens)
          .eq('mes_referencia', mesReferencia)
          .order('criado_em', { ascending: false })

        const filtered = (leads || []).filter((lead: any) => {
          const status = (lead.status || '').toLowerCase()
          if (['erro', 'rascunho', 'lixo', 'duplicado', 'teste', 'invalido'].includes(status))
            return false
          if (!lead.nome || String(lead.nome).trim() === '') return false
          const nome = String(lead.nome).trim().toLowerCase()
          if (nome.includes('teste') || nome.includes('duplicado')) return false

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
          return false
        })
        setData(filtered)
      }
    } catch (err) {
      console.error(err)
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
      const nome =
        type === 'oportunidades' || type === 'fechamentos'
          ? item.pacientes?.nome || ''
          : item.nome || ''
      return nome.toLowerCase().includes(term)
    })
  }, [data, searchTerm, type])

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-5xl max-h-[85vh] flex flex-col bg-slate-900 border-slate-800 p-0 overflow-hidden shadow-2xl">
          <DialogHeader className="p-6 pb-4 border-b border-slate-800 bg-slate-950/50">
            <DialogTitle className="text-xl text-white">{title}</DialogTitle>
            <DialogDescription className="text-slate-400">
              {type === 'oportunidades'
                ? 'Clique em uma oportunidade para editar ou remover registros duplicados. Oportunidades com vendas vinculadas estão identificadas.'
                : 'Listagem detalhada dos registros do período selecionado.'}
            </DialogDescription>
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
                <p>Carregando dados...</p>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-12 text-slate-500 bg-slate-900/50 rounded-lg border border-slate-800/50">
                Nenhum registro encontrado para este filtro.
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
                        Paciente
                      </TableHead>
                      {type === 'oportunidades' || type === 'fechamentos' ? (
                        <>
                          <TableHead className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                            Origem
                          </TableHead>
                          <TableHead className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                            Status & Vínculos
                          </TableHead>
                          <TableHead className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider text-right">
                            Valor
                          </TableHead>
                        </>
                      ) : (
                        <>
                          <TableHead className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                            Telefone
                          </TableHead>
                          <TableHead className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                            Status
                          </TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((row: any) => {
                      const isOportunidade = type === 'oportunidades' || type === 'fechamentos'
                      const hasVenda =
                        isOportunidade &&
                        row.vendas_confirmadas &&
                        row.vendas_confirmadas.length > 0

                      return (
                        <TableRow
                          key={row.id}
                          className={`border-slate-800/50 transition-colors ${isOportunidade ? 'cursor-pointer hover:bg-slate-800 group' : 'hover:bg-slate-800/50'}`}
                          onClick={() => {
                            if (isOportunidade) {
                              setSelectedAvaliacao(row)
                            }
                          }}
                        >
                          <TableCell className="text-slate-300 font-medium">
                            {formatDate(
                              type === 'fechamentos'
                                ? row.data_fechamento
                                : row.data_avaliacao || row.criado_em,
                            )}
                          </TableCell>
                          <TableCell className="text-white font-medium">
                            <div className="flex items-center gap-2">
                              {isOportunidade ? row.pacientes?.nome : row.nome}
                              {isOportunidade && (
                                <span className="opacity-0 group-hover:opacity-100 text-[10px] text-amber-500 uppercase tracking-wider font-bold transition-opacity">
                                  Editar
                                </span>
                              )}
                            </div>
                          </TableCell>
                          {isOportunidade ? (
                            <>
                              <TableCell className="text-slate-400 text-sm">
                                {origensList.find((o) => o.id === row.origem_id)?.nome || '-'}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-slate-800 text-slate-300">
                                    {(row.status || 'Pendente').replace(/_/g, ' ')}
                                  </span>
                                  {hasVenda && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                      <LinkIcon className="w-3 h-3" />
                                      Venda Vinculada
                                    </span>
                                  )}
                                  {!hasVenda && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
                                      Sem Venda
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right text-emerald-400 font-semibold">
                                {formatCurrency(
                                  type === 'fechamentos' ? row.valor_entrada : row.valor_orcamento,
                                )}
                              </TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell className="text-slate-400 text-sm">
                                {row.telefone || '-'}
                              </TableCell>
                              <TableCell>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-slate-800 text-slate-300">
                                  {(row.status || 'Pendente').replace(/_/g, ' ')}
                                </span>
                              </TableCell>
                            </>
                          )}
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
          onSuccess={() => {
            fetchData()
            setSelectedAvaliacao(null)
          }}
        />
      )}
    </>
  )
}

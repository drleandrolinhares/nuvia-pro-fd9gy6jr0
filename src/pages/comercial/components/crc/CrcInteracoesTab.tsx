import { useCallback, useEffect, useMemo, useState } from 'react'
import { Filter, Phone, X } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase/client'

/**
 * Interações do CRC — LEITURA, não digitação.
 *
 * A CRC já registra cada tentativa no modal "Executar Ação Comercial" (aba
 * Agenda): é lá que ela conclui a ação, escreve o resultado e, se for o caso,
 * agenda a próxima tentativa. Essa mesma tabela (compromissos, com o carimbo
 * em funil_agenda_logs) é a fonte desta aba.
 *
 * O desfecho vem da lista tipificada (desfechos_comerciais). Quando a linha é
 * anterior à tipificação, o código é deduzido do texto livre por `classificar`.
 * O texto livre NUNCA é dispensado: é ele que guarda o que foi conversado.
 *
 * Os KPIs e os chips de desfecho são FILTROS da lista abaixo: clicar mostra só
 * os pacientes daquele recorte; clicar de novo volta para todos.
 */

type Linha = {
  id: string
  status_acao: string | null
  desfecho_codigo: string | null
  resultado_acao: string | null
  concluido_em: string | null
  data_inicio: string | null
  descricao: string | null
  lead_id: string | null
  paciente_id: string | null
  pacientes: { nome: string | null } | null
  funil_leads: { nome: string | null } | null
}

type Desfecho = {
  codigo: string
  rotulo: string
  familia: 'positivo' | 'negativo' | 'continuidade'
  ordem: number
}

/** Deduz o desfecho do texto livre — só para linhas anteriores à lista. */
function classificar(texto: string | null | undefined): string {
  const t = String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  if (!t.trim()) return 'sem_registro'
  if (
    /fechamento (confirmado|comercial realizado|realizado)|fechou|fechado|pagamento .*(avista|vista|pix)|confirmou o fechamento/.test(
      t,
    )
  )
    return 'fechou'
  if (/fechamento agendado|agendad[oa] (o|para o) fechamento|marcad[oa] (o )?fechamento/.test(t))
    return 'fechou_entrada'
  if (
    /nao (atende|atendeu|respondeu)|sem retorno|nao obtive|chuva|telefone (nao|desligado)/.test(t)
  )
    return 'sem_contato'
  if (/reagend|remarc|nova data|adiad[oa]/.test(t)) return 'reagendou'
  if (/nao (tem|possui) interesse|desistiu|recusou|nao quis|sem interesse|nao vai fazer/.test(t))
    return 'desistiu'
  if (
    /vai pensar|prazo|aguard|avaliar|conversar com|esperar|conseguir o dinheiro|momento nao permite|posteriormente/.test(
      t,
    )
  )
    return 'vai_pensar'
  return 'em_negociacao'
}

const ROTULO: Record<string, string> = {
  fechou: 'Fechou',
  fechou_parcial: 'Fechou parcialmente',
  fechou_entrada: 'Fechou com entrada',
  desistiu: 'Desistiu',
  recusou_preco: 'Recusou por preço',
  vai_outra_clinica: 'Outra clínica',
  sem_interesse: 'Sem interesse',
  nao_elegivel: 'Não elegível',
  duplicado: 'Duplicado',
  sem_contato: 'Sem contato',
  pediu_retorno: 'Pediu retorno',
  vai_pensar: 'Vai pensar / pediu prazo',
  aguarda_pagamento: 'Vai receber e retorna',
  aguarda_terceiro: 'Depende de terceiro',
  em_negociacao: 'Em negociação',
  reagendou: 'Reagendou',
  agendou_avaliacao: 'Agendou avaliação',
  aguarda_documento: 'Aguarda documento',
  retorno_pos_consulta: 'Retorno pós-consulta',
  sem_registro: 'Sem resultado escrito',
  pendente: 'Pendente',
  cancelado: 'Cancelada',
}

const COR: Record<string, string> = {
  fechou: 'border-success/50 bg-success/12 text-success',
  fechou_parcial: 'border-success/50 bg-success/12 text-success',
  fechou_entrada: 'border-gold-ink/45 bg-gold-ink/12 text-gold-ink',
  em_negociacao: 'border-info/45 bg-info/12 text-info',
  vai_pensar: 'border-warning/50 bg-warning/14 text-foreground/85',
  reagendou: 'border-border-strong/60 bg-muted text-foreground/75',
  sem_contato: 'border-border bg-muted text-muted-foreground',
  desistiu: 'border-destructive/45 bg-destructive/12 text-destructive',
  sem_registro: 'border-border bg-muted/60 text-muted-foreground',
  pendente: 'border-info/45 bg-info/12 text-info',
  cancelado: 'border-border bg-muted/60 text-muted-foreground line-through',
}

const CHAVE_CONCLUIDO = 'concluido'
const CHAVE_TODOS = 'todos'
const CHAVE_POSITIVO = 'familia:positivo'

export function CrcInteracoesTab({
  ini,
  fim,
  crcFiltro,
  crcs,
}: {
  ini: string
  fim: string
  crcFiltro: string
  crcs: { id: string; nome: string }[]
  onSaved?: () => void
}) {
  const [linhas, setLinhas] = useState<Linha[]>([])
  const [desfechos, setDesfechos] = useState<Desfecho[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<string>(CHAVE_TODOS)

  const carregar = useCallback(async () => {
    setLoading(true)
    let q = supabase
      .from('compromissos')
      .select(
        'id, status_acao, desfecho_codigo, resultado_acao, concluido_em, data_inicio, descricao, lead_id, paciente_id, pacientes(nome), funil_leads(nome)',
      )
      .eq('setor', 'comercial')
      .gte('data_inicio', ini)
      .lte('data_inicio', fim)
      .order('data_inicio', { ascending: false })
      .limit(300)

    if (crcFiltro && crcFiltro !== 'todos') q = q.eq('usuario_id', crcFiltro)

    const { data } = await q
    setLinhas((data ?? []) as unknown as Linha[])
    setLoading(false)
  }, [ini, fim, crcFiltro])

  useEffect(() => {
    carregar()
  }, [carregar])

  useEffect(() => {
    let vivo = true
    const buscar = async () => {
      const { data } = await supabase
        .from('desfechos_comerciais')
        .select('codigo, rotulo, familia, ordem')
        .eq('ativo', true)
        .order('ordem')
      if (vivo) setDesfechos((data ?? []) as Desfecho[])
    }
    buscar()
    return () => {
      vivo = false
    }
  }, [])

  const meta = useMemo(() => {
    const m = new Map<string, Desfecho>()
    desfechos.forEach((d) => m.set(d.codigo, d))
    return m
  }, [desfechos])

  /** Chave de recorte de uma linha: pendente, ou o código do desfecho. */
  const chaveDe = useCallback(
    (l: Linha): string => {
      if (l.status_acao === 'cancelado') return 'cancelado'
      if (l.status_acao !== 'concluido') return 'pendente'
      const codigo = (l.desfecho_codigo || '').trim()
      if (codigo && (meta.size === 0 || meta.has(codigo))) return codigo
      return classificar(l.resultado_acao)
    },
    [meta],
  )

  const rotuloDe = useCallback((k: string): string => meta.get(k)?.rotulo ?? ROTULO[k] ?? k, [meta])

  const corDe = useCallback(
    (k: string): string => {
      if (COR[k]) return COR[k]
      const fam = meta.get(k)?.familia
      if (fam === 'positivo') return 'border-success/50 bg-success/12 text-success'
      if (fam === 'negativo') return 'border-destructive/45 bg-destructive/12 text-destructive'
      if (fam === 'continuidade') return 'border-info/45 bg-info/12 text-info'
      return 'border-border bg-muted text-foreground/70'
    },
    [meta],
  )

  const contagem = useMemo(() => {
    const m = new Map<string, number>()
    linhas.forEach((l) => {
      const k = chaveDe(l)
      m.set(k, (m.get(k) ?? 0) + 1)
    })
    return m
  }, [linhas, chaveDe])

  const nConcluidas = useMemo(
    () => linhas.filter((l) => l.status_acao === 'concluido').length,
    [linhas],
  )

  const chips = useMemo(() => {
    const arr: { chave: string; n: number; familia: string }[] = []
    contagem.forEach((n, k) => {
      if (k === 'pendente') return
      arr.push({ chave: k, n, familia: meta.get(k)?.familia ?? '' })
    })
    const ordemFam: Record<string, number> = {
      positivo: 0,
      negativo: 1,
      continuidade: 2,
      cancelado: 4,
    }
    return arr.sort(
      (a, b) =>
        (ordemFam[a.familia] ?? 3) - (ordemFam[b.familia] ?? 3) ||
        b.n - a.n ||
        rotuloDe(a.chave).localeCompare(rotuloDe(b.chave)),
    )
  }, [contagem, meta, rotuloDe])

  const filtradas = useMemo(() => {
    if (filtro === CHAVE_TODOS) return linhas
    if (filtro === CHAVE_CONCLUIDO) return linhas.filter((l) => l.status_acao === 'concluido')
    if (filtro === CHAVE_POSITIVO)
      return linhas.filter((l) => {
        const k = chaveDe(l)
        if (k === 'pendente') return false
        return (meta.get(k)?.familia ?? '') === 'positivo'
      })
    return linhas.filter((l) => chaveDe(l) === filtro)
  }, [linhas, filtro, chaveDe, meta])

  const nFechamentos = useMemo(() => {
    let n = 0
    contagem.forEach((qtd, k) => {
      if (k === 'pendente') return
      if ((meta.get(k)?.familia ?? '') === 'positivo') n += qtd
    })
    return n
  }, [contagem, meta])

  const alternar = useCallback((k: string) => {
    setFiltro((atual) => (atual === k ? CHAVE_TODOS : k))
  }, [])

  const nomeDe = (l: Linha) =>
    l.pacientes?.nome || l.funil_leads?.nome || l.descricao || '(sem paciente)'

  const kpis: { chave: string; titulo: string; valor: number; classe: string }[] = [
    {
      chave: CHAVE_TODOS,
      titulo: 'Ações no período',
      valor: linhas.length,
      classe: 'text-foreground',
    },
    {
      chave: CHAVE_CONCLUIDO,
      titulo: 'Concluídas',
      valor: nConcluidas,
      classe: 'text-success',
    },
    {
      chave: 'pendente',
      titulo: 'Pendentes',
      valor: contagem.get('pendente') ?? 0,
      classe: 'text-info',
    },
    {
      chave: CHAVE_POSITIVO,
      titulo: 'Fechamentos',
      valor: nFechamentos,
      classe: 'text-gold-ink',
    },
  ]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Phone className="size-4 text-muted-foreground" />
          Interações do CRC
        </CardTitle>
        <CardDescription>
          Sai das ações comerciais concluídas na Agenda — o mesmo registro que a CRC já faz, sem
          digitar de novo. Clique em um número ou em um desfecho para ver só os pacientes daquele
          recorte.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="grid gap-2 sm:grid-cols-4">
          {kpis.map((k) => {
            const ativo = filtro === k.chave
            return (
              <button
                key={k.chave}
                type="button"
                onClick={() => alternar(k.chave)}
                aria-pressed={ativo}
                title={ativo ? 'Clique para limpar o filtro' : `Ver só: ${k.titulo.toLowerCase()}`}
                className={
                  'rounded-lg border p-2.5 text-left transition-colors hover:border-brand-navy/50 hover:bg-muted/70 ' +
                  (ativo
                    ? 'border-brand-navy bg-brand-navy/10 ring-2 ring-brand-navy/30'
                    : 'border-border bg-muted/40')
                }
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                    {k.titulo}
                  </span>
                  {ativo && <X className="size-3 text-brand-navy" />}
                </div>
                <div className={'tabular text-[19px] font-extrabold ' + k.classe}>{k.valor}</div>
              </button>
            )
          })}
        </div>

        {chips.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
              <Filter className="size-3" />
              Desfecho — clique para filtrar a lista
            </div>
            <div className="flex flex-wrap gap-1.5">
              {chips.map(({ chave, n }) => {
                const ativo = filtro === chave
                return (
                  <button
                    key={chave}
                    type="button"
                    onClick={() => alternar(chave)}
                    aria-pressed={ativo}
                    className={
                      'rounded-full border px-2.5 py-0.5 text-[11.5px] font-semibold transition-colors ' +
                      corDe(chave) +
                      (ativo
                        ? ' ring-2 ring-brand-navy/40 ring-offset-1 ring-offset-background'
                        : ' opacity-90 hover:opacity-100')
                    }
                  >
                    {rotuloDe(chave)}: {n}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {filtro !== CHAVE_TODOS && (
          <div className="flex items-center justify-between gap-2 rounded-md border border-brand-navy/30 bg-brand-navy/5 px-2.5 py-1.5">
            <span className="text-[11.5px] font-semibold text-foreground/85">
              Filtrando por{' '}
              <span className="font-extrabold">
                {filtro === CHAVE_CONCLUIDO
                  ? 'concluídas'
                  : filtro === CHAVE_POSITIVO
                    ? 'fechamentos'
                    : rotuloDe(filtro)}
              </span>{' '}
              — {filtradas.length} de {linhas.length}
            </span>
            <button
              type="button"
              onClick={() => setFiltro(CHAVE_TODOS)}
              className="flex items-center gap-1 rounded border border-border bg-background px-1.5 py-0.5 text-[11px] font-semibold text-foreground/80 hover:bg-muted"
            >
              <X className="size-3" /> Limpar
            </button>
          </div>
        )}

        {loading && <Skeleton className="h-20 w-full" />}

        {!loading && linhas.length === 0 && (
          <div className="rounded-lg border border-dashed border-border py-8 text-center">
            <p className="text-sm font-semibold text-foreground/80">
              Nenhuma ação comercial no período
            </p>
            <p className="text-xs text-muted-foreground">
              As ações aparecem aqui quando a CRC as cria na Agenda.
            </p>
          </div>
        )}

        {!loading && linhas.length > 0 && filtradas.length === 0 && (
          <div className="rounded-lg border border-dashed border-border py-6 text-center">
            <p className="text-sm font-semibold text-foreground/80">
              Nenhum paciente neste desfecho
            </p>
            <button
              type="button"
              onClick={() => setFiltro(CHAVE_TODOS)}
              className="mt-1 text-xs font-semibold text-brand-navy underline"
            >
              Ver todas as {linhas.length} ações
            </button>
          </div>
        )}

        {!loading && filtradas.length > 0 && (
          <div className="divide-y divide-border">
            {filtradas.map((l) => {
              const k = chaveDe(l)
              return (
                <div key={l.id} className="flex items-start justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline" className={corDe(k)}>
                        {rotuloDe(k)}
                      </Badge>
                      <span className="truncate text-[12.5px] font-semibold text-foreground/90">
                        {nomeDe(l)}
                      </span>
                      <span className="tabular text-[11px] text-muted-foreground">
                        {l.data_inicio ? l.data_inicio.split('-').reverse().join('/') : ''}
                      </span>
                    </div>
                    {l.resultado_acao && (
                      <p className="mt-0.5 line-clamp-2 text-[12px] text-foreground/70">
                        {l.resultado_acao}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Phone } from 'lucide-react'
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
 * Antes existia aqui um formulário próprio (contatos_follow_up) pedindo
 * desfecho, canal e resumo — o mesmo trabalho, em outro lugar. Nunca foi
 * usado: zero registros. Foi removido para não duplicar a obrigação dela.
 */

type Linha = {
  id: string
  status_acao: string | null
  resultado_acao: string | null
  concluido_em: string | null
  data_inicio: string | null
  descricao: string | null
  lead_id: string | null
  paciente_id: string | null
  pacientes: { nome: string | null } | null
  funil_leads: { nome: string | null } | null
}

/** Classifica o texto livre da CRC num desfecho tipificado. */
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
    return 'fechamento_agendado'
  if (
    /nao (atende|atendeu|respondeu)|sem retorno|nao obtive|chuva|telefone (nao|desligado)/.test(t)
  )
    return 'sem_contato'
  if (/reagend|remarc|nova data|adiad[oa]/.test(t)) return 'reagendou'
  if (/nao (tem|possui) interesse|desistiu|recusou|nao quis|sem interesse|nao vai fazer/.test(t))
    return 'negou'
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
  fechamento_agendado: 'Fechamento agendado',
  em_negociacao: 'Em negociação',
  vai_pensar: 'Vai pensar / pediu prazo',
  reagendou: 'Reagendou',
  negou: 'Negou / sem interesse',
  sem_contato: 'Sem contato',
  sem_registro: 'Sem resultado escrito',
}

const COR: Record<string, string> = {
  fechou: 'border-success/40 bg-success/10 text-success',
  fechamento_agendado: 'border-gold-ink/40 bg-gold-ink/10 text-gold-ink',
  em_negociacao: 'border-info/40 bg-info/10 text-info',
  vai_pensar: 'border-warning/40 bg-warning/10 text-foreground/80',
  reagendou: 'border-border bg-muted text-foreground/70',
  negou: 'border-destructive/40 bg-destructive/10 text-destructive',
  sem_contato: 'border-border bg-muted text-muted-foreground',
  sem_registro: 'border-border bg-muted/60 text-muted-foreground',
}

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
  const [loading, setLoading] = useState(true)

  const carregar = useCallback(async () => {
    setLoading(true)
    let q = supabase
      .from('compromissos')
      .select(
        'id, status_acao, resultado_acao, concluido_em, data_inicio, descricao, lead_id, paciente_id, pacientes(nome), funil_leads(nome)',
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

  const concluidas = useMemo(() => linhas.filter((l) => l.status_acao === 'concluido'), [linhas])

  const porDesfecho = useMemo(() => {
    const m = new Map<string, number>()
    concluidas.forEach((l) => {
      const d = classificar(l.resultado_acao)
      m.set(d, (m.get(d) ?? 0) + 1)
    })
    return m
  }, [concluidas])

  const nomeDe = (l: Linha) =>
    l.pacientes?.nome || l.funil_leads?.nome || l.descricao || '(sem paciente)'

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Phone className="size-4 text-muted-foreground" />
          Interações do CRC
        </CardTitle>
        <CardDescription>
          Sai das ações comerciais concluídas na Agenda — o mesmo registro que a CRC já faz, sem
          digitar de novo. Inclui as tentativas ainda pendentes para medir esforço.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="grid gap-2 sm:grid-cols-4">
          <div className="rounded-lg border border-border bg-muted/40 p-2.5">
            <div className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
              Ações no período
            </div>
            <div className="tabular text-[19px] font-extrabold">{linhas.length}</div>
          </div>
          <div className="rounded-lg border border-border bg-muted/40 p-2.5">
            <div className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
              Concluídas
            </div>
            <div className="tabular text-[19px] font-extrabold text-success">
              {concluidas.length}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-muted/40 p-2.5">
            <div className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
              Pendentes
            </div>
            <div className="tabular text-[19px] font-extrabold text-info">
              {linhas.filter((l) => l.status_acao === 'pendente').length}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-muted/40 p-2.5">
            <div className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
              Fechamentos
            </div>
            <div className="tabular text-[19px] font-extrabold text-gold-ink">
              {porDesfecho.get('fechou') ?? 0}
            </div>
          </div>
        </div>

        {concluidas.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {[...porDesfecho.entries()]
              .sort((a, b) => b[1] - a[1])
              .map(([d, n]) => (
                <Badge key={d} variant="outline" className={COR[d]}>
                  {ROTULO[d] ?? d}: {n}
                </Badge>
              ))}
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

        {!loading && linhas.length > 0 && (
          <div className="divide-y divide-border">
            {linhas.map((l) => {
              const d = l.status_acao === 'concluido' ? classificar(l.resultado_acao) : 'pendente'
              return (
                <div key={l.id} className="flex items-start justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className={
                          d === 'pendente' ? 'border-info/40 bg-info/10 text-info' : COR[d]
                        }
                      >
                        {d === 'pendente' ? 'Pendente' : (ROTULO[d] ?? d)}
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

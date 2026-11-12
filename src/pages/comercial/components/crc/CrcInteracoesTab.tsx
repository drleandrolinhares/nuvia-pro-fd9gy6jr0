import { useCallback, useEffect, useMemo, useState } from 'react'
import { MessageSquarePlus, Phone, Save, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'

const DESFECHOS = [
  { v: 'sem_contato', l: 'Sem contato (não atendeu)' },
  { v: 'em_negociacao', l: 'Em negociação' },
  { v: 'agendou_avaliacao', l: 'Agendou avaliação' },
  { v: 'reagendou', l: 'Reagendou' },
  { v: 'fechou', l: 'Fechou' },
  { v: 'negou', l: 'Negou / recusou' },
] as const

const CANAIS = ['WhatsApp', 'Ligação', 'Presencial', 'E-mail', 'Outro'] as const

const corDesfecho: Record<string, string> = {
  fechou: 'border-success/40 bg-success/10 text-success',
  em_negociacao: 'border-gold-ink/40 bg-gold-ink/10 text-gold-ink',
  agendou_avaliacao: 'border-info/40 bg-info/10 text-info',
  reagendou: 'border-border bg-muted text-foreground/70',
  negou: 'border-destructive/40 bg-destructive/10 text-destructive',
  sem_contato: 'border-border bg-muted text-muted-foreground',
}

type Linha = {
  id: string
  data_contato: string
  canal: string | null
  desfecho: string | null
  resultado: string | null
  resumo_conversa: string | null
  responsavel_id: string | null
}

export function CrcInteracoesTab({
  ini,
  fim,
  crcFiltro,
  crcs,
  onSaved,
}: {
  ini: string
  fim: string
  crcFiltro: string
  crcs: { id: string; nome: string }[]
  onSaved: () => void
}) {
  const { toast } = useToast()
  const [linhas, setLinhas] = useState<Linha[]>([])
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [avaliacoes, setAvaliacoes] = useState<
    { id: string; paciente: string; valor: number; data: string }[]
  >([])

  const [avaliacaoId, setAvaliacaoId] = useState('')
  const [canal, setCanal] = useState<string>('WhatsApp')
  const [desfecho, setDesfecho] = useState<string>('em_negociacao')
  const [resumo, setResumo] = useState('')

  const carregar = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('contatos_follow_up')
      .select('id, data_contato, canal, desfecho, resultado, resumo_conversa, responsavel_id')
      .gte('data_contato', `${ini}T00:00:00`)
      .lte('data_contato', `${fim}T23:59:59`)
      .order('data_contato', { ascending: false })
      .limit(200)
    if (error) {
      toast({
        title: 'Erro ao carregar interações',
        description: error.message,
        variant: 'destructive',
      })
    } else setLinhas((data ?? []) as Linha[])
    setLoading(false)
  }, [ini, fim, toast])

  useEffect(() => {
    carregar()
  }, [carregar])

  // Oportunidades abertas do período, para vincular a interação
  // Oportunidades abertas do período — restritas ao escopo do CRC selecionado
  useEffect(() => {
    let q = supabase
      .from('avaliacoes')
      .select('id, data_avaliacao, valor_orcamento, crc_comercial_id, pacientes(nome)')
      .eq('status', 'avaliacao_realizada')
      .gte('data_avaliacao', ini)
      .lte('data_avaliacao', fim)
      .order('data_avaliacao', { ascending: false })
      .limit(300)
    q = q.not('crc_comercial_id', 'is', null)
    q.then(({ data }) => {
      if (data)
        setAvaliacoes(
          (data as any[]).map((a) => ({
            id: a.id,
            paciente: a.pacientes?.nome ?? '(sem nome)',
            valor: Number(a.valor_orcamento ?? 0),
            data: a.data_avaliacao,
          })),
        )
    })
  }, [ini, fim])

  const salvar = async () => {
    if (!avaliacaoId) {
      toast({
        title: 'Escolha a oportunidade',
        description: 'Selecione o paciente desta interação.',
      })
      return
    }
    setSalvando(true)
    const { data: userData } = await supabase.auth.getUser()
    const { error } = await supabase.from('contatos_follow_up').insert({
      avaliacao_id: avaliacaoId,
      data_contato: new Date().toISOString(),
      responsavel_id: userData?.user?.id ?? null,
      canal,
      desfecho,
      resumo_conversa: resumo || null,
    } as any)
    setSalvando(false)
    if (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
      return
    }
    toast({
      title: 'Interação registrada',
      description: 'A performance do período foi recalculada.',
    })
    setResumo('')
    setAvaliacaoId('')
    carregar()
    onSaved()
  }

  const excluir = async (id: string) => {
    const { error } = await supabase.from('contatos_follow_up').delete().eq('id', id)
    if (error) {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' })
      return
    }
    carregar()
    onSaved()
  }

  const resumoDesfechos = useMemo(() => {
    const m = new Map<string, number>()
    linhas.forEach((l) =>
      m.set(l.desfecho ?? 'sem_contato', (m.get(l.desfecho ?? 'sem_contato') ?? 0) + 1),
    )
    return m
  }, [linhas])

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Phone className="size-4 text-muted-foreground" />
          Interações do CRC
        </CardTitle>
        <CardDescription>
          Cada contato com desfecho. É daqui que saem tempo médio de fechamento e nº de toques por
          venda.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {/* Registro */}
        <div className="grid gap-2 rounded-lg border border-border bg-muted/40 p-3 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <label className="mb-1 block text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
              Oportunidade
            </label>
            <Select value={avaliacaoId} onValueChange={setAvaliacaoId}>
              <SelectTrigger className="h-9 bg-card">
                <SelectValue placeholder="Paciente..." />
              </SelectTrigger>
              <SelectContent>
                {avaliacoes.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.paciente} · {a.data}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="lg:col-span-2">
            <label className="mb-1 block text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
              Canal
            </label>
            <Select value={canal} onValueChange={setCanal}>
              <SelectTrigger className="h-9 bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CANAIS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="lg:col-span-3">
            <label className="mb-1 block text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
              Desfecho
            </label>
            <Select value={desfecho} onValueChange={setDesfecho}>
              <SelectTrigger className="h-9 bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DESFECHOS.map((d) => (
                  <SelectItem key={d.v} value={d.v}>
                    {d.l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="lg:col-span-3">
            <label className="mb-1 block text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
              Resumo (opcional)
            </label>
            <Input
              value={resumo}
              onChange={(e) => setResumo(e.target.value)}
              placeholder="O que ficou combinado..."
              className="h-9 bg-card"
            />
          </div>
          <div className="lg:col-span-12">
            <Button size="sm" onClick={salvar} disabled={salvando}>
              <Save className="size-4" />
              {salvando ? 'Registrando...' : 'Registrar interação'}
            </Button>
          </div>
        </div>

        {/* Resumo por desfecho */}
        {linhas.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {DESFECHOS.map((d) => {
              const n = resumoDesfechos.get(d.v) ?? 0
              if (!n) return null
              return (
                <Badge key={d.v} variant="outline" className={corDesfecho[d.v]}>
                  {d.l}: {n}
                </Badge>
              )
            })}
          </div>
        )}

        {/* Lista */}
        {loading && <Skeleton className="h-20 w-full" />}
        {!loading && linhas.length === 0 && (
          <div className="rounded-lg border border-dashed border-border py-8 text-center">
            <MessageSquarePlus className="mx-auto size-7 text-border-strong" />
            <p className="mt-1.5 text-sm font-semibold text-foreground/80">
              Nenhuma interação registrada no período
            </p>
            <p className="text-xs text-muted-foreground">
              Registrar o contato é o que permite medir esforço, não só resultado.
            </p>
          </div>
        )}
        {!loading && linhas.length > 0 && (
          <div className="divide-y divide-border">
            {linhas.map((l) => (
              <div key={l.id} className="flex items-start justify-between gap-3 py-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline" className={corDesfecho[l.desfecho ?? 'sem_contato']}>
                      {DESFECHOS.find((d) => d.v === l.desfecho)?.l ?? 'Sem desfecho'}
                    </Badge>
                    {l.canal && (
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {l.canal}
                      </span>
                    )}
                    <span className="tabular text-[11px] text-muted-foreground">
                      {new Date(l.data_contato).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  {(l.resumo_conversa || l.resultado) && (
                    <p className="mt-0.5 truncate text-[12.5px] text-foreground/80">
                      {l.resumo_conversa || l.resultado}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => excluir(l.id)}
                  title="Excluir interação"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

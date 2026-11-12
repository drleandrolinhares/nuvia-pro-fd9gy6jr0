import { useCallback, useEffect, useState } from 'react'
import { AlertTriangle, ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'

const brl = (v: number | null | undefined) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v ?? 0))

const dataBR = (d: string | null) =>
  d ? new Date(`${d}T12:00:00`).toLocaleDateString('pt-BR') : '—'

type Duplicada = {
  paciente: string
  valor: number
  avaliacao_aberta_id: string
  aberta_em: string
  avaliacoes_vendidas: number
  vendida_em: string | null
  vendas_lancadas: number
  valor_vendido: number
  acao_sugerida: string
}

/**
 * Bloco de exigência: oportunidade em aberto E vendida com o mesmo valor.
 *
 * Não corrige nada sozinho — mostra o caso e o que precisa ser decidido.
 * A regra é do Leandro: o mesmo paciente não pode estar nas duas abas
 * com o mesmo valor, porque isso conta o dinheiro duas vezes.
 */
export function VendasDuplicidades({
  ini,
  fim,
  refreshKey,
}: {
  ini: string
  fim: string
  refreshKey?: number
}) {
  const [linhas, setLinhas] = useState<Duplicada[]>([])
  const [aberto, setAberto] = useState(false)
  const [loading, setLoading] = useState(true)

  const carregar = useCallback(() => {
    setLoading(true)
    supabase.rpc('oportunidades_duplicadas', { p_ini: ini, p_fim: fim }).then(({ data }) => {
      setLinhas((data ?? []) as Duplicada[])
      setLoading(false)
    })
  }, [ini, fim])

  useEffect(() => {
    carregar()
  }, [carregar, refreshKey])

  if (loading || linhas.length === 0) return null

  const totalEmJogo = linhas.reduce((a, l) => a + Number(l.valor), 0)

  return (
    <Card className="border-destructive/40 bg-destructive/5">
      <CardContent className="p-0">
        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          className="flex w-full items-start justify-between gap-3 p-3.5 text-left"
        >
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-destructive/15">
              <ShieldAlert className="size-4 text-destructive" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[13px] font-bold text-foreground">
                  {linhas.length}{' '}
                  {linhas.length === 1
                    ? 'oportunidade duplicada precisa de resolução'
                    : 'oportunidades duplicadas precisam de resolução'}
                </span>
                <Badge
                  variant="outline"
                  className="tabular border-destructive/40 bg-card px-1.5 py-0 text-[10.5px] font-bold text-destructive"
                >
                  {brl(totalEmJogo)} contados duas vezes
                </Badge>
              </div>
              <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted-foreground">
                O mesmo paciente aparece em aberto e como vendido com o mesmo valor. Um dos dois
                lançamentos precisa ser encerrado.
              </p>
            </div>
          </div>
          <span className="mt-1 shrink-0 text-muted-foreground">
            {aberto ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </span>
        </button>

        {aberto && (
          <div className="border-t border-destructive/25 px-3.5 pb-3.5 pt-2">
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
                    <th className="py-1.5 pr-2 text-left font-bold">Paciente</th>
                    <th className="px-2 py-1.5 text-right font-bold">Valor</th>
                    <th className="px-2 py-1.5 text-center font-bold">Aberta em</th>
                    <th className="px-2 py-1.5 text-center font-bold">Vendida em</th>
                    <th className="px-2 py-1.5 text-center font-bold">Vendas lançadas</th>
                    <th className="px-2 py-1.5 text-left font-bold">O que fazer</th>
                  </tr>
                </thead>
                <tbody>
                  {linhas.map((l) => (
                    <tr
                      key={l.avaliacao_aberta_id}
                      className="border-b border-border/50 last:border-0"
                    >
                      <td className="py-1.5 pr-2 font-semibold text-foreground">{l.paciente}</td>
                      <td className="tabular px-2 py-1.5 text-right font-bold text-destructive">
                        {brl(l.valor)}
                      </td>
                      <td className="tabular px-2 py-1.5 text-center text-muted-foreground">
                        {dataBR(l.aberta_em)}
                      </td>
                      <td className="tabular px-2 py-1.5 text-center text-muted-foreground">
                        {dataBR(l.vendida_em)}
                      </td>
                      <td className="tabular px-2 py-1.5 text-center">
                        <span className="font-bold text-foreground">{l.vendas_lancadas}</span>
                        <span className="text-muted-foreground"> · {brl(l.valor_vendido)}</span>
                      </td>
                      <td className="px-2 py-1.5 text-[11.5px] leading-snug text-foreground/80">
                        {l.acao_sugerida}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
              <AlertTriangle className="mt-0.5 size-3 shrink-0 text-destructive" />
              Enquanto não for resolvido, o valor aparece nas duas abas e infla a oportunidade
              total. Abra a oportunidade na aba Oportunidades e encerre o lançamento duplicado.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 h-7 text-[11.5px]"
              onClick={carregar}
            >
              Revalidar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

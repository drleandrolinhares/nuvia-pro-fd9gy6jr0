import { useCallback, useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0)

const hora = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

/**
 * Botão ATUALIZAR NO CLINICORP.
 *
 * Lê os orçamentos EM ABERTO do Clinicorp e traz para o NUVIA PRO.
 * A credencial fica só no servidor (Edge Function clinicorp-sync): o
 * navegador nunca vê o token. A hora da última leitura fica visível
 * porque o Clinicorp cacheia a resposta por alguns minutos — sem isso
 * alguém clica três vezes achando que falhou.
 */
export function AtualizarClinicorp({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast()
  const [rodando, setRodando] = useState(false)
  const [ultima, setUltima] = useState<string | null>(null)

  const carregarUltima = useCallback(async () => {
    const { data } = await supabase
      .from('clinicorp_sincronizacao')
      .select('executado_em')
      .order('executado_em', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (data?.executado_em) setUltima(data.executado_em as string)
  }, [])

  useEffect(() => {
    carregarUltima()
  }, [carregarUltima])

  const atualizar = async () => {
    setRodando(true)
    try {
      const { data, error } = await supabase.functions.invoke('clinicorp-sync', {
        body: { mes: new Date().toISOString().slice(0, 7) },
      })
      if (error) throw error
      if (data?.error) throw new Error(data.error)

      toast({
        title: 'Clinicorp lido',
        description: `${data.aberto_qtd} oportunidade(s) em aberto · ${brl(data.aberto_valor)} — ${data.importadas} nova(s), ${data.atualizadas} atualizada(s)${data.deduplicadas ? `, ${data.deduplicadas} deduplicada(s)` : ''}.`,
      })
      setUltima(data.executado_em)
      onSuccess?.()
    } catch (e: any) {
      toast({
        title: 'Não foi possível atualizar',
        description: e?.message ?? 'Falha ao consultar o Clinicorp.',
        variant: 'destructive',
      })
    } finally {
      setRodando(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button onClick={atualizar} disabled={rodando} variant="outline" size="sm">
        <RefreshCw className={`mr-1.5 size-3.5 ${rodando ? 'animate-spin' : ''}`} />
        {rodando ? 'Lendo…' : 'Atualizar no Clinicorp'}
      </Button>
      {ultima && (
        <span className="text-[11px] leading-tight text-muted-foreground">
          Última leitura
          <br />
          {hora(ultima)}
        </span>
      )}
    </div>
  )
}

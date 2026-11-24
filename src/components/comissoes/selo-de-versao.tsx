import { useEffect, useState } from 'react'

/**
 * Selo de build em execução.
 *
 * Motivo (23/11/2026): o Leandro enviou três prints "provando" que uma correção
 * não funcionava, quando a aba dele rodava um bundle de dias antes — o texto na
 * tela ("% Performance", "Vendas (21)") já não existia no código publicado.
 * Sem uma marca visível não dava para separar "cálculo errado" de "código
 * velho", e cada rodada custou horas.
 *
 * Aqui a tela mostra:
 *  - o hash do bundle que ESTÁ RODANDO (lido do próprio <script>);
 *  - o hash que o SERVIDOR está publicando agora;
 *  - "ATUALIZADO" ou "desatualizado · atualizar".
 *
 * Assim a comparação deixa de ser suposição: bate o olho e sabe.
 */

function bundleRodando(): string | null {
  const scripts = Array.from(document.querySelectorAll<HTMLScriptElement>('script[src]'))
  for (const s of scripts) {
    const m = /index-[A-Za-z0-9_-]+\.js/.exec(s.src)
    if (m) return m[0].replace(/^index-/, '').replace(/\.js$/, '')
  }
  return null
}

export function SeloDeVersao() {
  const [rodando] = useState<string | null>(() => bundleRodando())
  const [servidor, setServidor] = useState<string | null>(null)
  const [conferido, setConferido] = useState(false)

  useEffect(() => {
    let vivo = true
    const conferir = async () => {
      try {
        const r = await fetch(`/?_v=${Date.now()}`, { cache: 'no-store' })
        if (!r.ok) return
        const html = await r.text()
        const m = /index-([A-Za-z0-9_-]+)\.js/.exec(html)
        if (vivo && m) {
          setServidor(m[1])
          setConferido(true)
        }
      } catch {
        /* rede instável: mantém o que já tem */
      }
    }
    conferir()
    const t = window.setInterval(conferir, 30_000)
    return () => {
      vivo = false
      window.clearInterval(t)
    }
  }, [])

  if (!rodando) return null

  const desatualizado = conferido && servidor && servidor !== rodando

  return (
    <div
      className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[11px] font-medium ${
        desatualizado
          ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
          : 'border-slate-700 bg-slate-800/60 text-slate-400'
      }`}
      title={`Em execução: ${rodando}${servidor ? ` · Publicado: ${servidor}` : ''}`}
    >
      <span className="font-mono">build {rodando}</span>
      {desatualizado ? (
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded bg-amber-500 px-2 py-0.5 text-[11px] font-bold text-slate-950 hover:bg-amber-400"
        >
          desatualizado · atualizar
        </button>
      ) : (
        <span className="text-emerald-400">{conferido ? 'atualizado' : 'conferindo…'}</span>
      )}
    </div>
  )
}

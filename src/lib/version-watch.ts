/**
 * Vigia de versão.
 *
 * O bundle é servido com `cache-control: immutable` (JS com hash no nome), e o
 * `index.html` é `no-cache`. Isso significa que uma aba já aberta continua
 * rodando o código do dia em que foi carregada: publicar uma correção NÃO
 * chega em quem está com o sistema aberto — nem no F5 do colega de outra aba,
 * porque cada aba carrega o índice uma vez só.
 *
 * Resultado prático (12/11/2026): corrigi os cards do CRC, publiquei, testei
 * pelo bundle novo e o Leandro continuou vendo a tela antiga — os cards não
 * respondiam porque o JS dele não tinha o clique.
 *
 * Aqui o app compara o hash do bundle que está rodando com o que o servidor
 * publica agora. Se mudou:
 *  - aba em segundo plano  -> recarrega na hora (ninguém está digitando);
 *  - aba em uso            -> faixa discreta no topo, para ele decidir quando
 *                             recarregar sem perder o que estava fazendo.
 * Nada de depender de o usuário saber que precisa limpar o cache.
 */

// 60s era lento demais: em 23/11/2026 o Leandro passou mais de uma hora olhando
// números de um bundle antigo (taxa 0,0% com comissão calculada) enquanto três
// correções já estavam publicadas. 20s reduz a janela sem custo perceptível.
const INTERVALO_MS = 20_000

function bundleAtual(): string | null {
  const scripts = Array.from(document.querySelectorAll<HTMLScriptElement>('script[src]'))
  for (const s of scripts) {
    const m = /\/assets\/index-[A-Za-z0-9_-]+\.js/.exec(s.src)
    if (m) return m[0]
  }
  return null
}

function mostrarFaixa(aoRecarregar: () => void) {
  if (document.getElementById('nv-version-banner')) return
  const el = document.createElement('div')
  el.id = 'nv-version-banner'
  el.setAttribute('role', 'status')
  el.style.cssText = [
    'position:fixed',
    'left:50%',
    'transform:translateX(-50%)',
    'bottom:18px',
    'z-index:2147483000',
    'display:flex',
    'align-items:center',
    'gap:10px',
    'padding:9px 12px',
    'border-radius:10px',
    'border:1px solid hsl(216 15% 68%)',
    'background:hsl(0 0% 100%)',
    'box-shadow:0 8px 28px rgba(11,26,43,.18)',
    'font:600 12.5px Inter, ui-sans-serif, system-ui, sans-serif',
    'color:hsl(222 47% 11%)',
  ].join(';')

  const txt = document.createElement('span')
  txt.textContent = 'Nova versão do sistema disponível.'

  const btn = document.createElement('button')
  btn.type = 'button'
  btn.textContent = 'Atualizar agora'
  btn.style.cssText = [
    'border:0',
    'border-radius:7px',
    'padding:5px 10px',
    'background:hsl(214 60% 22%)',
    'color:#fff',
    'font:700 12px Inter, ui-sans-serif, system-ui, sans-serif',
    'cursor:pointer',
  ].join(';')
  btn.addEventListener('click', () => {
    btn.disabled = true
    btn.textContent = 'Atualizando…'
    aoRecarregar()
  })

  const fechar = document.createElement('button')
  fechar.type = 'button'
  fechar.textContent = '×'
  fechar.setAttribute('aria-label', 'Dispensar')
  fechar.style.cssText = [
    'border:0',
    'background:transparent',
    'color:hsl(215 20% 45%)',
    'font:700 15px/1 Inter, sans-serif',
    'cursor:pointer',
    'padding:0 2px',
  ].join(';')
  fechar.addEventListener('click', () => el.remove())

  el.append(txt, btn, fechar)
  document.body.appendChild(el)
}

export function vigiarVersao() {
  const atual = bundleAtual()
  if (!atual) return

  let pendente = false
  const recarregar = () => window.location.reload()

  const conferir = async () => {
    if (pendente) return
    try {
      const r = await fetch(`/?_nv=${Date.now()}`, { cache: 'no-store' })
      if (!r.ok) return
      const html = await r.text()
      const m = /\/assets\/index-[A-Za-z0-9_-]+\.js/.exec(html)
      if (!m || m[0] === atual) return
      pendente = true
      // Aba escondida: recarrega direto, ninguém está com nada pela metade.
      if (document.hidden) {
        recarregar()
        return
      }
      mostrarFaixa(recarregar)
    } catch {
      /* rede instável: tentar de novo no próximo ciclo */
    }
  }

  // Voltar para a aba é o momento em que a versão velha mais engana.
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      if (pendente) {
        if (!document.getElementById('nv-version-banner')) mostrarFaixa(recarregar)
      } else {
        conferir()
      }
    }
  })
  window.addEventListener('focus', conferir)
  window.setInterval(() => {
    if (!document.hidden) conferir()
  }, INTERVALO_MS)

  // `pageshow` com persisted=true é a volta do bfcache (Safari/Firefox): a
  // página ressuscita com o código antigo e os timers ficam parados enquanto
  // ela está congelada. Sem isto, uma aba "de ontem" pode voltar sem conferir.
  window.addEventListener('pageshow', (ev: any) => {
    if (ev?.persisted) {
      conferir()
    } else {
      conferir()
    }
  })

  // Primeira conferência depois que a tela já carregou.
  window.setTimeout(conferir, 2500)
}

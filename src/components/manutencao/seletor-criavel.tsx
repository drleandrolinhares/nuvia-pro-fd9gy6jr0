import { useMemo, useRef, useState, type ReactNode } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check, ChevronsUpDown, Plus, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ============================================================================
 * Seletor com busca que também cria.
 *
 * Regra do Leandro (24/11/2026): não sair da página para cadastrar. Se o que
 * ele procura não existe — ou ele digita um nome novo — o registro é criado
 * ali mesmo, dentro do formulário, e já fica selecionado.
 *
 * A busca aceita:
 *  · parte do nome            "cond"  -> Ar-condicionado
 *  · iniciais das palavras    "ac"    -> Ar-condicionado
 *  · letras em sequência      "arcd"  -> Ar-condicionado
 * ========================================================================== */

export interface OpcaoSelecao {
  id: string
  nome: string
  detalhe?: string | null
}

const normaliza = (s: string) =>
  (s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

/**
 * casa por trecho do nome, por INICIAIS das palavras ("ac" -> Ar-condicionado
 * Consultório) ou pelo começo de qualquer palavra ("comp" -> Compressor).
 *
 * Deliberadamente NÃO casa letras soltas em sequência: com aquele critério,
 * "caso" trazia "Ar-condicionado Consultório 1" e a lista virava ruído.
 */
export function casaBusca(nome: string, consulta: string): boolean {
  const n = normaliza(nome)
  const b = normaliza(consulta)
  if (!b) return true

  // 1) trecho literal em qualquer posição
  if (n.includes(b)) return true

  const palavras = n.split(/[\s/\-_.()]+/).filter(Boolean)

  // 2) alguma palavra começa com o que foi digitado
  if (palavras.some((p) => p.startsWith(b))) return true

  // 3) as iniciais das palavras começam com o que foi digitado
  const iniciais = palavras.map((p) => p[0]).join('')
  if (iniciais.startsWith(b)) return true

  // 4) a consulta casa com o início de palavras consecutivas
  //    "arcd" -> Ar-condicionado ; "arcond" -> Ar-condicionado
  const semEspaco = palavras.join('')
  if (semEspaco.startsWith(b)) return true

  return false
}

export function SeletorCriavel({
  opcoes,
  valor,
  onSelecionar,
  placeholder = 'Selecione',
  textoVazio = 'Nada cadastrado ainda.',
  textoCriar = 'Criar',
  rotuloCriar,
  criacao,
  desabilitado,
  className,
}: {
  opcoes: OpcaoSelecao[]
  valor?: string | null
  onSelecionar: (id: string) => void
  placeholder?: string
  textoVazio?: string
  textoCriar?: string
  rotuloCriar?: string
  /** formulário curto exibido ao clicar em criar; deve fechar o popover ao gravar */
  criacao?: (termo: string, fechar: () => void) => ReactNode
  desabilitado?: boolean
  className?: string
}) {
  const [aberto, setAberto] = useState(false)
  const [termo, setTermo] = useState('')
  const [criando, setCriando] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const selecionada = useMemo(() => opcoes.find((o) => o.id === valor), [opcoes, valor])

  const filtradas = useMemo(() => {
    const lista = opcoes.filter((o) => casaBusca(o.nome, termo))
    return lista.slice(0, 60)
  }, [opcoes, termo])

  const existeExato = useMemo(
    () => opcoes.some((o) => normaliza(o.nome) === normaliza(termo)),
    [opcoes, termo],
  )

  const fechar = () => {
    setAberto(false)
    setCriando(false)
    setTermo('')
  }

  return (
    <Popover
      open={aberto}
      onOpenChange={(o) => {
        setAberto(o)
        if (!o) {
          setCriando(false)
          setTermo('')
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={aberto}
          disabled={desabilitado}
          className={cn(
            'h-10 w-full justify-between px-3 text-left font-normal',
            !selecionada && 'text-muted-foreground',
            className,
          )}
        >
          <span className="truncate">{selecionada ? selecionada.nome : placeholder}</span>
          <ChevronsUpDown className="ml-1 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[--radix-popover-trigger-width] min-w-[280px] p-0"
        align="start"
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          setTimeout(() => inputRef.current?.focus(), 10)
        }}
      >
        {criando && criacao ? (
          <div className="p-3">{criacao(termo, fechar)}</div>
        ) : (
          <>
            <div className="flex items-center gap-2 border-b border-border px-2.5 py-2">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={termo}
                onChange={(e) => setTermo(e.target.value)}
                placeholder="Buscar ou digitar um nome novo…"
                className="h-7 w-full bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    if (filtradas.length === 1 && !termo.trim()) {
                      onSelecionar(filtradas[0].id)
                      fechar()
                    } else if (filtradas.length === 1 && existeExato) {
                      onSelecionar(filtradas[0].id)
                      fechar()
                    } else if (criacao && termo.trim() && !existeExato) {
                      setCriando(true)
                    } else if (filtradas.length >= 1) {
                      onSelecionar(filtradas[0].id)
                      fechar()
                    }
                  }
                }}
              />
            </div>

            <div className="max-h-60 overflow-y-auto p-1">
              {filtradas.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => {
                    onSelecionar(o.id)
                    fechar()
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] hover:bg-muted"
                >
                  <Check
                    className={cn(
                      'size-3.5 shrink-0',
                      o.id === valor ? 'text-emerald-600' : 'opacity-0',
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-foreground">{o.nome}</span>
                    {o.detalhe && (
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {o.detalhe}
                      </span>
                    )}
                  </span>
                </button>
              ))}

              {filtradas.length === 0 && (
                <p className="px-2 py-3 text-center text-[12px] text-muted-foreground">
                  {termo.trim() ? 'Nenhum resultado.' : textoVazio}
                </p>
              )}
            </div>

            {criacao && (
              <div className="border-t border-border p-1">
                <button
                  type="button"
                  onClick={() => setCriando(true)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[13px] font-medium text-emerald-700 hover:bg-emerald-500/10"
                >
                  <Plus className="size-4 shrink-0" />
                  {rotuloCriar ?? `${textoCriar}${termo.trim() ? ` “${termo.trim()}”` : ''}`}
                </button>
              </div>
            )}
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}

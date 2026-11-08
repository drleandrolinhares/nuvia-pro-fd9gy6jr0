import { useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import {
  getPermissoes,
  getPermissoesEfetivas,
  saveUsuarioPermissoesConfig,
  type Permissao,
} from '@/services/permissoes'
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  Search,
  ShieldAlert,
  ShieldCheck,
  LayoutGrid,
  MousePointerClick,
  RotateCcw,
  Lock,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  usuario: { id: string; nome: string; email: string; cargo: { nome: string } | null }
  onSave: () => void
}

type Modo = 'paginas' | 'acoes'

export function PermissoesEditorDialog({ open, onOpenChange, usuario, onSave }: Props) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [permissoes, setPermissoes] = useState<Permissao[]>([])
  const [concedidas, setConcedidas] = useState<Set<string>>(new Set())
  const [negadas, setNegadas] = useState<Set<string>>(new Set())
  const [herdadasDoCargo, setHerdadasDoCargo] = useState<Set<string>>(new Set())

  const [modo, setModo] = useState<Modo>('paginas')
  const [busca, setBusca] = useState('')
  const [abertos, setAbertos] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!open) return
    let cancelado = false

    ;(async () => {
      setLoading(true)
      try {
        const [todas, efetivas] = await Promise.all([
          getPermissoes(),
          getPermissoesEfetivas(usuario.id),
        ])
        if (cancelado) return

        setPermissoes(todas)
        setConcedidas(new Set(efetivas.concedidas))
        setNegadas(new Set(efetivas.negadas))

        // "herdada" = concedida sem ser exceção do usuário e sem negação
        const herdadas = new Set<string>()
        efetivas.efetivas.forEach((e) => {
          if (e.origem === 'cargo') herdadas.add(e.permissao_id)
        })
        setHerdadasDoCargo(herdadas)

        // abre o primeiro grupo por padrão
        const primeiro = todas.find((p) => p.tipo === 'pagina')
        if (primeiro?.modulo) setAbertos({ [primeiro.modulo]: true })
      } catch (err: any) {
        if (!cancelado) {
          toast({
            title: 'Erro ao carregar permissões',
            description: err?.message || 'Tente novamente.',
            variant: 'destructive',
          })
        }
      } finally {
        if (!cancelado) setLoading(false)
      }
    })()

    return () => {
      cancelado = true
    }
  }, [open, usuario.id])

  const paginas = useMemo(() => permissoes.filter((p) => p.tipo === 'pagina'), [permissoes])
  const acoes = useMemo(() => permissoes.filter((p) => p.tipo === 'acao'), [permissoes])

  const acoesPorPagina = useMemo(() => {
    const map = new Map<string, Permissao[]>()
    acoes.forEach((a) => {
      const key = a.parent_slug || '__sem_pai__'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(a)
    })
    return map
  }, [acoes])

  const liberada = (id: string) => {
    if (negadas.has(id)) return false
    if (concedidas.has(id)) return true
    return herdadasDoCargo.has(id)
  }

  /** Alterna o acesso. Manter o mínimo de exceções: se o novo estado já é o herdado,
   *  a exceção é removida (volta a herdar do cargo). */
  const alternar = (id: string) => {
    const herdada = herdadasDoCargo.has(id)
    const atualmenteLiberada = liberada(id)
    const novoLiberado = !atualmenteLiberada

    const c = new Set(concedidas)
    const n = new Set(negadas)

    if (novoLiberado === herdada) {
      // coincide com o cargo → sem exceção
      c.delete(id)
      n.delete(id)
    } else if (novoLiberado) {
      c.add(id)
      n.delete(id)
    } else {
      n.add(id)
      c.delete(id)
    }

    setConcedidas(c)
    setNegadas(n)
  }

  /** Ao desligar a página, desliga junto o que pertence a ela. */
  const alternarPagina = (pagina: Permissao) => {
    const filhas = acoesPorPagina.get(pagina.slug) || []
    const novoLiberado = !liberada(pagina.id)

    const c = new Set(concedidas)
    const n = new Set(negadas)

    const aplicar = (id: string, valor: boolean) => {
      const herdada = herdadasDoCargo.has(id)
      if (valor === herdada) {
        c.delete(id)
        n.delete(id)
      } else if (valor) {
        c.add(id)
        n.delete(id)
      } else {
        n.add(id)
        c.delete(id)
      }
    }

    aplicar(pagina.id, novoLiberado)
    if (!novoLiberado) {
      // arrastar as ações junto evita "ação liberada em página fechada"
      filhas.forEach((f) => aplicar(f.id, false))
    }

    setConcedidas(c)
    setNegadas(n)
  }

  const restaurarCargo = () => {
    setConcedidas(new Set())
    setNegadas(new Set())
    toast({
      title: 'Alterações descartadas',
      description: 'As permissões voltaram a herdar do cargo. Salve para aplicar.',
    })
  }

  const salvar = async () => {
    setSaving(true)
    try {
      await saveUsuarioPermissoesConfig(usuario.id, Array.from(concedidas), Array.from(negadas))
      toast({
        title: 'Permissões salvas',
        description: `${usuario.nome} terá as novas regras no próximo acesso.`,
      })
      onSave()
      onOpenChange(false)
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar',
        description: err?.message || 'Verifique as permissões e tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const termo = busca.trim().toLowerCase()
  const filtrar = (lista: Permissao[]) =>
    termo
      ? lista.filter(
          (p) =>
            p.nome.toLowerCase().includes(termo) ||
            (p.modulo || '').toLowerCase().includes(termo) ||
            (p.descricao || '').toLowerCase().includes(termo),
        )
      : lista

  const paginasFiltradas = filtrar(paginas)
  const acoesFiltradas = filtrar(acoes)

  const modulos = useMemo(() => {
    const map = new Map<string, Permissao[]>()
    paginasFiltradas.forEach((p) => {
      const m = p.modulo || 'Outros'
      if (!map.has(m)) map.set(m, [])
      map.get(m)!.push(p)
    })
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [paginasFiltradas])

  const excecoes = concedidas.size + negadas.size

  const origemBadge = (id: string) => {
    if (negadas.has(id))
      return (
        <Badge
          variant="outline"
          className="border-destructive/30 bg-destructive/10 text-[10px] text-destructive"
        >
          Negada aqui
        </Badge>
      )
    if (concedidas.has(id))
      return (
        <Badge
          variant="outline"
          className="border-amber-500/30 bg-amber-500/10 text-[10px] text-amber-600 dark:text-amber-400"
        >
          Extra
        </Badge>
      )
    if (herdadasDoCargo.has(id))
      return (
        <Badge
          variant="outline"
          className="border-border bg-muted text-[10px] text-muted-foreground"
        >
          Do cargo
        </Badge>
      )
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[720px]">
        <DialogHeader className="shrink-0 border-b border-border/60 p-6 pb-4">
          <DialogTitle className="text-base">Permissões de acesso</DialogTitle>
          <DialogDescription className="mt-1">
            <span className="font-semibold text-foreground">{usuario.nome}</span> · Cargo:{' '}
            <span className="font-medium">{usuario.cargo?.nome || 'sem cargo'}</span>
          </DialogDescription>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5">
              <button
                type="button"
                onClick={() => setModo('paginas')}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors',
                  modo === 'paginas'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <LayoutGrid className="size-3.5" /> Páginas ({paginas.length})
              </button>
              <button
                type="button"
                onClick={() => setModo('acoes')}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors',
                  modo === 'acoes'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <MousePointerClick className="size-3.5" /> Ações ({acoes.length})
              </button>
            </div>

            {excecoes > 0 && (
              <Badge variant="outline" className="text-[10px]">
                {excecoes} exceção(ões) sobre o cargo
              </Badge>
            )}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={restaurarCargo}
              disabled={excecoes === 0 || saving}
              className="ml-auto h-8 text-[11px]"
            >
              <RotateCcw className="size-3.5" /> Voltar ao cargo
            </Button>
          </div>

          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar página ou ação..."
              className="h-9 pl-9 text-[13px]"
            />
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" /> Carregando permissões...
            </div>
          ) : modo === 'paginas' ? (
            <div className="space-y-3">
              {modulos.length === 0 && (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  Nenhuma página encontrada.
                </p>
              )}
              {modulos.map(([modulo, lista]) => (
                <div key={modulo} className="overflow-hidden rounded-lg border border-border">
                  <button
                    type="button"
                    onClick={() => setAbertos((p) => ({ ...p, [modulo]: !p[modulo] }))}
                    className="flex w-full items-center gap-2 bg-muted/40 px-3 py-2 text-left transition-colors hover:bg-muted/60"
                  >
                    {abertos[modulo] ? (
                      <ChevronDown className="size-3.5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="size-3.5 text-muted-foreground" />
                    )}
                    <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                      {modulo}
                    </span>
                    <span className="ml-auto text-[10px] text-muted-foreground">
                      {lista.filter((p) => liberada(p.id)).length}/{lista.length}
                    </span>
                  </button>

                  {abertos[modulo] && (
                    <div className="divide-y divide-border/60">
                      {lista.map((p) => {
                        const on = liberada(p.id)
                        const filhas = acoesPorPagina.get(p.slug) || []
                        const bloqueadas = filhas.filter((f) => !liberada(f.id)).length
                        return (
                          <div
                            key={p.id}
                            className={cn(
                              'flex items-start gap-3 px-3 py-2.5 transition-colors',
                              on ? 'bg-card' : 'bg-muted/20',
                            )}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span
                                  className={cn(
                                    'text-[13px] font-semibold',
                                    on ? 'text-foreground' : 'text-muted-foreground',
                                  )}
                                >
                                  {p.nome.replace(/^Acessar\s+/, '')}
                                </span>
                                {origemBadge(p.id)}
                                {filhas.length > 0 && (
                                  <span className="text-[10px] text-muted-foreground">
                                    {filhas.length - bloqueadas}/{filhas.length} ações
                                  </span>
                                )}
                              </div>
                              {p.descricao && (
                                <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                                  {p.descricao}
                                </p>
                              )}
                            </div>
                            <Switch checked={on} onCheckedChange={() => alternarPagina(p)} />
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {acoesFiltradas.length === 0 && (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  Nenhuma ação encontrada.
                </p>
              )}
              {Array.from(
                acoesFiltradas.reduce((acc, a) => {
                  const pai = a.parent_slug || 'Sem página'
                  if (!acc.has(pai)) acc.set(pai, [])
                  acc.get(pai)!.push(a)
                  return acc
                }, new Map<string, Permissao[]>()),
              ).map(([pai, lista]) => {
                const pagina = paginas.find((p) => p.slug === pai)
                const paginaLiberada = pagina ? liberada(pagina.id) : true
                return (
                  <div key={pai} className="overflow-hidden rounded-lg border border-border">
                    <div className="flex items-center gap-2 bg-muted/40 px-3 py-2">
                      <MousePointerClick className="size-3.5 text-muted-foreground" />
                      <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                        {pai.replace(/^Acessar\s+/, '')}
                      </span>
                      {!paginaLiberada && (
                        <Badge
                          variant="outline"
                          className="gap-1 border-destructive/30 bg-destructive/10 text-[10px] text-destructive"
                        >
                          <Lock className="size-2.5" /> página bloqueada
                        </Badge>
                      )}
                    </div>
                    <div className="divide-y divide-border/60">
                      {lista.map((a) => {
                        const on = liberada(a.id)
                        return (
                          <div key={a.id} className="flex items-start gap-3 px-3 py-2.5">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span
                                  className={cn(
                                    'text-[13px] font-semibold',
                                    on ? 'text-foreground' : 'text-muted-foreground',
                                  )}
                                >
                                  {a.nome}
                                </span>
                                {a.critica && (
                                  <Badge
                                    variant="outline"
                                    className="gap-1 border-amber-500/30 bg-amber-500/10 text-[9.5px] text-amber-600 dark:text-amber-400"
                                  >
                                    <ShieldAlert className="size-2.5" /> sensível
                                  </Badge>
                                )}
                                {origemBadge(a.id)}
                              </div>
                              {a.descricao && (
                                <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                                  {a.descricao}
                                </p>
                              )}
                            </div>
                            <Switch
                              checked={on}
                              disabled={!paginaLiberada && !on}
                              onCheckedChange={() => alternar(a.id)}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0 items-center gap-2 border-t border-border/60 p-4 sm:justify-between">
          <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="size-3.5" />O que não for exceção herda do cargo.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={salvar} disabled={saving || loading}>
              {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
              Salvar permissões
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { Cargo, Permissao, saveCargo } from '@/services/permissoes'
import { Loader2 } from 'lucide-react'

export function CargoDialog({
  open,
  onOpenChange,
  cargo,
  permissoes,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  cargo: Cargo | null
  permissoes: Permissao[]
  onSave: () => void
}) {
  const [nome, setNome] = useState('')
  const [setor, setSetor] = useState('')
  const [descricao, setDescricao] = useState('')
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const [mostrarAcoes, setMostrarAcoes] = useState(false)
  const [busca, setBusca] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    if (cargo) {
      setNome(cargo.nome)
      setSetor(cargo.setor || '')
      setDescricao(cargo.descricao || '')
      setSelectedPerms(new Set(cargo.cargo_permissoes?.map((cp) => cp.permissao_id) || []))
    } else {
      setNome('')
      setSetor('')
      setDescricao('')
      setSelectedPerms(new Set())
    }
  }, [cargo])

  const handleToggle = (id: string) => {
    const next = new Set(selectedPerms)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedPerms(next)
  }

  const handleSave = async () => {
    if (!nome)
      return toast({
        title: 'Aviso',
        description: 'O nome do cargo é obrigatório.',
        variant: 'destructive',
      })

    setSaving(true)
    try {
      await saveCargo(cargo?.id || null, {
        nome,
        setor: setor || null,
        descricao: descricao || null,
        permissoes: Array.from(selectedPerms),
      })
      toast({ title: 'Sucesso', description: 'Cargo salvo com sucesso.' })
      onSave()
      onOpenChange(false)
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const termo = busca.trim().toLowerCase()
  const visiveis = permissoes.filter((p) => {
    if (!mostrarAcoes && p.tipo === 'acao') return false
    if (!termo) return true
    return (
      p.nome.toLowerCase().includes(termo) ||
      (p.modulo || '').toLowerCase().includes(termo) ||
      (p.descricao || '').toLowerCase().includes(termo)
    )
  })

  const groupedPermissoes = visiveis.reduce(
    (acc, p) => {
      const mod = p.modulo || 'Geral'
      if (!acc[mod]) acc[mod] = []
      acc[mod].push(p)
      return acc
    },
    {} as Record<string, Permissao[]>,
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 shrink-0">
          <DialogTitle className="uppercase tracking-wider">
            {cargo ? 'Editar Cargo' : 'Novo Cargo'}
          </DialogTitle>
          <DialogDescription>
            Defina as informações do cargo e quais módulos do sistema ele pode acessar.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6">
          <div className="space-y-6 pb-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Cargo *</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Dentista Clínico"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="setor">Setor</Label>
                <Input
                  id="setor"
                  value={setor}
                  onChange={(e) => setSetor(e.target.value)}
                  placeholder="Ex: Odontologia"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Breve descrição das responsabilidades..."
                className="resize-none"
                rows={2}
              />
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-2 border-b pb-2 sm:flex-row sm:items-center sm:justify-between">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Permissões de Acesso
                </h4>
                <div className="flex items-center gap-2">
                  <label className="flex cursor-pointer items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                    <Checkbox
                      checked={mostrarAcoes}
                      onCheckedChange={(v) => setMostrarAcoes(!!v)}
                      className="size-3.5"
                    />
                    mostrar ações
                  </label>
                </div>
              </div>

              <div className="relative">
                <input
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar permissão..."
                  className="h-8 w-full rounded-md border border-border bg-background px-2.5 text-[12px] outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                />
              </div>
              <div className="space-y-6">
                {Object.entries(groupedPermissoes).map(([modulo, perms]) => (
                  <div key={modulo} className="space-y-3">
                    <h5 className="text-xs font-bold uppercase text-primary bg-primary/5 px-2 py-1 rounded w-max">
                      {modulo}
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-2">
                      {perms.map((p) => (
                        <div key={p.id} className="flex items-start space-x-2">
                          <Checkbox
                            id={`perm-${p.id}`}
                            checked={selectedPerms.has(p.id)}
                            onCheckedChange={() => handleToggle(p.id)}
                            className="mt-1"
                          />
                          <div className="space-y-1 leading-none">
                            <Label
                              htmlFor={`perm-${p.id}`}
                              className="text-sm font-medium cursor-pointer"
                            >
                              {p.nome}
                              {p.tipo === 'acao' && (
                                <span className="ml-1.5 rounded border border-border px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                                  ação
                                </span>
                              )}
                            </Label>
                            {p.descricao && (
                              <p className="text-[10px] text-muted-foreground">{p.descricao}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 pt-4 border-t border-border/50 shrink-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
            className="uppercase text-xs font-bold tracking-wider"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="uppercase text-xs font-bold tracking-wider"
          >
            {saving && <Loader2 className="size-4 mr-2 animate-spin" />} Salvar Cargo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

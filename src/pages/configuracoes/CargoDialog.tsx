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
import { ScrollArea } from '@/components/ui/scroll-area'
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

  const groupedPermissoes = permissoes.reduce(
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="uppercase tracking-wider">
            {cargo ? 'Editar Cargo' : 'Novo Cargo'}
          </DialogTitle>
          <DialogDescription>
            Defina as informações do cargo e quais módulos do sistema ele pode acessar.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
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
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">
                Permissões de Acesso
              </h4>
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
        </ScrollArea>

        <DialogFooter className="p-6 pt-4 border-t border-border/50">
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

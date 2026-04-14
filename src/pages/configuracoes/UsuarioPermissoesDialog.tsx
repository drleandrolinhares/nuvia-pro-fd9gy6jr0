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
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { Permissao, UsuarioComPermissoes, saveUsuarioPermissoes } from '@/services/permissoes'
import { Loader2, Info } from 'lucide-react'

export function UsuarioPermissoesDialog({
  open,
  onOpenChange,
  usuario,
  permissoes,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  usuario: UsuarioComPermissoes
  permissoes: Permissao[]
  onSave: () => void
}) {
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (usuario) {
      setSelectedPerms(new Set(usuario.usuario_permissoes?.map((up) => up.permissao_id) || []))
    }
  }, [usuario])

  const handleToggle = (id: string) => {
    const next = new Set(selectedPerms)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedPerms(next)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveUsuarioPermissoes(usuario.id, Array.from(selectedPerms))
      toast({ title: 'Sucesso', description: 'Permissões do usuário atualizadas.' })
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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col overflow-hidden p-0 gap-0">
        <DialogHeader className="p-6 pb-4 shrink-0">
          <DialogTitle className="uppercase tracking-wider">Permissões Específicas</DialogTitle>
          <DialogDescription>
            Atribua permissões adicionais para o colaborador <strong>{usuario.nome}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 min-h-0">
          <div className="space-y-6 pb-6">
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 p-3 rounded-md flex items-start text-xs shrink-0">
              <Info className="size-4 mr-2 shrink-0 mt-0.5" />
              <p>
                Estas permissões são somadas às permissões do cargo (
                {usuario.cargo?.nome || 'Nenhum'}). Elas concedem acesso extra independentemente do
                cargo.
              </p>
            </div>

            <div className="space-y-6">
              {Object.entries(groupedPermissoes).map(([modulo, perms]) => (
                <div key={modulo} className="space-y-3">
                  <h5 className="text-xs font-bold uppercase text-primary bg-primary/5 px-2 py-1 rounded w-max">
                    {modulo}
                  </h5>
                  <div className="flex flex-col gap-3 pl-2">
                    {perms.map((p) => (
                      <div key={p.id} className="flex items-start space-x-2">
                        <Checkbox
                          id={`u-perm-${p.id}`}
                          checked={selectedPerms.has(p.id)}
                          onCheckedChange={() => handleToggle(p.id)}
                          className="mt-1"
                        />
                        <div className="space-y-1 leading-none">
                          <Label
                            htmlFor={`u-perm-${p.id}`}
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
            {saving && <Loader2 className="size-4 mr-2 animate-spin" />} Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useConfigData } from '@/hooks/use-config-data'

export function PermissoesTab() {
  const { cargos, permissoes, loading } = useConfigData()

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="uppercase tracking-wider">Cargos e Permissões</CardTitle>
          <CardDescription>Defina quais módulos cada cargo pode acessar.</CardDescription>
        </div>
        <Button size="sm" variant="outline" className="uppercase tracking-wider text-xs font-bold">
          <Plus className="size-4 mr-2" /> Novo Cargo
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando cargos...</div>
        ) : cargos.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Nenhum cargo encontrado.</div>
        ) : (
          cargos.map((cargo) => (
            <div key={cargo.id} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm uppercase tracking-wider">{cargo.nome}</h4>
                  <p className="text-xs text-muted-foreground">
                    {cargo.descricao} • Setor: {cargo.setor}
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="h-8 text-xs uppercase tracking-wider">
                  Editar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {cargo.cargo_permissoes?.map((cp: any) => {
                  const perm = permissoes.find((p) => p.id === cp.permissao_id)
                  return perm ? (
                    <Badge key={perm.id} variant="secondary" className="text-[10px] uppercase">
                      {perm.nome}
                    </Badge>
                  ) : null
                })}
                {(!cargo.cargo_permissoes || cargo.cargo_permissoes.length === 0) && (
                  <span className="text-xs text-muted-foreground italic">
                    Sem permissões atribuídas
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

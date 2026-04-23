import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export function ConfigPPDMView() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    const { data } = await supabase
      .from('usuarios')
      .select('id, nome, obrigatorio_pp_pdm')
      .order('nome')
    if (data) setUsers(data)
    setLoading(false)
  }

  const toggleRequired = async (userId: string, current: boolean) => {
    const newValue = !current
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, obrigatorio_pp_pdm: newValue } : u)),
    )

    const { error } = await supabase
      .from('usuarios')
      .update({ obrigatorio_pp_pdm: newValue })
      .eq('id', userId)
    if (error) {
      toast.error('Erro ao atualizar.')
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, obrigatorio_pp_pdm: current } : u)),
      )
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Configuração de Obrigatoriedade</CardTitle>
        <CardDescription>
          Defina quais colaboradores devem preencher o PP e PDM semanalmente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-amber-500" />
          </div>
        ) : (
          <div className="space-y-4 max-w-lg">
            {users.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between border-b border-slate-100 pb-3"
              >
                <Label
                  className="font-medium text-base text-slate-700 cursor-pointer"
                  onClick={() => toggleRequired(u.id, u.obrigatorio_pp_pdm)}
                >
                  {u.nome}
                </Label>
                <Switch
                  checked={u.obrigatorio_pp_pdm}
                  onCheckedChange={() => toggleRequired(u.id, u.obrigatorio_pp_pdm)}
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, Plus } from 'lucide-react'

export function ConfigBonificacaoView() {
  const [users, setUsers] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [{ data: uData }, { data: iData }] = await Promise.all([
      supabase.from('usuarios').select('id, nome, obrigatorio_bonificacao').order('nome'),
      supabase
        .from('performance_bonificacao_itens' as any)
        .select('*')
        .order('ordem'),
    ])
    if (uData) setUsers(uData)
    if (iData) setItems(iData)
    setLoading(false)
  }

  const toggleUser = async (id: string, current: boolean) => {
    const val = !current
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, obrigatorio_bonificacao: val } : u)))
    const { error } = await supabase
      .from('usuarios')
      .update({ obrigatorio_bonificacao: val })
      .eq('id', id)
    if (error) toast.error('Erro ao atualizar colaborador.')
  }

  const addItem = async () => {
    const newItem = { descricao: 'Novo item', ordem: items.length + 1, ativo: true }
    const { data, error } = await supabase
      .from('performance_bonificacao_itens' as any)
      .insert(newItem)
      .select()
      .single()
    if (data) setItems([...items, data])
    if (error) toast.error('Erro ao adicionar item.')
  }

  const updateItem = async (id: string, field: string, value: any) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)))
    await supabase
      .from('performance_bonificacao_itens' as any)
      .update({ [field]: value })
      .eq('id', id)
  }

  const toggleItemAtivo = async (id: string, current: boolean) => {
    const val = !current
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ativo: val } : i)))
    await supabase
      .from('performance_bonificacao_itens' as any)
      .update({ ativo: val })
      .eq('id', id)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Colaboradores Elegíveis</CardTitle>
          <CardDescription>Selecione quem aparecerá na matriz de bonificação.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-amber-500" />
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between border-b border-slate-100 pb-3"
                >
                  <Label
                    className="font-medium text-base text-slate-700 cursor-pointer"
                    onClick={() => toggleUser(u.id, u.obrigatorio_bonificacao)}
                  >
                    {u.nome}
                  </Label>
                  <Switch
                    checked={u.obrigatorio_bonificacao}
                    onCheckedChange={() => toggleUser(u.id, u.obrigatorio_bonificacao)}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Itens de Avaliação</CardTitle>
            <CardDescription>Configure os itens da bonificação Feijão com Arroz.</CardDescription>
          </div>
          <Button onClick={addItem} size="sm" variant="outline" className="gap-2">
            <Plus className="w-4 h-4" /> Adicionar
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-amber-500" />
            </div>
          ) : (
            <div className="space-y-3 mt-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 p-2 rounded-lg border transition-colors ${item.ativo ? 'bg-white' : 'bg-slate-50 opacity-60'}`}
                >
                  <Switch
                    checked={item.ativo}
                    onCheckedChange={() => toggleItemAtivo(item.id, item.ativo)}
                    title="Ativar/Desativar item"
                  />
                  <Input
                    value={item.descricao}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((i) =>
                          i.id === item.id ? { ...i, descricao: e.target.value } : i,
                        ),
                      )
                    }
                    onBlur={(e) => updateItem(item.id, 'descricao', e.target.value)}
                    className="flex-1 border-slate-200"
                    disabled={!item.ativo}
                  />
                </div>
              ))}
              {items.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">Nenhum item configurado.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Loader2, Plus, GripVertical } from 'lucide-react'

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
      supabase
        .from('usuarios')
        .select('id, nome, obrigatorio_bonificacao')
        .eq('status', 'ativo')
        .order('nome'),
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
    const newItem = {
      descricao: 'Nova Regra/Falha',
      explicacao: '',
      ordem: items.length + 1,
      ativo: true,
    }
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-4">
        <Card>
          <CardHeader>
            <CardTitle>Elegíveis ao Bônus</CardTitle>
            <CardDescription>
              Selecione quem aparecerá na matriz de avaliação do Feijão com Arroz.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-amber-500" />
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between border-b border-slate-100 pb-3"
                  >
                    <Label
                      className="font-medium text-sm text-slate-700 cursor-pointer"
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
      </div>

      <div className="lg:col-span-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Regras de Desclassificação</CardTitle>
              <CardDescription>
                Defina as ações que eliminam o colaborador do bônus Feijão com Arroz.
              </CardDescription>
            </div>
            <Button onClick={addItem} size="sm" variant="outline" className="gap-2">
              <Plus className="w-4 h-4" /> Adicionar Regra
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-amber-500" />
              </div>
            ) : (
              <div className="space-y-4 mt-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-start gap-4 p-4 rounded-xl border transition-colors shadow-sm ${item.ativo ? 'bg-white' : 'bg-slate-50 opacity-60'}`}
                  >
                    <div className="mt-1 flex-shrink-0 cursor-grab text-slate-300 hover:text-slate-500">
                      <GripVertical className="w-5 h-5" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between gap-4">
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
                          className="flex-1 border-slate-200 font-semibold"
                          disabled={!item.ativo}
                          placeholder="Ex: Chegou atrasado mais de 2 vezes"
                        />
                        <div className="flex items-center gap-2">
                          <Label className="text-xs text-slate-500">Ativo</Label>
                          <Switch
                            checked={item.ativo}
                            onCheckedChange={() => toggleItemAtivo(item.id, item.ativo)}
                          />
                        </div>
                      </div>
                      <Textarea
                        value={item.explicacao || ''}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((i) =>
                              i.id === item.id ? { ...i, explicacao: e.target.value } : i,
                            ),
                          )
                        }
                        onBlur={(e) => updateItem(item.id, 'explicacao', e.target.value)}
                        className="border-slate-200 text-sm min-h-[60px] resize-none"
                        disabled={!item.ativo}
                        placeholder="Explicação detalhada da regra (visível no popup de informação)..."
                      />
                    </div>
                  </div>
                ))}
                {items.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    Nenhuma regra configurada. Adicione itens que eliminarão o colaborador do bônus.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Save, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

function ConfigSection({ title, table, items, hasColor, hasSlug, onUpdate }: any) {
  const [list, setList] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setList(items.sort((a: any, b: any) => a.ordem - b.ordem))
  }, [items])

  const handleAdd = () => {
    const newItem: any = {
      id: `new_${Date.now()}`,
      nome: '',
      ativo: true,
      ordem: list.length + 1,
    }
    if (hasColor) newItem.cor = '#3b82f6'
    setList([...list, newItem])
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      for (const item of list) {
        if (!item.nome.trim()) continue

        const payload: any = {
          nome: item.nome,
          ordem: item.ordem,
          ativo: item.ativo,
        }
        if (hasColor) payload.cor = item.cor

        if (item.id.toString().startsWith('new_')) {
          if (hasSlug) {
            payload.slug = item.nome.toLowerCase().replace(/[^a-z0-9]+/g, '_')
          }
          await supabase.from(table).insert([payload])
        } else {
          await supabase.from(table).update(payload).eq('id', item.id)
        }
      }
      toast.success(`${title} salvo com sucesso!`)
      onUpdate()
    } catch (err: any) {
      toast.error('Erro ao salvar: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, isNew: boolean) => {
    if (isNew) {
      setList(list.filter((i) => i.id !== id))
      return
    }

    if (confirm('Deseja realmente desativar este item? (Não excluímos para manter o histórico)')) {
      try {
        await supabase.from(table).update({ ativo: false }).eq('id', id)
        setList(list.filter((i) => i.id !== id))
        toast.success('Item desativado')
        onUpdate()
      } catch (err: any) {
        toast.error('Erro: ' + err.message)
      }
    }
  }

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-800/50">
        <CardTitle className="text-lg font-medium text-white">{title}</CardTitle>
        <Button
          onClick={handleAdd}
          size="sm"
          variant="outline"
          className="bg-slate-950 border-slate-700 text-white hover:bg-slate-800 hover:text-white"
        >
          <Plus className="w-4 h-4 mr-1" /> Novo
        </Button>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        {list
          .filter((i) => i.ativo)
          .map((item, idx) => (
            <div
              key={item.id}
              className="flex items-center gap-3 bg-slate-950/50 p-2 rounded-md border border-slate-800"
            >
              <div className="text-xs font-medium text-slate-500 w-6 text-center">{idx + 1}</div>
              <Input
                value={item.nome}
                onChange={(e) =>
                  setList(list.map((i) => (i.id === item.id ? { ...i, nome: e.target.value } : i)))
                }
                placeholder="Nome"
                className="bg-slate-900 border-slate-700 h-8 flex-1 text-white"
              />
              {hasColor && (
                <Input
                  type="color"
                  value={item.cor}
                  onChange={(e) =>
                    setList(list.map((i) => (i.id === item.id ? { ...i, cor: e.target.value } : i)))
                  }
                  className="w-12 h-8 p-1 bg-slate-900 border-slate-700 cursor-pointer"
                />
              )}
              <Button
                onClick={() => handleDelete(item.id, item.id.toString().startsWith('new_'))}
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-slate-900"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        {list.filter((i) => i.ativo).length === 0 && (
          <p className="text-sm text-slate-500 text-center py-4">Nenhum item cadastrado.</p>
        )}
        <div className="pt-4 flex justify-end border-t border-slate-800/50 mt-4">
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-amber-500 text-slate-950 hover:bg-amber-600 font-bold"
          >
            <Save className="w-4 h-4 mr-2" /> Salvar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function FunilConfiguracoes({ origens, etapas, temperaturas, onUpdate }: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <ConfigSection
        title="Origens de Leads"
        table="funil_origens"
        items={origens}
        hasColor={false}
        hasSlug={false}
        onUpdate={onUpdate}
      />
      <ConfigSection
        title="Status do Kanban"
        table="funil_etapas"
        items={etapas}
        hasColor={true}
        hasSlug={true}
        onUpdate={onUpdate}
      />
      <ConfigSection
        title="Temperaturas"
        table="funil_temperaturas"
        items={temperaturas}
        hasColor={false}
        hasSlug={true}
        onUpdate={onUpdate}
      />
    </div>
  )
}

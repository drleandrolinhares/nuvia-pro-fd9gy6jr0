import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export type ConfigItem = { id: string; tipo: string; nome: string }

function ConfigTabContent({
  tipo,
  items,
  onRefresh,
}: {
  tipo: string
  items: ConfigItem[]
  onRefresh: () => Promise<void>
}) {
  const [novoNome, setNovoNome] = useState('')
  const [loading, setLoading] = useState(false)
  const filtered = items.filter((i) => i.tipo === tipo)

  const handleAdd = async () => {
    if (!novoNome.trim()) return
    setLoading(true)
    await supabase.from('precificacao_ocupacao_config').insert({ tipo, nome: novoNome.trim() })
    setNovoNome('')
    await onRefresh()
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    setLoading(true)
    await supabase.from('precificacao_ocupacao_config').delete().eq('id', id)
    await onRefresh()
    setLoading(false)
  }

  return (
    <div className="space-y-4 pt-4">
      <div className="flex gap-2">
        <Input
          value={novoNome}
          onChange={(e) => setNovoNome(e.target.value)}
          placeholder={`Novo(a) ${tipo === 'dentista' ? 'Dentista' : 'Especialidade'}`}
          className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500"
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <Button
          onClick={handleAdd}
          disabled={loading || !novoNome.trim()}
          className="bg-amber-500 text-slate-950 hover:bg-amber-600"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Adicionar'}
        </Button>
      </div>
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between bg-slate-950/50 p-2 rounded-md border border-slate-800"
          >
            <span className="text-sm text-slate-300">{item.nome}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(item.id)}
              disabled={loading}
              className="h-8 w-8 text-slate-500 hover:text-red-400 hover:bg-red-400/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center text-slate-500 text-sm py-4">Nenhum item cadastrado.</div>
        )}
      </div>
    </div>
  )
}

export function ConfiguracaoGradeDialog({
  open,
  onOpenChange,
  items,
  onRefresh,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: ConfigItem[]
  onRefresh: () => Promise<void>
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-200 sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configurações da Grade</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="especialidades" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-950">
            <TabsTrigger
              value="especialidades"
              className="data-[state=active]:bg-slate-800 data-[state=active]:text-white"
            >
              Especialidades
            </TabsTrigger>
            <TabsTrigger
              value="dentistas"
              className="data-[state=active]:bg-slate-800 data-[state=active]:text-white"
            >
              Dentistas
            </TabsTrigger>
          </TabsList>
          <TabsContent value="especialidades">
            <ConfigTabContent tipo="especialidade" items={items} onRefresh={onRefresh} />
          </TabsContent>
          <TabsContent value="dentistas">
            <ConfigTabContent tipo="dentista" items={items} onRefresh={onRefresh} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

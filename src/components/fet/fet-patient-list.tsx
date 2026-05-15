import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Search, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export function FETPatientList({
  selectedId,
  onSelect,
}: {
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const [patients, setPatients] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [newNome, setNewNome] = useState('')

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    const { data } = await supabase.from('fet_pacientes').select('*').order('nome')
    if (data) setPatients(data)
  }

  const handleAdd = async () => {
    if (!newNome.trim()) return
    const { data, error } = await supabase
      .from('fet_pacientes')
      .insert([{ nome: newNome }])
      .select()
    if (error) {
      toast({ title: 'Erro ao criar paciente', description: error.message, variant: 'destructive' })
    } else if (data) {
      setPatients([...patients, data[0]].sort((a, b) => a.nome.localeCompare(b.nome)))
      setNewNome('')
      onSelect(data[0].id)
    }
  }

  const filtered = patients.filter((p) => p.nome.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-slate-800 bg-slate-950/50 space-y-3">
        <h2 className="text-lg font-bold text-white">Pacientes FET</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Novo paciente..."
            value={newNome}
            onChange={(e) => setNewNome(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="h-9 bg-slate-900 border-slate-800 text-white focus-visible:ring-amber-500 text-sm"
          />
          <Button
            onClick={handleAdd}
            size="icon"
            className="h-9 w-9 bg-amber-500 hover:bg-amber-600 text-slate-950 shrink-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <Input
            placeholder="Buscar paciente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-9 bg-slate-900 border-slate-800 text-white focus-visible:ring-amber-500 text-sm"
          />
        </div>
      </div>
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className={cn(
                'w-full text-left px-3 py-2.5 text-sm rounded-lg transition-all border border-transparent',
                selectedId === p.id
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 font-bold'
                  : 'text-slate-300 hover:bg-slate-800 hover:border-slate-700',
              )}
            >
              {p.nome}
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="text-center p-4 text-slate-500 text-sm">
              Nenhum paciente encontrado.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

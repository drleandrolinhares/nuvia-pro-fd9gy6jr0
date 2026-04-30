import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface Categoria {
  id: string
  nome: string
}

export function DespesaModal({ onSuccess }: { onSuccess: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [isNewCat, setIsNewCat] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newDespesa, setNewDespesa] = useState({
    data: '',
    categoria: '',
    descricao: '',
    valor: '',
  })
  const { toast } = useToast()

  const fetchCats = async () => {
    const { data } = await supabase.from('fluxo_caixa_categorias').select('*').order('nome')
    if (data) setCategorias(data)
  }

  useEffect(() => {
    if (isOpen) fetchCats()
  }, [isOpen])

  const handleCreateCat = async () => {
    if (!newCatName) return
    const { data, error } = await supabase
      .from('fluxo_caixa_categorias')
      .insert({ nome: newCatName })
      .select()
      .single()
    if (error) {
      toast({ title: 'Erro ao criar categoria', variant: 'destructive' })
      return
    }
    setCategorias([...categorias, data])
    setNewDespesa({ ...newDespesa, categoria: data.nome })
    setIsNewCat(false)
    setNewCatName('')
  }

  const handleSave = async () => {
    if (!newDespesa.data || !newDespesa.categoria || !newDespesa.valor) {
      toast({ title: 'Preencha os campos obrigatórios', variant: 'destructive' })
      return
    }
    const { error } = await supabase.from('fluxo_caixa_despesas').insert({
      data_vencimento: newDespesa.data,
      categoria: newDespesa.categoria,
      descricao: newDespesa.descricao || newDespesa.categoria,
      valor_estimado: parseFloat(newDespesa.valor),
    })
    if (error) {
      toast({ title: 'Erro ao adicionar', variant: 'destructive' })
      return
    }
    toast({ title: 'Despesa adicionada!' })
    setIsOpen(false)
    setNewDespesa({ data: '', categoria: '', descricao: '', valor: '' })
    onSuccess()
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="h-7 px-3 text-xs font-bold border border-[#C5A059]/50 text-[#C5A059] hover:bg-[#C5A059] hover:text-[#001529] bg-[#0F1A2A] transition-colors"
        >
          <Plus className="h-3 w-3 mr-1" /> Adicionar
        </Button>
      </DialogTrigger>
      <DialogContent className="border-slate-700 bg-[#0B1320] text-slate-200 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-slate-100 flex items-center gap-2">
            <span className="w-1 h-5 bg-[#C5A059] rounded-full inline-block"></span>
            Nova Despesa Estimada
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label className="text-slate-300 font-medium">Data de Vencimento</Label>
            <Input
              type="date"
              style={{ colorScheme: 'dark' }}
              value={newDespesa.data}
              onChange={(e) => setNewDespesa({ ...newDespesa, data: e.target.value })}
              className="bg-[#050A13] border-slate-700 text-slate-100 focus-visible:ring-[#C5A059]/50"
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-slate-300 font-medium">Categoria</Label>
            {isNewCat ? (
              <div className="flex gap-2">
                <Input
                  autoFocus
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Nome da categoria..."
                  className="bg-[#050A13] border-slate-700 text-slate-100"
                />
                <Button
                  onClick={handleCreateCat}
                  className="bg-[#C5A059] hover:bg-[#b08d4d] text-[#001529] font-bold"
                >
                  Ok
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setIsNewCat(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Select
                value={newDespesa.categoria}
                onValueChange={(v) =>
                  v === 'nova' ? setIsNewCat(true) : setNewDespesa({ ...newDespesa, categoria: v })
                }
              >
                <SelectTrigger className="bg-[#050A13] border-slate-700 text-slate-100">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="bg-[#0F1A2A] border-slate-700 text-slate-200">
                  {categorias.map((cat) => (
                    <SelectItem key={cat.id} value={cat.nome}>
                      {cat.nome}
                    </SelectItem>
                  ))}
                  <SelectItem value="nova" className="text-[#C5A059] font-bold">
                    + Nova Categoria
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="grid gap-2">
            <Label className="text-slate-300 font-medium">Descrição (Opcional)</Label>
            <Input
              value={newDespesa.descricao}
              onChange={(e) => setNewDespesa({ ...newDespesa, descricao: e.target.value })}
              className="bg-[#050A13] border-slate-700 text-slate-100"
              placeholder="Ex: Fornecedor X"
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-slate-300 font-medium">Valor Estimado (R$)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C5A059] font-medium text-sm">
                R$
              </span>
              <Input
                type="number"
                value={newDespesa.valor}
                onChange={(e) => setNewDespesa({ ...newDespesa, valor: e.target.value })}
                className="bg-[#050A13] border-slate-700 text-slate-100 pl-9"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            className="border-slate-700 text-slate-300 bg-[#0F1A2A] hover:bg-slate-800"
            onClick={() => setIsOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            className="bg-[#C5A059] hover:bg-[#b08d4d] text-[#001529] font-bold"
            onClick={handleSave}
          >
            Salvar Despesa
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

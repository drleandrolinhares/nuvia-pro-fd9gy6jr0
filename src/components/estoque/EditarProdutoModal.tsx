import { useState, useEffect } from 'react'
import { Loader2, Save } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Produto, fetchEspecialidades, updateProduto } from '@/services/produtos'

interface EditarProdutoModalProps {
  produto: Produto | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditarProdutoModal({
  produto,
  open,
  onOpenChange,
  onSuccess,
}: EditarProdutoModalProps) {
  const [loading, setLoading] = useState(false)
  const [especialidades, setEspecialidades] = useState<{ id: string; nome: string }[]>([])

  const [nome, setNome] = useState('')
  const [marca, setMarca] = useState('')
  const [especialidadeId, setEspecialidadeId] = useState('none')
  const [codigoBarras, setCodigoBarras] = useState('')
  const [quantidadeMinima, setQuantidadeMinima] = useState('')
  const [sala, setSala] = useState('')

  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      loadEspecialidades()
      if (produto) {
        setNome(produto.nome || '')
        setMarca(produto.marca || '')
        setEspecialidadeId(produto.especialidade_id || 'none')
        setCodigoBarras(produto.codigo_barras || '')
        setQuantidadeMinima(produto.quantidade_minima?.toString() || '0')
        setSala(produto.sala || '')
      }
    }
  }, [open, produto])

  const loadEspecialidades = async () => {
    const { data } = await fetchEspecialidades()
    if (data) {
      setEspecialidades(data)
    }
  }

  const handleSave = async () => {
    if (!produto) return
    if (!nome.trim()) {
      toast({
        title: 'Campo obrigatório',
        description: 'O nome do produto é obrigatório.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    const { error } = await updateProduto(produto.id, {
      nome: nome.trim(),
      marca: marca.trim() || null,
      especialidade_id: especialidadeId === 'none' ? null : especialidadeId,
      codigo_barras: codigoBarras.trim() || null,
      quantidade_minima: parseInt(quantidadeMinima) || 0,
      sala: sala.trim() || null,
    })

    setLoading(false)

    if (error) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Sucesso',
        description: 'Produto atualizado com sucesso.',
      })
      onSuccess()
      onOpenChange(false)
    }
  }

  if (!produto) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Produto</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Produto *</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Resina Composta"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="marca">Marca</Label>
              <Input
                id="marca"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                placeholder="Ex: 3M"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="especialidade">Especialidade</Label>
              <Select value={especialidadeId} onValueChange={setEspecialidadeId}>
                <SelectTrigger id="especialidade">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  {especialidades.map((esp) => (
                    <SelectItem key={esp.id} value={esp.id}>
                      {esp.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="codigo">Código de Barras</Label>
            <Input
              id="codigo"
              value={codigoBarras}
              onChange={(e) => setCodigoBarras(e.target.value)}
              placeholder="Digite ou escaneie o código"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="qtd_min">Estoque Mínimo</Label>
              <Input
                id="qtd_min"
                type="number"
                min="0"
                value={quantidadeMinima}
                onChange={(e) => setQuantidadeMinima(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sala">Sala de Armazenamento</Label>
              <Input
                id="sala"
                value={sala}
                onChange={(e) => setSala(e.target.value)}
                placeholder="Ex: Estoque Principal"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

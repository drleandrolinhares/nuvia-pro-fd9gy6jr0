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
import {
  Produto,
  fetchEspecialidades,
  updateProduto,
  fetchEspecialidadeCampos,
  fetchProdutoCamposValores,
  upsertProdutoCamposValores,
} from '@/services/produtos'
import * as cadastrosService from '@/services/cadastros'

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
  const [numeroArmario, setNumeroArmario] = useState('')

  const [camposDinamicos, setCamposDinamicos] = useState<any[]>([])
  const [valoresDinamicos, setValoresDinamicos] = useState<Record<string, string>>({})

  const [marcasImplante, setMarcasImplante] = useState<{ id: string; nome: string }[]>([])
  const [diametrosImplante, setDiametrosImplante] = useState<{ id: string; nome: string }[]>([])
  const [tamanhosImplante, setTamanhosImplante] = useState<{ id: string; nome: string }[]>([])

  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      loadEspecialidades()
      cadastrosService.getItems('marcas_implante').then(setMarcasImplante)
      cadastrosService.getItems('diametros_implante').then(setDiametrosImplante)
      cadastrosService.getItems('tamanhos_implante').then(setTamanhosImplante)

      if (produto) {
        setNome(produto.nome || '')
        setMarca(produto.marca || '')
        setEspecialidadeId(produto.especialidade_id || 'none')
        setCodigoBarras(produto.codigo_barras || '')
        setQuantidadeMinima(produto.quantidade_minima?.toString() || '0')
        setSala(produto.sala || '')
        setNumeroArmario(produto.numero_armario || '')

        if (produto.especialidade_id) {
          fetchEspecialidadeCampos(produto.especialidade_id).then((res) => {
            if (res.data) setCamposDinamicos(res.data)
          })
          fetchProdutoCamposValores(produto.id).then((res) => {
            if (res.data) {
              const vals: Record<string, string> = {}
              res.data.forEach((item: any) => {
                vals[item.campo_id] = item.valor
              })
              setValoresDinamicos(vals)
            }
          })
        }
      }
    }
  }, [open, produto])

  useEffect(() => {
    if (open && produto && especialidadeId !== produto.especialidade_id) {
      if (especialidadeId !== 'none') {
        fetchEspecialidadeCampos(especialidadeId).then((res) => {
          if (res.data) setCamposDinamicos(res.data)
          setValoresDinamicos({})
        })
      } else {
        setCamposDinamicos([])
        setValoresDinamicos({})
      }
    } else if (open && produto && especialidadeId === produto.especialidade_id) {
      // Already handled by initial load
    }
  }, [especialidadeId, open, produto])

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
    const { data, error } = await updateProduto(produto.id, {
      nome: nome.trim(),
      marca: marca.trim() || null,
      especialidade_id: especialidadeId === 'none' ? null : especialidadeId,
      codigo_barras: codigoBarras.trim() || null,
      quantidade_minima: parseInt(quantidadeMinima) || 0,
      sala: sala.trim() || null,
      numero_armario: numeroArmario.trim() || null,
    })

    setLoading(false)

    if (error) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      if (Object.keys(valoresDinamicos).length > 0) {
        await upsertProdutoCamposValores(produto.id, valoresDinamicos)
      }
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
      <DialogContent className="max-w-lg">
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

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="qtd_min">Estq. Mínimo</Label>
              <Input
                id="qtd_min"
                type="number"
                min="0"
                value={quantidadeMinima}
                onChange={(e) => setQuantidadeMinima(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sala">Sala</Label>
              <Input
                id="sala"
                value={sala}
                onChange={(e) => setSala(e.target.value)}
                placeholder="Ex: Estoque Principal"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="armario">Nº do Armário</Label>
              <Input
                id="armario"
                value={numeroArmario}
                onChange={(e) => setNumeroArmario(e.target.value)}
                placeholder="Ex: A1"
              />
            </div>
          </div>

          {camposDinamicos.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-[#d4af37]/20 mt-4 bg-[#1a2a4a] p-5 rounded-xl shadow-sm animate-fade-in">
              <h3 className="font-bold text-[#d4af37] text-sm uppercase tracking-wider">
                DADOS DO IMPLANTE
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {camposDinamicos.map((config) => {
                  const campo = config.campos
                  if (!campo) return null

                  let options: { id: string; nome: string }[] = []
                  if (campo.nome.toLowerCase().includes('marca')) options = marcasImplante
                  else if (
                    campo.nome.toLowerCase().includes('diâmetro') ||
                    campo.nome.toLowerCase().includes('diametro')
                  )
                    options = diametrosImplante
                  else if (campo.nome.toLowerCase().includes('tamanho')) options = tamanhosImplante

                  return (
                    <div key={campo.id} className="space-y-2">
                      <Label className="text-slate-200">{campo.nome}</Label>
                      {options.length > 0 || campo.tipo === 'select' ? (
                        <Select
                          value={valoresDinamicos[campo.id] || ''}
                          onValueChange={(val) =>
                            setValoresDinamicos((prev) => ({ ...prev, [campo.id]: val }))
                          }
                        >
                          <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-[#d4af37]">
                            <SelectValue placeholder={`Selecione ${campo.nome.toLowerCase()}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {options.map((opt) => (
                              <SelectItem key={opt.id} value={opt.nome}>
                                {opt.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          className="bg-white/5 border-white/10 text-white focus-visible:ring-[#d4af37]"
                          placeholder={`Digite ${campo.nome.toLowerCase()}`}
                          value={valoresDinamicos[campo.id] || ''}
                          onChange={(e) =>
                            setValoresDinamicos((prev) => ({ ...prev, [campo.id]: e.target.value }))
                          }
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
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

import { useState, useEffect, useMemo } from 'react'
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
import { Switch } from '@/components/ui/switch'
import {
  fetchProdutos,
  fetchEspecialidades,
  fetchEmbalagens,
  createProduto,
  updateProduto,
  fetchEspecialidadeCampos,
  upsertProdutoCamposValores,
  fetchProdutoCamposValores,
  Produto,
  formatProdutoVariacoes,
} from '@/services/produtos'
import { fetchUltimasComprasProduto, CompraItem } from '@/services/compras'
import { format, parseISO } from 'date-fns'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'

interface CompraData {
  fornecedor_id?: string
  fornecedorNome?: string
  data?: string
  nfe?: string
}

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
  compraData: CompraData
  salas: any[]
  itemToEdit?: CompraItem
  onAdd: (item: CompraItem) => void
}

export function CompraItemFormModal({
  open,
  onOpenChange,
  compraData,
  salas,
  itemToEdit,
  onAdd,
}: Props) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [produtos, setProdutos] = useState<Produto[]>([])
  const [especialidades, setEspecialidades] = useState<any[]>([])
  const [embalagens, setEmbalagens] = useState<any[]>([])
  const [ultimas, setUltimas] = useState<any[]>([])

  const [campoOpcoes, setCampoOpcoes] = useState<Record<string, any[]>>({})

  const [produtoId, setProdutoId] = useState('')
  const [nome, setNome] = useState('')
  const [marca, setMarca] = useState('')
  const [especialidadeId, setEspecialidadeId] = useState('')
  const [embalagemId, setEmbalagemId] = useState('')
  const [salaId, setSalaId] = useState('')
  const [valorTotal, setValorTotal] = useState('')
  const [qtdComprada, setQtdComprada] = useState('')
  const [itensEmbalagem, setItensEmbalagem] = useState('')
  const [referenciaConsumo, setReferenciaConsumo] = useState<'qtd_comprada' | 'itens_embalagem'>(
    'qtd_comprada',
  )
  const [validade, setValidade] = useState('')
  const [numeroArmario, setNumeroArmario] = useState('')
  const [estoqueMinimo, setEstoqueMinimo] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [manterPreenchido, setManterPreenchido] = useState(false)

  const [camposPersonalizados, setCamposPersonalizados] = useState<any[]>([])
  const [valoresCampos, setValoresCampos] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      fetchProdutos().then((res) => setProdutos(res.data || []))
      fetchEspecialidades().then((res) => setEspecialidades(res.data || []))
      fetchEmbalagens().then((res) => setEmbalagens(res.data || []))

      supabase
        .from('campo_opcoes')
        .select('id, campo_id, especialidade_id, nome')
        .order('nome')
        .then(({ data }) => {
          if (data) {
            const map: Record<string, any[]> = {}
            data.forEach((o) => {
              if (!map[o.campo_id]) map[o.campo_id] = []
              map[o.campo_id].push({ id: o.id, nome: o.nome, especialidade_id: o.especialidade_id })
            })
            setCampoOpcoes(map)
          }
        })
    } else {
      resetForm()
    }
  }, [open])

  useEffect(() => {
    if (itemToEdit && produtos.length > 0) {
      setProdutoId(itemToEdit.produto_id)
      setValorTotal(itemToEdit.valor_total.toString())
      setQtdComprada(itemToEdit.qtd_comprada.toString())
      setItensEmbalagem(itemToEdit.itens_embalagem ? itemToEdit.itens_embalagem.toString() : '')
      setReferenciaConsumo((itemToEdit.referencia_consumo as any) || 'qtd_comprada')
      setObservacoes(itemToEdit.observacoes || '')
      if (itemToEdit.data_validade) {
        setValidade(itemToEdit.data_validade.substring(0, 7))
      }
    }
  }, [itemToEdit, produtos])

  useEffect(() => {
    if (produtoId && produtoId !== 'new') {
      const p = produtos.find((x) => x.id === produtoId)
      if (p) {
        setNome(p.nome)
        setMarca(p.marca || '')
        setEspecialidadeId(p.especialidade_id || '')
        setEmbalagemId(p.embalagem_id || '')
        setSalaId(p.sala_id || '')
        setNumeroArmario(p.numero_armario || '')
        setEstoqueMinimo(p.quantidade_minima?.toString() || '')

        if (!itemToEdit || itemToEdit.produto_id !== produtoId) {
          setReferenciaConsumo(p.referencia_consumo || 'qtd_comprada')
          setValidade(p.validade ? p.validade.substring(0, 7) : '')
        }

        fetchUltimasComprasProduto(p.id).then((res) => setUltimas(res.data || []))
        fetchProdutoCamposValores(p.id).then((res) => {
          const vals: Record<string, string> = {}
          res.data?.forEach((v) => {
            vals[v.campo_id] = v.valor
          })
          setValoresCampos(vals)
        })
      }
    } else if (produtoId === 'new') {
      setNome('')
      setMarca('')
      if (!itemToEdit) setReferenciaConsumo('qtd_comprada')
      if (!itemToEdit) setValidade('')
      setNumeroArmario('')
      setEstoqueMinimo('')
      setSalaId('')
      setEspecialidadeId('')
      setEmbalagemId('')
      setUltimas([])
      setValoresCampos({})
    }
  }, [produtoId, produtos, itemToEdit])

  useEffect(() => {
    if (especialidadeId) {
      supabase
        .from('especialidade_campos')
        .select('*, campos_personalizados(*)')
        .eq('especialidade_id', especialidadeId)
        .eq('ativo', true)
        .order('ordem', { ascending: true })
        .then((res) => {
          if (res.data && res.data.length > 0) {
            setCamposPersonalizados(res.data)
          } else {
            fetchEspecialidadeCampos(especialidadeId).then((res2) => {
              if (res2.data) setCamposPersonalizados(res2.data)
            })
          }
        })
    } else {
      setCamposPersonalizados([])
    }
  }, [especialidadeId])

  const resetForm = () => {
    setProdutoId('')
    setNome('')
    setValorTotal('')
    setQtdComprada('')
    setItensEmbalagem('')
    setObservacoes('')
  }

  const vu = useMemo(() => {
    const vt = parseFloat(valorTotal) || 0
    const qc = parseInt(qtdComprada) || 1
    const ie = parseInt(itensEmbalagem) || 1
    if (referenciaConsumo === 'itens_embalagem') return vt / ie
    return vt / qc
  }, [valorTotal, qtdComprada, itensEmbalagem, referenciaConsumo])

  const especialidadeNome =
    especialidades.find((e) => e.id === especialidadeId)?.nome?.toUpperCase() || 'MATERIAL'
  const showCard = camposPersonalizados.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!produtoId) return
    setLoading(true)

    let finalProdutoId = produtoId
    const dbValidade = validade ? `${validade}-01` : null

    const payloadProduto = {
      nome,
      marca: marca || null,
      especialidade_id: especialidadeId || null,
      embalagem_id: embalagemId || null,
      sala_id: salaId || null,
      validade: dbValidade,
      numero_armario: numeroArmario || null,
      quantidade_minima: parseInt(estoqueMinimo) || 0,
      referencia_consumo: referenciaConsumo,
      custo_unitario: vu,
    }

    if (produtoId === 'new') {
      const { data, error } = await createProduto({ ...payloadProduto, quantidade_estoque: 0 })
      if (error || !data) {
        toast({ title: 'Erro', description: error?.message, variant: 'destructive' })
        setLoading(false)
        return
      }
      finalProdutoId = data.id
      setProdutos([...produtos, data as Produto])
    } else {
      const { error } = await updateProduto(produtoId, payloadProduto)
      if (error) {
        toast({ title: 'Erro', description: error.message, variant: 'destructive' })
        setLoading(false)
        return
      }
    }

    if (Object.keys(valoresCampos).length > 0) {
      await upsertProdutoCamposValores(finalProdutoId, valoresCampos)
    }

    onAdd({
      produto_id: finalProdutoId,
      produto_nome: nome,
      produto_marca: marca,
      produto_sala: salas.find((s) => s.id === salaId)?.nome,
      valor_total: parseFloat(valorTotal) || 0,
      qtd_comprada: parseInt(qtdComprada) || 0,
      itens_embalagem:
        referenciaConsumo === 'itens_embalagem' ? parseInt(itensEmbalagem) || null : null,
      referencia_consumo: referenciaConsumo,
      valor_unitario: vu,
      estoque_adicionado:
        referenciaConsumo === 'itens_embalagem'
          ? parseInt(itensEmbalagem) || 0
          : parseInt(qtdComprada) || 0,
      data_validade: dbValidade,
      numero_armario: numeroArmario || null,
      observacoes: observacoes || null,
    })

    setLoading(false)
    if (!manterPreenchido) {
      onOpenChange(false)
    } else {
      resetForm()
      toast({ title: 'Adicionado', description: 'Produto adicionado à compra.' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {itemToEdit ? 'Editar Produto' : 'Adicionar Produto à Compra'}
          </DialogTitle>
        </DialogHeader>

        <div className="bg-amber-50 p-3 rounded-md border border-amber-200 text-sm flex flex-wrap gap-x-6 gap-y-2 mb-2">
          <div>
            <span className="font-bold text-amber-900">Fornecedor:</span>{' '}
            <span className="text-amber-800">{compraData.fornecedorNome || '-'}</span>
          </div>
          <div>
            <span className="font-bold text-amber-900">Data:</span>{' '}
            <span className="text-amber-800">
              {compraData.data ? format(parseISO(compraData.data), 'dd/MM/yyyy') : '-'}
            </span>
          </div>
          <div>
            <span className="font-bold text-amber-900">NFe:</span>{' '}
            <span className="text-amber-800">{compraData.nfe || '-'}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label>Produto *</Label>
              <Select value={produtoId} onValueChange={setProdutoId} disabled={!!itemToEdit}>
                <SelectTrigger className="border-slate-300">
                  <SelectValue placeholder="Selecione ou crie um novo..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new" className="font-bold text-amber-600 bg-amber-50">
                    --- Novo Produto ---
                  </SelectItem>
                  {produtos.map((p) => {
                    const variacoes = formatProdutoVariacoes(p)
                    return (
                      <SelectItem key={p.id} value={p.id}>
                        {p.nome} {variacoes ? `- ${variacoes}` : ''} {p.marca ? `(${p.marca})` : ''}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Nome do Material *</Label>
              <Input
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="border-slate-300"
              />
            </div>

            <div className="space-y-2">
              <Label>Marca</Label>
              <Input
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                className="border-slate-300"
              />
            </div>

            <div className="space-y-2">
              <Label>Especialidade</Label>
              <Select value={especialidadeId} onValueChange={setEspecialidadeId}>
                <SelectTrigger className="border-slate-300">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {especialidades.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Embalagem de Compra</Label>
              <Select value={embalagemId} onValueChange={setEmbalagemId}>
                <SelectTrigger className="border-slate-300">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {embalagens.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Valor Total (R$) *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                required
                value={valorTotal}
                onChange={(e) => setValorTotal(e.target.value)}
                className="border-slate-300"
              />
            </div>

            <div className="space-y-2">
              <Label>Qtd Comprada *</Label>
              <Input
                type="number"
                min="1"
                required
                value={qtdComprada}
                onChange={(e) => setQtdComprada(e.target.value)}
                className="border-slate-300"
              />
            </div>

            <div className="space-y-2">
              <Label>Itens na Embalagem</Label>
              <Input
                type="number"
                min="1"
                value={itensEmbalagem}
                onChange={(e) => setItensEmbalagem(e.target.value)}
                className="border-slate-300"
              />
            </div>

            <div className="space-y-2">
              <Label>Referência de Consumo *</Label>
              <Select value={referenciaConsumo} onValueChange={(v: any) => setReferenciaConsumo(v)}>
                <SelectTrigger className="border-slate-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="qtd_comprada">Qtd Comprada</SelectItem>
                  <SelectItem value="itens_embalagem">Itens na Embalagem</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Valor Unitário (Calc)</Label>
              <Input
                value={`R$ ${vu.toFixed(2)}`}
                disabled
                className="bg-slate-100 text-slate-700 font-medium"
              />
            </div>

            <div className="space-y-2">
              <Label>Data de Validade (MM/AAAA)</Label>
              <Input
                type="month"
                value={validade}
                onChange={(e) => setValidade(e.target.value)}
                className="border-slate-300"
              />
            </div>

            <div className="space-y-2">
              <Label>Sala de Armazenamento</Label>
              <Select value={salaId} onValueChange={setSalaId}>
                <SelectTrigger className="border-slate-300">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {salas.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Número do Armário</Label>
              <Input
                value={numeroArmario}
                onChange={(e) => setNumeroArmario(e.target.value)}
                className="border-slate-300"
              />
            </div>

            <div className="space-y-2">
              <Label>Estoque Mínimo</Label>
              <Input
                type="number"
                min="0"
                value={estoqueMinimo}
                onChange={(e) => setEstoqueMinimo(e.target.value)}
                className="border-slate-300"
              />
            </div>

            <div className="space-y-2 md:col-span-3">
              <Label>Observações</Label>
              <Input
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="border-slate-300"
              />
            </div>

            {showCard && (
              <div className="col-span-1 md:col-span-3 mt-2 bg-[#1a2a4a] p-5 rounded-xl border border-[#1a2a4a] shadow-md animate-in fade-in slide-in-from-top-2">
                <h3 className="text-[#d4af37] font-extrabold mb-5 text-xs tracking-widest border-b border-[#d4af37]/30 pb-2 uppercase">
                  DADOS DO {especialidadeNome}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {camposPersonalizados.map((config) => {
                    const campo = config.campos || config.campos_personalizados
                    if (!campo) return null
                    const label = config.label_customizado || campo.nome || ''

                    const options = (campoOpcoes[campo.id] || []).filter(
                      (o: any) => !o.especialidade_id || o.especialidade_id === especialidadeId,
                    )
                    const isDynamicDropdown = options.length > 0 || campo.tipo === 'select'

                    return (
                      <div key={config.campo_id} className="space-y-2">
                        <Label className="text-[#d4af37] font-bold text-[11px] uppercase tracking-wider">
                          {label}
                        </Label>
                        {isDynamicDropdown ? (
                          <Select
                            value={valoresCampos[config.campo_id] || ''}
                            onValueChange={(val) =>
                              setValoresCampos({ ...valoresCampos, [config.campo_id]: val })
                            }
                          >
                            <SelectTrigger className="bg-slate-800 border-[#1a2a4a] text-white font-bold h-9 focus:ring-[#d4af37]">
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              {options.map((o) => (
                                <SelectItem key={o.id} value={o.nome}>
                                  {o.nome}
                                </SelectItem>
                              ))}
                              {options.length === 0 && (
                                <SelectItem value="none" disabled>
                                  Sem opções cadastradas
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            type={campo.tipo === 'number' ? 'number' : 'text'}
                            value={valoresCampos[config.campo_id] || ''}
                            onChange={(e) =>
                              setValoresCampos({
                                ...valoresCampos,
                                [config.campo_id]: e.target.value,
                              })
                            }
                            className="bg-slate-800 border-[#1a2a4a] text-white font-bold h-9 focus-visible:ring-[#d4af37] focus-visible:border-[#d4af37]"
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {ultimas.length > 0 && (
              <div className="col-span-1 md:col-span-3 text-xs text-slate-600 mt-2 p-3 bg-slate-50 rounded-md border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">
                  Histórico de Últimas Compras deste produto:
                </span>
                {ultimas.map((u, i) => (
                  <div
                    key={i}
                    className="flex justify-between py-1 border-b border-slate-100 last:border-0"
                  >
                    <span>
                      {format(parseISO(u.data_criacao), 'dd/MM/yy')} -{' '}
                      {u.compras?.fornecedores?.nome}
                    </span>
                    <span className="font-medium">
                      {u.qtd_comprada} un. a R$ {u.valor_unitario.toFixed(2)}/un
                    </span>
                  </div>
                ))}
              </div>
            )}

            {!itemToEdit && (
              <div className="flex items-center space-x-2 mt-2 col-span-1 md:col-span-3 bg-slate-50 p-3 rounded-md border border-slate-200">
                <Switch
                  id="manter-preenchido"
                  checked={manterPreenchido}
                  onCheckedChange={setManterPreenchido}
                />
                <Label
                  htmlFor="manter-preenchido"
                  className="cursor-pointer font-medium text-slate-800"
                >
                  Manter Preenchido (Adicionar Múltiplos Produtos)
                </Label>
              </div>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!produtoId || loading}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {itemToEdit ? 'Salvar Alterações' : 'Salvar Produto e Adicionar à Compra'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

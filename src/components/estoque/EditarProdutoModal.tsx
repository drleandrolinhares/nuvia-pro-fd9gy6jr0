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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
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
  const [salaId, setSalaId] = useState('none')
  const [salas, setSalas] = useState<{ id: string; nome: string }[]>([])
  const [numeroArmario, setNumeroArmario] = useState('')
  const [custoUnitario, setCustoUnitario] = useState('0')
  const [referenciaConsumo, setReferenciaConsumo] = useState<'qtd_comprada' | 'itens_embalagem'>(
    'qtd_comprada',
  )

  const [controlePorPrazo, setControlePorPrazo] = useState(false)
  const [alertaPrazoDias, setAlertaPrazoDias] = useState('')
  const [consumoEstimadoValor, setConsumoEstimadoValor] = useState('')
  const [consumoEstimadoFrequencia, setConsumoEstimadoFrequencia] = useState('MES')
  const [mostrarEstimativa, setMostrarEstimativa] = useState(false)
  const [observacoes, setObservacoes] = useState('')

  const [camposDinamicos, setCamposDinamicos] = useState<any[]>([])
  const [valoresDinamicos, setValoresDinamicos] = useState<Record<string, string>>({})
  const [campoOpcoes, setCampoOpcoes] = useState<Record<string, any[]>>({})

  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      loadEspecialidades()
      cadastrosService.getItems('salas').then((data) => setSalas(data || []))
      cadastrosService.getCampoOpcoes().then((data) => {
        if (data) {
          const map: Record<string, any[]> = {}
          data.forEach((o) => {
            if (!map[o.campo_id]) map[o.campo_id] = []
            map[o.campo_id].push({ id: o.id, nome: o.nome, especialidade_id: o.especialidade_id })
          })
          setCampoOpcoes(map)
        }
      })

      if (produto) {
        setNome(produto.nome || '')
        setMarca(produto.marca || '')
        setEspecialidadeId(produto.especialidade_id || 'none')
        setCodigoBarras(produto.codigo_barras || '')
        setQuantidadeMinima(produto.quantidade_minima?.toString() || '0')
        setSalaId(produto.sala_id || 'none')
        setNumeroArmario(produto.numero_armario || '')
        setCustoUnitario(produto.custo_unitario?.toString() || '0')
        if (
          produto.referencia_consumo === 'itens_embalagem' ||
          produto.referencia_consumo === 'qtd_comprada'
        ) {
          setReferenciaConsumo(produto.referencia_consumo)
        } else {
          setReferenciaConsumo('qtd_comprada')
        }

        if (produto.alerta_prazo_dias) {
          setControlePorPrazo(true)
          setAlertaPrazoDias(produto.alerta_prazo_dias.toString())
        } else {
          setControlePorPrazo(false)
          setAlertaPrazoDias('')
        }

        setConsumoEstimadoValor(produto.consumo_estimado_valor?.toString() || '')
        setConsumoEstimadoFrequencia(produto.consumo_estimado_frequencia?.toUpperCase() || 'MES')
        setMostrarEstimativa(!!produto.consumo_estimado_valor)
        setObservacoes(produto.observacoes || '')

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

    const salaNome = salaId !== 'none' ? salas.find((s) => s.id === salaId)?.nome || null : null

    const updates: Partial<Produto> = {
      nome: nome.trim().toUpperCase(),
      marca: marca.trim().toUpperCase() || null,
      especialidade_id: especialidadeId === 'none' ? null : especialidadeId,
      codigo_barras: codigoBarras.trim() || null,
      quantidade_minima: parseInt(quantidadeMinima) || 0,
      sala_id: salaId === 'none' ? null : salaId,
      sala: salaNome,
      numero_armario: numeroArmario.trim() || null,
      custo_unitario: parseFloat(custoUnitario) || 0,
      referencia_consumo: referenciaConsumo,
      alerta_prazo_dias: controlePorPrazo ? parseInt(alertaPrazoDias) || null : null,
      consumo_estimado_valor: consumoEstimadoValor ? parseFloat(consumoEstimadoValor) : null,
      consumo_estimado_frequencia: consumoEstimadoValor ? consumoEstimadoFrequencia : null,
      observacoes: observacoes.trim() || null,
    }

    if (controlePorPrazo && parseInt(alertaPrazoDias)) {
      if (!produto.data_proxima_revisao) {
        const date = new Date()
        date.setDate(date.getDate() + parseInt(alertaPrazoDias))
        updates.data_proxima_revisao = date.toISOString().split('T')[0]
      }
    } else {
      updates.data_proxima_revisao = null
    }

    const { data, error } = await updateProduto(produto.id, updates)

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
      <DialogContent className="max-w-lg overflow-y-auto max-h-[90vh]">
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

          <div className="grid grid-cols-4 gap-4">
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
              <Select value={salaId} onValueChange={setSalaId}>
                <SelectTrigger id="sala">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  {salas.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <div className="space-y-2">
              <Label htmlFor="custo_unitario">Custo Aprox.</Label>
              <Input
                id="custo_unitario"
                type="number"
                step="0.01"
                min="0"
                value={custoUnitario}
                onChange={(e) => setCustoUnitario(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ref_consumo">Critério de Consumo</Label>
            <Select
              value={referenciaConsumo}
              onValueChange={(val: any) => setReferenciaConsumo(val)}
            >
              <SelectTrigger id="ref_consumo">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="qtd_comprada">Quantidade Comprada (Unidades/Caixas)</SelectItem>
                <SelectItem value="itens_embalagem">Itens na Embalagem (Fracionado)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              Define como o estoque será incrementado nas próximas entradas.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Informações adicionais sobre o produto..."
              className="resize-none min-h-[80px]"
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-200 mt-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wider">
              Planejamento de Consumo
            </h3>

            <div className="flex items-center space-x-2">
              <Switch
                id="controle_prazo"
                checked={controlePorPrazo}
                onCheckedChange={setControlePorPrazo}
              />
              <Label htmlFor="controle_prazo" className="cursor-pointer">
                Controle de Estoque por Prazo
              </Label>
            </div>

            {controlePorPrazo && (
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="alerta_prazo">Dias para Reabastecimento</Label>
                <Input
                  id="alerta_prazo"
                  type="number"
                  min="1"
                  value={alertaPrazoDias}
                  onChange={(e) => setAlertaPrazoDias(e.target.value)}
                  placeholder="Ex: 90"
                />
                <p className="text-xs text-slate-500">
                  O produto reaparecerá para compra após este prazo, independente da quantidade.
                </p>
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              className="w-full justify-start text-slate-600 dark:text-slate-300"
              onClick={() => setMostrarEstimativa(!mostrarEstimativa)}
            >
              {mostrarEstimativa ? 'Ocultar Estimativa' : 'Estimar Consumo Médio'}
            </Button>

            {mostrarEstimativa && (
              <div className="grid grid-cols-2 gap-4 animate-fade-in">
                <div className="space-y-2">
                  <Label htmlFor="consumo_valor">Consumo Médio</Label>
                  <Input
                    id="consumo_valor"
                    type="number"
                    min="0"
                    step="0.01"
                    value={consumoEstimadoValor}
                    onChange={(e) => setConsumoEstimadoValor(e.target.value)}
                    placeholder="Ex: 2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="consumo_freq">Frequência</Label>
                  <Select
                    value={consumoEstimadoFrequencia}
                    onValueChange={setConsumoEstimadoFrequencia}
                  >
                    <SelectTrigger id="consumo_freq">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DIA">Por Dia</SelectItem>
                      <SelectItem value="SEMANA">Por Semana</SelectItem>
                      <SelectItem value="QUINZENA">Por Quinzena</SelectItem>
                      <SelectItem value="MES">Por Mês</SelectItem>
                      <SelectItem value="BIMESTRE">Por Bimestre</SelectItem>
                      <SelectItem value="TRIMESTRE">Por Trimestre</SelectItem>
                      <SelectItem value="SEMESTRE">Por Semestre</SelectItem>
                      <SelectItem value="ANO">Por Ano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {camposDinamicos.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-[#d4af37]/20 mt-4 bg-[#1a2a4a] p-5 rounded-xl shadow-sm animate-fade-in">
              <h3 className="font-bold text-[#d4af37] text-sm uppercase tracking-wider">
                DADOS ADICIONAIS -{' '}
                {especialidades.find((e) => e.id === especialidadeId)?.nome || 'MATERIAL'}
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {camposDinamicos.map((config) => {
                  const campo = config.campos || config.campos_personalizados
                  if (!campo) return null

                  const labelName = config.label_customizado || campo.nome
                  const options = (campoOpcoes[campo.id] || []).filter(
                    (o: any) => !o.especialidade_id || o.especialidade_id === especialidadeId,
                  )
                  const isDynamicDropdown = options.length > 0 || campo.tipo === 'select'

                  return (
                    <div key={campo.id} className="space-y-2">
                      <Label className="text-slate-200">{labelName}</Label>
                      {isDynamicDropdown ? (
                        <Select
                          value={valoresDinamicos[campo.id] || ''}
                          onValueChange={(val) =>
                            setValoresDinamicos((prev) => ({ ...prev, [campo.id]: val }))
                          }
                        >
                          <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-[#d4af37]">
                            <SelectValue placeholder={`Selecione...`} />
                          </SelectTrigger>
                          <SelectContent>
                            {options.map((opt) => (
                              <SelectItem key={opt.id} value={opt.nome}>
                                {opt.nome}
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
                          className="bg-white/5 border-white/10 text-white focus-visible:ring-[#d4af37]"
                          placeholder={`Digite ${labelName.toLowerCase()}`}
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

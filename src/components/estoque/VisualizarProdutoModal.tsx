import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { Loader2, ArrowDownRight, ArrowUpRight, Package } from 'lucide-react'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Produto, fetchProdutoMovimentacoes } from '@/services/produtos'
import { supabase } from '@/lib/supabase/client'

interface VisualizarProdutoModalProps {
  produto: Produto | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VisualizarProdutoModal({
  produto,
  open,
  onOpenChange,
}: VisualizarProdutoModalProps) {
  const [entradas, setEntradas] = useState<any[]>([])
  const [saidas, setSaidas] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const [camposExtras, setCamposExtras] = useState<{ nome: string; valor: string }[]>([])

  useEffect(() => {
    if (open && produto) {
      loadMovimentacoes()
      loadCamposExtras()
    }
  }, [open, produto])

  const loadCamposExtras = async () => {
    if (!produto) return

    let fieldsConfig: any[] = []
    if (produto.especialidade_id) {
      const { data } = await supabase
        .from('especialidade_campos')
        .select(`
          campo_id,
          campos_personalizados ( nome )
        `)
        .eq('especialidade_id', produto.especialidade_id)
        .eq('ativo', true)

      if (data) fieldsConfig = data
    }

    const { data: valuesData } = await supabase
      .from('produto_campos_valores')
      .select(`
        campo_id,
        valor,
        campos_personalizados ( nome )
      `)
      .eq('produto_id', produto.id)

    const valuesMap = new Map()
    if (valuesData) {
      valuesData.forEach((v) => {
        valuesMap.set(v.campo_id, v.valor)
      })
    }

    const result: { nome: string; valor: string }[] = []

    fieldsConfig.forEach((fc) => {
      result.push({
        nome: fc.campos_personalizados?.nome || 'Campo',
        valor: valuesMap.get(fc.campo_id) || '-',
      })
      valuesMap.delete(fc.campo_id)
    })

    if (valuesData) {
      valuesData.forEach((v) => {
        if (valuesMap.has(v.campo_id)) {
          result.push({
            nome: (v.campos_personalizados as any)?.nome || 'Campo Extra',
            valor: v.valor || '-',
          })
        }
      })
    }

    result.sort((a, b) => {
      const aLower = a.nome.toLowerCase()
      const bLower = b.nome.toLowerCase()

      const getWeight = (nome: string) => {
        if (nome.includes('tamanho')) return 1
        if (nome.includes('diâmetro') || nome.includes('diametro') || nome === 'ø') return 2
        return 3
      }

      const weightA = getWeight(aLower)
      const weightB = getWeight(bLower)

      if (weightA !== weightB) return weightA - weightB
      return a.nome.localeCompare(b.nome)
    })

    setCamposExtras(result)
  }

  const loadMovimentacoes = async () => {
    if (!produto) return
    setLoading(true)
    const { entradas: ent, saidas: sai } = await fetchProdutoMovimentacoes(produto.id)
    setEntradas(ent)
    setSaidas(sai)
    setLoading(false)
  }

  if (!produto) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package className="w-5 h-5 text-amber-500" />
            Detalhes do Produto
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Nome</p>
              <p className="font-semibold text-slate-900">{produto.nome}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Marca</p>
              <p className="font-semibold text-slate-900">{produto.marca || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Especialidade</p>
              <Badge variant="secondary" className="mt-1">
                {produto.especialidades?.nome || 'Não classificado'}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Estoque Atual</p>
              <p
                className={`font-bold text-lg ${produto.quantidade_estoque <= produto.quantidade_minima ? 'text-red-600' : 'text-slate-900'}`}
              >
                {produto.quantidade_estoque}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Estoque Mínimo</p>
              <p className="font-semibold text-slate-900">{produto.quantidade_minima}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Sala / Armário</p>
              <p className="font-semibold text-slate-900">
                {produto.sala || '-'} {produto.numero_armario ? `/ ${produto.numero_armario}` : ''}
              </p>
            </div>
            <div className="col-span-2 md:col-span-3 bg-slate-50/80 p-3 rounded-lg border border-slate-100 mt-2">
              <p className="text-sm font-medium text-slate-500">Código de Barras</p>
              <p className="font-mono text-sm text-slate-900 mt-1 break-all">
                {produto.codigo_barras || '-'}
              </p>
            </div>
          </div>

          {camposExtras.length > 0 && (
            <div className="bg-[#1a2a4a] text-white p-5 rounded-xl space-y-4 shadow-sm animate-fade-in">
              <h3 className="font-bold text-[#d4af37] text-sm uppercase tracking-wider border-b border-white/10 pb-2">
                Dados do Implante
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {camposExtras.map((campo, idx) => (
                  <div key={idx}>
                    <p className="text-xs font-medium text-slate-300">{campo.nome}</p>
                    <p className="font-semibold text-white mt-1">{campo.valor}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                  <ArrowDownRight className="w-4 h-4 text-green-500" />
                  Últimas Entradas
                </h3>
                {entradas.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">Nenhuma entrada registrada.</p>
                ) : (
                  entradas.map((ent, idx) => (
                    <Card key={idx} className="bg-slate-50 border-slate-100">
                      <CardContent className="p-3 text-sm">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold text-slate-900">
                            +{ent.quantidade_comprada} unidades
                          </span>
                          <span className="text-slate-500 text-xs">
                            {ent.data_entrada
                              ? format(parseISO(ent.data_entrada), 'dd/MM/yyyy HH:mm')
                              : '-'}
                          </span>
                        </div>
                        <p className="text-slate-600 text-xs">
                          Fornecedor: {ent.fornecedores?.nome || '-'}
                        </p>
                        <p className="text-slate-600 text-xs">
                          Total: R${' '}
                          {ent.preco_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-red-500" />
                  Últimas Saídas
                </h3>
                {saidas.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">Nenhuma saída registrada.</p>
                ) : (
                  saidas.map((sai, idx) => (
                    <Card key={idx} className="bg-slate-50 border-slate-100">
                      <CardContent className="p-3 text-sm">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold text-slate-900">
                            -{sai.quantidade} unidades
                          </span>
                          <span className="text-slate-500 text-xs">
                            {sai.data_saida
                              ? format(parseISO(sai.data_saida), 'dd/MM/yyyy HH:mm')
                              : '-'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-[10px] py-0 h-4">
                            {sai.tipo_saida}
                          </Badge>
                        </div>
                        <p className="text-slate-600 text-xs line-clamp-2">
                          {sai.descricao || 'Sem descrição'}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

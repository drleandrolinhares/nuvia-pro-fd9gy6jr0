import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Shield, Save, Plus, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface ConfigNegociacao {
  id?: string
  percentual_entrada_padrao: number
}

interface FaixaParcela {
  id?: string
  faixa_numero?: number
  valor_minimo: number
  valor_maximo: number
  max_parcelas: number
}

export default function EntradaEFaixas() {
  const { toast } = useToast()
  const [config, setConfig] = useState<ConfigNegociacao>({ percentual_entrada_padrao: 0 })
  const [faixas, setFaixas] = useState<FaixaParcela[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    const { data: cfg } = await supabase
      .from('configuracoes_negociacao')
      .select('*')
      .limit(1)
      .single()

    if (cfg) {
      setConfig(cfg)
    }

    const { data: fx } = await supabase
      .from('faixas_valores_parcelas')
      .select('*')
      .order('valor_minimo', { ascending: true })

    if (fx) {
      setFaixas(fx)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const saveConfig = async () => {
    if (config.id) {
      const { error } = await supabase
        .from('configuracoes_negociacao')
        .update({ percentual_entrada_padrao: config.percentual_entrada_padrao })
        .eq('id', config.id)
      if (error) {
        toast({ title: 'Erro', description: error.message, variant: 'destructive' })
        return
      }
    } else {
      const { data, error } = await supabase
        .from('configuracoes_negociacao')
        .insert({ percentual_entrada_padrao: config.percentual_entrada_padrao })
        .select()
        .single()
      if (error) {
        toast({ title: 'Erro', description: error.message, variant: 'destructive' })
        return
      }
      if (data) setConfig(data)
    }
    toast({ title: 'Entrada padrão salva com sucesso' })
  }

  const updateFaixa = (index: number, field: keyof FaixaParcela, value: any) => {
    const nf = [...faixas]
    nf[index] = { ...nf[index], [field]: value }
    setFaixas(nf)
  }

  const saveFaixa = async (faixa: FaixaParcela, index: number) => {
    const payload = {
      faixa_numero: faixa.faixa_numero,
      valor_minimo: faixa.valor_minimo,
      valor_maximo: faixa.valor_maximo,
      max_parcelas: faixa.max_parcelas,
    }

    if (faixa.id) {
      const { error } = await supabase
        .from('faixas_valores_parcelas')
        .update(payload)
        .eq('id', faixa.id)
      if (error) {
        toast({
          title: 'Erro ao salvar faixa',
          description: error.message,
          variant: 'destructive',
        })
        return
      }
    } else {
      const { data, error } = await supabase
        .from('faixas_valores_parcelas')
        .insert(payload)
        .select()
        .single()

      if (error) {
        toast({
          title: 'Erro ao criar faixa',
          description: error.message,
          variant: 'destructive',
        })
        return
      }

      if (data) {
        const nf = [...faixas]
        nf[index] = data
        setFaixas(nf)
      }
    }
    toast({ title: 'Faixa salva com sucesso' })
  }

  const removeFaixa = async (id?: string, index?: number) => {
    if (id) {
      const { error } = await supabase.from('faixas_valores_parcelas').delete().eq('id', id)
      if (error) {
        toast({
          title: 'Erro ao remover faixa',
          description: error.message,
          variant: 'destructive',
        })
        return
      }
      toast({ title: 'Faixa removida' })
      loadData()
    } else if (index !== undefined) {
      const nf = [...faixas]
      nf.splice(index, 1)
      setFaixas(nf)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Entrada Padrão e Faixas de Valores</h1>
          <p className="text-slate-500">
            Configure o percentual de entrada e os limites de parcelamento.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mr-3" />
          Carregando configurações...
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-slate-500 font-bold tracking-wider">
                ENTRADA PADRÃO
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-end gap-4">
              <div className="space-y-2 w-64">
                <Label className="text-xs font-semibold text-slate-600">
                  PERCENTUAL DE ENTRADA (%)
                </Label>
                <Input
                  type="number"
                  value={config.percentual_entrada_padrao}
                  onChange={(e) =>
                    setConfig({ ...config, percentual_entrada_padrao: Number(e.target.value) })
                  }
                />
              </div>
              <Button onClick={saveConfig} className="bg-amber-500 hover:bg-amber-600 text-white">
                <Save className="w-4 h-4 mr-2" /> Salvar Entrada
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-sm text-slate-500 font-bold tracking-wider">
                FAIXAS DE VALORES E MÁXIMO DE PARCELAS
              </CardTitle>
              <Button
                onClick={() =>
                  setFaixas([
                    ...faixas,
                    {
                      faixa_numero: faixas.length + 1,
                      valor_minimo: 0,
                      valor_maximo: 0,
                      max_parcelas: 1,
                    },
                  ])
                }
                variant="outline"
                className="gap-2"
              >
                <Plus className="w-4 h-4" /> NOVA FAIXA
              </Button>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="w-[80px] font-semibold text-slate-600">FAIXA</TableHead>
                      <TableHead className="font-semibold text-slate-600">
                        VALOR MÍNIMO (R$)
                      </TableHead>
                      <TableHead className="font-semibold text-slate-600">
                        VALOR MÁXIMO (R$)
                      </TableHead>
                      <TableHead className="font-semibold text-slate-600">MÁX. PARCELAS</TableHead>
                      <TableHead className="w-[120px] text-right font-semibold text-slate-600">
                        AÇÕES
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {faixas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-slate-500">
                          Nenhuma faixa configurada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      faixas.map((faixa, index) => (
                        <TableRow key={faixa.id || index}>
                          <TableCell>
                            <Input
                              type="number"
                              value={faixa.faixa_numero || ''}
                              onChange={(e) =>
                                updateFaixa(index, 'faixa_numero', Number(e.target.value))
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={faixa.valor_minimo}
                              onChange={(e) =>
                                updateFaixa(index, 'valor_minimo', Number(e.target.value))
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={faixa.valor_maximo}
                              onChange={(e) =>
                                updateFaixa(index, 'valor_maximo', Number(e.target.value))
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={faixa.max_parcelas}
                              onChange={(e) =>
                                updateFaixa(index, 'max_parcelas', Number(e.target.value))
                              }
                            />
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              onClick={() => saveFaixa(faixa, index)}
                              size="icon"
                              variant="ghost"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 w-8"
                              title="Salvar Faixa"
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => removeFaixa(faixa.id, index)}
                              size="icon"
                              variant="ghost"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8"
                              title="Remover Faixa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

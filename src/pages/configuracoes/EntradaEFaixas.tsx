import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Shield, Save, Plus, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ConfigNegociacao {
  id?: string
  percentual_entrada_padrao: number
}

interface FaixaParcela {
  id?: string
  valor_minimo: number
  valor_maximo: number
  max_parcelas: number
}

export default function EntradaEFaixas() {
  const { toast } = useToast()
  const [config, setConfig] = useState<ConfigNegociacao>({ percentual_entrada_padrao: 0 })
  const [faixas, setFaixas] = useState<FaixaParcela[]>([])

  const loadData = async () => {
    const { data: cfg } = await supabase
      .from('configuracoes_negociacao')
      .select('*')
      .limit(1)
      .single()
    if (cfg) setConfig(cfg)

    const { data: fx } = await supabase
      .from('faixas_valores_parcelas')
      .select('*')
      .order('valor_minimo', { ascending: true })
    if (fx) setFaixas(fx)
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
      const { error } = await supabase
        .from('configuracoes_negociacao')
        .insert({ percentual_entrada_padrao: config.percentual_entrada_padrao })
      if (error) {
        toast({ title: 'Erro', description: error.message, variant: 'destructive' })
        return
      }
    }
    toast({ title: 'Entrada padrão salva com sucesso' })
    loadData()
  }

  const updateFaixa = (index: number, field: keyof FaixaParcela, value: any) => {
    const nf = [...faixas]
    nf[index] = { ...nf[index], [field]: value }
    setFaixas(nf)
  }

  const saveFaixa = async (faixa: FaixaParcela) => {
    if (faixa.id) {
      const { error } = await supabase
        .from('faixas_valores_parcelas')
        .update({
          valor_minimo: faixa.valor_minimo,
          valor_maximo: faixa.valor_maximo,
          max_parcelas: faixa.max_parcelas,
        })
        .eq('id', faixa.id)
      if (error) {
        toast({ title: 'Erro', description: error.message, variant: 'destructive' })
        return
      }
    } else {
      const { error } = await supabase.from('faixas_valores_parcelas').insert({
        valor_minimo: faixa.valor_minimo,
        valor_maximo: faixa.valor_maximo,
        max_parcelas: faixa.max_parcelas,
      })
      if (error) {
        toast({ title: 'Erro', description: error.message, variant: 'destructive' })
        return
      }
    }
    toast({ title: 'Faixa salva com sucesso' })
    loadData()
  }

  const removeFaixa = async (id?: string, index?: number) => {
    if (id) {
      const { error } = await supabase.from('faixas_valores_parcelas').delete().eq('id', id)
      if (error) {
        toast({ title: 'Erro', description: error.message, variant: 'destructive' })
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
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Entrada Padrão e Faixas</h1>
          <p className="text-slate-500">
            Configure o percentual de entrada e os limites de parcelamento.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Entrada Padrão</CardTitle>
          <CardDescription>Percentual mínimo exigido como entrada nas negociações.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-end gap-4">
          <div className="space-y-2 flex-1">
            <Label>Percentual de Entrada (%)</Label>
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
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Faixas de Parcelamento</CardTitle>
            <CardDescription>
              Defina o número máximo de parcelas com base no valor do tratamento.
            </CardDescription>
          </div>
          <Button
            onClick={() =>
              setFaixas([...faixas, { valor_minimo: 0, valor_maximo: 0, max_parcelas: 1 }])
            }
            variant="outline"
            className="gap-2"
          >
            <Plus className="w-4 h-4" /> Nova Faixa
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {faixas.length === 0 ? (
            <div className="text-center py-6 text-slate-500">Nenhuma faixa configurada.</div>
          ) : (
            faixas.map((faixa, index) => (
              <div
                key={faixa.id || index}
                className="flex items-end gap-4 p-4 border rounded-lg bg-slate-50/50"
              >
                <div className="space-y-2 flex-1">
                  <Label>Valor Mínimo (R$)</Label>
                  <Input
                    type="number"
                    value={faixa.valor_minimo}
                    onChange={(e) => updateFaixa(index, 'valor_minimo', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2 flex-1">
                  <Label>Valor Máximo (R$)</Label>
                  <Input
                    type="number"
                    value={faixa.valor_maximo}
                    onChange={(e) => updateFaixa(index, 'valor_maximo', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2 flex-1">
                  <Label>Máx. Parcelas</Label>
                  <Input
                    type="number"
                    value={faixa.max_parcelas}
                    onChange={(e) => updateFaixa(index, 'max_parcelas', Number(e.target.value))}
                  />
                </div>
                <Button
                  onClick={() => saveFaixa(faixa)}
                  size="icon"
                  className="bg-slate-900 hover:bg-slate-800 text-white"
                  title="Salvar Faixa"
                >
                  <Save className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => removeFaixa(faixa.id, index)}
                  size="icon"
                  variant="destructive"
                  title="Remover Faixa"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

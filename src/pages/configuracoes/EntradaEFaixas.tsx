import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Save } from 'lucide-react'

export default function EntradaEFaixas() {
  const [loading, setLoading] = useState(true)
  const [savingConfig, setSavingConfig] = useState(false)
  const [savingFaixas, setSavingFaixas] = useState(false)
  const [configuracao, setConfiguracao] = useState<any>(null)
  const [faixas, setFaixas] = useState<any[]>([])
  const { toast } = useToast()

  const loadData = async () => {
    try {
      setLoading(true)

      const { data: configData, error: configError } = await supabase
        .from('configuracoes_negociacao')
        .select('*')
        .limit(1)
        .maybeSingle()

      if (configError) throw configError

      if (!configData) {
        setConfiguracao({ id: 'new', percentual_entrada_padrao: 0 })
      } else {
        setConfiguracao(configData)
      }

      const { data: faixasData, error: faixasError } = await supabase
        .from('faixas_valores_parcelas')
        .select('*')
        .order('faixa_numero', { ascending: true })

      if (faixasError) throw faixasError

      if (!faixasData || faixasData.length === 0) {
        const defaultFaixas = Array.from({ length: 6 }).map((_, i) => ({
          id: `new-${i}`,
          faixa_numero: i,
          valor_minimo: 0,
          valor_maximo: 0,
          max_parcelas: 1,
        }))
        setFaixas(defaultFaixas)
      } else {
        setFaixas(faixasData)
      }
    } catch (error: any) {
      toast({ title: 'Erro ao carregar dados', description: error.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleConfigChange = (value: string) => {
    setConfiguracao({ ...configuracao, percentual_entrada_padrao: value })
  }

  const handleFaixaChange = (index: number, field: string, value: any) => {
    const newFaixas = [...faixas]
    newFaixas[index][field] = value
    setFaixas(newFaixas)
  }

  const handleSaveConfig = async () => {
    try {
      setSavingConfig(true)
      if (configuracao.id === 'new') {
        const { error } = await supabase.from('configuracoes_negociacao').insert({
          percentual_entrada_padrao: Number(configuracao.percentual_entrada_padrao),
        })
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('configuracoes_negociacao')
          .update({
            percentual_entrada_padrao: Number(configuracao.percentual_entrada_padrao),
            atualizado_em: new Date().toISOString(),
          })
          .eq('id', configuracao.id)
        if (error) throw error
      }
      toast({ title: 'Sucesso', description: 'Entrada padrão salva com sucesso!' })
      loadData()
    } catch (error: any) {
      toast({ title: 'Erro ao salvar config', description: error.message, variant: 'destructive' })
    } finally {
      setSavingConfig(false)
    }
  }

  const handleSaveFaixas = async () => {
    try {
      setSavingFaixas(true)
      for (const item of faixas) {
        if (item.id.startsWith('new-')) {
          const { error } = await supabase.from('faixas_valores_parcelas').insert({
            faixa_numero: item.faixa_numero,
            valor_minimo: Number(item.valor_minimo),
            valor_maximo: Number(item.valor_maximo),
            max_parcelas: Number(item.max_parcelas),
          })
          if (error) throw error
        } else {
          const { error } = await supabase
            .from('faixas_valores_parcelas')
            .update({
              faixa_numero: item.faixa_numero,
              valor_minimo: Number(item.valor_minimo),
              valor_maximo: Number(item.valor_maximo),
              max_parcelas: Number(item.max_parcelas),
            })
            .eq('id', item.id)
          if (error) throw error
        }
      }
      toast({ title: 'Sucesso', description: 'Faixas salvas com sucesso!' })
      loadData()
    } catch (error: any) {
      toast({ title: 'Erro ao salvar faixas', description: error.message, variant: 'destructive' })
    } finally {
      setSavingFaixas(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Entrada Padrão e Faixas
        </h1>
        <p className="text-slate-500 mt-2">
          Configure a entrada padrão e os limites de valores e parcelas para cada faixa.
        </p>
      </div>

      <Card className="border-slate-200 shadow-sm max-w-md">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
          <CardTitle className="text-lg text-slate-800">Entrada Padrão</CardTitle>
          <CardDescription>Defina a porcentagem de entrada mínima em boleto</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-end gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Percentual de Entrada (%)
              </label>
              <div className="relative">
                <Input
                  type="number"
                  value={configuracao?.percentual_entrada_padrao || 0}
                  onChange={(e) => handleConfigChange(e.target.value)}
                  className="bg-white font-medium"
                  step="0.01"
                  min="0"
                  max="100"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  %
                </span>
              </div>
            </div>
            <Button
              onClick={handleSaveConfig}
              disabled={savingConfig}
              className="bg-amber-500 hover:bg-amber-600 text-white font-medium"
            >
              {savingConfig ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg text-slate-800">Faixas de Valores e Parcelas</CardTitle>
              <CardDescription>
                Determine o limite de parcelas baseado no valor do tratamento
              </CardDescription>
            </div>
            <Button
              onClick={handleSaveFaixas}
              disabled={savingFaixas}
              className="bg-amber-500 hover:bg-amber-600 text-white font-medium"
            >
              {savingFaixas ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar Faixas
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-24 text-center font-semibold">Faixa</TableHead>
                <TableHead className="font-semibold text-right">Valor Mínimo (R$)</TableHead>
                <TableHead className="font-semibold text-right">Valor Máximo (R$)</TableHead>
                <TableHead className="w-40 font-semibold text-center">Máx. Parcelas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {faixas.map((item, idx) => (
                <TableRow key={item.id} className="hover:bg-slate-50/50">
                  <TableCell className="text-center font-medium text-slate-700">
                    {item.faixa_numero}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.valor_minimo || 0}
                      onChange={(e) => handleFaixaChange(idx, 'valor_minimo', e.target.value)}
                      className="bg-white text-right"
                      min="0"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.valor_maximo || 0}
                      onChange={(e) => handleFaixaChange(idx, 'valor_maximo', e.target.value)}
                      className="bg-white text-right"
                      min="0"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.max_parcelas || 1}
                      onChange={(e) => handleFaixaChange(idx, 'max_parcelas', e.target.value)}
                      className="bg-white text-center"
                      min="1"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

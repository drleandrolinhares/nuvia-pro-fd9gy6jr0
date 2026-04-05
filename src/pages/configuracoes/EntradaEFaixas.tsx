import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Loader2, Plus, Save, Trash2 } from 'lucide-react'

export default function EntradaEFaixas() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [configId, setConfigId] = useState<string | null>(null)
  const [percentualEntrada, setPercentualEntrada] = useState<number | string>(30)
  const [faixas, setFaixas] = useState<any[]>([])
  const { toast } = useToast()

  const loadData = async () => {
    try {
      setLoading(true)

      // Fetch Config
      const { data: configData, error: configError } = await supabase
        .from('configuracoes_negociacao')
        .select('*')
        .limit(1)
        .maybeSingle()

      if (configError) throw configError

      if (configData) {
        setConfigId(configData.id)
        setPercentualEntrada(configData.percentual_entrada_padrao)
      }

      // Fetch Faixas
      const { data: faixasData, error: faixasError } = await supabase
        .from('faixas_valores_parcelas')
        .select('*')
        .order('faixa_numero', { ascending: true })

      if (faixasError) throw faixasError

      setFaixas(faixasData || [])
    } catch (error: any) {
      toast({ title: 'Erro ao carregar dados', description: error.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleFaixaChange = (index: number, field: string, value: string) => {
    const newFaixas = [...faixas]
    newFaixas[index] = { ...newFaixas[index], [field]: value }
    setFaixas(newFaixas)
  }

  const handleRemoveFaixa = (index: number) => {
    const newFaixas = [...faixas]
    newFaixas.splice(index, 1)
    setFaixas(newFaixas)
  }

  const handleAddFaixa = () => {
    setFaixas([
      ...faixas,
      { id: `new-${Date.now()}`, valor_minimo: 0, valor_maximo: 0, max_parcelas: 1 },
    ])
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      // Save Config
      if (configId) {
        const { error } = await supabase
          .from('configuracoes_negociacao')
          .update({
            percentual_entrada_padrao: Number(percentualEntrada),
            atualizado_em: new Date().toISOString(),
          })
          .eq('id', configId)
        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('configuracoes_negociacao')
          .insert({ percentual_entrada_padrao: Number(percentualEntrada) })
          .select()
          .single()
        if (error) throw error
        if (data) setConfigId(data.id)
      }

      // Save Faixas
      const { data: existingFaixas } = await supabase.from('faixas_valores_parcelas').select('id')
      const existingIds = existingFaixas?.map((f) => f.id) || []
      const activeIds = faixas.filter((f) => !f.id.startsWith('new-')).map((f) => f.id)
      const toDelete = existingIds.filter((id) => !activeIds.includes(id))

      if (toDelete.length > 0) {
        const { error } = await supabase.from('faixas_valores_parcelas').delete().in('id', toDelete)
        if (error) throw error
      }

      for (let i = 0; i < faixas.length; i++) {
        const item = faixas[i]
        const payload = {
          faixa_numero: i + 1,
          valor_minimo: Number(item.valor_minimo),
          valor_maximo: Number(item.valor_maximo),
          max_parcelas: Number(item.max_parcelas),
        }

        if (item.id.startsWith('new-')) {
          const { error } = await supabase.from('faixas_valores_parcelas').insert(payload)
          if (error) throw error
        } else {
          const { error } = await supabase
            .from('faixas_valores_parcelas')
            .update(payload)
            .eq('id', item.id)
          if (error) throw error
        }
      }

      toast({ title: 'Sucesso', description: 'Configurações salvas com sucesso!' })
      loadData()
    } catch (error: any) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
    } finally {
      setSaving(false)
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
    <div className="flex flex-col gap-6 p-6 max-w-4xl w-full mx-auto animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Entrada Padrão e Faixas de Valores
        </h1>
        <p className="text-slate-500 mt-2">
          Configure a entrada padrão e os limites de valores e parcelas para negociação.
        </p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
          <CardTitle className="text-lg text-slate-800">ENTRADA PADRÃO</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="max-w-xs space-y-2">
            <label className="text-sm font-bold text-slate-700">PERCENTUAL DE ENTRADA (%)</label>
            <div className="relative">
              <Input
                type="number"
                value={percentualEntrada}
                onChange={(e) => setPercentualEntrada(e.target.value)}
                className="bg-white font-medium"
                step="0.01"
                min="0"
                max="100"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                %
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
          <CardTitle className="text-lg text-slate-800">
            FAIXAS DE VALORES E MÁXIMO DE PARCELAS
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold text-slate-700">VALOR MÍNIMO (R$)</TableHead>
                <TableHead className="font-semibold text-slate-700">VALOR MÁXIMO (R$)</TableHead>
                <TableHead className="font-semibold text-center text-slate-700 w-40">
                  MÁX. PARCELAS
                </TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {faixas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-slate-500 font-medium">
                    Nenhuma faixa de valor cadastrada.
                  </TableCell>
                </TableRow>
              )}
              {faixas.map((item, idx) => (
                <TableRow key={item.id} className="hover:bg-slate-50/50">
                  <TableCell>
                    <Input
                      type="number"
                      value={item.valor_minimo}
                      onChange={(e) => handleFaixaChange(idx, 'valor_minimo', e.target.value)}
                      className="bg-white"
                      min="0"
                      step="0.01"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.valor_maximo}
                      onChange={(e) => handleFaixaChange(idx, 'valor_maximo', e.target.value)}
                      className="bg-white"
                      min="0"
                      step="0.01"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.max_parcelas}
                      onChange={(e) => handleFaixaChange(idx, 'max_parcelas', e.target.value)}
                      className="bg-white text-center"
                      min="1"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleRemoveFaixa(idx)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddFaixa}
              className="text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              NOVA FAIXA
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end mt-2">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 h-12"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Save className="w-5 h-5 mr-2" />
          )}
          SALVAR
        </Button>
      </div>
    </div>
  )
}

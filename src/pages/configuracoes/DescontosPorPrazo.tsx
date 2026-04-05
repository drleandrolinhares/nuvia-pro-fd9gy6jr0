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

export default function DescontosPorPrazo() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [descontos, setDescontos] = useState<any[]>([])
  const { toast } = useToast()

  const loadData = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('descontos_por_prazo')
        .select('*')
        .order('faixa_numero', { ascending: true })

      if (error) throw error

      if (!data || data.length === 0) {
        const defaultData = Array.from({ length: 6 }).map((_, i) => ({
          id: `new-${i}`,
          faixa_numero: i,
          percentual_desconto: 0,
          descricao: `Faixa ${i}`,
        }))
        setDescontos(defaultData)
      } else {
        setDescontos(data)
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

  const handleChange = (index: number, field: string, value: any) => {
    const newDescontos = [...descontos]
    newDescontos[index][field] = value
    setDescontos(newDescontos)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      for (const item of descontos) {
        if (item.id.startsWith('new-')) {
          const { error } = await supabase.from('descontos_por_prazo').insert({
            faixa_numero: item.faixa_numero,
            percentual_desconto: Number(item.percentual_desconto),
            descricao: item.descricao,
          })
          if (error) throw error
        } else {
          const { error } = await supabase
            .from('descontos_por_prazo')
            .update({
              faixa_numero: item.faixa_numero,
              percentual_desconto: Number(item.percentual_desconto),
              descricao: item.descricao,
            })
            .eq('id', item.id)
          if (error) throw error
        }
      }
      toast({ title: 'Sucesso', description: 'Descontos salvos com sucesso!' })
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
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Descontos por Prazo</h1>
        <p className="text-slate-500 mt-2">
          Configure os percentuais de desconto aplicados para cada faixa de parcelamento.
        </p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg text-slate-800">Tabela de Descontos</CardTitle>
              <CardDescription>Gerencie os descontos da Faixa 0 até a Faixa 5</CardDescription>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-amber-500 hover:bg-amber-600 text-white font-medium"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar Alterações
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-24 text-center font-semibold">Faixa</TableHead>
                <TableHead className="font-semibold">Descrição</TableHead>
                <TableHead className="w-48 text-right font-semibold">Desconto (%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {descontos.map((item, idx) => (
                <TableRow key={item.id} className="hover:bg-slate-50/50">
                  <TableCell className="text-center font-medium text-slate-700">
                    {item.faixa_numero}
                  </TableCell>
                  <TableCell>
                    <Input
                      value={item.descricao || ''}
                      onChange={(e) => handleChange(idx, 'descricao', e.target.value)}
                      className="bg-white"
                      placeholder={`Descrição da faixa ${item.faixa_numero}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="relative">
                      <Input
                        type="number"
                        value={item.percentual_desconto || 0}
                        onChange={(e) => handleChange(idx, 'percentual_desconto', e.target.value)}
                        className="bg-white text-right pr-8 font-medium"
                        step="0.01"
                        min="0"
                        max="100"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                        %
                      </span>
                    </div>
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

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Save } from 'lucide-react'

const DEFAULT_DESCONTOS = [
  {
    faixa_numero: 0,
    titulo: 'À VISTA',
    percentual_desconto: 15,
    descricao: 'Pagamento Único',
  },
  {
    faixa_numero: 1,
    titulo: 'FAIXA 1',
    percentual_desconto: 5,
    descricao: '2X a 5X',
  },
  {
    faixa_numero: 2,
    titulo: 'FAIXA 2',
    percentual_desconto: 3,
    descricao: '6X a 10X',
  },
  {
    faixa_numero: 3,
    titulo: 'FAIXA 3',
    percentual_desconto: 0,
    descricao: '11X a 20X',
  },
  {
    faixa_numero: 4,
    titulo: 'FAIXA 4',
    percentual_desconto: 0,
    descricao: '21X a 30X',
  },
  {
    faixa_numero: 5,
    titulo: 'FAIXA 5',
    percentual_desconto: 0,
    descricao: '31X+',
  },
]

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
        .in('faixa_numero', [0, 1, 2, 3, 4, 5])
        .order('faixa_numero', { ascending: true })

      if (error) throw error

      const mergedData = DEFAULT_DESCONTOS.map((def) => {
        const found = data?.find((d) => d.faixa_numero === def.faixa_numero)
        if (found) {
          return {
            ...def,
            id: found.id,
            percentual_desconto: found.percentual_desconto,
            descricao: found.descricao || def.descricao,
          }
        }
        return { ...def, id: `new-${def.faixa_numero}` }
      })

      setDescontos(mergedData)
    } catch (error: any) {
      toast({ title: 'Erro ao carregar dados', description: error.message, variant: 'destructive' })
      setDescontos(DEFAULT_DESCONTOS.map((def) => ({ ...def, id: `new-${def.faixa_numero}` })))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleChange = (faixa_numero: number, value: string) => {
    setDescontos(
      descontos.map((d) =>
        d.faixa_numero === faixa_numero ? { ...d, percentual_desconto: Number(value) } : d,
      ),
    )
  }

  const handleDescricaoChange = (faixa_numero: number, value: string) => {
    setDescontos(
      descontos.map((d) => (d.faixa_numero === faixa_numero ? { ...d, descricao: value } : d)),
    )
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
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Descontos por Prazo</h1>
        <p className="text-slate-500 mt-2">
          Configure os percentuais de desconto aplicados para cada faixa de parcelamento.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">DESCONTOS POR PRAZO</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {descontos.map((item) => (
            <Card
              key={item.id}
              className="border-slate-200 shadow-sm bg-white overflow-hidden flex flex-col"
            >
              <CardHeader className="bg-slate-950 pb-4 shrink-0">
                <CardTitle className="text-sm font-bold text-white text-center tracking-wider">
                  {item.titulo}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 flex flex-col items-center flex-1">
                <div className="relative w-full max-w-[120px]">
                  <Input
                    type="number"
                    value={item.percentual_desconto}
                    onChange={(e) => handleChange(item.faixa_numero, e.target.value)}
                    className="text-center text-2xl font-bold h-14 pr-8 text-amber-500 border-slate-300"
                    step="0.1"
                    min="0"
                    max="100"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    %
                  </span>
                </div>
                <div className="mt-auto pt-4 w-full">
                  {item.faixa_numero === 0 ? (
                    <p className="text-sm font-semibold text-slate-600 text-center h-10 flex items-center justify-center">
                      {item.descricao}
                    </p>
                  ) : (
                    <Input
                      value={item.descricao}
                      onChange={(e) => handleDescricaoChange(item.faixa_numero, e.target.value)}
                      className="text-center text-sm font-semibold text-slate-700 h-10 border-slate-300 w-full"
                      placeholder="Ex: 2X a 5X"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <Button
          onClick={handleSave}
          disabled={saving}
          size="lg"
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              SALVANDO...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              SALVAR
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

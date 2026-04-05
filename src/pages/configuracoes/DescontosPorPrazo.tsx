import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Save, Percent, Tag } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Desconto {
  id?: string
  faixa_numero: number
  percentual_desconto: number
  descricao: string
}

export default function DescontosPorPrazo() {
  const { toast } = useToast()

  const [faixas, setFaixas] = useState<Desconto[]>([
    { faixa_numero: 1, percentual_desconto: 0, descricao: '' },
    { faixa_numero: 2, percentual_desconto: 0, descricao: '' },
    { faixa_numero: 3, percentual_desconto: 0, descricao: '' },
    { faixa_numero: 4, percentual_desconto: 0, descricao: '' },
  ])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('descontos_por_prazo')
      .select('*')
      .order('faixa_numero', { ascending: true })

    if (data && data.length > 0) {
      setFaixas((prev) =>
        prev.map((p) => {
          const found = data.find((d) => d.faixa_numero === p.faixa_numero)
          return found ? found : p
        }),
      )
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const updateFaixa = (numero: number, field: keyof Desconto, value: any) => {
    setFaixas((prev) => prev.map((f) => (f.faixa_numero === numero ? { ...f, [field]: value } : f)))
  }

  const handleSave = async (faixa: Desconto) => {
    if (faixa.id) {
      const { error } = await supabase
        .from('descontos_por_prazo')
        .update({
          percentual_desconto: faixa.percentual_desconto,
          descricao: faixa.descricao,
        })
        .eq('id', faixa.id)
      if (error) {
        toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
        return
      }
    } else {
      const { error } = await supabase.from('descontos_por_prazo').insert({
        faixa_numero: faixa.faixa_numero,
        percentual_desconto: faixa.percentual_desconto,
        descricao: faixa.descricao,
      })
      if (error) {
        toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
        return
      }
    }
    toast({ title: `Faixa ${faixa.faixa_numero} salva com sucesso` })
    loadData()
  }

  const getTitle = (numero: number) => {
    if (numero === 1) return 'À VISTA (FAIXA 1)'
    return `FAIXA ${numero}`
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
          <Tag className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">
            Descontos por Prazo
          </h1>
          <p className="text-slate-500">
            Configure as faixas de descontos baseadas no prazo de pagamento.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mr-3" />
          Carregando descontos...
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {faixas.map((faixa) => (
            <Card
              key={faixa.faixa_numero}
              className="relative overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-amber-500" />
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-bold text-slate-500 flex items-center gap-2">
                  <Percent className="w-4 h-4 text-amber-500" />
                  {getTitle(faixa.faixa_numero)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Desconto (%)
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      className="text-3xl font-bold h-16 pl-4 pr-10 text-slate-800 border-slate-300"
                      value={faixa.percentual_desconto}
                      onChange={(e) =>
                        updateFaixa(
                          faixa.faixa_numero,
                          'percentual_desconto',
                          Number(e.target.value),
                        )
                      }
                    />
                    <Percent className="w-6 h-6 text-slate-300 absolute right-4 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Descrição
                  </Label>
                  <Input
                    className="bg-slate-50 font-medium text-slate-600 h-10"
                    placeholder="Ex: À vista, Até 3x..."
                    value={faixa.descricao}
                    onChange={(e) => updateFaixa(faixa.faixa_numero, 'descricao', e.target.value)}
                  />
                </div>
                <Button
                  onClick={() => handleSave(faixa)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold h-11"
                >
                  <Save className="w-4 h-4 mr-2" /> Salvar Faixa
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

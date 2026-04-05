import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Shield, Save, Percent } from 'lucide-react'
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

  const loadData = async () => {
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

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Descontos por Prazo</h1>
          <p className="text-slate-500">
            Configure as faixas de descontos baseadas no prazo de pagamento.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {faixas.map((faixa) => (
          <Card key={faixa.faixa_numero}>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Percent className="w-5 h-5 text-amber-500" />
                Faixa {faixa.faixa_numero}
              </CardTitle>
              <CardDescription>
                Defina o desconto e a descrição comercial para esta faixa.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Percentual de Desconto (%)</Label>
                <Input
                  type="number"
                  value={faixa.percentual_desconto}
                  onChange={(e) =>
                    updateFaixa(faixa.faixa_numero, 'percentual_desconto', Number(e.target.value))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  placeholder="Ex: À vista, Até 3x..."
                  value={faixa.descricao}
                  onChange={(e) => updateFaixa(faixa.faixa_numero, 'descricao', e.target.value)}
                />
              </div>
              <Button
                onClick={() => handleSave(faixa)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white"
              >
                <Save className="w-4 h-4 mr-2" /> Salvar Faixa {faixa.faixa_numero}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

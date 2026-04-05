import { useState, useEffect } from 'react'
import { Handshake, Calculator, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface OpcaoParcelamento {
  parcelas: number
  percentual_desconto: number
  valor_parcela: number
  valor_total_com_desconto: number
}

interface ResultadoSimulacao {
  valor_entrada: number
  valor_restante: number
  opcoes_parcelamento: OpcaoParcelamento[]
}

export default function Negociacao() {
  const [valorTratamentoStr, setValorTratamentoStr] = useState('')
  const [percentualEntrada, setPercentualEntrada] = useState('30')
  const [loading, setLoading] = useState(false)
  const [loadingConfig, setLoadingConfig] = useState(true)
  const [resultado, setResultado] = useState<ResultadoSimulacao | null>(null)

  useEffect(() => {
    const fetchConfig = async () => {
      setLoadingConfig(true)
      const { data } = await supabase
        .from('configuracoes_negociacao')
        .select('percentual_entrada_padrao')
        .limit(1)
        .maybeSingle()

      if (data) {
        setPercentualEntrada(data.percentual_entrada_padrao.toString())
      }
      setLoadingConfig(false)
    }
    fetchConfig()
  }, [])

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value) {
      value = (parseInt(value) / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })
    }
    setValorTratamentoStr(value)
  }

  const handleSimular = async () => {
    if (!valorTratamentoStr) return
    const valorNumerico = parseFloat(
      valorTratamentoStr.replace('R$', '').replace(/\./g, '').replace(',', '.'),
    )
    if (isNaN(valorNumerico) || valorNumerico <= 0) return

    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('calcular-opcoes-pagamento', {
        body: {
          valor_tratamento: valorNumerico,
          percentual_entrada_padrao: parseFloat(percentualEntrada) || 0,
        },
      })
      if (error) throw error
      setResultado(data)
    } catch (err) {
      console.error('Erro ao simular:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (val: number) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-sm">
          <Handshake className="h-6 w-6 text-slate-700" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-800">
          Simulador de Negociação
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 items-start">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="pb-6 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-700 tracking-wider">
              DADOS DA NEGOCIAÇÃO
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-3">
              <Label
                htmlFor="valor"
                className="text-xs font-bold text-slate-500 tracking-wider uppercase"
              >
                Valor do Tratamento
              </Label>
              <Input
                id="valor"
                placeholder="R$ 0,00"
                value={valorTratamentoStr}
                onChange={handleValorChange}
                className="text-lg h-12 bg-slate-50 border-slate-200 font-medium focus-visible:bg-white"
              />
            </div>
            <div className="space-y-3">
              <Label
                htmlFor="entrada"
                className="text-xs font-bold text-slate-500 tracking-wider uppercase"
              >
                Percentual de Entrada (%)
              </Label>
              <Input
                id="entrada"
                type="number"
                min="0"
                max="100"
                value={percentualEntrada}
                onChange={(e) => setPercentualEntrada(e.target.value)}
                disabled={loadingConfig}
                className="text-lg h-12 bg-slate-50 border-slate-200 font-medium focus-visible:bg-white disabled:opacity-50"
              />
            </div>
            <Button
              className="w-full h-12 text-base font-bold bg-slate-900 hover:bg-slate-800 transition-colors"
              onClick={handleSimular}
              disabled={loading || !valorTratamentoStr}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Calculator className="w-5 h-5 mr-2" />
              )}
              {loading ? 'Calculando...' : 'Calcular Opções'}
            </Button>
          </CardContent>
        </Card>

        <Card
          className={cn(
            'bg-white border-slate-200 shadow-sm flex flex-col min-h-[420px] transition-all',
            !resultado && 'bg-slate-50/80 border-dashed border-2 items-center justify-center p-8',
          )}
        >
          {!resultado ? (
            <div className="flex flex-col items-center justify-center space-y-6 opacity-60 text-center">
              <div className="p-5 bg-white rounded-full border border-slate-200 shadow-sm">
                <Calculator className="h-10 w-10 text-slate-400" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-bold tracking-[0.2em] text-slate-500 max-w-[220px] leading-relaxed">
                INFORME O VALOR DO TRATAMENTO PARA SIMULAR
              </p>
            </div>
          ) : (
            <>
              <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-bold text-slate-700 tracking-wider">
                  OPÇÕES DE PAGAMENTO
                </CardTitle>
                <div className="text-sm text-slate-500 font-medium">
                  Entrada:{' '}
                  <span className="text-slate-800 font-bold">
                    {formatCurrency(resultado.valor_entrada)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1">
                <ScrollArea className="h-[350px]">
                  <div className="p-6 space-y-4">
                    {resultado.opcoes_parcelamento.map((op) => (
                      <div
                        key={op.parcelas}
                        className="flex items-center justify-between p-4 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-800 text-lg">{op.parcelas}x</span>
                            <span className="text-sm font-medium text-slate-500">de</span>
                            <span className="font-bold text-blue-600 text-lg">
                              {formatCurrency(op.valor_parcela)}
                            </span>
                          </div>
                          {op.percentual_desconto > 0 && (
                            <div className="flex items-center space-x-2 text-xs font-medium mt-1">
                              <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                {op.percentual_desconto}% OFF
                              </span>
                              <span className="text-slate-400 line-through">
                                {formatCurrency(resultado.valor_restante / op.parcelas)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Total
                          </div>
                          <div className="text-sm font-bold text-slate-700">
                            {formatCurrency(op.valor_total_com_desconto)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}

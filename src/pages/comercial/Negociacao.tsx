import { useState, useEffect } from 'react'
import { Calculator, Percent, CreditCard, AlertCircle, Handshake, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { supabase } from '@/lib/supabase/client'

export default function Negociacao() {
  const [valor, setValor] = useState('')
  const [numericValor, setNumericValor] = useState(0)
  const [entrada, setEntrada] = useState('')
  const [loadingConfig, setLoadingConfig] = useState(true)
  const [calculando, setCalculando] = useState(false)
  const [resultado, setResultado] = useState<any>(null)
  const [descontos, setDescontos] = useState<any[]>([])

  useEffect(() => {
    const fetchConfig = async () => {
      const { data } = await supabase
        .from('configuracoes_negociacao')
        .select('percentual_entrada_padrao')
        .single()
      if (data) {
        setEntrada(data.percentual_entrada_padrao.toString())
      }

      const { data: desc } = await supabase
        .from('descontos_por_prazo')
        .select('*')
        .order('faixa_numero')
      if (desc) {
        setDescontos(desc)
      }
      setLoadingConfig(false)
    }
    fetchConfig()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (numericValor > 0 && !loadingConfig) {
        calcularOpcoes()
      } else {
        setResultado(null)
      }
    }, 250)
    return () => clearTimeout(timer)
  }, [numericValor, entrada, loadingConfig])

  const calcularOpcoes = async () => {
    setCalculando(true)
    try {
      const { data, error } = await supabase.functions.invoke('calcular-opcoes-pagamento', {
        body: {
          valor_tratamento: numericValor,
          percentual_entrada_padrao: Number(entrada) || 0,
        },
      })
      if (!error && data) {
        setResultado(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setCalculando(false)
    }
  }

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '')
    if (val) {
      const num = parseInt(val) / 100
      setNumericValor(num)
      val = num.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })
    } else {
      setNumericValor(0)
    }
    setValor(val)
  }

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const getNomeFaixa = (num: number, desc?: string | null) => {
    if (num === 0) return 'À VISTA'
    if (desc) return `FAIXA ${num} (${desc})`
    if (num === 1) return 'FAIXA 1 (2X-5X)'
    if (num === 2) return 'FAIXA 2 (6X-10X)'
    if (num === 3) return 'FAIXA 3 (11X-20X)'
    if (num === 4) return 'FAIXA 4 (21X-30X)'
    if (num === 5) return 'FAIXA 5 (31X+)'
    return `FAIXA ${num}`
  }

  const faixasAplicadas = new Set(
    resultado?.opcoes_parcelamento.map((op: any) => op.faixa_aplicada) || [],
  )
  const faixasExibir = resultado
    ? descontos.filter((d) => faixasAplicadas.has(d.faixa_numero))
    : descontos

  const gridColsClass =
    {
      1: 'md:grid-cols-1',
      2: 'md:grid-cols-2',
      3: 'md:grid-cols-3',
      4: 'md:grid-cols-4',
      5: 'md:grid-cols-5',
      6: 'md:grid-cols-6',
    }[Math.max(1, Math.min(6, faixasExibir.length))] || 'md:grid-cols-4'

  return (
    <div className="flex-1 p-4 md:p-8 space-y-8 bg-slate-50 min-h-full overscroll-none">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-3 bg-slate-900 rounded-lg shadow-sm">
          <Handshake className="h-6 w-6 text-amber-400" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Simulador de Negociação
          </h2>
          <p className="text-slate-500 font-medium mt-1">
            Simule parcelamentos e aplique descontos baseados na política da clínica.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* PAINEL ESQUERDO */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="overflow-hidden border-0 shadow-lg ring-1 ring-slate-200/50">
            <CardHeader className="bg-slate-900 px-6 py-5">
              <CardTitle className="text-white flex items-center space-x-3 text-lg">
                <Calculator className="w-5 h-5 text-amber-400" />
                <span>DADOS DA NEGOCIAÇÃO</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6 bg-white">
              <div className="space-y-3">
                <Label className="text-slate-700 font-bold text-xs uppercase tracking-wider">
                  Valor do Tratamento
                </Label>
                <Input
                  value={valor}
                  onChange={handleValorChange}
                  placeholder="R$ 0,00"
                  className="text-xl h-14 font-medium border-slate-200 focus-visible:ring-amber-400 focus-visible:border-amber-400"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-slate-700 font-bold text-xs uppercase tracking-wider">
                  Entrada Boleto (%)
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={entrada}
                    onChange={(e) => setEntrada(e.target.value)}
                    min="0"
                    max="100"
                    className="text-xl h-14 font-medium border-slate-200 focus-visible:ring-amber-400 focus-visible:border-amber-400 pl-12"
                  />
                  <Percent className="w-5 h-5 absolute left-4 top-4.5 text-slate-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-0 shadow-lg bg-amber-400 ring-1 ring-amber-500/50">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-slate-900 rounded-xl shadow-sm shrink-0">
                  <AlertCircle className="w-6 h-6 text-amber-400" />
                </div>
                <div className="pt-0.5">
                  <h3 className="text-slate-900 font-black text-lg mb-1.5 uppercase tracking-wide">
                    Regra Aplicada
                  </h3>
                  <p className="text-slate-800 font-medium leading-relaxed">
                    {resultado ? (
                      <>
                        Com base no valor informado, o parcelamento máximo permitido é de{' '}
                        <span className="font-black text-xl bg-slate-900 text-amber-400 px-2 py-0.5 rounded-md mx-1">
                          {resultado.max_parcelas}x
                        </span>
                        .
                      </>
                    ) : (
                      'Informe o valor do tratamento para visualizar o limite de parcelas.'
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* PAINEL DIREITO */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="overflow-hidden border-0 shadow-lg ring-1 ring-slate-200/50">
            <CardHeader className="bg-slate-900 px-6 py-5">
              <CardTitle className="text-white flex items-center space-x-3 text-lg">
                <Percent className="w-5 h-5 text-amber-400" />
                <span>DESCONTOS POR FAIXA</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 bg-white min-h-[104px]">
              <div
                className={`grid grid-cols-2 ${gridColsClass} divide-x divide-y md:divide-y-0 divide-slate-100 h-full`}
              >
                {faixasExibir.map((faixa, i) => (
                  <div
                    key={i}
                    className="p-5 text-center space-y-2 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest h-8 flex items-center justify-center">
                      {getNomeFaixa(faixa.faixa_numero, faixa.descricao)}
                    </div>
                    <div className="text-3xl font-black text-slate-900">
                      {faixa.percentual_desconto}%
                    </div>
                  </div>
                ))}
                {faixasExibir.length === 0 && !loadingConfig && (
                  <div className="p-5 text-center col-span-full text-slate-500 flex items-center justify-center min-h-[104px]">
                    {numericValor > 0
                      ? 'Nenhum desconto aplicável para este valor.'
                      : 'Informe o valor para ver as faixas.'}
                  </div>
                )}
                {loadingConfig && (
                  <div className="p-5 text-center col-span-full text-slate-500 flex items-center justify-center space-x-2 min-h-[104px]">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Carregando...</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-0 shadow-lg ring-1 ring-slate-200/50">
            <CardHeader className="bg-slate-900 px-6 py-5 border-b border-slate-800">
              <CardTitle className="text-white flex items-center justify-between text-lg w-full">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-amber-400" />
                  <span>RESULTADOS SIMULADOS</span>
                </div>
                {calculando && resultado && (
                  <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 bg-white min-h-[400px] relative">
              <div
                className={cn(
                  'transition-opacity duration-200',
                  calculando && resultado ? 'opacity-50 pointer-events-none' : 'opacity-100',
                )}
              >
                <Table>
                  <TableHeader className="bg-slate-50/80">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-bold text-slate-600 text-xs uppercase tracking-wider py-4 pl-6">
                        Forma
                      </TableHead>
                      <TableHead className="font-bold text-slate-600 text-xs uppercase tracking-wider py-4 text-center">
                        Parcelas
                      </TableHead>
                      <TableHead className="font-bold text-slate-600 text-xs uppercase tracking-wider py-4 text-right">
                        Valor Parcela
                      </TableHead>
                      <TableHead className="font-bold text-slate-600 text-xs uppercase tracking-wider py-4 text-right pr-6">
                        Desconto
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!resultado && !calculando && (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center py-16 text-slate-500 font-medium"
                        >
                          Preencha o valor do tratamento para calcular as opções.
                        </TableCell>
                      </TableRow>
                    )}
                    {calculando && !resultado && (
                      <>
                        {[1, 2, 3].map((i) => (
                          <TableRow key={i} className="hover:bg-transparent">
                            <TableCell className="pl-6 py-4">
                              <Skeleton className="h-6 w-24" />
                            </TableCell>
                            <TableCell className="text-center py-4">
                              <Skeleton className="h-6 w-12 mx-auto" />
                            </TableCell>
                            <TableCell className="text-right py-4">
                              <Skeleton className="h-6 w-24 ml-auto" />
                            </TableCell>
                            <TableCell className="text-right pr-6 py-4">
                              <Skeleton className="h-8 w-16 ml-auto" />
                            </TableCell>
                          </TableRow>
                        ))}
                      </>
                    )}
                    {resultado && (
                      <>
                        {/* À VISTA */}
                        {resultado.opcoes_parcelamento
                          .filter((op: any) => op.parcelas === 1)
                          .map((op: any) => (
                            <TableRow
                              key="a-vista"
                              className="bg-blue-900 hover:bg-blue-800 transition-colors border-b-0"
                            >
                              <TableCell className="font-semibold text-white pl-6 py-4">
                                À VISTA
                              </TableCell>
                              <TableCell className="text-center py-4">
                                <Badge
                                  variant="outline"
                                  className="bg-blue-800 text-white font-bold border-blue-700 shadow-sm px-3 py-1"
                                >
                                  1x
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right py-4 font-medium text-white">
                                {formatCurrency(op.valor_parcela)}
                              </TableCell>
                              <TableCell className="text-right pr-6 py-4">
                                <span className="font-black px-2.5 py-1 rounded-md text-blue-100 bg-blue-800/50 border border-blue-700/50">
                                  {op.percentual_desconto}%
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}

                        {/* ENTRADA */}
                        <TableRow className="bg-slate-200 hover:bg-slate-300/80 transition-colors border-b-slate-300">
                          <TableCell className="font-semibold text-slate-800 pl-6 py-4">
                            ENTRADA
                          </TableCell>
                          <TableCell className="text-center py-4">
                            <Badge
                              variant="outline"
                              className="bg-slate-100 text-slate-700 font-bold border-slate-300 shadow-sm px-3 py-1"
                            >
                              À vista
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right py-4 font-medium text-slate-800">
                            {formatCurrency(resultado.valor_entrada)}
                          </TableCell>
                          <TableCell className="text-right pr-6 py-4">
                            <span className="font-black px-2.5 py-1 rounded-md text-slate-500 bg-slate-100 border border-slate-300/50">
                              0%
                            </span>
                          </TableCell>
                        </TableRow>

                        {/* PARCELAMENTO */}
                        {resultado.opcoes_parcelamento
                          .filter((op: any) => op.parcelas > 1)
                          .map((op: any) => {
                            let rowClass = 'hover:bg-slate-50/50 transition-colors '
                            let badgeClass =
                              'bg-white text-slate-700 font-bold border-slate-200 shadow-sm px-3 py-1'
                            let textClass = 'text-slate-900'
                            let discountClass =
                              op.percentual_desconto === 0
                                ? 'text-slate-500 bg-slate-100'
                                : 'text-slate-700 bg-slate-100 border border-slate-200'

                            if (op.faixa_aplicada === 1) {
                              // 2X-5X VERDE
                              rowClass += 'bg-emerald-50/50'
                              badgeClass =
                                'bg-emerald-100 text-emerald-800 border-emerald-200 shadow-sm px-3 py-1'
                              textClass = 'text-emerald-900'
                              discountClass =
                                'text-emerald-700 bg-emerald-100/50 border border-emerald-200/50'
                            } else if (op.faixa_aplicada === 2) {
                              // 6X-10X LARANJA
                              rowClass += 'bg-orange-50/50'
                              badgeClass =
                                'bg-orange-100 text-orange-800 border-orange-200 shadow-sm px-3 py-1'
                              textClass = 'text-orange-900'
                              discountClass =
                                'text-orange-700 bg-orange-100/50 border border-orange-200/50'
                            } else if (op.faixa_aplicada === 3) {
                              // 11X-20X VERMELHA
                              rowClass += 'bg-red-50/50'
                              badgeClass =
                                'bg-red-100 text-red-800 border-red-200 shadow-sm px-3 py-1'
                              textClass = 'text-red-900'
                              discountClass = 'text-red-700 bg-red-100/50 border border-red-200/50'
                            } else if (op.faixa_aplicada === 4) {
                              // 21X-30X ROXA
                              rowClass += 'bg-purple-50/50'
                              badgeClass =
                                'bg-purple-100 text-purple-800 border-purple-200 shadow-sm px-3 py-1'
                              textClass = 'text-purple-900'
                              discountClass =
                                'text-purple-700 bg-purple-100/50 border border-purple-200/50'
                            } else if (op.faixa_aplicada === 5) {
                              // 31X+ CINZA
                              rowClass += 'bg-slate-100/50'
                              badgeClass =
                                'bg-slate-200 text-slate-800 border-slate-300 shadow-sm px-3 py-1'
                              textClass = 'text-slate-900'
                              discountClass =
                                'text-slate-700 bg-slate-200/50 border border-slate-300/50'
                            }

                            return (
                              <TableRow key={op.parcelas} className={rowClass}>
                                <TableCell className={`font-semibold pl-6 py-4 ${textClass}`}>
                                  PARCELAMENTO
                                </TableCell>
                                <TableCell className="text-center py-4">
                                  <Badge variant="outline" className={badgeClass}>
                                    {op.parcelas}x
                                  </Badge>
                                </TableCell>
                                <TableCell className={`text-right py-4 font-medium ${textClass}`}>
                                  {formatCurrency(op.valor_parcela)}
                                  <div className="text-[10px] opacity-70 mt-1">
                                    Total parc.: {formatCurrency(op.valor_parcela * op.parcelas)}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right pr-6 py-4">
                                  <span
                                    className={`font-black px-2.5 py-1 rounded-md ${discountClass}`}
                                  >
                                    {op.percentual_desconto}%
                                  </span>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                      </>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

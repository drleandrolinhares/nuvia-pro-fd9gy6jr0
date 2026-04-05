import { useState } from 'react'
import { Calculator, Percent, CreditCard, AlertCircle, Handshake } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function Negociacao() {
  const [valor, setValor] = useState('')
  const [entrada, setEntrada] = useState('30')

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '')
    if (val) {
      val = (parseInt(val) / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })
    }
    setValor(val)
  }

  // Mock data as requested
  const faixasDesconto = [
    { nome: 'À VISTA', desconto: '15%' },
    { nome: 'FAIXA 2 (2X-5X)', desconto: '5%' },
    { nome: 'FAIXA 3 (6X-10X)', desconto: '3%' },
    { nome: 'FAIXA 4 (11X-20X)', desconto: '0%' },
  ]

  const resultadosMock = [
    { forma: 'Pix / Dinheiro', parcela: '1x (À vista)', desconto: '15%' },
    { forma: 'Cartão de Crédito', parcela: '1x (À vista)', desconto: '15%' },
    { forma: 'Boleto / Cartão', parcela: '2x a 5x', desconto: '5%' },
    { forma: 'Boleto', parcela: '6x a 10x', desconto: '3%' },
    { forma: 'Boleto', parcela: '11x a 20x', desconto: '0%' },
  ]

  return (
    <div className="flex-1 p-4 md:p-8 space-y-8 bg-slate-50 min-h-full">
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
                    Com base no valor informado, o parcelamento máximo permitido é de{' '}
                    <span className="font-black text-xl bg-slate-900 text-amber-400 px-2 py-0.5 rounded-md mx-1">
                      20x
                    </span>
                    .
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
            <CardContent className="p-0 bg-white">
              <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-100">
                {faixasDesconto.map((faixa, i) => (
                  <div
                    key={i}
                    className="p-5 text-center space-y-2 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest h-8 flex items-center justify-center">
                      {faixa.nome}
                    </div>
                    <div className="text-3xl font-black text-slate-900">{faixa.desconto}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-0 shadow-lg ring-1 ring-slate-200/50">
            <CardHeader className="bg-slate-900 px-6 py-5 border-b border-slate-800">
              <CardTitle className="text-white flex items-center space-x-3 text-lg">
                <CreditCard className="w-5 h-5 text-amber-400" />
                <span>RESULTADOS SIMULADOS</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 bg-white">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-bold text-slate-600 text-xs uppercase tracking-wider py-4 pl-6">
                      Forma
                    </TableHead>
                    <TableHead className="font-bold text-slate-600 text-xs uppercase tracking-wider py-4 text-center">
                      Parcela
                    </TableHead>
                    <TableHead className="font-bold text-slate-600 text-xs uppercase tracking-wider py-4 text-right pr-6">
                      Desconto
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resultadosMock.map((res, i) => (
                    <TableRow key={i} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-semibold text-slate-900 pl-6 py-4">
                        {res.forma}
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <Badge
                          variant="outline"
                          className="bg-white text-slate-700 font-bold border-slate-200 shadow-sm px-3 py-1"
                        >
                          {res.parcela}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6 py-4">
                        <span
                          className={`font-black px-2.5 py-1 rounded-md ${
                            res.desconto === '0%'
                              ? 'text-slate-500 bg-slate-100'
                              : 'text-amber-700 bg-amber-100/50 border border-amber-200/50'
                          }`}
                        >
                          {res.desconto}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

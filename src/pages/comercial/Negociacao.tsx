import { useState } from 'react'
import { Handshake, Calculator } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function Negociacao() {
  const [valorTratamento, setValorTratamento] = useState('')
  const [entradaBoleto, setEntradaBoleto] = useState('0')

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value) {
      value = (parseInt(value) / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })
    }
    setValorTratamento(value)
  }

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
        {/* Left Card */}
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
                value={valorTratamento}
                onChange={handleValorChange}
                className="text-lg h-12 bg-slate-50 border-slate-200 font-medium transition-colors focus-visible:bg-white"
              />
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="entrada"
                className="text-xs font-bold text-slate-500 tracking-wider uppercase"
              >
                Entrada Boleto (%)
              </Label>
              <Input
                id="entrada"
                type="number"
                min="0"
                max="100"
                value={entradaBoleto}
                onChange={(e) => setEntradaBoleto(e.target.value)}
                className="text-lg h-12 bg-slate-50 border-slate-200 font-medium transition-colors focus-visible:bg-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Right Card */}
        <Card className="bg-slate-50/80 border-slate-200 border-dashed border-2 shadow-sm flex flex-col items-center justify-center min-h-[380px] text-center p-8 transition-all duration-300 hover:bg-slate-50">
          <div className="flex flex-col items-center justify-center space-y-6 opacity-60">
            <div className="p-5 bg-white rounded-full border border-slate-200 shadow-sm">
              <Calculator className="h-10 w-10 text-slate-400" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-bold tracking-[0.2em] text-slate-500 max-w-[220px] leading-relaxed">
              INFORME O VALOR DO TRATAMENTO
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

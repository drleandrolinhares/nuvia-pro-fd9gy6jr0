import { format, parseISO } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DespesaModal } from './DespesaModal'
import { Despesa } from './OndasLiquidez'

interface CycleCardProps {
  c: number
  info: any
  receitaVal: number
  receitaInput: string
  setReceitaInput: (val: string) => void
  handleSaveReceita: () => void
  cycleDespesas: Despesa[]
  handleDeleteDespesa: (id: string) => void
  fetchData: () => void
}

export function CycleCard({
  c,
  info,
  receitaVal,
  receitaInput,
  setReceitaInput,
  handleSaveReceita,
  cycleDespesas,
  handleDeleteDespesa,
  fetchData,
}: CycleCardProps) {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  const totalDesp = cycleDespesas.reduce((acc, d) => acc + Number(d.valor_estimado), 0)
  const saldo = receitaVal - totalDesp
  const capacity = totalDesp > 0 ? (receitaVal / totalDesp) * 100 : receitaVal > 0 ? 200 : 0

  let statusColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  let progressColor = 'bg-emerald-500'
  let statusText = 'Saudável'

  if (receitaVal < totalDesp) {
    statusColor = 'bg-rose-500/20 text-rose-400 border-rose-500/30'
    progressColor = 'bg-rose-500'
    statusText = 'Crítico'
  } else if (receitaVal < totalDesp * 1.1) {
    statusColor = 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    progressColor = 'bg-amber-500'
    statusText = 'Ajustado'
  }

  return (
    <Card className="border-slate-700 bg-[#0B1320] flex flex-col overflow-hidden shadow-lg shadow-black/40">
      <CardHeader className="pb-4 border-b border-slate-800 bg-[#0F1A2A] relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#C5A059]"></div>
        <div className="flex justify-between items-start mb-3">
          <Badge
            variant="outline"
            className="bg-[#001529] border-[#C5A059]/30 text-[#C5A059] font-bold"
          >
            Ciclo {c}
          </Badge>
          <Badge variant="outline" className={statusColor}>
            {statusText}
          </Badge>
        </div>
        <CardTitle className="text-lg text-slate-100">Boletos: Dia {info.boleto}</CardTitle>
        <CardDescription className="text-slate-300 mt-1">
          Disponível ~Dia {info.disp} <br /> Cobre despesas de {info.start} a {info.end}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-5 flex-1 flex flex-col gap-6 bg-[#0B1320]">
        <div className="space-y-2">
          <Label className="text-xs text-slate-300 font-semibold tracking-wider uppercase">
            Receita Estimada
          </Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C5A059] font-medium text-sm">
                R$
              </span>
              <Input
                type="number"
                value={receitaInput || ''}
                onChange={(e) => setReceitaInput(e.target.value)}
                className="bg-[#050A13] border-slate-700 text-slate-100 font-bold pl-9 focus-visible:ring-[#C5A059]/50"
                placeholder="0.00"
              />
            </div>
            <Button
              className="bg-[#C5A059] hover:bg-[#b08d4d] text-[#001529] font-bold shadow-sm"
              onClick={handleSaveReceita}
            >
              Salvar
            </Button>
          </div>
        </div>

        <div className="bg-[#050A13] rounded-lg p-3 border border-slate-800 space-y-3 shadow-inner">
          <div className="flex justify-between text-sm items-center">
            <span className="text-slate-300 font-medium">Total Despesas</span>
            <span className="font-bold text-rose-400">{formatCurrency(totalDesp)}</span>
          </div>
          <div className="flex justify-between text-sm items-center border-t border-slate-800 pt-2">
            <span className="text-slate-300 font-medium">Saldo Projetado</span>
            <span
              className={cn(
                'font-bold text-base',
                saldo >= 0 ? 'text-emerald-400' : 'text-rose-500',
              )}
            >
              {formatCurrency(saldo)}
            </span>
          </div>
          <div className="w-full bg-[#0F1A2A] rounded-full h-2 overflow-hidden mt-1">
            <div
              className={cn('h-full transition-all duration-500', progressColor)}
              style={{ width: `${Math.min(capacity, 100)}%` }}
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-3 mt-2">
            <Label className="text-xs text-slate-300 font-bold tracking-wider uppercase">
              Contas a Pagar
            </Label>
            <DespesaModal onSuccess={fetchData} />
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto pr-1 max-h-[250px] scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {cycleDespesas.length === 0 ? (
              <div className="text-center py-6 text-sm text-slate-500 border border-dashed border-slate-700 rounded-lg bg-[#050A13]">
                Nenhuma despesa neste ciclo.
              </div>
            ) : (
              cycleDespesas.map((d) => (
                <div
                  key={d.id}
                  className="flex flex-col bg-[#050A13] p-3.5 rounded-lg border border-slate-800/80 group hover:border-[#C5A059]/50 transition-colors shadow-sm relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-700 group-hover:bg-[#C5A059] transition-colors"></div>
                  <div className="flex justify-between items-start pl-2">
                    <div className="flex flex-col">
                      <span
                        className="text-sm font-bold text-slate-200 truncate max-w-[130px]"
                        title={d.descricao || ''}
                      >
                        {d.descricao}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1 font-medium">
                        {format(parseISO(d.data_vencimento), 'dd/MM/yyyy')} • {d.categoria}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-sm font-bold text-slate-100">
                        {formatCurrency(d.valor_estimado)}
                      </span>
                      <button
                        onClick={() => handleDeleteDespesa(d.id)}
                        className="text-slate-500 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Excluir despesa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

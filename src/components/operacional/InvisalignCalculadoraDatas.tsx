import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  CalendarDays,
  Sparkles,
  RotateCcw,
  Clock,
  Layers,
  Info,
  Copy,
  Check,
} from 'lucide-react'
import { format, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useToast } from '@/hooks/use-toast'

export interface TrocaAlinhadorItem {
  numero: number
  diasAcumulados: number
  dataTroca: Date
  dataFormatada: string
  diaSemana: string
  isProxima: boolean
}

export function InvisalignCalculadoraDatas() {
  const { toast } = useToast()
  // Data base sempre a data atual do sistema (fixa no momento da sessão, sem digitação de data)
  const [dataBase] = useState<Date>(() => {
    const hoje = new Date()
    hoje.setHours(12, 0, 0, 0) // normaliza horário para evitar variações de fuso
    return hoje
  })

  // Inputs: Quantidade de alinhadores e Dias de uso de cada um
  // Defaults amigáveis e flexíveis
  const [qtdAlinhadoresInput, setQtdAlinhadoresInput] = useState<string>('6')
  const [diasUsoInput, setDiasUsoInput] = useState<string>('10')
  const [copiado, setCopiado] = useState(false)

  const qtdAlinhadores = parseInt(qtdAlinhadoresInput, 10)
  const diasUso = parseInt(diasUsoInput, 10)

  // Validação: campos válidos se números inteiros >= 1
  const isQtdValida = !isNaN(qtdAlinhadores) && qtdAlinhadores >= 1
  const isDiasValido = !isNaN(diasUso) && diasUso >= 1
  const isValid = isQtdValida && isDiasValido

  // Cálculo das datas de troca
  // Data da N-ésima troca = data base + (N * dias de uso)
  const cronograma = useMemo<TrocaAlinhadorItem[]>(() => {
    if (!isValid) return []

    // Limite preventivo para sanidade da interface caso usuário digite 99999
    const totalItens = Math.min(qtdAlinhadores, 200)

    const itens: TrocaAlinhadorItem[] = []
    for (let i = 1; i <= totalItens; i++) {
      const diasAcumulados = i * diasUso
      const dataTroca = addDays(dataBase, diasAcumulados)
      const dataFormatada = format(dataTroca, 'dd/MM/yyyy')
      const rawDiaSemana = format(dataTroca, 'EEEE', { locale: ptBR })
      // Capitalizar dia da semana
      const diaSemana = rawDiaSemana.charAt(0).toUpperCase() + rawDiaSemana.slice(1)

      itens.push({
        numero: i,
        diasAcumulados,
        dataTroca,
        dataFormatada,
        diaSemana,
        isProxima: i === 1,
      })
    }

    return itens
  }, [dataBase, qtdAlinhadores, diasUso, isValid])

  const handleReset = () => {
    setQtdAlinhadoresInput('6')
    setDiasUsoInput('10')
    toast({
      title: 'Calculadora redefinida',
      description: 'Valores restaurados para o padrão de 6 alinhadores / 10 dias.',
    })
  }

  const handleCopiarCronograma = async () => {
    if (cronograma.length === 0) return

    const linhas = [
      `*CRONOGRAMA DE TROCA DE ALINHADORES INVISALIGN*`,
      `Data de Início (Hoje): ${format(dataBase, 'dd/MM/yyyy')}`,
      `Alinhadores entregues: ${qtdAlinhadores} | Tempo de uso por alinhador: ${diasUso} dias`,
      `Tempo total estimado: ${qtdAlinhadores * diasUso} dias`,
      '',
      ...cronograma.map(
        (item) =>
          `• ${item.numero}ª Troca (Alinhador #${item.numero + 1}): ${item.dataFormatada} (${item.diaSemana})`,
      ),
    ]

    try {
      await navigator.clipboard.writeText(linhas.join('\n'))
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
      toast({
        title: 'Copiado para a área de transferência',
        description: 'Datas copiadas com sucesso. Pronto para colar no WhatsApp ou prontuário.',
      })
    } catch {
      toast({
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar as datas.',
        variant: 'destructive',
      })
    }
  }

  const dataFinal = cronograma.length > 0 ? cronograma[cronograma.length - 1] : null
  const proximaTroca = cronograma.length > 0 ? cronograma[0] : null
  const totalDiasTratamento = isValid ? qtdAlinhadores * diasUso : 0

  return (
    <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar pb-10">
      {/* Banner / Card explicativo com identidade visual escura e dourada */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/20 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-44 h-44 bg-[#d4af37]/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#d4af37]" />
              <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wide text-white">
                Calculadora de Troca de Alinhadores
              </h2>
              <Badge className="bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 text-[10px] uppercase font-bold tracking-wider hover:bg-[#d4af37]/20">
                Simulação Rápida
              </Badge>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl">
              Simule com precisão as datas em que o paciente deverá realizar a troca de cada
              alinhador levado para casa. O cálculo é imediato, considera meses de 28, 29, 30 e 31
              dias e parte da data de hoje.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="border-slate-800 bg-slate-950/60 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold h-9"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
              Limpar / Padrão
            </Button>
            {cronograma.length > 0 && (
              <Button
                type="button"
                size="sm"
                onClick={handleCopiarCronograma}
                className="bg-[#d4af37] hover:bg-[#c29e2f] text-slate-950 text-xs font-bold uppercase tracking-wider h-9 shadow-md"
              >
                {copiado ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1.5" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1.5" />
                    Copiar Datas
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Grid de Configurações e Resumo */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Formulário de Parâmetros */}
        <Card className="lg:col-span-5 bg-slate-900 border-slate-800 shadow-xl">
          <CardHeader className="pb-4 border-b border-slate-800/80">
            <CardTitle className="text-base font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#d4af37]" />
              Parâmetros da Entrega
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Informe a quantidade entregue ao paciente e a rotina de uso.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-5">
            {/* Data Base Fixa (Hoje) */}
            <div className="space-y-1.5 p-3.5 rounded-lg bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-[#d4af37]" />
                  Data Base (Lançamento)
                </span>
                <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">
                  Hoje (Sistema)
                </Badge>
              </div>
              <div className="text-xl font-extrabold text-white flex items-baseline gap-2">
                <span>{format(dataBase, 'dd/MM/yyyy')}</span>
                <span className="text-xs font-medium text-slate-400 capitalize">
                  ({format(dataBase, 'EEEE', { locale: ptBR })})
                </span>
              </div>
              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                <Info className="w-3 h-3 text-slate-400 shrink-0" />A data de entrega e início é
                sempre o dia atual do lançamento.
              </p>
            </div>

            {/* Quantidade de Alinhadores */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="qtd-alinhadores"
                  className="text-xs font-bold text-slate-200 uppercase tracking-wider"
                >
                  Quantidade de Alinhadores
                </Label>
                <span className="text-[11px] text-amber-400 font-semibold">
                  {isQtdValida ? `${qtdAlinhadores} unidade(s)` : 'Inválido'}
                </span>
              </div>
              <div className="relative">
                <Layers className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <Input
                  id="qtd-alinhadores"
                  type="number"
                  min="1"
                  max="200"
                  value={qtdAlinhadoresInput}
                  onChange={(e) => setQtdAlinhadoresInput(e.target.value)}
                  placeholder="Ex: 6"
                  className="pl-9 bg-slate-950 border-slate-800 text-white font-bold h-11 focus-visible:ring-[#d4af37] focus-visible:border-[#d4af37]"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Total de alinhadores que o paciente está levando nesta consulta.
              </p>
            </div>

            {/* Dias de Uso de Cada Alinhador */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="dias-uso"
                  className="text-xs font-bold text-slate-200 uppercase tracking-wider"
                >
                  Dias de Uso de Cada Alinhador
                </Label>
                <span className="text-[11px] text-amber-400 font-semibold">
                  {isDiasValido ? `${diasUso} dias por alinhador` : 'Inválido'}
                </span>
              </div>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <Input
                  id="dias-uso"
                  type="number"
                  min="1"
                  max="60"
                  value={diasUsoInput}
                  onChange={(e) => setDiasUsoInput(e.target.value)}
                  placeholder="Ex: 10"
                  className="pl-9 bg-slate-950 border-slate-800 text-white font-bold h-11 focus-visible:ring-[#d4af37] focus-visible:border-[#d4af37]"
                />
              </div>

              {/* Botões rápidos de dias comuns */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold mr-1">
                  Comuns:
                </span>
                {[7, 10, 14, 15].map((dias) => (
                  <button
                    key={dias}
                    type="button"
                    onClick={() => setDiasUsoInput(String(dias))}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                      diasUso === dias
                        ? 'bg-[#d4af37] text-slate-950 shadow-sm'
                        : 'bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300'
                    }`}
                  >
                    {dias}d
                  </button>
                ))}
              </div>
            </div>

            {/* Validação de erro se inputs vazios ou < 1 */}
            {!isValid && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0 text-rose-400" />
                <span>
                  Preencha valores válidos maiores ou iguais a 1 para alinhadores e dias de uso.
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumo Dinâmico do Tratamento Entregue */}
        <div className="lg:col-span-7 flex flex-col justify-start">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Próxima Troca (Destaque Principal) */}
            <div className="bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-900 border-2 border-amber-500/50 p-4 rounded-xl shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                  1ª Troca (Próxima)
                </span>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                {proximaTroca ? proximaTroca.dataFormatada : '—'}
              </div>
              <div className="text-xs text-amber-300/80 font-medium mt-0.5">
                {proximaTroca
                  ? `Em ${diasUso} dias (${proximaTroca.diaSemana})`
                  : 'Aguardando valores'}
              </div>
            </div>

            {/* Duração Deste Pacote */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Cobertura do Pacote
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                {isValid ? `${totalDiasTratamento} dias` : '—'}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {isValid ? `${qtdAlinhadores} alinhadores × ${diasUso}d` : 'Aguardando valores'}
              </div>
            </div>

            {/* Última Troca Deste Pacote */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Última Troca
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                {dataFinal ? dataFinal.dataFormatada : '—'}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {dataFinal
                  ? `${dataFinal.numero}ª troca (${dataFinal.diaSemana})`
                  : 'Aguardando valores'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista Vertical de Trocas Calculadas */}
      <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-800 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#d4af37]" />
              Cronograma de Trocas Calculado
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              {cronograma.length > 0
                ? `${cronograma.length} ${cronograma.length === 1 ? 'troca programada' : 'trocas programadas'} sequenciais (leitura vertical sequencial)`
                : 'Nenhuma data calculada no momento.'}
            </CardDescription>
          </div>

          {cronograma.length > 0 && (
            <Badge className="bg-slate-800 border-slate-700 text-slate-300 text-xs font-mono">
              {qtdAlinhadores} alinhadores
            </Badge>
          )}
        </CardHeader>
        <CardContent className="pt-4">
          {!isValid || cronograma.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Calendar className="w-10 h-10 mx-auto text-slate-600 stroke-[1.5]" />
              <p className="text-sm font-semibold text-slate-400">
                Informe os valores acima para gerar o cronograma.
              </p>
              <p className="text-xs text-slate-500">Mínimo de 1 alinhador e 1 dia de uso.</p>
            </div>
          ) : (
            <div className="flex flex-col space-y-2.5">
              {cronograma.map((item) => (
                <div
                  key={item.numero}
                  className={`p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                    item.isProxima
                      ? 'bg-gradient-to-r from-amber-500/15 via-slate-950 to-slate-950 border-amber-500/60 shadow-lg ring-1 ring-amber-500/30'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Lado esquerdo: Identificação da Troca e Status Próxima */}
                  <div className="flex items-center gap-2.5 min-w-[170px]">
                    <span
                      className={`text-xs font-extrabold px-2.5 py-1 rounded tracking-wide ${
                        item.isProxima
                          ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                          : 'bg-slate-800 text-slate-300 border border-slate-700 font-bold'
                      }`}
                    >
                      {item.numero}ª Troca
                    </span>
                    {item.isProxima && (
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 animate-pulse">
                        Próxima
                      </span>
                    )}
                  </div>

                  {/* Centro: Data em destaque e Dia da semana */}
                  <div className="flex items-baseline sm:items-center gap-3 flex-1 sm:justify-center">
                    <span className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-mono">
                      {item.dataFormatada}
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-slate-400 capitalize">
                      {item.diaSemana}
                    </span>
                  </div>

                  {/* Lado direito: Delta de dias e Alinhador a usar */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 min-w-[180px] pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                      +{item.diasAcumulados}d
                    </span>
                    <span className="text-xs font-bold text-amber-400/90 tracking-wide uppercase px-2 py-0.5 rounded bg-amber-500/5 border border-amber-500/20">
                      Usar #{item.numero + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

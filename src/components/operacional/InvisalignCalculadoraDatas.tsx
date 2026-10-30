import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  CalendarDays,
  CalendarCheck2,
  Sparkles,
  RotateCcw,
  Clock,
  Layers,
  Info,
  Copy,
  Check,
  Stethoscope,
  SlidersHorizontal,
} from 'lucide-react'
import { format, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useToast } from '@/hooks/use-toast'

export interface TrocaAlinhadorItem {
  numero: number
  diasIntervalo: number // Dias de uso deste alinhador específico (ex.: 10 ou personalizado)
  isPersonalizado: boolean // Se difere do padrão global
  diasAcumulados: number // Soma cumulativa de dias até esta troca
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

  // Inputs: Quantidade de alinhadores e Dias de uso de cada um (padrão global)
  const [qtdAlinhadoresInput, setQtdAlinhadoresInput] = useState<string>('6')
  const [diasUsoInput, setDiasUsoInput] = useState<string>('10')
  const [copiado, setCopiado] = useState(false)

  // Mapa de exceções de dias individuais por troca: { [numeroTroca]: dias }
  // Ex: { 2: 7 } significa que a 2ª troca tem intervalo de 7 dias em vez do padrão global
  const [diasIndividuais, setDiasIndividuais] = useState<Record<number, number>>({})

  // Estado temporário para digitação em inputs individuais (permite ao usuário apagar para digitar)
  const [tempInputValores, setTempInputValores] = useState<Record<number, string>>({})

  const qtdAlinhadores = parseInt(qtdAlinhadoresInput, 10)
  const diasUsoGlobal = parseInt(diasUsoInput, 10)

  // Validação: campos válidos se números inteiros >= 1
  const isQtdValida = !isNaN(qtdAlinhadores) && qtdAlinhadores >= 1
  const isDiasValido = !isNaN(diasUsoGlobal) && diasUsoGlobal >= 1
  const isValid = isQtdValida && isDiasValido

  // Quantidade de trocas personalizadas ativas no momento
  const qtdPersonalizadas = useMemo(() => {
    if (!isValid) return 0
    let count = 0
    const totalItens = Math.min(qtdAlinhadores, 200)
    for (let i = 1; i <= totalItens; i++) {
      if (diasIndividuais[i] !== undefined && diasIndividuais[i] !== diasUsoGlobal) {
        count++
      }
    }
    return count
  }, [diasIndividuais, diasUsoGlobal, qtdAlinhadores, isValid])

  // CÁLCULO DAS DATAS DE TROCA EM CASCATA SEQUENCIAL:
  // Data Troca 1 = dataBase + dias(1)
  // Data Troca 2 = Data Troca 1 + dias(2)
  // ...
  // Data Troca N = Data Troca (N-1) + dias(N)
  // Consequência: alterar dias(2) desloca automaticamente as trocas 3, 4, 5...
  const cronograma = useMemo<TrocaAlinhadorItem[]>(() => {
    if (!isValid) return []

    const totalItens = Math.min(qtdAlinhadores, 200)
    const itens: TrocaAlinhadorItem[] = []

    let dataAtual = dataBase
    let acumuladorDias = 0

    for (let i = 1; i <= totalItens; i++) {
      const diasDoAlinhador =
        diasIndividuais[i] !== undefined && diasIndividuais[i] >= 1
          ? diasIndividuais[i]
          : diasUsoGlobal

      const isPersonalizado =
        diasIndividuais[i] !== undefined && diasIndividuais[i] !== diasUsoGlobal

      acumuladorDias += diasDoAlinhador
      dataAtual = addDays(dataAtual, diasDoAlinhador)

      const dataFormatada = format(dataAtual, 'dd/MM/yyyy')
      const rawDiaSemana = format(dataAtual, 'EEEE', { locale: ptBR })
      const diaSemana = rawDiaSemana.charAt(0).toUpperCase() + rawDiaSemana.slice(1)

      itens.push({
        numero: i,
        diasIntervalo: diasDoAlinhador,
        isPersonalizado,
        diasAcumulados: acumuladorDias,
        dataTroca: dataAtual,
        dataFormatada,
        diaSemana,
        isProxima: i === 1,
      })
    }

    return itens
  }, [dataBase, qtdAlinhadores, diasUsoGlobal, diasIndividuais, isValid])

  // CÁLCULO DA PRÓXIMA CONSULTA (RETORNO CLÍNICO):
  // Regra do Dr. Leandro:
  // O paciente coloca o último alinhador (Troca final) e precisa usá-lo pelo prazo
  // daquele último alinhador específico (prazo individual se houver, ou global).
  // Data Consulta = data da última troca + prazo do último alinhador
  const proximaConsulta = useMemo(() => {
    if (!isValid || cronograma.length === 0) return null

    const ultimaTroca = cronograma[cronograma.length - 1]
    const ultimoNumero = ultimaTroca.numero

    // Prazo de uso do último alinhador levado (o que é iniciado na última troca)
    // Se o usuário personalizou o último alinhador, usa a exceção; senão, o global
    const diasUltimoAlinhador =
      diasIndividuais[ultimoNumero] !== undefined && diasIndividuais[ultimoNumero] >= 1
        ? diasIndividuais[ultimoNumero]
        : diasUsoGlobal

    const dataConsulta = addDays(ultimaTroca.dataTroca, diasUltimoAlinhador)
    const dataFormatada = format(dataConsulta, 'dd/MM/yyyy')
    const rawDiaSemana = format(dataConsulta, 'EEEE', { locale: ptBR })
    const diaSemana = rawDiaSemana.charAt(0).toUpperCase() + rawDiaSemana.slice(1)
    const ultimoAlinhadorNumero = qtdAlinhadores
    const dataUltimaTrocaCurta = format(ultimaTroca.dataTroca, 'dd/MM')
    const diasTotaisAcumulados = ultimaTroca.diasAcumulados + diasUltimoAlinhador

    const isUltimoPersonalizado =
      diasIndividuais[ultimoNumero] !== undefined && diasIndividuais[ultimoNumero] !== diasUsoGlobal

    return {
      data: dataConsulta,
      dataFormatada,
      diaSemana,
      ultimoAlinhadorNumero,
      dataUltimaTrocaCurta,
      dataUltimaTrocaCompleta: ultimaTroca.dataFormatada,
      diasUltimoAlinhador,
      isUltimoPersonalizado,
      diasTotaisAcumulados,
      composicaoTexto: `${dataUltimaTrocaCurta} (último alinhador #${ultimoAlinhadorNumero}) + ${diasUltimoAlinhador} dias`,
    }
  }, [cronograma, isValid, diasUsoGlobal, diasIndividuais, qtdAlinhadores])

  // Manipulação de prazos individuais
  const handleMudarDiasIndividual = (numeroTroca: number, novoValorStr: string) => {
    setTempInputValores((prev) => ({ ...prev, [numeroTroca]: novoValorStr }))
    const num = parseInt(novoValorStr, 10)
    if (!isNaN(num) && num >= 1) {
      setDiasIndividuais((prev) => {
        if (num === diasUsoGlobal) {
          const next = { ...prev }
          delete next[numeroTroca]
          return next
        }
        return { ...prev, [numeroTroca]: num }
      })
    }
  }

  const handleBlurIndividual = (numeroTroca: number) => {
    const raw = tempInputValores[numeroTroca]
    if (raw === undefined) return

    const num = parseInt(raw, 10)
    if (isNaN(num) || num < 1) {
      // Reverter para o valor atual ou para o global
      const fallback = diasIndividuais[numeroTroca] ?? diasUsoGlobal
      setTempInputValores((prev) => {
        const next = { ...prev }
        delete next[numeroTroca]
        return next
      })
      toast({
        title: 'Valor ajustado',
        description: `O prazo do alinhador #${numeroTroca} foi mantido em ${fallback} dias (mínimo de 1 dia).`,
      })
    } else {
      setTempInputValores((prev) => {
        const next = { ...prev }
        delete next[numeroTroca]
        return next
      })
    }
  }

  const handleResetarIndividual = (numeroTroca: number) => {
    setDiasIndividuais((prev) => {
      const next = { ...prev }
      delete next[numeroTroca]
      return next
    })
    setTempInputValores((prev) => {
      const next = { ...prev }
      delete next[numeroTroca]
      return next
    })
    toast({
      title: `Alinhador #${numeroTroca} restaurado`,
      description: `Voltou a seguir o padrão global de ${diasUsoGlobal} dias.`,
    })
  }

  const handleLimparTodasExcecoes = () => {
    setDiasIndividuais({})
    setTempInputValores({})
    toast({
      title: 'Exceções limpas',
      description: `Todos os alinhadores agora seguem o padrão global de ${diasUsoGlobal} dias.`,
    })
  }

  const handleReset = () => {
    setQtdAlinhadoresInput('6')
    setDiasUsoInput('10')
    setDiasIndividuais({})
    setTempInputValores({})
    toast({
      title: 'Calculadora redefinida',
      description: 'Valores restaurados para o padrão de 6 alinhadores / 10 dias.',
    })
  }

  const handleCopiarCronograma = async () => {
    if (cronograma.length === 0) return

    const totalDiasEstimados = proximaConsulta
      ? proximaConsulta.diasTotaisAcumulados
      : cronograma[cronograma.length - 1].diasAcumulados

    const linhas = [
      `*CRONOGRAMA DE TROCA DE ALINHADORES INVISALIGN*`,
      `Data de Início (Hoje): ${format(dataBase, 'dd/MM/yyyy')}`,
      `Alinhadores entregues: ${qtdAlinhadores} | Tempo base por alinhador: ${diasUsoGlobal} dias${
        qtdPersonalizadas > 0 ? ` (${qtdPersonalizadas} com prazo personalizado)` : ''
      }`,
      `Tempo total estimado: ${totalDiasEstimados} dias`,
      '',
      ...cronograma.map((item) => {
        const sufixoPersonalizado = item.isPersonalizado ? ` — ${item.diasIntervalo} dias` : ''
        return `• ${item.numero}ª Troca (Alinhador #${item.numero + 1}): ${item.dataFormatada} (${item.diaSemana})${sufixoPersonalizado}`
      }),
      ...(proximaConsulta
        ? [
            '',
            `★ PRÓXIMA CONSULTA: ${proximaConsulta.dataFormatada} (${proximaConsulta.diaSemana})`,
            `  Composição: ${proximaConsulta.composicaoTexto}${
              proximaConsulta.isUltimoPersonalizado ? ' (prazo personalizado)' : ''
            }`,
          ]
        : []),
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
              alinhador levado para casa. Você pode personalizar individualmente o prazo de qualquer
              alinhador — o sistema recalcula as datas seguintes em cascata.
            </p>
          </div>
        </div>
      </div>

      {/* Grid de 2 colunas lado a lado: Parâmetros (Esquerda, ~1/3) e Cronograma Calculado (Direita, ~2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Coluna ESQUERDA: Parâmetros da Entrega (~1/3 da largura, sticky) */}
        <div className="lg:col-span-4 lg:sticky lg:top-0">
          <Card className="bg-slate-900 border-slate-800 shadow-xl">
            <CardHeader className="pb-4 border-b border-slate-800/80">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#d4af37]" />
                  Parâmetros de Entrega
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="border-slate-800 bg-slate-950/60 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold h-8 px-2.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  Limpar / Padrão
                </Button>
              </div>
              <CardDescription className="text-slate-400 text-xs">
                Informe a quantidade entregue ao paciente e a rotina padrão de uso.
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

              {/* Dias de Uso de Cada Alinhador (Padrão Global Inteligente) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="dias-uso"
                    className="text-xs font-bold text-slate-200 uppercase tracking-wider"
                  >
                    Dias de Uso de Cada Alinhador
                  </Label>
                  <span className="text-[11px] text-amber-400 font-semibold">
                    {isDiasValido ? `${diasUsoGlobal} dias por alinhador` : 'Inválido'}
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
                        diasUsoGlobal === dias
                          ? 'bg-[#d4af37] text-slate-950 shadow-sm'
                          : 'bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300'
                      }`}
                    >
                      {dias}d
                    </button>
                  ))}
                </div>

                <p className="text-[11px] text-slate-400">
                  Prazo global padrão. Você pode mudar individualmente o prazo de qualquer alinhador
                  no cronograma ao lado.
                </p>
              </div>

              {/* Status de personalizações individuais ativas */}
              {qtdPersonalizadas > 0 && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-[#d4af37] shrink-0" />
                    <span>
                      <strong>{qtdPersonalizadas}</strong>{' '}
                      {qtdPersonalizadas === 1 ? 'troca personalizada' : 'trocas personalizadas'}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleLimparTodasExcecoes}
                    className="text-amber-300 hover:text-white hover:bg-amber-500/20 text-[11px] h-7 px-2 font-semibold"
                  >
                    Restaurar padrão
                  </Button>
                </div>
              )}

              {/* Validação de erro se inputs vazios ou < 1 */}
              {!isValid && (
                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
                  <Info className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>
                    Preencha valores válidos maiores ou iguais a 1 para alinhadores e dias de uso.
                  </span>
                </div>
              )}

              {/* Bloco de Destaque Premium PRÓXIMA CONSULTA na coluna esquerda */}
              {proximaConsulta && (
                <div className="relative overflow-hidden rounded-xl border border-amber-500/50 bg-gradient-to-br from-amber-500/15 via-slate-950 to-amber-950/30 p-4 shadow-xl ring-1 ring-amber-500/30">
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#d4af37]/15 rounded-full blur-xl pointer-events-none" />

                  <div className="relative z-10 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37]">
                          <CalendarCheck2 className="w-4 h-4 text-[#d4af37]" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-wider text-[#d4af37]">
                          Próxima Consulta
                        </span>
                      </div>
                      <Badge className="bg-[#d4af37] text-slate-950 hover:bg-[#d4af37] text-[10px] font-black uppercase tracking-wider shadow-sm">
                        Retorno Clínico
                      </Badge>
                    </div>

                    <div className="pt-1">
                      <div className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
                        {proximaConsulta.dataFormatada}
                      </div>
                      <div className="text-xs font-semibold text-amber-300 capitalize flex items-center gap-1.5 mt-0.5">
                        <span>{proximaConsulta.diaSemana}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-[11px] text-slate-400 font-normal">
                          +{proximaConsulta.diasTotaisAcumulados}d do início
                        </span>
                      </div>
                    </div>

                    {/* Composição transparente da conta */}
                    <div className="pt-2 border-t border-amber-500/20 text-[11px] text-slate-300 space-y-1">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Composição do retorno:</span>
                        <span className="text-amber-400 font-mono font-bold flex items-center gap-1">
                          +{proximaConsulta.diasUltimoAlinhador} dias após troca final
                          {proximaConsulta.isUltimoPersonalizado && (
                            <span className="text-[10px] text-amber-300 font-sans font-normal">
                              (personalizado)
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="bg-slate-950/70 rounded-md px-2.5 py-1.5 border border-amber-500/20 font-mono text-[11px] text-amber-200/90 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{proximaConsulta.composicaoTexto}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed pt-0.5">
                        O paciente inicia o último alinhador em{' '}
                        {proximaConsulta.dataUltimaTrocaCompleta} e completa os{' '}
                        {proximaConsulta.diasUltimoAlinhador} dias de uso antes da consulta.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Coluna DIREITA: Cronograma de Trocas Calculado (~2/3 da largura, rolagem própria) */}
        <div className="lg:col-span-8">
          <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden flex flex-col">
            <CardHeader className="pb-3 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
              <div>
                <CardTitle className="text-base font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#d4af37]" />
                  Cronograma de Trocas Calculado
                </CardTitle>
                <CardDescription className="text-slate-400 text-xs">
                  {cronograma.length > 0
                    ? `${cronograma.length} ${
                        cronograma.length === 1 ? 'troca programada' : 'trocas programadas'
                      } sequenciais (ajuste individual com recálculo em cascata)`
                    : 'Nenhuma data calculada no momento.'}
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                {qtdPersonalizadas > 0 && (
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-xs font-semibold">
                    {qtdPersonalizadas} personalizada{qtdPersonalizadas > 1 ? 's' : ''}
                  </Badge>
                )}

                {cronograma.length > 0 && (
                  <Badge className="bg-slate-800 border-slate-700 text-slate-300 text-xs font-mono">
                    {qtdAlinhadores} alinhadores
                  </Badge>
                )}

                {cronograma.length > 0 && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCopiarCronograma}
                    className="bg-[#d4af37] hover:bg-[#c29e2f] text-slate-950 text-xs font-bold uppercase tracking-wider h-8 shadow-md"
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
            </CardHeader>
            <CardContent className="pt-4 max-h-[calc(100vh-18rem)] overflow-y-auto custom-scrollbar">
              {!isValid || cronograma.length === 0 ? (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <Calendar className="w-10 h-10 mx-auto text-slate-600 stroke-[1.5]" />
                  <p className="text-sm font-semibold text-slate-400">
                    Informe os valores ao lado para gerar o cronograma.
                  </p>
                  <p className="text-xs text-slate-500">Mínimo de 1 alinhador e 1 dia de uso.</p>
                </div>
              ) : (
                <div className="flex flex-col space-y-2.5 pr-1">
                  {cronograma.map((item) => {
                    const tempVal = tempInputValores[item.numero]
                    const valorExibido =
                      tempVal !== undefined ? tempVal : String(item.diasIntervalo)

                    return (
                      <div
                        key={item.numero}
                        className={`p-3 sm:p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-3 ${
                          item.isPersonalizado
                            ? 'bg-slate-950/90 border-amber-500/60 shadow-md ring-1 ring-amber-500/30'
                            : item.isProxima
                              ? 'bg-gradient-to-r from-amber-500/15 via-slate-950 to-slate-950 border-amber-500/60 shadow-lg ring-1 ring-amber-500/30'
                              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {/* Lado esquerdo: Identificação da Troca, Status Próxima e Alerta Personalizado */}
                        <div className="flex items-center gap-2 min-w-[170px] shrink-0">
                          <span
                            className={`text-xs font-extrabold px-2.5 py-1 rounded tracking-wide ${
                              item.isProxima
                                ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                                : item.isPersonalizado
                                  ? 'bg-amber-500/20 text-[#d4af37] border border-[#d4af37]/40 font-bold'
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
                          {item.isPersonalizado && (
                            <span
                              className="text-[10px] font-bold text-amber-300 uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/40"
                              title={`Prazo individual deste alinhador: ${item.diasIntervalo} dias (padrão global: ${diasUsoGlobal}d)`}
                            >
                              Personalizado
                            </span>
                          )}
                        </div>

                        {/* Centro: Data em destaque e Dia da semana */}
                        <div className="flex items-baseline md:items-center gap-3 flex-1 md:justify-center">
                          <span className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-mono">
                            {item.dataFormatada}
                          </span>
                          <span className="text-xs sm:text-sm font-medium text-slate-400 capitalize">
                            {item.diaSemana}
                          </span>
                        </div>

                        {/* Lado direito: Campo individual de dias de uso + Delta acumulado + Alinhador a usar */}
                        <div className="flex items-center justify-between md:justify-end gap-2.5 pt-1 md:pt-0 border-t md:border-t-0 border-slate-800/60 shrink-0">
                          {/* Campo individual editável de dias de uso deste alinhador */}
                          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-lg px-2 py-1">
                            <span className="text-[10px] uppercase font-bold text-slate-400">
                              Uso:
                            </span>
                            <div className="relative flex items-center">
                              <input
                                type="number"
                                min={1}
                                max={60}
                                value={valorExibido}
                                onChange={(e) =>
                                  handleMudarDiasIndividual(item.numero, e.target.value)
                                }
                                onBlur={() => handleBlurIndividual(item.numero)}
                                aria-label={`Dias de uso da ${item.numero}ª troca`}
                                className={`w-11 h-6 text-center font-mono font-bold text-xs rounded border px-1 transition-colors focus:outline-none focus:ring-1 focus:ring-[#d4af37] ${
                                  item.isPersonalizado
                                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-200'
                                    : 'bg-slate-950 border-slate-700 text-white'
                                }`}
                              />
                              <span className="text-[11px] font-semibold text-slate-400 ml-1">
                                d
                              </span>
                            </div>

                            {item.isPersonalizado && (
                              <button
                                type="button"
                                onClick={() => handleResetarIndividual(item.numero)}
                                title={`Voltar ao padrão global (${diasUsoGlobal} dias)`}
                                className="text-slate-400 hover:text-amber-300 ml-0.5 p-0.5"
                              >
                                <RotateCcw className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          {/* Acumulado desde o início */}
                          <span
                            className="text-xs font-semibold px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono"
                            title={`Acumulado de dias desde o início: +${item.diasAcumulados} dias`}
                          >
                            +{item.diasAcumulados}d
                          </span>

                          {/* Próximo alinhador a ser iniciado */}
                          <span className="text-xs font-bold text-amber-400/90 tracking-wide uppercase px-2 py-1 rounded bg-amber-500/5 border border-amber-500/20">
                            Usar #{item.numero + 1}
                          </span>
                        </div>
                      </div>
                    )
                  })}

                  {/* Linha destacada no FINAL do cronograma vertical da coluna direita (PRÓXIMA CONSULTA / RETORNO) */}
                  {proximaConsulta && (
                    <div className="p-3.5 sm:p-4 rounded-xl border border-amber-500/60 bg-gradient-to-r from-amber-500/20 via-slate-950 to-amber-950/20 shadow-lg ring-1 ring-amber-500/30 flex flex-col md:flex-row md:items-center md:justify-between gap-3 transition-all mt-3">
                      {/* Lado esquerdo: Badge de Destaque Próxima Consulta */}
                      <div className="flex items-center gap-2.5 min-w-[170px] shrink-0">
                        <span className="text-xs font-black px-2.5 py-1 rounded tracking-wide bg-[#d4af37] text-slate-950 shadow-sm flex items-center gap-1.5 uppercase">
                          <Stethoscope className="w-3.5 h-3.5 text-slate-950" />
                          Próxima Consulta
                        </span>
                      </div>

                      {/* Centro: Data e Dia da Semana com destaque amplo */}
                      <div className="flex items-baseline md:items-center gap-3 flex-1 md:justify-center">
                        <span className="text-xl sm:text-2xl font-black text-amber-300 tracking-tight font-mono">
                          {proximaConsulta.dataFormatada}
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-amber-200/90 capitalize">
                          {proximaConsulta.diaSemana}
                        </span>
                      </div>

                      {/* Lado direito: Prazo do último alinhador + Delta acumulado + Indicação de retorno */}
                      <div className="flex items-center justify-between md:justify-end gap-2.5 pt-1 md:pt-0 border-t md:border-t-0 border-amber-500/30 shrink-0">
                        <span
                          className="text-[11px] font-mono px-2 py-1 rounded bg-slate-950/80 border border-amber-500/40 text-amber-300"
                          title="Prazo de uso do último alinhador antes da consulta"
                        >
                          +{proximaConsulta.diasUltimoAlinhador}d no #
                          {proximaConsulta.ultimoAlinhadorNumero}
                        </span>
                        <span
                          className="text-xs font-bold px-2 py-1 rounded bg-slate-900/90 border border-amber-500/40 text-amber-300 font-mono"
                          title={`Total de dias de tratamento até a consulta: +${proximaConsulta.diasTotaisAcumulados} dias`}
                        >
                          +{proximaConsulta.diasTotaisAcumulados}d
                        </span>
                        <span className="text-xs font-black text-[#d4af37] tracking-wider uppercase px-2.5 py-1 rounded bg-amber-500/15 border border-amber-500/40 shadow-sm">
                          Retorno / Avaliação
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

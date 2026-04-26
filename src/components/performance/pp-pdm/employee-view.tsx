import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  Loader2,
  Save,
  Clock,
  AlertTriangle,
  Plus,
  Trash2,
  GraduationCap,
  Info,
} from 'lucide-react'
import { startOfWeek, addDays, isAfter, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

function getCurrentDeadline() {
  const now = new Date()
  const sunday = startOfWeek(now, { weekStartsOn: 0 })
  const saturday = addDays(sunday, 6)
  saturday.setHours(11, 59, 0, 0)
  return isAfter(now, saturday) ? addDays(saturday, 7) : saturday
}

interface PdmItem {
  id: string
  melhoria: string
  sugestao: string
}

export function EmployeePPDMView() {
  const { user, profile } = useAuth()
  const [recordId, setRecordId] = useState<string | null>(null)
  const [pp, setPp] = useState('')
  const [pdmLegacy, setPdmLegacy] = useState('')
  const [pdmItems, setPdmItems] = useState<PdmItem[]>([{ id: '1', melhoria: '', sugestao: '' }])
  const [inovacoes, setInovacoes] = useState('')
  const [notaFinal, setNotaFinal] = useState<number | null>(null)
  const [ppValidado, setPpValidado] = useState(false)
  const [inovacaoValidada, setInovacaoValidada] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const deadline = getCurrentDeadline()
  const weekRef = format(deadline, 'yyyy-MM-dd')
  const isBlocked = new Date().getDay() === 6 && new Date().getHours() >= 12

  useEffect(() => {
    if (user) loadData()
  }, [user, weekRef])

  const loadData = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('performance_pp_pdm' as any)
        .select('*')
        .eq('usuario_id', user?.id)
        .eq('data_registro', weekRef)
        .maybeSingle()

      if (data) {
        setRecordId(data.id)
        setPp(data.pontos_positivos || '')
        setInovacoes(data.inovacoes || '')
        setPpValidado(data.pp_validado || false)
        setInovacaoValidada(data.inovacao_validada || false)
        if (data.pdm_itens && Array.isArray(data.pdm_itens) && data.pdm_itens.length > 0) {
          setPdmItems(data.pdm_itens)
          setNotaFinal(data.nota_pdm)
        } else if (
          data.pontos_melhoria &&
          data.pontos_melhoria !== 'Nenhum ponto de melhoria registrado.'
        ) {
          setPdmLegacy(data.pontos_melhoria)
        }
      } else {
        setRecordId(null)
        setPp('')
        setInovacoes('')
        setPdmItems([{ id: '1', melhoria: '', sugestao: '' }])
        setPdmLegacy('')
        setNotaFinal(null)
        setPpValidado(false)
        setInovacaoValidada(false)
      }
    } catch (e: any) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleChangeItem = (id: string, field: 'melhoria' | 'sugestao', value: string) => {
    setPdmItems(pdmItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const handleUndo = async () => {
    if (!recordId) return
    setSaving(true)
    try {
      await supabase
        .from('performance_pp_pdm' as any)
        .delete()
        .eq('id', recordId)
      setRecordId(null)
      setPp('')
      setInovacoes('')
      setPdmItems([{ id: '1', melhoria: '', sugestao: '' }])
      setPdmLegacy('')
      setNotaFinal(null)
      setPpValidado(false)
      setInovacaoValidada(false)
      toast.success('Envio desfeito com sucesso!')
    } catch (e: any) {
      toast.error('Erro ao desfazer envio.')
    } finally {
      setSaving(false)
    }
  }

  const handleSave = async () => {
    if (!user) return
    const filledItems = pdmItems.filter((item) => item.melhoria.trim() || item.sugestao.trim())

    if (!pp.trim() && filledItems.length === 0 && !pdmLegacy.trim() && !inovacoes.trim()) {
      toast.warning('Preencha ao menos um dos campos antes de salvar.')
      return
    }

    for (const item of filledItems) {
      if (item.melhoria.trim() && !item.sugestao.trim()) {
        toast.warning('Atenção: Sugestão Obrigatória!', {
          description: `Você apontou um ponto de melhoria, mas não inseriu uma sugestão. É obrigatório preencher uma sugestão de melhoria para conseguir salvar o registro.`,
        })
        return
      }
      if (!item.melhoria.trim() && item.sugestao.trim()) {
        toast.warning('Atenção: Crítica Obrigatória!', {
          description: `Você preencheu uma sugestão, mas esqueceu de descrever qual é o Ponto de Melhoria. Preencha ambos para prosseguir.`,
        })
        return
      }
    }

    setSaving(true)
    try {
      let nota = Math.min(filledItems.length * 2, 10)
      if (ppValidado) {
        nota = Math.min(nota + 2, 10)
      }

      const pdmText =
        filledItems.map((i) => `Melhoria: ${i.melhoria}\nSugestão: ${i.sugestao}`).join('\n\n') ||
        pdmLegacy ||
        'Nenhum ponto de melhoria registrado.'

      const { data: existing } = await supabase
        .from('performance_pp_pdm' as any)
        .select('id')
        .eq('usuario_id', user.id)
        .eq('data_registro', weekRef)
        .maybeSingle()

      const payload = {
        pontos_positivos: pp || 'Nenhum ponto positivo registrado.',
        pontos_melhoria: pdmText,
        inovacoes: inovacoes || '',
        pdm_itens: filledItems,
        nota_pdm: nota,
        atualizado_em: new Date().toISOString(),
      }

      if (existing) {
        await supabase
          .from('performance_pp_pdm' as any)
          .update(payload)
          .eq('id', existing.id)
        setRecordId(existing.id)
      } else {
        const { data: inserted } = await supabase
          .from('performance_pp_pdm' as any)
          .insert({ usuario_id: user.id, data_registro: weekRef, ...payload })
          .select('id')
          .single()
        if (inserted) setRecordId(inserted.id)
      }

      setNotaFinal(nota)
      toast.success(
        filledItems.length > 0
          ? `Registros salvos! Sua Nota PDM foi: ${nota}/10 🎉`
          : 'Registros salvos com sucesso!',
      )
    } catch (e: any) {
      toast.error('Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="border-slate-200 shadow-sm mt-6">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl">Meus PP e PDM</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                  >
                    <Info className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Regras de Pontuação - PP e PDM</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 text-sm text-slate-600 mt-2">
                    <p>
                      <strong>PDM (Pontos de Melhoria):</strong> Cada item registrado com uma
                      Crítica e uma Sugestão de Solução bem definidas vale <strong>2 pontos</strong>
                      . (Máx: 10 pontos)
                    </p>
                    <p>
                      <strong>PP (Pontos Positivos):</strong> Quando um ponto positivo é registrado
                      e <strong>validado pelo gestor</strong>, o sistema adiciona{' '}
                      <strong>2 pontos</strong> extras à sua nota.
                    </p>
                    <p>
                      <strong>Teto da Nota:</strong> A pontuação total (PDM + PP) é limitada a{' '}
                      <strong>10 pontos</strong>.
                    </p>
                    <div className="bg-amber-50 p-3 rounded-md border border-amber-100">
                      <p className="text-amber-800">
                        <strong>Inovações:</strong> Funcionam separadamente da nota. Inovações
                        validadas pelo gestor garantem a manutenção do bônus de{' '}
                        <strong>R$ 100,00</strong> no extrato da sua carteira no final do mês. Caso
                        nenhuma inovação seja validada no mês, o adiantamento de R$ 100,00 será
                        estornado.
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <CardDescription>Registre suas considerações da semana atual.</CardDescription>
          </div>
          <div className="bg-amber-50 text-amber-800 text-sm font-medium px-3 py-1.5 rounded-md flex items-center gap-2 border border-amber-200 shadow-sm">
            <Clock className="w-4 h-4" /> Prazo:{' '}
            {format(deadline, "EEEE', 'dd/MM' às 'HH:mm", { locale: ptBR })}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {(profile as any)?.obrigatorio_pp_pdm && (
          <div className="bg-blue-50 text-blue-800 p-3 rounded-md flex items-start gap-2 border border-blue-200">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm">
              Envie suas considerações até o prazo estipulado para evitar pendências no relatório.
            </p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-emerald-700 font-semibold flex items-center gap-2">
                    Pontos Positivos (PP)
                  </Label>
                  {ppValidado && (
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-xs font-bold">
                      Validado (+2 pts)
                    </span>
                  )}
                </div>
                <Textarea
                  placeholder="O que deu certo nesta semana? Conquistas ou destaques?"
                  className="min-h-[150px] resize-none border-emerald-200 bg-emerald-50/30 focus-visible:ring-emerald-500 text-sm shadow-sm disabled:opacity-70"
                  value={pp}
                  onChange={(e) => setPp(e.target.value)}
                  disabled={isBlocked}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-blue-700 font-semibold flex items-center gap-2">
                    Inovações
                  </Label>
                  {inovacaoValidada && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-bold">
                      Validado (R$ 100)
                    </span>
                  )}
                </div>
                <Textarea
                  placeholder="Sugestões de implementações: ação, equipamento, comportamento..."
                  className="min-h-[150px] resize-none border-blue-200 bg-blue-50/30 focus-visible:ring-blue-500 text-sm shadow-sm disabled:opacity-70"
                  value={inovacoes}
                  onChange={(e) => setInovacoes(e.target.value)}
                  disabled={isBlocked}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-rose-700 font-semibold flex items-center gap-2">
                  PDM e Soluções
                </Label>
                {notaFinal !== null && (
                  <div className="bg-rose-100 text-rose-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5" /> Nota PDM: {notaFinal}/10
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Para cada crítica, proponha uma solução (2 pontos cada, Máx: 10).
              </p>

              {pdmLegacy && pdmItems.length === 1 && !pdmItems[0].melhoria && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800 whitespace-pre-wrap">
                  <strong>Registro Anterior:</strong>
                  <br />
                  {pdmLegacy}
                </div>
              )}

              <div className="space-y-3 max-h-[400px] pr-2 overflow-y-auto overflow-x-hidden">
                {pdmItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="relative p-3 border border-rose-100 bg-rose-50/20 rounded-lg space-y-3"
                  >
                    <div className="absolute top-2 right-2 text-xs font-medium text-rose-300">
                      #{index + 1}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-600">Ponto de Melhoria (Crítica)</Label>
                      <Textarea
                        placeholder="Desafios da semana?"
                        className="min-h-[60px] resize-none text-sm"
                        value={item.melhoria}
                        onChange={(e) => handleChangeItem(item.id, 'melhoria', e.target.value)}
                        disabled={isBlocked}
                      />
                      <Label className="text-xs text-slate-600 mt-2 block">
                        Sugestão de Solução
                      </Label>
                      <Textarea
                        placeholder="Como melhorar isso?"
                        className="min-h-[60px] resize-none text-sm border-emerald-100 focus-visible:ring-emerald-400"
                        value={item.sugestao}
                        onChange={(e) => handleChangeItem(item.id, 'sugestao', e.target.value)}
                        disabled={isBlocked}
                      />
                    </div>
                    <div className="flex justify-end pt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-100 h-7 px-2 text-xs"
                        onClick={() =>
                          setPdmItems(
                            pdmItems.length === 1
                              ? [{ id: '1', melhoria: '', sugestao: '' }]
                              : pdmItems.filter((i) => i.id !== item.id),
                          )
                        }
                        disabled={isBlocked}
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Remover
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {!isBlocked && pdmItems.length < 5 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-dashed text-rose-600 hover:text-rose-700 gap-2"
                  onClick={() =>
                    setPdmItems([
                      ...pdmItems,
                      { id: Math.random().toString(), melhoria: '', sugestao: '' },
                    ])
                  }
                >
                  <Plus className="w-4 h-4" /> Adicionar Ponto
                </Button>
              )}
            </div>
          </div>
        )}

        {isBlocked && (
          <div className="bg-amber-50 text-amber-800 p-3 rounded-md border border-amber-200 mt-4 text-sm font-medium">
            Envio bloqueado. O preenchimento se encerrou no sábado às 11:59h.
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-end pt-4 border-t border-slate-100 gap-3">
          {recordId && !isBlocked && !ppValidado && !inovacaoValidada && (
            <Button
              variant="outline"
              onClick={handleUndo}
              disabled={loading || saving}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 w-full sm:w-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Desfazer Envio
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={loading || saving || isBlocked}
            className="gap-2 bg-amber-600 hover:bg-amber-700 text-white min-w-[150px] shadow-sm w-full sm:w-auto"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{' '}
            Salvar Registros
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

import { useState, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { format } from 'date-fns'
import {
  Loader2,
  Search,
  CheckCircle2,
  History,
  X,
  Phone,
  User,
  Calendar as CalendarIcon,
  Clock,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { createCompromisso, updateCompromisso, Compromisso } from '@/services/compromissos'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  evento: Compromisso | null
}

export function CompromissoComercialModal({ isOpen, onClose, onSave, evento }: ModalProps) {
  const { user, profile } = useAuth() as any
  const { toast } = useToast()

  const [colaboradorId, setColaboradorId] = useState('')
  const [dataAcao, setDataAcao] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [horaAcao, setHoraAcao] = useState('')
  const [descricao, setDescricao] = useState('')

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedPerson, setSelectedPerson] = useState<any>(null)
  const [isSearching, setIsSearching] = useState(false)

  const [resultado, setResultado] = useState('')
  const [reagendar, setReagendar] = useState(false)
  const [novaData, setNovaData] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [novaHora, setNovaHora] = useState('')

  const [crcUsers, setCrcUsers] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [saving, setSaving] = useState(false)
  const resultadoRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    async function loadUsers() {
      const { data } = await supabase
        .from('crc_comercial')
        .select('usuario_id, nome')
        .not('usuario_id', 'is', null)
      if (data) {
        setCrcUsers(data)
        if (!evento && data.find((u) => u.usuario_id === user?.id)) {
          setColaboradorId(user!.id)
        } else if (data.length > 0 && !evento) {
          setColaboradorId(data[0].usuario_id)
        }
      }
    }
    loadUsers()
  }, [user, evento])

  useEffect(() => {
    if (evento) {
      setColaboradorId(evento.usuario_id)
      setDataAcao(evento.data_inicio)
      setHoraAcao(evento.hora_inicio?.substring(0, 5) || '')
      setDescricao(evento.descricao || '')

      if (evento.lead_id) {
        setSelectedPerson({ id: evento.lead_id, nome: evento.lead?.nome || 'Lead', type: 'lead' })
      } else if (evento.paciente_id) {
        setSelectedPerson({
          id: evento.paciente_id,
          nome: evento.paciente?.nome || 'Paciente',
          type: 'paciente',
        })
      }
      setResultado(evento.resultado_acao || '')
    }
  }, [evento])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 3 && !selectedPerson) {
        performSearch()
      } else {
        setSearchResults([])
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery, selectedPerson])

  const performSearch = async () => {
    setIsSearching(true)
    const [{ data: leads }, { data: pacientes }] = await Promise.all([
      supabase
        .from('funil_leads')
        .select('id, nome, telefone')
        .or(`nome.ilike.%${searchQuery}%,telefone.ilike.%${searchQuery}%`)
        .limit(5),
      supabase
        .from('pacientes')
        .select('id, nome, telefone')
        .or(`nome.ilike.%${searchQuery}%,telefone.ilike.%${searchQuery}%`)
        .limit(5),
    ])

    const results: any[] = []
    if (leads) leads.forEach((l) => results.push({ ...l, type: 'lead' }))
    if (pacientes) pacientes.forEach((p) => results.push({ ...p, type: 'paciente' }))

    setSearchResults(results)
    setIsSearching(false)
  }

  useEffect(() => {
    if (selectedPerson) {
      loadHistory()
    } else {
      setHistory([])
    }
  }, [selectedPerson])

  const loadHistory = async () => {
    setLoadingHistory(true)
    let hist: any[] = []

    if (selectedPerson.type === 'lead') {
      const { data: lh } = await supabase
        .from('funil_leads_historico')
        .select('*, usuario:usuarios(nome)')
        .eq('lead_id', selectedPerson.id)
        .order('criado_em', { ascending: false })

      if (lh) {
        hist.push(
          ...lh.map((h) => ({
            date: h.criado_em,
            desc: `${h.acao} ${h.detalhes ? '- ' + h.detalhes : ''}`,
            user: h.usuario?.nome || 'Sistema',
          })),
        )
      }
    } else if (selectedPerson.type === 'paciente') {
      const { data: fh } = await supabase
        .from('fet_historico')
        .select('*, usuario:usuarios(nome)')
        .eq('paciente_id', selectedPerson.id)
        .order('criado_em', { ascending: false })

      if (fh) {
        hist.push(
          ...fh.map((h) => ({
            date: h.criado_em,
            desc: `${h.acao} ${h.detalhes ? '- ' + h.detalhes : ''}`,
            user: h.usuario?.nome || 'Sistema',
          })),
        )
      }
    }

    const { data: comps } = await supabase
      .from('compromissos')
      .select(
        '*, usuario:usuarios!compromissos_usuario_id_fkey(nome), concluido_por_user:usuarios!compromissos_concluido_por_fkey(nome)',
      )
      .eq(selectedPerson.type === 'lead' ? 'lead_id' : 'paciente_id', selectedPerson.id)
      .eq('tipo_compromisso', 'acao_comercial')
      .order('criado_em', { ascending: false })

    if (comps) {
      hist.push(
        ...comps.map((c) => ({
          date: c.concluido_em || c.criado_em,
          desc:
            `Ação: ${c.descricao} ` +
            (c.resultado_acao
              ? `(Resultado: ${c.resultado_acao})`
              : c.status_acao === 'concluido'
                ? '(Concluída)'
                : '(Pendente)'),
          user: c.concluido_por_user?.nome || c.usuario?.nome || 'Sistema',
        })),
      )
    }

    hist.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    setHistory(hist)
    setLoadingHistory(false)
  }

  const handleApenasAtualizar = async () => {
    if (!colaboradorId || !dataAcao || !selectedPerson) {
      toast({ title: 'Preencha colaborador, data e paciente', variant: 'destructive' })
      return
    }

    setSaving(true)
    try {
      if (evento?.id) {
        const baseCompromisso: any = {
          usuario_id: colaboradorId,
          data_inicio: dataAcao,
          data_fim: dataAcao,
          hora_inicio: horaAcao ? `${horaAcao}:00` : null,
          hora_fim: horaAcao ? `${horaAcao}:00` : null,
          eh_dia_inteiro: !horaAcao,
          descricao,
        }
        if (resultado) {
          baseCompromisso.resultado_acao = resultado
        }
        await updateCompromisso(evento.id, baseCompromisso)
      }

      if (resultado) {
        if (selectedPerson.type === 'lead') {
          await supabase.from('funil_leads_historico').insert({
            lead_id: selectedPerson.id,
            usuario_id: user!.id,
            acao: 'Atualização de Desfecho',
            detalhes: resultado,
          })
        } else if (selectedPerson.type === 'paciente') {
          await supabase.from('fet_historico').insert({
            paciente_id: selectedPerson.id,
            usuario_id: user!.id,
            acao: 'Atualização de Desfecho',
            detalhes: resultado,
          })
        }

        const userName = profile?.nome || user?.email || 'Sistema'
        const novoItem = {
          date: new Date().toISOString(),
          desc: `Atualização de Desfecho - ${resultado}`,
          user: userName,
        }

        setHistory((prev) => {
          const updated = [novoItem, ...prev]
          return updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        })

        setResultado('')
        setTimeout(() => resultadoRef.current?.focus(), 100)
      }

      toast({ title: 'Dados da ação e histórico atualizados com sucesso!' })
      // Sem recarregar loadHistory() para evitar flicker e chamadas desnecessárias
    } catch (err: any) {
      toast({ title: 'Erro ao atualizar', description: err.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleSave = async () => {
    if (!colaboradorId || !dataAcao || !selectedPerson) {
      toast({ title: 'Preencha colaborador, data e paciente', variant: 'destructive' })
      return
    }

    setSaving(true)
    try {
      const baseCompromisso = {
        usuario_id: colaboradorId,
        tipo_compromisso: 'acao_comercial' as const,
        data_inicio: dataAcao,
        data_fim: dataAcao,
        hora_inicio: horaAcao ? `${horaAcao}:00` : null,
        hora_fim: horaAcao ? `${horaAcao}:00` : null,
        eh_dia_inteiro: !horaAcao,
        descricao,
        setor: 'comercial',
        lead_id: selectedPerson.type === 'lead' ? selectedPerson.id : null,
        paciente_id: selectedPerson.type === 'paciente' ? selectedPerson.id : null,
        resultado_acao: resultado || null,
      }

      if (evento?.id) {
        await updateCompromisso(evento.id, baseCompromisso)
        toast({ title: 'Ação atualizada com sucesso' })
      } else {
        await createCompromisso(baseCompromisso)
        toast({ title: 'Ação comercial agendada com sucesso' })
      }
      onSave()
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleConcluir = async () => {
    if (!resultado) {
      toast({ title: 'Preencha o resultado para concluir a ação', variant: 'destructive' })
      return
    }
    if (reagendar && !novaData) {
      toast({ title: 'Preencha a data do reagendamento', variant: 'destructive' })
      return
    }

    setSaving(true)
    try {
      await updateCompromisso(evento!.id, {
        status_acao: 'concluido',
        resultado_acao: resultado,
        concluido_em: new Date().toISOString(),
        concluido_por: user!.id,
      })

      if (reagendar) {
        await createCompromisso({
          usuario_id: colaboradorId,
          tipo_compromisso: 'acao_comercial' as const,
          data_inicio: novaData,
          data_fim: novaData,
          hora_inicio: novaHora ? `${novaHora}:00` : null,
          hora_fim: novaHora ? `${novaHora}:00` : null,
          eh_dia_inteiro: !novaHora,
          descricao: `Reagendamento. Histórico: ${resultado}`,
          setor: 'comercial',
          lead_id: selectedPerson.type === 'lead' ? selectedPerson.id : null,
          paciente_id: selectedPerson.type === 'paciente' ? selectedPerson.id : null,
        })
        toast({ title: 'Ação concluída e novo contato agendado!' })
      } else {
        toast({ title: 'Ação concluída com sucesso!' })
      }
      onSave()
    } catch (err: any) {
      toast({ title: 'Erro ao concluir', description: err.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(op) => !op && onClose()}>
      <DialogContent className="max-w-4xl bg-slate-900 border-slate-800 text-slate-200">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {evento
              ? evento.status_acao === 'concluido'
                ? 'Ação Comercial Concluída'
                : 'Executar Ação Comercial'
              : 'Nova Ação Comercial'}
          </DialogTitle>
          <DialogDescription>
            {evento
              ? 'Registre o resultado do seu contato com o cliente.'
              : 'Agende uma nova ação de contato para a equipe.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-4">
          <div className="space-y-5">
            <div>
              <Label>Paciente / Lead *</Label>
              {selectedPerson ? (
                <div className="flex items-center justify-between p-3 border border-slate-700 bg-slate-950 rounded-md mt-1">
                  <div>
                    <p className="text-sm font-medium text-slate-200">{selectedPerson.nome}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3" /> {selectedPerson.telefone || 'Sem telefone'}
                    </p>
                  </div>
                  {!evento && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPerson(null)}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ) : (
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por nome ou telefone..."
                    className="pl-9 bg-slate-950 border-slate-800"
                  />
                  {(searchResults.length > 0 || isSearching) && (
                    <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-md shadow-lg overflow-hidden">
                      {isSearching ? (
                        <div className="p-3 text-center text-sm text-slate-400">Buscando...</div>
                      ) : (
                        searchResults.map((res) => (
                          <button
                            key={res.id}
                            onClick={() => {
                              setSelectedPerson(res)
                              setSearchQuery('')
                              setSearchResults([])
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-slate-700 flex justify-between items-center transition-colors"
                          >
                            <div>
                              <p className="text-sm font-medium text-white">{res.nome}</p>
                              <p className="text-xs text-slate-400">{res.telefone}</p>
                            </div>
                            <span className="text-[10px] uppercase bg-slate-900 px-2 py-0.5 rounded text-slate-300 border border-slate-700">
                              {res.type}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3" /> Data da Ação *
                </Label>
                <Input
                  type="date"
                  value={dataAcao}
                  onChange={(e) => setDataAcao(e.target.value)}
                  disabled={evento?.status_acao === 'concluido'}
                  className="mt-1 bg-slate-950 border-slate-800"
                />
              </div>
              <div>
                <Label className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Horário
                </Label>
                <Input
                  type="time"
                  value={horaAcao}
                  onChange={(e) => setHoraAcao(e.target.value)}
                  disabled={evento?.status_acao === 'concluido'}
                  className="mt-1 bg-slate-950 border-slate-800"
                />
              </div>
            </div>

            <div>
              <Label className="flex items-center gap-1">
                <User className="w-3 h-3" /> Colaborador Responsável *
              </Label>
              <Select
                value={colaboradorId}
                onValueChange={setColaboradorId}
                disabled={evento?.status_acao === 'concluido'}
              >
                <SelectTrigger className="mt-1 bg-slate-950 border-slate-800">
                  <SelectValue placeholder="Selecione o consultor..." />
                </SelectTrigger>
                <SelectContent>
                  {crcUsers.map((u) => (
                    <SelectItem key={u.usuario_id} value={u.usuario_id}>
                      {u.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Descrição / Objetivo</Label>
              <Textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Detalhes sobre a ação a ser executada..."
                disabled={evento?.status_acao === 'concluido'}
                className="mt-1 bg-slate-950 border-slate-800 resize-none h-20"
              />
            </div>

            {/* SEÇÃO DE RESULTADO (Apenas Edição de Pendentes) */}
            {evento && evento.status_acao === 'pendente' && (
              <div className="mt-6 pt-5 border-t border-slate-800 space-y-4 animate-fade-in">
                <h4 className="font-semibold text-amber-500 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Registrar Resultado da Ação
                </h4>
                <div>
                  <Label>Qual foi o desfecho? *</Label>
                  <Textarea
                    ref={resultadoRef}
                    value={resultado}
                    onChange={(e) => setResultado(e.target.value)}
                    placeholder="Descreva o que foi conversado e acordado com o paciente..."
                    className="mt-1 bg-slate-950 border-slate-800 min-h-[80px]"
                  />
                </div>

                <div className="flex items-center gap-2 mt-2 bg-slate-950 p-3 rounded border border-slate-800">
                  <input
                    type="checkbox"
                    id="reagendar"
                    checked={reagendar}
                    onChange={(e) => setReagendar(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-amber-500 w-4 h-4 cursor-pointer"
                  />
                  <Label htmlFor="reagendar" className="font-medium cursor-pointer">
                    Agendar nova ação (Follow-up)
                  </Label>
                </div>

                {reagendar && (
                  <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-md border border-slate-700 border-dashed animate-fade-in">
                    <div>
                      <Label>Nova Data *</Label>
                      <Input
                        type="date"
                        value={novaData}
                        onChange={(e) => setNovaData(e.target.value)}
                        className="mt-1 bg-slate-900 border-slate-700"
                      />
                    </div>
                    <div>
                      <Label>Novo Horário</Label>
                      <Input
                        type="time"
                        value={novaHora}
                        onChange={(e) => setNovaHora(e.target.value)}
                        className="mt-1 bg-slate-900 border-slate-700"
                      />
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleConcluir}
                  disabled={saving}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white mt-2"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Salvar Resultado e Concluir Ação'
                  )}
                </Button>
              </div>
            )}

            {/* SEÇÃO CONCLUÍDA */}
            {evento && evento.status_acao === 'concluido' && (
              <div className="mt-6 pt-5 border-t border-slate-800 space-y-4">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                  <h4 className="font-semibold text-emerald-500 flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4" /> Ação Concluída
                  </h4>
                  <p className="text-sm text-slate-300">{evento.resultado_acao}</p>
                  <div className="mt-4 pt-3 border-t border-emerald-500/20 flex flex-col gap-1">
                    <p className="text-xs text-slate-400">
                      Concluído por:{' '}
                      <span className="text-slate-300 font-medium">
                        {evento.concluido_por_user?.nome || 'Desconhecido'}
                      </span>
                    </p>
                    <p className="text-xs text-slate-400">
                      Em:{' '}
                      <span className="text-slate-300">
                        {evento.concluido_em
                          ? format(new Date(evento.concluido_em), 'dd/MM/yyyy HH:mm')
                          : ''}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!evento && (
              <div className="pt-4 mt-2">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Agendar Ação Comercial'}
                </Button>
              </div>
            )}

            {evento && evento.status_acao === 'pendente' && (
              <div className="pt-2">
                <Button
                  onClick={handleApenasAtualizar}
                  variant="outline"
                  disabled={saving}
                  className="w-full border-slate-700 hover:bg-slate-800 text-white text-xs"
                >
                  Apenas Atualizar Dados da Ação (Sem Concluir)
                </Button>
              </div>
            )}
          </div>

          <div className="lg:border-l lg:border-slate-800 lg:pl-8 flex flex-col min-h-[400px]">
            <h3 className="font-semibold flex items-center gap-2 text-white border-b border-slate-800 pb-3 mb-4">
              <History className="w-4 h-4" /> Linha do Tempo (Histórico)
            </h3>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {loadingHistory ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-6 h-6 text-slate-500 animate-spin" />
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-10 opacity-50">
                  <History className="w-10 h-10 mx-auto mb-3 text-slate-500" />
                  <p className="text-sm text-slate-400">
                    Nenhum histórico encontrado para este contato.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {history.map((h, i) => (
                    <div key={i} className="relative pl-5 border-l border-slate-700 pb-2 last:pb-0">
                      <div className="absolute w-2.5 h-2.5 bg-amber-500 rounded-full -left-[5px] top-1 ring-4 ring-slate-900" />
                      <p className="text-xs text-amber-500 font-bold tracking-wide">
                        {format(new Date(h.date), 'dd/MM/yyyy HH:mm')}
                      </p>
                      <p className="text-sm text-slate-300 mt-1.5 leading-relaxed">{h.desc}</p>
                      <p className="text-[10px] uppercase font-semibold text-slate-500 mt-2 tracking-wider">
                        Por: {h.user}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

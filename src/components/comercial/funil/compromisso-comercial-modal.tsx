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
  RotateCcw,
  Ban,
  ShieldCheck,
  CalendarCheck,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { createCompromisso, updateCompromisso, Compromisso } from '@/services/compromissos'
import { registrarAgendaLog, fetchAgendaLogs, FunilAgendaLog } from '@/services/funil-agenda-logs'

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

  // Estados para reagendamento e cancelamento explícitos com carimbo
  const [mostrarReagendamentoDireto, setMostrarReagendamentoDireto] = useState(false)
  const [reagendamentoData, setReagendamentoData] = useState('')
  const [reagendamentoHora, setReagendamentoHora] = useState('')
  const [reagendamentoMotivo, setReagendamentoMotivo] = useState('')

  const [mostrarCancelamento, setMostrarCancelamento] = useState(false)
  const [motivoCancelamento, setMotivoCancelamento] = useState('')

  const [agendaLogs, setAgendaLogs] = useState<FunilAgendaLog[]>([])

  useEffect(() => {
    async function loadUsers() {
      // 1. Buscar apenas colaboradores com status 'ativo' em crc_comercial
      // e checar se seus usuários correspondentes também estão ativos em 'usuarios'.
      const [{ data: crcList }, { data: usuariosAtivos }] = await Promise.all([
        supabase
          .from('crc_comercial')
          .select('usuario_id, nome, status')
          .not('usuario_id', 'is', null),
        supabase.from('usuarios').select('id, nome, status').eq('status', 'ativo'),
      ])

      const idsUsuariosAtivos = new Set((usuariosAtivos || []).map((u) => u.id))

      // Filtrar apenas quem está ativo tanto em crc_comercial (status = 'ativo') quanto em usuarios
      let ativos = (crcList || []).filter((u) => {
        const isCrcAtivo = !u.status || u.status === 'ativo'
        const isUserAtivo = u.usuario_id && idsUsuariosAtivos.has(u.usuario_id)
        return isCrcAtivo && isUserAtivo
      })

      // Preservação: Se estamos editando um compromisso antigo (`evento`) cujo responsável
      // está atualmente inativo, ele deve continuar aparecendo na lista deste compromisso.
      if (evento?.usuario_id) {
        const jaEstaNaLista = ativos.some((u) => u.usuario_id === evento.usuario_id)
        if (!jaEstaNaLista) {
          const responsavelExistente = crcList?.find((u) => u.usuario_id === evento.usuario_id)
          if (responsavelExistente) {
            ativos = [
              { ...responsavelExistente, nome: `${responsavelExistente.nome} (Inativo)` },
              ...ativos,
            ]
          } else {
            // Caso não esteja em crc_comercial, busca o nome do usuario no próprio evento ou tabela usuarios
            const nomeInativo = evento.usuario?.nome || 'Responsável anterior (Inativo)'
            ativos = [
              { usuario_id: evento.usuario_id, nome: nomeInativo, status: 'inativo' },
              ...ativos,
            ]
          }
        }
      }

      setCrcUsers(ativos)
      if (!evento && ativos.find((u) => u.usuario_id === user?.id)) {
        setColaboradorId(user!.id)
      } else if (ativos.length > 0 && !evento) {
        setColaboradorId(ativos[0].usuario_id)
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
      setReagendamentoData(evento.data_inicio || format(new Date(), 'yyyy-MM-dd'))
      setReagendamentoHora(evento.hora_inicio?.substring(0, 5) || '')
    } else {
      setSelectedPerson(null)
      setDataAcao(format(new Date(), 'yyyy-MM-dd'))
      setHoraAcao('')
      setDescricao('')
      setResultado('')
      setAgendaLogs([])
      setMostrarReagendamentoDireto(false)
      setMostrarCancelamento(false)
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

    // 1. Carregar logs carimbados da tabela funil_agenda_logs (audit log imutável)
    const logsCompromisso = await fetchAgendaLogs({
      compromissoId: evento?.id || undefined,
      leadId: selectedPerson.type === 'lead' ? selectedPerson.id : undefined,
      pacienteId: selectedPerson.type === 'paciente' ? selectedPerson.id : undefined,
      limite: 100,
    })
    setAgendaLogs(logsCompromisso)

    // Se temos logs auditados na tabela imutável funil_agenda_logs para este compromisso ou contato,
    // converte para visualização rápida na timeline unificada
    if (logsCompromisso && logsCompromisso.length > 0) {
      logsCompromisso.forEach((l) => {
        let descricaoAcao = `[${l.acao}] ${l.detalhes || ''}`
        if (l.acao === 'REAGENDADO' && l.data_anterior && l.data_nova) {
          descricaoAcao = `📅 Reagendado de ${l.data_anterior} ➔ ${l.data_nova}${l.detalhes ? ` (${l.detalhes})` : ''}`
        } else if (l.acao === 'CRIADO') {
          descricaoAcao = `✨ Agendamento criado${l.data_nova ? ` para ${l.data_nova}` : ''}${l.detalhes ? `: ${l.detalhes}` : ''}`
        } else if (l.acao === 'CANCELADO') {
          descricaoAcao = `🚫 Agendamento cancelado${l.detalhes ? `: ${l.detalhes}` : ''}`
        } else if (l.acao === 'REATIVADO') {
          descricaoAcao = `🔄 Agendamento reativado${l.detalhes ? `: ${l.detalhes}` : ''}`
        }

        hist.push({
          id: l.id,
          date: l.criado_em,
          desc: descricaoAcao,
          user: l.usuario_nome,
          acao: l.acao,
          isAuditLog: true,
          dataAnterior: l.data_anterior,
          dataNova: l.data_nova,
        })
      })
    }

    if (selectedPerson.type === 'lead') {
      const { data: lh } = await supabase
        .from('funil_leads_historico')
        .select('*, usuario:usuarios(nome)')
        .eq('lead_id', selectedPerson.id)
        .order('criado_em', { ascending: false })

      if (lh) {
        hist.push(
          ...lh.map((h) => ({
            id: h.id,
            date: h.criado_em,
            desc: `${h.acao} ${h.detalhes ? '- ' + h.detalhes : ''}`,
            user: h.usuario?.nome || 'Sistema',
            isAuditLog: false,
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
            id: h.id,
            date: h.criado_em,
            desc: `${h.acao} ${h.detalhes ? '- ' + h.detalhes : ''}`,
            user: h.usuario?.nome || 'Sistema',
            isAuditLog: false,
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
      comps.forEach((c) => {
        // Se já não tiver log específico no funil_agenda_logs para este evento, adiciona marcador de criação
        const hasCreatedAudit = logsCompromisso.some(
          (l) => l.compromisso_id === c.id && l.acao === 'CRIADO',
        )
        if (!hasCreatedAudit && c.criado_em) {
          hist.push({
            id: `created-${c.id}`,
            date: c.criado_em,
            desc: `✨ Ação criada para ${c.data_inicio}${c.hora_inicio ? ` às ${c.hora_inicio.substring(0, 5)}` : ''}: ${c.descricao || 'Sem descrição'}`,
            user: c.usuario?.nome || 'Sistema',
            acao: 'CRIADO',
            isAuditLog: false,
          })
        }

        if (c.concluido_em) {
          hist.push({
            id: `concluido-${c.id}`,
            date: c.concluido_em,
            desc: `✅ Ação Concluída. Resultado: ${c.resultado_acao || 'Sem resultado detalhado'}`,
            user: c.concluido_por_user?.nome || c.usuario?.nome || 'Sistema',
            acao: 'CONCLUIDO',
            isAuditLog: false,
          })
        }
      })
    }

    // Ordenar estritamente cronológico decrescente (mais recente no topo)
    hist.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Deduplicar itens com mesma data aproximada e mesma descrição
    const seen = new Set<string>()
    const deduplicado = hist.filter((item) => {
      const key = `${item.date.substring(0, 19)}_${item.desc}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    setHistory(deduplicado)
    setLoadingHistory(false)
  }

  const userName = profile?.nome || user?.email || 'Usuário Atual'

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

        // Registrar carimbo de auditoria imutável
        await registrarAgendaLog({
          compromisso_id: evento.id,
          lead_id: selectedPerson.type === 'lead' ? selectedPerson.id : null,
          paciente_id: selectedPerson.type === 'paciente' ? selectedPerson.id : null,
          tipo: 'acao_comercial',
          acao: 'EDITADO',
          detalhes: resultado ? `Atualizado desfecho: ${resultado}` : `Edição de dados da ação`,
          dados_novos: baseCompromisso,
          usuario_id: user?.id || null,
          usuario_nome: userName,
        })
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

        setResultado('')
        setTimeout(() => resultadoRef.current?.focus(), 100)
      }

      toast({ title: 'Dados da ação atualizados e carimbados com sucesso!' })
      await loadHistory()
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
        data_original: dataAcao,
      }

      if (evento?.id) {
        await updateCompromisso(evento.id, baseCompromisso)
        await registrarAgendaLog({
          compromisso_id: evento.id,
          lead_id: selectedPerson.type === 'lead' ? selectedPerson.id : null,
          paciente_id: selectedPerson.type === 'paciente' ? selectedPerson.id : null,
          tipo: 'acao_comercial',
          acao: 'EDITADO',
          detalhes: `Ação atualizada: ${descricao || 'Sem descrição'}`,
          dados_novos: baseCompromisso,
          usuario_id: user?.id || null,
          usuario_nome: userName,
        })
        toast({ title: 'Ação atualizada com sucesso' })
      } else {
        const created = await createCompromisso(baseCompromisso)
        const formatDataAcao = horaAcao
          ? `${format(new Date(dataAcao + 'T12:00:00'), 'dd/MM/yyyy')} às ${horaAcao}`
          : format(new Date(dataAcao + 'T12:00:00'), 'dd/MM/yyyy')

        // Carimbo de criação imutável
        await registrarAgendaLog({
          compromisso_id: created?.id || null,
          lead_id: selectedPerson.type === 'lead' ? selectedPerson.id : null,
          paciente_id: selectedPerson.type === 'paciente' ? selectedPerson.id : null,
          tipo: 'acao_comercial',
          acao: 'CRIADO',
          data_nova: formatDataAcao,
          detalhes: descricao || 'Ação comercial agendada',
          dados_novos: baseCompromisso,
          usuario_id: user?.id || null,
          usuario_nome: userName,
        })
        toast({ title: 'Ação comercial agendada e carimbada com sucesso!' })
      }
      onSave()
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  // Executa Reagendamento com carimbo De -> Para
  const handleExecutarReagendamento = async () => {
    if (!evento?.id) return
    if (!reagendamentoData) {
      toast({ title: 'Informe a nova data para o reagendamento', variant: 'destructive' })
      return
    }

    setSaving(true)
    try {
      const dataAnteriorFormatada = evento.hora_inicio
        ? `${format(new Date(evento.data_inicio + 'T12:00:00'), 'dd/MM/yyyy')} às ${evento.hora_inicio.substring(0, 5)}`
        : format(new Date(evento.data_inicio + 'T12:00:00'), 'dd/MM/yyyy')

      const dataNovaFormatada = reagendamentoHora
        ? `${format(new Date(reagendamentoData + 'T12:00:00'), 'dd/MM/yyyy')} às ${reagendamentoHora}`
        : format(new Date(reagendamentoData + 'T12:00:00'), 'dd/MM/yyyy')

      // Atualiza o compromisso atual com a nova data e marca reagendado = true
      await updateCompromisso(evento.id, {
        data_inicio: reagendamentoData,
        data_fim: reagendamentoData,
        hora_inicio: reagendamentoHora ? `${reagendamentoHora}:00` : null,
        hora_fim: reagendamentoHora ? `${reagendamentoHora}:00` : null,
        eh_dia_inteiro: !reagendamentoHora,
        reagendado: true,
        data_original: evento.data_original || evento.data_inicio,
        status_acao: 'pendente',
      })

      // Registra carimbo imutável do reagendamento: data anterior -> nova data
      await registrarAgendaLog({
        compromisso_id: evento.id,
        lead_id: selectedPerson?.type === 'lead' ? selectedPerson.id : null,
        paciente_id: selectedPerson?.type === 'paciente' ? selectedPerson.id : null,
        tipo: 'acao_comercial',
        acao: 'REAGENDADO',
        data_anterior: dataAnteriorFormatada,
        data_nova: dataNovaFormatada,
        detalhes: reagendamentoMotivo.trim()
          ? `Reagendado de ${dataAnteriorFormatada} para ${dataNovaFormatada}. Motivo: ${reagendamentoMotivo}`
          : `Reagendado de ${dataAnteriorFormatada} para ${dataNovaFormatada}`,
        dados_anteriores: { data_inicio: evento.data_inicio, hora_inicio: evento.hora_inicio },
        dados_novos: { data_inicio: reagendamentoData, hora_inicio: reagendamentoHora },
        usuario_id: user?.id || null,
        usuario_nome: userName,
      })

      toast({
        title: 'Reagendamento carimbado com sucesso!',
        description: `${dataAnteriorFormatada} ➔ ${dataNovaFormatada}`,
      })

      setMostrarReagendamentoDireto(false)
      onSave()
    } catch (err: any) {
      toast({ title: 'Erro ao reagendar', description: err.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  // Executa Cancelamento com carimbo imutável
  const handleExecutarCancelamento = async () => {
    if (!evento?.id) return
    if (!motivoCancelamento.trim()) {
      toast({
        title: 'Informe o motivo do cancelamento para registrar o carimbo',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const dataAcaoFormatada = evento.hora_inicio
        ? `${format(new Date(evento.data_inicio + 'T12:00:00'), 'dd/MM/yyyy')} às ${evento.hora_inicio.substring(0, 5)}`
        : format(new Date(evento.data_inicio + 'T12:00:00'), 'dd/MM/yyyy')

      await updateCompromisso(evento.id, {
        status_acao: 'cancelado',
        cancelado_em: new Date().toISOString(),
        cancelado_por: user?.id || null,
        motivo_cancelamento: motivoCancelamento.trim(),
      })

      // Registra carimbo imutável de cancelamento
      await registrarAgendaLog({
        compromisso_id: evento.id,
        lead_id: selectedPerson?.type === 'lead' ? selectedPerson.id : null,
        paciente_id: selectedPerson?.type === 'paciente' ? selectedPerson.id : null,
        tipo: 'acao_comercial',
        acao: 'CANCELADO',
        data_anterior: dataAcaoFormatada,
        detalhes: `Agendamento cancelado. Motivo: ${motivoCancelamento.trim()}`,
        usuario_id: user?.id || null,
        usuario_nome: userName,
      })

      toast({ title: 'Agendamento cancelado e carimbado no histórico' })
      setMostrarCancelamento(false)
      onSave()
    } catch (err: any) {
      toast({
        title: 'Erro ao cancelar compromisso',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  // Reativar ação cancelada com carimbo
  const handleReativar = async () => {
    if (!evento?.id) return
    setSaving(true)
    try {
      await updateCompromisso(evento.id, {
        status_acao: 'pendente',
        cancelado_em: null,
        cancelado_por: null,
      })

      await registrarAgendaLog({
        compromisso_id: evento.id,
        lead_id: selectedPerson?.type === 'lead' ? selectedPerson.id : null,
        paciente_id: selectedPerson?.type === 'paciente' ? selectedPerson.id : null,
        tipo: 'acao_comercial',
        acao: 'REATIVADO',
        detalhes: `Compromisso reativado para execução na agenda`,
        usuario_id: user?.id || null,
        usuario_nome: userName,
      })

      toast({ title: 'Agendamento reativado com sucesso!' })
      onSave()
    } catch (err: any) {
      toast({ title: 'Erro ao reativar', description: err.message, variant: 'destructive' })
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
      const agoraIso = new Date().toISOString()
      await updateCompromisso(evento!.id, {
        status_acao: 'concluido',
        resultado_acao: resultado,
        concluido_em: agoraIso,
        concluido_por: user!.id,
      })

      // Carimbo de conclusão
      await registrarAgendaLog({
        compromisso_id: evento!.id,
        lead_id: selectedPerson.type === 'lead' ? selectedPerson.id : null,
        paciente_id: selectedPerson.type === 'paciente' ? selectedPerson.id : null,
        tipo: 'acao_comercial',
        acao: 'CONCLUIDO',
        detalhes: `Concluído: ${resultado}`,
        usuario_id: user?.id || null,
        usuario_nome: userName,
      })

      if (reagendar) {
        const novoComp = await createCompromisso({
          usuario_id: colaboradorId,
          tipo_compromisso: 'acao_comercial' as const,
          data_inicio: novaData,
          data_fim: novaData,
          hora_inicio: novaHora ? `${novaHora}:00` : null,
          hora_fim: novaHora ? `${novaHora}:00` : null,
          eh_dia_inteiro: !novaHora,
          descricao: `Follow-up. Desfecho anterior: ${resultado}`,
          setor: 'comercial',
          lead_id: selectedPerson.type === 'lead' ? selectedPerson.id : null,
          paciente_id: selectedPerson.type === 'paciente' ? selectedPerson.id : null,
          reagendado: true,
          data_original: evento?.data_inicio,
        })

        const dataAnteriorStr = evento?.hora_inicio
          ? `${format(new Date(evento.data_inicio + 'T12:00:00'), 'dd/MM/yyyy')} às ${evento.hora_inicio.substring(0, 5)}`
          : format(new Date(evento!.data_inicio + 'T12:00:00'), 'dd/MM/yyyy')

        const dataNovaStr = novaHora
          ? `${format(new Date(novaData + 'T12:00:00'), 'dd/MM/yyyy')} às ${novaHora}`
          : format(new Date(novaData + 'T12:00:00'), 'dd/MM/yyyy')

        // Carimbo de reagendamento / novo agendamento
        await registrarAgendaLog({
          compromisso_id: novoComp?.id || null,
          lead_id: selectedPerson.type === 'lead' ? selectedPerson.id : null,
          paciente_id: selectedPerson.type === 'paciente' ? selectedPerson.id : null,
          tipo: 'acao_comercial',
          acao: 'REAGENDADO',
          data_anterior: dataAnteriorStr,
          data_nova: dataNovaStr,
          detalhes: `Reagendado a partir de ação concluída: ${resultado}`,
          usuario_id: user?.id || null,
          usuario_nome: userName,
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <DialogTitle className="text-xl flex items-center gap-2">
                {evento
                  ? evento.status_acao === 'cancelado'
                    ? 'Ação Comercial Cancelada'
                    : evento.status_acao === 'concluido'
                      ? 'Ação Comercial Concluída'
                      : 'Executar Ação Comercial'
                  : 'Nova Ação Comercial'}
                {evento?.status_acao === 'cancelado' && (
                  <Badge
                    variant="outline"
                    className="bg-red-500/15 text-red-400 border-red-500/30 text-xs"
                  >
                    Cancelado
                  </Badge>
                )}
                {evento?.reagendado && (
                  <Badge
                    variant="outline"
                    className="bg-blue-500/15 text-blue-300 border-blue-500/30 text-xs"
                  >
                    Reagendado
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                {evento
                  ? 'Consulte o histórico carimbado, atualize o desfecho, reagende ou cancele esta ação.'
                  : 'Agende uma nova ação de contato para a equipe com carimbo imutável de auditoria.'}
              </DialogDescription>
            </div>

            {/* Carimbo de Criação Imutável Destacado no Topo do Modal */}
            {evento?.criado_em && (
              <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <div className="text-[11px] leading-tight">
                  <span className="text-slate-400 block">Carimbo de Criação:</span>
                  <span className="font-mono font-bold text-amber-300">
                    {format(new Date(evento.criado_em), "dd/MM/yyyy 'às' HH:mm")}
                  </span>
                </div>
              </div>
            )}
          </div>
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
                  disabled={
                    evento?.status_acao === 'concluido' || evento?.status_acao === 'cancelado'
                  }
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
                  disabled={
                    evento?.status_acao === 'concluido' || evento?.status_acao === 'cancelado'
                  }
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
                disabled={
                  evento?.status_acao === 'concluido' || evento?.status_acao === 'cancelado'
                }
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
                disabled={
                  evento?.status_acao === 'concluido' || evento?.status_acao === 'cancelado'
                }
                className="mt-1 bg-slate-950 border-slate-800 resize-none h-20"
              />
            </div>

            {/* SEÇÃO ESPECIAL DE AÇÕES CARIMBADAS: REAGENDAR E CANCELAR (Se Pendente) */}
            {evento && evento.status_acao === 'pendente' && (
              <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMostrarReagendamentoDireto(!mostrarReagendamentoDireto)
                      setMostrarCancelamento(false)
                    }}
                    className={cn(
                      'flex-1 text-xs border-blue-500/30 hover:bg-blue-500/10 text-blue-300',
                      mostrarReagendamentoDireto && 'bg-blue-500/20 border-blue-500',
                    )}
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
                    Reagendar Ação (Carimbar)
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMostrarCancelamento(!mostrarCancelamento)
                      setMostrarReagendamentoDireto(false)
                    }}
                    className={cn(
                      'flex-1 text-xs border-red-500/30 hover:bg-red-500/10 text-red-300',
                      mostrarCancelamento && 'bg-red-500/20 border-red-500',
                    )}
                  >
                    <Ban className="w-3.5 h-3.5 mr-1.5 text-red-400" />
                    Cancelar Ação (Carimbar)
                  </Button>
                </div>

                {/* Sub-painel: Execução de Reagendamento */}
                {mostrarReagendamentoDireto && (
                  <div className="bg-slate-950 p-4 rounded-lg border border-blue-500/40 space-y-3 mt-1 animate-fade-in">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reagendar Compromisso (Registrar De ➔ Para)
                    </h5>
                    <div className="text-[11px] text-slate-400">
                      Data atual carimbada:{' '}
                      <strong className="text-slate-200">
                        {format(new Date(evento.data_inicio + 'T12:00:00'), 'dd/MM/yyyy')}
                        {evento.hora_inicio ? ` às ${evento.hora_inicio.substring(0, 5)}` : ''}
                      </strong>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Nova Data *</Label>
                        <Input
                          type="date"
                          value={reagendamentoData}
                          onChange={(e) => setReagendamentoData(e.target.value)}
                          className="mt-1 bg-slate-900 border-slate-700 h-8 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Novo Horário</Label>
                        <Input
                          type="time"
                          value={reagendamentoHora}
                          onChange={(e) => setReagendamentoHora(e.target.value)}
                          className="mt-1 bg-slate-900 border-slate-700 h-8 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">Motivo do Reagendamento (opcional)</Label>
                      <Input
                        value={reagendamentoMotivo}
                        onChange={(e) => setReagendamentoMotivo(e.target.value)}
                        placeholder="Ex: Paciente solicitou remarcar para próxima semana"
                        className="mt-1 bg-slate-900 border-slate-700 h-8 text-xs"
                      />
                    </div>

                    <div className="flex gap-2 pt-1">
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleExecutarReagendamento}
                        disabled={saving}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs h-8"
                      >
                        {saving ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          'Confirmar e Carimbar Reagendamento'
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setMostrarReagendamentoDireto(false)}
                        className="text-xs h-8 text-slate-400"
                      >
                        Fechar
                      </Button>
                    </div>
                  </div>
                )}

                {/* Sub-painel: Execução de Cancelamento */}
                {mostrarCancelamento && (
                  <div className="bg-slate-950 p-4 rounded-lg border border-red-500/40 space-y-3 mt-1 animate-fade-in">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                      <Ban className="w-3.5 h-3.5" />
                      Cancelar Compromisso
                    </h5>
                    <div>
                      <Label className="text-xs">Motivo do Cancelamento *</Label>
                      <Textarea
                        value={motivoCancelamento}
                        onChange={(e) => setMotivoCancelamento(e.target.value)}
                        placeholder="Descreva o motivo do cancelamento para registro imutável em auditoria..."
                        className="mt-1 bg-slate-900 border-slate-700 text-xs min-h-[60px]"
                      />
                    </div>

                    <div className="flex gap-2 pt-1">
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleExecutarCancelamento}
                        disabled={saving}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs h-8"
                      >
                        {saving ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          'Confirmar e Carimbar Cancelamento'
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setMostrarCancelamento(false)}
                        className="text-xs h-8 text-slate-400"
                      >
                        Fechar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SEÇÃO QUANDO JÁ ESTÁ CANCELADO */}
            {evento && evento.status_acao === 'cancelado' && (
              <div className="mt-4 p-4 rounded-lg bg-red-950/30 border border-red-900/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                    <Ban className="w-4 h-4 text-red-400" />
                    Compromisso Cancelado
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleReativar}
                    disabled={saving}
                    className="text-xs h-7 border-slate-700 hover:bg-slate-800 text-slate-200"
                  >
                    Reativar Ação
                  </Button>
                </div>
                {evento.motivo_cancelamento && (
                  <p className="text-xs text-slate-300">
                    <strong className="text-slate-400">Motivo:</strong> {evento.motivo_cancelamento}
                  </p>
                )}
                {evento.cancelado_em && (
                  <p className="text-[11px] text-slate-400">
                    Cancelado em {format(new Date(evento.cancelado_em), "dd/MM/yyyy 'às' HH:mm")}
                  </p>
                )}
              </div>
            )}

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
            <div className="border-b border-slate-800 pb-3 mb-4 flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2 text-white text-base">
                <History className="w-4 h-4 text-amber-500" />
                Histórico Carimbado (Auditoria)
              </h3>
              <Badge
                variant="outline"
                className="text-[10px] uppercase bg-amber-500/10 text-amber-400 border-amber-500/20"
              >
                Imutável
              </Badge>
            </div>

            {/* Informações carimbadas em destaque do compromisso */}
            {evento && (
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 mb-4 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-500 flex items-center gap-1 font-mono text-[11px]">
                    <Clock className="w-3 h-3 text-amber-500" /> Carimbo de Criação:
                  </span>
                  <span className="font-mono font-bold text-amber-400">
                    {evento.criado_em
                      ? format(new Date(evento.criado_em), "dd/MM/yyyy 'às' HH:mm:ss")
                      : 'Data do sistema'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-500 flex items-center gap-1 font-mono text-[11px]">
                    <User className="w-3 h-3 text-amber-500" /> Criado por / Responsável:
                  </span>
                  <span className="font-medium text-slate-200">
                    {evento.usuario?.nome || 'Sistema'}
                  </span>
                </div>

                {evento.data_original && evento.data_original !== evento.data_inicio && (
                  <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-slate-800/80">
                    <span className="text-slate-500 flex items-center gap-1 font-mono text-[11px]">
                      <RotateCcw className="w-3 h-3 text-blue-400" /> Data Inicial:
                    </span>
                    <span className="font-mono text-slate-400 line-through">
                      {format(new Date(evento.data_original + 'T12:00:00'), 'dd/MM/yyyy')}
                    </span>
                  </div>
                )}
              </div>
            )}

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
                <div className="space-y-4">
                  {history.map((h, i) => {
                    const isReagendamento = h.acao === 'REAGENDADO'
                    const isCancelamento = h.acao === 'CANCELADO'
                    const isCriacao = h.acao === 'CRIADO'
                    const isConclusao = h.acao === 'CONCLUIDO'

                    return (
                      <div
                        key={h.id || i}
                        className={cn(
                          'relative pl-5 border-l pb-3 last:pb-0 transition-colors',
                          isCancelamento
                            ? 'border-red-600/60'
                            : isReagendamento
                              ? 'border-blue-500/60'
                              : isConclusao
                                ? 'border-emerald-500/60'
                                : 'border-amber-500/60',
                        )}
                      >
                        {/* Ponto / Ícone no timeline */}
                        <div
                          className={cn(
                            'absolute w-2.5 h-2.5 rounded-full -left-[5px] top-1 ring-4 ring-slate-900',
                            isCancelamento
                              ? 'bg-red-500'
                              : isReagendamento
                                ? 'bg-blue-400'
                                : isConclusao
                                  ? 'bg-emerald-400'
                                  : 'bg-amber-500',
                          )}
                        />

                        {/* Cabeçalho do evento com Data e Hora exatas */}
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={cn(
                              'text-xs font-bold tracking-wide font-mono flex items-center gap-1',
                              isCancelamento
                                ? 'text-red-400'
                                : isReagendamento
                                  ? 'text-blue-300'
                                  : isConclusao
                                    ? 'text-emerald-400'
                                    : 'text-amber-400',
                            )}
                          >
                            <Clock className="w-3 h-3 inline" />
                            {(() => {
                              try {
                                return format(new Date(h.date), "dd/MM/yyyy 'às' HH:mm:ss")
                              } catch {
                                return h.date
                              }
                            })()}
                          </p>

                          {h.acao && (
                            <span
                              className={cn(
                                'text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded border',
                                isCancelamento
                                  ? 'bg-red-500/10 text-red-300 border-red-500/30'
                                  : isReagendamento
                                    ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                                    : isConclusao
                                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                      : 'bg-amber-500/10 text-amber-300 border-amber-500/30',
                              )}
                            >
                              {h.acao}
                            </span>
                          )}
                        </div>

                        {/* Descrição carimbada */}
                        <p className="text-xs text-slate-200 mt-1 leading-relaxed bg-slate-950/70 p-2 rounded border border-slate-800">
                          {h.desc}
                        </p>

                        {/* Usuário que executou */}
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 px-0.5">
                          <span className="font-semibold text-slate-300 flex items-center gap-1">
                            <User className="w-3 h-3 text-amber-500/80" />
                            {h.user}
                          </span>
                          {h.isAuditLog && (
                            <span className="text-[9px] uppercase tracking-wider text-slate-500">
                              🔒 Registro gravado no banco
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

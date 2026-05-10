import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Send, History, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function LeadDialog({
  open,
  onOpenChange,
  leadData,
  origens,
  etapas,
  temperaturas,
  onSaved,
  mesReferencia,
}: any) {
  const { user } = useAuth()
  const [tab, setTab] = useState<'dados' | 'notas' | 'historico'>('dados')
  const [loading, setLoading] = useState(false)
  const [searchingPhone, setSearchingPhone] = useState(false)
  const [pacienteInfo, setPacienteInfo] = useState('')

  const [initialData, setInitialData] = useState<any>(null)
  const [formData, setFormData] = useState({
    id: '',
    nome: '',
    telefone: '',
    email: '',
    origem_id: '',
    temperatura: 'frio',
    status: 'novo',
    data_proximo_contato: '',
    descricao: '',
    criado_em: new Date().toISOString(),
  })

  const [notas, setNotas] = useState<any[]>([])
  const [novaNota, setNovaNota] = useState('')
  const [historico, setHistorico] = useState<any[]>([])

  useEffect(() => {
    if (open && leadData) {
      const data = {
        id: leadData.id || '',
        nome: leadData.nome || '',
        telefone: leadData.telefone || '',
        email: leadData.email || '',
        origem_id: leadData.origem_id || origens?.find((o: any) => o.ativo)?.id || '',
        temperatura:
          leadData.temperatura || temperaturas?.find((t: any) => t.ativo)?.slug || 'frio',
        status: leadData.status || etapas?.find((e: any) => e.ativo)?.slug || 'novo',
        data_proximo_contato: leadData.data_proximo_contato
          ? leadData.data_proximo_contato.substring(0, 16)
          : '',
        descricao: leadData.descricao || '',
        criado_em: leadData.criado_em || new Date().toISOString(),
      }
      setFormData(data)
      setInitialData(data)
      setTab('dados')
      setPacienteInfo('')
      if (leadData.id) {
        fetchNotasAndHistorico(leadData.id)
      } else {
        setNotas([])
        setHistorico([])
      }
    }
  }, [open, leadData])

  const fetchNotasAndHistorico = async (id: string) => {
    const [{ data: nData }, { data: hData }] = await Promise.all([
      supabase
        .from('funil_leads_notas')
        .select('*, usuario:usuarios(nome)')
        .eq('lead_id', id)
        .order('criado_em', { ascending: false }),
      supabase
        .from('funil_leads_historico')
        .select('*, usuario:usuarios(nome)')
        .eq('lead_id', id)
        .order('criado_em', { ascending: false }),
    ])
    setNotas(nData || [])
    setHistorico(hData || [])
  }

  const handlePhoneSearch = async () => {
    if (!formData.telefone) return
    const cleanPhone = formData.telefone.replace(/\D/g, '')
    if (cleanPhone.length < 8) return

    setSearchingPhone(true)
    setPacienteInfo('')
    try {
      const searchSuffix = cleanPhone.slice(-8)
      const wildcardSearch = '%' + searchSuffix.split('').join('%') + '%'

      const { data: pacs } = await supabase
        .from('pacientes')
        .select('nome, telefone')
        .ilike('telefone', wildcardSearch)
      const pac = pacs?.find((p) => p.telefone?.replace(/\D/g, '').endsWith(searchSuffix))

      if (pac) {
        setFormData((prev) => ({ ...prev, nome: pac.nome }))
        setPacienteInfo('Paciente encontrado')
      } else {
        const { data: leads } = await supabase
          .from('funil_leads')
          .select('nome, telefone')
          .ilike('telefone', wildcardSearch)
          .order('criado_em', { ascending: false })
        const lead = leads?.find((l) => l.telefone?.replace(/\D/g, '').endsWith(searchSuffix))
        if (lead) {
          setFormData((prev) => ({ ...prev, nome: lead.nome }))
          setPacienteInfo('Lead encontrado no funil')
        } else {
          setPacienteInfo('Novo paciente')
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSearchingPhone(false)
    }
  }

  const handleSaveDados = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nome || !formData.origem_id) {
      toast.error('Nome e Origem são obrigatórios')
      return
    }

    setLoading(true)
    try {
      const payload = {
        nome: formData.nome,
        telefone: formData.telefone,
        email: formData.email,
        origem_id: formData.origem_id,
        temperatura: formData.temperatura,
        status: formData.status,
        descricao: formData.descricao,
        data_proximo_contato: formData.data_proximo_contato
          ? new Date(formData.data_proximo_contato).toISOString()
          : null,
        mes_referencia: mesReferencia || leadData?.mes_referencia || format(new Date(), 'yyyy-MM'),
      }

      let newId = formData.id
      const isNew = !formData.id

      if (isNew) {
        const { data, error } = await supabase
          .from('funil_leads')
          .insert([payload])
          .select()
          .single()
        if (error) throw error
        newId = data.id
        if (user) {
          await supabase.from('funil_leads_historico').insert([
            {
              lead_id: newId,
              usuario_id: user.id,
              acao: 'Criação de Lead',
              detalhes: 'Lead registrado no funil',
            },
          ])
        }
        toast.success('Lead criado com sucesso')
      } else {
        const { error } = await supabase.from('funil_leads').update(payload).eq('id', newId)
        if (error) throw error

        if (user) {
          const mudancas: string[] = []

          if (initialData.nome !== formData.nome)
            mudancas.push(`Nome: de "${initialData.nome}" para "${formData.nome}"`)
          if (initialData.telefone !== formData.telefone) mudancas.push(`Telefone atualizado`)
          if (initialData.email !== formData.email) mudancas.push(`Email atualizado`)
          if (initialData.descricao !== formData.descricao) mudancas.push(`Observações atualizadas`)

          if (initialData.origem_id !== formData.origem_id) {
            const oldOrigem = origens?.find((o: any) => o.id === initialData.origem_id)?.nome
            const newOrigem = origens?.find((o: any) => o.id === formData.origem_id)?.nome
            mudancas.push(`Origem: de "${oldOrigem}" para "${newOrigem}"`)
          }

          if (initialData.temperatura !== formData.temperatura) {
            const oldTemp = temperaturas?.find((t: any) => t.slug === initialData.temperatura)?.nome
            const newTemp = temperaturas?.find((t: any) => t.slug === formData.temperatura)?.nome
            mudancas.push(`Temperatura: de "${oldTemp}" para "${newTemp}"`)
          }

          if (initialData.status !== formData.status) {
            const oldStatus = etapas?.find((e: any) => e.slug === initialData.status)?.nome
            const newStatus = etapas?.find((e: any) => e.slug === formData.status)?.nome
            mudancas.push(`Status: de "${oldStatus}" para "${newStatus}"`)
          }

          if (initialData.data_proximo_contato !== formData.data_proximo_contato) {
            const dateStr = formData.data_proximo_contato
              ? format(new Date(formData.data_proximo_contato), 'dd/MM/yyyy HH:mm')
              : 'Removido'
            mudancas.push(`Próximo Contato: ${dateStr}`)
          }

          if (mudancas.length > 0) {
            await supabase.from('funil_leads_historico').insert([
              {
                lead_id: newId,
                usuario_id: user.id,
                acao: 'Atualização de Dados',
                detalhes: mudancas.join(' | '),
              },
            ])
          }
        }
        toast.success('Lead atualizado com sucesso')
      }

      onSaved({ id: newId, ...payload })
    } catch (err: any) {
      toast.error('Erro: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddNota = async () => {
    if (!novaNota.trim() || !formData.id || !user) return
    setLoading(true)
    try {
      await supabase.from('funil_leads_notas').insert([
        {
          lead_id: formData.id,
          usuario_id: user.id,
          nota: novaNota.trim(),
        },
      ])

      await supabase.from('funil_leads_historico').insert([
        {
          lead_id: formData.id,
          usuario_id: user.id,
          acao: 'Nova Nota Adicionada',
          detalhes: novaNota.trim(),
        },
      ])

      setNovaNota('')
      fetchNotasAndHistorico(formData.id)
      toast.success('Nota registrada')
    } catch (err: any) {
      toast.error('Erro: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[500px] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl">
            {formData.id || initialData?.nome ? 'Gerenciar Lead' : 'Novo Lead'}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6">
          {formData.id && (
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-5">
              <button
                onClick={() => setTab('dados')}
                className={cn(
                  'px-4 py-1.5 text-sm font-semibold rounded-md transition-colors',
                  tab === 'dados'
                    ? 'bg-amber-500 text-amber-950'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white',
                )}
              >
                Dados
              </button>
              <button
                onClick={() => setTab('notas')}
                className={cn(
                  'px-4 py-1.5 text-sm font-semibold rounded-md transition-colors',
                  tab === 'notas'
                    ? 'bg-amber-500 text-amber-950'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white',
                )}
              >
                Notas <span className="opacity-70 ml-1">({notas.length})</span>
              </button>
              <button
                onClick={() => setTab('historico')}
                className={cn(
                  'px-4 py-1.5 text-sm font-semibold rounded-md transition-colors',
                  tab === 'historico'
                    ? 'bg-amber-500 text-amber-950'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white',
                )}
              >
                Histórico
              </button>
            </div>
          )}

          {tab === 'dados' && (
            <form onSubmit={handleSaveDados} className="space-y-5">
              <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Data de Inclusão:</span>
                <span className="text-sm font-bold text-white">
                  {format(new Date(formData.criado_em), 'dd/MM/yyyy HH:mm')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Telefone *</Label>
                  <div className="relative">
                    <Input
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      onBlur={handlePhoneSearch}
                      className="bg-slate-950 border-slate-800 focus-visible:ring-amber-500 text-white"
                      placeholder="(00) 00000-0000"
                      required
                      autoFocus={!formData.id}
                    />
                    {searchingPhone && (
                      <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-amber-500" />
                    )}
                  </div>
                  {pacienteInfo && (
                    <span
                      className={cn(
                        'text-xs font-semibold px-2 py-1 rounded-md inline-block',
                        pacienteInfo === 'Novo paciente'
                          ? 'text-amber-500 bg-amber-500/10'
                          : 'text-emerald-500 bg-emerald-500/10',
                      )}
                    >
                      {pacienteInfo}
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Nome do Lead *</Label>
                  <Input
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="bg-slate-950 border-slate-800 focus-visible:ring-amber-500 font-medium text-white"
                    placeholder="Ex: João Silva"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Origem *</Label>
                  <Select
                    value={formData.origem_id}
                    onValueChange={(v) => setFormData({ ...formData, origem_id: v })}
                  >
                    <SelectTrigger className="bg-slate-950 border-slate-800 focus:ring-amber-500 text-white">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white">
                      {origens
                        ?.filter((o: any) => o.ativo)
                        .map((o: any) => (
                          <SelectItem key={o.id} value={o.id}>
                            {o.nome}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Temperatura</Label>
                  <Select
                    value={formData.temperatura}
                    onValueChange={(v) => setFormData({ ...formData, temperatura: v })}
                  >
                    <SelectTrigger className="bg-slate-950 border-slate-800 focus:ring-amber-500 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white">
                      {temperaturas
                        ?.filter((t: any) => t.ativo)
                        .map((t: any) => (
                          <SelectItem key={t.slug} value={t.slug}>
                            {t.nome}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => setFormData({ ...formData, status: v })}
                  >
                    <SelectTrigger className="bg-slate-950 border-slate-800 focus:ring-amber-500 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white">
                      {etapas
                        ?.filter((e: any) => e.ativo)
                        .map((col: any) => (
                          <SelectItem key={col.slug} value={col.slug}>
                            {col.nome}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Próximo Contato</Label>
                  <Input
                    type="datetime-local"
                    value={formData.data_proximo_contato}
                    onChange={(e) =>
                      setFormData({ ...formData, data_proximo_contato: e.target.value })
                    }
                    className="bg-slate-950 border-slate-800 focus-visible:ring-amber-500 text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-slate-950 border-slate-800 focus-visible:ring-amber-500 text-white"
                  placeholder="exemplo@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Observações</Label>
                <Textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="bg-slate-950 border-slate-800 focus-visible:ring-amber-500 text-white min-h-[80px]"
                  placeholder="Detalhes adicionais..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  className="hover:bg-slate-800 hover:text-white"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !formData.nome || !formData.origem_id}
                  className="bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold px-6"
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Salvar Lead
                </Button>
              </div>
            </form>
          )}

          {tab === 'notas' && (
            <div className="flex flex-col h-[350px]">
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 custom-scrollbar">
                {notas.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
                    <CheckCircle className="w-12 h-12 mb-3" />
                    <p className="font-medium">Nenhuma nota registrada.</p>
                    <p className="text-sm">Adicione detalhes dos atendimentos abaixo.</p>
                  </div>
                ) : (
                  notas.map((n) => (
                    <div
                      key={n.id}
                      className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded">
                          {n.usuario?.nome || 'Sistema'}
                        </span>
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-900 px-2 py-0.5 rounded">
                          {format(new Date(n.criado_em), 'dd/MM/yyyy HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {n.nota}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <div className="relative pt-2 border-t border-slate-800">
                <Textarea
                  value={novaNota}
                  onChange={(e) => setNovaNota(e.target.value)}
                  placeholder="Digite os detalhes do contato com o paciente..."
                  className="bg-slate-950 border-slate-800 focus-visible:ring-amber-500 text-white pr-12 min-h-[90px] resize-none"
                />
                <Button
                  onClick={handleAddNota}
                  disabled={!novaNota.trim() || loading}
                  size="icon"
                  className="absolute bottom-2 right-2 h-8 w-8 bg-amber-500 hover:bg-amber-600 text-amber-950 rounded"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {tab === 'historico' && (
            <div className="overflow-y-auto h-[350px] pr-4 custom-scrollbar">
              {historico.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
                  <History className="w-12 h-12 mb-3" />
                  <p className="font-medium">Nenhum evento registrado.</p>
                </div>
              ) : (
                <div className="relative border-l-2 border-slate-800 ml-3 space-y-8 py-2">
                  {historico.map((h) => (
                    <div key={h.id} className="relative pl-6">
                      <div className="absolute -left-[9px] top-1 w-4 h-4 bg-slate-900 border-2 border-amber-500 rounded-full" />
                      <p className="text-xs font-bold text-slate-200">{h.acao}</p>
                      <p className="text-sm text-slate-400 mt-1">{h.detalhes}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded">
                          {h.usuario?.nome || 'Sistema'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium bg-slate-800 px-2 py-0.5 rounded">
                          {format(new Date(h.criado_em), 'dd/MM/yy HH:mm')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Loader2,
  Plus,
  Edit2,
  Trash2,
  Briefcase,
  Users,
  LayoutList,
  CheckSquare,
} from 'lucide-react'
import { toast } from 'sonner'

export default function Onboarding() {
  const { user, profile } = useAuth()
  const isAdmin = profile?.role === 'admin'
  const [etapas, setEtapas] = useState<any[]>([])
  const [tarefas, setTarefas] = useState<any[]>([])
  const [progresso, setProgresso] = useState<any[]>([])
  const [cargos, setCargos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [eModal, setEModal] = useState(false)
  const [eForm, setEForm] = useState<any>({})
  const [tModal, setTModal] = useState(false)
  const [tForm, setTForm] = useState<any>({})
  const [cargosModal, setCargosModal] = useState(false)
  const [novoCargo, setNovoCargo] = useState('')
  const [editandoCargo, setEditandoCargo] = useState<string | null>(null)
  const [nomeEditadoCargo, setNomeEditadoCargo] = useState('')

  const fetchD = async () => {
    if (!user) return
    const [re, rt, rp, rc] = await Promise.all([
      supabase.from('intranet_onboarding_etapas').select('*').order('dia').order('ordem'),
      supabase.from('intranet_onboarding_tarefas').select('*').order('ordem'),
      supabase.from('intranet_onboarding_progresso').select('*').eq('usuario_id', user.id),
      supabase.from('cargos').select('*').order('nome'),
    ])
    setEtapas(re.data || [])
    setTarefas(rt.data || [])
    setProgresso(rp.data || [])
    setCargos(rc.data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchD()
  }, [user])

  const toggleT = async (tId: string, c: boolean) => {
    if (!user) return
    const prev = progresso.find((p) => p.tarefa_id === tId)
    if (prev)
      await supabase
        .from('intranet_onboarding_progresso')
        .update({ concluido: c })
        .eq('id', prev.id)
    else
      await supabase
        .from('intranet_onboarding_progresso')
        .insert({ usuario_id: user.id, tarefa_id: tId, concluido: c })
    fetchD()
  }

  const saveE = async () => {
    const data = {
      titulo: eForm.titulo,
      descricao: eForm.descricao,
      dia: eForm.dia,
      ordem: eForm.ordem,
      cargo_id: eForm.cargo_id === 'geral' ? null : eForm.cargo_id,
    }
    if (eForm.id) await supabase.from('intranet_onboarding_etapas').update(data).eq('id', eForm.id)
    else await supabase.from('intranet_onboarding_etapas').insert(data)
    setEModal(false)
    fetchD()
    toast.success('Etapa salva com sucesso!')
  }

  const delE = async (id: string) => {
    if (confirm('Excluir etapa e todas as suas tarefas?')) {
      await supabase.from('intranet_onboarding_etapas').delete().eq('id', id)
      fetchD()
    }
  }

  const saveT = async () => {
    const data = {
      titulo: tForm.titulo,
      descricao: tForm.descricao,
      ordem: tForm.ordem,
      etapa_id: tForm.etapa_id,
    }
    if (tForm.id) await supabase.from('intranet_onboarding_tarefas').update(data).eq('id', tForm.id)
    else await supabase.from('intranet_onboarding_tarefas').insert(data)
    setTModal(false)
    fetchD()
    toast.success('Tarefa salva com sucesso!')
  }

  const delT = async (id: string) => {
    if (confirm('Excluir tarefa?')) {
      await supabase.from('intranet_onboarding_tarefas').delete().eq('id', id)
      fetchD()
    }
  }

  const handleCreateCargo = async () => {
    if (!novoCargo.trim()) return
    const { error } = await supabase.from('cargos').insert({ nome: novoCargo.trim() })
    if (!error) {
      toast.success('Função criada com sucesso!')
      setNovoCargo('')
      fetchD()
    } else {
      toast.error('Erro ao criar função')
    }
  }

  const handleUpdateCargo = async (id: string) => {
    if (!nomeEditadoCargo.trim()) return
    const { error } = await supabase
      .from('cargos')
      .update({ nome: nomeEditadoCargo.trim() })
      .eq('id', id)
    if (!error) {
      toast.success('Função atualizada com sucesso!')
      setEditandoCargo(null)
      fetchD()
    } else {
      toast.error('Erro ao atualizar função')
    }
  }

  const handleDeleteCargo = async (id: string) => {
    if (confirm('Excluir função? Isso pode afetar usuários vinculados.')) {
      await supabase.from('cargos').delete().eq('id', id)
      toast.success('Função excluída!')
      fetchD()
    }
  }

  const userCargos = useMemo(
    () => [profile?.cargo_id, profile?.cargo_secundario_id].filter(Boolean),
    [profile],
  )

  const etapasFiltradas = useMemo(
    () => (isAdmin ? etapas : etapas.filter((e) => !e.cargo_id || userCargos.includes(e.cargo_id))),
    [isAdmin, etapas, userCargos],
  )

  const tarefasVisiveis = useMemo(
    () => tarefas.filter((t) => etapasFiltradas.some((e) => e.id === t.etapa_id)),
    [tarefas, etapasFiltradas],
  )

  const groupedEtapas = useMemo(
    () =>
      etapasFiltradas.reduce(
        (acc, etapa) => {
          const key = etapa.cargo_id || 'geral'
          if (!acc[key]) acc[key] = []
          acc[key].push(etapa)
          return acc
        },
        {} as Record<string, any[]>,
      ),
    [etapasFiltradas],
  )

  if (loading)
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-amber-500" />
      </div>
    )

  const pct = tarefasVisiveis.length
    ? Math.round(
        (progresso.filter((p) => p.concluido && tarefasVisiveis.some((t) => t.id === p.tarefa_id))
          .length /
          tarefasVisiveis.length) *
          100,
      )
    : 0

  const renderEtapaCard = (e: any) => {
    const eTs = tarefas.filter((t) => t.etapa_id === e.id)
    const eCon = eTs.filter((t) =>
      progresso.some((p) => p.tarefa_id === t.id && p.concluido),
    ).length
    const ePct = eTs.length ? Math.round((eCon / eTs.length) * 100) : 0

    return (
      <Card key={e.id} className="bg-slate-900 border-slate-800 shadow-md">
        <CardHeader className="pb-4 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle className="text-xl text-amber-500">
              Dia {e.dia} - {e.titulo}
            </CardTitle>
            <CardDescription className="text-slate-300 mt-1 text-base">
              {e.descricao}
            </CardDescription>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <span className="text-sm font-bold text-slate-200 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
              {ePct}% concluído
            </span>
            {isAdmin && (
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 text-slate-400 hover:text-white hover:bg-slate-800"
                  onClick={() => {
                    setEForm({ ...e, cargo_id: e.cargo_id || 'geral' })
                    setEModal(true)
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 text-red-400 hover:text-red-300 hover:bg-slate-800"
                  onClick={() => delE(e.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                  onClick={() => {
                    setTForm({ etapa_id: e.id, ordem: 0 })
                    setTModal(true)
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" /> Tarefa
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {eTs.map((t) => {
            const isDone = progresso.some((p) => p.tarefa_id === t.id && p.concluido)
            return (
              <div
                key={t.id}
                className="flex items-start justify-between bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 hover:bg-slate-800/80 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={isDone}
                    onCheckedChange={(c) => toggleT(t.id, !!c)}
                    className="mt-1 w-5 h-5"
                  />
                  <div>
                    <p
                      className={`text-base font-semibold ${isDone ? 'text-slate-500 line-through' : 'text-slate-50'}`}
                    >
                      {t.titulo}
                    </p>
                    {t.descricao && (
                      <p
                        className={`text-sm mt-1.5 leading-relaxed ${isDone ? 'text-slate-600' : 'text-slate-300'}`}
                      >
                        {t.descricao}
                      </p>
                    )}
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex gap-1 ml-4">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-slate-400 hover:text-white"
                      onClick={() => {
                        setTForm(t)
                        setTModal(true)
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-red-400 hover:text-red-300"
                      onClick={() => delT(t.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )
          })}
          {eTs.length === 0 && (
            <p className="text-sm text-slate-500 italic">Nenhuma tarefa nesta etapa.</p>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 md:p-8 rounded-xl shadow-lg border-l-4 border-amber-500">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3 uppercase">
            <CheckSquare className="text-amber-500" /> Onboarding
          </h1>
          <p className="text-slate-300 mt-1">
            Acompanhe as etapas de integração de acordo com a sua função.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {isAdmin && (
            <>
              <Button
                variant="outline"
                onClick={() => setCargosModal(true)}
                className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700"
              >
                <Users className="w-4 h-4 mr-2" /> Gerenciar Funções
              </Button>
              <Button
                onClick={() => {
                  setEForm({ dia: 1, ordem: 0, cargo_id: 'geral' })
                  setEModal(true)
                }}
                className="bg-amber-500 text-slate-900 hover:bg-amber-600 font-bold"
              >
                <Plus className="w-4 h-4 mr-2" /> Nova Etapa
              </Button>
            </>
          )}
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800 shadow-md">
        <CardHeader>
          <CardTitle className="text-white text-xl">Meu Progresso</CardTitle>
          <CardDescription className="text-slate-300 text-base">
            {
              progresso.filter(
                (p) => p.concluido && tarefasVisiveis.some((t) => t.id === p.tarefa_id),
              ).length
            }{' '}
            de {tarefasVisiveis.length} tarefas concluídas ({pct}%)
          </CardDescription>
          <Progress value={pct} className="h-3 mt-3 bg-slate-800" />
        </CardHeader>
      </Card>

      <div className="space-y-10">
        {groupedEtapas['geral'] && groupedEtapas['geral'].length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <LayoutList className="w-6 h-6 text-amber-500" />
              Onboarding Geral
            </h2>
            {groupedEtapas['geral'].map(renderEtapaCard)}
          </div>
        )}

        {cargos.map((c) => {
          const cargoEtapas = groupedEtapas[c.id]
          if (!cargoEtapas || cargoEtapas.length === 0) return null
          return (
            <div key={c.id} className="space-y-4">
              <h2 className="text-2xl font-bold text-amber-500 flex items-center gap-2 border-b border-slate-800 pb-2">
                <Briefcase className="w-6 h-6" />
                Trilha Específica: {c.nome}
              </h2>
              {cargoEtapas.map(renderEtapaCard)}
            </div>
          )
        })}

        {etapasFiltradas.length === 0 && (
          <div className="text-center py-12 text-slate-400 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">
            Nenhuma etapa de onboarding disponível.
          </div>
        )}
      </div>

      <Dialog open={eModal} onOpenChange={setEModal}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl text-amber-500">
              {eForm.id ? 'Editar' : 'Nova'} Etapa
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Título</Label>
              <Input
                value={eForm.titulo || ''}
                onChange={(e) => setEForm({ ...eForm, titulo: e.target.value })}
                className="bg-slate-950 border-slate-700"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Descrição</Label>
              <Textarea
                value={eForm.descricao || ''}
                onChange={(e) => setEForm({ ...eForm, descricao: e.target.value })}
                className="bg-slate-950 border-slate-700 min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Trilha (Função/Cargo)</Label>
              <Select
                value={eForm.cargo_id || 'geral'}
                onValueChange={(v) => setEForm({ ...eForm, cargo_id: v })}
              >
                <SelectTrigger className="bg-slate-950 border-slate-700">
                  <SelectValue placeholder="Selecione a trilha..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                  <SelectItem value="geral">Trilha Geral (Para todos)</SelectItem>
                  {cargos.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      Específico: {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Dia de Referência</Label>
                <Input
                  type="number"
                  value={eForm.dia || ''}
                  onChange={(e) => setEForm({ ...eForm, dia: Number(e.target.value) })}
                  className="bg-slate-950 border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Ordem de Exibição</Label>
                <Input
                  type="number"
                  value={eForm.ordem || ''}
                  onChange={(e) => setEForm({ ...eForm, ordem: Number(e.target.value) })}
                  className="bg-slate-950 border-slate-700"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={saveE}
              className="bg-amber-500 text-slate-900 font-bold hover:bg-amber-600"
            >
              Salvar Etapa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={tModal} onOpenChange={setTModal}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl text-amber-500">
              {tForm.id ? 'Editar' : 'Nova'} Tarefa
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Título da Tarefa</Label>
              <Input
                value={tForm.titulo || ''}
                onChange={(e) => setTForm({ ...tForm, titulo: e.target.value })}
                className="bg-slate-950 border-slate-700"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Descrição (Opcional)</Label>
              <Textarea
                value={tForm.descricao || ''}
                onChange={(e) => setTForm({ ...tForm, descricao: e.target.value })}
                className="bg-slate-950 border-slate-700 min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Ordem de Exibição</Label>
              <Input
                type="number"
                value={tForm.ordem || ''}
                onChange={(e) => setTForm({ ...tForm, ordem: Number(e.target.value) })}
                className="bg-slate-950 border-slate-700 w-1/2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={saveT}
              className="bg-amber-500 text-slate-900 font-bold hover:bg-amber-600"
            >
              Salvar Tarefa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={cargosModal} onOpenChange={setCargosModal}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl text-amber-500">Gerenciar Funções</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-2">
              <Input
                placeholder="Nome da nova função..."
                value={novoCargo}
                onChange={(e) => setNovoCargo(e.target.value)}
                className="bg-slate-950 border-slate-700"
              />
              <Button
                onClick={handleCreateCargo}
                className="bg-amber-500 text-slate-900 font-bold hover:bg-amber-600"
              >
                <Plus className="w-4 h-4 mr-2" /> Adicionar
              </Button>
            </div>
            <div className="space-y-2 mt-4 max-h-[300px] overflow-y-auto pr-2">
              {cargos.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between bg-slate-800 p-3 rounded-md border border-slate-700"
                >
                  {editandoCargo === c.id ? (
                    <div className="flex gap-2 w-full">
                      <Input
                        value={nomeEditadoCargo}
                        onChange={(e) => setNomeEditadoCargo(e.target.value)}
                        className="bg-slate-950 border-slate-700 h-8 text-sm"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={() => handleUpdateCargo(c.id)}
                        className="bg-amber-500 text-slate-900 hover:bg-amber-600 h-8"
                      >
                        Salvar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditandoCargo(null)}
                        className="h-8 text-slate-300 hover:text-white"
                      >
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="font-medium text-slate-200">{c.nome}</span>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700"
                          onClick={() => {
                            setEditandoCargo(c.id)
                            setNomeEditadoCargo(c.nome)
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-slate-700"
                          onClick={() => handleDeleteCargo(c.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {cargos.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">
                  Nenhuma função cadastrada.
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, CheckCircle2, Users, Trophy, DollarSign, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

export function SorrisoDosSonhosTab() {
  const [indicacoes, setIndicacoes] = useState<any[]>([])
  const [pacientes, setPacientes] = useState<any[]>([])
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false)
  const [selectedIndicacao, setSelectedIndicacao] = useState<any>(null)
  const [search, setSearch] = useState('')
  const { toast } = useToast()

  // Form states
  const [pacienteId, setPacienteId] = useState('')
  const [nomeIndicado, setNomeIndicado] = useState('')
  const [telefoneIndicado, setTelefoneIndicado] = useState('')
  const [colaboradorId, setColaboradorId] = useState('')
  const [valorPremio, setValorPremio] = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      const [indRes, pacRes, usuRes] = await Promise.all([
        supabase
          .from('sorriso_dos_sonhos_indicacoes' as any)
          .select(`
          *,
          paciente:pacientes!paciente_indicador_id(nome),
          colaborador:usuarios!colaborador_id(nome)
        `)
          .order('criado_em', { ascending: false }),
        supabase.from('pacientes').select('id, nome').order('nome'),
        supabase.from('usuarios').select('id, nome').eq('status', 'ativo').order('nome'),
      ])

      // Ignore 42P01 error during first render if table doesn't exist yet
      if (indRes.error && indRes.error.code !== '42P01') throw indRes.error
      if (pacRes.error) throw pacRes.error
      if (usuRes.error) throw usuRes.error

      setIndicacoes(indRes.data || [])
      setPacientes(pacRes.data || [])
      setUsuarios(usuRes.data || [])
    } catch (error: any) {
      if (error.code !== '42P01') {
        toast({
          title: 'Erro ao carregar dados',
          description: error.message,
          variant: 'destructive',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAdd = async () => {
    if (!pacienteId || !nomeIndicado || !colaboradorId) {
      toast({ title: 'Preencha os campos obrigatórios', variant: 'destructive' })
      return
    }

    try {
      const { error } = await supabase.from('sorriso_dos_sonhos_indicacoes' as any).insert({
        paciente_indicador_id: pacienteId,
        nome_indicado: nomeIndicado,
        telefone_indicado: telefoneIndicado,
        colaborador_id: colaboradorId,
        status: 'pendente',
      })

      if (error) throw error

      toast({ title: 'Indicação registrada com sucesso!' })
      setIsAddModalOpen(false)
      setPacienteId('')
      setNomeIndicado('')
      setTelefoneIndicado('')
      setColaboradorId('')
      fetchData()
    } catch (error: any) {
      toast({ title: 'Erro ao registrar', description: error.message, variant: 'destructive' })
    }
  }

  const handleClose = async () => {
    if (!selectedIndicacao) return

    try {
      const { error } = await supabase
        .from('sorriso_dos_sonhos_indicacoes' as any)
        .update({
          status: 'fechado',
          valor_premio_paciente: Number(valorPremio) || 0,
          data_fechamento: new Date().toISOString().split('T')[0],
        })
        .eq('id', selectedIndicacao.id)

      if (error) throw error

      toast({ title: 'Indicação fechada com sucesso!' })
      setIsCloseModalOpen(false)
      setValorPremio('')
      setSelectedIndicacao(null)
      fetchData()
    } catch (error: any) {
      toast({ title: 'Erro ao fechar', description: error.message, variant: 'destructive' })
    }
  }

  const totais = indicacoes.length
  const fechadas = indicacoes.filter((i) => i.status === 'fechado').length

  const fechadasPorColab = indicacoes
    .filter((i) => i.status === 'fechado')
    .reduce(
      (acc, curr) => {
        if (curr.colaborador_id) {
          acc[curr.colaborador_id] = (acc[curr.colaborador_id] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>,
    )

  const bonusTotal = Object.values(fechadasPorColab).reduce((sum, count) => {
    return sum + Math.floor(count / 2) * 100
  }, 0)

  const filteredIndicacoes = indicacoes.filter(
    (i) =>
      i.nome_indicado?.toLowerCase().includes(search.toLowerCase()) ||
      i.paciente?.nome?.toLowerCase().includes(search.toLowerCase()) ||
      i.colaborador?.nome?.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-sm bg-white/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total de Indicações
            </CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{totais}</div>
            <p className="text-xs text-slate-500">Cadastradas no programa</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Indicações Fechadas
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{fechadas}</div>
            <p className="text-xs text-slate-500">Tratamentos iniciados</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Bônus da Equipe</CardTitle>
            <Trophy className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              R$ {bonusTotal.toFixed(2).replace('.', ',')}
            </div>
            <p className="text-xs text-slate-500">Acumulado (R$100 a cada 2 fechadas)</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-white/70">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6">
          <div>
            <CardTitle className="text-xl">Controle de Indicações</CardTitle>
            <CardDescription>Acompanhe e gerencie o programa Sorriso dos Sonhos</CardDescription>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Buscar indicação..."
                className="pl-8 bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Indicação
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Nova Indicação</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>
                      Paciente Indicador <span className="text-red-500">*</span>
                    </Label>
                    <Select value={pacienteId} onValueChange={setPacienteId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o paciente" />
                      </SelectTrigger>
                      <SelectContent>
                        {pacientes.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>
                      Nome do Indicado <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={nomeIndicado}
                      onChange={(e) => setNomeIndicado(e.target.value)}
                      placeholder="Nome da pessoa indicada"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Telefone do Indicado</Label>
                    <Input
                      value={telefoneIndicado}
                      onChange={(e) => setTelefoneIndicado(e.target.value)}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>
                      Colaborador Responsável <span className="text-red-500">*</span>
                    </Label>
                    <Select value={colaboradorId} onValueChange={setColaboradorId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o colaborador" />
                      </SelectTrigger>
                      <SelectContent>
                        {usuarios.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                    onClick={handleAdd}
                  >
                    Salvar Registro
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="w-[120px]">Data</TableHead>
                  <TableHead>Paciente Indicador</TableHead>
                  <TableHead>Indicado</TableHead>
                  <TableHead>Colaborador</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[160px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIndicacoes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-500 h-32">
                      Nenhuma indicação encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredIndicacoes.map((ind) => (
                    <TableRow key={ind.id}>
                      <TableCell className="text-slate-600">
                        {format(new Date(ind.criado_em), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">
                        {ind.paciente?.nome}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-slate-700">{ind.nome_indicado}</div>
                        <div className="text-xs text-slate-500">{ind.telefone_indicado || '-'}</div>
                      </TableCell>
                      <TableCell className="text-slate-600">{ind.colaborador?.nome}</TableCell>
                      <TableCell>
                        {ind.status === 'pendente' ? (
                          <Badge
                            variant="outline"
                            className="bg-amber-50 text-amber-600 border-amber-200"
                          >
                            Pendente
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-emerald-50 text-emerald-600 border-emerald-200"
                          >
                            Fechado
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {ind.status === 'pendente' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-8"
                            onClick={() => {
                              setSelectedIndicacao(ind)
                              setIsCloseModalOpen(true)
                            }}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Fechar
                          </Button>
                        )}
                        {ind.status === 'fechado' && ind.valor_premio_paciente > 0 && (
                          <div className="text-xs text-emerald-600 font-medium flex items-center justify-end px-2 py-1 bg-emerald-50 rounded-md inline-flex border border-emerald-100">
                            <DollarSign className="h-3 w-3 mr-0.5" />
                            {ind.valor_premio_paciente}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCloseModalOpen} onOpenChange={setIsCloseModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Fechamento</DialogTitle>
            <DialogDescription>
              Marcar o tratamento como fechado para{' '}
              <strong>{selectedIndicacao?.nome_indicado}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Prêmio do Paciente Indicador (R$)</Label>
              <Input
                type="number"
                value={valorPremio}
                onChange={(e) => setValorPremio(e.target.value)}
                placeholder="Ex: 50"
              />
              <p className="text-xs text-slate-500 mt-1">
                Valor que <strong>{selectedIndicacao?.paciente?.nome}</strong> ganhará pela
                indicação.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCloseModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleClose}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Confirmar Fechamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

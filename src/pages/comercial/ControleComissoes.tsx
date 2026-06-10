import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { Plus, Trash2, Loader2, DollarSign } from 'lucide-react'
import { comissoesService, FaixaBase } from '@/services/comissoes'

export default function ControleComissoes() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)

  const [faixasDentista, setFaixasDentista] = useState<FaixaBase[]>([])
  const [faixasCRC, setFaixasCRC] = useState<FaixaBase[]>([])

  const [vendasDentista, setVendasDentista] = useState<any[]>([])
  const [vendasCRC, setVendasCRC] = useState<any[]>([])

  const [dentistaForm, setDentistaForm] = useState<Partial<FaixaBase>>({
    faixa_entrada_minima: 0,
    faixa_entrada_maxima: 0,
    percentual_comissao: 0,
  })

  const [crcForm, setCrcForm] = useState<Partial<FaixaBase>>({
    faixa_entrada_minima: 0,
    faixa_entrada_maxima: 0,
    percentual_comissao: 0,
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const [fd, fc, vd, vc] = await Promise.all([
        comissoesService.dentista.list(),
        comissoesService.crc.list(),
        supabase
          .from('vendas_confirmadas')
          .select('*, dentistas_avaliadores(nome)')
          .not('dentista_avaliador', 'is', null)
          .order('data_fechamento', { ascending: false }),
        supabase
          .from('vendas_confirmadas')
          .select('*, crc_comercial(nome)')
          .not('crc', 'is', null)
          .order('data_fechamento', { ascending: false }),
      ])
      setFaixasDentista(fd)
      setFaixasCRC(fc)
      setVendasDentista(vd.data || [])
      setVendasCRC(vc.data || [])
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar dados',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAddFaixaDentista = async () => {
    if (
      dentistaForm.faixa_entrada_minima === undefined ||
      dentistaForm.faixa_entrada_maxima === undefined ||
      dentistaForm.percentual_comissao === undefined
    ) {
      return toast({ title: 'Preencha todos os campos', variant: 'destructive' })
    }

    try {
      await comissoesService.dentista.save({
        ...dentistaForm,
        status: 'ativo',
      })
      toast({ title: 'Faixa adicionada com sucesso' })
      setDentistaForm({ faixa_entrada_minima: 0, faixa_entrada_maxima: 0, percentual_comissao: 0 })
      fetchData()
    } catch (error: any) {
      toast({
        title: 'Erro ao adicionar faixa',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const handleDeleteFaixaDentista = async (id: string) => {
    try {
      await comissoesService.dentista.remove(id)
      toast({ title: 'Faixa removida com sucesso' })
      fetchData()
    } catch (error: any) {
      toast({ title: 'Erro ao remover faixa', description: error.message, variant: 'destructive' })
    }
  }

  const handleAddFaixaCRC = async () => {
    if (
      crcForm.faixa_entrada_minima === undefined ||
      crcForm.faixa_entrada_maxima === undefined ||
      crcForm.percentual_comissao === undefined
    ) {
      return toast({ title: 'Preencha todos os campos', variant: 'destructive' })
    }

    try {
      await comissoesService.crc.save({
        ...crcForm,
        status: 'ativo',
      })
      toast({ title: 'Faixa adicionada com sucesso' })
      setCrcForm({ faixa_entrada_minima: 0, faixa_entrada_maxima: 0, percentual_comissao: 0 })
      fetchData()
    } catch (error: any) {
      toast({
        title: 'Erro ao adicionar faixa',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const handleDeleteFaixaCRC = async (id: string) => {
    try {
      await comissoesService.crc.remove(id)
      toast({ title: 'Faixa removida com sucesso' })
      fetchData()
    } catch (error: any) {
      toast({ title: 'Erro ao remover faixa', description: error.message, variant: 'destructive' })
    }
  }

  const formatCurrency = (val: number | null) => {
    if (val === null || val === undefined) return '-'
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('pt-BR')
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
          <DollarSign className="w-8 h-8 text-amber-500" />
          Controle de Comissões
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Gerencie as comissões de Dentistas Avaliadores e CRC Comercial.
        </p>
      </div>

      <Tabs defaultValue="dentistas" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="dentistas">Dentistas</TabsTrigger>
          <TabsTrigger value="crc">CRC</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="dentistas" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Comissões - Dentistas Avaliadores</CardTitle>
              <CardDescription>
                Acompanhe as comissões geradas por vendas confirmadas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-900/50">
                      <TableHead>Data</TableHead>
                      <TableHead>Dentista</TableHead>
                      <TableHead>Paciente</TableHead>
                      <TableHead className="text-right">Valor Venda</TableHead>
                      <TableHead className="text-right">Entrada (%)</TableHead>
                      <TableHead className="text-right">Comissão (%)</TableHead>
                      <TableHead className="text-right">Valor Comissão</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendasDentista.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-slate-500 py-8">
                          Nenhuma comissão registrada para dentistas.
                        </TableCell>
                      </TableRow>
                    ) : (
                      vendasDentista.map((v) => (
                        <TableRow key={v.id}>
                          <TableCell>{formatDate(v.data_fechamento)}</TableCell>
                          <TableCell className="font-medium">
                            {v.dentistas_avaliadores?.nome || '-'}
                          </TableCell>
                          <TableCell>{v.paciente_nome}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(v.valor_tratamento)}
                          </TableCell>
                          <TableCell className="text-right">
                            {v.percentual_entrada ? `${v.percentual_entrada}%` : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            {v.percentual_comissao ? `${v.percentual_comissao}%` : '-'}
                          </TableCell>
                          <TableCell className="text-right font-medium text-green-600 dark:text-green-400">
                            {formatCurrency(v.valor_comissao)}
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                              {v.status_comissao || 'Em Aberto'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crc" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Comissões - CRC Comercial</CardTitle>
              <CardDescription>Acompanhe as comissões geradas para equipe CRC.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-900/50">
                      <TableHead>Data</TableHead>
                      <TableHead>CRC</TableHead>
                      <TableHead>Paciente</TableHead>
                      <TableHead className="text-right">Valor Venda</TableHead>
                      <TableHead className="text-right">Entrada (%)</TableHead>
                      <TableHead className="text-right">Comissão (%)</TableHead>
                      <TableHead className="text-right">Valor Comissão</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendasCRC.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-slate-500 py-8">
                          Nenhuma comissão registrada para CRC.
                        </TableCell>
                      </TableRow>
                    ) : (
                      vendasCRC.map((v) => (
                        <TableRow key={v.id}>
                          <TableCell>{formatDate(v.data_fechamento)}</TableCell>
                          <TableCell className="font-medium">
                            {v.crc_comercial?.nome || '-'}
                          </TableCell>
                          <TableCell>{v.paciente_nome}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(v.valor_tratamento)}
                          </TableCell>
                          <TableCell className="text-right">
                            {v.percentual_entrada ? `${v.percentual_entrada}%` : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            {v.percentual_comissao ? `${v.percentual_comissao}%` : '-'}
                          </TableCell>
                          <TableCell className="text-right font-medium text-green-600 dark:text-green-400">
                            {formatCurrency(v.valor_comissao)}
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                              {v.status_comissao || 'Em Aberto'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuracoes" className="mt-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Regras - Dentistas Avaliadores</CardTitle>
                <CardDescription>Configuração de comissão baseada na % de entrada.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4 items-end bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                  <div className="space-y-2">
                    <Label>Entrada Mín. (%)</Label>
                    <Input
                      type="number"
                      value={dentistaForm.faixa_entrada_minima || ''}
                      onChange={(e) =>
                        setDentistaForm({
                          ...dentistaForm,
                          faixa_entrada_minima: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Entrada Máx. (%)</Label>
                    <Input
                      type="number"
                      value={dentistaForm.faixa_entrada_maxima || ''}
                      onChange={(e) =>
                        setDentistaForm({
                          ...dentistaForm,
                          faixa_entrada_maxima: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Comissão (%)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={dentistaForm.percentual_comissao || ''}
                        onChange={(e) =>
                          setDentistaForm({
                            ...dentistaForm,
                            percentual_comissao: Number(e.target.value),
                          })
                        }
                      />
                      <Button
                        onClick={handleAddFaixaDentista}
                        size="icon"
                        className="shrink-0 bg-amber-600 hover:bg-amber-700"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 dark:bg-slate-900/50">
                        <TableHead>Faixa de Entrada</TableHead>
                        <TableHead className="text-right">Comissão</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {faixasDentista.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-slate-500 py-4">
                            Nenhuma regra cadastrada
                          </TableCell>
                        </TableRow>
                      ) : (
                        faixasDentista.map((f) => (
                          <TableRow key={f.id}>
                            <TableCell>
                              {f.faixa_entrada_minima}% a {f.faixa_entrada_maxima}%
                            </TableCell>
                            <TableCell className="text-right font-medium text-amber-600 dark:text-amber-500">
                              {f.percentual_comissao}%
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => f.id && handleDeleteFaixaDentista(f.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Regras - CRC Comercial</CardTitle>
                <CardDescription>Configuração de comissão baseada na % de entrada.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4 items-end bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                  <div className="space-y-2">
                    <Label>Entrada Mín. (%)</Label>
                    <Input
                      type="number"
                      value={crcForm.faixa_entrada_minima || ''}
                      onChange={(e) =>
                        setCrcForm({ ...crcForm, faixa_entrada_minima: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Entrada Máx. (%)</Label>
                    <Input
                      type="number"
                      value={crcForm.faixa_entrada_maxima || ''}
                      onChange={(e) =>
                        setCrcForm({ ...crcForm, faixa_entrada_maxima: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Comissão (%)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={crcForm.percentual_comissao || ''}
                        onChange={(e) =>
                          setCrcForm({ ...crcForm, percentual_comissao: Number(e.target.value) })
                        }
                      />
                      <Button
                        onClick={handleAddFaixaCRC}
                        size="icon"
                        className="shrink-0 bg-amber-600 hover:bg-amber-700"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 dark:bg-slate-900/50">
                        <TableHead>Faixa de Entrada</TableHead>
                        <TableHead className="text-right">Comissão</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {faixasCRC.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-slate-500 py-4">
                            Nenhuma regra cadastrada
                          </TableCell>
                        </TableRow>
                      ) : (
                        faixasCRC.map((f) => (
                          <TableRow key={f.id}>
                            <TableCell>
                              {f.faixa_entrada_minima}% a {f.faixa_entrada_maxima}%
                            </TableCell>
                            <TableCell className="text-right font-medium text-amber-600 dark:text-amber-500">
                              {f.percentual_comissao}%
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => f.id && handleDeleteFaixaCRC(f.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

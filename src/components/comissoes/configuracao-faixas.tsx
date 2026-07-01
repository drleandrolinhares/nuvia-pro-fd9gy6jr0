import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react'
import { comissoesService, FaixaBase } from '@/services/comissoes'

export function ConfiguracaoFaixas() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [faixasDentista, setFaixasDentista] = useState<FaixaBase[]>([])
  const [faixasCRC, setFaixasCRC] = useState<FaixaBase[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentFaixa, setCurrentFaixa] = useState<Partial<FaixaBase>>({})
  const [faixaTipo, setFaixaTipo] = useState<'dentista' | 'crc'>('dentista')

  useEffect(() => {
    loadFaixas()
  }, [])

  const loadFaixas = async () => {
    try {
      setLoading(true)
      const [d, c] = await Promise.all([
        comissoesService.dentista.list(),
        comissoesService.crc.list(),
      ])
      setFaixasDentista(d)
      setFaixasCRC(c)
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveFaixa = async () => {
    try {
      if (faixaTipo === 'dentista') {
        await comissoesService.dentista.save(currentFaixa)
      } else {
        await comissoesService.crc.save(currentFaixa)
      }
      toast({ title: 'Sucesso', description: 'Faixa de comissão salva com sucesso.' })
      setIsDialogOpen(false)
      loadFaixas()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const handleDeleteFaixa = async (id: string, tipo: 'dentista' | 'crc') => {
    if (!confirm('Deseja realmente excluir esta faixa de comissão?')) return
    try {
      if (tipo === 'dentista') {
        await comissoesService.dentista.remove(id)
      } else {
        await comissoesService.crc.remove(id)
      }
      toast({ title: 'Sucesso', description: 'Faixa excluída com sucesso.' })
      loadFaixas()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const openDialog = (tipo: 'dentista' | 'crc', faixa?: FaixaBase) => {
    setFaixaTipo(tipo)
    setCurrentFaixa(
      faixa || {
        status: 'ativo',
        faixa_entrada_minima: 0,
        faixa_entrada_maxima: 0,
        percentual_comissao: 0,
      },
    )
    setIsDialogOpen(true)
  }

  const renderTable = (tipo: 'dentista' | 'crc', faixas: FaixaBase[]) => (
    <Card className="border-slate-200 bg-white flex-1 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="space-y-1">
          <CardTitle className="text-lg text-slate-950">
            Faixas - {tipo === 'dentista' ? 'Dentistas Avaliadores' : 'CRC Comercial'}
          </CardTitle>
          <CardDescription className="text-slate-500">
            Configure as regras por percentual de entrada do paciente.
          </CardDescription>
        </div>
        <Button
          size="sm"
          onClick={() => openDialog(tipo)}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Faixa
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow className="border-slate-200">
                <TableHead className="text-slate-700">Entrada Mín.</TableHead>
                <TableHead className="text-slate-700">Entrada Máx.</TableHead>
                <TableHead className="text-slate-700">% Comissão</TableHead>
                <TableHead className="text-slate-700">Status</TableHead>
                <TableHead className="text-right text-slate-700">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {faixas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                    Nenhuma faixa configurada.
                  </TableCell>
                </TableRow>
              ) : (
                faixas.map((f) => (
                  <TableRow
                    key={f.id}
                    className="border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <TableCell className="text-slate-700 font-medium">
                      {Number(f.faixa_entrada_minima).toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-slate-700 font-medium">
                      {Number(f.faixa_entrada_maxima).toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-amber-600 font-bold">
                      {Number(f.percentual_comissao).toFixed(1)}%
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          f.status === 'ativo'
                            ? 'border-emerald-200 text-emerald-700 bg-emerald-50'
                            : 'border-slate-200 text-slate-500 bg-slate-100'
                        }
                      >
                        {f.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDialog(tipo, f)}
                          className="h-8 w-8 text-slate-400 hover:text-slate-950 hover:bg-slate-100"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteFaixa(f.id!, tipo)}
                          className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )

  if (loading)
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin text-amber-500 w-8 h-8" />
      </div>
    )

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row gap-6">
        {renderTable('dentista', faixasDentista)}
        {renderTable('crc', faixasCRC)}
      </div>
      <div className="rounded-lg border border-slate-200 bg-blue-50 p-4">
        <p className="text-sm text-slate-700">
          <strong>Cálculo Agregado:</strong> A taxa de comissão é determinada pelo percentual de
          entrada total do profissional (soma de todas as entradas ÷ soma de todas as vendas no
          período), e não por venda individual.
        </p>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white border-slate-200 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-slate-950">
              {currentFaixa.id ? 'Editar Faixa' : 'Nova Faixa'} -{' '}
              {faixaTipo === 'dentista' ? 'Dentista' : 'CRC'}
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Defina os percentuais mínimos e máximos de entrada para aplicar a comissão
              correspondente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Entrada Mínima (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  className="bg-white border-slate-300 focus-visible:ring-amber-500"
                  value={currentFaixa.faixa_entrada_minima ?? ''}
                  onChange={(e) =>
                    setCurrentFaixa((p) => ({
                      ...p,
                      faixa_entrada_minima: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Entrada Máxima (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  className="bg-white border-slate-300 focus-visible:ring-amber-500"
                  value={currentFaixa.faixa_entrada_maxima ?? ''}
                  onChange={(e) =>
                    setCurrentFaixa((p) => ({
                      ...p,
                      faixa_entrada_maxima: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold">Percentual de Comissão (%)</Label>
              <Input
                type="number"
                step="0.1"
                className="bg-white border-slate-300 focus-visible:ring-amber-500"
                value={currentFaixa.percentual_comissao ?? ''}
                onChange={(e) =>
                  setCurrentFaixa((p) => ({
                    ...p,
                    percentual_comissao: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold">Status de Operação</Label>
              <Select
                value={currentFaixa.status || 'ativo'}
                onValueChange={(v) => setCurrentFaixa((p) => ({ ...p, status: v }))}
              >
                <SelectTrigger className="bg-white border-slate-300 focus:ring-amber-500">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="ativo" className="focus:bg-slate-100">
                    Ativo
                  </SelectItem>
                  <SelectItem value="inativo" className="focus:bg-slate-100">
                    Inativo
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsDialogOpen(false)}
              className="hover:bg-slate-100 text-slate-600"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveFaixa}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6"
            >
              Salvar Faixa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

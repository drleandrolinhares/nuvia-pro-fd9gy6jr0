import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { FileText, Search, Undo2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'

export function VendasConcretizadasLista() {
  const [vendas, setVendas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const { toast } = useToast()
  const [revertDialogOpen, setRevertDialogOpen] = useState(false)
  const [vendaToRevert, setVendaToRevert] = useState<any>(null)
  const [reverting, setReverting] = useState(false)

  useEffect(() => {
    fetchVendas()
  }, [])

  const fetchVendas = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('vendas_confirmadas')
        .select(`
          id,
          paciente_nome,
          data_fechamento,
          valor_tratamento,
          valor_entrada,
          percentual_entrada,
          tratamento,
          oportunidade_id,
          dentistas_avaliadores (nome),
          crc_comercial (nome),
          avaliacoes (paciente_id)
        `)
        .order('data_fechamento', { ascending: false })

      if (error) throw error
      setVendas(data || [])
    } catch (err: any) {
      toast({ title: 'Erro ao buscar vendas', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  const formatarData = (dataStr: string | null) => {
    if (!dataStr) return '-'
    const [year, month, day] = dataStr.substring(0, 10).split('-')
    if (year && month && day) return `${day}/${month}/${year}`
    return dataStr
  }

  const handleRevertVenda = async () => {
    if (!vendaToRevert) return
    setReverting(true)
    try {
      const { error: delError } = await supabase
        .from('vendas_confirmadas')
        .delete()
        .eq('id', vendaToRevert.id)

      if (delError) throw delError

      if (vendaToRevert.oportunidade_id) {
        const { error: updError } = await supabase
          .from('avaliacoes')
          .update({ status: 'avaliacao_realizada' })
          .eq('id', vendaToRevert.oportunidade_id)

        if (updError) throw updError
      }

      toast({
        title: 'Venda revertida com sucesso',
        description: 'A oportunidade voltou para a aba de Oportunidades Comerciais.',
      })
      setRevertDialogOpen(false)
      setVendaToRevert(null)
      fetchVendas()
    } catch (err: any) {
      toast({ title: 'Erro ao reverter venda', description: err.message, variant: 'destructive' })
    } finally {
      setReverting(false)
    }
  }

  const filteredVendas = vendas.filter(
    (v) =>
      v.paciente_nome?.toLowerCase().includes(search.toLowerCase()) ||
      v.tratamento?.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendas Concretizadas</CardTitle>
        <CardDescription>
          Histórico de todas as vendas finalizadas e confirmadas com sucesso.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 max-w-md">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por paciente ou tratamento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9"
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-[#1e3a5f]">
              <TableRow className="hover:bg-[#1e3a5f]">
                <TableHead className="text-white">Paciente</TableHead>
                <TableHead className="text-white">Data Fechamento</TableHead>
                <TableHead className="text-white">Tratamento</TableHead>
                <TableHead className="text-white">Valor Total</TableHead>
                <TableHead className="text-white">Entrada</TableHead>
                <TableHead className="text-white">Avaliador / CRC</TableHead>
                <TableHead className="text-white text-right pr-4">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Carregando vendas...
                  </TableCell>
                </TableRow>
              ) : filteredVendas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhuma venda encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                filteredVendas.map((venda) => (
                  <TableRow key={venda.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium">{venda.paciente_nome}</TableCell>
                    <TableCell>{formatarData(venda.data_fechamento)}</TableCell>
                    <TableCell>{venda.tratamento || '-'}</TableCell>
                    <TableCell>{formatCurrency(venda.valor_tratamento)}</TableCell>
                    <TableCell>
                      {formatCurrency(venda.valor_entrada)}
                      <span className="text-xs text-muted-foreground ml-1 block sm:inline">
                        ({Number(venda.percentual_entrada).toFixed(1)}%)
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex flex-col">
                        <span>{venda.dentistas_avaliadores?.nome || '-'}</span>
                        <span className="text-xs text-muted-foreground">
                          {venda.crc_comercial?.nome || ''}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          title="Ver Ficha"
                          onClick={() => {
                            const pId = venda.avaliacoes?.paciente_id
                            if (pId) navigate(`/comercial/pacientes?id=${pId}`)
                          }}
                        >
                          <FileText className="w-4 h-4" />
                          <span className="hidden sm:inline ml-2">Ficha</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          title="Reverter Venda"
                          onClick={() => {
                            setVendaToRevert(venda)
                            setRevertDialogOpen(true)
                          }}
                        >
                          <Undo2 className="w-4 h-4" />
                          <span className="hidden sm:inline ml-2">Reverter</span>
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

      <AlertDialog open={revertDialogOpen} onOpenChange={setRevertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que deseja reverter esta venda?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá o registro de venda confirmada do paciente{' '}
              <strong className="text-slate-800">{vendaToRevert?.paciente_nome}</strong> e a
              oportunidade voltará para a lista de negociações em aberto.
              <br />
              <br />
              <span className="text-amber-600 font-medium">
                Aviso: Isto não altera nenhum cálculo do fluxo original, apenas retrocede o status
                da oportunidade.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={reverting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleRevertVenda()
              }}
              disabled={reverting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {reverting ? 'Revertendo...' : 'Sim, reverter venda'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

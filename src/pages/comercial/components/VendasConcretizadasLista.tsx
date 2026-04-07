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
import { FileText, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'

export function VendasConcretizadasLista() {
  const [vendas, setVendas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const { toast } = useToast()

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
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        onClick={() => {
                          const pId = venda.avaliacoes?.paciente_id
                          if (pId) navigate(`/comercial/pacientes?id=${pId}`)
                        }}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Ver Ficha
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
  )
}

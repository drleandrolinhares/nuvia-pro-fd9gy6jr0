import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { Plus, Edit, Trash } from 'lucide-react'

export function VendasTab({ pacienteId }: { pacienteId: string }) {
  const [vendas, setVendas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('vendas_concretizadas')
      .select(
        '*, avaliacoes!inner(paciente_id), comissoes_crc(valor_comissao), comissoes_dentista(valor_comissao)',
      )
      .eq('avaliacoes.paciente_id', pacienteId)
      .order('data_concretizacao', { ascending: false })
      .then(({ data }) => {
        if (data) setVendas(data)
        setLoading(false)
      })
  }, [pacienteId])

  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between bg-green-500/5 border-b pb-4">
        <CardTitle className="text-green-700">Vendas Concretizadas</CardTitle>
        <Button size="sm" className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" /> Nova Venda
        </Button>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Valor Entrada</TableHead>
                <TableHead>% Entrada</TableHead>
                <TableHead>Comissões (Total)</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : vendas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    Nenhuma venda concretizada.
                  </TableCell>
                </TableRow>
              ) : (
                vendas.map((v) => {
                  const comissoesTotal =
                    (v.comissoes_crc?.reduce(
                      (acc: number, c: any) => acc + (Number(c.valor_comissao) || 0),
                      0,
                    ) || 0) +
                    (v.comissoes_dentista?.reduce(
                      (acc: number, c: any) => acc + (Number(c.valor_comissao) || 0),
                      0,
                    ) || 0)

                  return (
                    <TableRow key={v.id}>
                      <TableCell>
                        {v.data_concretizacao
                          ? format(new Date(v.data_concretizacao), 'dd/MM/yyyy')
                          : '-'}
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        {formatBRL(v.valor_total_tratamento)}
                      </TableCell>
                      <TableCell>{formatBRL(v.valor_entrada)}</TableCell>
                      <TableCell>
                        {v.percentual_entrada ? `${v.percentual_entrada}%` : '-'}
                      </TableCell>
                      <TableCell>{formatBRL(comissoesTotal)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { Plus, Edit, Trash } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AvaliacoesTab({ pacienteId }: { pacienteId: string }) {
  const [avaliacoes, setAvaliacoes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('avaliacoes')
      .select('*, dentistas_avaliadores(nome)')
      .eq('paciente_id', pacienteId)
      .order('data_avaliacao', { ascending: false })
      .then(({ data }) => {
        if (data) setAvaliacoes(data)
        setLoading(false)
      })
  }, [pacienteId])

  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Histórico de Avaliações</CardTitle>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" /> Nova Avaliação
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Valor do Orçamento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dentista Avaliador</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : avaliacoes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    Nenhuma avaliação encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                avaliacoes.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      {a.data_avaliacao ? format(new Date(a.data_avaliacao), 'dd/MM/yyyy') : '-'}
                    </TableCell>
                    <TableCell className="font-medium">
                      {a.valor_orcamento ? formatBRL(a.valor_orcamento) : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          'capitalize',
                          a.status === 'venda_concretizada' &&
                            'bg-green-500/10 text-green-600 border-green-500/20',
                        )}
                      >
                        {a.status?.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{a.dentistas_avaliadores?.nome || '-'}</TableCell>
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

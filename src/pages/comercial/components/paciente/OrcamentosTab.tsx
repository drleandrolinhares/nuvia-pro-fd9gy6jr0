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

export function OrcamentosTab({ pacienteId }: { pacienteId: string }) {
  const [orcamentos, setOrcamentos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('orcamentos')
      .select('*, avaliacoes!inner(paciente_id)')
      .eq('avaliacoes.paciente_id', pacienteId)
      .order('data_orcamento', { ascending: false })
      .then(({ data }) => {
        if (data) setOrcamentos(data)
        setLoading(false)
      })
  }, [pacienteId])

  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Orçamentos Gerados</CardTitle>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" /> Novo Orçamento
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ordem</TableHead>
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
              ) : orcamentos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    Nenhum orçamento encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                orcamentos.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>
                      {o.data_orcamento ? format(new Date(o.data_orcamento), 'dd/MM/yyyy') : '-'}
                    </TableCell>
                    <TableCell className="font-medium">{formatBRL(o.valor)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {o.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{o.ordem || '-'}</TableCell>
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

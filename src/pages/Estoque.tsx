import { useState } from 'react'
import {
  Plus,
  ArrowDownToLine,
  ArrowUpFromLine,
  Search,
  Filter,
  MoreHorizontal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type InventoryStatus = 'OK' | 'Baixo' | 'Crítico'

interface InventoryItem {
  id: string
  name: string
  category: string
  currentQty: number
  minQty: number
  status: InventoryStatus
  lastUpdated: string
}

const mockData: InventoryItem[] = [
  {
    id: '1',
    name: 'Resina Composta A2',
    category: 'Clínico',
    currentQty: 45,
    minQty: 20,
    status: 'OK',
    lastUpdated: 'Hoje',
  },
  {
    id: '2',
    name: 'Luvas de Procedimento M',
    category: 'Descartáveis',
    currentQty: 12,
    minQty: 50,
    status: 'Crítico',
    lastUpdated: 'Ontem',
  },
  {
    id: '3',
    name: 'Anestésico Lidocaína',
    category: 'Cirúrgico',
    currentQty: 25,
    minQty: 30,
    status: 'Baixo',
    lastUpdated: '2 dias atrás',
  },
  {
    id: '4',
    name: 'Sugador Descartável',
    category: 'Descartáveis',
    currentQty: 500,
    minQty: 100,
    status: 'OK',
    lastUpdated: 'Hoje',
  },
  {
    id: '5',
    name: 'Fio de Sutura Nylon 4-0',
    category: 'Cirúrgico',
    currentQty: 8,
    minQty: 15,
    status: 'Baixo',
    lastUpdated: '1 semana atrás',
  },
]

export default function Estoque() {
  const [searchTerm, setSearchTerm] = useState('')

  const getStatusBadge = (status: InventoryStatus) => {
    switch (status) {
      case 'OK':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-200">
            Adequado
          </Badge>
        )
      case 'Baixo':
        return (
          <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-200">
            Atenção
          </Badge>
        )
      case 'Crítico':
        return (
          <Badge
            variant="destructive"
            className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-200"
          >
            Crítico
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground uppercase">
            Gestão de Estoque
          </h1>
          <p className="text-muted-foreground uppercase text-sm font-medium tracking-wider mt-1">
            Controle de Materiais e Insumos
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            className="font-semibold tracking-wide shadow-sm hover:shadow-md transition-all"
          >
            <Plus className="mr-2 h-4 w-4" /> Novo Item
          </Button>
          <Button
            variant="outline"
            className="font-semibold tracking-wide border-border hover:bg-secondary/10 hover:text-secondary hover:border-secondary"
          >
            <ArrowDownToLine className="mr-2 h-4 w-4" /> Entrada
          </Button>
          <Button
            variant="outline"
            className="font-semibold tracking-wide border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
          >
            <ArrowUpFromLine className="mr-2 h-4 w-4" /> Saída
          </Button>
        </div>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <CardTitle className="text-lg font-bold uppercase tracking-wider">
              Itens Registrados
            </CardTitle>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar material..."
                  className="pl-9 bg-background focus-visible:ring-secondary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" className="shrink-0 border-border">
                <Filter className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-bold uppercase tracking-wider text-xs">
                    Material
                  </TableHead>
                  <TableHead className="font-bold uppercase tracking-wider text-xs">
                    Categoria
                  </TableHead>
                  <TableHead className="font-bold uppercase tracking-wider text-xs text-right">
                    Qtd Atual
                  </TableHead>
                  <TableHead className="font-bold uppercase tracking-wider text-xs text-right">
                    Qtd Mínima
                  </TableHead>
                  <TableHead className="font-bold uppercase tracking-wider text-xs text-center">
                    Status
                  </TableHead>
                  <TableHead className="font-bold uppercase tracking-wider text-xs text-right">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockData.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-muted-foreground">{item.category}</TableCell>
                    <TableCell className="text-right font-semibold">{item.currentQty}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {item.minQty}
                    </TableCell>
                    <TableCell className="text-center">{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="cursor-pointer">
                            Editar item
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            Histórico de mov.
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive cursor-pointer focus:text-destructive">
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

import { useState, useEffect } from 'react'
import {
  Search,
  ScanLine,
  AlertTriangle,
  Edit,
  Eye,
  Package,
  CircleDollarSign,
  TrendingUp,
  Boxes,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface InventoryItem {
  id: string
  produto: string
  marca: string
  embalagem: string
  sala: string
  validade: string
  lote: string
  custo: number
  estoque: number
  status: 'Normal' | 'Crítico'
}

const mockData: InventoryItem[] = [
  {
    id: '1',
    produto: 'Resina Composta A2',
    marca: '3M ESPE',
    embalagem: 'Seringa 4g',
    sala: 'Almoxarifado Principal',
    validade: '12/12/2025',
    lote: 'L-20394',
    custo: 185.5,
    estoque: 45,
    status: 'Normal',
  },
  {
    id: '2',
    produto: 'Implante Titânio 3.5x10mm',
    marca: 'Neodent',
    embalagem: 'Unidade',
    sala: 'Sala de Cirurgia',
    validade: '08/08/2026',
    lote: 'ND-9923',
    custo: 320.0,
    estoque: 5,
    status: 'Crítico',
  },
  {
    id: '3',
    produto: 'Luvas de Procedimento M',
    marca: 'Supermax',
    embalagem: 'Caixa 100 un.',
    sala: 'Almoxarifado Secundário',
    validade: '01/05/2027',
    lote: 'SM-1102',
    custo: 45.9,
    estoque: 8,
    status: 'Crítico',
  },
  {
    id: '4',
    produto: 'Anestésico Lidocaína 2%',
    marca: 'DFL',
    embalagem: 'Caixa 50 tubetes',
    sala: 'Almoxarifado Principal',
    validade: '11/10/2024',
    lote: 'LIDO-445',
    custo: 89.0,
    estoque: 120,
    status: 'Normal',
  },
  {
    id: '5',
    produto: 'Cimento Resinoso Dual',
    marca: 'FGM',
    embalagem: 'Seringa 5g',
    sala: 'Prótese',
    validade: '05/03/2025',
    lote: 'FGM-882',
    custo: 145.0,
    estoque: 15,
    status: 'Normal',
  },
]

export default function Estoque() {
  const [searchTerm, setSearchTerm] = useState('')
  const [barcode, setBarcode] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showCriticalOnly, setShowCriticalOnly] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const filteredData = mockData.filter((item) => {
    const matchesSearch =
      item.produto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.marca.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = showCriticalOnly ? item.status === 'Crítico' : true
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-slate-50 p-6 rounded-xl shadow-lg border-l-4 border-amber-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Gestão de Estoque</h1>
          <p className="text-slate-300 text-sm font-medium tracking-wide mt-1">
            Controle de Materiais e Insumos Financeiros
          </p>
        </div>
        <div className="flex flex-col items-end text-amber-500 bg-slate-950/50 px-4 py-2 rounded-lg border border-slate-800">
          <span className="text-sm font-medium capitalize">
            {format(currentTime, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </span>
          <span className="text-2xl font-bold font-mono tracking-wider">
            {format(currentTime, 'HH:mm:ss')}
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-slate-600 uppercase">
              Capital Investido
            </CardTitle>
            <CircleDollarSign className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">R$ 145.230,00</div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              +2.5% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-slate-600 uppercase">
              Unidades em Estoque Total
            </CardTitle>
            <Package className="h-4 w-4 text-slate-900" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">12.450</div>
            <p className="text-xs text-slate-500 mt-1 font-medium">Total de itens armazenados</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-slate-600 uppercase text-ellipsis overflow-hidden whitespace-nowrap">
              Esp. com Maior Capital
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-slate-900">Implantodontia</div>
            <p className="text-xs text-slate-500 mt-1 font-medium">R$ 68.400,00 investidos</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-slate-600 uppercase text-ellipsis overflow-hidden whitespace-nowrap">
              Esp. com Maior Volume
            </CardTitle>
            <Boxes className="h-4 w-4 text-slate-900" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-slate-900">Clínico Geral</div>
            <p className="text-xs text-slate-500 mt-1 font-medium">4.200 unidades disponíveis</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto flex-1">
              <div className="space-y-1 w-full md:max-w-xs">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Leitor de Código de Barras
                </label>
                <div className="relative">
                  <ScanLine className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Escanear código..."
                    className="pl-9 border-slate-300 focus-visible:ring-slate-900"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1 w-full md:max-w-md">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Busca de Produtos
                </label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Buscar por nome/marca..."
                    className="pl-9 border-slate-300 focus-visible:ring-slate-900"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <Button
              onClick={() => setShowCriticalOnly(!showCriticalOnly)}
              className={`font-bold tracking-wide transition-all w-full md:w-auto ${
                showCriticalOnly
                  ? 'bg-amber-600 hover:bg-amber-700 text-white ring-2 ring-amber-500 ring-offset-2'
                  : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
              }`}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              {showCriticalOnly ? 'Mostrar Todos' : 'Estoque Crítico'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-900">
              <TableRow className="hover:bg-slate-900 border-slate-800">
                <TableHead className="font-bold text-slate-50 uppercase tracking-wider text-xs whitespace-nowrap">
                  Produtos/Detalhes
                </TableHead>
                <TableHead className="font-bold text-slate-50 uppercase tracking-wider text-xs whitespace-nowrap">
                  Embalagens
                </TableHead>
                <TableHead className="font-bold text-slate-50 uppercase tracking-wider text-xs whitespace-nowrap">
                  Sala
                </TableHead>
                <TableHead className="font-bold text-slate-50 uppercase tracking-wider text-xs whitespace-nowrap text-center">
                  Validade
                </TableHead>
                <TableHead className="font-bold text-slate-50 uppercase tracking-wider text-xs whitespace-nowrap text-center">
                  Lote
                </TableHead>
                <TableHead className="font-bold text-slate-50 uppercase tracking-wider text-xs whitespace-nowrap text-right">
                  Custo
                </TableHead>
                <TableHead className="font-bold text-slate-50 uppercase tracking-wider text-xs whitespace-nowrap text-right">
                  Estoque
                </TableHead>
                <TableHead className="font-bold text-slate-50 uppercase tracking-wider text-xs whitespace-nowrap text-center">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                    Nenhum produto encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-slate-50 border-slate-100 transition-colors"
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{item.produto}</span>
                        <span className="text-xs text-slate-500">{item.marca}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600 text-sm">{item.embalagem}</TableCell>
                    <TableCell className="text-slate-600 text-sm">{item.sala}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className="font-mono text-xs border-slate-200 text-slate-600"
                      >
                        {item.validade}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-mono text-xs text-slate-500">
                      {item.lote}
                    </TableCell>
                    <TableCell className="text-right font-medium text-slate-900">
                      R$ {item.custo.toFixed(2).replace('.', ',')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span
                          className={`font-bold text-lg ${item.status === 'Crítico' ? 'text-red-600' : 'text-slate-900'}`}
                        >
                          {item.estoque}
                        </span>
                        {item.status === 'Crítico' && (
                          <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider bg-red-100 px-1 rounded">
                            Baixo
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-200"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Visualizar</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-amber-600 hover:bg-amber-100"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}

import { useState, useEffect, useMemo } from 'react'
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
  Loader2,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
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
import { fetchProdutos, Produto } from '@/services/produtos'
import { useToast } from '@/hooks/use-toast'
import { EntradaProdutoModal } from '@/components/estoque/EntradaProdutoModal'
import { SaidaProdutoModal } from '@/components/estoque/SaidaProdutoModal'
import { PackagePlus, PackageMinus } from 'lucide-react'

export default function Estoque() {
  const [searchTerm, setSearchTerm] = useState('')
  const [barcode, setBarcode] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showCriticalOnly, setShowCriticalOnly] = useState(false)
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [modalEntradaOpen, setModalEntradaOpen] = useState(false)
  const [modalSaidaOpen, setModalSaidaOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const loadData = async () => {
    setLoading(true)
    const { data, error } = await fetchProdutos()
    if (error) {
      toast({
        title: 'Erro ao carregar estoque',
        description: error.message,
        variant: 'destructive',
      })
    } else if (data) {
      setProdutos(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [toast])

  const { capitalInvestido, unidadesTotais, maiorCapital, maiorVolume } = useMemo(() => {
    let cap = 0
    let uni = 0
    const espCap: Record<string, number> = {}
    const espVol: Record<string, number> = {}

    produtos.forEach((p) => {
      const valor = p.custo_unitario * p.quantidade_estoque
      cap += valor
      uni += p.quantidade_estoque

      const especialidade = p.especialidades?.nome || 'Não Classificado'
      espCap[especialidade] = (espCap[especialidade] || 0) + valor
      espVol[especialidade] = (espVol[especialidade] || 0) + p.quantidade_estoque
    })

    const mCap = Object.entries(espCap).sort((a, b) => b[1] - a[1])[0] || ['N/A', 0]
    const mVol = Object.entries(espVol).sort((a, b) => b[1] - a[1])[0] || ['N/A', 0]

    return {
      capitalInvestido: cap,
      unidadesTotais: uni,
      maiorCapital: mCap,
      maiorVolume: mVol,
    }
  }, [produtos])

  const filteredData = produtos.filter((item) => {
    const matchesSearch =
      item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.marca?.toLowerCase() || '').includes(searchTerm.toLowerCase())

    const isCritico = item.quantidade_estoque <= item.quantidade_minima
    const matchesStatus = showCriticalOnly ? isCritico : true

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
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex gap-2 w-full md:w-auto">
            <Button
              onClick={() => setModalEntradaOpen(true)}
              className="flex-1 md:flex-none bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
            >
              <PackagePlus className="w-4 h-4 mr-2" />
              Entrada
            </Button>
            <Button
              onClick={() => setModalSaidaOpen(true)}
              variant="outline"
              className="flex-1 md:flex-none border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-slate-950 font-bold bg-slate-900/50"
            >
              <PackageMinus className="w-4 h-4 mr-2" />
              Saída
            </Button>
          </div>
          <div className="flex flex-col items-end text-amber-500 bg-slate-950/50 px-4 py-2 rounded-lg border border-slate-800 w-full md:w-auto hidden lg:flex">
            <span className="text-sm font-medium capitalize">
              {format(currentTime, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </span>
            <span className="text-2xl font-bold font-mono tracking-wider">
              {format(currentTime, 'HH:mm:ss')}
            </span>
          </div>
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
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
            ) : (
              <>
                <div className="text-2xl font-bold text-slate-900">
                  R$ {capitalInvestido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">Total em insumos</p>
              </>
            )}
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
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
            ) : (
              <>
                <div className="text-2xl font-bold text-slate-900">
                  {unidadesTotais.toLocaleString('pt-BR')}
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Total de itens armazenados
                </p>
              </>
            )}
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
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
            ) : (
              <>
                <div className="text-xl font-bold text-slate-900">{maiorCapital[0]}</div>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  R${' '}
                  {(maiorCapital[1] as number).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}{' '}
                  investidos
                </p>
              </>
            )}
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
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
            ) : (
              <>
                <div className="text-xl font-bold text-slate-900">{maiorVolume[0]}</div>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  {(maiorVolume[1] as number).toLocaleString('pt-BR')} unidades disponíveis
                </p>
              </>
            )}
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-slate-500">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p>Carregando produtos...</p>
                  </TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                    Nenhum produto encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item) => {
                  const isCritico = item.quantidade_estoque <= item.quantidade_minima
                  return (
                    <TableRow
                      key={item.id}
                      className="hover:bg-slate-50 border-slate-100 transition-colors"
                    >
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{item.nome}</span>
                          <span className="text-xs text-slate-500">
                            {item.marca || 'Sem marca'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600 text-sm">
                        {item.embalagem || '-'}
                      </TableCell>
                      <TableCell className="text-slate-600 text-sm">{item.sala || '-'}</TableCell>
                      <TableCell className="text-center">
                        {item.validade ? (
                          <Badge
                            variant="outline"
                            className="font-mono text-xs border-slate-200 text-slate-600"
                          >
                            {format(parseISO(item.validade), 'dd/MM/yyyy')}
                          </Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-center font-mono text-xs text-slate-500">
                        {item.lote || '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium text-slate-900">
                        R${' '}
                        {item.custo_unitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end">
                          <span
                            className={`font-bold text-lg ${isCritico ? 'text-red-600' : 'text-slate-900'}`}
                          >
                            {item.quantidade_estoque}
                          </span>
                          {isCritico && (
                            <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider bg-red-100 px-1 rounded mt-1">
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
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
      <EntradaProdutoModal
        open={modalEntradaOpen}
        onOpenChange={setModalEntradaOpen}
        produtos={produtos}
        onSuccess={loadData}
      />
      <SaidaProdutoModal
        open={modalSaidaOpen}
        onOpenChange={setModalSaidaOpen}
        produtos={produtos}
        onSuccess={loadData}
      />
    </div>
  )
}

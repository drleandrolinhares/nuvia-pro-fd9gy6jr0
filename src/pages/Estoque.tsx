import React, { useState, useEffect, useMemo } from 'react'
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
  Trash2,
  ChevronDown,
  ChevronRight,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { fetchProdutos, Produto, deleteProduto } from '@/services/produtos'
import { FornecedoresTab } from '@/components/estoque/FornecedoresTab'
import { ComprasTab } from '@/components/estoque/ComprasTab'
import { useToast } from '@/hooks/use-toast'
import { EntradaProdutoModal } from '@/components/estoque/EntradaProdutoModal'
import { SaidaProdutoModal } from '@/components/estoque/SaidaProdutoModal'
import { VisualizarProdutoModal } from '@/components/estoque/VisualizarProdutoModal'
import { EditarProdutoModal } from '@/components/estoque/EditarProdutoModal'
import { PackagePlus, PackageMinus } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
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

export default function Estoque() {
  const [searchTerm, setSearchTerm] = useState('')
  const [barcode, setBarcode] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showCriticalOnly, setShowCriticalOnly] = useState(false)
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [modalEntradaOpen, setModalEntradaOpen] = useState(false)
  const [modalSaidaOpen, setModalSaidaOpen] = useState(false)
  const [produtoVisualizar, setProdutoVisualizar] = useState<Produto | null>(null)
  const [produtoEditar, setProdutoEditar] = useState<Produto | null>(null)
  const [produtoExcluir, setProdutoExcluir] = useState<Produto | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [canManage, setCanManage] = useState(false)
  const [canEdit, setCanEdit] = useState(false)
  const [activeTab, setActiveTab] = useState('produtos')
  const { toast } = useToast()

  useEffect(() => {
    const checkPermission = async () => {
      const { data: gerenciar } = await supabase.rpc('has_permission', {
        permission_name: 'Gerenciar Estoque',
      })
      const { data: editar } = await supabase.rpc('has_permission', {
        permission_name: 'Editar Estoque',
      })
      setCanManage(!!gerenciar)
      setCanEdit(!!editar)
    }
    checkPermission()
  }, [])

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

  const handleDelete = async () => {
    if (!produtoExcluir) return

    setIsDeleting(true)
    const { error } = await deleteProduto(produtoExcluir.id)

    if (error) {
      toast({
        title: 'Erro ao excluir produto',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Produto excluído',
        description: 'O produto foi removido com sucesso.',
      })
      loadData()
    }

    setIsDeleting(false)
    setProdutoExcluir(null)
  }

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

  const groupedData = useMemo(() => {
    const groups: Record<string, Produto[]> = {}
    filteredData.forEach((p) => {
      if (!groups[p.nome]) {
        groups[p.nome] = []
      }
      groups[p.nome].push(p)
    })

    return Object.entries(groups)
      .map(([nome, items]) => {
        const quantidadeTotal = items.reduce((acc, item) => acc + item.quantidade_estoque, 0)
        const isCritico = items.some((item) => item.quantidade_estoque <= item.quantidade_minima)
        return {
          nome,
          items,
          quantidadeTotal,
          isCritico,
        }
      })
      .sort((a, b) => a.nome.localeCompare(b.nome))
  }, [filteredData])

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  const toggleGroup = (nome: string) => {
    const newSet = new Set(expandedGroups)
    if (newSet.has(nome)) {
      newSet.delete(nome)
    } else {
      newSet.add(nome)
    }
    setExpandedGroups(newSet)
  }

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
          {canManage && activeTab === 'produtos' && (
            <div className="flex gap-2 w-full md:w-auto animate-in fade-in zoom-in duration-200">
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
          )}
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-900/5 p-1 h-auto flex flex-wrap max-w-fit">
          <TabsTrigger
            value="produtos"
            className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 font-bold px-6 py-2 rounded-md transition-all"
          >
            Produtos
          </TabsTrigger>
          {canManage && (
            <>
              <TabsTrigger
                value="fornecedores"
                className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 font-bold px-6 py-2 rounded-md transition-all"
              >
                Fornecedores
              </TabsTrigger>
              <TabsTrigger
                value="compras"
                className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 font-bold px-6 py-2 rounded-md transition-all"
              >
                Compras
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="produtos" className="space-y-6 mt-0 border-none p-0 outline-none">
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
                  ) : groupedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                        Nenhum produto encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    groupedData.map((group) => {
                      const isExpanded = expandedGroups.has(group.nome)
                      return (
                        <React.Fragment key={group.nome}>
                          <TableRow
                            className="hover:bg-slate-50 border-slate-100 transition-colors cursor-pointer bg-slate-50/50"
                            onClick={() => toggleGroup(group.nome)}
                          >
                            <TableCell className="font-bold text-slate-900">
                              <div className="flex items-center gap-2">
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4 text-slate-500" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-slate-500" />
                                )}
                                {group.nome}
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-500 text-sm">
                              {group.items.length} variação(ões)
                            </TableCell>
                            <TableCell className="text-slate-400 text-sm">-</TableCell>
                            <TableCell className="text-slate-400 text-center">-</TableCell>
                            <TableCell className="text-slate-400 text-center">-</TableCell>
                            <TableCell className="text-slate-400 text-right">-</TableCell>
                            <TableCell className="text-right">
                              <div className="flex flex-col items-end">
                                <span
                                  className={`font-bold text-lg ${group.isCritico ? 'text-red-600' : 'text-slate-900'}`}
                                >
                                  {group.quantidadeTotal}
                                </span>
                                {group.isCritico && (
                                  <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider bg-red-100 px-1 rounded mt-1">
                                    Baixo
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center text-slate-400">-</TableCell>
                          </TableRow>
                          {isExpanded &&
                            group.items.map((item) => {
                              const isCritico = item.quantidade_estoque <= item.quantidade_minima
                              return (
                                <TableRow
                                  key={item.id}
                                  className="hover:bg-slate-50 border-slate-100 transition-colors bg-white"
                                >
                                  <TableCell className="pl-8">
                                    <div className="flex flex-col border-l-2 border-slate-200 pl-3">
                                      <span className="font-medium text-slate-700">
                                        {item.marca || 'Sem marca'}
                                      </span>
                                      {item.variacao && (
                                        <span className="text-xs text-slate-500">
                                          {item.variacao}
                                        </span>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-slate-600 text-sm">
                                    {item.embalagens?.nome || item.embalagem || '-'}
                                  </TableCell>
                                  <TableCell className="text-slate-600 text-sm">
                                    {item.salas?.nome || item.sala || '-'}
                                  </TableCell>
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
                                    {item.custo_unitario.toLocaleString('pt-BR', {
                                      minimumFractionDigits: 2,
                                    })}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex flex-col items-end">
                                      <span
                                        className={`font-bold ${isCritico ? 'text-red-600' : 'text-slate-900'}`}
                                      >
                                        {item.quantidade_estoque}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center justify-center gap-2">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setProdutoVisualizar(item)}
                                        className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-200"
                                      >
                                        <Eye className="h-4 w-4" />
                                        <span className="sr-only">Visualizar</span>
                                      </Button>
                                      {canEdit && (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => setProdutoEditar(item)}
                                          className="h-8 w-8 text-slate-500 hover:text-amber-600 hover:bg-amber-100"
                                        >
                                          <Edit className="h-4 w-4" />
                                          <span className="sr-only">Editar</span>
                                        </Button>
                                      )}
                                      {canManage && (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => setProdutoExcluir(item)}
                                          className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-100"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                          <span className="sr-only">Excluir</span>
                                        </Button>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                        </React.Fragment>
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
          <VisualizarProdutoModal
            open={!!produtoVisualizar}
            onOpenChange={(open) => !open && setProdutoVisualizar(null)}
            produto={produtoVisualizar}
          />
          <EditarProdutoModal
            open={!!produtoEditar}
            onOpenChange={(open) => !open && setProdutoEditar(null)}
            produto={produtoEditar}
            onSuccess={loadData}
          />
          <AlertDialog
            open={!!produtoExcluir}
            onOpenChange={(open) => !open && !isDeleting && setProdutoExcluir(null)}
          >
            <AlertDialogContent className="sm:max-w-[425px]">
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir Produto</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir o produto{' '}
                  <strong className="text-slate-900">{produtoExcluir?.nome}</strong>? Esta ação
                  removerá o item permanentemente e não poderá ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault()
                    handleDelete()
                  }}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600"
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>

        {canManage && (
          <TabsContent value="fornecedores" className="mt-0 border-none p-0 outline-none">
            <FornecedoresTab />
          </TabsContent>
        )}

        {canManage && (
          <TabsContent value="compras" className="mt-0 border-none p-0 outline-none">
            <ComprasTab />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

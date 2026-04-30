import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import {
  getMeusPedidos,
  saveRascunho,
  enviarPedido,
  getCycleString,
  PedidoItem,
  PedidoMaterial,
} from '@/services/pedidos'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Trash2, Search, Save, Send, PlusCircle } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'

export default function NovosPedidos() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [cicloAtual] = useState(getCycleString())
  const [pedidoAtivo, setPedidoAtivo] = useState<PedidoMaterial | null>(null)
  const [itens, setItens] = useState<PedidoItem[]>([])
  const [observacoes, setObservacoes] = useState('')
  const [busca, setBusca] = useState('')
  const [produtos, setProdutos] = useState<any[]>([])
  const [bloqueado, setBloqueado] = useState(false)

  const loadPedidos = async () => {
    if (!user) return
    const pedidos = await getMeusPedidos(user.id, cicloAtual)
    const enviado = pedidos.find((p) => p.status === 'enviado' || p.status === 'entregue')
    if (enviado) {
      setBloqueado(true)
      setPedidoAtivo(enviado)
      return
    }
    const rascunho = pedidos.find((p) => p.status === 'rascunho')
    if (rascunho) {
      setPedidoAtivo(rascunho)
      setItens(rascunho.itens || [])
      setObservacoes(rascunho.observacoes || '')
    }
  }

  useEffect(() => {
    loadPedidos()
  }, [user])

  const searchProdutos = async (q: string) => {
    if (q.length < 2) return setProdutos([])
    const { data } = await supabase
      .from('produtos')
      .select('id, nome, marca, variacao, custo_unitario, quantidade_estoque')
      .ilike('nome', `%${q}%`)
      .limit(10)
    setProdutos(data || [])
  }

  const addItem = (p: any) => {
    const existing = itens.find((i) => i.produto_id === p.id)
    if (existing) {
      setItens(
        itens.map((i) =>
          i.produto_id === p.id
            ? {
                ...i,
                quantidade: i.quantidade + 1,
                valor_total: (i.quantidade + 1) * i.preco_unitario,
              }
            : i,
        ),
      )
    } else {
      setItens([
        {
          produto_id: p.id,
          quantidade: 1,
          preco_unitario: p.custo_unitario || 0,
          valor_total: p.custo_unitario || 0,
          produto: p,
        },
        ...itens,
      ])
    }
    setBusca('')
    setProdutos([])
  }

  const updateQtd = (idx: number, qtd: number) => {
    if (qtd < 1) return
    const newItens = [...itens]
    newItens[idx].quantidade = qtd
    newItens[idx].valor_total = qtd * newItens[idx].preco_unitario
    setItens(newItens)
  }

  const handleSave = async () => {
    if (!user) return
    try {
      await saveRascunho(user.id, itens, observacoes)
      toast({ title: 'Rascunho Salvo', description: 'Seu pedido foi salvo para continuar depois.' })
      loadPedidos()
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  const handleSend = async () => {
    if (!user || itens.length === 0)
      return toast({
        title: 'Erro',
        description: 'Adicione itens ao pedido.',
        variant: 'destructive',
      })
    if (!confirm('Tem certeza que deseja enviar o pedido? Você não poderá mais alterá-lo.')) return
    try {
      const pid = await saveRascunho(user.id, itens, observacoes)
      await enviarPedido(pid)
      toast({ title: 'Sucesso', description: 'Pedido enviado com sucesso!' })
      loadPedidos()
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  if (bloqueado) {
    return (
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl text-center space-y-4">
        <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
        <h2 className="text-xl font-bold text-white uppercase">Pedido já enviado esta semana</h2>
        <p className="text-slate-400">
          Você já possui um pedido ({pedidoAtivo?.status}) para o ciclo {cicloAtual}.<br />
          Aguarde o próximo ciclo para realizar novas solicitações.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-6">
      <div className="flex items-center gap-4 relative">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value)
              searchProdutos(e.target.value)
            }}
            placeholder="Buscar produto para adicionar ao pedido..."
            className="pl-10 bg-slate-950 border-slate-800 h-12"
          />
          {produtos.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-md shadow-xl z-50 overflow-hidden max-h-64 overflow-y-auto custom-scrollbar">
              {produtos.map((p) => (
                <div
                  key={p.id}
                  onClick={() => addItem(p)}
                  className="p-3 hover:bg-slate-700 cursor-pointer flex justify-between items-center border-b border-slate-700/50 last:border-0 text-slate-200"
                >
                  <div>
                    <div className="font-bold">{p.nome}</div>
                    <div className="text-xs text-slate-400">
                      {p.marca} {p.variacao ? ` - ${p.variacao}` : ''} | Estoque:{' '}
                      {p.quantidade_estoque || 0}
                    </div>
                  </div>
                  <PlusCircle className="w-4 h-4 text-amber-500" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border border-slate-800 rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-950">
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead className="text-slate-400">Produto</TableHead>
              <TableHead className="text-slate-400 w-32">Quantidade</TableHead>
              <TableHead className="text-slate-400 w-16 text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-slate-900">
            {itens.length === 0 ? (
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableCell colSpan={3} className="text-center py-8 text-slate-500">
                  Nenhum item adicionado.
                </TableCell>
              </TableRow>
            ) : (
              itens.map((it, idx) => (
                <TableRow key={idx} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell className="font-medium text-slate-200">
                    {it.produto?.nome || 'Produto Indisponível'}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="1"
                      value={it.quantidade}
                      onChange={(e) => updateQtd(idx, parseInt(e.target.value) || 1)}
                      className="bg-slate-950 border-slate-800 h-8"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setItens(itens.filter((_, i) => i !== idx))}
                      className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 h-8 w-8"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div>
        <Textarea
          placeholder="Observações do pedido (opcional)..."
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          className="bg-slate-950 border-slate-800 resize-none h-24"
        />
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t border-slate-800">
        <Button
          variant="outline"
          onClick={handleSave}
          className="border-slate-700 hover:bg-slate-800 text-slate-300"
        >
          <Save className="w-4 h-4 mr-2" /> Salvar Rascunho
        </Button>
        <Button
          onClick={handleSend}
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold uppercase tracking-wider text-xs"
        >
          <Send className="w-4 h-4 mr-2" /> Enviar Pedido
        </Button>
      </div>
    </div>
  )
}

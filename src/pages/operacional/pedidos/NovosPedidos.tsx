import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
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
import { Trash2, Save, Send, PlusCircle, CheckCircle, AlertCircle } from 'lucide-react'
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
  const [bloqueado, setBloqueado] = useState(false)

  const [novaDescricao, setNovaDescricao] = useState('')
  const [novaQtd, setNovaQtd] = useState(1)

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

  const addItem = () => {
    if (!novaDescricao.trim()) {
      toast({
        title: 'Erro',
        description: 'Informe a descrição do material.',
        variant: 'destructive',
      })
      return
    }

    const existingIdx = itens.findIndex(
      (i) =>
        i.descricao_item?.toLowerCase() === novaDescricao.toLowerCase().trim() ||
        i.produto?.nome.toLowerCase() === novaDescricao.toLowerCase().trim(),
    )

    if (existingIdx >= 0) {
      const newItens = [...itens]
      newItens[existingIdx].quantidade += novaQtd
      setItens(newItens)
    } else {
      setItens([
        {
          descricao_item: novaDescricao.trim(),
          quantidade: novaQtd,
          preco_unitario: 0,
          valor_total: 0,
        },
        ...itens,
      ])
    }
    setNovaDescricao('')
    setNovaQtd(1)
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
      <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl mb-6">
        <h3 className="font-bold text-amber-500 flex items-center gap-2 mb-2">
          <AlertCircle className="w-5 h-5" /> Regras Importantes
        </h3>
        <ul className="list-disc pl-5 space-y-1 text-sm text-amber-200/90">
          <li>Pedidos podem ser salvos como rascunho ao longo da semana.</li>
          <li>O limite para envio do pedido é sexta-feira até as 11:00 AM.</li>
          <li>É permitida apenas uma solicitação de materiais por semana.</li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row items-end gap-4 bg-slate-950/50 p-4 rounded-lg border border-slate-800">
        <div className="flex-1 w-full space-y-1.5">
          <label className="text-xs font-bold text-slate-300 uppercase">
            Descrição do Material
          </label>
          <Input
            value={novaDescricao}
            onChange={(e) => setNovaDescricao(e.target.value)}
            placeholder="Ex: Luvas de procedimento M, Algodão..."
            className="bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500 h-11 focus-visible:ring-amber-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') addItem()
            }}
          />
        </div>
        <div className="w-full sm:w-32 space-y-1.5">
          <label className="text-xs font-bold text-slate-300 uppercase">Quantidade</label>
          <Input
            type="number"
            min="1"
            value={novaQtd}
            onChange={(e) => setNovaQtd(parseInt(e.target.value) || 1)}
            className="bg-slate-900 border-slate-700 text-slate-100 h-11 focus-visible:ring-amber-500 text-center"
            onKeyDown={(e) => {
              if (e.key === 'Enter') addItem()
            }}
          />
        </div>
        <Button
          onClick={addItem}
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold h-11 w-full sm:w-auto px-6"
        >
          <PlusCircle className="w-4 h-4 mr-2" /> Adicionar
        </Button>
      </div>

      <div className="border border-slate-800 rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-950">
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead className="text-slate-400">Material Solicitado</TableHead>
              <TableHead className="text-slate-400 w-32 text-center">Quantidade</TableHead>
              <TableHead className="text-slate-400 w-16 text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-slate-900">
            {itens.length === 0 ? (
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableCell colSpan={3} className="text-center py-8 text-slate-500">
                  Nenhum item adicionado ao pedido.
                </TableCell>
              </TableRow>
            ) : (
              itens.map((it, idx) => (
                <TableRow key={idx} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell className="font-medium text-slate-200">
                    {it.descricao_item || it.produto?.nome || 'Item não especificado'}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="1"
                      value={it.quantidade}
                      onChange={(e) => updateQtd(idx, parseInt(e.target.value) || 1)}
                      className="bg-slate-950 border-slate-700 text-slate-200 h-9 text-center focus-visible:ring-amber-500"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setItens(itens.filter((_, i) => i !== idx))}
                      className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 h-9 w-9"
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
        <label className="text-xs font-bold text-slate-300 uppercase mb-1.5 block">
          Observações do Pedido
        </label>
        <Textarea
          placeholder="Ex: Por favor, enviar até quinta-feira se possível..."
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          className="bg-slate-950 border-slate-700 text-slate-200 placeholder:text-slate-500 resize-none h-24 focus-visible:ring-amber-500"
        />
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t border-slate-800">
        <Button
          variant="outline"
          onClick={handleSave}
          className="border-slate-700 hover:bg-slate-800 text-slate-300 font-medium"
        >
          <Save className="w-4 h-4 mr-2" /> Salvar Rascunho
        </Button>
        <Button
          onClick={handleSend}
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold uppercase tracking-wider text-xs px-6"
        >
          <Send className="w-4 h-4 mr-2" /> Enviar Pedido
        </Button>
      </div>
    </div>
  )
}

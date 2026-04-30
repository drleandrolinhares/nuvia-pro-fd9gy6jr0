import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import {
  getMeusPedidos,
  saveRascunho,
  enviarPedido,
  retomarRascunho,
  getCycleString,
  PedidoItem,
  PedidoMaterial,
} from '@/services/pedidos'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Trash2, Save, Send, PlusCircle, CheckCircle, AlertCircle, RotateCcw } from 'lucide-react'
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
    setBloqueado(false)
    const rascunho = pedidos.find((p) => p.status === 'rascunho')
    if (rascunho) {
      setPedidoAtivo(rascunho)
      setItens(rascunho.itens || [])
      setObservacoes(rascunho.observacoes || '')
    } else {
      setPedidoAtivo(null)
      setItens([])
      setObservacoes('')
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
        (i.descricao_item?.toLowerCase() || '') === novaDescricao.toLowerCase().trim() ||
        (i.produto?.nome?.toLowerCase() || '') === novaDescricao.toLowerCase().trim(),
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

  const handleRetomar = async () => {
    if (!pedidoAtivo || pedidoAtivo.status !== 'enviado') return
    try {
      await retomarRascunho(pedidoAtivo.id)
      toast({ title: 'Sucesso', description: 'Pedido voltou para rascunho. Você pode editá-lo.' })
      loadPedidos()
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  if (bloqueado && pedidoAtivo) {
    const canEdit =
      pedidoAtivo.status === 'enviado' && pedidoAtivo.ciclo_entrega === getCycleString()

    return (
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl space-y-6">
        <div className="text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
          <h2 className="text-2xl font-bold text-white uppercase tracking-tight">
            Pedido já enviado esta semana
          </h2>
          <p className="text-slate-300 text-lg">
            Você já possui um pedido ({pedidoAtivo.status}) para o ciclo {cicloAtual}.
          </p>
          {canEdit ? (
            <p className="text-amber-400 font-medium bg-amber-500/10 p-3 rounded-lg inline-block border border-amber-500/20">
              Você pode retroceder o envio para adicionar ou remover produtos até sexta-feira às
              11:00.
            </p>
          ) : (
            <p className="text-slate-400">
              Aguarde o próximo ciclo para realizar novas solicitações.
            </p>
          )}
        </div>

        <div className="border border-slate-800 rounded-lg overflow-hidden mt-8">
          <Table>
            <TableHeader className="bg-slate-950">
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400 font-bold uppercase text-xs">
                  Material Solicitado
                </TableHead>
                <TableHead className="text-slate-400 font-bold uppercase text-xs w-32 text-center">
                  Quantidade
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-slate-900">
              {pedidoAtivo.itens?.map((it, idx) => (
                <TableRow key={idx} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell className="font-medium text-slate-200 text-base">
                    {it.descricao_item || it.produto?.nome || 'Item não especificado'}
                  </TableCell>
                  <TableCell className="text-center text-amber-500 font-bold text-base">
                    {it.quantidade} UN
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {pedidoAtivo.observacoes && (
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg mt-4">
            <span className="text-xs font-bold text-slate-400 uppercase block mb-1">
              Observações do Pedido:
            </span>
            <p className="text-slate-300 text-sm italic">"{pedidoAtivo.observacoes}"</p>
          </div>
        )}

        {canEdit && (
          <div className="flex justify-center pt-6 border-t border-slate-800 mt-6">
            <Button
              onClick={handleRetomar}
              size="lg"
              className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-white font-bold uppercase tracking-wider"
            >
              <RotateCcw className="w-5 h-5 mr-2 text-amber-500" /> Editar / Retomar Rascunho
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-6">
      <div className="py-2 mb-6 border-b border-slate-800/50 pb-4">
        <h3 className="font-bold text-slate-200 flex items-center gap-2 mb-2 text-sm uppercase tracking-wider">
          <AlertCircle className="w-4 h-4 text-slate-400" /> Lembretes Rápidos
        </h3>
        <ul className="list-disc pl-6 space-y-1 text-sm text-slate-400 font-medium">
          <li>Pedidos podem ser salvos como rascunho ao longo da semana.</li>
          <li>
            O limite para envio do pedido é{' '}
            <strong className="text-amber-500">sexta-feira até as 11:00 AM</strong>.
          </li>
          <li>
            É permitida <strong className="text-amber-500">apenas uma solicitação</strong> de
            materiais por semana.
          </li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row items-end gap-4 bg-slate-950/80 p-5 rounded-xl border border-slate-800 shadow-inner">
        <div className="flex-1 w-full space-y-2">
          <label className="text-sm font-bold text-slate-300 uppercase tracking-wide">
            Descrição do Material
          </label>
          <Input
            value={novaDescricao}
            onChange={(e) => setNovaDescricao(e.target.value)}
            placeholder="Ex: Luvas de procedimento M, Algodão..."
            className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 text-base h-12 focus-visible:ring-amber-500 shadow-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') addItem()
            }}
          />
        </div>
        <div className="w-full sm:w-32 space-y-2">
          <label className="text-sm font-bold text-slate-300 uppercase tracking-wide">
            Quantidade
          </label>
          <Input
            type="number"
            min="1"
            value={novaQtd}
            onChange={(e) => setNovaQtd(parseInt(e.target.value) || 1)}
            className="bg-slate-900 border-slate-700 text-white text-base h-12 focus-visible:ring-amber-500 text-center shadow-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') addItem()
            }}
          />
        </div>
        <Button
          onClick={addItem}
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold h-12 w-full sm:w-auto px-8 text-sm uppercase tracking-wider shadow-sm transition-all active:scale-95"
        >
          <PlusCircle className="w-5 h-5 mr-2" /> Adicionar
        </Button>
      </div>

      <div className="border border-slate-800 rounded-lg overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-950">
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead className="text-slate-400 font-bold uppercase text-xs">
                Material Solicitado
              </TableHead>
              <TableHead className="text-slate-400 font-bold uppercase text-xs w-32 text-center">
                Quantidade
              </TableHead>
              <TableHead className="text-slate-400 font-bold uppercase text-xs w-20 text-center">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-slate-900">
            {itens.length === 0 ? (
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableCell colSpan={3} className="text-center py-10 text-slate-500 font-medium">
                  Nenhum item adicionado ao pedido.
                </TableCell>
              </TableRow>
            ) : (
              itens.map((it, idx) => (
                <TableRow
                  key={idx}
                  className="border-slate-800 hover:bg-slate-800/50 transition-colors"
                >
                  <TableCell className="font-medium text-slate-200 text-base">
                    {it.descricao_item || it.produto?.nome || 'Item não especificado'}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="1"
                      value={it.quantidade}
                      onChange={(e) => updateQtd(idx, parseInt(e.target.value) || 1)}
                      className="bg-slate-950 border-slate-700 text-white font-bold h-10 text-center focus-visible:ring-amber-500"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setItens(itens.filter((_, i) => i !== idx))}
                      className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 h-10 w-10 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div>
        <label className="text-sm font-bold text-slate-300 uppercase tracking-wide mb-2 block">
          Observações do Pedido
        </label>
        <Textarea
          placeholder="Ex: Por favor, enviar até quinta-feira se possível..."
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-500 text-base resize-none h-28 focus-visible:ring-amber-500 shadow-sm"
        />
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t border-slate-800 mt-6">
        <Button
          variant="outline"
          onClick={handleSave}
          className="border-slate-700 hover:bg-slate-800 text-slate-300 font-bold uppercase tracking-wider text-xs px-6 h-12"
        >
          <Save className="w-5 h-5 mr-2" /> Salvar Rascunho
        </Button>
        <Button
          onClick={handleSend}
          className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold uppercase tracking-widest text-sm px-8 h-12 shadow-md transition-all active:scale-95"
        >
          <Send className="w-5 h-5 mr-2" /> Enviar Pedido
        </Button>
      </div>
    </div>
  )
}

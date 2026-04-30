import { supabase } from '@/lib/supabase/client'

export interface PedidoItem {
  id?: string
  pedido_id?: string
  produto_id: string
  quantidade: number
  preco_unitario: number
  valor_total: number
  produto?: { nome: string; marca: string; variacao: string; quantidade_estoque?: number }
}

export interface PedidoMaterial {
  id: string
  usuario_id: string
  status: 'rascunho' | 'enviado' | 'entregue' | 'cancelado'
  ciclo_entrega: string
  data_criacao: string
  data_envio?: string
  data_entrega?: string
  entregue_por?: string
  valor_total: number
  observacoes?: string
  usuario?: { nome: string; email: string }
  itens?: PedidoItem[]
}

export const getCycleString = (date: Date = new Date()) => {
  const d = new Date(date)
  const day = d.getDay()
  const hours = d.getHours()

  if (day === 5 && hours >= 11) d.setDate(d.getDate() + 7)
  else if (day === 6) d.setDate(d.getDate() + 6)
  else if (day === 0) d.setDate(d.getDate() + 5)
  else d.setDate(d.getDate() + (5 - day))

  const offset = d.getTimezoneOffset()
  const local = new Date(d.getTime() - offset * 60 * 1000)
  return local.toISOString().split('T')[0]
}

export const getMeusPedidos = async (usuario_id: string, ciclo: string) => {
  const { data, error } = await supabase
    .from('pedidos_materiais')
    .select('*, itens:pedido_itens(*, produto:produtos(nome, marca, variacao))')
    .eq('usuario_id', usuario_id)
    .eq('ciclo_entrega', ciclo)
    .order('data_criacao', { ascending: false })
  if (error) throw error
  return data as PedidoMaterial[]
}

export const getPedidosRecebidos = async (ciclo?: string) => {
  let query = supabase
    .from('pedidos_materiais')
    .select(
      '*, usuario:usuarios(nome, email), itens:pedido_itens(*, produto:produtos(nome, marca, variacao))',
    )
    .in('status', ['enviado', 'entregue'])
    .order('data_envio', { ascending: false })

  if (ciclo) query = query.eq('ciclo_entrega', ciclo)

  const { data, error } = await query
  if (error) throw error
  return data as PedidoMaterial[]
}

export const saveRascunho = async (
  usuario_id: string,
  itens: PedidoItem[],
  observacoes: string,
) => {
  const ciclo = getCycleString()
  const valor_total = itens.reduce((acc, item) => acc + item.quantidade * item.preco_unitario, 0)

  const { data: rascunho } = await supabase
    .from('pedidos_materiais')
    .select('id')
    .eq('usuario_id', usuario_id)
    .eq('ciclo_entrega', ciclo)
    .eq('status', 'rascunho')
    .maybeSingle()

  let pedidoId = rascunho?.id

  if (pedidoId) {
    await supabase.from('pedidos_materiais').update({ valor_total, observacoes }).eq('id', pedidoId)
    await supabase.from('pedido_itens').delete().eq('pedido_id', pedidoId)
  } else {
    const { data: novo, error } = await supabase
      .from('pedidos_materiais')
      .insert({ usuario_id, ciclo_entrega: ciclo, status: 'rascunho', valor_total, observacoes })
      .select('id')
      .single()
    if (error) throw error
    pedidoId = novo.id
  }

  if (itens.length > 0) {
    const toInsert = itens.map((i) => ({
      pedido_id: pedidoId,
      produto_id: i.produto_id,
      quantidade: i.quantidade,
      preco_unitario: i.preco_unitario,
      valor_total: i.valor_total,
    }))
    const { error: iErr } = await supabase.from('pedido_itens').insert(toInsert)
    if (iErr) throw iErr
  }
  return pedidoId
}

export const enviarPedido = async (pedidoId: string) => {
  const { error } = await supabase
    .from('pedidos_materiais')
    .update({ status: 'enviado', data_envio: new Date().toISOString() })
    .eq('id', pedidoId)
    .eq('status', 'rascunho')
  if (error) throw error
}

export const entregarPedido = async (pedidoId: string, entregue_por: string) => {
  const { data: pedido, error: pedError } = await supabase
    .from('pedidos_materiais')
    .select('*, itens:pedido_itens(*)')
    .eq('id', pedidoId)
    .single()
  if (pedError || !pedido) throw pedError || new Error('Pedido não encontrado')

  const { error: updError } = await supabase
    .from('pedidos_materiais')
    .update({ status: 'entregue', data_entrega: new Date().toISOString(), entregue_por })
    .eq('id', pedidoId)
  if (updError) throw updError

  const saidas = pedido.itens.map((i) => ({
    produto_id: i.produto_id,
    quantidade: i.quantidade,
    tipo_saida: 'definitiva',
    descricao: `Entrega de material (Pedido #${pedido.id.substring(0, 8)})`,
    usuario_id: pedido.usuario_id,
  }))

  if (saidas.length > 0) await supabase.from('saida_produtos').insert(saidas)
}

export const getRelatorioPedidos = async (startDate: string, endDate: string) => {
  const { data, error } = await supabase
    .from('pedidos_materiais')
    .select('*, usuario:usuarios(nome), itens:pedido_itens(quantidade)')
    .eq('status', 'entregue')
    .gte('data_entrega', startDate + 'T00:00:00Z')
    .lte('data_entrega', endDate + 'T23:59:59Z')
  if (error) throw error
  return data
}

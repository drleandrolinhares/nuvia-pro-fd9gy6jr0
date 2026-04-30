import { useState, useEffect } from 'react'
import {
  getPedidosRecebidos,
  getCycleString,
  entregarPedido,
  PedidoMaterial,
} from '@/services/pedidos'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { PackageOpen, CheckCircle2, ChevronDown, Clock } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

export default function PedidosRecebidos() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [cicloAtual] = useState(getCycleString())
  const [pedidos, setPedidos] = useState<PedidoMaterial[]>([])

  const load = async () => {
    try {
      const data = await getPedidosRecebidos(cicloAtual)
      setPedidos(data)
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleEntregar = async (id: string) => {
    if (!user) return
    if (!confirm('Confirmar entrega dos materiais ao colaborador? O estoque será atualizado.'))
      return
    try {
      await entregarPedido(id, user.id)
      toast({ title: 'Sucesso', description: 'Pedido marcado como entregue.' })
      load()
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4 pb-10">
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <h2 className="text-lg font-bold text-white">
          Ciclo Atual:{' '}
          <span className="text-amber-500">
            {format(new Date(cicloAtual + 'T12:00:00'), 'dd/MM/yyyy', { locale: ptBR })}
          </span>
        </h2>
        <div className="text-sm text-slate-400">
          Mostrando pedidos enviados e entregues desta semana.
        </div>
      </div>

      {pedidos.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-xl">
          <PackageOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">Nenhum pedido recebido neste ciclo.</p>
        </div>
      ) : (
        pedidos.map((p) => (
          <Collapsible
            key={p.id}
            className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden group"
          >
            <CollapsibleTrigger className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-4">
                <div
                  className={`p-2 rounded-full ${p.status === 'entregue' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-blue-500/20 text-blue-500'}`}
                >
                  {p.status === 'entregue' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Clock className="w-5 h-5" />
                  )}
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-200">
                    {p.usuario?.nome || 'Desconhecido'}
                  </div>
                  <div className="text-xs text-slate-400">
                    Enviado em: {format(new Date(p.data_envio!), "dd/MM 'às' HH:mm")}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full border ${p.status === 'entregue' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-blue-500/30 text-blue-400 bg-blue-500/10'}`}
                >
                  {p.status}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-500 transition-transform group-data-[state=open]:rotate-180" />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="border-t border-slate-800 bg-slate-950 p-4">
              <div className="space-y-4">
                <div className="text-sm font-medium text-slate-300 uppercase tracking-wider mb-2">
                  Itens Solicitados ({p.itens?.length})
                </div>
                <ul className="space-y-2">
                  {p.itens?.map((it) => (
                    <li
                      key={it.id}
                      className="flex justify-between items-center bg-slate-900 p-2 rounded border border-slate-800"
                    >
                      <span className="text-sm text-slate-300">{it.produto?.nome}</span>
                      <span className="text-xs font-bold bg-slate-800 px-2 py-1 rounded text-amber-500">
                        {it.quantidade} UN
                      </span>
                    </li>
                  ))}
                </ul>
                {p.observacoes && (
                  <div className="text-sm text-slate-400 bg-slate-900 p-3 rounded border border-slate-800 italic">
                    "{p.observacoes}"
                  </div>
                )}
                {p.status === 'enviado' && (
                  <div className="flex justify-end pt-4 border-t border-slate-800 mt-4">
                    <Button
                      onClick={() => handleEntregar(p.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-wider text-xs"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Marcar como Entregue
                    </Button>
                  </div>
                )}
                {p.status === 'entregue' && p.data_entrega && (
                  <div className="text-xs text-slate-500 text-right mt-4 border-t border-slate-800 pt-4">
                    Entregue em: {format(new Date(p.data_entrega), 'dd/MM/yyyy HH:mm')}
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))
      )}
    </div>
  )
}

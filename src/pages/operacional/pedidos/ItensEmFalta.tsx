import { useState, useEffect } from 'react'
import { getItensEmFalta, resolverItemFalta } from '@/services/pedidos'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { PackageX, CheckCircle2, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'

export default function ItensEmFalta() {
  const { toast } = useToast()
  const [itens, setItens] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      setLoading(true)
      const data = await getItensEmFalta()
      setItens(data)
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleResolver = async (id: string) => {
    if (!confirm('Confirmar que este item foi comprado/reposto e não está mais em falta?')) return
    try {
      await resolverItemFalta(id)
      toast({ title: 'Sucesso', description: 'Item marcado como resolvido.' })
      load()
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  // Agrupar itens por nome do produto
  const agrupados = itens.reduce(
    (acc, item) => {
      const nome = item.produto?.nome || item.descricao_item || 'Desconhecido'
      if (!acc[nome]) {
        acc[nome] = { nome, total: 0, items: [] }
      }
      acc[nome].total += item.quantidade
      acc[nome].items.push(item)
      return acc
    },
    {} as Record<string, any>,
  )

  const gruposArray = Object.values(agrupados).sort((a, b) => b.total - a.total)

  if (loading) return <div className="p-8 text-center text-slate-400">Carregando...</div>

  return (
    <div className="space-y-4 pb-10">
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <PackageX className="w-5 h-5 text-red-500" />
          Itens em Falta ({itens.length})
        </h2>
        <div className="text-sm text-slate-400">Lista de itens pendentes de reposição</div>
      </div>

      {gruposArray.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-xl">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">Nenhum item em falta no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {gruposArray.map((grupo, idx) => (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
            >
              <div className="bg-slate-800/50 p-4 flex justify-between items-center border-b border-slate-800">
                <h3 className="font-bold text-white text-lg">{grupo.nome}</h3>
                <div className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full font-bold text-sm flex items-center gap-2">
                  Total em falta: {grupo.total} UN
                </div>
              </div>
              <div className="p-4 space-y-3">
                {grupo.items.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800 gap-3"
                  >
                    <div>
                      <div className="text-sm text-slate-300 font-medium">
                        Solicitado por:{' '}
                        <span className="text-amber-500">
                          {item.pedido?.usuario?.nome || 'Desconhecido'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Data:{' '}
                        {item.pedido?.data_criacao
                          ? format(new Date(item.pedido.data_criacao), "dd/MM/yyyy 'às' HH:mm")
                          : '-'}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold text-slate-300 bg-slate-800 px-3 py-1 rounded">
                        {item.quantidade} UN
                      </span>
                      <Button
                        onClick={() => handleResolver(item.id)}
                        variant="outline"
                        size="sm"
                        className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500 hover:text-white transition-colors"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Reposto
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

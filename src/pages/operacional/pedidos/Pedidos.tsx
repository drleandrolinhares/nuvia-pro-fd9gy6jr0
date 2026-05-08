import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Package } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import NovosPedidos from './NovosPedidos'
import PedidosRecebidos from './PedidosRecebidos'
import RelatoriosPedidos from './RelatoriosPedidos'
import ItensEmFalta from './ItensEmFalta'

export default function Pedidos() {
  const { permissions, profile } = useAuth()
  const canManage =
    permissions.includes('operacional_pedidos_gerenciar') || profile?.role === 'admin'
  const [tab, setTab] = useState('novos')

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 bg-slate-900 p-6 rounded-xl border-l-4 border-amber-500 shadow-sm shrink-0">
        <div className="p-3 bg-slate-800 rounded-lg">
          <Package className="w-6 h-6 text-amber-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Pedidos</h1>
          <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mt-1">
            Requisição semanal de insumos para o almoxarifado
          </p>
        </div>
      </div>

      <div className="bg-white py-4 px-5 text-base text-slate-700 shrink-0 border border-slate-200 rounded-lg my-2">
        <strong className="text-slate-900 block mb-2 text-sm uppercase tracking-wider flex items-center gap-2 font-bold">
          <Package className="w-4 h-4 text-slate-500" /> Regras Importantes:
        </strong>
        <ul className="list-disc pl-6 space-y-1 font-medium text-sm">
          <li>
            Todos os pedidos podem ser lançados diariamente até{' '}
            <strong className="text-amber-600">Sexta-feira às 11:00 da manhã</strong>.
          </li>
          <li>
            Cada colaborador tem direito a fazer{' '}
            <strong className="text-amber-600">apenas uma retirada</strong> de produtos por semana.
          </li>
          <li>
            Os produtos serão separados e entregues pelo setor financeiro na{' '}
            <strong className="text-amber-600">Sexta-feira à tarde</strong>.
          </li>
        </ul>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="bg-slate-900 border border-slate-800 w-full justify-start rounded-lg shrink-0 flex-wrap h-auto">
          <TabsTrigger
            value="novos"
            className="data-[state=active]:bg-amber-500 data-[state=active]:text-white font-bold uppercase tracking-wider text-xs py-2"
          >
            Novos Pedidos
          </TabsTrigger>
          {canManage && (
            <TabsTrigger
              value="recebidos"
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white font-bold uppercase tracking-wider text-xs py-2"
            >
              Pedidos Recebidos
            </TabsTrigger>
          )}
          {canManage && (
            <TabsTrigger
              value="falta"
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white font-bold uppercase tracking-wider text-xs py-2"
            >
              Itens em Falta
            </TabsTrigger>
          )}
          {canManage && (
            <TabsTrigger
              value="relatorios"
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white font-bold uppercase tracking-wider text-xs py-2"
            >
              Relatórios
            </TabsTrigger>
          )}
        </TabsList>

        <div className="flex-1 overflow-y-auto mt-4 custom-scrollbar">
          <TabsContent value="novos" className="m-0 h-full">
            <NovosPedidos />
          </TabsContent>
          {canManage && (
            <TabsContent value="recebidos" className="m-0 h-full">
              <PedidosRecebidos />
            </TabsContent>
          )}
          {canManage && (
            <TabsContent value="falta" className="m-0 h-full">
              <ItensEmFalta />
            </TabsContent>
          )}
          {canManage && (
            <TabsContent value="relatorios" className="m-0 h-full">
              <RelatoriosPedidos />
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  )
}

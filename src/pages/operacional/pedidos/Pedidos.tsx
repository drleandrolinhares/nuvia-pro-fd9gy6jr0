import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Package } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
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
      <PageHeader
        title="Pedidos"
        description="Requisição semanal de insumos para o almoxarifado."
        icon={Package}
        className="shrink-0"
      />

      <div className="shrink-0 rounded-lg border border-border bg-card px-5 py-4 text-sm text-muted-foreground">
        <strong className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-foreground">
          <Package className="size-4 text-muted-foreground" /> Regras importantes
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

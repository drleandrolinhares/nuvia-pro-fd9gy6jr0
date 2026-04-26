import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import Compromissos from './Compromissos'
import NormasInternas from './NormasInternas'
import { Bell } from 'lucide-react'

export default function Comunicados() {
  const [activeTab, setActiveTab] = useState('compromissos')

  return (
    <div className="p-6 h-[calc(100vh-4rem)] flex flex-col space-y-6 bg-slate-50/50">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 uppercase flex items-center gap-2">
            <Bell className="w-6 h-6 text-amber-600" />
            COMUNICADOS
          </h1>
          <p className="text-sm text-slate-500">
            Gerencie e visualize compromissos e normas internas do sistema.
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-col flex-1 overflow-hidden"
      >
        <TabsList className="flex w-full overflow-x-auto max-w-md mb-4 bg-slate-100 p-1 border border-slate-200 shrink-0">
          <TabsTrigger
            value="compromissos"
            className="flex-1 whitespace-nowrap px-4 data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-sm text-slate-600 font-medium uppercase"
          >
            COMPROMISSOS
          </TabsTrigger>
          <TabsTrigger
            value="normas"
            className="flex-1 whitespace-nowrap px-4 data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-sm text-slate-600 font-medium uppercase"
          >
            NORMAS INTERNAS
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent
            value="compromissos"
            className="h-full m-0 border-0 p-0 data-[state=active]:flex flex-col"
          >
            <Compromissos />
          </TabsContent>
          <TabsContent
            value="normas"
            className="h-full m-0 border-0 p-0 data-[state=active]:flex flex-col overflow-y-auto"
          >
            <NormasInternas />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

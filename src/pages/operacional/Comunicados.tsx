import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import Compromissos from './Compromissos'
import NormasInternas from './NormasInternas'
import { Bell } from 'lucide-react'

export default function Comunicados() {
  const [activeTab, setActiveTab] = useState('compromissos')

  return (
    <div className="p-6 h-[calc(100vh-4rem)] flex flex-col space-y-6 bg-slate-50/50 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-slate-50 p-6 rounded-xl shadow-lg border-l-4 border-amber-500 relative shrink-0">
        <div className="flex items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white pr-24 sm:pr-0 flex items-center gap-3 uppercase">
              <Bell className="w-8 h-8 text-amber-500" />
              COMUNICADOS
            </h1>
            <p className="text-slate-300 text-sm font-medium tracking-wide mt-1">
              Gerencie e visualize compromissos e normas internas do sistema.
            </p>
          </div>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-col flex-1 overflow-hidden"
      >
        <TabsList className="flex w-full overflow-x-auto max-w-md mb-4 justify-start shrink-0">
          <TabsTrigger value="compromissos" className="flex-1 whitespace-nowrap uppercase">
            COMPROMISSOS
          </TabsTrigger>
          <TabsTrigger value="normas" className="flex-1 whitespace-nowrap uppercase">
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

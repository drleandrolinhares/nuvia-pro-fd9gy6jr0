import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import Compromissos from './Compromissos'
import NormasInternas from './NormasInternas'
import { Bell } from 'lucide-react'
import { PageHeader } from '@/components/page-header'

export default function Comunicados() {
  const [activeTab, setActiveTab] = useState('compromissos')

  return (
    <div className="p-6 h-[calc(100vh-4rem)] flex flex-col space-y-6 bg-slate-50/50 animate-fade-in-up">
      <PageHeader
        title="Comunicados"
        description="Compromissos e normas internas do sistema."
        icon={Bell}
      />

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

import { useState } from 'react'
import { Waves, Users } from 'lucide-react'
import { OndasLiquidez } from './components/OndasLiquidez'
import { VencimentoParceiros } from './components/VencimentoParceiros'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function Fluxo() {
  const [activeTab, setActiveTab] = useState<'liquidez' | 'parceiros'>('liquidez')

  return (
    <div className="w-full space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden shadow-lg">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#C5A059]"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Waves className="h-6 w-6 text-[#C5A059]" />
              Fluxo de Caixa & Parceiros
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              Sincronização de liquidez de boletos e gestão inteligente de contas com parceiros.
            </p>
          </div>
          <div className="flex bg-[#050A13] p-1.5 rounded-lg border border-slate-800 shadow-inner w-full md:w-auto overflow-x-auto">
            <Button
              variant="ghost"
              onClick={() => setActiveTab('liquidez')}
              className={cn(
                'font-semibold transition-all px-4 py-2',
                activeTab === 'liquidez'
                  ? 'bg-[#C5A059] text-[#001529] hover:bg-[#b08d4d] hover:text-[#001529]'
                  : 'text-slate-400 hover:text-slate-200',
              )}
            >
              <Waves className="w-4 h-4 mr-2" />
              Ondas de Liquidez
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveTab('parceiros')}
              className={cn(
                'font-semibold transition-all px-4 py-2 whitespace-nowrap',
                activeTab === 'parceiros'
                  ? 'bg-[#C5A059] text-[#001529] hover:bg-[#b08d4d] hover:text-[#001529]'
                  : 'text-slate-400 hover:text-slate-200',
              )}
            >
              <Users className="w-4 h-4 mr-2" />
              Vencimento de Parceiros
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6">
        {activeTab === 'liquidez' && <OndasLiquidez />}
        {activeTab === 'parceiros' && <VencimentoParceiros />}
      </div>
    </div>
  )
}

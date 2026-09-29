import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Calculator, Percent, TrendingUp, Sparkles } from 'lucide-react'
import { CalculadoraBasica } from './CalculadoraBasica'
import { CalculadoraJuros } from './CalculadoraJuros'
import { CalculadoraCET } from './CalculadoraCET'

interface CalculadoraSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CalculadoraSheet({ open, onOpenChange }: CalculadoraSheetProps) {
  const [activeTab, setActiveTab] = useState<'basica' | 'juros' | 'cet'>('basica')

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[430px] p-0 bg-slate-950 border-l border-slate-800 text-slate-100 flex flex-col h-full shadow-2xl focus:outline-none"
      >
        {/* Cabeçalho do Drawer */}
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-slate-850 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-secondary/15 border border-secondary/30 flex items-center justify-center text-secondary shadow-sm">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <SheetTitle className="text-base font-bold text-white flex items-center gap-2">
                <span>Calculadora NUVIA</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-secondary/20 text-secondary border border-secondary/30">
                  PRO
                </span>
              </SheetTitle>
              <SheetDescription className="text-xs text-slate-400">
                Apoio financeiro rápido para contas, juros e parcelamento
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Abas da Calculadora */}
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as 'basica' | 'juros' | 'cet')}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="px-5 pt-3 pb-2 shrink-0">
            <TabsList className="w-full grid grid-cols-3 bg-slate-900 border border-slate-800 p-1 rounded-xl h-10">
              <TabsTrigger
                value="basica"
                className="text-xs font-semibold data-[state=active]:bg-secondary data-[state=active]:text-primary data-[state=active]:font-bold rounded-lg transition-all flex items-center justify-center gap-1.5"
              >
                <Calculator className="w-3.5 h-3.5" />
                Básica
              </TabsTrigger>
              <TabsTrigger
                value="juros"
                className="text-xs font-semibold data-[state=active]:bg-secondary data-[state=active]:text-primary data-[state=active]:font-bold rounded-lg transition-all flex items-center justify-center gap-1.5"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Juros
              </TabsTrigger>
              <TabsTrigger
                value="cet"
                className="text-xs font-semibold data-[state=active]:bg-secondary data-[state=active]:text-primary data-[state=active]:font-bold rounded-lg transition-all flex items-center justify-center gap-1.5"
              >
                <Percent className="w-3.5 h-3.5" />
                CET / Fin.
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Conteúdo rolável de cada aba */}
          <div className="flex-1 overflow-y-auto px-5 py-2">
            <TabsContent value="basica" className="m-0 h-full">
              <CalculadoraBasica isActive={open && activeTab === 'basica'} />
            </TabsContent>

            <TabsContent value="juros" className="m-0 h-full">
              <CalculadoraJuros />
            </TabsContent>

            <TabsContent value="cet" className="m-0 h-full">
              <CalculadoraCET />
            </TabsContent>
          </div>
        </Tabs>

        {/* Rodapé com atalho */}
        <div className="px-5 py-2.5 border-t border-slate-850 bg-slate-950/80 flex items-center justify-between text-[11px] text-slate-500 shrink-0 font-mono">
          <span>NUVIA PRO Financial Suite</span>
          <span>ESC para fechar</span>
        </div>
      </SheetContent>
    </Sheet>
  )
}

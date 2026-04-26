import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles } from 'lucide-react'

export function SorrisoDosSonhosTab() {
  return (
    <Card className="border-none shadow-sm bg-white/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-amber-600">
          <Sparkles className="h-6 w-6" />
          Sorriso dos Sonhos
        </CardTitle>
        <CardDescription>
          Módulo em desenvolvimento. Aguardando definições de regras de negócio.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-lg border-slate-200 bg-slate-50/50">
          <Sparkles className="h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Em breve</h3>
          <p className="text-sm text-slate-500 max-w-md">
            Este espaço está reservado para a nova funcionalidade "Sorriso dos Sonhos". Aguardando
            as instruções para implementar os gráficos, tabelas ou formulários necessários.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'

export function FornecedoresTab() {
  const navigate = useNavigate()

  return (
    <Card className="border-border/50 shadow-sm animate-fade-in-up">
      <CardContent className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
        <div className="w-12 h-12 bg-fuchsia-100 text-fuchsia-600 rounded-full flex items-center justify-center mb-2">
          <ExternalLink className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Fornecedores Movido</h3>
        <p className="text-sm text-slate-500 max-w-md">
          A gestão de fornecedores agora possui uma página dedicada no menu lateral esquerdo para
          acesso mais rápido.
        </p>
        <Button
          onClick={() => navigate('/fornecedores')}
          className="bg-fuchsia-600 hover:bg-fuchsia-700 font-bold mt-4"
        >
          Acessar Fornecedores
        </Button>
      </CardContent>
    </Card>
  )
}

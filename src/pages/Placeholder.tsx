import { Construction } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useLocation } from 'react-router-dom'

export default function Placeholder() {
  const location = useLocation()
  const pathName = location.pathname.split('/').pop()?.replace(/-/g, ' ') || 'Módulo'

  return (
    <div className="flex h-[80vh] w-full items-center justify-center animate-fade-in">
      <Card className="max-w-md border-dashed border-2 shadow-none bg-muted/10">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-secondary/10 mb-6">
            <Construction className="size-10 text-secondary" />
          </div>
          <h2 className="text-2xl font-bold uppercase tracking-widest text-foreground mb-2">
            {pathName}
          </h2>
          <p className="text-muted-foreground uppercase tracking-wider text-sm font-medium">
            Módulo em Construção
          </p>
          <div className="mt-6 h-1 w-12 bg-secondary rounded-full" />
        </CardContent>
      </Card>
    </div>
  )
}

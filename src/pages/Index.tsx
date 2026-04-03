import {
  ArrowDownRight,
  CircleDollarSign,
  Calendar,
  RefreshCcw,
  AlertCircle,
  Box,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

const Index = () => {
  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground uppercase">
          Dashboard Nuvia
        </h1>
        <p className="text-muted-foreground uppercase text-sm font-medium tracking-wider mt-1">
          Visão Geral da Gestão de Estoque e Rotinas.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Avisos de Estoque
            </CardTitle>
            <ArrowDownRight className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">0</div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
              Itens precisam de reposição
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Capital Investido
            </CardTitle>
            <CircleDollarSign className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground">R$ 0,00</div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
              Valor em estoque clínico
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Itens em Estoque
            </CardTitle>
            <Box className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">0</div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
              Total de unidades disponíveis
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-5 border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2">
            <AlertCircle className="size-5 text-destructive" />
            <CardTitle className="text-lg font-bold uppercase tracking-wider">
              Central de Alertas Operacionais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-[200px] items-center justify-center rounded-lg border-2 border-dashed border-border/60 bg-muted/20">
              <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium">
                Nenhum alerta no momento. Tudo em ordem.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold uppercase tracking-wider">
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button
              variant="outline"
              className="w-full justify-start h-12 uppercase tracking-wider font-semibold border-border hover:bg-secondary/10 hover:text-secondary hover:border-secondary transition-colors"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Compromissos de Hoje
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start h-12 uppercase tracking-wider font-semibold border-border hover:bg-secondary/10 hover:text-secondary hover:border-secondary transition-colors"
            >
              <Link to="/estoque">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Atualizar Estoque
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Index

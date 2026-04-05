import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PacienteHeader } from './PacienteHeader'
import { AvaliacoesTab } from './AvaliacoesTab'
import { OrcamentosTab } from './OrcamentosTab'
import { ContatosTab } from './ContatosTab'
import { VendasTab } from './VendasTab'
import { Skeleton } from '@/components/ui/skeleton'

export function PacienteDashboard({ id }: { id: string }) {
  const navigate = useNavigate()
  const [paciente, setPaciente] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('pacientes')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        setPaciente(data)
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <div className="flex-1 p-8 space-y-4">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!paciente) {
    return (
      <div className="flex-1 p-8 text-center text-muted-foreground">Paciente não encontrado.</div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/comercial/vendas')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Ficha do Paciente</h2>
      </div>

      <PacienteHeader paciente={paciente} onUpdate={setPaciente} />

      <Tabs defaultValue="avaliacoes" className="w-full space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto bg-transparent border-b rounded-none h-12 p-0">
          <TabsTrigger
            value="avaliacoes"
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full"
          >
            Avaliações
          </TabsTrigger>
          <TabsTrigger
            value="orcamentos"
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full"
          >
            Orçamentos
          </TabsTrigger>
          <TabsTrigger
            value="contatos"
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full"
          >
            Histórico de Contatos
          </TabsTrigger>
          <TabsTrigger
            value="followup"
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full"
          >
            Follow-up
          </TabsTrigger>
          <TabsTrigger
            value="vendas"
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full"
          >
            Vendas Concretizadas
          </TabsTrigger>
        </TabsList>

        <div className="pt-4">
          <TabsContent value="avaliacoes" className="m-0">
            <AvaliacoesTab pacienteId={id} />
          </TabsContent>
          <TabsContent value="orcamentos" className="m-0">
            <OrcamentosTab pacienteId={id} />
          </TabsContent>
          <TabsContent value="contatos" className="m-0">
            <ContatosTab pacienteId={id} isFollowUp={false} />
          </TabsContent>
          <TabsContent value="followup" className="m-0">
            <ContatosTab pacienteId={id} isFollowUp={true} />
          </TabsContent>
          <TabsContent value="vendas" className="m-0">
            <VendasTab pacienteId={id} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

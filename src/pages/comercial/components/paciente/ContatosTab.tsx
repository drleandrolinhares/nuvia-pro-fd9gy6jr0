import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import {
  Plus,
  Edit,
  Trash,
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle,
  FileText,
} from 'lucide-react'

export function ContatosTab({
  pacienteId,
  isFollowUp,
}: {
  pacienteId: string
  isFollowUp: boolean
}) {
  const [contatos, setContatos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContatos = async () => {
      const { data } = await supabase
        .from('contatos_follow_up')
        .select('*, avaliacoes!inner(paciente_id), usuarios(nome)')
        .eq('avaliacoes.paciente_id', pacienteId)
        .order('data_contato', { ascending: isFollowUp })

      if (data) {
        const now = new Date()
        const filtered = data.filter((c) => {
          if (!c.data_contato) return false
          const date = new Date(c.data_contato)
          return isFollowUp ? date >= now : date < now
        })
        setContatos(filtered)
      }
      setLoading(false)
    }
    fetchContatos()
  }, [pacienteId, isFollowUp])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-card p-4 rounded-lg border">
        <h3 className="text-xl font-semibold">
          {isFollowUp ? 'Agendamentos Futuros' : 'Histórico de Contatos'}
        </h3>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" /> Novo {isFollowUp ? 'Agendamento' : 'Contato'}
        </Button>
      </div>

      {loading ? (
        <div className="text-center p-8 border rounded-lg">Carregando...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {contatos.map((c) => (
            <Card key={c.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3 border-b bg-muted/20 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    {c.data_contato ? format(new Date(c.data_contato), 'dd/MM/yyyy') : '-'}
                    <Clock className="w-4 h-4 ml-2 text-primary" />
                    {c.data_contato ? format(new Date(c.data_contato), 'HH:mm') : '-'}
                  </CardTitle>
                </div>
                <div className="flex gap-1 -mt-1 -mr-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" /> Responsável:{' '}
                  <span className="font-medium text-foreground">{c.usuarios?.nome || '-'}</span>
                </div>
                {!isFollowUp && (
                  <>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" /> Canal:{' '}
                      <span className="font-medium text-foreground">{c.canal || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" /> Resultado:{' '}
                      <span className="font-medium text-foreground">{c.resultado || '-'}</span>
                    </div>
                    <div className="flex items-start gap-2 mt-3 pt-3 border-t">
                      <FileText className="w-4 h-4 mt-0.5" />{' '}
                      <div className="flex-1">
                        <span className="font-medium text-foreground block mb-1">
                          Resumo da Conversa:
                        </span>{' '}
                        {c.resumo_conversa || 'Nenhum resumo registrado.'}
                      </div>
                    </div>
                  </>
                )}
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 mt-0.5" />{' '}
                  <div className="flex-1">
                    <span className="font-medium text-foreground block mb-1">Observações:</span>{' '}
                    {c.observacoes || 'Nenhuma observação.'}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {contatos.length === 0 && (
            <div className="col-span-full p-12 text-center border border-dashed rounded-lg bg-muted/10 text-muted-foreground">
              Nenhum {isFollowUp ? 'agendamento futuro' : 'contato'} encontrado neste momento.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

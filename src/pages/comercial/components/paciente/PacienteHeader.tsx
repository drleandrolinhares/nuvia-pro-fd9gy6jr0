import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Phone, Mail, Calendar, Edit } from 'lucide-react'
import { format } from 'date-fns'
import { PacienteActions } from './PacienteActions'

export function PacienteHeader({ paciente, onUpdate }: { paciente: any; onUpdate: any }) {
  return (
    <div className="space-y-4">
      {paciente?.id && <PacienteActions pacienteId={paciente.id} onUpdate={onUpdate} />}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-sm">
                <User className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold tracking-tight">{paciente.nome}</h3>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary/70" />
                    {paciente.telefone || 'Sem telefone'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary/70" />
                    {paciente.email || 'Sem email'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary/70" />
                    Cadastrado em:{' '}
                    {paciente.data_cadastro
                      ? format(new Date(paciente.data_cadastro), 'dd/MM/yyyy')
                      : '-'}
                  </div>
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={() => alert('Edição em desenvolvimento')}>
              <Edit className="w-4 h-4 mr-2" /> Editar Dados
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

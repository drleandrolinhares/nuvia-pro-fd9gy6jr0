import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Phone, Mail, Calendar, Edit, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { PacienteActions } from './PacienteActions'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

export function PacienteHeader({ paciente, onUpdate }: { paciente: any; onUpdate: any }) {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
  })

  useEffect(() => {
    if (paciente) {
      setFormData({
        nome: paciente.nome || '',
        telefone: paciente.telefone || '',
        email: paciente.email || '',
      })
    }
  }, [paciente])

  const handleSave = async () => {
    if (!formData.nome) {
      toast({ title: 'Aviso', description: 'O nome é obrigatório.', variant: 'destructive' })
      return
    }

    try {
      setLoading(true)
      const { error } = await supabase
        .from('pacientes')
        .update({
          nome: formData.nome,
          telefone: formData.telefone,
          email: formData.email,
          atualizado_em: new Date().toISOString(),
        })
        .eq('id', paciente.id)

      if (error) throw error

      toast({
        title: 'Sucesso',
        description: 'Dados do paciente atualizados com sucesso.',
      })
      setIsEditing(false)
      if (onUpdate) onUpdate()
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

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
                <h3 className="text-2xl font-bold tracking-tight">{paciente?.nome}</h3>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary/70" />
                    {paciente?.telefone || 'Sem telefone'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary/70" />
                    {paciente?.email || 'Sem email'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary/70" />
                    Cadastrado em:{' '}
                    {paciente?.data_cadastro
                      ? format(new Date(paciente.data_cadastro), 'dd/MM/yyyy')
                      : '-'}
                  </div>
                </div>
              </div>
            </div>

            <Dialog open={isEditing} onOpenChange={setIsEditing}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" /> Editar Dados
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editar Paciente</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Nome Completo *</Label>
                    <Input
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Nome do paciente"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="paciente@email.com"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditing(false)} disabled={loading}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Salvar Alterações
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

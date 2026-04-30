import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { format, parseISO } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Trash2, Plus, CheckCircle2, Circle, Users, Building } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface Parceiro {
  id: string
  tipo: string
  nome: string
  data_vencimento: string
  valor: number
  descricao: string
  status: string
}

export function VencimentoParceiros() {
  const [parceiros, setParceiros] = useState<Parceiro[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    tipo: '',
    nome: '',
    data_vencimento: '',
    valor: '',
    descricao: '',
  })
  const { toast } = useToast()

  const fetchParceiros = async () => {
    const { data } = await supabase
      .from('fluxo_caixa_parceiros')
      .select('*')
      .order('status', { ascending: false })
      .order('data_vencimento', { ascending: true })
    if (data) setParceiros(data)
  }

  useEffect(() => {
    fetchParceiros()
  }, [])

  const handleSave = async () => {
    if (!formData.tipo || !formData.nome || !formData.data_vencimento || !formData.valor) {
      toast({ title: 'Preencha os campos obrigatórios', variant: 'destructive' })
      return
    }
    const { error } = await supabase
      .from('fluxo_caixa_parceiros')
      .insert({ ...formData, valor: parseFloat(formData.valor) })
    if (error) toast({ title: 'Erro ao salvar', variant: 'destructive' })
    else {
      toast({ title: 'Adicionado com sucesso!' })
      setIsOpen(false)
      setFormData({ tipo: '', nome: '', data_vencimento: '', valor: '', descricao: '' })
      fetchParceiros()
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'pendente' ? 'pago' : 'pendente'
    await supabase.from('fluxo_caixa_parceiros').update({ status: newStatus }).eq('id', id)
    fetchParceiros()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este parceiro?')) return
    await supabase.from('fluxo_caixa_parceiros').delete().eq('id', id)
    fetchParceiros()
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#0B1320] p-5 rounded-xl border border-slate-800 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#C5A059]" /> Controle de Parceiros
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Gestão de pagamentos a dentistas, laboratórios e outros parceiros.
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#C5A059] hover:bg-[#b08d4d] text-[#001529] font-bold">
              <Plus className="w-4 h-4 mr-2" /> Novo Acordo
            </Button>
          </DialogTrigger>
          <DialogContent className="border-slate-700 bg-[#0B1320] text-slate-200">
            <DialogHeader>
              <DialogTitle className="text-[#C5A059]">Novo Acordo com Parceiro</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label>Tipo de Parceiro</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(v) => setFormData({ ...formData, tipo: v })}
                >
                  <SelectTrigger className="bg-[#050A13] border-slate-700">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0F1A2A] border-slate-700 text-slate-200">
                    <SelectItem value="dentista">Dentista</SelectItem>
                    <SelectItem value="laboratorio">Laboratório</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Nome do Parceiro</Label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="bg-[#050A13] border-slate-700"
                />
              </div>
              <div className="grid gap-2">
                <Label>Data de Vencimento</Label>
                <Input
                  type="date"
                  style={{ colorScheme: 'dark' }}
                  value={formData.data_vencimento}
                  onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
                  className="bg-[#050A13] border-slate-700"
                />
              </div>
              <div className="grid gap-2">
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  className="bg-[#050A13] border-slate-700"
                />
              </div>
              <div className="grid gap-2">
                <Label>Descrição</Label>
                <Input
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="bg-[#050A13] border-slate-700"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button
                className="bg-[#C5A059] hover:bg-[#b08d4d] text-[#001529] font-bold"
                onClick={handleSave}
              >
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {parceiros.map((p) => (
          <Card
            key={p.id}
            className={cn(
              'bg-[#0F1A2A] border-slate-700 relative overflow-hidden transition-all',
              p.status === 'pago' ? 'opacity-60 grayscale' : 'shadow-lg shadow-black/30',
            )}
          >
            <div
              className={cn(
                'absolute top-0 left-0 w-1.5 h-full',
                p.tipo === 'dentista'
                  ? 'bg-blue-500'
                  : p.tipo === 'laboratorio'
                    ? 'bg-purple-500'
                    : 'bg-slate-500',
              )}
            />
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  {p.tipo === 'dentista' ? (
                    <Users className="w-5 h-5 text-blue-400" />
                  ) : (
                    <Building className="w-5 h-5 text-purple-400" />
                  )}
                  <span
                    className="font-bold text-slate-100 uppercase tracking-wider text-sm truncate max-w-[160px]"
                    title={p.nome}
                  >
                    {p.nome}
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className={
                    p.status === 'pago'
                      ? 'text-emerald-400 border-emerald-400/50 bg-emerald-500/10'
                      : 'text-amber-400 border-amber-400/50 bg-amber-500/10'
                  }
                >
                  {p.status === 'pago' ? 'Pago' : 'Pendente'}
                </Badge>
              </div>
              <div className="mb-6">
                <div className="text-3xl font-black text-[#C5A059]">{formatCurrency(p.valor)}</div>
                {p.descricao && (
                  <div className="text-sm text-slate-400 mt-1 line-clamp-1" title={p.descricao}>
                    {p.descricao}
                  </div>
                )}
              </div>
              <div className="bg-[#050A13] p-3 rounded-lg border border-slate-800 mb-4 flex justify-between items-center shadow-inner">
                <span className="text-slate-400 text-sm">Vencimento:</span>
                <span className="text-slate-100 font-bold text-lg">
                  {format(parseISO(p.data_vencimento), 'dd/MM/yyyy')}
                </span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleStatus(p.id, p.status)}
                  className={cn(
                    'font-bold transition-colors',
                    p.status === 'pago'
                      ? 'text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10'
                      : 'text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10',
                  )}
                >
                  {p.status === 'pago' ? (
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                  ) : (
                    <Circle className="w-5 h-5 mr-2" />
                  )}
                  {p.status === 'pago' ? 'Marcado como Pago' : 'Marcar como Pago'}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(p.id)}
                  className="text-slate-500 hover:text-rose-500 hover:bg-rose-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {parceiros.length === 0 && (
          <div className="col-span-full text-center py-16 border-2 border-dashed border-slate-800 rounded-xl bg-[#0B1320]">
            <Building className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg font-medium">
              Nenhum parceiro ou acordo cadastrado.
            </p>
            <p className="text-slate-500 text-sm mt-1">Clique em "Novo Acordo" para começar.</p>
          </div>
        )}
      </div>
    </div>
  )
}

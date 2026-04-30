import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
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
import { Trash2, Plus, Users, Building, Stethoscope, Microscope, ClipboardList } from 'lucide-react'
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
  criterio_pagamento?: string
}

export function VencimentoParceiros() {
  const [parceiros, setParceiros] = useState<Parceiro[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    tipo: '',
    nome: '',
    dia_vencimento: '',
    valor: '',
    descricao: '',
    criterio_pagamento: '',
  })
  const { toast } = useToast()

  const fetchParceiros = async () => {
    const { data } = await supabase.from('fluxo_caixa_parceiros').select('*')
    if (data) {
      const sorted = data.sort((a, b) => {
        const dayA = parseInt(a.data_vencimento?.split('-')[2] || '0', 10)
        const dayB = parseInt(b.data_vencimento?.split('-')[2] || '0', 10)
        return dayA - dayB
      })
      setParceiros(sorted)
    }
  }

  useEffect(() => {
    fetchParceiros()
  }, [])

  const handleSave = async () => {
    if (!formData.tipo || !formData.nome || !formData.dia_vencimento || !formData.valor) {
      toast({ title: 'Preencha os campos obrigatórios', variant: 'destructive' })
      return
    }

    const dayNum = parseInt(formData.dia_vencimento, 10)
    if (isNaN(dayNum) || dayNum < 1 || dayNum > 31) {
      toast({ title: 'Dia inválido. Use um valor de 1 a 31.', variant: 'destructive' })
      return
    }

    const dayStr = dayNum.toString().padStart(2, '0')
    // Salvamos uma data genérica para manter a compatibilidade com a coluna date no DB
    // e extrair apenas o dia na interface
    const data_vencimento = `2024-01-${dayStr}`

    const dataToSave = {
      tipo: formData.tipo,
      nome: formData.nome,
      data_vencimento,
      valor: parseFloat(formData.valor),
      descricao: formData.descricao || null,
      criterio_pagamento:
        formData.tipo === 'dentista_executor' ? formData.criterio_pagamento || null : null,
      status: 'pendente', // Mantém compatibilidade caso haja triggers
    }

    const { error } = await supabase.from('fluxo_caixa_parceiros').insert(dataToSave)
    if (error) toast({ title: 'Erro ao salvar', variant: 'destructive' })
    else {
      toast({ title: 'Adicionado com sucesso!' })
      setIsOpen(false)
      setFormData({
        tipo: '',
        nome: '',
        dia_vencimento: '',
        valor: '',
        descricao: '',
        criterio_pagamento: '',
      })
      fetchParceiros()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este parceiro?')) return
    await supabase.from('fluxo_caixa_parceiros').delete().eq('id', id)
    fetchParceiros()
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  const avaliadores = parceiros.filter(
    (p) => p.tipo === 'dentista_avaliador' || p.tipo === 'dentista',
  )
  const executores = parceiros.filter((p) => p.tipo === 'dentista_executor')
  const laboratorios = parceiros.filter((p) => p.tipo === 'laboratorio')
  const outros = parceiros.filter((p) => p.tipo === 'outro')

  const renderSection = (
    title: string,
    data: Parceiro[],
    icon: React.ReactNode,
    typeColor: string,
  ) => {
    if (data.length === 0) return null
    return (
      <div className="mb-8">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
          <div
            className={cn(
              'p-1.5 rounded-md',
              typeColor.replace('bg-', 'bg-').replace('-500', '-500/20').replace('-400', '-400/20'),
            )}
          >
            {icon}
          </div>
          {title}
          <span className="text-xs font-medium text-slate-400 bg-[#050A13] px-2 py-0.5 rounded-full border border-slate-800">
            {data.length}
          </span>
        </h3>
        <div className="flex flex-col gap-3">
          {data.map((p) => (
            <Card
              key={p.id}
              className="bg-[#0F1A2A] border-slate-700 relative overflow-hidden shadow-sm"
            >
              <div className={cn('absolute top-0 left-0 w-1 h-full', typeColor)} />
              <CardContent className="p-3 pl-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="font-bold text-slate-100 uppercase tracking-wider text-sm"
                      title={p.nome}
                    >
                      {p.nome}
                    </span>
                    {p.criterio_pagamento && (
                      <Badge
                        variant="outline"
                        className="text-[10px] uppercase bg-[#050A13] text-slate-300 border-slate-700 h-5 px-1.5"
                      >
                        {p.criterio_pagamento}
                      </Badge>
                    )}
                  </div>
                  {p.descricao && (
                    <div className="text-xs text-slate-400 line-clamp-1" title={p.descricao}>
                      {p.descricao}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 w-full sm:w-auto border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0 mt-1 sm:mt-0">
                  <div className="flex items-center gap-2 bg-[#050A13] px-3 py-1 rounded-md border border-slate-800 shrink-0">
                    <span className="text-slate-400 text-xs">Dia:</span>
                    <span className="text-slate-100 font-bold">
                      {parseInt(p.data_vencimento?.split('-')[2] || '0', 10)}
                    </span>
                  </div>

                  <div className="text-lg font-black text-[#C5A059] shrink-0 min-w-[100px] text-right">
                    {formatCurrency(p.valor)}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(p.id)}
                    className="text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 h-8 w-8 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#0B1320] p-5 rounded-xl border border-slate-800 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#C5A059]" /> Acordos com Parceiros
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Controle de acordos, prazos e valores com parceiros da clínica.
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
                  onValueChange={(v) =>
                    setFormData({ ...formData, tipo: v, criterio_pagamento: '' })
                  }
                >
                  <SelectTrigger className="bg-[#050A13] border-slate-700">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0F1A2A] border-slate-700 text-slate-200">
                    <SelectItem value="dentista_avaliador">Dentista Avaliador</SelectItem>
                    <SelectItem value="dentista_executor">Dentista Executor</SelectItem>
                    <SelectItem value="laboratorio">Laboratório</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.tipo === 'dentista_executor' && (
                <div className="grid gap-2">
                  <Label>Critério de Pagamento</Label>
                  <Select
                    value={formData.criterio_pagamento}
                    onValueChange={(v) => setFormData({ ...formData, criterio_pagamento: v })}
                  >
                    <SelectTrigger className="bg-[#050A13] border-slate-700">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0F1A2A] border-slate-700 text-slate-200">
                      <SelectItem value="Execução">Execução</SelectItem>
                      <SelectItem value="Diária">Diária</SelectItem>
                      <SelectItem value="Fixo">Fixo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid gap-2">
                <Label>Nome do Parceiro</Label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="bg-[#050A13] border-slate-700"
                />
              </div>
              <div className="grid gap-2">
                <Label>Dia do Mês para Vencimento</Label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  placeholder="Ex: 10"
                  value={formData.dia_vencimento}
                  onChange={(e) => setFormData({ ...formData, dia_vencimento: e.target.value })}
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
                <Label>Descrição / Observações</Label>
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

      <div>
        {renderSection(
          'Dentista Avaliador',
          avaliadores,
          <ClipboardList className="w-5 h-5 text-blue-400" />,
          'bg-blue-500',
        )}
        {renderSection(
          'Dentista Executor',
          executores,
          <Stethoscope className="w-5 h-5 text-emerald-400" />,
          'bg-emerald-500',
        )}
        {renderSection(
          'Laboratório',
          laboratorios,
          <Microscope className="w-5 h-5 text-purple-400" />,
          'bg-purple-500',
        )}
        {renderSection(
          'Outros',
          outros,
          <Users className="w-5 h-5 text-slate-400" />,
          'bg-slate-500',
        )}

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

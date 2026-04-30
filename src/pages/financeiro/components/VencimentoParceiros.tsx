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
    const data_vencimento = `2024-01-${dayStr}`

    const dataToSave = {
      tipo: formData.tipo,
      nome: formData.nome,
      data_vencimento,
      valor: parseFloat(formData.valor),
      descricao: formData.descricao || null,
      criterio_pagamento:
        formData.tipo === 'dentista_executor' ? formData.criterio_pagamento || null : null,
      status: 'pendente',
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
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
          <div
            className={cn(
              'p-1.5 rounded-md',
              typeColor.replace('bg-', 'bg-').replace('-500', '-500/20').replace('-600', '-600/20'),
            )}
          >
            {icon}
          </div>
          {title}
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
            {data.length}
          </span>
        </h3>
        <div className="flex flex-col gap-3">
          {data.map((p) => (
            <Card
              key={p.id}
              className="bg-white border-slate-200 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={cn('absolute top-0 left-0 w-1 h-full', typeColor)} />
              <CardContent className="p-3 pl-4 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      <span
                        className="font-bold text-slate-800 uppercase tracking-wider text-sm truncate"
                        title={p.nome}
                      >
                        {p.nome}
                      </span>
                      {p.criterio_pagamento && (
                        <Badge
                          variant="outline"
                          className="text-[10px] uppercase bg-slate-50 text-slate-500 border-slate-200 h-5 px-1.5 whitespace-nowrap"
                        >
                          {p.criterio_pagamento}
                        </Badge>
                      )}
                    </div>
                    {p.descricao && (
                      <div className="text-xs text-slate-500 line-clamp-2" title={p.descricao}>
                        {p.descricao}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(p.id)}
                    className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 h-8 w-8 shrink-0 -mr-2 -mt-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-2 mt-1">
                  <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 shrink-0">
                    <span className="text-slate-500 text-xs font-medium">Dia</span>
                    <span className="text-slate-800 font-bold text-sm">
                      {parseInt(p.data_vencimento?.split('-')[2] || '0', 10)}
                    </span>
                  </div>

                  <div className="text-base font-black text-amber-600 shrink-0 truncate">
                    {formatCurrency(p.valor)}
                  </div>
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-5 rounded-xl border border-slate-200 shadow-sm gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" /> Acordos com Parceiros
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Controle de acordos, prazos e valores com parceiros da clínica.
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-sm">
              <Plus className="w-4 h-4 mr-2" /> Novo Acordo
            </Button>
          </DialogTrigger>
          <DialogContent className="border-slate-200 bg-white text-slate-800 sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-slate-900 font-bold text-xl border-b border-slate-100 pb-4">
                Novo Acordo com Parceiro
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label className="font-bold text-slate-700">Tipo de Parceiro</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(v) =>
                    setFormData({ ...formData, tipo: v, criterio_pagamento: '' })
                  }
                >
                  <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-900">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-slate-900">
                    <SelectItem value="dentista_avaliador">Dentista Avaliador</SelectItem>
                    <SelectItem value="dentista_executor">Dentista Executor</SelectItem>
                    <SelectItem value="laboratorio">Laboratório</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.tipo === 'dentista_executor' && (
                <div className="grid gap-2">
                  <Label className="font-bold text-slate-700">Critério de Pagamento</Label>
                  <Select
                    value={formData.criterio_pagamento}
                    onValueChange={(v) => setFormData({ ...formData, criterio_pagamento: v })}
                  >
                    <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-900">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-slate-900">
                      <SelectItem value="Execução">Execução</SelectItem>
                      <SelectItem value="Diária">Diária</SelectItem>
                      <SelectItem value="Fixo">Fixo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid gap-2">
                <Label className="font-bold text-slate-700">Nome do Parceiro</Label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="bg-slate-50 border-slate-200 text-slate-900"
                  placeholder="Nome completo ou empresa"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="font-bold text-slate-700">Dia Vencimento</Label>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    placeholder="Ex: 10"
                    value={formData.dia_vencimento}
                    onChange={(e) => setFormData({ ...formData, dia_vencimento: e.target.value })}
                    className="bg-slate-50 border-slate-200 text-slate-900"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="font-bold text-slate-700">Valor (R$)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                    className="bg-slate-50 border-slate-200 text-slate-900"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="font-bold text-slate-700">Descrição / Observações</Label>
                <Input
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="bg-slate-50 border-slate-200 text-slate-900"
                  placeholder="Detalhes opcionais"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                className="border-slate-200 text-slate-700 hover:bg-slate-100 font-bold"
                onClick={() => setIsOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 shadow-sm"
                onClick={handleSave}
              >
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Coluna 1: Dentista Avaliador */}
        <div className="space-y-6">
          {renderSection(
            'Dentista Avaliador',
            avaliadores,
            <ClipboardList className="w-5 h-5 text-blue-600" />,
            'bg-blue-600',
          )}
        </div>

        {/* Coluna 2: Dentista Executor */}
        <div className="space-y-6">
          {renderSection(
            'Dentista Executor',
            executores,
            <Stethoscope className="w-5 h-5 text-emerald-600" />,
            'bg-emerald-600',
          )}
        </div>

        {/* Coluna 3: Laboratório e Outros */}
        <div className="space-y-6">
          {renderSection(
            'Laboratório',
            laboratorios,
            <Microscope className="w-5 h-5 text-purple-600" />,
            'bg-purple-600',
          )}
          {renderSection(
            'Outros',
            outros,
            <Users className="w-5 h-5 text-slate-600" />,
            'bg-slate-600',
          )}
        </div>
      </div>

      {parceiros.length === 0 && (
        <div className="w-full text-center py-16 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 mt-6">
          <Building className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 text-lg font-bold">Nenhum parceiro ou acordo cadastrado.</p>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Clique em "Novo Acordo" para começar.
          </p>
        </div>
      )}
    </div>
  )
}

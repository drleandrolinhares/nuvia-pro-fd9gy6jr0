import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { addDays, format, parseISO } from 'date-fns'

export function AusenciaTemporariaDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [tipo, setTipo] = useState<'unico' | 'periodo'>('unico')
  const [dataUnica, setDataUnica] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [usuarioId, setUsuarioId] = useState('todos')
  const [descricao, setDescricao] = useState('')

  useEffect(() => {
    if (open) {
      loadUsuarios()
    }
  }, [open])

  const loadUsuarios = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('usuarios')
      .select('id, nome')
      .eq('status', 'ativo')
      .order('nome')
    if (data) setUsuarios(data)
    setLoading(false)
  }

  const handleSave = async () => {
    if (!descricao) {
      toast.error('Informe o motivo da ausência.')
      return
    }

    if (tipo === 'unico' && !dataUnica) {
      toast.error('Informe a data.')
      return
    }

    if (tipo === 'periodo' && (!dataInicio || !dataFim)) {
      toast.error('Informe o período completo.')
      return
    }

    setSaving(true)
    try {
      const datas: string[] = []

      if (tipo === 'unico') {
        datas.push(dataUnica)
      } else {
        let current = parseISO(dataInicio)
        const end = parseISO(dataFim)
        if (current > end) {
          toast.error('A data final deve ser posterior à inicial.')
          setSaving(false)
          return
        }
        while (current <= end) {
          datas.push(format(current, 'yyyy-MM-dd'))
          current = addDays(current, 1)
        }
      }

      const inserts = datas.map((d) => ({
        data: d,
        descricao,
        tipo: 'ausencia',
        usuario_id: usuarioId === 'todos' ? null : usuarioId,
      }))

      const { error } = await supabase.from('ausencias').insert(inserts)
      if (error) throw error

      toast.success('Ausência(s) registrada(s) com sucesso!')
      onOpenChange(false)
      setDescricao('')
      setDataUnica('')
      setDataInicio('')
      setDataFim('')
      setUsuarioId('todos')
    } catch (e: any) {
      toast.error('Erro ao salvar: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Ausência Temporária</DialogTitle>
          <DialogDescription>
            Bloqueie as rotinas diárias para um colaborador durante folgas, férias ou estágios.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Colaborador</Label>
              <Select value={usuarioId} onValueChange={setUsuarioId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos (Feriado/Recesso Geral)</SelectItem>
                  {usuarios.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Registro</Label>
              <Select value={tipo} onValueChange={(v: any) => setTipo(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unico">Dia Único</SelectItem>
                  <SelectItem value="periodo">Período (Vários Dias)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {tipo === 'unico' ? (
              <div className="space-y-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={dataUnica}
                  onChange={(e) => setDataUnica(e.target.value)}
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>De</Label>
                  <Input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Até</Label>
                  <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Motivo / Descrição</Label>
              <Input
                placeholder="Ex: Férias, Folga, Estágio..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar Ausência
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface ManageProcedureDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dentistas: any[]
  editingProc: any | null
  tempos: any[]
  onSaved: () => void
}

export function ManageProcedureDialog({
  open,
  onOpenChange,
  dentistas,
  editingProc,
  tempos,
  onSaved,
}: ManageProcedureDialogProps) {
  const [procName, setProcName] = useState('')
  const [procDesc, setProcDesc] = useState('')
  const [procTempos, setProcTempos] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      if (editingProc) {
        setProcName(editingProc.nome)
        setProcDesc(editingProc.descricao)
        const temposProc = tempos.filter((t) => t.procedimento_id === editingProc.id)
        const mapTempos: Record<string, number> = {}
        temposProc.forEach((t) => {
          mapTempos[t.dentista_id] = t.tempo_minutos
        })
        setProcTempos(mapTempos)
      } else {
        setProcName('')
        setProcDesc('')
        setProcTempos({})
      }
    }
  }, [open, editingProc, tempos])

  const handleSaveProcedure = async () => {
    if (!procName.trim() || !procDesc.trim()) {
      toast.error('Preencha o nome e a descrição do procedimento.')
      return
    }

    setSaving(true)
    try {
      let procId = editingProc?.id

      if (procId) {
        const { error } = await supabase
          .from('pro_agenda_procedimentos')
          .update({ nome: procName, descricao: procDesc, atualizado_em: new Date().toISOString() })
          .eq('id', procId)
        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('pro_agenda_procedimentos')
          .insert({ nome: procName, descricao: procDesc })
          .select()
          .single()
        if (error) throw error
        procId = data.id
      }

      await supabase.from('pro_agenda_tempos').delete().eq('procedimento_id', procId)

      const temposToInsert = Object.entries(procTempos)
        .filter(([_, tempo]) => tempo > 0)
        .map(([dentista_id, tempo_minutos]) => ({
          procedimento_id: procId,
          dentista_id,
          tempo_minutos,
        }))

      if (temposToInsert.length > 0) {
        const { error: tError } = await supabase.from('pro_agenda_tempos').insert(temposToInsert)
        if (tError) throw tError
      }

      toast.success('Procedimento salvo com sucesso!')
      onSaved()
      onOpenChange(false)
    } catch (err: any) {
      toast.error('Erro ao salvar: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-bold">
            {editingProc ? 'Editar Procedimento' : 'Novo Procedimento'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 px-6 py-2 custom-scrollbar">
          <div className="space-y-4">
            <div>
              <Label className="text-slate-300">Nome do Procedimento</Label>
              <Input
                value={procName}
                onChange={(e) => setProcName(e.target.value)}
                className="bg-slate-950 border-slate-800 mt-1.5 focus-visible:ring-amber-500"
                placeholder="Ex: Avaliação Inicial"
              />
            </div>

            <div>
              <Label className="text-slate-300">Descrição / Instruções</Label>
              <Textarea
                value={procDesc}
                onChange={(e) => setProcDesc(e.target.value)}
                className="bg-slate-950 border-slate-800 mt-1.5 min-h-[100px] resize-none focus-visible:ring-amber-500"
                placeholder="Explique o que é este procedimento para a equipe da recepção..."
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Tempos por Dentista (em minutos)
            </h3>

            {dentistas.length === 0 ? (
              <p className="text-sm text-slate-500 italic">
                Nenhum dentista ativo encontrado no sistema.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2">
                {dentistas.map((dentista) => (
                  <div
                    key={dentista.id}
                    className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800"
                  >
                    <span className="text-sm font-medium text-slate-300 truncate pr-2">
                      {dentista.nome}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <Input
                        type="number"
                        min="0"
                        step="5"
                        value={procTempos[dentista.id] || ''}
                        onChange={(e) =>
                          setProcTempos((prev) => ({
                            ...prev,
                            [dentista.id]: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-20 bg-slate-900 border-slate-700 text-center h-8"
                        placeholder="Min"
                      />
                      <span className="text-xs text-slate-500">min</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="p-6 pt-4 border-t border-slate-800 mt-auto bg-slate-900/50">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSaveProcedure}
            className="bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold"
            disabled={saving}
          >
            {saving ? 'Salvando...' : 'Salvar Procedimento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

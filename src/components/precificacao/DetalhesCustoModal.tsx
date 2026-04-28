import { useState, useEffect } from 'react'
import { Plus, Trash2, ListPlus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { CurrencyInput } from './CurrencyInput'

export type CustoFixoDetalhe = {
  id: string
  custo_fixo_id: string
  descricao: string
  valor: number
  ordem: number
}

export type CustoFixo = {
  id: string
  descricao: string
  valor: number
  ordem: number
  detalhes?: CustoFixoDetalhe[]
}

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

interface DetalhesModalProps {
  custo: CustoFixo | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (custoId: string, detalhes: CustoFixoDetalhe[]) => void
}

export function DetalhesCustoModal({ custo, isOpen, onClose, onConfirm }: DetalhesModalProps) {
  const [detalhes, setDetalhes] = useState<CustoFixoDetalhe[]>([])

  useEffect(() => {
    if (custo) setDetalhes(custo.detalhes || [])
  }, [custo])

  const handleAddRow = () => {
    setDetalhes([
      ...detalhes,
      {
        id: generateUUID(),
        custo_fixo_id: custo?.id || '',
        descricao: '',
        valor: 0,
        ordem: detalhes.length * 10,
      },
    ])
  }

  const handleRemoveRow = (id: string) => setDetalhes(detalhes.filter((d) => d.id !== id))
  const updateDetalhe = (id: string, field: keyof CustoFixoDetalhe, value: any) =>
    setDetalhes((prev) => prev.map((d) => (d.id === id ? { ...d, [field]: value } : d)))

  const total = detalhes.reduce((acc, curr) => acc + (curr.valor || 0), 0)

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[600px] bg-slate-900 border-slate-800 p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="p-6 pb-4 border-b border-slate-800 bg-slate-800/30">
          <DialogTitle className="text-white text-lg flex items-center gap-2">
            <ListPlus className="w-5 h-5 text-amber-500" />
            Detalhamento:{' '}
            <span className="text-amber-500 font-semibold">{custo?.descricao || 'Custo'}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
            <p className="text-sm text-slate-300">
              Adicione os sub-itens. O valor total será calculado automaticamente.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddRow}
              className="bg-slate-900 border-slate-700 text-white hover:bg-slate-800 ml-4 shrink-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </div>

          <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950/50 shadow-inner">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-medium">Descrição do Sub-item</th>
                  <th className="px-4 py-3 font-medium w-[180px]">Valor</th>
                  <th className="px-4 py-3 font-medium w-[60px] text-center">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {detalhes.map((d, i) => (
                  <tr key={d.id} className="hover:bg-slate-900/80 transition-colors">
                    <td className="p-2 px-4">
                      <Input
                        value={d.descricao}
                        onChange={(e) => updateDetalhe(d.id, 'descricao', e.target.value)}
                        className="h-9 bg-slate-900 border-slate-700 focus:border-amber-500/50 text-slate-200 focus:bg-slate-800"
                        placeholder={`Ex: Item ${i + 1}...`}
                      />
                    </td>
                    <td className="p-2 px-4">
                      <CurrencyInput
                        value={d.valor}
                        onChange={(val) => updateDetalhe(d.id, 'valor', val)}
                      />
                    </td>
                    <td className="p-2 px-4 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveRow(d.id)}
                        className="h-8 w-8 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-md"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {detalhes.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-slate-500 bg-slate-900/20">
                      Nenhum item detalhado. Clique em "Adicionar" para começar.
                    </td>
                  </tr>
                )}
              </tbody>
              {detalhes.length > 0 && (
                <tfoot className="bg-slate-800 border-t border-slate-700">
                  <tr>
                    <td className="px-4 py-3 text-right font-medium text-slate-300 uppercase text-xs tracking-wider">
                      Valor Total Detalhado:
                    </td>
                    <td className="px-4 py-3 font-bold text-amber-500 text-base">
                      {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        <DialogFooter className="p-4 border-t border-slate-800 bg-slate-900/80 sm:justify-between">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-slate-800"
          >
            Cancelar
          </Button>
          <Button
            onClick={() => onConfirm(custo!.id, detalhes)}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-medium px-6"
          >
            Confirmar e Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

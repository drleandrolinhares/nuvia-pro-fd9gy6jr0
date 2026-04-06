import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Props {
  avaliacaoId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ConcretizarVendaModal({ open, onOpenChange, onSuccess }: Props) {
  const valorTotal = 10000
  const [percentual, setPercentual] = useState<string>('30')
  const [valorEntrada, setValorEntrada] = useState<string>('3000')

  useEffect(() => {
    if (open) {
      setPercentual('30')
      setValorEntrada('3000')
    }
  }, [open])

  const handlePercentualChange = (val: string) => {
    setPercentual(val)
    const p = Number(val) || 0
    setValorEntrada(((valorTotal * p) / 100).toString())
  }

  const handleValorEntradaChange = (val: string) => {
    setValorEntrada(val)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSuccess()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="dialog-description">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Concretizar Venda</DialogTitle>
            <p id="dialog-description" className="sr-only">
              Preencha os valores para concretizar a venda.
            </p>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Valor Total</Label>
              <Input
                type="number"
                value={valorTotal}
                readOnly
                className="bg-slate-100 dark:bg-slate-800"
              />
            </div>

            <div className="grid gap-2">
              <Label>Percentual (%)</Label>
              <Input
                type="number"
                value={percentual}
                onChange={(e) => handlePercentualChange(e.target.value)}
                className="bg-white dark:bg-slate-950"
              />
            </div>

            <div className="grid gap-2">
              <Label>Valor Entrada</Label>
              <Input
                type="number"
                value={valorEntrada}
                onChange={(e) => handleValorEntradaChange(e.target.value)}
                className="bg-white dark:bg-slate-950"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
              Confirmar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

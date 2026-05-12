import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RoteiroSetor, Roteiro } from '@/hooks/use-roteiros'
import { RoteiroCard } from './roteiro-card'
import { RoteiroDialog } from './roteiro-dialog'

export function RoteirosContent({
  setor,
  roteiros,
  onRefresh,
}: {
  setor: RoteiroSetor
  roteiros: Roteiro[]
  onRefresh: () => void
}) {
  const [dialog, setDialog] = useState<{ open: boolean; roteiro?: Roteiro }>({ open: false })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-4 rounded-lg border border-slate-700">
        <div>
          <h3 className="text-xl font-semibold text-white uppercase tracking-wide">{setor.nome}</h3>
          <p className="text-sm text-slate-200 mt-1">
            Gerencie os roteiros e mensagens deste setor.
          </p>
        </div>
        <Button
          onClick={() => setDialog({ open: true })}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold shrink-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Roteiro
        </Button>
      </div>

      {roteiros.length === 0 ? (
        <div className="text-center p-12 bg-slate-900 rounded-lg border border-slate-700 flex flex-col items-center justify-center min-h-[250px]">
          <p className="text-white font-medium text-lg">Nenhum roteiro cadastrado neste setor.</p>
          <p className="text-slate-300 text-sm mt-2">
            Clique em "Novo Roteiro" para adicionar o primeiro roteiro.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {roteiros.map((roteiro) => (
            <RoteiroCard
              key={roteiro.id}
              roteiro={roteiro}
              onEdit={() => setDialog({ open: true, roteiro })}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}

      <RoteiroDialog
        open={dialog.open}
        onOpenChange={(open: boolean) => setDialog({ open })}
        setorId={setor.id}
        roteiro={dialog.roteiro}
        onSuccess={onRefresh}
      />
    </div>
  )
}

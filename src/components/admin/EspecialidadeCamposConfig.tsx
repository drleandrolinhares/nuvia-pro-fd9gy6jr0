import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Settings2 } from 'lucide-react'
import * as cadastrosService from '@/services/cadastros'
import { CadastroItem, CampoPersonalizado } from '@/services/cadastros'

interface Props {
  especialidades: CadastroItem[]
}

export function EspecialidadeCamposConfig({ especialidades }: Props) {
  const [campos, setCampos] = useState<CampoPersonalizado[]>([])
  const [isLoadingCampos, setIsLoadingCampos] = useState(false)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEspecialidade, setSelectedEspecialidade] = useState<CadastroItem | null>(null)

  const [activeCampos, setActiveCampos] = useState<Set<string>>(new Set())
  const [isLoadingConfig, setIsLoadingConfig] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadCampos = async () => {
      setIsLoadingCampos(true)
      try {
        const data = await cadastrosService.getCamposPersonalizados()
        setCampos(data)
      } catch (error: any) {
        toast.error('Erro ao carregar campos disponíveis', { description: error.message })
      } finally {
        setIsLoadingCampos(false)
      }
    }
    loadCampos()
  }, [])

  const handleOpenConfig = async (especialidade: CadastroItem) => {
    setSelectedEspecialidade(especialidade)
    setIsModalOpen(true)
    setIsLoadingConfig(true)
    try {
      const ativos = await cadastrosService.getEspecialidadeCamposAtivos(especialidade.id)
      setActiveCampos(new Set(ativos))
    } catch (error: any) {
      toast.error('Erro ao carregar configurações', { description: error.message })
    } finally {
      setIsLoadingConfig(false)
    }
  }

  const handleToggleCampo = (campoId: string) => {
    setActiveCampos((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(campoId)) {
        newSet.delete(campoId)
      } else {
        newSet.add(campoId)
      }
      return newSet
    })
  }

  const handleSave = async () => {
    if (!selectedEspecialidade) return
    setIsSaving(true)
    try {
      await cadastrosService.salvarEspecialidadeCampos(
        selectedEspecialidade.id,
        Array.from(activeCampos),
      )
      toast.success('Configurações salvas com sucesso!')
      setIsModalOpen(false)
    } catch (error: any) {
      toast.error('Erro ao salvar configurações', { description: error.message })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-sidebar-border bg-sidebar overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-sidebar-border hover:bg-transparent">
              <TableHead className="text-sidebar-foreground/70">Especialidade</TableHead>
              <TableHead className="text-sidebar-foreground/70 w-[200px] text-right">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {especialidades.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={2} className="text-center text-sidebar-foreground/50 py-8">
                  Nenhuma especialidade cadastrada.
                </TableCell>
              </TableRow>
            ) : (
              especialidades.map((esp) => (
                <TableRow
                  key={esp.id}
                  className="border-b border-sidebar-border hover:bg-sidebar-accent/50 transition-colors"
                >
                  <TableCell className="font-medium text-sidebar-foreground">{esp.nome}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenConfig(esp)}
                      className="border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent hover:text-amber-500"
                    >
                      <Settings2 className="w-4 h-4 mr-2" />
                      Configurar Campos
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-slate-950 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-amber-500">Campos Adicionais</DialogTitle>
            <DialogDescription className="text-slate-400">
              Selecione os campos que devem ser exibidos ao cadastrar produtos para a especialidade{' '}
              <strong className="text-slate-200 font-semibold">
                {selectedEspecialidade?.nome}
              </strong>
              .
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {isLoadingCampos || isLoadingConfig ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
              </div>
            ) : (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {campos.map((campo) => (
                  <div
                    key={campo.id}
                    className="flex items-center space-x-3 p-2 hover:bg-slate-900 rounded-md transition-colors"
                  >
                    <Checkbox
                      id={`campo-${campo.id}`}
                      checked={activeCampos.has(campo.id)}
                      onCheckedChange={() => handleToggleCampo(campo.id)}
                      className="border-slate-600 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                    />
                    <Label
                      htmlFor={`campo-${campo.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                    >
                      {campo.nome}
                    </Label>
                  </div>
                ))}
                {campos.length === 0 && (
                  <p className="text-center text-slate-500 text-sm">
                    Nenhum campo disponível no sistema.
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-100"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || isLoadingConfig || isLoadingCampos}
              className="bg-amber-600 text-white hover:bg-amber-700"
            >
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Salvar Configurações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

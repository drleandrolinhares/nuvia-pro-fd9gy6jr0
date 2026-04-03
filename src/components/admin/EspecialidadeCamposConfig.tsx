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
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Loader2, Plus, ArrowUp, ArrowDown } from 'lucide-react'
import * as cadastrosService from '@/services/cadastros'
import { CadastroItem, CampoPersonalizado } from '@/services/cadastros'

interface Props {
  especialidades: CadastroItem[]
}

type ConfigItem = {
  campo_id: string
  ativo: boolean
  ordem: number
  nome_original: string
  label_customizado: string
}

export function EspecialidadeCamposConfig({ especialidades }: Props) {
  const [campos, setCampos] = useState<CampoPersonalizado[]>([])
  const [isLoadingCampos, setIsLoadingCampos] = useState(false)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEspecialidade, setSelectedEspecialidade] = useState<CadastroItem | null>(null)

  const [configs, setConfigs] = useState<ConfigItem[]>([])
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
      const existingConfigs = await cadastrosService.getEspecialidadeCampos(especialidade.id)

      const mergedConfigs: ConfigItem[] = campos.map((campo) => {
        const existing = existingConfigs.find((c: any) => c.campo_id === campo.id)
        return {
          campo_id: campo.id,
          nome_original: campo.nome,
          label_customizado: existing?.label_customizado || '',
          ativo: existing?.ativo ?? false,
          ordem: existing?.ordem ?? 999,
        }
      })

      mergedConfigs.sort((a, b) => {
        if (a.ativo && !b.ativo) return -1
        if (!a.ativo && b.ativo) return 1
        if (a.ordem !== b.ordem) return a.ordem - b.ordem
        return a.nome_original.localeCompare(b.nome_original)
      })

      mergedConfigs.forEach((c, idx) => {
        c.ordem = idx + 1
      })

      setConfigs(mergedConfigs)
    } catch (error: any) {
      toast.error('Erro ao carregar configurações', { description: error.message })
    } finally {
      setIsLoadingConfig(false)
    }
  }

  const handleToggleCampo = (campoId: string) => {
    setConfigs((prev) => prev.map((c) => (c.campo_id === campoId ? { ...c, ativo: !c.ativo } : c)))
  }

  const handleLabelChange = (campoId: string, value: string) => {
    setConfigs((prev) =>
      prev.map((c) => (c.campo_id === campoId ? { ...c, label_customizado: value } : c)),
    )
  }

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      setConfigs((prev) => {
        const newConfigs = [...prev]
        const temp = newConfigs[index]
        newConfigs[index] = newConfigs[index - 1]
        newConfigs[index - 1] = temp
        newConfigs.forEach((c, idx) => (c.ordem = idx + 1))
        return newConfigs
      })
    } else if (direction === 'down' && index < configs.length - 1) {
      setConfigs((prev) => {
        const newConfigs = [...prev]
        const temp = newConfigs[index]
        newConfigs[index] = newConfigs[index + 1]
        newConfigs[index + 1] = temp
        newConfigs.forEach((c, idx) => (c.ordem = idx + 1))
        return newConfigs
      })
    }
  }

  const handleSave = async () => {
    if (!selectedEspecialidade) return
    setIsSaving(true)
    try {
      const toSave = configs
        .filter((c) => c.ativo)
        .map((c) => ({
          especialidade_id: selectedEspecialidade.id,
          campo_id: c.campo_id,
          ordem: c.ordem,
          ativo: c.ativo,
          label_customizado: c.label_customizado || null,
        }))

      await cadastrosService.salvarEspecialidadeCampos(selectedEspecialidade.id, toSave as any)

      toast.success('Configurações salvas com sucesso!')
      setIsModalOpen(false)
    } catch (error: any) {
      toast.error('Erro ao salvar configurações', { description: error.message })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="rounded-xl border border-sidebar-border bg-sidebar overflow-hidden shadow-sm">
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
                      className="border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent hover:text-[#d4af37] transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />+ Configurar Campos
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] bg-[#1a2a4a] border-[#d4af37]/30 text-white shadow-2xl">
          <DialogHeader className="pb-4 border-b border-[#d4af37]/20">
            <DialogTitle className="text-[#d4af37] font-bold tracking-wider text-xl uppercase">
              DADOS DA ESPECIALIDADE
            </DialogTitle>
            <DialogDescription className="text-slate-300 mt-2">
              Selecione e ordene os campos que aparecerão para a especialidade{' '}
              <strong className="text-[#d4af37] font-semibold">
                {selectedEspecialidade?.nome}
              </strong>
              .
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {isLoadingCampos || isLoadingConfig ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-[#d4af37]" />
              </div>
            ) : (
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                {configs.map((config, index) => (
                  <div
                    key={config.campo_id}
                    className="flex items-center gap-4 p-3.5 bg-[#f3f4f6] rounded-lg border border-[#1a2a4a] shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-[#1a2a4a] hover:text-[#d4af37] hover:bg-[#1a2a4a]/10"
                        disabled={index === 0}
                        onClick={() => handleMove(index, 'up')}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-[#1a2a4a] hover:text-[#d4af37] hover:bg-[#1a2a4a]/10"
                        disabled={index === configs.length - 1}
                        onClick={() => handleMove(index, 'down')}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>

                    <Checkbox
                      id={`campo-${config.campo_id}`}
                      checked={config.ativo}
                      onCheckedChange={() => handleToggleCampo(config.campo_id)}
                      className="h-5 w-5 border-[#1a2a4a] data-[state=checked]:bg-[#1a2a4a] data-[state=checked]:text-[#d4af37]"
                    />

                    <div className="flex-1 flex flex-col gap-2">
                      <Label
                        htmlFor={`campo-${config.campo_id}`}
                        className="text-xs font-bold text-[#1a2a4a] uppercase drop-shadow-sm opacity-70"
                      >
                        Campo Original: {config.nome_original}
                      </Label>
                      <Input
                        value={config.label_customizado}
                        onChange={(e) => handleLabelChange(config.campo_id, e.target.value)}
                        placeholder={`Nome customizado (padrão: ${config.nome_original})`}
                        className="h-9 bg-white border-[#1a2a4a]/20 text-[#1a2a4a] font-semibold focus-visible:ring-[#d4af37]"
                        disabled={!config.ativo}
                      />
                    </div>
                  </div>
                ))}
                {configs.length === 0 && (
                  <p className="text-center text-slate-300 text-sm py-4">
                    Nenhum campo disponível.
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="pt-4 border-t border-[#d4af37]/20">
            <Button
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
              className="text-slate-300 hover:bg-white/10 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || isLoadingConfig || isLoadingCampos}
              className="bg-[#d4af37] text-[#1a2a4a] font-bold hover:bg-[#c29e2f] transition-colors"
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

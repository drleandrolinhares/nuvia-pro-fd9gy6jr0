import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, PackagePlus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

import {
  createProduto,
  fetchEspecialidades,
  Produto,
  fetchEspecialidadeCampos,
  upsertProdutoCamposValores,
} from '@/services/produtos'
import * as cadastrosService from '@/services/cadastros'

const formSchema = z.object({
  codigo_barras: z.string().optional(),
  nome: z.string().min(1, 'Nome é obrigatório'),
  marca: z.string().optional(),
  especialidade_id: z.string().optional(),
  embalagem: z.string().optional(),
  custo_unitario: z.coerce.number().min(0, 'Valor inválido').optional(),
  sala_id: z.string().optional(),
  referencia_consumo: z.enum(['qtd_comprada', 'itens_embalagem']),
  controle_prazo: z.boolean().default(false),
  alerta_prazo_dias: z.string().optional(),
  consumo_estimado_valor: z.string().optional(),
  consumo_estimado_frequencia: z.string().default('MES'),
  observacoes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface CriarProdutoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialNome?: string
  onSuccess: (produto: Produto) => void
}

export function CriarProdutoModal({
  open,
  onOpenChange,
  initialNome = '',
  onSuccess,
}: CriarProdutoModalProps) {
  const [especialidades, setEspecialidades] = useState<{ id: string; nome: string }[]>([])
  const [salas, setSalas] = useState<{ id: string; nome: string }[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [camposDinamicos, setCamposDinamicos] = useState<any[]>([])
  const [valoresDinamicos, setValoresDinamicos] = useState<Record<string, string>>({})
  const [campoOpcoes, setCampoOpcoes] = useState<Record<string, any[]>>({})
  const [mostrarEstimativa, setMostrarEstimativa] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      codigo_barras: '',
      nome: initialNome,
      marca: '',
      especialidade_id: 'none',
      embalagem: '',
      custo_unitario: 0,
      referencia_consumo: 'qtd_comprada',
      controle_prazo: false,
      alerta_prazo_dias: '',
      consumo_estimado_valor: '',
      consumo_estimado_frequencia: 'MES',
      observacoes: '',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        codigo_barras: '',
        nome: initialNome,
        marca: '',
        especialidade_id: 'none',
        embalagem: '',
        custo_unitario: 0,
        sala_id: 'none',
        referencia_consumo: 'qtd_comprada',
        controle_prazo: false,
        alerta_prazo_dias: '',
        consumo_estimado_valor: '',
        consumo_estimado_frequencia: 'MES',
        observacoes: '',
      })
      setMostrarEstimativa(false)
      fetchEspecialidades().then((res) => {
        if (res.data) setEspecialidades(res.data)
      })
      cadastrosService.getItems('salas').then((data) => setSalas(data || []))
      cadastrosService.getCampoOpcoes().then((data) => {
        if (data) {
          const map: Record<string, any[]> = {}
          data.forEach((o) => {
            if (!map[o.campo_id]) map[o.campo_id] = []
            map[o.campo_id].push({ id: o.id, nome: o.nome, especialidade_id: o.especialidade_id })
          })
          setCampoOpcoes(map)
        }
      })
    }
  }, [open, form, initialNome])

  const watchedEspecialidadeId = form.watch('especialidade_id')

  useEffect(() => {
    if (watchedEspecialidadeId && watchedEspecialidadeId !== 'none') {
      fetchEspecialidadeCampos(watchedEspecialidadeId).then((res) => {
        if (res.data) setCamposDinamicos(res.data)
      })
    } else {
      setCamposDinamicos([])
    }
    setValoresDinamicos({})
  }, [watchedEspecialidadeId])

  const onSubmit = async (values: FormValues) => {
    setLoading(true)

    const salaNome =
      values.sala_id !== 'none' ? salas.find((s) => s.id === values.sala_id)?.nome || null : null

    let dataRevisao = null
    const diasAlerta = values.alerta_prazo_dias ? parseInt(values.alerta_prazo_dias) : null
    if (values.controle_prazo && diasAlerta) {
      const d = new Date()
      d.setDate(d.getDate() + diasAlerta)
      dataRevisao = d.toISOString().split('T')[0]
    }

    const payload: Partial<Produto> = {
      ...values,
      nome: values.nome.trim().toUpperCase(),
      marca: values.marca ? values.marca.trim().toUpperCase() : undefined,
      especialidade_id: values.especialidade_id === 'none' ? null : values.especialidade_id,
      sala_id: values.sala_id === 'none' ? null : values.sala_id,
      sala: salaNome,
      quantidade_estoque: 0,
      quantidade_minima: 0,
      custo_unitario: values.custo_unitario || 0,
      referencia_consumo: values.referencia_consumo,
      alerta_prazo_dias: values.controle_prazo ? diasAlerta : null,
      data_proxima_revisao: dataRevisao,
      consumo_estimado_valor: values.consumo_estimado_valor
        ? parseFloat(values.consumo_estimado_valor)
        : null,
      consumo_estimado_frequencia: values.consumo_estimado_valor
        ? values.consumo_estimado_frequencia
        : null,
      observacoes: values.observacoes ? values.observacoes.trim() : null,
    }

    const { data, error } = await createProduto(payload as any)
    setLoading(false)

    if (error) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível criar o produto.',
        variant: 'destructive',
      })
    } else if (data) {
      if (Object.keys(valoresDinamicos).length > 0) {
        await upsertProdutoCamposValores(data.id, valoresDinamicos)
      }
      toast({ title: 'Sucesso', description: 'Produto criado com sucesso.' })
      onSuccess(data as Produto)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-slate-800">
            <PackagePlus className="w-5 h-5 text-amber-500" />
            Criar Novo Produto
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="codigo_barras"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código de Barras</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 7891234567890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Material *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Luva de Procedimento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="marca"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca do Produto</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Supermax" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="especialidade_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Especialidade</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Geral / Nenhuma</SelectItem>
                        {especialidades.map((esp) => (
                          <SelectItem key={esp.id} value={esp.id}>
                            {esp.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="embalagem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Embalagem</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Caixa">Caixa</SelectItem>
                        <SelectItem value="Unidade">Unidade</SelectItem>
                        <SelectItem value="Frasco">Frasco</SelectItem>
                        <SelectItem value="Pote">Pote</SelectItem>
                        <SelectItem value="Rolo">Rolo</SelectItem>
                        <SelectItem value="Pacote">Pacote</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="custo_unitario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custo Unitário</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sala_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sala</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Nenhuma</SelectItem>
                        {salas.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="referencia_consumo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Critério de Consumo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="qtd_comprada">Quantidade Comprada</SelectItem>
                      <SelectItem value="itens_embalagem">Itens na Embalagem</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Define como o estoque será incrementado nas entradas.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Informações adicionais sobre o produto..."
                      className="resize-none min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 pt-4 border-t border-slate-200 mt-4">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wider">
                Planejamento de Consumo
              </h3>

              <div className="flex items-center space-x-2">
                <Switch
                  id="controle_prazo"
                  checked={form.watch('controle_prazo')}
                  onCheckedChange={(val) => form.setValue('controle_prazo', val)}
                />
                <Label htmlFor="controle_prazo" className="cursor-pointer">
                  Controle de Estoque por Prazo
                </Label>
              </div>

              {form.watch('controle_prazo') && (
                <FormField
                  control={form.control}
                  name="alerta_prazo_dias"
                  render={({ field }) => (
                    <FormItem className="animate-fade-in">
                      <FormLabel>Dias para Reabastecimento</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" placeholder="Ex: 90" {...field} />
                      </FormControl>
                      <p className="text-xs text-slate-500">
                        O produto reaparecerá para compra após este prazo, independente da
                        quantidade.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-slate-600 dark:text-slate-300"
                onClick={() => setMostrarEstimativa(!mostrarEstimativa)}
              >
                {mostrarEstimativa ? 'Ocultar Estimativa' : 'Estimar Consumo Médio'}
              </Button>

              {mostrarEstimativa && (
                <div className="grid grid-cols-2 gap-4 animate-fade-in">
                  <FormField
                    control={form.control}
                    name="consumo_estimado_valor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Consumo Médio</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.01" placeholder="Ex: 2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="consumo_estimado_frequencia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequência</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="DIA">Por Dia</SelectItem>
                            <SelectItem value="SEMANA">Por Semana</SelectItem>
                            <SelectItem value="QUINZENA">Por Quinzena</SelectItem>
                            <SelectItem value="MES">Por Mês</SelectItem>
                            <SelectItem value="BIMESTRE">Por Bimestre</SelectItem>
                            <SelectItem value="TRIMESTRE">Por Trimestre</SelectItem>
                            <SelectItem value="SEMESTRE">Por Semestre</SelectItem>
                            <SelectItem value="ANO">Por Ano</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            {camposDinamicos.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-[#d4af37]/20 mt-4 bg-[#1a2a4a] p-5 rounded-xl shadow-sm animate-fade-in">
                <h3 className="font-bold text-[#d4af37] text-sm uppercase tracking-wider">
                  DADOS DO IMPLANTE
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {camposDinamicos.map((config) => {
                    const campo = config.campos || config.campos_personalizados
                    if (!campo) return null

                    const labelName = config.label_customizado || campo.nome
                    const options = (campoOpcoes[campo.id] || []).filter(
                      (o: any) =>
                        !o.especialidade_id || o.especialidade_id === watchedEspecialidadeId,
                    )
                    const isDynamicDropdown = options.length > 0 || campo.tipo === 'select'

                    return (
                      <div key={campo.id} className="space-y-2">
                        <Label className="text-slate-200">{labelName}</Label>
                        {isDynamicDropdown ? (
                          <Select
                            value={valoresDinamicos[campo.id] || ''}
                            onValueChange={(val) =>
                              setValoresDinamicos((prev) => ({ ...prev, [campo.id]: val }))
                            }
                          >
                            <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-[#d4af37]">
                              <SelectValue placeholder={`Selecione...`} />
                            </SelectTrigger>
                            <SelectContent>
                              {options.map((opt) => (
                                <SelectItem key={opt.id} value={opt.nome}>
                                  {opt.nome}
                                </SelectItem>
                              ))}
                              {options.length === 0 && (
                                <SelectItem value="none" disabled>
                                  Sem opções cadastradas
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            className="bg-white/5 border-white/10 text-white focus-visible:ring-[#d4af37]"
                            placeholder={`Digite ${labelName.toLowerCase()}`}
                            value={valoresDinamicos[campo.id] || ''}
                            onChange={(e) =>
                              setValoresDinamicos((prev) => ({
                                ...prev,
                                [campo.id]: e.target.value,
                              }))
                            }
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Salvar Produto
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

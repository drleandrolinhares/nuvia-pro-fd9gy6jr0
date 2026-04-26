import { useEffect, useState } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Switch } from '@/components/ui/switch'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { saveColaborador, getColaboradorDetalhes } from '@/services/usuarios'
import { supabase } from '@/lib/supabase/client'
import { colaboradorSchema, ColaboradorFormData } from './colaborador-schema'

const Field = ({ label, error, children }: any) => (
  <div className="space-y-1">
    <Label className={error ? 'text-red-500' : ''}>{label}</Label>
    {children}
    {error && <p className="text-xs text-red-500">{error.message}</p>}
  </div>
)

export default function ColaboradorFormSheet({
  isOpen,
  onClose,
  cargos,
  usuario,
  onSuccess,
  isAdmin,
}: any) {
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('pessoal')
  const [showPassword, setShowPassword] = useState(false)
  const isEdit = !!usuario

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ColaboradorFormData>({
    resolver: zodResolver(colaboradorSchema),
    defaultValues: { status: 'ativo', possui_carteira: true, exigir_rotina: true },
  })

  const watchCargo = useWatch({ control, name: 'cargo_id' })
  const selectedCargo = cargos?.find((c: any) => c.id === watchCargo)

  useEffect(() => {
    if (!isOpen) return
    setActiveTab('pessoal')
    if (isEdit) {
      setLoading(true)
      getColaboradorDetalhes(usuario.id)
        .then((det) => {
          let em = { nome: '', telefone: '', parentesco: '' }
          try {
            if (det?.beneficiario_emergencia) em = JSON.parse(det.beneficiario_emergencia)
          } catch {
            /* ignore */
          }
          reset({
            ...usuario,
            password: '',
            ...det,
            possui_carteira: usuario.possui_carteira ?? true,
            exigir_rotina: usuario.exigir_rotina ?? true,
            dias_trabalho: (usuario as any).dias_trabalho ?? [1, 2, 3, 4, 5],
            emergencia_nome: em.nome,
            emergencia_telefone: em.telefone,
            emergencia_parentesco: em.parentesco,
          })
        })
        .finally(() => setLoading(false))
    } else {
      reset({ status: 'ativo', possui_carteira: true, exigir_rotina: true })
    }
  }, [isOpen, isEdit, usuario, reset])

  const onSubmit = async (data: ColaboradorFormData) => {
    try {
      setSaving(true)
      const payload = {
        id: usuario?.id,
        ...data,
        possui_carteira: data.possui_carteira !== undefined ? data.possui_carteira : true,
        exigir_rotina: data.exigir_rotina !== undefined ? data.exigir_rotina : true,
        horario_entrada: data.horario_entrada || null,
        inicio_lanche_manha: data.inicio_lanche_manha || null,
        fim_lanche_manha: data.fim_lanche_manha || null,
        saida_almoco: data.saida_almoco || null,
        retorno_almoco: data.retorno_almoco || null,
        inicio_lanche_tarde: data.inicio_lanche_tarde || null,
        fim_lanche_tarde: data.fim_lanche_tarde || null,
        horario_saida: data.horario_saida || null,
        beneficiario_emergencia: JSON.stringify({
          nome: data.emergencia_nome,
          telefone: data.emergencia_telefone,
          parentesco: data.emergencia_parentesco,
        }),
      }
      await saveColaborador(payload, isEdit, usuario?.email)

      if (isEdit && data.password && data.password.trim() !== '') {
        const { error: pwError } = await supabase.functions.invoke('update-user-password', {
          body: { userId: usuario.id, password: data.password },
        })
        if (pwError) throw new Error(pwError.message || 'Erro ao atualizar a senha')
      }

      toast.success(`Colaborador ${isEdit ? 'atualizado' : 'cadastrado'} com sucesso!`)
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar colaborador')
    } finally {
      setSaving(false)
    }
  }

  const onError = (formErrors: any) => {
    const errorKeys = Object.keys(formErrors)
    if (errorKeys.length > 0) {
      toast.error('Existem campos com erros ou não preenchidos. Verifique o formulário.')

      const profFields = ['cargo_id', 'status', 'salario', 'data_admissao', 'cargo_secundario_id']
      const bancoFields = ['banco', 'agencia', 'conta', 'pix', 'ctps', 'pis']
      const emergFields = ['emergencia_nome', 'emergencia_telefone', 'emergencia_parentesco']
      const jornadaFields = [
        'horario_entrada',
        'horario_saida',
        'inicio_lanche_manha',
        'fim_lanche_manha',
        'saida_almoco',
        'retorno_almoco',
        'inicio_lanche_tarde',
        'fim_lanche_tarde',
      ]

      const firstError = errorKeys[0]
      if (profFields.includes(firstError)) {
        setActiveTab('prof')
      } else if (bancoFields.includes(firstError)) {
        setActiveTab('banco')
      } else if (emergFields.includes(firstError)) {
        setActiveTab('emerg')
      } else if (jornadaFields.includes(firstError)) {
        setActiveTab('jornada')
      } else {
        setActiveTab('pessoal')
      }
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[600px] w-full overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>{isEdit ? 'Editar' : 'Novo'} Colaborador</SheetTitle>
          <SheetDescription>Preencha os dados do colaborador abaixo.</SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="animate-spin w-8 h-8 text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5 h-auto">
                <TabsTrigger value="pessoal" className="text-xs px-1">
                  Pessoal
                </TabsTrigger>
                <TabsTrigger value="prof" className="text-xs px-1">
                  Profissional
                </TabsTrigger>
                <TabsTrigger value="jornada" className="text-xs px-1">
                  Jornada
                </TabsTrigger>
                <TabsTrigger value="banco" className="text-xs px-1">
                  Docs/Banco
                </TabsTrigger>
                <TabsTrigger value="emerg" className="text-xs px-1">
                  Emergência
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pessoal" className="space-y-4 mt-4">
                <Field label="Nome Completo *" error={errors.nome}>
                  <Input {...register('nome')} />
                </Field>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="E-mail *" error={errors.email}>
                    <Input type="email" disabled={isEdit && !isAdmin} {...register('email')} />
                  </Field>
                  <Field
                    label={isEdit ? 'Nova Senha (opcional)' : 'Senha Temporária *'}
                    error={errors.password}
                  >
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        {...register('password')}
                        placeholder={isEdit ? 'Digite para alterar a senha' : ''}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </Field>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="CPF" error={errors.cpf}>
                    <Input placeholder="000.000.000-00" {...register('cpf')} />
                  </Field>
                  <Field label="Data de Nascimento" error={errors.data_nascimento}>
                    <Input type="date" {...register('data_nascimento')} />
                  </Field>
                </div>
                <Field label="Telefone" error={errors.telefone}>
                  <Input {...register('telefone')} />
                </Field>
                <Field label="Endereço" error={errors.endereco}>
                  <Input {...register('endereco')} />
                </Field>
              </TabsContent>

              <TabsContent value="prof" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Cargo Principal *" error={errors.cargo_id}>
                    <Controller
                      name="cargo_id"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o cargo" />
                          </SelectTrigger>
                          <SelectContent>
                            {cargos?.map((c: any) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </Field>
                  <Field label="Cargo Secundário" error={errors.cargo_secundario_id}>
                    <Controller
                      name="cargo_secundario_id"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value || 'none'}
                          onValueChange={(v) => field.onChange(v === 'none' ? null : v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione (opcional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Nenhum</SelectItem>
                            {cargos?.map((c: any) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Setor Principal">
                    <Input
                      value={selectedCargo?.setor || ''}
                      readOnly
                      className="bg-muted text-muted-foreground"
                      placeholder="Automático pelo cargo"
                    />
                  </Field>
                  <Field label="Data de Admissão" error={errors.data_admissao}>
                    <Input type="date" {...register('data_admissao')} />
                  </Field>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Status *" error={errors.status}>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ativo">Ativo</SelectItem>
                            <SelectItem value="inativo">Inativo</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </Field>
                  <Field label="Salário" error={errors.salario}>
                    <Input type="number" step="0.01" {...register('salario')} />
                  </Field>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Possui Carteira Digital?" error={errors.possui_carteira}>
                    <Controller
                      name="possui_carteira"
                      control={control}
                      render={({ field }) => (
                        <div className="flex items-center space-x-2 mt-2">
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                          <span className="text-sm text-muted-foreground">
                            {field.value ? 'Sim (Habilitado)' : 'Não (Desabilitado)'}
                          </span>
                        </div>
                      )}
                    />
                  </Field>
                  <Field label="Exigir Rotina Diária?" error={errors.exigir_rotina}>
                    <Controller
                      name="exigir_rotina"
                      control={control}
                      render={({ field }) => (
                        <div className="flex items-center space-x-2 mt-2">
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                          <span className="text-sm text-muted-foreground">
                            {field.value ? 'Sim (Com rotina)' : 'Não (Sem rotina)'}
                          </span>
                        </div>
                      )}
                    />
                  </Field>
                </div>
              </TabsContent>

              <TabsContent value="jornada" className="space-y-4 mt-4">
                <Field label="Dias de Trabalho" error={errors.dias_trabalho}>
                  <Controller
                    name="dias_trabalho"
                    control={control}
                    render={({ field }) => (
                      <div className="flex gap-2 flex-wrap mt-1">
                        {[
                          { label: 'Dom', val: 0 },
                          { label: 'Seg', val: 1 },
                          { label: 'Ter', val: 2 },
                          { label: 'Qua', val: 3 },
                          { label: 'Qui', val: 4 },
                          { label: 'Sex', val: 5 },
                          { label: 'Sáb', val: 6 },
                        ].map((d) => {
                          const isSelected = field.value?.includes(d.val)
                          return (
                            <Badge
                              key={d.val}
                              variant={isSelected ? 'default' : 'outline'}
                              className="cursor-pointer px-3 py-1 hover:opacity-80 transition-opacity"
                              onClick={() => {
                                const curr = field.value || []
                                if (isSelected) {
                                  field.onChange(curr.filter((x: number) => x !== d.val))
                                } else {
                                  field.onChange([...curr, d.val])
                                }
                              }}
                            >
                              {d.label}
                            </Badge>
                          )
                        })}
                      </div>
                    )}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Horário de Entrada" error={errors.horario_entrada}>
                    <Input type="time" {...register('horario_entrada')} />
                  </Field>
                  <Field label="Horário de Saída" error={errors.horario_saida}>
                    <Input type="time" {...register('horario_saida')} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Início Lanche Manhã" error={errors.inicio_lanche_manha}>
                    <Input type="time" {...register('inicio_lanche_manha')} />
                  </Field>
                  <Field label="Fim Lanche Manhã" error={errors.fim_lanche_manha}>
                    <Input type="time" {...register('fim_lanche_manha')} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Saída para Almoço" error={errors.saida_almoco}>
                    <Input type="time" {...register('saida_almoco')} />
                  </Field>
                  <Field label="Retorno do Almoço" error={errors.retorno_almoco}>
                    <Input type="time" {...register('retorno_almoco')} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Início Lanche Tarde" error={errors.inicio_lanche_tarde}>
                    <Input type="time" {...register('inicio_lanche_tarde')} />
                  </Field>
                  <Field label="Fim Lanche Tarde" error={errors.fim_lanche_tarde}>
                    <Input type="time" {...register('fim_lanche_tarde')} />
                  </Field>
                </div>
              </TabsContent>

              <TabsContent value="banco" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Banco" error={errors.banco}>
                    <Input {...register('banco')} />
                  </Field>
                  <Field label="Agência" error={errors.agencia}>
                    <Input {...register('agencia')} />
                  </Field>
                  <Field label="Conta" error={errors.conta}>
                    <Input {...register('conta')} />
                  </Field>
                  <Field label="PIX" error={errors.pix}>
                    <Input {...register('pix')} />
                  </Field>
                  <Field label="CTPS" error={errors.ctps}>
                    <Input {...register('ctps')} />
                  </Field>
                  <Field label="PIS" error={errors.pis}>
                    <Input {...register('pis')} />
                  </Field>
                </div>
              </TabsContent>

              <TabsContent value="emerg" className="space-y-4 mt-4">
                <Field label="Nome do Contato" error={errors.emergencia_nome}>
                  <Input {...register('emergencia_nome')} />
                </Field>
                <Field label="Telefone" error={errors.emergencia_telefone}>
                  <Input {...register('emergencia_telefone')} />
                </Field>
                <Field label="Parentesco" error={errors.emergencia_parentesco}>
                  <Input {...register('emergencia_parentesco')} />
                </Field>
              </TabsContent>
            </Tabs>

            <SheetFooter className="mt-6">
              <Button variant="outline" type="button" onClick={onClose} disabled={saving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Salvar
              </Button>
            </SheetFooter>
          </form>
        )}
      </SheetContent>
    </Sheet>
  )
}

import { useEffect, useState } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { Loader2 } from 'lucide-react'
import { saveColaborador, getColaboradorDetalhes } from '@/services/usuarios'
import { colaboradorSchema, ColaboradorFormData } from './colaborador-schema'

const Field = ({ label, error, children }: any) => (
  <div className="space-y-1">
    <Label className={error ? 'text-red-500' : ''}>{label}</Label>
    {children}
    {error && <p className="text-xs text-red-500">{error.message}</p>}
  </div>
)

export default function ColaboradorFormSheet({ isOpen, onClose, cargos, usuario, onSuccess }: any) {
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const isEdit = !!usuario

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ColaboradorFormData>({
    resolver: zodResolver(colaboradorSchema),
    defaultValues: { status: 'ativo' },
  })

  const watchCargo = useWatch({ control, name: 'cargo_id' })
  const selectedCargo = cargos?.find((c: any) => c.id === watchCargo)

  useEffect(() => {
    if (!isOpen) return
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
            emergencia_nome: em.nome,
            emergencia_telefone: em.telefone,
            emergencia_parentesco: em.parentesco,
          })
        })
        .finally(() => setLoading(false))
    } else {
      reset({ status: 'ativo' })
    }
  }, [isOpen, isEdit, usuario, reset])

  const onSubmit = async (data: ColaboradorFormData) => {
    try {
      setSaving(true)
      const payload = {
        ...data,
        beneficiario_emergencia: JSON.stringify({
          nome: data.emergencia_nome,
          telefone: data.emergencia_telefone,
          parentesco: data.emergencia_parentesco,
        }),
      }
      await saveColaborador(payload, isEdit)
      toast.success(`Colaborador ${isEdit ? 'atualizado' : 'cadastrado'} com sucesso!`)
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar colaborador')
    } finally {
      setSaving(false)
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Tabs defaultValue="pessoal">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="pessoal">Pessoal</TabsTrigger>
                <TabsTrigger value="prof">Profissional</TabsTrigger>
                <TabsTrigger value="banco">Docs/Banco</TabsTrigger>
                <TabsTrigger value="emerg">Emergência</TabsTrigger>
              </TabsList>

              <TabsContent value="pessoal" className="space-y-4 mt-4">
                <Field label="Nome Completo *" error={errors.nome}>
                  <Input {...register('nome')} />
                </Field>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="E-mail *" error={errors.email}>
                    <Input type="email" disabled={isEdit} {...register('email')} />
                  </Field>
                  <Field
                    label={isEdit ? 'Senha (não alterável aqui)' : 'Senha Temporária *'}
                    error={errors.password}
                  >
                    <Input
                      type="password"
                      {...register('password')}
                      disabled={isEdit}
                      placeholder={isEdit ? '***' : ''}
                    />
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

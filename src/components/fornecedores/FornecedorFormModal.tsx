import { useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Fornecedor } from '@/services/fornecedores'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Partial<Fornecedor>) => void
  fornecedor: Partial<Fornecedor>
}

const maskCNPJ = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .slice(0, 18)
}

const maskPhone = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/g, '($1) $2')
    .replace(/(\d)(\d{4})$/, '$1-$2')
    .slice(0, 15)
}

export function FornecedorFormModal({ isOpen, onClose, onSave, fornecedor }: Props) {
  const [formData, setFormData] = useState<Partial<Fornecedor>>(fornecedor)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setFormData(fornecedor)
    setShowPassword(false)
    setErrors({})
  }, [fornecedor, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    let formattedValue = value

    if (name === 'cnpj') formattedValue = maskCNPJ(value)
    if (name === 'telefone') formattedValue = maskPhone(value)

    setFormData((prev) => ({ ...prev, [name]: formattedValue }))
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSaveClick = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.nome?.trim()) newErrors.nome = 'Nome é obrigatório'
    if (!formData.cnpj?.trim()) newErrors.cnpj = 'CNPJ é obrigatório'
    else if (formData.cnpj.length < 18) newErrors.cnpj = 'CNPJ inválido'

    if (!formData.telefone?.trim()) newErrors.telefone = 'Telefone é obrigatório'
    else if (formData.telefone.length < 14) newErrors.telefone = 'Telefone inválido'

    if (!formData.email?.trim()) newErrors.email = 'E-mail é obrigatório'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'E-mail inválido'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSave(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-[#1a2a4a] p-0">
        <DialogHeader className="bg-[#1a2a4a] p-6 rounded-t-lg">
          <DialogTitle className="text-[#d4af37] text-xl">
            {fornecedor.id ? 'Editar Fornecedor' : 'Novo Fornecedor'}
          </DialogTitle>
        </DialogHeader>
        <div className="p-6 grid grid-cols-2 gap-4">
          <div className="space-y-2 col-span-2">
            <Label className="text-[#d4af37] font-bold">Nome *</Label>
            <Input
              name="nome"
              value={formData.nome || ''}
              onChange={handleChange}
              className={
                errors.nome
                  ? 'border-red-500 focus-visible:ring-red-500'
                  : 'border-slate-300 focus-visible:ring-[#1a2a4a]'
              }
            />
            {errors.nome && <p className="text-red-500 text-xs">{errors.nome}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-[#d4af37] font-bold">CNPJ *</Label>
            <Input
              name="cnpj"
              value={formData.cnpj || ''}
              onChange={handleChange}
              placeholder="00.000.000/0000-00"
              className={
                errors.cnpj
                  ? 'border-red-500 focus-visible:ring-red-500'
                  : 'border-slate-300 focus-visible:ring-[#1a2a4a]'
              }
            />
            {errors.cnpj && <p className="text-red-500 text-xs">{errors.cnpj}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-[#d4af37] font-bold">Telefone *</Label>
            <Input
              name="telefone"
              value={formData.telefone || ''}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
              className={
                errors.telefone
                  ? 'border-red-500 focus-visible:ring-red-500'
                  : 'border-slate-300 focus-visible:ring-[#1a2a4a]'
              }
            />
            {errors.telefone && <p className="text-red-500 text-xs">{errors.telefone}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-[#d4af37] font-bold">E-mail *</Label>
            <Input
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              placeholder="contato@empresa.com"
              className={
                errors.email
                  ? 'border-red-500 focus-visible:ring-red-500'
                  : 'border-slate-300 focus-visible:ring-[#1a2a4a]'
              }
            />
            {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-[#d4af37] font-bold">Contato Principal</Label>
            <Input
              name="contato_principal"
              value={formData.contato_principal || ''}
              onChange={handleChange}
              className="border-slate-300 focus-visible:ring-[#1a2a4a]"
            />
          </div>
          <div className="space-y-2 col-span-2">
            <Label className="text-[#d4af37] font-bold">Endereço</Label>
            <Input
              name="endereco"
              value={formData.endereco || ''}
              onChange={handleChange}
              className="border-slate-300 focus-visible:ring-[#1a2a4a]"
            />
          </div>
          <div className="space-y-2 col-span-2">
            <Label className="text-[#d4af37] font-bold">Observações</Label>
            <Textarea
              name="observacoes"
              value={formData.observacoes || ''}
              onChange={handleChange}
              className="border-slate-300 focus-visible:ring-[#1a2a4a]"
            />
          </div>

          <div className="col-span-2 border border-[#1a2a4a]/20 rounded-md p-4 bg-slate-50/50 space-y-4 mt-2">
            <h3 className="font-semibold text-[#1a2a4a] flex items-center gap-2">
              CENTRAL DE ACESSO
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label className="text-[#d4af37] font-bold">URL do Portal</Label>
                <Input
                  name="url"
                  value={formData.url || ''}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="border-slate-300 focus-visible:ring-[#1a2a4a]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#d4af37] font-bold">Usuário / Login</Label>
                <Input
                  name="usuario_login"
                  value={formData.usuario_login || ''}
                  onChange={handleChange}
                  className="border-slate-300 focus-visible:ring-[#1a2a4a]"
                />
              </div>
              <div className="space-y-2 relative">
                <Label className="text-[#d4af37] font-bold">Senha</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="senha"
                    value={formData.senha || ''}
                    onChange={handleChange}
                    className="pr-10 border-slate-300 focus-visible:ring-[#1a2a4a]"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-9 w-9 text-slate-500 hover:text-slate-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="bg-slate-50 p-4 rounded-b-lg border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[#1a2a4a] text-[#1a2a4a] hover:bg-[#1a2a4a]/10"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSaveClick}
            className="bg-[#1a2a4a] hover:bg-[#1a2a4a]/90 text-[#d4af37] font-bold"
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

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

export function FornecedorFormModal({ isOpen, onClose, onSave, fornecedor }: Props) {
  const [formData, setFormData] = useState<Partial<Fornecedor>>(fornecedor)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    setFormData(fornecedor)
    setShowPassword(false)
  }, [fornecedor, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{fornecedor.id ? 'Editar Fornecedor' : 'Novo Fornecedor'}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2 col-span-2">
            <Label>Nome *</Label>
            <Input name="nome" value={formData.nome || ''} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label>CNPJ</Label>
            <Input name="cnpj" value={formData.cnpj || ''} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input name="telefone" value={formData.telefone || ''} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label>E-mail</Label>
            <Input type="email" name="email" value={formData.email || ''} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label>Contato Principal</Label>
            <Input
              name="contato_principal"
              value={formData.contato_principal || ''}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2 col-span-2">
            <Label>Endereço</Label>
            <Input name="endereco" value={formData.endereco || ''} onChange={handleChange} />
          </div>
          <div className="space-y-2 col-span-2">
            <Label>Observações</Label>
            <Textarea
              name="observacoes"
              value={formData.observacoes || ''}
              onChange={handleChange}
            />
          </div>

          <div className="col-span-2 border rounded-md p-4 bg-slate-50/50 space-y-4 mt-2">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              CENTRAL DE ACESSO
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>URL do Portal</Label>
                <Input
                  name="url"
                  value={formData.url || ''}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label>Usuário / Login</Label>
                <Input
                  name="usuario_login"
                  value={formData.usuario_login || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2 relative">
                <Label>Senha</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="senha"
                    value={formData.senha || ''}
                    onChange={handleChange}
                    className="pr-10"
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
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={() => onSave(formData)}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

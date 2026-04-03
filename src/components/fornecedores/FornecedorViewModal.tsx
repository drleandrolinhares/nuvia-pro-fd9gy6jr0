import { useState } from 'react'
import { Eye, EyeOff, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Fornecedor } from '@/services/fornecedores'

interface Props {
  isOpen: boolean
  onClose: () => void
  fornecedor: Fornecedor | null
}

export function FornecedorViewModal({ isOpen, onClose, fornecedor }: Props) {
  const [showViewPassword, setShowViewPassword] = useState(false)

  if (!fornecedor) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalhes do Fornecedor</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-y-4 gap-x-6 py-4 text-sm">
          <div>
            <strong className="block text-slate-500 text-xs uppercase mb-1">Nome</strong>
            <p className="font-medium text-slate-900">{fornecedor.nome}</p>
          </div>
          <div>
            <strong className="block text-slate-500 text-xs uppercase mb-1">CNPJ</strong>
            <p>{fornecedor.cnpj || '-'}</p>
          </div>
          <div>
            <strong className="block text-slate-500 text-xs uppercase mb-1">
              Contato Principal
            </strong>
            <p>{fornecedor.contato_principal || '-'}</p>
          </div>
          <div>
            <strong className="block text-slate-500 text-xs uppercase mb-1">Telefone</strong>
            <p>{fornecedor.telefone || '-'}</p>
          </div>
          <div>
            <strong className="block text-slate-500 text-xs uppercase mb-1">E-mail</strong>
            <p>{fornecedor.email || '-'}</p>
          </div>
          <div className="col-span-2">
            <strong className="block text-slate-500 text-xs uppercase mb-1">Endereço</strong>
            <p>{fornecedor.endereco || '-'}</p>
          </div>
          <div className="col-span-2">
            <strong className="block text-slate-500 text-xs uppercase mb-1">Observações</strong>
            <p className="whitespace-pre-wrap">{fornecedor.observacoes || '-'}</p>
          </div>

          <div className="col-span-2 border-t pt-4 mt-2">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              CENTRAL DE ACESSO
            </h4>
            <div className="grid grid-cols-2 gap-4 bg-slate-50 rounded-md p-4 border">
              <div className="col-span-2">
                <strong className="block text-slate-500 text-xs uppercase mb-1">
                  URL do Portal
                </strong>
                {fornecedor.url ? (
                  <a
                    href={fornecedor.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1 w-fit font-medium"
                  >
                    {fornecedor.url} <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  '-'
                )}
              </div>
              <div>
                <strong className="block text-slate-500 text-xs uppercase mb-1">
                  Usuário / Login
                </strong>
                <p className="font-medium">{fornecedor.usuario_login || '-'}</p>
              </div>
              <div>
                <strong className="block text-slate-500 text-xs uppercase mb-1">Senha</strong>
                <div className="flex items-center gap-2">
                  <p className="font-medium bg-white px-2 py-1 rounded border min-w-[100px] h-8 flex items-center">
                    {fornecedor.senha ? (showViewPassword ? fornecedor.senha : '••••••••') : '-'}
                  </p>
                  {fornecedor.senha && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-slate-500"
                      onClick={() => setShowViewPassword(!showViewPassword)}
                    >
                      {showViewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

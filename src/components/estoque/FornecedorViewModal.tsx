import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Fornecedor } from '@/services/fornecedores'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Props {
  isOpen: boolean
  onClose: () => void
  fornecedor: Fornecedor | null
}

export function FornecedorViewModal({ isOpen, onClose, fornecedor }: Props) {
  if (!fornecedor) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900 border-b pb-2">
            Detalhes do Fornecedor
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-6 py-4">
          <div className="space-y-1">
            <Label className="text-slate-500 text-xs uppercase tracking-wider">Nome</Label>
            <p className="font-medium text-slate-900">{fornecedor.nome}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-slate-500 text-xs uppercase tracking-wider">CNPJ</Label>
            <p className="font-medium text-slate-900">{fornecedor.cnpj || '-'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-slate-500 text-xs uppercase tracking-wider">Telefone</Label>
            <p className="font-medium text-slate-900">{fornecedor.telefone || '-'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-slate-500 text-xs uppercase tracking-wider">E-mail</Label>
            <p className="font-medium text-slate-900">{fornecedor.email || '-'}</p>
          </div>
          <div className="space-y-1 col-span-2">
            <Label className="text-slate-500 text-xs uppercase tracking-wider">
              Contato Principal
            </Label>
            <p className="font-medium text-slate-900">{fornecedor.contato_principal || '-'}</p>
          </div>
          <div className="space-y-1 col-span-2">
            <Label className="text-slate-500 text-xs uppercase tracking-wider">Endereço</Label>
            <p className="font-medium text-slate-900">{fornecedor.endereco || '-'}</p>
          </div>
          {fornecedor.url && (
            <div className="space-y-1 col-span-2 bg-slate-50 p-4 rounded-lg border border-slate-200 shadow-sm">
              <Label className="text-slate-500 text-xs font-bold uppercase tracking-wider flex items-center gap-2 mb-2">
                Central de Acesso
              </Label>
              <p className="font-medium text-blue-600 truncate">
                <a
                  href={fornecedor.url}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  {fornecedor.url}
                </a>
              </p>
              {fornecedor.usuario_login && (
                <p className="text-sm mt-2 text-slate-700">
                  Login:{' '}
                  <span className="font-mono bg-slate-200 px-2 py-0.5 rounded text-slate-900 font-semibold">
                    {fornecedor.usuario_login}
                  </span>
                </p>
              )}
            </div>
          )}
          <div className="space-y-1 col-span-2">
            <Label className="text-slate-500 text-xs uppercase tracking-wider">Observações</Label>
            <p className="text-slate-700 bg-slate-50 p-3 rounded-md border border-slate-100 min-h-[60px] whitespace-pre-wrap">
              {fornecedor.observacoes || '-'}
            </p>
          </div>
          <div className="space-y-1 col-span-2 text-right pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-400 font-medium">
              Cadastrado em:{' '}
              {fornecedor.criado_em
                ? format(new Date(fornecedor.criado_em), "dd/MM/yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })
                : '-'}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

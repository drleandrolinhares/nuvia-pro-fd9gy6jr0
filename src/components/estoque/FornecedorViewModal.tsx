import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Fornecedor } from '@/services/fornecedores'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Props {
  isOpen: boolean
  onClose: () => void
  fornecedor: Fornecedor
}

export function FornecedorViewModal({ isOpen, onClose, fornecedor }: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl border-[#1a2a4a] p-0 overflow-hidden bg-white">
        <DialogHeader className="bg-[#1a2a4a] p-6">
          <DialogTitle className="text-[#d4af37] text-xl font-bold">
            Detalhes do Fornecedor
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-6">
          <div>
            <h4 className="text-xs font-bold text-[#d4af37] uppercase tracking-wider mb-1">Nome</h4>
            <p className="text-slate-900 font-medium text-base">{fornecedor.nome}</p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#d4af37] uppercase tracking-wider mb-1">CNPJ</h4>
            <p className="text-slate-900 font-mono text-base">{fornecedor.cnpj || '-'}</p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#d4af37] uppercase tracking-wider mb-1">
              Telefone
            </h4>
            <p className="text-slate-900 text-base">{fornecedor.telefone || '-'}</p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#d4af37] uppercase tracking-wider mb-1">
              E-mail
            </h4>
            <p className="text-slate-900 text-base">{fornecedor.email || '-'}</p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#d4af37] uppercase tracking-wider mb-1">
              Contato Principal
            </h4>
            <p className="text-slate-900 text-base">{fornecedor.contato_principal || '-'}</p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#d4af37] uppercase tracking-wider mb-1">
              Data de Cadastro
            </h4>
            <p className="text-slate-900 text-base">
              {fornecedor.criado_em
                ? format(parseISO(fornecedor.criado_em), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                : '-'}
            </p>
          </div>
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-xs font-bold text-[#d4af37] uppercase tracking-wider mb-1">
              Endereço
            </h4>
            <p className="text-slate-900 text-base">{fornecedor.endereco || '-'}</p>
          </div>
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-xs font-bold text-[#d4af37] uppercase tracking-wider mb-1">
              Observações
            </h4>
            <p className="text-slate-900 text-base whitespace-pre-wrap">
              {fornecedor.observacoes || '-'}
            </p>
          </div>

          {(fornecedor.url || fornecedor.usuario_login) && (
            <div className="col-span-1 md:col-span-2 mt-2 p-5 bg-slate-50 border border-slate-200 rounded-lg">
              <h3 className="font-bold text-[#1a2a4a] mb-4 text-sm uppercase tracking-wider">
                Dados de Acesso (Portal)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    URL do Portal
                  </h4>
                  <p className="text-blue-600 hover:underline text-sm break-all">
                    {fornecedor.url ? (
                      <a href={fornecedor.url} target="_blank" rel="noreferrer">
                        {fornecedor.url}
                      </a>
                    ) : (
                      '-'
                    )}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Usuário / Login
                  </h4>
                  <p className="text-slate-900 text-sm font-medium">
                    {fornecedor.usuario_login || '-'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

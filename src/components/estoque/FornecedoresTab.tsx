import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Eye, Loader2, Building2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import {
  fetchFornecedores,
  deleteFornecedor,
  Fornecedor,
  createFornecedor,
  updateFornecedor,
} from '@/services/fornecedores'
import { useToast } from '@/hooks/use-toast'
import { FornecedorFormModal } from '@/components/fornecedores/FornecedorFormModal'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { FornecedorViewModal } from './FornecedorViewModal'

export function FornecedoresTab() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const [modalFormOpen, setModalFormOpen] = useState(false)
  const [fornecedorEdit, setFornecedorEdit] = useState<Partial<Fornecedor>>({})

  const [fornecedorView, setFornecedorView] = useState<Fornecedor | null>(null)

  const [fornecedorDelete, setFornecedorDelete] = useState<Fornecedor | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const { toast } = useToast()

  const loadData = async () => {
    setLoading(true)
    const { data, error } = await fetchFornecedores()
    if (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao carregar fornecedores.',
        variant: 'destructive',
      })
    } else if (data) {
      setFornecedores(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSave = async (data: Partial<Fornecedor>) => {
    if (data.id) {
      const { error } = await updateFornecedor(data.id, data)
      if (error) {
        toast({ title: 'Erro', description: error.message, variant: 'destructive' })
      } else {
        toast({ title: 'Sucesso', description: 'Fornecedor atualizado com sucesso.' })
      }
    } else {
      const { error } = await createFornecedor(data)
      if (error) {
        toast({ title: 'Erro', description: error.message, variant: 'destructive' })
      } else {
        toast({ title: 'Sucesso', description: 'Fornecedor cadastrado com sucesso.' })
      }
    }
    loadData()
    setModalFormOpen(false)
  }

  const handleDelete = async () => {
    if (!fornecedorDelete) return
    setIsDeleting(true)
    const { error } = await deleteFornecedor(fornecedorDelete.id)
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Fornecedor excluído permanentemente.' })
      loadData()
    }
    setIsDeleting(false)
    setFornecedorDelete(null)
  }

  const openAddModal = () => {
    setFornecedorEdit({})
    setModalFormOpen(true)
  }

  const openEditModal = (f: Fornecedor) => {
    setFornecedorEdit(f)
    setModalFormOpen(true)
  }

  const filtered = fornecedores.filter(
    (f) =>
      f.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.cnpj && f.cnpj.includes(searchTerm)) ||
      (f.email && f.email.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <div className="space-y-4 animate-fade-in">
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por nome, CNPJ ou e-mail..."
              className="pl-9 border-slate-300 focus-visible:ring-slate-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            onClick={openAddModal}
            className="w-full md:w-auto bg-[#1a2a4a] hover:bg-[#1a2a4a]/90 text-[#d4af37] font-bold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Fornecedor
          </Button>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#1a2a4a]">
              <TableRow className="hover:bg-[#1a2a4a] border-transparent">
                <TableHead className="font-bold text-[#d4af37] uppercase tracking-wider text-xs">
                  Fornecedor
                </TableHead>
                <TableHead className="font-bold text-[#d4af37] uppercase tracking-wider text-xs">
                  CNPJ
                </TableHead>
                <TableHead className="font-bold text-[#d4af37] uppercase tracking-wider text-xs">
                  Telefone
                </TableHead>
                <TableHead className="font-bold text-[#d4af37] uppercase tracking-wider text-xs">
                  E-mail
                </TableHead>
                <TableHead className="font-bold text-[#d4af37] uppercase tracking-wider text-xs text-center">
                  Data de Criação
                </TableHead>
                <TableHead className="font-bold text-[#d4af37] uppercase tracking-wider text-xs text-center w-36">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p>Carregando fornecedores...</p>
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Building2 className="h-12 w-12 text-slate-300 mb-2" />
                      <p className="font-medium text-slate-400">Nenhum fornecedor encontrado.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((f) => (
                  <TableRow
                    key={f.id}
                    className="hover:bg-slate-50 border-slate-100 transition-colors bg-white"
                  >
                    <TableCell className="font-bold text-slate-900">{f.nome}</TableCell>
                    <TableCell className="text-slate-600 text-sm font-mono">
                      {f.cnpj || '-'}
                    </TableCell>
                    <TableCell className="text-slate-600 text-sm">{f.telefone || '-'}</TableCell>
                    <TableCell className="text-slate-600 text-sm">{f.email || '-'}</TableCell>
                    <TableCell className="text-slate-600 text-sm text-center">
                      {f.criado_em
                        ? format(parseISO(f.criado_em), 'dd/MM/yyyy', { locale: ptBR })
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setFornecedorView(f)}
                          className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(f)}
                          className="h-8 w-8 text-slate-500 hover:text-[#d4af37] hover:bg-[#d4af37]/10"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setFornecedorDelete(f)}
                          className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <FornecedorFormModal
        isOpen={modalFormOpen}
        onClose={() => setModalFormOpen(false)}
        onSave={handleSave}
        fornecedor={fornecedorEdit}
      />

      {fornecedorView && (
        <FornecedorViewModal
          isOpen={!!fornecedorView}
          onClose={() => setFornecedorView(null)}
          fornecedor={fornecedorView}
        />
      )}

      <AlertDialog
        open={!!fornecedorDelete}
        onOpenChange={(open) => !open && !isDeleting && setFornecedorDelete(null)}
      >
        <AlertDialogContent className="border-[#1a2a4a]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#1a2a4a]">Excluir Fornecedor</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o fornecedor{' '}
              <strong className="text-slate-900">{fornecedorDelete?.nome}</strong>? Esta ação
              removerá os dados de acesso e histórico associado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

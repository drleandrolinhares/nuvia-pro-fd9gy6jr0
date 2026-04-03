import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, Search, ExternalLink, Loader2 } from 'lucide-react'
import {
  fetchFornecedores,
  createFornecedor,
  updateFornecedor,
  deleteFornecedor,
  Fornecedor,
} from '@/services/fornecedores'
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
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FornecedorFormModal } from '@/components/fornecedores/FornecedorFormModal'
import { FornecedorViewModal } from '@/components/fornecedores/FornecedorViewModal'

export default function Fornecedores() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [filtered, setFiltered] = useState<Fornecedor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [selected, setSelected] = useState<Partial<Fornecedor>>({})
  const { toast } = useToast()

  useEffect(() => {
    loadFornecedores()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      setFiltered(
        fornecedores.filter(
          (f) =>
            f.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (f.cnpj && f.cnpj.includes(searchTerm)),
        ),
      )
    } else {
      setFiltered(fornecedores)
    }
  }, [searchTerm, fornecedores])

  const loadFornecedores = async () => {
    setIsLoading(true)
    const { data, error } = await fetchFornecedores()
    if (error)
      toast({ title: 'Erro ao carregar', description: error.message, variant: 'destructive' })
    else if (data) setFornecedores(data)
    setIsLoading(false)
  }

  const handleOpenModal = (f?: Fornecedor) => {
    setSelected(f || {})
    setIsModalOpen(true)
  }

  const handleOpenView = (f: Fornecedor) => {
    setSelected(f)
    setIsViewOpen(true)
  }

  const handleSave = async (formData: Partial<Fornecedor>) => {
    if (!formData.nome) {
      toast({ title: 'Aviso', description: 'O nome é obrigatório.', variant: 'destructive' })
      return
    }
    const isEdit = !!formData.id
    const { error } = isEdit
      ? await updateFornecedor(formData.id!, formData)
      : await createFornecedor(formData)

    if (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
    } else {
      toast({
        title: 'Sucesso',
        description: `Fornecedor ${isEdit ? 'atualizado' : 'criado'} com sucesso.`,
      })
      setIsModalOpen(false)
      loadFornecedores()
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Deseja excluir este fornecedor?')) {
      const { error } = await deleteFornecedor(id)
      if (error)
        toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' })
      else loadFornecedores()
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Fornecedores</h1>
          <p className="text-slate-500 text-sm">
            Gerencie os fornecedores e suas credenciais de acesso.
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <Plus className="w-4 h-4" /> Novo Fornecedor
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Lista de Fornecedores</CardTitle>
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Buscar fornecedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{f.nome}</TableCell>
                    <TableCell>{f.cnpj || '-'}</TableCell>
                    <TableCell>{f.contato_principal || '-'}</TableCell>
                    <TableCell>{f.telefone || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {f.url && (
                          <Button variant="outline" size="icon" title="Acessar Portal" asChild>
                            <a href={f.url} target="_blank" rel="noreferrer">
                              <ExternalLink className="w-4 h-4 text-blue-600" />
                            </a>
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleOpenView(f)}
                          title="Visualizar"
                        >
                          <Eye className="w-4 h-4 text-slate-600" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleOpenModal(f)}
                          title="Editar"
                        >
                          <Edit className="w-4 h-4 text-amber-600" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(f.id)}
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                      Nenhum fornecedor encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <FornecedorFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        fornecedor={selected}
      />
      <FornecedorViewModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        fornecedor={selected as Fornecedor}
      />
    </div>
  )
}

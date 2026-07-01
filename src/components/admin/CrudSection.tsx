import { useState } from 'react'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { Edit2, Trash2, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { CadastroItem } from '@/services/cadastros'

interface CrudSectionProps {
  title: string
  itemName: string
  items: CadastroItem[]
  onAdd: (nome: string) => Promise<void>
  onEdit: (id: string, nome: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  isLoading?: boolean
}

export function CrudSection({
  title,
  itemName,
  items,
  onAdd,
  onEdit,
  onDelete,
  isLoading,
}: CrudSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CadastroItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<CadastroItem | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleOpenAdd = () => {
    setEditingItem(null)
    setInputValue('')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (item: CadastroItem) => {
    setEditingItem(item)
    setInputValue(item.nome)
    setIsModalOpen(true)
  }

  const handleOpenDelete = (item: CadastroItem) => {
    setDeletingItem(item)
    setIsDeleteOpen(true)
  }

  const handleSubmit = async () => {
    if (!inputValue.trim()) return
    setIsSubmitting(true)
    try {
      if (editingItem) {
        await onEdit(editingItem.id, inputValue.trim())
      } else {
        await onAdd(inputValue.trim())
      }
      setIsModalOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingItem) return
    setIsSubmitting(true)
    try {
      await onDelete(deletingItem.id)
      setIsDeleteOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <Button
          onClick={handleOpenAdd}
          className="bg-amber-500 hover:bg-amber-600 text-white border-0 rounded-full shadow-md px-6 transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar {itemName}
        </Button>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium">Nome</TableHead>
              <TableHead className="text-muted-foreground font-medium">Data de Criação</TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={3} className="text-center py-12 text-muted-foreground">
                  Carregando registros...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={3} className="text-center py-12 text-muted-foreground">
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-semibold">{item.nome}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.criado_em ? format(new Date(item.criado_em), 'dd/MM/yyyy HH:mm') : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(item)}
                        className="h-8 w-8 text-foreground hover:text-amber-600 hover:bg-amber-500/10 rounded-full transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDelete(item)}
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-full transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? `Editar ${itemName}` : `Novo(a) ${itemName}`}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`Nome da ${itemName.toLowerCase()}`}
              className="focus-visible:ring-amber-500 rounded-lg"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
              className="rounded-full"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !inputValue.trim()}
              className="bg-amber-500 hover:bg-amber-600 text-white border-0 rounded-full shadow-md"
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o registro
              <span className="font-semibold text-foreground"> {deletingItem?.nome}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting} className="rounded-full">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isSubmitting}
              className="bg-red-500 hover:bg-red-600 text-white border-0 rounded-full shadow-md"
            >
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

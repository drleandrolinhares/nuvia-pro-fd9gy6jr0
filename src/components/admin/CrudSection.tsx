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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight text-slate-100">{title}</h2>
        <Button
          onClick={handleOpenAdd}
          className="bg-amber-500 hover:bg-amber-600 text-white border-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar {itemName}
        </Button>
      </div>

      <div className="rounded-md border border-slate-800 bg-slate-900/50">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead className="text-slate-400">Nome</TableHead>
              <TableHead className="text-slate-400">Data de Criação</TableHead>
              <TableHead className="text-slate-400 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableCell colSpan={3} className="text-center py-8 text-slate-500">
                  Carregando registros...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableCell colSpan={3} className="text-center py-8 text-slate-500">
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow
                  key={item.id}
                  className="border-slate-800 hover:bg-slate-800/30 transition-colors"
                >
                  <TableCell className="font-medium text-slate-200">{item.nome}</TableCell>
                  <TableCell className="text-slate-400">
                    {item.criado_em ? format(new Date(item.criado_em), 'dd/MM/yyyy HH:mm') : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(item)}
                        className="h-8 w-8 text-slate-400 hover:text-amber-500 hover:bg-slate-800"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDelete(item)}
                        className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-slate-800"
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
        <DialogContent className="bg-slate-950 border-slate-800 text-slate-200 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-slate-100">
              {editingItem ? `Editar ${itemName}` : `Novo(a) ${itemName}`}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`Nome da ${itemName.toLowerCase()}`}
              className="bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500 focus-visible:ring-amber-500"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
              className="hover:bg-slate-800 hover:text-slate-200 text-slate-400"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !inputValue.trim()}
              className="bg-amber-500 hover:bg-amber-600 text-white border-0"
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="bg-slate-950 border-slate-800 text-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-100">Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o registro
              <span className="font-semibold text-amber-500"> {deletingItem?.nome}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isSubmitting}
              className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-100"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isSubmitting}
              className="bg-red-500 hover:bg-red-600 text-white border-0"
            >
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

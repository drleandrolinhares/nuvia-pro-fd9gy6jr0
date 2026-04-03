import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CrudSection } from '@/components/admin/CrudSection'
import { EspecialidadeCamposConfig } from '@/components/admin/EspecialidadeCamposConfig'
import * as cadastrosService from '@/services/cadastros'
import { CadastroItem, AllowedTables } from '@/services/cadastros'
import { toast } from 'sonner'
import { Loader2, ShieldAlert } from 'lucide-react'

export default function CadastrosBasicos() {
  const navigate = useNavigate()
  const [isLoadingAccess, setIsLoadingAccess] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)

  const [especialidades, setEspecialidades] = useState<CadastroItem[]>([])
  const [embalagens, setEmbalagens] = useState<CadastroItem[]>([])
  const [salas, setSalas] = useState<CadastroItem[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  useEffect(() => {
    const verifyAccessAndLoad = async () => {
      try {
        const isAdmin = await cadastrosService.checkIsAdmin()
        setHasAccess(isAdmin)
        if (isAdmin) {
          await loadData()
        }
      } catch (error) {
        console.error('Erro ao verificar acesso:', error)
        toast.error('Erro ao verificar permissões')
      } finally {
        setIsLoadingAccess(false)
      }
    }
    verifyAccessAndLoad()
  }, [])

  const loadData = async () => {
    setIsLoadingData(true)
    try {
      const [espData, embData, salasData] = await Promise.all([
        cadastrosService.getItems('especialidades'),
        cadastrosService.getItems('embalagens'),
        cadastrosService.getItems('salas'),
      ])
      setEspecialidades(espData)
      setEmbalagens(embData)
      setSalas(salasData)
    } catch (error: any) {
      toast.error('Erro ao carregar dados', { description: error.message })
    } finally {
      setIsLoadingData(false)
    }
  }

  const makeHandlers = (
    table: AllowedTables,
    setData: React.Dispatch<React.SetStateAction<CadastroItem[]>>,
  ) => ({
    onAdd: async (nome: string) => {
      try {
        const newItem = await cadastrosService.createItem(table, nome)
        setData((prev) => [...prev, newItem].sort((a, b) => a.nome.localeCompare(b.nome)))
        toast.success('Registro adicionado com sucesso!')
      } catch (error: any) {
        toast.error('Erro ao adicionar registro', { description: error.message })
      }
    },
    onEdit: async (id: string, nome: string) => {
      try {
        const updatedItem = await cadastrosService.updateItem(table, id, nome)
        setData((prev) =>
          prev
            .map((item) => (item.id === id ? updatedItem : item))
            .sort((a, b) => a.nome.localeCompare(b.nome)),
        )
        toast.success('Registro atualizado com sucesso!')
      } catch (error: any) {
        toast.error('Erro ao atualizar registro', { description: error.message })
      }
    },
    onDelete: async (id: string) => {
      try {
        await cadastrosService.deleteItem(table, id)
        setData((prev) => prev.filter((item) => item.id !== id))
        toast.success('Registro excluído com sucesso!')
      } catch (error: any) {
        toast.error('Erro ao excluir registro', {
          description: 'Verifique se o item está em uso. ' + error.message,
        })
      }
    },
  })

  if (isLoadingAccess) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sidebar-primary" />
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center space-y-4 text-center">
        <ShieldAlert className="h-16 w-16 text-red-500" />
        <h1 className="text-2xl font-bold text-sidebar-foreground">Acesso Negado</h1>
        <p className="text-sidebar-foreground/70 max-w-md">
          Apenas usuários com permissão de Administrador podem acessar esta área do sistema.
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 text-sidebar-primary hover:text-sidebar-primary/80 font-medium transition-colors"
        >
          Voltar para o Início
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl space-y-8 animate-fade-in-up">
      <div className="mb-2">
        <h1 className="text-3xl font-bold tracking-tight text-sidebar-foreground">
          Cadastros Básicos
        </h1>
        <p className="text-sidebar-foreground/60 mt-2">
          Gerencie as especialidades, embalagens e salas utilizadas no sistema de estoque.
        </p>
      </div>

      <Tabs defaultValue="especialidades" className="w-full">
        <TabsList className="bg-sidebar border border-sidebar-border w-full justify-start rounded-xl h-auto p-1.5 mb-8 flex-wrap shadow-subtle">
          <TabsTrigger
            value="especialidades"
            className="data-[state=active]:bg-sidebar-accent data-[state=active]:text-sidebar-primary text-sidebar-foreground/60 px-6 py-2.5 rounded-lg font-medium transition-all"
          >
            Especialidades
          </TabsTrigger>
          <TabsTrigger
            value="embalagens"
            className="data-[state=active]:bg-sidebar-accent data-[state=active]:text-sidebar-primary text-sidebar-foreground/60 px-6 py-2.5 rounded-lg font-medium transition-all"
          >
            Embalagens de Compra
          </TabsTrigger>
          <TabsTrigger
            value="salas"
            className="data-[state=active]:bg-sidebar-accent data-[state=active]:text-sidebar-primary text-sidebar-foreground/60 px-6 py-2.5 rounded-lg font-medium transition-all"
          >
            Salas de Armazenamento
          </TabsTrigger>
          <TabsTrigger
            value="campos_especialidade"
            className="data-[state=active]:bg-sidebar-accent data-[state=active]:text-sidebar-primary text-sidebar-foreground/60 px-6 py-2.5 rounded-lg font-medium transition-all"
          >
            Campos por Especialidade
          </TabsTrigger>
        </TabsList>

        <div className="mt-2">
          <TabsContent value="especialidades" className="m-0 focus-visible:outline-none">
            <CrudSection
              title="Especialidades"
              itemName="Especialidade"
              items={especialidades}
              isLoading={isLoadingData}
              {...makeHandlers('especialidades', setEspecialidades)}
            />
          </TabsContent>

          <TabsContent value="embalagens" className="m-0 focus-visible:outline-none">
            <CrudSection
              title="Embalagens de Compra"
              itemName="Embalagem"
              items={embalagens}
              isLoading={isLoadingData}
              {...makeHandlers('embalagens', setEmbalagens)}
            />
          </TabsContent>

          <TabsContent value="salas" className="m-0 focus-visible:outline-none">
            <CrudSection
              title="Salas de Armazenamento"
              itemName="Sala"
              items={salas}
              isLoading={isLoadingData}
              {...makeHandlers('salas', setSalas)}
            />
          </TabsContent>

          <TabsContent value="campos_especialidade" className="m-0 focus-visible:outline-none">
            <EspecialidadeCamposConfig especialidades={especialidades} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

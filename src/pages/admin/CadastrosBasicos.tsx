import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CrudSection } from '@/components/admin/CrudSection'
import { EspecialidadeCamposConfig } from '@/components/admin/EspecialidadeCamposConfig'
import * as cadastrosService from '@/services/cadastros'
import { CadastroItem, AllowedTables } from '@/services/cadastros'
import { toast } from 'sonner'
import { Loader2, ShieldAlert } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

type ActiveCampoTab = {
  campo_id: string
  label: string
}

export default function CadastrosBasicos() {
  const navigate = useNavigate()
  const [isLoadingAccess, setIsLoadingAccess] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)

  const [especialidades, setEspecialidades] = useState<CadastroItem[]>([])
  const [embalagens, setEmbalagens] = useState<CadastroItem[]>([])
  const [salas, setSalas] = useState<CadastroItem[]>([])

  const [activeCampos, setActiveCampos] = useState<ActiveCampoTab[]>([])
  const [campoOpcoes, setCampoOpcoes] = useState<Record<string, CadastroItem[]>>({})

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
      const [espData, embData, salasData, opcoesData, ecData] = await Promise.all([
        cadastrosService.getItems('especialidades'),
        cadastrosService.getItems('embalagens'),
        cadastrosService.getItems('salas'),
        cadastrosService.getCampoOpcoes(),
        supabase
          .from('especialidade_campos')
          .select('campo_id, label_customizado, ativo, campos_personalizados(nome)')
          .eq('ativo', true),
      ])

      setEspecialidades(espData)
      setEmbalagens(embData)
      setSalas(salasData)

      const mapOpcoes: Record<string, CadastroItem[]> = {}
      opcoesData?.forEach((o) => {
        if (!mapOpcoes[o.campo_id]) mapOpcoes[o.campo_id] = []
        mapOpcoes[o.campo_id].push({ id: o.id, nome: o.nome, data_criacao: o.data_criacao })
      })
      setCampoOpcoes(mapOpcoes)

      const activeMap = new Map<string, ActiveCampoTab>()
      ecData.data?.forEach((ec: any) => {
        if (!activeMap.has(ec.campo_id)) {
          activeMap.set(ec.campo_id, {
            campo_id: ec.campo_id,
            label: ec.label_customizado || ec.campos_personalizados?.nome || 'Campo',
          })
        }
      })
      setActiveCampos(Array.from(activeMap.values()).sort((a, b) => a.label.localeCompare(b.label)))
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

  const makeCampoOpcoesHandlers = (campo_id: string) => ({
    onAdd: async (nome: string) => {
      try {
        const newItem = await cadastrosService.createCampoOpcao(campo_id, nome)
        setCampoOpcoes((prev) => ({
          ...prev,
          [campo_id]: [...(prev[campo_id] || []), newItem].sort((a, b) =>
            a.nome.localeCompare(b.nome),
          ),
        }))
        toast.success('Opção adicionada com sucesso!')
      } catch (error: any) {
        toast.error('Erro ao adicionar opção', { description: error.message })
      }
    },
    onEdit: async (id: string, nome: string) => {
      try {
        const updatedItem = await cadastrosService.updateCampoOpcao(id, nome)
        setCampoOpcoes((prev) => ({
          ...prev,
          [campo_id]: prev[campo_id]
            .map((item) => (item.id === id ? updatedItem : item))
            .sort((a, b) => a.nome.localeCompare(b.nome)),
        }))
        toast.success('Opção atualizada com sucesso!')
      } catch (error: any) {
        toast.error('Erro ao atualizar opção', { description: error.message })
      }
    },
    onDelete: async (id: string) => {
      try {
        await cadastrosService.deleteCampoOpcao(id)
        setCampoOpcoes((prev) => ({
          ...prev,
          [campo_id]: prev[campo_id].filter((item) => item.id !== id),
        }))
        toast.success('Opção excluída com sucesso!')
      } catch (error: any) {
        toast.error('Erro ao excluir opção', { description: error.message })
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
          Gerencie as especialidades, embalagens, salas e demais opções utilizadas no sistema.
        </p>
      </div>

      <Tabs defaultValue="especialidades" className="w-full">
        <TabsList className="bg-sidebar border border-sidebar-border w-full justify-start rounded-xl h-auto p-1.5 mb-8 flex-wrap shadow-subtle gap-1">
          <TabsTrigger
            value="especialidades"
            className="data-[state=active]:bg-sidebar-accent data-[state=active]:text-sidebar-primary text-sidebar-foreground/60 px-4 py-2 rounded-lg font-medium transition-all text-sm"
          >
            Especialidades
          </TabsTrigger>
          <TabsTrigger
            value="embalagens"
            className="data-[state=active]:bg-sidebar-accent data-[state=active]:text-sidebar-primary text-sidebar-foreground/60 px-4 py-2 rounded-lg font-medium transition-all text-sm"
          >
            Embalagens
          </TabsTrigger>
          <TabsTrigger
            value="salas"
            className="data-[state=active]:bg-sidebar-accent data-[state=active]:text-sidebar-primary text-sidebar-foreground/60 px-4 py-2 rounded-lg font-medium transition-all text-sm"
          >
            Salas
          </TabsTrigger>

          {activeCampos.map((ac) => (
            <TabsTrigger
              key={ac.campo_id}
              value={`campo_${ac.campo_id}`}
              className="data-[state=active]:bg-sidebar-accent data-[state=active]:text-sidebar-primary text-sidebar-foreground/60 px-4 py-2 rounded-lg font-medium transition-all text-sm"
            >
              {ac.label}
            </TabsTrigger>
          ))}

          <TabsTrigger
            value="campos_especialidade"
            className="data-[state=active]:bg-sidebar-accent data-[state=active]:text-sidebar-primary text-sidebar-foreground/60 px-4 py-2 rounded-lg font-medium transition-all text-sm ml-auto bg-slate-800 text-slate-200 hover:bg-slate-700"
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

          {activeCampos.map((ac) => (
            <TabsContent
              key={ac.campo_id}
              value={`campo_${ac.campo_id}`}
              className="m-0 focus-visible:outline-none"
            >
              <CrudSection
                title={`Opções para ${ac.label}`}
                itemName="Opção"
                items={campoOpcoes[ac.campo_id] || []}
                isLoading={isLoadingData}
                {...makeCampoOpcoesHandlers(ac.campo_id)}
              />
            </TabsContent>
          ))}

          <TabsContent value="campos_especialidade" className="m-0 focus-visible:outline-none">
            <EspecialidadeCamposConfig
              especialidades={especialidades}
              onChange={() => loadData()}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

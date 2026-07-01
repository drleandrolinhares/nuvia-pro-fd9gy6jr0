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
  id: string
  campo_id: string
  especialidade_id: string
  especialidade_nome: string
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
          .select(
            'campo_id, especialidade_id, label_customizado, ativo, campos_personalizados(nome), especialidades(nome)' as any,
          )
          .eq('ativo', true),
      ])

      setEspecialidades(espData)
      setEmbalagens(embData)
      setSalas(salasData)

      const mapOpcoes: Record<string, CadastroItem[]> = {}
      opcoesData?.forEach((o: any) => {
        if (!o.especialidade_id) return // Garante isolamento: ignora opções globais órfãs
        const key = `${o.especialidade_id}_${o.campo_id}`
        if (!mapOpcoes[key]) mapOpcoes[key] = []
        mapOpcoes[key].push({ id: o.id, nome: o.nome, data_criacao: o.data_criacao })
      })

      const activeMap = new Map<string, ActiveCampoTab>()
      ecData.data?.forEach((ec: any) => {
        const id = `${ec.especialidade_id}_${ec.campo_id}`
        if (!activeMap.has(id)) {
          activeMap.set(id, {
            id,
            campo_id: ec.campo_id,
            especialidade_id: ec.especialidade_id,
            especialidade_nome: ec.especialidades?.nome || 'Especialidade',
            label: ec.label_customizado || ec.campos_personalizados?.nome || 'Campo',
          })
        }
      })

      setCampoOpcoes(mapOpcoes)
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

  const makeCampoOpcoesHandlers = (ac: ActiveCampoTab) => ({
    onAdd: async (nome: string) => {
      try {
        const newItem = await cadastrosService.createCampoOpcao(
          ac.campo_id,
          ac.especialidade_id,
          nome,
        )
        setCampoOpcoes((prev) => ({
          ...prev,
          [ac.id]: [...(prev[ac.id] || []), newItem].sort((a, b) => a.nome.localeCompare(b.nome)),
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
          [ac.id]: prev[ac.id]
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
          [ac.id]: prev[ac.id].filter((item) => item.id !== id),
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
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center space-y-4 text-center">
        <ShieldAlert className="h-16 w-16 text-red-500" />
        <h1 className="text-2xl font-bold text-foreground">Acesso Negado</h1>
        <p className="text-muted-foreground max-w-md">
          Apenas usuários com permissão de Administrador podem acessar esta área do sistema.
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 text-amber-500 hover:text-amber-600 font-medium transition-colors"
        >
          Voltar para o Início
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl space-y-8 animate-fade-in-up">
      <div className="mb-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Cadastros Básicos</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie as especialidades, embalagens, salas e demais opções utilizadas no sistema.
        </p>
      </div>

      <Tabs defaultValue="especialidades" className="w-full">
        <TabsList className="w-full justify-start rounded-xl h-auto p-1.5 mb-8 flex-wrap bg-muted/50 gap-1 border">
          <TabsTrigger
            value="especialidades"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow text-muted-foreground px-4 py-2 rounded-lg font-medium transition-all text-sm"
          >
            Especialidades
          </TabsTrigger>
          <TabsTrigger
            value="embalagens"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow text-muted-foreground px-4 py-2 rounded-lg font-medium transition-all text-sm"
          >
            Embalagens
          </TabsTrigger>
          <TabsTrigger
            value="salas"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow text-muted-foreground px-4 py-2 rounded-lg font-medium transition-all text-sm"
          >
            Salas
          </TabsTrigger>

          {activeCampos.map((ac) => (
            <TabsTrigger
              key={ac.id}
              value={`campo_${ac.id}`}
              className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow text-muted-foreground px-4 py-2 rounded-lg font-medium transition-all text-sm flex flex-col items-start gap-0.5"
            >
              <span>{ac.label}</span>
              <span className="text-[10px] opacity-70 font-normal">{ac.especialidade_nome}</span>
            </TabsTrigger>
          ))}

          <TabsTrigger
            value="campos_especialidade"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow text-muted-foreground px-4 py-2 rounded-lg font-medium transition-all text-sm ml-auto"
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
              key={ac.id}
              value={`campo_${ac.id}`}
              className="m-0 focus-visible:outline-none"
            >
              <CrudSection
                title={`Opções de ${ac.label} (${ac.especialidade_nome})`}
                itemName="Opção"
                items={campoOpcoes[ac.id] || []}
                isLoading={isLoadingData}
                {...makeCampoOpcoesHandlers(ac)}
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

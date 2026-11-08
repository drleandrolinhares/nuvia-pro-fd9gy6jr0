import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, Sparkles, RefreshCw, LayoutGrid, CalendarClock } from 'lucide-react'
import { usePageState } from '@/hooks/use-page-state'
import { TerceirosKanbanBoard } from '@/components/operacional/TerceirosKanbanBoard'
import { InvisalignCalculadoraDatas } from '@/components/operacional/InvisalignCalculadoraDatas'
import {
  getCategorias,
  createCategoria,
  createColuna,
  getColunas,
  createTarefa,
  createEtiquetaGlobal,
  getEtiquetasGlobais,
  TerceiroCategoria,
} from '@/services/terceiros'
import { useToast } from '@/hooks/use-toast'
import { PageHeader } from '@/components/page-header'

const INVISALIGN_INITIAL_COLUMNS = [
  'PENDENTE / NÃO ESCANEADOS',
  'PACIENTES ESCANEADOS',
  'DOC ADD NA ALING',
  'CLINCHECK EM ANÁLISE',
  'CLINCHECK APROVADO',
  'ALINHADORES EM PRODUÇÃO',
  'ALINHADORES NA CLÍNICA',
  'TRATAMENTO EM ANDAMENTO',
]

const INVISALIGN_INITIAL_TAGS = [
  { nome: 'DOCUMENTAÇÃO OK', cor: 'bg-emerald-600' },
  { nome: 'Realizará outro procedimento antes', cor: 'bg-purple-600' },
  { nome: 'AGUARDANDO EXAME', cor: 'bg-amber-600' },
  { nome: 'PRIORIDADE', cor: 'bg-rose-600' },
]

const INVISALIGN_SAMPLE_CARDS = [
  {
    paciente_nome: 'SANDRA MARA GAMA BOLLIS',
    titulo: 'INVISALIGN LITE - AGUARDANDO EXAME',
    terceiro_nome: 'INVISALIGN',
    cor: 'bg-slate-700',
    etiquetas: [{ nome: 'AGUARDANDO EXAME', cor: 'bg-amber-600' }],
    statusIndex: 0,
  },
  {
    paciente_nome: 'MARCOS EUGENIO FEU TONON',
    titulo: 'INVISALIGN MODERETE',
    terceiro_nome: 'INVISALIGN',
    cor: 'bg-slate-700',
    etiquetas: [
      { nome: 'DOCUMENTAÇÃO OK', cor: 'bg-emerald-600' },
      { nome: 'Realizará outro procedimento antes', cor: 'bg-purple-600' },
    ],
    statusIndex: 0,
  },
  {
    paciente_nome: 'MARCOS ROBERTO DA SILVA',
    titulo: 'INVISALIGN MODERETE',
    terceiro_nome: 'INVISALIGN',
    cor: 'bg-slate-700',
    etiquetas: [
      { nome: 'Realizará outro procedimento antes', cor: 'bg-purple-600' },
      { nome: 'DOCUMENTAÇÃO OK', cor: 'bg-emerald-600' },
    ],
    statusIndex: 0,
  },
  {
    paciente_nome: 'NILSON GOMES DA SILVA',
    titulo: 'INVISALIGN MODERETE',
    terceiro_nome: 'INVISALIGN',
    cor: 'bg-slate-700',
    etiquetas: [],
    statusIndex: 0,
  },
  {
    paciente_nome: 'JULIANA PEREIRA LIMA',
    titulo: 'INVISALIGN COMPREHENSIVE',
    terceiro_nome: 'INVISALIGN',
    cor: 'bg-slate-700',
    etiquetas: [{ nome: 'DOCUMENTAÇÃO OK', cor: 'bg-emerald-600' }],
    statusIndex: 0,
  },
  {
    paciente_nome: 'ROBERTA ALVES CARDOSO',
    titulo: 'INVISALIGN FIRST',
    terceiro_nome: 'INVISALIGN',
    cor: 'bg-slate-700',
    etiquetas: [{ nome: 'AGUARDANDO EXAME', cor: 'bg-amber-600' }],
    statusIndex: 0,
  },
  {
    paciente_nome: 'FERNANDO DIAS SANTOS',
    titulo: 'INVISALIGN MODERETE',
    terceiro_nome: 'INVISALIGN',
    cor: 'bg-slate-700',
    etiquetas: [{ nome: 'Realizará outro procedimento antes', cor: 'bg-purple-600' }],
    statusIndex: 0,
  },
  {
    paciente_nome: 'BEATRIZ MENEZES COSTA',
    titulo: 'INVISALIGN LITE',
    terceiro_nome: 'INVISALIGN',
    cor: 'bg-slate-700',
    etiquetas: [{ nome: 'DOCUMENTAÇÃO OK', cor: 'bg-emerald-600' }],
    statusIndex: 0,
  },
]

export default function Invisalign() {
  const { toast } = useToast()
  const [categoria, setCategoria] = useState<TerceiroCategoria | null>(null)
  const [loadingCategory, setLoadingCategory] = useState(true)
  const [activeTab, setActiveTab] = usePageState('/operacional/invisalign', 'activeTab', 'cards')
  const [searchQuery, setSearchQuery] = usePageState('/operacional/invisalign', 'searchQuery', '')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const refreshBoardRef = useRef<(() => void) | null>(null)

  const initInvisalignData = async () => {
    setLoadingCategory(true)
    try {
      const allCategorias = await getCategorias()
      let invCat = allCategorias.find(
        (c) =>
          c.slug === 'invisalign' ||
          c.nome.trim().toUpperCase() === 'INVISALIGN' ||
          c.slug.includes('invisalign'),
      )

      if (!invCat) {
        invCat = await createCategoria('INVISALIGN')
      }

      setCategoria(invCat)

      // Garantir colunas se for categoria recém-criada ou sem colunas
      const cols = await getColunas(invCat.slug)
      let createdCols = cols
      if (cols.length === 0) {
        for (let i = 0; i < INVISALIGN_INITIAL_COLUMNS.length; i++) {
          await createColuna({
            categoria_slug: invCat.slug,
            titulo: INVISALIGN_INITIAL_COLUMNS[i],
            ordem: i,
            cor: 'border-slate-800 bg-slate-900/60',
          })
        }
        createdCols = await getColunas(invCat.slug)
      }

      // Garantir etiquetas globais padrão
      try {
        const existingTags = await getEtiquetasGlobais()
        const existingNames = existingTags.map((t) => t.nome.toLowerCase())
        for (const tag of INVISALIGN_INITIAL_TAGS) {
          if (!existingNames.includes(tag.nome.toLowerCase())) {
            await createEtiquetaGlobal(tag)
          }
        }
      } catch (err) {
        console.warn('Erro ao verificar etiquetas globais', err)
      }

      // Se a categoria tiver 0 tarefas cadastradas, semeia os 8 pacientes existentes
      // de referência com seus respectivos status/etiquetas
      const { getTarefas } = await import('@/services/terceiros')
      const currentTasks = await getTarefas(invCat.slug)
      if (currentTasks.length === 0 && createdCols.length > 0) {
        const firstColId = createdCols[0].id
        for (let i = 0; i < INVISALIGN_SAMPLE_CARDS.length; i++) {
          const item = INVISALIGN_SAMPLE_CARDS[i]
          const targetColId = createdCols[item.statusIndex]?.id || firstColId
          await createTarefa({
            categoria_slug: invCat.slug,
            titulo: item.titulo,
            paciente_nome: item.paciente_nome,
            terceiro_nome: item.terceiro_nome,
            cor: item.cor,
            etiquetas: item.etiquetas,
            status: targetColId,
            ordem: i,
          })
        }
      }
    } catch (err: any) {
      console.error('Erro ao inicializar categoria Invisalign', err)
      toast({
        title: 'Erro',
        description: err.message || 'Falha ao carregar dados do Invisalign.',
        variant: 'destructive',
      })
    } finally {
      setLoadingCategory(false)
    }
  }

  useEffect(() => {
    initInvisalignData()
  }, [])

  const handleRefresh = () => {
    if (refreshBoardRef.current) {
      refreshBoardRef.current()
    } else {
      initInvisalignData()
    }
  }

  return (
    <div className="p-4 lg:p-6 h-[calc(100vh-4rem)] flex flex-col space-y-4">
      <PageHeader
        title="Invisalign"
        description={
          activeTab === 'cards'
            ? 'Quadro kanban de acompanhamento dos tratamentos com alinhadores transparentes.'
            : 'Calculadora de datas para troca programada de alinhadores.'
        }
        icon={Sparkles}
        actions={
          activeTab === 'cards' ? (
            <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
              <div className="relative min-w-[220px]">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar paciente ou plano..."
                  className="h-9 pl-9"
                />
              </div>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="size-4" />
                Atualizar
              </Button>
              <Button size="sm" onClick={() => setIsModalOpen(true)}>
                <Plus className="size-4" />
                Novo registro
              </Button>
            </div>
          ) : undefined
        }
      />

      {/* Subabas da página */}
      <div className="flex items-center gap-1 border-b border-border pb-2 shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('cards')}
          className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
            activeTab === 'cards'
              ? 'bg-secondary/15 text-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <LayoutGrid className="size-4" />
          Cards (Kanban)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('datas')}
          className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
            activeTab === 'datas'
              ? 'bg-secondary/15 text-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <CalendarClock className="size-4" />
          Datas (calculadora)
        </button>
      </div>

      {/* Subpágina 1: CARDS (Kanban Board Invisalign) */}
      {activeTab === 'cards' && (
        <>
          {loadingCategory || !categoria ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-primary" />
              <span>Carregando módulo Invisalign...</span>
            </div>
          ) : (
            <TerceirosKanbanBoard
              categoriaSlug={categoria.slug}
              searchQuery={searchQuery}
              defaultTerceiroNome="INVISALIGN"
              prestadorLabel="Fornecedor / Sistema"
              prestadorPlaceholder="INVISALIGN"
              servicoPlaceholder="Ex: INVISALIGN LITE, MODERETE, COMPREHENSIVE..."
              isModalOpen={isModalOpen}
              setIsModalOpen={setIsModalOpen}
              onRefreshReady={(fn) => {
                refreshBoardRef.current = fn
              }}
            />
          )}
        </>
      )}

      {/* Subpágina 2: DATAS (Calculadora de Troca de Alinhadores) */}
      {activeTab === 'datas' && <InvisalignCalculadoraDatas />}
    </div>
  )
}

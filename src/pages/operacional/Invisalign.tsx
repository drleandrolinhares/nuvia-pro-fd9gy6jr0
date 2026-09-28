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
    <div className="p-3 sm:p-4 lg:p-6 h-[calc(100vh-4rem)] flex flex-col space-y-4 bg-slate-950 text-slate-100">
      {/* Header com identidade Nuvia PRO: visual escuro com acento âmbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-xl shadow-lg border-l-4 border-l-[#d4af37] shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[#d4af37] shadow-inner">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white uppercase">
                INVISALIGN
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[#d4af37] uppercase tracking-wider">
                Operacional
              </span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              {activeTab === 'cards'
                ? 'Quadro kanban de acompanhamento de tratamentos com alinhadores transparentes Invisalign.'
                : 'Calculadora de simulação de datas para troca programada de alinhadores.'}
            </p>
          </div>
        </div>

        {/* Controles do header: busca e ações de cards só se aplicam à aba CARDS */}
        {activeTab === 'cards' && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative min-w-[240px] sm:min-w-[280px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar paciente ou plano..."
                className="pl-9 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500 h-10 text-xs sm:text-sm w-full"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white h-10 px-3 text-xs uppercase font-bold tracking-wider"
            >
              <RefreshCw className="w-4 h-4 mr-1.5" />
              Atualizar
            </Button>

            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold uppercase tracking-wider text-xs shadow-md transition-all h-10 px-4"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Novo Registro
            </Button>
          </div>
        )}
      </div>

      {/* Barra de Subabas da Página INVISALIGN */}
      <div className="flex items-center gap-2 border-b border-slate-800/90 pb-2 shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('cards')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider transition-all ${
            activeTab === 'cards'
              ? 'bg-[#d4af37] text-slate-950 shadow-md font-extrabold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          CARDS (Kanban)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('datas')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider transition-all ${
            activeTab === 'datas'
              ? 'bg-[#d4af37] text-slate-950 shadow-md font-extrabold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800'
          }`}
        >
          <CalendarClock className="w-4 h-4" />
          DATAS (Calculadora de Troca)
        </button>
      </div>

      {/* Subpágina 1: CARDS (Kanban Board Invisalign) */}
      {activeTab === 'cards' && (
        <>
          {loadingCategory || !categoria ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-amber-500" />
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

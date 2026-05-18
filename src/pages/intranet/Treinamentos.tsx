import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Loader2,
  PlayCircle,
  CheckCircle2,
  XCircle,
  GraduationCap,
  Star,
  Settings,
} from 'lucide-react'
import { TreinamentosQuiz } from './treinamentos/TreinamentosQuiz'
import { TreinamentosRanking } from './treinamentos/TreinamentosRanking'
import { TreinamentosAdmin } from './treinamentos/TreinamentosAdmin'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function Treinamentos() {
  const { user } = useAuth()
  const [cursos, setCursos] = useState<any[]>([])
  const [modulos, setModulos] = useState<any[]>([])
  const [progresso, setProgresso] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeModulo, setActiveModulo] = useState<any | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [cargos, setCargos] = useState<any[]>([])
  const [filtroSetor, setFiltroSetor] = useState<string>('todos')

  const totalPontos = progresso.reduce((acc, p) => acc + (p.pontos || 0), 0)

  const fetchData = async () => {
    if (!user) return
    const [c, m, p, adminRes, cargosRes] = await Promise.all([
      supabase.from('intranet_treinamentos_cursos').select('*').order('ordem'),
      supabase.from('intranet_treinamentos_modulos').select('*').order('ordem'),
      supabase.from('intranet_treinamentos_progresso').select('*').eq('usuario_id', user.id),
      supabase.rpc('is_admin'),
      supabase.from('cargos').select('*').order('nome'),
    ])
    setCursos(c.data || [])
    setModulos(m.data || [])
    setProgresso(p.data || [])
    setIsAdmin(adminRes.data || false)
    setCargos(cargosRes.data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [user])

  if (loading)
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-amber-500" />
      </div>
    )

  if (activeModulo) {
    const p = progresso.find((pr) => pr.modulo_id === activeModulo.id)
    return (
      <TreinamentosQuiz
        modulo={activeModulo}
        progressoAtual={p}
        onBack={() => setActiveModulo(null)}
        onComplete={() => {
          setActiveModulo(null)
          fetchData()
        }}
      />
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6 w-full mx-auto animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-slate-50 p-6 rounded-xl shadow-lg border-l-4 border-amber-500 relative">
        <div className="flex items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3 uppercase">
              <GraduationCap className="h-8 w-8 text-amber-500" />
              Treinamentos
            </h1>
            <p className="text-slate-300 text-sm font-medium tracking-wide mt-1">
              Acesse os cursos e capacitações disponíveis para o seu setor.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6 bg-slate-950 p-4 rounded-lg border border-slate-800 shadow-inner">
          <div className="text-center">
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Módulos
            </div>
            <div className="text-2xl font-bold text-white">
              {progresso.filter((p) => p.aprovado).length}
            </div>
          </div>
          <div className="w-px h-10 bg-slate-800"></div>
          <div className="text-center flex flex-col items-center">
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Meus Pontos
            </div>
            <div className="text-2xl font-bold text-amber-500 flex items-center gap-1">
              {totalPontos} <Star className="w-5 h-5 fill-amber-500" />
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="cursos" className="w-full">
        <TabsList className="bg-slate-900 border-slate-800">
          <TabsTrigger value="cursos">Cursos Disponíveis</TabsTrigger>
          <TabsTrigger value="ranking">Ranking</TabsTrigger>
          {isAdmin && (
            <TabsTrigger
              value="admin"
              className="text-amber-500 data-[state=active]:text-amber-500"
            >
              <Settings className="w-4 h-4 mr-2" /> Gestão
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="cursos" className="mt-6 space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-none">
            <span className="text-slate-300 font-medium whitespace-nowrap">
              Filtrar por Função:
            </span>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filtroSetor === 'todos' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFiltroSetor('todos')}
                className={
                  filtroSetor === 'todos'
                    ? 'bg-amber-500 text-slate-900 hover:bg-amber-600 font-medium'
                    : 'border-slate-700 text-slate-300 hover:bg-slate-800'
                }
              >
                Todos
              </Button>
              {cargos.map((c) => (
                <Button
                  key={c.id}
                  variant={filtroSetor === c.nome ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFiltroSetor(c.nome)}
                  className={
                    filtroSetor === c.nome
                      ? 'bg-amber-500 text-slate-900 hover:bg-amber-600 font-medium'
                      : 'border-slate-700 text-slate-300 hover:bg-slate-800'
                  }
                >
                  {c.nome}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-6">
            {cursos
              .filter((c) => filtroSetor === 'todos' || c.setor === filtroSetor)
              .map((curso) => {
                const modulosCurso = modulos.filter((m) => m.curso_id === curso.id)
                return (
                  <Card key={curso.id} className="bg-slate-900 border-slate-800 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-xl text-slate-100">{curso.titulo}</CardTitle>
                      <CardDescription className="text-slate-400">
                        {curso.descricao}
                      </CardDescription>
                      {curso.setor && (
                        <span className="inline-block px-3 py-1 text-xs font-semibold bg-amber-500/10 text-amber-500 rounded-full mt-2 max-w-max border border-amber-500/20">
                          {curso.setor}
                        </span>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {modulosCurso.map((modulo) => {
                        const p = progresso.find((pr) => pr.modulo_id === modulo.id)
                        return (
                          <div
                            key={modulo.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-950/50 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-amber-500 shrink-0 shadow-inner">
                                <PlayCircle className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-slate-200">{modulo.titulo}</h4>
                                {p && (
                                  <p
                                    className={`text-xs mt-1 font-medium ${p.aprovado ? 'text-emerald-500' : 'text-rose-500'}`}
                                  >
                                    Última nota: {p.nota_quiz}{' '}
                                    {p.aprovado
                                      ? `(Aprovado - ${p.pontos} pts)`
                                      : '(Reprovado - Requer Revisão)'}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              {p?.aprovado ? (
                                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                              ) : p ? (
                                <XCircle className="w-6 h-6 text-rose-500" />
                              ) : null}
                              <Button
                                variant={p?.aprovado ? 'outline' : 'default'}
                                size="sm"
                                onClick={() => setActiveModulo(modulo)}
                                className={
                                  !p?.aprovado
                                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                                    : 'border-slate-700 hover:bg-slate-800'
                                }
                              >
                                {p?.aprovado ? 'Revisar Conteúdo' : 'Acessar Módulo'}
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                      {modulosCurso.length === 0 && (
                        <p className="text-sm text-slate-500">
                          Nenhum módulo cadastrado neste curso.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            {cursos.length === 0 && (
              <div className="text-center py-12 text-slate-500 bg-slate-900/50 rounded-lg border border-slate-800 border-dashed">
                Nenhum curso disponível no momento.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="ranking" className="animate-fade-in">
          <TreinamentosRanking />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="admin" className="animate-fade-in">
            <TreinamentosAdmin
              cursos={cursos}
              modulos={modulos}
              cargos={cargos}
              onRefresh={fetchData}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

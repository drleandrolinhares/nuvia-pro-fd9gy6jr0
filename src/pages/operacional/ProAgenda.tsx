import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, BookOpen, Clock, Search, Plus, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { ManageProcedureDialog } from '@/components/operacional/manage-procedure-dialog'

export default function ProAgenda() {
  const [dentistas, setDentistas] = useState<any[]>([])
  const [procedimentos, setProcedimentos] = useState<any[]>([])
  const [tempos, setTempos] = useState<any[]>([])

  const [selectedDentista, setSelectedDentista] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  const [manageDialogOpen, setManageDialogOpen] = useState(false)
  const [editingProc, setEditingProc] = useState<any | null>(null)

  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'

  const fetchData = async () => {
    setLoading(true)
    try {
      const [dentistasRes, procsRes, temposRes] = await Promise.all([
        supabase.from('dentistas').select('*').eq('status', 'ativo').order('nome'),
        supabase.from('pro_agenda_procedimentos').select('*').order('nome'),
        supabase.from('pro_agenda_tempos').select('*'),
      ])

      if (dentistasRes.error) throw dentistasRes.error
      if (procsRes.error && procsRes.error.code !== '42P01') throw procsRes.error
      if (temposRes.error && temposRes.error.code !== '42P01') throw temposRes.error

      setDentistas(dentistasRes.data || [])
      setProcedimentos(procsRes.data || [])
      setTempos(temposRes.data || [])
    } catch (err) {
      console.error('Error fetching pro agenda:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este procedimento?')) return
    try {
      const { error } = await supabase.from('pro_agenda_procedimentos').delete().eq('id', id)
      if (error) throw error
      toast.success('Procedimento excluído.')
      fetchData()
    } catch (err: any) {
      toast.error('Erro: ' + err.message)
    }
  }

  const filteredProcedimentos = procedimentos
    .filter(
      (p) =>
        p.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.descricao.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => a.nome.localeCompare(b.nome))

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-lg hidden sm:block">
            <BookOpen className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">PRO AGENDA</h2>
            <p className="text-sm text-slate-400 mt-1">
              Glossário e tempos de procedimentos para a recepção
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Buscar procedimento..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-950 border-slate-800 text-white focus-visible:ring-amber-500"
            />
          </div>

          <Select value={selectedDentista} onValueChange={setSelectedDentista}>
            <SelectTrigger className="w-full sm:w-[220px] bg-slate-950 border-slate-800 text-white font-medium focus:ring-amber-500">
              <SelectValue placeholder="Selecione um dentista" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-white">
              <SelectItem value="all" className="focus:bg-slate-800">
                Visão Geral (Sem tempo)
              </SelectItem>
              {dentistas.map((d) => (
                <SelectItem key={d.id} value={d.id} className="focus:bg-slate-800">
                  {d.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isAdmin && (
            <Button
              onClick={() => {
                setEditingProc(null)
                setManageDialogOpen(true)
              }}
              className="bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold whitespace-nowrap shadow-md"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Procedimento
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 bg-slate-900/50 rounded-lg border border-slate-800">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : filteredProcedimentos.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-slate-900/50 rounded-lg border border-slate-800 text-slate-400 gap-3">
          <BookOpen className="w-12 h-12 text-slate-700" />
          <p className="text-lg">Nenhum procedimento encontrado.</p>
          {isAdmin && <p className="text-sm">Clique em "Novo Procedimento" para adicionar.</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProcedimentos.map((proc) => {
            const tempoObj = tempos.find(
              (t) => t.procedimento_id === proc.id && t.dentista_id === selectedDentista,
            )
            const tempo = tempoObj ? tempoObj.tempo_minutos : null

            return (
              <Card
                key={proc.id}
                className="bg-slate-900 border-slate-800 flex flex-col group relative overflow-hidden transition-all hover:border-slate-700 hover:shadow-md"
              >
                <CardHeader className="pb-3 bg-slate-900/50 border-b border-slate-800/50 relative">
                  <CardTitle className="text-base text-white font-bold pr-16 leading-tight">
                    {proc.nome}
                  </CardTitle>

                  {isAdmin && (
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/90 rounded-md p-0.5 border border-slate-800 backdrop-blur-sm z-10">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-400 hover:text-amber-500 hover:bg-slate-800"
                        onClick={() => {
                          setEditingProc(proc)
                          setManageDialogOpen(true)
                        }}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-400 hover:text-red-500 hover:bg-slate-800"
                        onClick={() => handleDelete(proc.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-4 pt-4">
                  <p className="text-sm text-slate-400 flex-1 leading-relaxed whitespace-pre-wrap">
                    {proc.descricao}
                  </p>

                  {selectedDentista !== 'all' && (
                    <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800/80 mt-auto">
                      <div className="p-2 bg-amber-500/10 rounded-md shrink-0">
                        <Clock className="w-4 h-4 text-amber-500" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          Tempo Estimado
                        </span>
                        <span className="text-sm font-bold text-white">
                          {tempo ? (
                            `${tempo} minutos`
                          ) : (
                            <span className="text-slate-500 italic font-normal">Não definido</span>
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {manageDialogOpen && (
        <ManageProcedureDialog
          open={manageDialogOpen}
          onOpenChange={setManageDialogOpen}
          dentistas={dentistas}
          editingProc={editingProc}
          tempos={tempos}
          onSaved={fetchData}
        />
      )}
    </div>
  )
}

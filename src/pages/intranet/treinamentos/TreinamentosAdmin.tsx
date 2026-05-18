import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, Edit } from 'lucide-react'
import { toast } from 'sonner'
import { TreinamentosQuizBuilder } from './TreinamentosQuizBuilder'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function TreinamentosAdmin({ cursos, modulos, cargos, onRefresh }: any) {
  const [cursoEdit, setCursoEdit] = useState<any>(null)
  const [moduloEdit, setModuloEdit] = useState<any>(null)
  const [selectedSetor, setSelectedSetor] = useState<string>('todos')

  const saveCurso = async (e: any) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    const payload = {
      titulo: fd.get('titulo'),
      descricao: fd.get('descricao'),
      setor: selectedSetor === 'todos' ? null : selectedSetor,
      ativo: true,
    }

    if (cursoEdit?.id) {
      await supabase.from('intranet_treinamentos_cursos').update(payload).eq('id', cursoEdit.id)
      toast.success('Curso atualizado')
    } else {
      await supabase.from('intranet_treinamentos_cursos').insert([payload])
      toast.success('Curso criado')
    }
    setCursoEdit(null)
    setSelectedSetor('todos')
    onRefresh()
  }

  const deleteCurso = async (id: string) => {
    if (!confirm('Deseja excluir este curso e seus módulos?')) return
    await supabase.from('intranet_treinamentos_cursos').delete().eq('id', id)
    toast.success('Curso excluído')
    onRefresh()
  }

  return (
    <div className="grid md:grid-cols-2 gap-6 mt-6">
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-100">Gerenciar Cursos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form
            onSubmit={saveCurso}
            className="space-y-4 bg-slate-950 p-4 rounded-lg border border-slate-800"
          >
            <h4 className="font-semibold text-slate-50">
              {cursoEdit ? 'Editar Curso' : 'Novo Curso'}
            </h4>
            <div className="space-y-2">
              <Label className="text-slate-200">Título</Label>
              <Input
                name="titulo"
                defaultValue={cursoEdit?.titulo}
                required
                className="bg-slate-900 border-slate-700 text-slate-50 placeholder:text-slate-400"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-200">Descrição</Label>
              <Textarea
                name="descricao"
                defaultValue={cursoEdit?.descricao}
                className="bg-slate-900 border-slate-700 text-slate-50 placeholder:text-slate-400 min-h-[80px]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-200">Função Alvo (Opcional)</Label>
              <Select value={selectedSetor} onValueChange={setSelectedSetor}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-50">
                  <SelectValue placeholder="Selecione a função foco..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                  <SelectItem value="todos">Geral (Todas as funções)</SelectItem>
                  {cargos?.map((c: any) => (
                    <SelectItem key={c.id} value={c.nome}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              {cursoEdit && (
                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-700 bg-slate-900 text-white hover:bg-slate-800"
                  onClick={() => {
                    setCursoEdit(null)
                    setSelectedSetor('todos')
                  }}
                >
                  Cancelar
                </Button>
              )}
              <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-black">
                Salvar Curso
              </Button>
            </div>
          </form>

          <div className="space-y-2">
            {cursos.map((c: any) => (
              <div
                key={c.id}
                className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800"
              >
                <div className="flex flex-col">
                  <span className="text-slate-50 font-medium">{c.titulo}</span>
                  {c.setor && c.setor !== 'todos' && (
                    <span className="text-xs font-semibold text-amber-500 mt-0.5">{c.setor}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 text-amber-500 border-slate-700 bg-slate-900 hover:bg-slate-800"
                    onClick={() => {
                      setCursoEdit(c)
                      setSelectedSetor(c.setor || 'todos')
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                    onClick={() => deleteCurso(c.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {cursos.length === 0 && (
              <p className="text-center text-sm text-slate-500 py-4 border border-dashed border-slate-800 rounded-lg">
                Nenhum curso cadastrado.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-100">Gerenciar Módulos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {moduloEdit ? (
            <TreinamentosQuizBuilder
              modulo={moduloEdit}
              cursos={cursos}
              onSave={() => {
                setModuloEdit(null)
                onRefresh()
              }}
              onCancel={() => setModuloEdit(null)}
              onRefresh={onRefresh}
            />
          ) : (
            <>
              <Button
                className="w-full bg-amber-500 hover:bg-amber-600 text-black"
                onClick={() => setModuloEdit({})}
              >
                <Plus className="w-4 h-4 mr-2" /> Criar Novo Módulo
              </Button>
              <div className="space-y-2">
                {modulos.map((m: any) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800"
                  >
                    <div className="flex flex-col">
                      <span className="text-slate-50 font-medium">{m.titulo}</span>
                      <span className="text-xs text-slate-300">
                        {cursos.find((c: any) => c.id === m.curso_id)?.titulo}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 text-amber-500 border-slate-700 bg-slate-900 hover:bg-slate-800"
                        onClick={() => setModuloEdit(m)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-8 w-8 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                        onClick={async () => {
                          if (confirm('Excluir módulo?')) {
                            await supabase
                              .from('intranet_treinamentos_modulos')
                              .delete()
                              .eq('id', m.id)
                            onRefresh()
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {modulos.length === 0 && (
                  <p className="text-center text-sm text-slate-500 py-4 border border-dashed border-slate-800 rounded-lg">
                    Nenhum módulo cadastrado.
                  </p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

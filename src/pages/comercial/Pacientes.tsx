import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { PacienteDashboard } from './components/paciente/PacienteDashboard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { Search, Users } from 'lucide-react'

function formatarDataLocal(dataStr: string | null) {
  if (!dataStr) return '-'
  const str = dataStr.substring(0, 10)
  const partes = str.split('-')
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }
  return str
}

export default function Pacientes() {
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id')

  if (id) {
    return <PacienteDashboard id={id} />
  }

  return <PacientesList />
}

function PacientesList() {
  const navigate = useNavigate()
  const [pacientes, setPacientes] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPacientes = async () => {
      setLoading(true)
      let q = supabase.from('pacientes').select('*').order('nome')
      if (search) q = q.ilike('nome', `%${search}%`)
      const { data } = await q.limit(20)
      if (data) setPacientes(data)
      setLoading(false)
    }
    const t = setTimeout(fetchPacientes, 300)
    return () => clearTimeout(t)
  }, [search])

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-slate-900 p-6 rounded-xl border-l-4 border-amber-500 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-800 rounded-lg">
            <Users className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white uppercase">Pacientes</h1>
            <p className="text-slate-400 mt-1 text-sm uppercase tracking-wider font-medium">
              Gestão de Pacientes da Clínica
            </p>
          </div>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Buscar Paciente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 max-w-sm">
            <Input
              placeholder="Nome do paciente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button
              variant="outline"
              size="icon"
              className="bg-slate-200 text-slate-700 hover:bg-amber-500 hover:text-white transition-all shadow-sm border-transparent"
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Data Cadastro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : pacientes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Nenhum paciente encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  pacientes.map((p) => (
                    <TableRow
                      key={p.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/comercial/pacientes?id=${p.id}`)}
                    >
                      <TableCell className="font-medium">{p.nome}</TableCell>
                      <TableCell>{p.telefone || '-'}</TableCell>
                      <TableCell>{p.email || '-'}</TableCell>
                      <TableCell>{formatarDataLocal(p.data_cadastro)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

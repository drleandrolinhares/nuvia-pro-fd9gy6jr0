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
import { Search } from 'lucide-react'

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
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Pacientes</h2>
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
            <Button variant="outline" size="icon">
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

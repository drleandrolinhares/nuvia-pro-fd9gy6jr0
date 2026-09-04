import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { useNavigate } from 'react-router-dom'
import { UserPlus, ArrowLeft } from 'lucide-react'

export default function RegistroUsuarios() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('visualizacao')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const sessionRes = await supabase.auth.getSession()
      const tenantId =
        sessionRes.data.session?.user?.app_metadata?.tenant_id ||
        '00000000-0000-0000-0000-000000000001'

      const { data: edgeData, error: edgeError } = await supabase.functions.invoke('create-user', {
        body: { email, password, nome, tenant_id: tenantId },
      })

      if (edgeError) {
        let errorMsg = 'Erro ao criar usuário no servidor'
        try {
          if (edgeError.context) {
            const resp = edgeError.context.clone ? edgeError.context.clone() : edgeError.context
            const body = await resp.json()
            errorMsg = body.error || body.message || errorMsg
          } else {
            errorMsg = edgeError.message || errorMsg
          }
        } catch {
          errorMsg = edgeError.message || errorMsg
        }
        throw new Error(errorMsg)
      }
      if (edgeData?.error) throw new Error(edgeData.error)

      const userId = edgeData.user.id

      const { error: userError } = await supabase.from('usuarios').upsert({
        id: userId,
        email,
        nome,
        role,
        status: 'ativo',
        tenant_id: tenantId,
      })

      if (userError) throw userError

      toast({
        title: 'Usuário criado com sucesso!',
        description: `${nome} agora tem acesso ao sistema como ${role}.`,
      })

      navigate('/configuracoes')
    } catch (error: any) {
      toast({
        title: 'Erro ao criar usuário',
        description: error.message || 'Verifique os dados e tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground uppercase">
            Registro de Usuário
          </h1>
          <p className="text-muted-foreground uppercase text-sm font-medium tracking-wider mt-1">
            Cadastre um novo colaborador no sistema.
          </p>
        </div>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-amber-500" />
            <CardTitle className="text-xl font-bold uppercase tracking-wider">
              Dados de Acesso
            </CardTitle>
          </div>
          <CardDescription className="uppercase tracking-wide text-xs">
            Preencha as informações para criar uma nova conta
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="nome" className="uppercase text-xs font-bold tracking-wider">
                  Nome Completo
                </Label>
                <Input
                  id="nome"
                  placeholder="Ex: João da Silva"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  className="bg-muted/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="uppercase text-xs font-bold tracking-wider">
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="joao@nuvia.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-muted/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="uppercase text-xs font-bold tracking-wider">
                  Senha Provisória
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-muted/50"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="role" className="uppercase text-xs font-bold tracking-wider">
                  Nível de Acesso (Role)
                </Label>
                <Select value={role} onValueChange={setRole} required>
                  <SelectTrigger className="bg-muted/50">
                    <SelectValue placeholder="Selecione o nível de acesso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador Geral</SelectItem>
                    <SelectItem value="crc_comercial">CRC Comercial</SelectItem>
                    <SelectItem value="dentista_avaliador">Dentista Avaliador</SelectItem>
                    <SelectItem value="visualizacao">Visualização Apenas</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                  Define as permissões do usuário dentro do sistema.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/20 border-t border-border/50 px-6 py-4">
            <Button
              type="submit"
              className="w-full sm:w-auto ml-auto bg-amber-600 hover:bg-amber-700 text-white font-bold tracking-wide uppercase"
              disabled={isLoading}
            >
              {isLoading ? 'Registrando...' : 'Criar Usuário'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

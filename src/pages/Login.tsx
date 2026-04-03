import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { ShieldCheck } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const { error } = await signIn(email, password)

    if (error) {
      toast({
        title: 'Erro de autenticação',
        description: 'Verifique suas credenciais e tente novamente.',
        variant: 'destructive',
      })
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="absolute inset-0 bg-[url('https://img.usecurling.com/p/1920/1080?q=dentist%20clinic&color=blue&dpr=1')] opacity-10 bg-cover bg-center" />

      <Card className="w-full max-w-md relative z-10 border-amber-500/50 bg-slate-900 shadow-2xl shadow-amber-900/20">
        <CardHeader className="space-y-3 pb-6 text-center">
          <div className="mx-auto bg-amber-500/10 w-16 h-16 rounded-full flex items-center justify-center border border-amber-500/30 mb-2">
            <ShieldCheck className="w-8 h-8 text-amber-500" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-white">
            NUVIA <span className="text-amber-500">PRO</span>
          </CardTitle>
          <CardDescription className="text-slate-400 font-medium tracking-wide">
            Sistema de Gestão Profissional
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-950 border-slate-800 text-slate-100 focus-visible:ring-amber-500 placeholder:text-slate-700"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-950 border-slate-800 text-slate-100 focus-visible:ring-amber-500"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <Button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold tracking-wide transition-all"
              disabled={isLoading}
            >
              {isLoading ? 'Autenticando...' : 'Acessar Sistema'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

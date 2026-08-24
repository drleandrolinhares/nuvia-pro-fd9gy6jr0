import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
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
import { KeyRound, ArrowLeft, Loader2 } from 'lucide-react'

export default function RecuperarSenha() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const redirectTo = `${window.location.origin}/redefinir-senha`
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      })

      if (error) {
        toast({
          title: 'Erro ao solicitar recuperação',
          description:
            error.message || 'Não foi possível processar a solicitação. Tente novamente.',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'E-mail enviado',
          description: 'Se o e-mail existir no sistema, um link de recuperação será enviado.',
        })
      }
    } catch (err: any) {
      toast({
        title: 'Erro inesperado',
        description: err?.message || 'Ocorreu um erro ao tentar recuperar a senha.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="absolute inset-0 bg-[url('https://img.usecurling.com/p/1920/1080?q=dentist%20clinic&color=blue&dpr=1')] opacity-10 bg-cover bg-center" />

      <Card className="w-full max-w-md relative z-10 border-amber-500/50 bg-slate-900 shadow-2xl shadow-amber-900/20">
        <CardHeader className="space-y-3 pb-6 text-center">
          <div className="mx-auto bg-amber-500/10 w-16 h-16 rounded-full flex items-center justify-center border border-amber-500/30 mb-2">
            <KeyRound className="w-8 h-8 text-amber-500" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            Recuperar Senha
          </CardTitle>
          <CardDescription className="text-slate-400 font-medium tracking-wide">
            Informe seu e-mail cadastrado para receber as instruções de recuperação.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
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
          </CardContent>
          <CardFooter className="pt-2 flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold tracking-wide transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando link...
                </>
              ) : (
                'Enviar link de recuperação'
              )}
            </Button>
            <Link
              to="/"
              className="inline-flex items-center justify-center text-sm text-slate-400 hover:text-amber-500 transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Voltar para o login
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

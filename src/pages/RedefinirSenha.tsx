import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react'

export default function RedefinirSenha() {
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [showNovaSenha, setShowNovaSenha] = useState(false)
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    // Check if error is returned in hash fragment (e.g. #error=access_denied&error_code=otp_expired)
    const hash = window.location.hash
    if (hash.includes('error=')) {
      const params = new URLSearchParams(hash.substring(1))
      const errorDescription =
        params.get('error_description') || 'O link de recuperação expirou ou é inválido.'
      toast({
        title: 'Link inválido ou expirado',
        description: decodeURIComponent(errorDescription.replace(/\+/g, ' ')),
        variant: 'destructive',
      })
    }
  }, [toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (novaSenha.length < 6) {
      toast({
        title: 'Senha muito curta',
        description: 'A nova senha deve ter no mínimo 6 caracteres.',
        variant: 'destructive',
      })
      return
    }

    if (novaSenha !== confirmarSenha) {
      toast({
        title: 'Senhas não conferem',
        description: 'A confirmação de senha não coincide com a nova senha.',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: novaSenha,
      })

      if (error) {
        toast({
          title: 'Erro ao redefinir senha',
          description: error.message || 'Não foi possível alterar sua senha. Tente novamente.',
          variant: 'destructive',
        })
      } else {
        setSuccess(true)
        toast({
          title: 'Senha redefinida com sucesso!',
          description: 'Sua senha foi atualizada. Você será redirecionado para a tela inicial.',
        })

        setTimeout(() => {
          navigate('/')
        }, 2000)
      }
    } catch (err: any) {
      toast({
        title: 'Erro inesperado',
        description: err?.message || 'Ocorreu um erro ao atualizar a senha.',
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
            {success ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            ) : (
              <Lock className="w-8 h-8 text-amber-500" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            Redefinir Senha
          </CardTitle>
          <CardDescription className="text-slate-400 font-medium tracking-wide">
            {success
              ? 'Senha alterada com sucesso! Redirecionando...'
              : 'Defina uma nova senha de acesso para sua conta.'}
          </CardDescription>
        </CardHeader>
        {!success ? (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nova-senha" className="text-slate-300">
                  Nova Senha
                </Label>
                <div className="relative">
                  <Input
                    id="nova-senha"
                    type={showNovaSenha ? 'text' : 'password'}
                    placeholder="Mínimo de 6 caracteres"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-slate-100 focus-visible:ring-amber-500 placeholder:text-slate-700 pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNovaSenha(!showNovaSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                    tabIndex={-1}
                  >
                    {showNovaSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmar-senha" className="text-slate-300">
                  Confirmar Nova Senha
                </Label>
                <div className="relative">
                  <Input
                    id="confirmar-senha"
                    type={showConfirmarSenha ? 'text' : 'password'}
                    placeholder="Repita a nova senha"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-slate-100 focus-visible:ring-amber-500 placeholder:text-slate-700 pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                    tabIndex={-1}
                  >
                    {showConfirmarSenha ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
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
                    Atualizando senha...
                  </>
                ) : (
                  'Salvar nova senha'
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
        ) : (
          <CardContent className="pt-4 pb-6 text-center">
            <Button
              type="button"
              onClick={() => navigate('/')}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold tracking-wide"
            >
              Ir para o Login
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  )
}

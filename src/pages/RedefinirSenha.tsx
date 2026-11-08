import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { AuthShell } from '@/components/auth/auth-shell'
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
    <AuthShell
      icon={success ? CheckCircle2 : Lock}
      title={success ? 'Senha atualizada' : 'Definir nova senha'}
      subtitle={
        success
          ? 'Tudo certo. Redirecionando para o sistema…'
          : 'Escolha uma nova senha de acesso para sua conta.'
      }
      footer={
        !success ? (
          <Link
            to="/"
            className="mt-4 inline-flex w-full items-center justify-center gap-1.5 text-[13px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Voltar para o login
          </Link>
        ) : undefined
      }
    >
      {!success ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="nova-senha">Nova senha</Label>
            <div className="relative">
              <Input
                id="nova-senha"
                type={showNovaSenha ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Mínimo de 6 caracteres"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                className="h-11 pr-11"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowNovaSenha(!showNovaSenha)}
                aria-label={showNovaSenha ? 'Ocultar senha' : 'Mostrar senha'}
                className="absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                tabIndex={-1}
              >
                {showNovaSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmar-senha">Confirmar nova senha</Label>
            <div className="relative">
              <Input
                id="confirmar-senha"
                type={showConfirmarSenha ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Repita a nova senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className="h-11 pr-11"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
                aria-label={showConfirmarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                className="absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                tabIndex={-1}
              >
                {showConfirmarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" size="lg" className="mt-1 w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Atualizando…
              </>
            ) : (
              'Salvar nova senha'
            )}
          </Button>
        </form>
      ) : (
        <Button size="lg" className="w-full" onClick={() => navigate('/')}>
          Ir para o sistema
        </Button>
      )}
    </AuthShell>
  )
}

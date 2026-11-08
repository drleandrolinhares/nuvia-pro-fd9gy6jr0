import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { AuthShell } from '@/components/auth/auth-shell'
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
    <AuthShell
      icon={KeyRound}
      title="Recuperar senha"
      subtitle="Informe seu e-mail cadastrado para receber o link de redefinição."
      footer={
        <Link
          to="/"
          className="mt-4 inline-flex w-full items-center justify-center gap-1.5 text-[13px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Voltar para o login
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail corporativo</Label>
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="username"
            placeholder="nome@nuvia.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11"
            required
          />
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Enviando…
            </>
          ) : (
            'Enviar link de recuperação'
          )}
        </Button>
      </form>
    </AuthShell>
  )
}

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { AuthShell } from '@/components/auth/auth-shell'
import { Lock, Loader2, Eye, EyeOff, ShieldAlert } from 'lucide-react'

export default function RecadastrarSenha() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { user, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres.')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem.')
      return
    }

    if (newPassword === '123456') {
      toast.error('Você não pode usar a senha temporária. Escolha uma nova senha.')
      return
    }

    setLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
      if (updateError) throw updateError

      const { error: flagError } = await supabase
        .from('usuarios')
        .update({ force_password_change: false })
        .eq('id', user?.id)

      if (flagError) throw flagError

      await refreshProfile()
      toast.success('Senha atualizada com sucesso!')
      navigate('/')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar senha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      icon={Lock}
      title="Defina uma nova senha"
      subtitle="Por segurança, você precisa substituir a senha temporária antes de continuar."
    >
      <div className="mb-4 flex items-start gap-2 rounded-lg border border-warning/25 bg-warning/[0.07] p-2.5 text-[11.5px] leading-relaxed text-warning">
        <ShieldAlert className="mt-0.5 size-3.5 shrink-0" />
        <span>Use no mínimo 6 caracteres e não reutilize a senha temporária.</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="new-password">Nova senha</Label>
          <div className="relative">
            <Input
              id="new-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-11 pr-11"
              required
              minLength={6}
              placeholder="Mínimo 6 caracteres"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              className="absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm-password">Confirmar senha</Label>
          <Input
            id="confirm-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-11"
            required
            minLength={6}
            placeholder="Repita a nova senha"
          />
        </div>

        <Button type="submit" size="lg" className="mt-1 w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Atualizando…
            </>
          ) : (
            'Atualizar senha'
          )}
        </Button>
      </form>
    </AuthShell>
  )
}

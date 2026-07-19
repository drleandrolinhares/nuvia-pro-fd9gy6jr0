import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
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
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Lock, Loader2, Eye, EyeOff } from 'lucide-react'

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
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <Card className="w-full max-w-md relative z-10 border-amber-500/50 bg-slate-900 shadow-2xl shadow-amber-900/20">
        <CardHeader className="space-y-3 pb-6 text-center">
          <div className="mx-auto bg-amber-500/10 w-16 h-16 rounded-full flex items-center justify-center border border-amber-500/30 mb-2">
            <Lock className="w-8 h-8 text-amber-500" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            Recadastrar Senha
          </CardTitle>
          <CardDescription className="text-slate-400">
            Por segurança, você deve definir uma nova senha antes de continuar.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-slate-300">
                Nova Senha
              </Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-slate-100 focus-visible:ring-amber-500 pr-10"
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-slate-300">
                Confirmar Senha
              </Label>
              <Input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-slate-950 border-slate-800 text-slate-100 focus-visible:ring-amber-500"
                required
                minLength={6}
                placeholder="Repita a nova senha"
              />
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <Button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold tracking-wide transition-all"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {loading ? 'Atualizando...' : 'Atualizar Senha'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

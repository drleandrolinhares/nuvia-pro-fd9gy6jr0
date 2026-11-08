import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Eye, EyeOff, Loader2, Lock, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const { error } = await signIn(email, password)

    if (error) {
      toast({
        title: 'Não foi possível entrar',
        description: 'Confira seu e-mail e senha e tente novamente.',
        variant: 'destructive',
      })
    }

    setIsLoading(false)
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      {/* Painel de marca — visível em telas grandes */}
      <aside className="relative hidden overflow-hidden surface-hero lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 top-1/4 h-96 w-96 rounded-full border border-white/[0.06]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 top-1/3 h-64 w-64 rounded-full border border-white/[0.05]"
        />

        <div className="relative flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-[hsl(var(--gold))] to-[hsl(var(--gold-strong))] shadow-[0_6px_22px_-6px_hsl(var(--gold)/0.65)]">
            <span className="text-lg font-extrabold leading-none tracking-tighter text-[hsl(var(--navy-deep))]">
              N
            </span>
          </div>
          <div className="leading-none">
            <div className="text-lg font-extrabold tracking-[0.16em] text-white">
              NUVIA<span className="ml-1 font-semibold text-[hsl(var(--gold))]">PRO</span>
            </div>
            <div className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-white/40">
              Odontologia
            </div>
          </div>
        </div>

        <div className="relative max-w-md">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-[hsl(var(--gold))]">
            Gestão clínica integrada
          </p>
          <h1 className="text-[2.1rem] font-bold leading-[1.15] tracking-tight text-white">
            Toda a operação da clínica em um só lugar.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-white/55">
            Comercial, financeiro, estoque, laboratórios e performance das equipes — com dados
            auditáveis e acesso controlado por cargo.
          </p>

          <ul className="mt-9 space-y-3.5">
            {[
              'Permissões por cargo, com registro de auditoria',
              'Indicadores de vendas, comissões e inadimplência',
              'Rotinas, treinamentos e comunicados internos',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[13px] text-white/70">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[hsl(var(--gold))]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center gap-2 text-[11px] text-white/30">
          <Lock className="size-3.5" />
          <span>Acesso restrito a colaboradores autorizados</span>
        </div>
      </aside>

      {/* Formulário */}
      <main className="relative flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-10 sm:px-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(600px_240px_at_50%_-20%,hsl(var(--secondary)/0.12),transparent_70%)]"
        />

        <div className="relative w-full max-w-[400px]">
          {/* Cabeçalho de marca para telas pequenas */}
          <div className="mb-8 flex flex-col items-center text-center lg:hidden">
            <div className="mb-3 grid size-12 place-items-center rounded-xl bg-gradient-to-br from-[hsl(var(--gold))] to-[hsl(var(--gold-strong))] shadow-md">
              <span className="text-lg font-extrabold leading-none text-[hsl(var(--navy-deep))]">
                N
              </span>
            </div>
            <div className="text-lg font-extrabold tracking-[0.16em] text-foreground">
              NUVIA<span className="ml-1 font-semibold text-secondary">PRO</span>
            </div>
            <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Odontologia
            </div>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-card sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Entrar na sua conta
              </h2>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                Use as credenciais corporativas fornecidas pelo administrador.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
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

              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="password">Senha</Label>
                  <Link
                    to="/recuperar-senha"
                    className="text-[12px] font-semibold text-primary/80 underline-offset-4 transition-colors hover:text-primary hover:underline"
                  >
                    Esqueci minha senha
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pr-11"
                    required
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

              <Button type="submit" size="lg" className="mt-2 w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Autenticando…
                  </>
                ) : (
                  'Acessar sistema'
                )}
              </Button>
            </form>

            <div className="mt-6 flex items-start gap-2 border-t border-border/70 pt-4 text-[11px] leading-relaxed text-muted-foreground">
              <Lock className="mt-0.5 size-3.5 shrink-0" />
              <span>
                Ambiente monitorado. O uso indevido das credenciais é registrado e pode ser
                auditado.
              </span>
            </div>
          </div>

          <p className="mt-6 text-center text-[11px] text-muted-foreground/70">
            © {new Date().getFullYear()} Nuvia Odontologia · Todos os direitos reservados
          </p>
        </div>
      </main>
    </div>
  )
}

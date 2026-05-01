import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, Lock, AlertTriangle, Info, CalendarOff } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function SmartLock() {
  const [loading, setLoading] = useState(true)
  const [activeAbsences, setActiveAbsences] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const now = new Date()
      const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .split('T')[0]
      const { data: absencesData } = await supabase
        .from('ausencias')
        .select('*, usuarios(nome)')
        .eq('data', today)

      if (absencesData) {
        setActiveAbsences(absencesData)
      }
    } catch (error) {
      toast.error('Erro ao carregar dados do Smart Lock')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    )
  }

  const globalAbsences = activeAbsences.filter((a) => !a.usuario_id)
  const userAbsences = activeAbsences.filter((a) => a.usuario_id)

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-slate-900 p-6 rounded-xl border-l-4 border-amber-500 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-800 rounded-lg">
            <Lock className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white uppercase">SMART LOCK</h1>
            <p className="text-slate-300 mt-1 text-sm uppercase tracking-wider font-medium">
              Painel de Monitoramento de Acessos
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 text-card-foreground shadow-sm">
        <h2 className="text-xl font-bold mb-2">Status do Sistema em Tempo Real</h2>
        <p className="text-sm text-muted-foreground mb-6">
          O Smart Lock monitora ativamente as configurações de ausências e feriados para bloquear
          automaticamente o acesso de usuários quando necessário. Abaixo você pode ver se há alguma
          restrição ativa no momento.
        </p>

        {globalAbsences.length > 0 && (
          <Alert
            variant="destructive"
            className="bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-800 dark:text-red-500 mb-6 shadow-sm"
          >
            <AlertTriangle className="h-5 w-5 !text-red-600 dark:!text-red-500" />
            <AlertTitle className="text-base font-bold ml-2">SISTEMA BLOQUEADO (GLOBAL)</AlertTitle>
            <AlertDescription className="ml-2 mt-2">
              Hoje está configurado como um feriado ou recesso global no sistema. Todos os
              colaboradores estão com o acesso restrito.
              <ul className="list-disc pl-5 mt-3 space-y-1 text-red-700 dark:text-red-400 font-medium">
                {globalAbsences.map((a) => (
                  <li key={a.id}>
                    {a.descricao} <span className="opacity-75 text-sm font-normal">({a.tipo})</span>
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {userAbsences.length > 0 && (
          <Alert className="bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-500 mb-6 shadow-sm">
            <CalendarOff className="h-5 w-5 !text-amber-600 dark:!text-amber-500" />
            <AlertTitle className="text-base font-bold ml-2">
              AUSÊNCIAS INDIVIDUAIS ATIVAS
            </AlertTitle>
            <AlertDescription className="ml-2 mt-2 text-amber-700 dark:text-amber-400">
              Os seguintes colaboradores estão com o acesso restrito hoje devido a ausências
              programadas:
              <ul className="list-disc pl-5 mt-3 space-y-1 font-medium">
                {userAbsences.map((a) => (
                  <li key={a.id}>
                    {a.usuarios?.nome || 'Colaborador'} - {a.descricao}{' '}
                    <span className="opacity-75 text-sm font-normal">({a.tipo})</span>
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {activeAbsences.length === 0 && (
          <Alert className="bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-500 shadow-sm">
            <Lock className="h-5 w-5 !text-emerald-600 dark:!text-emerald-500" />
            <AlertTitle className="text-base font-bold ml-2">SISTEMA OPERACIONAL</AlertTitle>
            <AlertDescription className="ml-2 mt-2 text-emerald-700 dark:text-emerald-400">
              Nenhuma restrição especial de calendário (feriados ou ausências) foi detectada para
              hoje. O sistema segue os limites de horário padrão da clínica.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}

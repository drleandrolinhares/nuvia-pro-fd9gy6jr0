import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Medal, Star, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function TreinamentosRanking() {
  const [ranking, setRanking] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRanking = async () => {
      const { data: progresso } = await supabase
        .from('intranet_treinamentos_progresso')
        .select('usuario_id, pontos')
        .eq('aprovado', true)

      const { data: usuarios } = await supabase
        .from('usuarios')
        .select('id, nome, avatar_url, status')
        .eq('status', 'ativo')

      if (progresso && usuarios) {
        const pointsByUser = progresso.reduce(
          (acc, curr) => {
            acc[curr.usuario_id] = (acc[curr.usuario_id] || 0) + (curr.pontos || 0)
            return acc
          },
          {} as Record<string, number>,
        )

        const ranked = usuarios
          .map((u) => ({ ...u, pontos: pointsByUser[u.id] || 0 }))
          .filter((u) => u.pontos > 0)
          .sort((a, b) => b.pontos - a.pontos)

        setRanking(ranked)
      }
      setLoading(false)
    }
    fetchRanking()
  }, [])

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-amber-500" />
      </div>
    )
  }

  return (
    <Card className="bg-slate-900 border-slate-800 shadow-sm mt-6">
      <CardHeader>
        <CardTitle className="text-amber-500 text-xl flex items-center gap-2">
          <Trophy className="w-5 h-5" /> Ranking da Equipe
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {ranking.map((user, idx) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800 transition-all hover:bg-slate-900"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 font-bold text-slate-400">
                  {idx === 0 ? (
                    <Medal className="text-yellow-500 w-6 h-6" />
                  ) : idx === 1 ? (
                    <Medal className="text-slate-300 w-5 h-5" />
                  ) : idx === 2 ? (
                    <Medal className="text-amber-700 w-5 h-5" />
                  ) : (
                    `${idx + 1}º`
                  )}
                </div>
                <Avatar className="w-10 h-10 border border-slate-800">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback>{user.nome.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="font-medium text-slate-200">{user.nome}</span>
              </div>
              <div className="flex items-center gap-1 text-amber-500 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                {user.pontos} <Star className="w-4 h-4 fill-amber-500" />
              </div>
            </div>
          ))}
          {ranking.length === 0 && (
            <p className="text-slate-500 text-center py-8 bg-slate-950/50 rounded-lg border border-slate-800 border-dashed">
              Nenhum ponto registrado ainda. Complete treinamentos para aparecer aqui!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

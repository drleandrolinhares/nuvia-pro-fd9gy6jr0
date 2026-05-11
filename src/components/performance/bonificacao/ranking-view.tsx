import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Loader2,
  Trophy,
  AlertCircle,
  XCircle,
  CheckCircle2,
  CalendarDays,
  UserX,
  Crown,
} from 'lucide-react'
import { startOfMonth, endOfMonth, parseISO, isAfter } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

export function RankingBonificacaoView() {
  const currentYear = new Date().getFullYear().toString()
  const years = Array.from({ length: 5 }, (_, i) => (parseInt(currentYear) - i).toString())

  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<any[]>([])
  const [records, setRecords] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [selectedYear])

  const loadData = async () => {
    setLoading(true)
    const [{ data: uData }, { data: rData }] = await Promise.all([
      supabase
        .from('usuarios')
        .select('id, nome, data_admissao, obrigatorio_bonificacao')
        .eq('status', 'ativo')
        .order('nome'),
      supabase
        .from('performance_bonificacao' as any)
        .select('*')
        .like('mes_referencia', `${selectedYear}-%`),
    ])

    if (uData) {
      const activeUsers = uData.filter(
        (u) => u.obrigatorio_bonificacao || rData?.some((r) => r.usuario_id === u.id),
      )
      setUsers(activeUsers)
    }
    if (rData) setRecords(rData)

    setLoading(false)
  }

  const isUserActiveInMonth = (user: any, monthStr: string) => {
    if (!user.data_admissao) return true
    const monthStart = startOfMonth(parseISO(`${monthStr}-01`))
    const admissao = parseISO(user.data_admissao)
    return !isAfter(admissao, endOfMonth(monthStart))
  }

  const months = Array.from({ length: 12 }, (_, i) => {
    return `${selectedYear}-${String(i + 1).padStart(2, '0')}`
  })

  const monthNames = [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez',
  ]

  const userStats = users.map((user) => {
    let won = 0
    let lost = 0
    let active = 0
    let pending = 0
    let consecutiveWins = 0
    let maxConsecutiveWins = 0

    const monthResults = months.map((month) => {
      const isActive = isUserActiveInMonth(user, month)
      if (!isActive) {
        consecutiveWins = 0
        return 'inactive'
      }

      active++
      const record = records.find((r) => r.usuario_id === user.id && r.mes_referencia === month)

      if (!record) {
        pending++
        consecutiveWins = 0
        return 'pending'
      }

      if (record.atingiu_meta || (record.itens_marcados && record.itens_marcados.length === 0)) {
        won++
        consecutiveWins++
        if (consecutiveWins > maxConsecutiveWins) maxConsecutiveWins = consecutiveWins
        return 'won'
      } else {
        lost++
        consecutiveWins = 0
        return 'lost'
      }
    })

    return {
      ...user,
      stats: { won, lost, active, pending, maxConsecutiveWins },
      monthResults,
    }
  })

  const champions = userStats.filter((u) => u.stats.won === 12)
  const sortedUsers = [...userStats].sort(
    (a, b) => b.stats.won - a.stats.won || a.nome.localeCompare(b.nome),
  )

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[150px] border-slate-300">
              <CalendarDays className="w-4 h-4 mr-2 text-slate-500" />
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-slate-500">
          Acompanhe o desempenho da equipe ao longo do ano e os ganhadores do 14º salário.
        </div>
      </div>

      {champions.length > 0 && (
        <Card className="bg-gradient-to-br from-amber-400 to-amber-600 border-amber-500 shadow-md text-white animate-fade-in-up">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-2xl drop-shadow-sm">
              <Crown className="w-8 h-8 text-amber-100" /> Campeões do Ano ({selectedYear})
            </CardTitle>
            <CardDescription className="text-amber-100 font-medium">
              12 meses consecutivos de excelência. Elegíveis ao 14º salário!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 mt-4">
              {champions.map((u) => (
                <div
                  key={u.id}
                  className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-3 border border-white/30 shadow-sm"
                >
                  <div className="w-10 h-10 rounded-full bg-white text-amber-600 flex items-center justify-center font-bold text-lg shadow-inner">
                    {u.nome.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="font-bold text-lg drop-shadow-sm">{u.nome.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Histórico de Desempenho - {selectedYear}</CardTitle>
          <CardDescription>Visão geral de vitórias e falhas por colaborador.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="w-full">
            <div className="min-w-[800px] p-6 pt-0">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-4 min-w-[200px] sticky left-0 bg-slate-50 z-20 shadow-[1px_0_0_0_#e2e8f0]">
                      Colaborador
                    </th>
                    {monthNames.map((m) => (
                      <th
                        key={m}
                        className="px-2 py-4 text-center min-w-[50px] border-l border-slate-200"
                      >
                        {m}
                      </th>
                    ))}
                    <th className="px-4 py-4 text-center border-l border-slate-200 bg-slate-50">
                      Vitórias
                    </th>
                    <th className="px-4 py-4 text-center bg-slate-50">Falhas</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-semibold text-slate-800 sticky left-0 bg-white z-10 shadow-[1px_0_0_0_#e2e8f0] group-hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs border border-slate-200 shadow-sm">
                            {user.nome.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="truncate max-w-[150px]" title={user.nome}>
                            {user.nome}
                          </span>
                        </div>
                      </td>
                      {user.monthResults.map((res, i) => (
                        <td key={i} className="p-2 border-l border-slate-100 text-center">
                          <div className="flex justify-center">
                            {res === 'won' && (
                              <div
                                className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm"
                                title="Ganhou"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </div>
                            )}
                            {res === 'lost' && (
                              <div
                                className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center shadow-sm"
                                title="Falhou"
                              >
                                <XCircle className="w-4 h-4" />
                              </div>
                            )}
                            {res === 'pending' && (
                              <div
                                className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center"
                                title="Pendente/Não Avaliado"
                              >
                                <AlertCircle className="w-4 h-4" />
                              </div>
                            )}
                            {res === 'inactive' && (
                              <div
                                className="w-6 h-6 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center border border-slate-200 border-dashed"
                                title="Não fazia parte da equipe"
                              >
                                <UserX className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                        </td>
                      ))}
                      <td className="px-4 py-3 text-center border-l border-slate-100 bg-emerald-50/30">
                        <span className="font-bold text-emerald-600 text-lg">{user.stats.won}</span>
                      </td>
                      <td className="px-4 py-3 text-center bg-red-50/30">
                        <span className="font-bold text-red-600 text-lg">{user.stats.lost}</span>
                      </td>
                    </tr>
                  ))}
                  {sortedUsers.length === 0 && (
                    <tr>
                      <td
                        colSpan={15}
                        className="text-center py-8 text-slate-500 italic bg-slate-50/50"
                      >
                        Nenhum colaborador elegível encontrado para este ano.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-emerald-700 flex items-center gap-2">
              <Trophy className="w-5 h-5" /> Top Performers
            </CardTitle>
            <CardDescription>
              Colaboradores com mais vitórias no ano de {selectedYear}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sortedUsers
                .filter((u) => u.stats.won > 0)
                .slice(0, 5)
                .map((u, i) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-black text-slate-400 w-5">{i + 1}º</span>
                      <span className="font-semibold text-slate-700">{u.nome}</span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-bold px-3"
                    >
                      {u.stats.won} vitórias
                    </Badge>
                  </div>
                ))}
              {sortedUsers.filter((u) => u.stats.won > 0).length === 0 && (
                <p className="text-sm text-slate-500 italic text-center py-4">
                  Nenhuma vitória registrada.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-red-700 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Não Ganhadores (Atenção)
            </CardTitle>
            <CardDescription>
              Colaboradores com mais falhas registradas no ano de {selectedYear}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...userStats]
                .filter((u) => u.stats.lost > 0)
                .sort((a, b) => b.stats.lost - a.stats.lost)
                .slice(0, 5)
                .map((u, i) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-3 bg-red-50/50 rounded-lg border border-red-100"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-slate-800">{u.nome}</span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-red-100 text-red-700 hover:bg-red-200 font-bold px-3"
                    >
                      {u.stats.lost} falhas
                    </Badge>
                  </div>
                ))}
              {[...userStats].filter((u) => u.stats.lost > 0).length === 0 && (
                <p className="text-sm text-slate-500 italic text-center py-4">
                  Nenhuma falha registrada. Ótimo trabalho!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

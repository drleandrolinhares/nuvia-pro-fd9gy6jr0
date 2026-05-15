import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { ScrollArea } from '@/components/ui/scroll-area'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Activity, Clock } from 'lucide-react'

export function FETLogs() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('fet_historico')
      .select(`
        *,
        paciente:fet_pacientes(nome),
        usuario:usuarios(nome)
      `)
      .order('criado_em', { ascending: false })
      .limit(100)

    if (!error && data) {
      setLogs(data)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        Carregando logs...
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-500" />
            Logs de Auditoria (FET)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Rastreabilidade de ações executadas pelos colaboradores nas Fichas de Evolução
          </p>
        </div>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {logs.length === 0 ? (
            <div className="text-center p-8 text-slate-500 border border-dashed border-slate-800 rounded-lg">
              Nenhum registro de log encontrado.
            </div>
          ) : (
            <div className="relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-800 before:to-transparent">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mb-6 last:mb-0"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-800 bg-slate-900 text-slate-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <Clock className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-950 p-4 rounded-lg border border-slate-800 shadow-md">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                      <span className="font-bold text-white text-sm">{log.acao}</span>
                      <span className="text-xs font-medium text-slate-500">
                        {format(new Date(log.criado_em), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                    <div className="text-sm text-slate-300 mb-2">{log.detalhes}</div>
                    <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-slate-800/50 text-xs">
                      {log.paciente && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500">Paciente:</span>
                          <span className="font-medium text-amber-400">{log.paciente.nome}</span>
                        </div>
                      )}
                      {log.usuario && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500">Usuário:</span>
                          <span className="font-medium text-sky-400">{log.usuario.nome}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

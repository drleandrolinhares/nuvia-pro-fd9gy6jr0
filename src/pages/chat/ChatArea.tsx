import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Send, ShieldAlert } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'

export function ChatArea({ chatId, isAudit }: { chatId: string; isAudit: boolean }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [messages, setMessages] = useState<any[]>([])
  const [conversa, setConversa] = useState<any>(null)
  const [usuarios, setUsuarios] = useState<Record<string, any>>({})
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  const loadChat = async () => {
    try {
      setIsLoading(true)
      const { data: conv, error: convError } = await supabase
        .from('chat_conversas')
        .select('*, participantes:chat_participantes(usuario_id)')
        .eq('id', chatId)
        .single()

      if (convError) {
        console.error('Erro ao carregar conversa:', convError)
      }

      setConversa(conv || null)

      if (conv) {
        const pIds = conv.participantes.map((p: any) => p.usuario_id)
        const { data: users } = await supabase
          .from('usuarios')
          .select('id, nome, avatar_url')
          .in('id', pIds)
        const uMap: any = {}
        users?.forEach((u) => (uMap[u.id] = u))
        setUsuarios(uMap)
      }

      const { data: msgs } = await supabase
        .from('chat_mensagens')
        .select('*')
        .eq('conversa_id', chatId)
        .order('criado_em', { ascending: true })
      setMessages(msgs || [])

      if (!isAudit) {
        supabase
          .from('chat_participantes')
          .update({ ultima_leitura: new Date().toISOString() })
          .eq('conversa_id', chatId)
          .eq('usuario_id', user?.id)
          .then()
      }
    } catch (e) {
      console.error('Erro inesperado ao carregar chat:', e)
    } finally {
      setIsLoading(false)
      setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      }, 100)
    }
  }

  useEffect(() => {
    loadChat()
    const channel = supabase
      .channel(`chat_${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_mensagens',
          filter: `conversa_id=eq.${chatId}`,
        },
        (payload) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.new.id)) return prev

            const isMe = payload.new.remetente_id === user?.id

            if (isMe) {
              // Try to find a temp message with the same content
              const tempIndex = prev.findIndex(
                (m) =>
                  m.id.toString().startsWith('temp-') &&
                  m.conteudo === payload.new.conteudo &&
                  m.remetente_id === payload.new.remetente_id,
              )

              if (tempIndex >= 0) {
                const next = [...prev]
                next[tempIndex] = payload.new
                return next
              }
            }

            return [...prev, payload.new]
          })
          setTimeout(() => {
            if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
          }, 100)
          if (!isAudit && payload.new.remetente_id !== user?.id) {
            supabase
              .from('chat_participantes')
              .update({ ultima_leitura: new Date().toISOString() })
              .eq('conversa_id', chatId)
              .eq('usuario_id', user?.id)
              .then()
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [chatId, isAudit])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isAudit || !user) return

    const msg = newMessage.trim()
    setNewMessage('')

    // Atualização Otimista
    const tempId = 'temp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9)
    const tempMsg = {
      id: tempId,
      conversa_id: chatId,
      remetente_id: user.id,
      conteudo: msg,
      criado_em: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, tempMsg])

    requestAnimationFrame(() => {
      setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      }, 50)
    })

    const { error } = await supabase.from('chat_mensagens').insert({
      conversa_id: chatId,
      remetente_id: user.id,
      conteudo: msg,
    })

    if (error) {
      console.error('Erro ao enviar mensagem:', error)
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
      toast({
        title: 'Erro ao enviar',
        description: 'Não foi possível enviar a mensagem. Verifique sua conexão e tente novamente.',
        variant: 'destructive',
      })
      setNewMessage(msg)
    } else {
      supabase
        .from('chat_participantes')
        .update({ ultima_leitura: new Date().toISOString() })
        .eq('conversa_id', chatId)
        .eq('usuario_id', user.id)
        .then()
    }
  }

  const getChatName = () => {
    if (!conversa && isLoading) return 'Carregando...'
    if (!conversa) return 'Chat não encontrado'
    if (conversa.tipo === 'grupo') return conversa.nome
    const otherId = conversa.participantes?.find((p: any) => p.usuario_id !== user?.id)?.usuario_id
    if (otherId && usuarios[otherId]) return usuarios[otherId].nome
    if (isAudit && conversa.tipo === 'individual') {
      const names = conversa.participantes
        ?.map((p: any) => usuarios[p.usuario_id]?.nome)
        .filter(Boolean)
        .join(' & ')
      return names || 'Chat Direto'
    }
    return 'Chat'
  }

  const formatTime = (ts: string) => {
    const d = new Date(ts)
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex flex-col h-full w-full !overflow-hidden">
      <div className="h-14 border-b border-slate-800 flex items-center px-6 bg-slate-900/80 shrink-0 z-10">
        <h3 className="text-lg font-medium text-white flex items-center gap-2">
          {getChatName()}
          {isAudit && (
            <span className="text-xs bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> Modo Auditoria
            </span>
          )}
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0 scroll-smooth" ref={scrollRef}>
        {isLoading && messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm">
            Carregando mensagens...
          </div>
        )}
        {!isLoading && messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm">
            Nenhuma mensagem ainda. Envie a primeira mensagem!
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.remetente_id === user?.id
          const sender = usuarios[msg.remetente_id]

          return (
            <div
              key={msg.id}
              className={`flex ${isMe && !isAudit ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex gap-3 max-w-[70%] ${isMe && !isAudit ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {(!isMe || isAudit) && (
                  <Avatar className="w-8 h-8 mt-1 border border-slate-700 shrink-0">
                    <AvatarImage src={sender?.avatar_url} />
                    <AvatarFallback className="bg-slate-800 text-xs">
                      {sender?.nome?.substring(0, 2) || '?'}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={`flex flex-col ${isMe && !isAudit ? 'items-end' : 'items-start'}`}>
                  {(!isMe || isAudit) && (
                    <span className="text-xs text-slate-500 mb-1 ml-1">
                      {sender?.nome || 'Usuário'}
                    </span>
                  )}
                  <div
                    className={`px-4 py-2 rounded-2xl ${isMe && !isAudit ? 'bg-amber-500 text-slate-950 rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none'} ${msg.id.toString().startsWith('temp-') ? 'opacity-80 transition-opacity' : 'opacity-100 transition-opacity'}`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.conteudo}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 mx-1">
                    {formatTime(msg.criado_em)}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {!isAudit ? (
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 shrink-0 z-10">
          <form onSubmit={handleSend} className="flex items-center gap-3">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 rounded-full px-4 focus-visible:ring-amber-500 h-10 font-medium"
            />
            <Button
              type="submit"
              size="icon"
              className="rounded-full shrink-0 bg-amber-500 hover:bg-amber-600 text-slate-950 h-10 w-10"
              disabled={!newMessage.trim()}
            >
              <Send className="w-4 h-4 ml-0.5" />
            </Button>
          </form>
        </div>
      ) : (
        <div className="p-4 border-t border-slate-800 bg-amber-500/10 text-center shrink-0 z-10">
          <p className="text-sm text-amber-500/70">
            Você está visualizando no modo auditoria. O envio de mensagens está desabilitado.
          </p>
        </div>
      )}
    </div>
  )
}

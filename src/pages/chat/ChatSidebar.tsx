import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Users, Shield, Plus, MessageSquare } from 'lucide-react'
import { CreateGroupDialog } from './CreateGroupDialog'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

export function ChatSidebar({ activeChat, setActiveChat, viewMode, setViewMode, isAdmin }: any) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [conversas, setConversas] = useState<any[]>([])
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [unreadMap, setUnreadMap] = useState<Record<string, number>>({})
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false)

  const loadData = async () => {
    const { data: users } = await supabase
      .from('usuarios')
      .select('id, nome, avatar_url, role')
      .eq('status', 'ativo')
    setUsuarios(users || [])

    if (viewMode === 'audit' && isAdmin) {
      const { data: convs } = await supabase
        .from('chat_conversas')
        .select(`
        id, tipo, nome,
        participantes:chat_participantes(usuario_id)
      `)
        .order('criado_em', { ascending: false })
      setConversas(convs || [])
      setUnreadMap({})
    } else {
      const { data: myConvs } = await supabase
        .from('chat_participantes')
        .select(`
        conversa_id, ultima_leitura,
        conversa:chat_conversas(id, tipo, nome, participantes:chat_participantes(usuario_id))
      `)
        .eq('usuario_id', user?.id)

      const formatted = myConvs?.map((c: any) => c.conversa).filter(Boolean) || []
      setConversas(formatted)

      const { data: unreadData } = await supabase.rpc('get_unread_counts_per_conversation', {
        p_usuario_id: user?.id,
      })
      const uMap: Record<string, number> = {}
      unreadData?.forEach((r: any) => {
        uMap[r.conversa_id] = Number(r.unread_count)
      })
      setUnreadMap(uMap)
    }
  }

  useEffect(() => {
    if (user?.id) loadData()
    const channel = supabase
      .channel('chat_sidebar_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_mensagens' }, loadData)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_participantes' },
        loadData,
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [viewMode, user?.id])

  const startIndividualChat = async (targetUserId: string) => {
    try {
      const existing = conversas.find(
        (c) =>
          c.tipo === 'individual' &&
          c.participantes?.some((p: any) => p.usuario_id === targetUserId),
      )
      if (existing) {
        setActiveChat(existing.id)
        return
      }

      const { data: chatId, error } = await supabase.rpc('get_or_create_direct_chat', {
        target_user_id: targetUserId,
      })

      if (error) throw error

      if (chatId) {
        setActiveChat(chatId)
        loadData()
      } else {
        throw new Error('ID da conversa não retornado')
      }
    } catch (error) {
      console.error('Erro ao iniciar chat:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível abrir a conversa. Tente novamente.',
        variant: 'destructive',
      })
    }
  }

  const renderBadge = (id: string) => {
    if (unreadMap[id] > 0) {
      return (
        <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
          {unreadMap[id]}
        </span>
      )
    }
    return null
  }

  return (
    <div className="w-80 flex flex-col border-r border-slate-800 bg-slate-900/80">
      <div className="p-4 border-b border-slate-800 space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5" /> Chat Interno
        </h2>
        {isAdmin && (
          <div className="flex bg-slate-950 p-1 rounded-lg">
            <button
              className={cn(
                'flex-1 text-sm py-1.5 rounded-md transition-colors',
                viewMode === 'my_chats' ? 'bg-slate-800 text-white' : 'text-slate-400',
              )}
              onClick={() => {
                setViewMode('my_chats')
                setActiveChat(null)
              }}
            >
              Minhas
            </button>
            <button
              className={cn(
                'flex-1 text-sm py-1.5 rounded-md transition-colors flex items-center justify-center gap-1',
                viewMode === 'audit' ? 'bg-amber-500/20 text-amber-500' : 'text-slate-400',
              )}
              onClick={() => {
                setViewMode('audit')
                setActiveChat(null)
              }}
            >
              <Shield className="w-3 h-3" /> Auditoria
            </button>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        {viewMode === 'my_chats' && isAdmin && (
          <div className="p-4 pb-0">
            <Button
              variant="outline"
              className="w-full border-dashed"
              onClick={() => setIsGroupDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" /> Novo Grupo
            </Button>
          </div>
        )}

        <div className="p-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Grupos
          </h3>
          <div className="space-y-1">
            {conversas
              .filter((c) => c.tipo === 'grupo')
              .map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveChat(c.id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left',
                    activeChat === c.id ? 'bg-slate-800' : 'hover:bg-slate-800/50',
                  )}
                >
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex-1 truncate">
                    <p className="text-sm font-medium text-slate-200 truncate">{c.nome}</p>
                  </div>
                  {renderBadge(c.id)}
                </button>
              ))}
          </div>
        </div>

        <div className="p-4 pt-0">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Direto
          </h3>
          <div className="space-y-1">
            {viewMode === 'audit'
              ? conversas
                  .filter((c) => c.tipo === 'individual')
                  .map((c) => {
                    const p1 = usuarios.find((u) => u.id === c.participantes?.[0]?.usuario_id)
                    const p2 = usuarios.find((u) => u.id === c.participantes?.[1]?.usuario_id)
                    return (
                      <button
                        key={c.id}
                        onClick={() => setActiveChat(c.id)}
                        className={cn(
                          'w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left',
                          activeChat === c.id ? 'bg-slate-800' : 'hover:bg-slate-800/50',
                        )}
                      >
                        <div className="flex-1 truncate">
                          <p className="text-sm font-medium text-slate-200 truncate">
                            {p1?.nome} & {p2?.nome}
                          </p>
                        </div>
                      </button>
                    )
                  })
              : usuarios
                  .filter((u) => u.id !== user?.id)
                  .map((u) => {
                    const conv = conversas.find(
                      (c) =>
                        c.tipo === 'individual' &&
                        c.participantes?.some((p: any) => p.usuario_id === u.id),
                    )
                    return (
                      <button
                        key={u.id}
                        onClick={() => startIndividualChat(u.id)}
                        className={cn(
                          'w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left',
                          activeChat && conv?.id === activeChat
                            ? 'bg-slate-800'
                            : 'hover:bg-slate-800/50',
                        )}
                      >
                        <Avatar className="w-8 h-8 border border-slate-700">
                          <AvatarImage src={u.avatar_url} />
                          <AvatarFallback className="bg-slate-800 text-xs">
                            {u.nome.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 truncate">
                          <p className="text-sm font-medium text-slate-200 truncate">{u.nome}</p>
                        </div>
                        {conv && renderBadge(conv.id)}
                      </button>
                    )
                  })}
          </div>
        </div>
      </ScrollArea>
      <CreateGroupDialog
        isOpen={isGroupDialogOpen}
        onClose={() => setIsGroupDialogOpen(false)}
        usuarios={usuarios}
        onSuccess={loadData}
      />
    </div>
  )
}

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { ChatSidebar } from './chat/ChatSidebar'
import { ChatArea } from './chat/ChatArea'
import { MessageSquareOff } from 'lucide-react'

export default function Chat() {
  const { profile } = useAuth()
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'my_chats' | 'audit'>('my_chats')

  const acessoChat = (profile as any)?.acesso_chat ?? true
  const isAdmin = profile?.role === 'admin'

  if (!acessoChat && !isAdmin) {
    return (
      <div className="p-8 flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center text-slate-400">
          <MessageSquareOff className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h2 className="text-lg font-medium text-white">Acesso Restrito</h2>
          <p>Você não tem permissão para acessar o Chat Interno.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] overflow-hidden bg-slate-950 border-t border-slate-800">
      <ChatSidebar
        activeChat={activeChat}
        setActiveChat={setActiveChat}
        viewMode={viewMode}
        setViewMode={setViewMode}
        isAdmin={isAdmin}
      />
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900/50 h-full overflow-hidden">
        {activeChat ? (
          <ChatArea chatId={activeChat} isAudit={viewMode === 'audit'} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500 flex-col gap-4">
            <MessageSquareOff className="w-12 h-12 opacity-20" />
            <p>Selecione uma conversa para começar</p>
          </div>
        )}
      </div>
    </div>
  )
}

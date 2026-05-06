-- Criação das tabelas para o Chat Interno
CREATE TABLE IF NOT EXISTS public.chat_conversas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('individual', 'grupo')),
  nome TEXT,
  criado_por UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_participantes (
  conversa_id UUID REFERENCES public.chat_conversas(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
  ultima_leitura TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (conversa_id, usuario_id)
);

CREATE TABLE IF NOT EXISTS public.chat_mensagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversa_id UUID REFERENCES public.chat_conversas(id) ON DELETE CASCADE,
  remetente_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  conteudo TEXT NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Adiciona a coluna de permissão de chat aos usuários existentes (mantendo compatibilidade total)
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS acesso_chat BOOLEAN NOT NULL DEFAULT true;

-- Criação da função de contagem de não lidos (Badge do Sidebar)
CREATE OR REPLACE FUNCTION public.get_unread_chat_count(p_usuario_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM public.chat_mensagens m
  JOIN public.chat_participantes p ON p.conversa_id = m.conversa_id
  WHERE p.usuario_id = p_usuario_id
    AND m.remetente_id != p_usuario_id
    AND m.criado_em > p.ultima_leitura;
    
  RETURN v_count;
END;
$function$;

-- Criação da função de contagem de não lidos por conversa (Badge do ChatSidebar)
CREATE OR REPLACE FUNCTION public.get_unread_counts_per_conversation(p_usuario_id UUID)
RETURNS TABLE(conversa_id UUID, unread_count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT m.conversa_id, COUNT(m.id)
  FROM public.chat_mensagens m
  JOIN public.chat_participantes p ON p.conversa_id = m.conversa_id
  WHERE p.usuario_id = p_usuario_id
    AND m.remetente_id != p_usuario_id
    AND m.criado_em > p.ultima_leitura
  GROUP BY m.conversa_id;
END;
$function$;

-- Configuração de Row Level Security (RLS) para preservar a integridade e auditoria
DROP POLICY IF EXISTS "chat_conversas_select" ON public.chat_conversas;
DROP POLICY IF EXISTS "chat_conversas_insert" ON public.chat_conversas;
DROP POLICY IF EXISTS "chat_conversas_update" ON public.chat_conversas;
DROP POLICY IF EXISTS "chat_participantes_select" ON public.chat_participantes;
DROP POLICY IF EXISTS "chat_participantes_insert" ON public.chat_participantes;
DROP POLICY IF EXISTS "chat_participantes_update" ON public.chat_participantes;
DROP POLICY IF EXISTS "chat_mensagens_select" ON public.chat_mensagens;
DROP POLICY IF EXISTS "chat_mensagens_insert" ON public.chat_mensagens;

ALTER TABLE public.chat_conversas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_mensagens ENABLE ROW LEVEL SECURITY;

-- Políticas de chat_conversas
CREATE POLICY "chat_conversas_select" ON public.chat_conversas FOR SELECT TO authenticated
USING (
  public.is_admin() OR 
  criado_por = auth.uid() OR
  EXISTS (SELECT 1 FROM public.chat_participantes cp WHERE cp.conversa_id = id AND cp.usuario_id = auth.uid())
);

CREATE POLICY "chat_conversas_insert" ON public.chat_conversas FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "chat_conversas_update" ON public.chat_conversas FOR UPDATE TO authenticated
USING (public.is_admin());

-- Políticas de chat_participantes
CREATE POLICY "chat_participantes_select" ON public.chat_participantes FOR SELECT TO authenticated
USING (
  public.is_admin() OR 
  EXISTS (SELECT 1 FROM public.chat_participantes cp WHERE cp.conversa_id = conversa_id AND cp.usuario_id = auth.uid())
);

CREATE POLICY "chat_participantes_insert" ON public.chat_participantes FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "chat_participantes_update" ON public.chat_participantes FOR UPDATE TO authenticated
USING (usuario_id = auth.uid() OR public.is_admin());

-- Políticas de chat_mensagens
CREATE POLICY "chat_mensagens_select" ON public.chat_mensagens FOR SELECT TO authenticated
USING (
  public.is_admin() OR 
  EXISTS (SELECT 1 FROM public.chat_participantes cp WHERE cp.conversa_id = conversa_id AND cp.usuario_id = auth.uid())
);

CREATE POLICY "chat_mensagens_insert" ON public.chat_mensagens FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.chat_participantes cp WHERE cp.conversa_id = conversa_id AND cp.usuario_id = auth.uid())
);

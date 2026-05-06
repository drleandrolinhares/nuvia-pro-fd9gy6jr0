-- Remover políticas problemáticas que causam recursão infinita e impedem o carregamento dos chats

-- 1. Tabela chat_participantes
DROP POLICY IF EXISTS "chat_participantes_select" ON public.chat_participantes;
CREATE POLICY "chat_participantes_select" ON public.chat_participantes
  FOR SELECT TO authenticated
  USING (true);

-- 2. Tabela chat_conversas
DROP POLICY IF EXISTS "chat_conversas_select" ON public.chat_conversas;
CREATE POLICY "chat_conversas_select" ON public.chat_conversas
  FOR SELECT TO authenticated
  USING (true);

-- 3. Tabela chat_mensagens
DROP POLICY IF EXISTS "chat_mensagens_select" ON public.chat_mensagens;
CREATE POLICY "chat_mensagens_select" ON public.chat_mensagens
  FOR SELECT TO authenticated
  USING (
    is_admin() OR 
    conversa_id IN (
      SELECT conversa_id FROM public.chat_participantes WHERE usuario_id = auth.uid()
    )
  );

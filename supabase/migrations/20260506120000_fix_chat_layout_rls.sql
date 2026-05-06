DO $$
BEGIN
  -- Corrige politicas RLS do chat que estavam permitindo cp.conversa_id = cp.conversa_id
  DROP POLICY IF EXISTS "chat_mensagens_insert" ON public.chat_mensagens;
  CREATE POLICY "chat_mensagens_insert" ON public.chat_mensagens
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (
      SELECT 1 FROM public.chat_participantes cp
      WHERE cp.conversa_id = chat_mensagens.conversa_id
      AND cp.usuario_id = auth.uid()
    ));

  DROP POLICY IF EXISTS "chat_mensagens_select" ON public.chat_mensagens;
  CREATE POLICY "chat_mensagens_select" ON public.chat_mensagens
    FOR SELECT TO authenticated
    USING (
      public.is_admin() OR EXISTS (
        SELECT 1 FROM public.chat_participantes cp
        WHERE cp.conversa_id = chat_mensagens.conversa_id
        AND cp.usuario_id = auth.uid()
      )
    );
END $$;

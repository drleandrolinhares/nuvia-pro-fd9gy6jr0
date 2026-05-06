DO $$
BEGIN
  -- Fix chat_mensagens insert policy to be more robust
  DROP POLICY IF EXISTS "chat_mensagens_insert" ON public.chat_mensagens;
  CREATE POLICY "chat_mensagens_insert" ON public.chat_mensagens
    FOR INSERT TO authenticated
    WITH CHECK (
      remetente_id = auth.uid() 
      AND (
        public.is_admin() OR
        EXISTS (
          SELECT 1 FROM public.chat_participantes cp 
          WHERE cp.conversa_id = chat_mensagens.conversa_id 
          AND cp.usuario_id = auth.uid()
        )
      )
    );

  -- Fix chat_participantes update policy to allow reading/updating own read status reliably
  DROP POLICY IF EXISTS "chat_participantes_update" ON public.chat_participantes;
  CREATE POLICY "chat_participantes_update" ON public.chat_participantes
    FOR UPDATE TO authenticated
    USING (usuario_id = auth.uid() OR public.is_admin())
    WITH CHECK (usuario_id = auth.uid() OR public.is_admin());
    
  -- Fix chat_conversas insert policy 
  DROP POLICY IF EXISTS "chat_conversas_insert" ON public.chat_conversas;
  CREATE POLICY "chat_conversas_insert" ON public.chat_conversas
    FOR INSERT TO authenticated
    WITH CHECK (true);
END $$;

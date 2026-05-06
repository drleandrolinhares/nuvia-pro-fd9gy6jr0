DO $DO$
BEGIN
  -- Fix RLS for chat_mensagens to ensure remetente_id is correct and prevent silent failures
  DROP POLICY IF EXISTS "chat_mensagens_insert" ON public.chat_mensagens;
  CREATE POLICY "chat_mensagens_insert" ON public.chat_mensagens
    FOR INSERT TO authenticated
    WITH CHECK (
      remetente_id = auth.uid() AND
      EXISTS (
        SELECT 1 FROM public.chat_participantes cp
        WHERE cp.conversa_id = chat_mensagens.conversa_id
        AND cp.usuario_id = auth.uid()
      )
    );
    
  -- Update the update policy for chat_participantes as well, just in case
  DROP POLICY IF EXISTS "chat_participantes_update" ON public.chat_participantes;
  CREATE POLICY "chat_participantes_update" ON public.chat_participantes
    FOR UPDATE TO authenticated
    USING (usuario_id = auth.uid() OR public.is_admin())
    WITH CHECK (usuario_id = auth.uid() OR public.is_admin());
END $DO$;

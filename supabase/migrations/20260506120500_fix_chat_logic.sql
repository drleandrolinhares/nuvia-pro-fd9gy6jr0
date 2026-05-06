DO $DO$
BEGIN
  -- Fix RLS for chat_conversas
  DROP POLICY IF EXISTS "chat_conversas_select" ON public.chat_conversas;
  CREATE POLICY "chat_conversas_select" ON public.chat_conversas
    FOR SELECT TO authenticated
    USING (
      public.is_admin() OR 
      (criado_por = auth.uid()) OR 
      EXISTS (
        SELECT 1 FROM public.chat_participantes cp
        WHERE cp.conversa_id = chat_conversas.id
        AND cp.usuario_id = auth.uid()
      )
    );

  DROP POLICY IF EXISTS "chat_conversas_insert" ON public.chat_conversas;
  CREATE POLICY "chat_conversas_insert" ON public.chat_conversas
    FOR INSERT TO authenticated
    WITH CHECK (true);

  DROP POLICY IF EXISTS "chat_conversas_update" ON public.chat_conversas;
  CREATE POLICY "chat_conversas_update" ON public.chat_conversas
    FOR UPDATE TO authenticated
    USING (public.is_admin() OR criado_por = auth.uid());

  -- Fix RLS for chat_participantes
  DROP POLICY IF EXISTS "chat_participantes_select" ON public.chat_participantes;
  CREATE POLICY "chat_participantes_select" ON public.chat_participantes
    FOR SELECT TO authenticated
    USING (
      public.is_admin() OR 
      EXISTS (
        SELECT 1 FROM public.chat_participantes cp
        WHERE cp.conversa_id = chat_participantes.conversa_id
        AND cp.usuario_id = auth.uid()
      )
    );

  DROP POLICY IF EXISTS "chat_participantes_insert" ON public.chat_participantes;
  CREATE POLICY "chat_participantes_insert" ON public.chat_participantes
    FOR INSERT TO authenticated
    WITH CHECK (true);

  DROP POLICY IF EXISTS "chat_participantes_update" ON public.chat_participantes;
  CREATE POLICY "chat_participantes_update" ON public.chat_participantes
    FOR UPDATE TO authenticated
    USING (usuario_id = auth.uid() OR public.is_admin());

  -- Fix RLS for chat_mensagens
  DROP POLICY IF EXISTS "chat_mensagens_select" ON public.chat_mensagens;
  CREATE POLICY "chat_mensagens_select" ON public.chat_mensagens
    FOR SELECT TO authenticated
    USING (
      public.is_admin() OR 
      EXISTS (
        SELECT 1 FROM public.chat_participantes cp
        WHERE cp.conversa_id = chat_mensagens.conversa_id
        AND cp.usuario_id = auth.uid()
      )
    );

  DROP POLICY IF EXISTS "chat_mensagens_insert" ON public.chat_mensagens;
  CREATE POLICY "chat_mensagens_insert" ON public.chat_mensagens
    FOR INSERT TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.chat_participantes cp
        WHERE cp.conversa_id = chat_mensagens.conversa_id
        AND cp.usuario_id = auth.uid()
      )
    );

END $DO$;

CREATE OR REPLACE FUNCTION public.get_or_create_direct_chat(target_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $FUNC$
DECLARE
  v_chat_id uuid;
  v_current_user uuid := auth.uid();
BEGIN
  IF v_current_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Tenta encontrar uma conversa individual existente entre os dois usuários
  SELECT c.id INTO v_chat_id
  FROM public.chat_conversas c
  JOIN public.chat_participantes p1 ON p1.conversa_id = c.id AND p1.usuario_id = v_current_user
  JOIN public.chat_participantes p2 ON p2.conversa_id = c.id AND p2.usuario_id = target_user_id
  WHERE c.tipo = 'individual'
  LIMIT 1;

  -- Se não encontrou, cria uma nova
  IF v_chat_id IS NULL THEN
    INSERT INTO public.chat_conversas (tipo, criado_por)
    VALUES ('individual', v_current_user)
    RETURNING id INTO v_chat_id;

    INSERT INTO public.chat_participantes (conversa_id, usuario_id)
    VALUES 
      (v_chat_id, v_current_user),
      (v_chat_id, target_user_id);
  END IF;

  RETURN v_chat_id;
END;
$FUNC$;

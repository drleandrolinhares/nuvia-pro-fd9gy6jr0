-- Simplificação das políticas de segurança para o chat interno

-- 1. Tabela chat_mensagens: Permite que qualquer usuário autenticado envie mensagens como ele mesmo
DROP POLICY IF EXISTS "chat_mensagens_insert" ON public.chat_mensagens;
CREATE POLICY "chat_mensagens_insert" ON public.chat_mensagens 
  FOR INSERT TO authenticated 
  WITH CHECK (remetente_id = auth.uid());

-- 2. Tabela chat_participantes: Simplifica a inserção e atualização de leitura
DROP POLICY IF EXISTS "chat_participantes_insert" ON public.chat_participantes;
CREATE POLICY "chat_participantes_insert" ON public.chat_participantes
  FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "chat_participantes_update" ON public.chat_participantes;
CREATE POLICY "chat_participantes_update" ON public.chat_participantes
  FOR UPDATE TO authenticated
  USING (usuario_id = auth.uid() OR is_admin())
  WITH CHECK (usuario_id = auth.uid() OR is_admin());

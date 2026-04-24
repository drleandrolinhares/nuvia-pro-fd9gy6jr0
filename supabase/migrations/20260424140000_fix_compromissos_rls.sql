-- Ajuste de RLS para a tabela de compromissos conforme solicitado
-- Permite que usuários com a permissão geral do módulo ('operacional_comunicados')
-- ou permissões específicas possam inserir, atualizar e deletar seus próprios registros.

DROP POLICY IF EXISTS "compromissos_insert" ON public.compromissos;
CREATE POLICY "compromissos_insert" ON public.compromissos
  FOR INSERT TO authenticated
  WITH CHECK (
    usuario_id = auth.uid() OR
    has_permission('Criar Compromissos') OR
    has_permission('Gerenciar Compromissos') OR
    has_permission('operacional_comunicados') OR
    is_admin()
  );

DROP POLICY IF EXISTS "compromissos_update" ON public.compromissos;
CREATE POLICY "compromissos_update" ON public.compromissos
  FOR UPDATE TO authenticated
  USING (
    usuario_id = auth.uid() OR
    has_permission('Editar Compromissos') OR
    has_permission('Gerenciar Compromissos') OR
    has_permission('operacional_comunicados') OR
    is_admin()
  )
  WITH CHECK (
    usuario_id = auth.uid() OR
    has_permission('Editar Compromissos') OR
    has_permission('Gerenciar Compromissos') OR
    has_permission('operacional_comunicados') OR
    is_admin()
  );

DROP POLICY IF EXISTS "compromissos_delete" ON public.compromissos;
CREATE POLICY "compromissos_delete" ON public.compromissos
  FOR DELETE TO authenticated
  USING (
    usuario_id = auth.uid() OR
    has_permission('Excluir Compromissos') OR
    has_permission('Gerenciar Compromissos') OR
    has_permission('operacional_comunicados') OR
    is_admin()
  );

-- Adiciona permissões granulares para os submódulos de Comunicados
INSERT INTO public.permissoes (id, nome, modulo, descricao) VALUES
  (gen_random_uuid(), 'Visualizar Todos Compromissos', 'Comunicados', 'Permite visualizar compromissos de toda a equipe'),
  (gen_random_uuid(), 'Criar Compromissos', 'Comunicados', 'Permite criar compromissos para outros colaboradores'),
  (gen_random_uuid(), 'Editar Compromissos', 'Comunicados', 'Permite editar compromissos de outros colaboradores'),
  (gen_random_uuid(), 'Excluir Compromissos', 'Comunicados', 'Permite excluir compromissos de outros colaboradores'),
  (gen_random_uuid(), 'Gerenciar Compromissos', 'Comunicados', 'Acesso total (Criar, Editar, Excluir, Visualizar) a todos os compromissos'),
  (gen_random_uuid(), 'Gerenciar Normas Internas', 'Comunicados', 'Permite criar, editar e excluir normas internas')
ON CONFLICT (nome) DO NOTHING;

-- Recria as políticas RLS para Compromissos com as novas permissões
DROP POLICY IF EXISTS "compromissos_all" ON public.compromissos;
DROP POLICY IF EXISTS "compromissos_select" ON public.compromissos;
DROP POLICY IF EXISTS "compromissos_insert" ON public.compromissos;
DROP POLICY IF EXISTS "compromissos_update" ON public.compromissos;
DROP POLICY IF EXISTS "compromissos_delete" ON public.compromissos;

CREATE POLICY "compromissos_select" ON public.compromissos
  FOR SELECT TO authenticated USING (
    usuario_id = auth.uid() OR
    has_permission('Visualizar Todos Compromissos') OR
    has_permission('Gerenciar Compromissos') OR
    is_admin()
  );

CREATE POLICY "compromissos_insert" ON public.compromissos
  FOR INSERT TO authenticated WITH CHECK (
    usuario_id = auth.uid() OR
    has_permission('Criar Compromissos') OR
    has_permission('Gerenciar Compromissos') OR
    is_admin()
  );

CREATE POLICY "compromissos_update" ON public.compromissos
  FOR UPDATE TO authenticated USING (
    usuario_id = auth.uid() OR
    has_permission('Editar Compromissos') OR
    has_permission('Gerenciar Compromissos') OR
    is_admin()
  ) WITH CHECK (
    usuario_id = auth.uid() OR
    has_permission('Editar Compromissos') OR
    has_permission('Gerenciar Compromissos') OR
    is_admin()
  );

CREATE POLICY "compromissos_delete" ON public.compromissos
  FOR DELETE TO authenticated USING (
    usuario_id = auth.uid() OR
    has_permission('Excluir Compromissos') OR
    has_permission('Gerenciar Compromissos') OR
    is_admin()
  );

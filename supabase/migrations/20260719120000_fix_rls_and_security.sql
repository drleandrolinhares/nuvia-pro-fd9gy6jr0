-- =====================================================
-- 1. Ensure is_admin function is correct and comprehensive
-- =====================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = auth.uid()
    AND (
      LOWER(COALESCE(role, '')) IN ('admin', 'administrador', 'ceo', 'diretoria', 'diretor', 'gestor')
      OR email = 'drleandrolinhares@gmail.com'
    )
  );
$$;

-- =====================================================
-- 2. Create is_active_user helper for RLS policies
-- =====================================================
CREATE OR REPLACE FUNCTION public.is_active_user()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = auth.uid()
    AND COALESCE(status, 'ativo') = 'ativo'
  );
$$;

-- =====================================================
-- 3. Fix usuarios RLS - allow all authenticated to read,
--    admins full CRUD, users to update own record
-- =====================================================
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "usuarios_select_own" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_select_all" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_update_own" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_admin_all" ON public.usuarios;

-- All authenticated users can read all usuarios (needed for user management)
CREATE POLICY "usuarios_select_all" ON public.usuarios
  FOR SELECT TO authenticated USING (true);

-- Users can update their own record (e.g., force_password_change)
CREATE POLICY "usuarios_update_own" ON public.usuarios
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admins have full access to all usuarios
CREATE POLICY "usuarios_admin_all" ON public.usuarios
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =====================================================
-- 4. Fix permissoes RLS - read for all, write for admins
-- =====================================================
ALTER TABLE public.permissoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "permissoes_select" ON public.permissoes;
DROP POLICY IF EXISTS "permissoes_insert" ON public.permissoes;
DROP POLICY IF EXISTS "permissoes_update" ON public.permissoes;
DROP POLICY IF EXISTS "permissoes_delete" ON public.permissoes;

CREATE POLICY "permissoes_select" ON public.permissoes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "permissoes_insert" ON public.permissoes
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

CREATE POLICY "permissoes_update" ON public.permissoes
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "permissoes_delete" ON public.permissoes
  FOR DELETE TO authenticated USING (public.is_admin());

-- =====================================================
-- 5. Fix usuario_permissoes RLS - read for all, write for admins
-- =====================================================
ALTER TABLE public.usuario_permissoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "usuario_permissoes_select" ON public.usuario_permissoes;
DROP POLICY IF EXISTS "usuario_permissoes_insert" ON public.usuario_permissoes;
DROP POLICY IF EXISTS "usuario_permissoes_update" ON public.usuario_permissoes;
DROP POLICY IF EXISTS "usuario_permissoes_delete" ON public.usuario_permissoes;

CREATE POLICY "usuario_permissoes_select" ON public.usuario_permissoes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "usuario_permissoes_insert" ON public.usuario_permissoes
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

CREATE POLICY "usuario_permissoes_update" ON public.usuario_permissoes
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "usuario_permissoes_delete" ON public.usuario_permissoes
  FOR DELETE TO authenticated USING (public.is_admin());

-- =====================================================
-- 6. Update has_permission to check active status
-- =====================================================
CREATE OR REPLACE FUNCTION public.has_permission(permission_name TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    public.is_admin()
    OR (
      public.is_active_user()
      AND EXISTS (
        SELECT 1
        FROM public.usuario_permissoes up
        JOIN public.permissoes p ON up.permissao_id = p.id
        WHERE up.usuario_id = auth.uid()
        AND p.slug = permission_name
      )
    );
$$;

-- =====================================================
-- 7. Ensure get_user_permissions works correctly
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_user_permissions(p_user_id UUID DEFAULT NULL)
RETURNS TEXT[]
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(array_agg(p.slug), ARRAY[]::text[])
  FROM public.usuario_permissoes up
  JOIN public.permissoes p ON up.permissao_id = p.id
  WHERE up.usuario_id = COALESCE(p_user_id, auth.uid());
$$;

-- =====================================================
-- 8. Ensure force_password_change column exists
-- =====================================================
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS force_password_change BOOLEAN DEFAULT false;

-- =====================================================
-- 9. Ensure permissoes table has slug column populated
--    (slug should match nome for has_permission lookups)
-- =====================================================
UPDATE public.permissoes
SET slug = nome
WHERE slug IS NULL OR slug = '';

-- =====================================================
-- 10. Seed any missing permissions (idempotent)
-- =====================================================
INSERT INTO public.permissoes (nome, slug, modulo, ordem) VALUES
  ('Acessar Dashboard', 'Acessar Dashboard', 'Dashboard', 1),
  ('Acessar Chat', 'Acessar Chat', 'Comunicação', 2),
  ('Acessar Estoque', 'Acessar Estoque', 'Estoque', 3),
  ('Acessar Parâmetros Gerais', 'Acessar Parâmetros Gerais', 'Configurações', 4),
  ('Acessar Usuários', 'Acessar Usuários', 'Configurações', 5),
  ('Acessar Fornecedores', 'Acessar Fornecedores', 'Estoque', 6),
  ('Acessar Cadastros Básicos', 'Acessar Cadastros Básicos', 'Administração', 7),
  ('Acessar Registro de Usuários', 'Acessar Registro de Usuários', 'Administração', 8),
  ('Acessar Configurações de Rotinas', 'Acessar Configurações de Rotinas', 'Configurações', 9),
  ('Acessar Descontos', 'Acessar Descontos', 'Configurações', 10),
  ('Acessar Faixas', 'Acessar Faixas', 'Configurações', 11),
  ('Acessar Smart Lock', 'Acessar Smart Lock', 'Configurações', 12),
  ('Acessar Controle de Acesso', 'Acessar Controle de Acesso', 'Configurações', 13),
  ('Acessar Performance', 'Acessar Performance', 'Intranet', 14),
  ('Acessar Onboarding', 'Acessar Onboarding', 'Intranet', 15),
  ('Acessar Treinamentos', 'Acessar Treinamentos', 'Intranet', 16),
  ('Acessar Pedidos', 'Acessar Pedidos', 'Operacional', 17),
  ('Acessar SAC', 'Acessar SAC', 'Operacional', 18),
  ('Acessar Rotina Diária', 'Acessar Rotina Diária', 'Operacional', 19),
  ('Acessar FET', 'Acessar FET', 'Operacional', 20),
  ('Acessar Comunicados', 'Acessar Comunicados', 'Operacional', 21),
  ('Acessar Gestão de Terceiros', 'Acessar Gestão de Terceiros', 'Operacional', 22),
  ('Acessar Precificação', 'Acessar Precificação', 'Administrativo', 23),
  ('Acessar Pro Agenda', 'Acessar Pro Agenda', 'Diretrizes', 24),
  ('Acessar Roteiros', 'Acessar Roteiros', 'Diretrizes', 25),
  ('Acessar Funil de Vendas', 'Acessar Funil de Vendas', 'Comercial', 26),
  ('Acessar Gestão de Vendas', 'Acessar Gestão de Vendas', 'Comercial', 27),
  ('Acessar Negociações', 'Acessar Negociações', 'Comercial', 28),
  ('Acessar Controle de Comissões', 'Acessar Controle de Comissões', 'Comercial', 29),
  ('Acessar Pacientes', 'Acessar Pacientes', 'Comercial', 30),
  ('Acessar Gestão Fiscal', 'Acessar Gestão Fiscal', 'Financeiro', 31),
  ('Gerenciar Colaboradores', 'Gerenciar Colaboradores', 'Administração', 32)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- 11. Ensure all non-admin users have basic permissions (idempotent)
--     This preserves current access during migration
-- =====================================================
INSERT INTO public.usuario_permissoes (usuario_id, permissao_id)
SELECT u.id, p.id
FROM public.usuarios u
CROSS JOIN public.permissoes p
WHERE u.id IS NOT NULL
AND COALESCE(u.status, 'ativo') = 'ativo'
AND NOT (
  LOWER(COALESCE(u.role, '')) IN ('admin', 'administrador', 'ceo', 'diretoria', 'diretor', 'gestor')
  OR u.email = 'drleandrolinhares@gmail.com'
)
AND NOT EXISTS (
  SELECT 1 FROM public.usuario_permissoes up
  WHERE up.usuario_id = u.id AND up.permissao_id = p.id
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 12. Fix configuracoes_acesso RLS for admin management
-- =====================================================
DROP POLICY IF EXISTS "configuracoes_acesso_select" ON public.configuracoes_acesso;
DROP POLICY IF EXISTS "configuracoes_acesso_insert" ON public.configuracoes_acesso;
DROP POLICY IF EXISTS "configuracoes_acesso_update" ON public.configuracoes_acesso;
DROP POLICY IF EXISTS "configuracoes_acesso_delete" ON public.configuracoes_acesso;

CREATE POLICY "configuracoes_acesso_select" ON public.configuracoes_acesso
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "configuracoes_acesso_insert" ON public.configuracoes_acesso
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

CREATE POLICY "configuracoes_acesso_update" ON public.configuracoes_acesso
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "configuracoes_acesso_delete" ON public.configuracoes_acesso
  FOR DELETE TO authenticated USING (public.is_admin());

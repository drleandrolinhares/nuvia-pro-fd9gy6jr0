-- 1. Create permissoes table (system modules/menus)
CREATE TABLE IF NOT EXISTS public.permissoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  modulo TEXT,
  descricao TEXT,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create usuario_permissoes join table
CREATE TABLE IF NOT EXISTS public.usuario_permissoes (
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
  permissao_id UUID REFERENCES public.permissoes(id) ON DELETE CASCADE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (usuario_id, permissao_id)
);

-- 3. Add force_password_change column
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS force_password_change BOOLEAN DEFAULT false;

-- 4. Enable RLS on new tables
ALTER TABLE public.permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuario_permissoes ENABLE ROW LEVEL SECURITY;

-- 5. RLS policies for permissoes
DROP POLICY IF EXISTS "permissoes_select" ON public.permissoes;
CREATE POLICY "permissoes_select" ON public.permissoes FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "permissoes_insert" ON public.permissoes;
CREATE POLICY "permissoes_insert" ON public.permissoes FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "permissoes_update" ON public.permissoes;
CREATE POLICY "permissoes_update" ON public.permissoes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "permissoes_delete" ON public.permissoes;
CREATE POLICY "permissoes_delete" ON public.permissoes FOR DELETE TO authenticated USING (true);

-- 6. RLS policies for usuario_permissoes
DROP POLICY IF EXISTS "usuario_permissoes_select" ON public.usuario_permissoes;
CREATE POLICY "usuario_permissoes_select" ON public.usuario_permissoes FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "usuario_permissoes_insert" ON public.usuario_permissoes;
CREATE POLICY "usuario_permissoes_insert" ON public.usuario_permissoes FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "usuario_permissoes_update" ON public.usuario_permissoes;
CREATE POLICY "usuario_permissoes_update" ON public.usuario_permissoes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "usuario_permissoes_delete" ON public.usuario_permissoes;
CREATE POLICY "usuario_permissoes_delete" ON public.usuario_permissoes FOR DELETE TO authenticated USING (true);

-- 7. Update is_admin function to properly check user role
DROP FUNCTION IF EXISTS public.is_admin();
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

-- 8. Update has_permission function to check permissions table
DROP FUNCTION IF EXISTS public.has_permission(text);
CREATE OR REPLACE FUNCTION public.has_permission(permission_name TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    public.is_admin()
    OR EXISTS (
      SELECT 1
      FROM public.usuario_permissoes up
      JOIN public.permissoes p ON up.permissao_id = p.id
      WHERE up.usuario_id = auth.uid()
      AND p.slug = permission_name
    );
$$;

-- 9. Update get_user_permissions to return actual permission slugs
DROP FUNCTION IF EXISTS public.get_user_permissions(uuid);
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

-- 10. Seed permissions table with all system menus
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

-- 11. Seed all existing non-admin users with all permissions (preserve current access)
INSERT INTO public.usuario_permissoes (usuario_id, permissao_id)
SELECT u.id, p.id
FROM public.usuarios u
CROSS JOIN public.permissoes p
WHERE u.id IS NOT NULL
AND NOT (
  LOWER(COALESCE(u.role, '')) IN ('admin', 'administrador', 'ceo', 'diretoria', 'diretor', 'gestor')
  OR u.email = 'drleandrolinhares@gmail.com'
)
AND NOT EXISTS (
  SELECT 1 FROM public.usuario_permissoes up
  WHERE up.usuario_id = u.id AND up.permissao_id = p.id
)
ON CONFLICT DO NOTHING;

-- 12. Seed admin user in auth.users if not exists
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'drleandrolinhares@gmail.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'drleandrolinhares@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Dr. Leandro Linhares"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.usuarios (id, email, nome, role, status)
    VALUES (new_user_id, 'drleandrolinhares@gmail.com', 'Dr. Leandro Linhares', 'admin', 'ativo')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

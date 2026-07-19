-- Ensure usuario_permissoes table exists
CREATE TABLE IF NOT EXISTS public.usuario_permissoes (
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
  permissao_id UUID REFERENCES public.permissoes(id) ON DELETE CASCADE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  tenant_id UUID DEFAULT public.get_my_tenant_id(),
  PRIMARY KEY (usuario_id, permissao_id)
);

-- Ensure force_password_change column exists
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS force_password_change BOOLEAN DEFAULT false;

-- Enable RLS on permission tables
ALTER TABLE public.permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuario_permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cargo_permissoes ENABLE ROW LEVEL SECURITY;

-- RLS: permissoes - authenticated can read
DROP POLICY IF EXISTS "permissoes_select" ON public.permissoes;
CREATE POLICY "permissoes_select" ON public.permissoes FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "permissoes_insert" ON public.permissoes;
CREATE POLICY "permissoes_insert" ON public.permissoes FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "permissoes_update" ON public.permissoes;
CREATE POLICY "permissoes_update" ON public.permissoes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "permissoes_delete" ON public.permissoes;
CREATE POLICY "permissoes_delete" ON public.permissoes FOR DELETE TO authenticated USING (true);

-- RLS: usuario_permissoes - authenticated can read
DROP POLICY IF EXISTS "usuario_permissoes_select" ON public.usuario_permissoes;
CREATE POLICY "usuario_permissoes_select" ON public.usuario_permissoes FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "usuario_permissoes_insert" ON public.usuario_permissoes;
CREATE POLICY "usuario_permissoes_insert" ON public.usuario_permissoes FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "usuario_permissoes_update" ON public.usuario_permissoes;
CREATE POLICY "usuario_permissoes_update" ON public.usuario_permissoes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "usuario_permissoes_delete" ON public.usuario_permissoes;
CREATE POLICY "usuario_permissoes_delete" ON public.usuario_permissoes FOR DELETE TO authenticated USING (true);

-- RLS: cargo_permissoes - authenticated can read
DROP POLICY IF EXISTS "cargo_permissoes_select" ON public.cargo_permissoes;
CREATE POLICY "cargo_permissoes_select" ON public.cargo_permissoes FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "cargo_permissoes_insert" ON public.cargo_permissoes;
CREATE POLICY "cargo_permissoes_insert" ON public.cargo_permissoes FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "cargo_permissoes_update" ON public.cargo_permissoes;
CREATE POLICY "cargo_permissoes_update" ON public.cargo_permissoes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "cargo_permissoes_delete" ON public.cargo_permissoes;
CREATE POLICY "cargo_permissoes_delete" ON public.cargo_permissoes FOR DELETE TO authenticated USING (true);

-- RLS: cargos - authenticated can read
DROP POLICY IF EXISTS "cargos_select" ON public.cargos;
CREATE POLICY "cargos_select" ON public.cargos FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "cargos_insert" ON public.cargos;
CREATE POLICY "cargos_insert" ON public.cargos FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "cargos_update" ON public.cargos;
CREATE POLICY "cargos_update" ON public.cargos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "cargos_delete" ON public.cargos;
CREATE POLICY "cargos_delete" ON public.cargos FOR DELETE TO authenticated USING (true);

-- RLS: configuracoes_acesso - authenticated can read
DROP POLICY IF EXISTS "configuracoes_acesso_select" ON public.configuracoes_acesso;
CREATE POLICY "configuracoes_acesso_select" ON public.configuracoes_acesso FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "configuracoes_acesso_insert" ON public.configuracoes_acesso;
CREATE POLICY "configuracoes_acesso_insert" ON public.configuracoes_acesso FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "configuracoes_acesso_update" ON public.configuracoes_acesso;
CREATE POLICY "configuracoes_acesso_update" ON public.configuracoes_acesso FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Updated is_admin() with cargo name checks
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_role text;
  v_cargo_principal_nome text;
  v_cargo_secundario_nome text;
BEGIN
  IF v_uid IS NULL THEN RETURN false; END IF;
  BEGIN
    IF COALESCE((auth.jwt() -> 'app_metadata' ->> 'is_super_admin')::boolean, false) THEN
      RETURN true;
    END IF;
    IF (auth.jwt() ->> 'email') = 'drleandrolinhares@gmail.com' THEN
      RETURN true;
    END IF;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  SELECT LOWER(COALESCE(u.role, '')),
         LOWER(COALESCE(cp.nome, '')),
         LOWER(COALESCE(cs.nome, ''))
  INTO v_role, v_cargo_principal_nome, v_cargo_secundario_nome
  FROM public.usuarios u
  LEFT JOIN public.cargos cp ON u.cargo_id = cp.id
  LEFT JOIN public.cargos cs ON u.cargo_secundario_id = cs.id
  WHERE u.id = v_uid;
  IF v_role IN ('admin', 'administrador', 'ceo', 'diretoria', 'diretor', 'gestor', 'master') THEN
    RETURN true;
  END IF;
  IF v_cargo_principal_nome IN ('admin', 'administrador', 'ceo', 'diretoria', 'diretor', 'gestor') THEN
    RETURN true;
  END IF;
  IF v_cargo_secundario_nome IN ('admin', 'administrador', 'ceo', 'diretoria', 'diretor', 'gestor') THEN
    RETURN true;
  END IF;
  RETURN false;
END;
$$;

-- Create is_tenant_admin() as alias for is_admin (tenant-scoped admin check)
CREATE OR REPLACE FUNCTION public.is_tenant_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN public.is_admin();
END;
$$;

-- Updated is_active_user()
CREATE OR REPLACE FUNCTION public.is_active_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = auth.uid() AND COALESCE(status, 'ativo') = 'ativo'
  );
$$;

-- Updated get_user_permissions with both cargo_id and cargo_secundario_id
DROP FUNCTION IF EXISTS public.get_user_permissions(uuid);
CREATE OR REPLACE FUNCTION public.get_user_permissions(p_user_id uuid DEFAULT NULL)
RETURNS text[]
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_user_id uuid := COALESCE(p_user_id, auth.uid());
  v_perms text[];
  v_adm boolean;
BEGIN
  IF v_user_id IS NULL THEN RETURN ARRAY[]::text[]; END IF;
  SELECT public.is_admin() OR COALESCE(public.is_tenant_admin(), false) INTO v_adm;
  IF v_adm THEN
    SELECT COALESCE(array_agg(DISTINCT nome), ARRAY[]::text[]) INTO v_perms
    FROM public.permissoes WHERE ativo = true;
    RETURN v_perms;
  END IF;
  BEGIN
    SELECT COALESCE(array_agg(DISTINCT perm_name), ARRAY[]::text[]) INTO v_perms
    FROM (
      SELECT p.nome AS perm_name FROM public.usuario_permissoes up
      JOIN public.permissoes p ON up.permissao_id = p.id
      WHERE up.usuario_id = v_user_id AND p.ativo = true
      UNION
      SELECT p.nome AS perm_name FROM public.cargo_permissoes cp
      JOIN public.permissoes p ON cp.permissao_id = p.id
      JOIN public.usuarios u ON (cp.cargo_id = u.cargo_id OR cp.cargo_id = u.cargo_secundario_id)
      WHERE u.id = v_user_id AND p.ativo = true
    ) combined;
  EXCEPTION WHEN OTHERS THEN
    BEGIN
      SELECT COALESCE(array_agg(DISTINCT p.nome), ARRAY[]::text[]) INTO v_perms
      FROM public.usuario_permissoes up
      JOIN public.permissoes p ON up.permissao_id = p.id
      WHERE up.usuario_id = v_user_id AND p.ativo = true;
    EXCEPTION WHEN OTHERS THEN
      v_perms := ARRAY[]::text[];
    END;
  END;
  RETURN COALESCE(v_perms, ARRAY[]::text[]);
END;
$$;

-- Updated has_permission with is_tenant_admin check
CREATE OR REPLACE FUNCTION public.has_permission(permission_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  IF public.is_admin() OR COALESCE(public.is_tenant_admin(), false) THEN RETURN true; END IF;
  IF NOT public.is_active_user() THEN RETURN false; END IF;
  IF EXISTS (
    SELECT 1 FROM public.usuario_permissoes up
    JOIN public.permissoes p ON up.permissao_id = p.id
    WHERE up.usuario_id = auth.uid() AND p.nome = permission_name AND p.ativo = true
  ) THEN RETURN true; END IF;
  BEGIN
    IF EXISTS (
      SELECT 1 FROM public.cargo_permissoes cp
      JOIN public.permissoes p ON cp.permissao_id = p.id
      JOIN public.usuarios u ON (cp.cargo_id = u.cargo_id OR cp.cargo_id = u.cargo_secundario_id)
      WHERE u.id = auth.uid() AND p.nome = permission_name AND p.ativo = true
    ) THEN RETURN true; END IF;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  RETURN false;
END;
$$;

-- Ensure seed permissions exist
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

-- Ensure admin user has admin role
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'drleandrolinhares@gmail.com';
  IF v_user_id IS NOT NULL THEN
    UPDATE public.usuarios SET role = 'admin', status = 'ativo' WHERE id = v_user_id;
    INSERT INTO public.usuario_permissoes (usuario_id, permissao_id)
    SELECT v_user_id, p.id FROM public.permissoes p WHERE p.ativo = true
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

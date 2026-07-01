-- Ensure unaccent_string exists for role normalization
CREATE OR REPLACE FUNCTION public.unaccent_string(input text)
  RETURNS text
  LANGUAGE sql
  IMMUTABLE
  STRICT
AS $$
  SELECT translate(
    COALESCE(input, ''),
    'áàâãäåāăąÁÀÂÃÄÅĀĂĄèéêëēĕėęěÉÈÊËĒĔĖĘĚìíîïìĩīĭÌÍÎÏÌĨĪĬóôõöōŏőÒÓÔÕÖŌŎŐùúûüũūŭůÙÚÛÜŨŪŬŮçÇñÑ',
    'aaaaaaaaaAAAAAAAAAeeeeeeeeeeeeEEEEEEEEEEEiiiiiiiiIIIIIIIIoooooooOOOOOOOOuuuuuuuuUUUUUUUUcCnN'
  );
$$;

-- Ensure is_super_admin exists
CREATE OR REPLACE FUNCTION public.is_super_admin() RETURNS BOOLEAN AS $$
DECLARE
  v_email text;
  v_is_super boolean;
BEGIN
  BEGIN
    v_email := current_setting('request.jwt.claims', true)::jsonb ->> 'email';
  EXCEPTION WHEN OTHERS THEN
    v_email := NULL;
  END;
  IF v_email IN ('drleandro@nuvia.com', 'drleandrolinhares@gmail.com') THEN
    RETURN true;
  END IF;
  SELECT is_super_admin INTO v_is_super FROM auth.users WHERE id = auth.uid();
  RETURN COALESCE(v_is_super, false);
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update is_admin to robustly handle all admin role variants
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN AS $$
DECLARE
  v_role text;
  v_email text;
BEGIN
  BEGIN
    v_email := current_setting('request.jwt.claims', true)::jsonb ->> 'email';
  EXCEPTION WHEN OTHERS THEN
    v_email := NULL;
  END;
  IF v_email IN ('drleandro@nuvia.com', 'drleandrolinhares@gmail.com') THEN
    RETURN true;
  END IF;
  SELECT role INTO v_role FROM public.usuarios WHERE id = auth.uid();
  IF v_role IS NULL THEN
    RETURN false;
  END IF;
  RETURN LOWER(public.unaccent_string(v_role)) IN (
    'admin', 'administrador', 'administradora', 'ceo',
    'socio', 'socia', 'gestor', 'gestora', 'diretor', 'diretora'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN LOWER(COALESCE(v_role, '')) IN ('admin', 'administrador', 'ceo', 'socio', 'gestor', 'diretor');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure tenant_id columns exist on permission tables
ALTER TABLE public.permissoes ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.get_my_tenant_id();
ALTER TABLE public.cargo_permissoes ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.get_my_tenant_id();
ALTER TABLE public.usuario_permissoes ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.get_my_tenant_id();

-- Ensure indexes for performance
CREATE INDEX IF NOT EXISTS idx_cargo_permissoes_cargo_id ON public.cargo_permissoes(cargo_id);
CREATE INDEX IF NOT EXISTS idx_cargo_permissoes_permissao_id ON public.cargo_permissoes(permissao_id);
CREATE INDEX IF NOT EXISTS idx_cargo_permissoes_tenant ON public.cargo_permissoes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_usuario_permissoes_usuario ON public.usuario_permissoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usuario_permissoes_tenant ON public.usuario_permissoes(tenant_id);

-- Ensure RLS is enabled
ALTER TABLE public.cargos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cargo_permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuario_permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colaboradores_detalhes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.especialidades ENABLE ROW LEVEL SECURITY;

-- ===== CARGOS =====
DROP POLICY IF EXISTS "cargos_select" ON public.cargos;
CREATE POLICY "cargos_select" ON public.cargos
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_my_tenant_id() OR tenant_id IS NULL OR public.is_super_admin());

DROP POLICY IF EXISTS "cargos_insert" ON public.cargos;
CREATE POLICY "cargos_insert" ON public.cargos
  FOR INSERT TO authenticated
  WITH CHECK ((tenant_id = public.get_my_tenant_id() AND public.is_admin()) OR public.is_super_admin());

DROP POLICY IF EXISTS "cargos_update" ON public.cargos;
CREATE POLICY "cargos_update" ON public.cargos
  FOR UPDATE TO authenticated
  USING ((tenant_id = public.get_my_tenant_id() AND public.is_admin()) OR public.is_super_admin())
  WITH CHECK ((tenant_id = public.get_my_tenant_id() AND public.is_admin()) OR public.is_super_admin());

DROP POLICY IF EXISTS "cargos_delete" ON public.cargos;
CREATE POLICY "cargos_delete" ON public.cargos
  FOR DELETE TO authenticated
  USING ((tenant_id = public.get_my_tenant_id() AND public.is_admin()) OR public.is_super_admin());

-- ===== PERMISSOES =====
DROP POLICY IF EXISTS "permissoes_select" ON public.permissoes;
CREATE POLICY "permissoes_select" ON public.permissoes
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_my_tenant_id() OR tenant_id IS NULL OR public.is_super_admin());

DROP POLICY IF EXISTS "permissoes_insert" ON public.permissoes;
CREATE POLICY "permissoes_insert" ON public.permissoes
  FOR INSERT TO authenticated
  WITH CHECK ((tenant_id = public.get_my_tenant_id() AND public.is_admin()) OR public.is_super_admin());

DROP POLICY IF EXISTS "permissoes_update" ON public.permissoes;
CREATE POLICY "permissoes_update" ON public.permissoes
  FOR UPDATE TO authenticated
  USING ((tenant_id = public.get_my_tenant_id() AND public.is_admin()) OR public.is_super_admin())
  WITH CHECK ((tenant_id = public.get_my_tenant_id() AND public.is_admin()) OR public.is_super_admin());

DROP POLICY IF EXISTS "permissoes_delete" ON public.permissoes;
CREATE POLICY "permissoes_delete" ON public.permissoes
  FOR DELETE TO authenticated
  USING ((tenant_id = public.get_my_tenant_id() AND public.is_admin()) OR public.is_super_admin());

-- ===== CARGO_PERMISSOES =====
DROP POLICY IF EXISTS "cargo_permissoes_select" ON public.cargo_permissoes;
CREATE POLICY "cargo_permissoes_select" ON public.cargo_permissoes
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_my_tenant_id() OR tenant_id IS NULL OR public.is_super_admin());

DROP POLICY IF EXISTS "cargo_permissoes_insert" ON public.cargo_permissoes;
CREATE POLICY "cargo_permissoes_insert" ON public.cargo_permissoes
  FOR INSERT TO authenticated
  WITH CHECK ((tenant_id = public.get_my_tenant_id() AND public.is_admin()) OR public.is_super_admin());

DROP POLICY IF EXISTS "cargo_permissoes_delete" ON public.cargo_permissoes;
CREATE POLICY "cargo_permissoes_delete" ON public.cargo_permissoes
  FOR DELETE TO authenticated
  USING ((tenant_id = public.get_my_tenant_id() AND public.is_admin()) OR public.is_super_admin());

-- ===== USUARIO_PERMISSOES =====
DROP POLICY IF EXISTS "usuario_permissoes_select" ON public.usuario_permissoes;
CREATE POLICY "usuario_permissoes_select" ON public.usuario_permissoes
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_my_tenant_id() OR tenant_id IS NULL OR public.is_super_admin());

DROP POLICY IF EXISTS "usuario_permissoes_insert" ON public.usuario_permissoes;
CREATE POLICY "usuario_permissoes_insert" ON public.usuario_permissoes
  FOR INSERT TO authenticated
  WITH CHECK ((tenant_id = public.get_my_tenant_id() AND public.is_admin()) OR public.is_super_admin());

DROP POLICY IF EXISTS "usuario_permissoes_delete" ON public.usuario_permissoes;
CREATE POLICY "usuario_permissoes_delete" ON public.usuario_permissoes
  FOR DELETE TO authenticated
  USING ((tenant_id = public.get_my_tenant_id() AND public.is_admin()) OR public.is_super_admin());

-- ===== COLABORADORES_DETALHES =====
DROP POLICY IF EXISTS "colaboradores_detalhes_select" ON public.colaboradores_detalhes;
CREATE POLICY "colaboradores_detalhes_select" ON public.colaboradores_detalhes
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_my_tenant_id() OR public.is_super_admin());

DROP POLICY IF EXISTS "colaboradores_detalhes_insert" ON public.colaboradores_detalhes;
CREATE POLICY "colaboradores_detalhes_insert" ON public.colaboradores_detalhes
  FOR INSERT TO authenticated
  WITH CHECK ((tenant_id = public.get_my_tenant_id() AND public.is_admin()) OR public.is_super_admin());

DROP POLICY IF EXISTS "colaboradores_detalhes_update" ON public.colaboradores_detalhes;
CREATE POLICY "colaboradores_detalhes_update" ON public.colaboradores_detalhes
  FOR UPDATE TO authenticated
  USING ((tenant_id = public.get_my_tenant_id() AND public.is_admin()) OR public.is_super_admin())
  WITH CHECK ((tenant_id = public.get_my_tenant_id() AND public.is_admin()) OR public.is_super_admin());

-- ===== ESPECIALIDADES =====
DROP POLICY IF EXISTS "especialidades_select" ON public.especialidades;
CREATE POLICY "especialidades_select" ON public.especialidades
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_my_tenant_id() OR public.is_super_admin());

DROP POLICY IF EXISTS "especialidades_insert" ON public.especialidades;
CREATE POLICY "especialidades_insert" ON public.especialidades
  FOR INSERT TO authenticated
  WITH CHECK ((tenant_id = public.get_my_tenant_id() AND public.is_admin()) OR public.is_super_admin());

DROP POLICY IF EXISTS "especialidades_update" ON public.especialidades;
CREATE POLICY "especialidades_update" ON public.especialidades
  FOR UPDATE TO authenticated
  USING ((tenant_id = public.get_my_tenant_id() AND public.is_admin()) OR public.is_super_admin())
  WITH CHECK ((tenant_id = public.get_my_tenant_id() AND public.is_admin()) OR public.is_super_admin());

DROP POLICY IF EXISTS "especialidades_delete" ON public.especialidades;
CREATE POLICY "especialidades_delete" ON public.especialidades
  FOR DELETE TO authenticated
  USING ((tenant_id = public.get_my_tenant_id() AND public.is_admin()) OR public.is_super_admin());

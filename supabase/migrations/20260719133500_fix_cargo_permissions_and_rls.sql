-- Fix get_user_permissions to include cargo-based permissions (was broken by previous migration)
CREATE OR REPLACE FUNCTION public.get_user_permissions(p_user_id UUID DEFAULT NULL)
RETURNS TEXT[]
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(array_agg(DISTINCT p.slug), ARRAY[]::text[])
  FROM public.permissoes p
  WHERE p.id IN (
    SELECT up.permissao_id
    FROM public.usuario_permissoes up
    WHERE up.usuario_id = COALESCE(p_user_id, auth.uid())
    UNION
    SELECT cp.permissao_id
    FROM public.cargo_permissoes cp
    JOIN public.usuarios u ON u.id = COALESCE(p_user_id, auth.uid())
    WHERE cp.cargo_id = u.cargo_id OR cp.cargo_id = u.cargo_secundario_id
  );
$$;

-- Fix has_permission to include cargo-based permissions
CREATE OR REPLACE FUNCTION public.has_permission(permission_name TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.usuario_permissoes up
      JOIN public.permissoes p ON up.permissao_id = p.id
      WHERE up.usuario_id = auth.uid() AND p.slug = permission_name
    )
    OR EXISTS (
      SELECT 1 FROM public.cargo_permissoes cp
      JOIN public.usuarios u ON u.id = auth.uid()
      JOIN public.permissoes p ON cp.permissao_id = p.id
      WHERE p.slug = permission_name
      AND (cp.cargo_id = u.cargo_id OR cp.cargo_id = u.cargo_secundario_id)
    );
$$;

-- Ensure RLS policies on cargo_permissoes for full CRUD by authenticated users
DROP POLICY IF EXISTS "cargo_permissoes_select" ON public.cargo_permissoes;
CREATE POLICY "cargo_permissoes_select" ON public.cargo_permissoes
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "cargo_permissoes_insert" ON public.cargo_permissoes;
CREATE POLICY "cargo_permissoes_insert" ON public.cargo_permissoes
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "cargo_permissoes_update" ON public.cargo_permissoes;
CREATE POLICY "cargo_permissoes_update" ON public.cargo_permissoes
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "cargo_permissoes_delete" ON public.cargo_permissoes;
CREATE POLICY IF EXISTS "cargo_permissoes_delete" ON public.cargo_permissoes;
CREATE POLICY "cargo_permissoes_delete" ON public.cargo_permissoes
  FOR DELETE TO authenticated USING (true);

-- Ensure cargos table allows full CRUD by authenticated users
DROP POLICY IF EXISTS "cargos_select" ON public.cargos;
CREATE POLICY "cargos_select" ON public.cargos
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "cargos_insert" ON public.cargos;
CREATE POLICY "cargos_insert" ON public.cargos
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "cargos_update" ON public.cargos;
CREATE POLICY "cargos_update" ON public.cargos
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "cargos_delete" ON public.cargos;
CREATE POLICY "cargos_delete" ON public.cargos
  FOR DELETE TO authenticated USING (true);

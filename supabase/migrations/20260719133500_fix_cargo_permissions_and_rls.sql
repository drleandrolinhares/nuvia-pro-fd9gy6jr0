-- Fix: consistent with post-remove_permissions state (no cargo_permissoes table)
-- Keep constant pass-through functions matching 20260531235959_remove_permissions.sql

CREATE OR REPLACE FUNCTION public.get_user_permissions(p_user_id uuid)
RETURNS text[]
LANGUAGE sql
STABLE
AS $function$
  SELECT ARRAY[]::text[];
$function$;

CREATE OR REPLACE FUNCTION public.has_permission(permission_name text)
RETURNS boolean
LANGUAGE sql
STABLE
AS $function$
  SELECT true;
$function$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $function$
  SELECT true;
$function$;

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

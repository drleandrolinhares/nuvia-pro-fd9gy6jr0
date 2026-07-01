-- Drop permission-related functions that reference deleted permission tables
-- These tables (permissoes, cargo_permissoes, usuario_permissoes) were dropped
-- in a prior migration, but the functions still exist as no-ops.

DROP FUNCTION IF EXISTS public.get_user_permissions(uuid);
DROP FUNCTION IF EXISTS public.get_user_consolidated_permissions(uuid);
DROP FUNCTION IF EXISTS public.has_permission(text);

-- Safety: remove any remaining RLS policies that still reference the deleted tables
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND COALESCE(qual::text, '') ~ '(permissoes|cargo_permissoes|usuario_permissoes)'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (true)',
      r.policyname, r.tablename
    );
  END LOOP;
END $$;

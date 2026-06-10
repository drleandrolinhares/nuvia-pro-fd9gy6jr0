-- Redefine functions to bypass permissions
CREATE OR REPLACE FUNCTION public.has_permission(permission_name text) RETURNS boolean LANGUAGE sql STABLE AS $function$ SELECT true; $function$;
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean LANGUAGE sql STABLE AS $function$ SELECT true; $function$;
CREATE OR REPLACE FUNCTION public.is_tenant_admin() RETURNS boolean LANGUAGE sql STABLE AS $function$ SELECT true; $function$;
CREATE OR REPLACE FUNCTION public.is_super_admin() RETURNS boolean LANGUAGE sql STABLE AS $function$ SELECT true; $function$;
CREATE OR REPLACE FUNCTION public.get_user_permissions(p_user_id uuid) RETURNS text[] LANGUAGE sql STABLE AS $function$ SELECT ARRAY[]::text[]; $function$;

DROP FUNCTION IF EXISTS public.get_user_consolidated_permissions(uuid);
CREATE OR REPLACE FUNCTION public.get_user_consolidated_permissions(p_user_id uuid)
 RETURNS TABLE(id uuid, nome text, modulo text)
 LANGUAGE sql STABLE
AS $function$
  SELECT NULL::uuid, ''::text, ''::text WHERE false;
$function$;

-- Update RLS dynamically for all tables
DO $block$
DECLARE
  pol record;
BEGIN
  FOR pol IN 
    SELECT policyname, tablename 
    FROM pg_policies 
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $block$;

DO $block$
DECLARE
  tab record;
  has_tenant boolean;
BEGIN
  FOR tab IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = tab.tablename AND column_name = 'tenant_id'
    ) INTO has_tenant;

    IF has_tenant THEN
      EXECUTE format('CREATE POLICY "universal_select" ON public.%I FOR SELECT TO authenticated USING (tenant_id = get_my_tenant_id() OR tenant_id IS NULL)', tab.tablename);
      EXECUTE format('CREATE POLICY "universal_insert" ON public.%I FOR INSERT TO authenticated WITH CHECK (tenant_id = get_my_tenant_id() OR tenant_id IS NULL)', tab.tablename);
      EXECUTE format('CREATE POLICY "universal_update" ON public.%I FOR UPDATE TO authenticated USING (tenant_id = get_my_tenant_id() OR tenant_id IS NULL)', tab.tablename);
      EXECUTE format('CREATE POLICY "universal_delete" ON public.%I FOR DELETE TO authenticated USING (tenant_id = get_my_tenant_id() OR tenant_id IS NULL)', tab.tablename);
    ELSE
      EXECUTE format('CREATE POLICY "universal_select" ON public.%I FOR SELECT TO authenticated USING (true)', tab.tablename);
      EXECUTE format('CREATE POLICY "universal_insert" ON public.%I FOR INSERT TO authenticated WITH CHECK (true)', tab.tablename);
      EXECUTE format('CREATE POLICY "universal_update" ON public.%I FOR UPDATE TO authenticated USING (true)', tab.tablename);
      EXECUTE format('CREATE POLICY "universal_delete" ON public.%I FOR DELETE TO authenticated USING (true)', tab.tablename);
    END IF;
  END LOOP;
END $block$;

-- Drop tables
DROP TABLE IF EXISTS public.usuario_permissoes CASCADE;
DROP TABLE IF EXISTS public.cargo_permissoes CASCADE;
DROP TABLE IF EXISTS public.permissoes CASCADE;

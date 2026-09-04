-- Migration: 20260904150000_fix_and_harden_tenant_assignment.sql
-- Description:
-- 1) Backfill and fix tenant_id in auth.users (raw_app_meta_data) and public.usuarios for all clinic users.
-- 2) Update get_my_tenant_id() to fallback to the user's tenant_id in public.usuarios if JWT app_metadata is missing.
-- 3) Harden handle_new_auth_user() trigger to automatically inject tenant_id into public.usuarios and raw_app_meta_data.

DO $$
DECLARE
  v_default_tenant_id UUID := '00000000-0000-0000-0000-000000000001'::UUID;
BEGIN
  -- 1a. Ensure all users in public.usuarios have the clinic tenant_id if NULL
  UPDATE public.usuarios
  SET tenant_id = v_default_tenant_id
  WHERE tenant_id IS NULL;

  -- 1b. Ensure auth.users raw_app_meta_data has tenant_id populated for known users
  UPDATE auth.users
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('tenant_id', v_default_tenant_id::text)
  WHERE raw_app_meta_data->>'tenant_id' IS NULL
     OR raw_app_meta_data->>'tenant_id' = '';
END $$;

-- 2. Enhance get_my_tenant_id() function:
-- Read from JWT app_metadata first (standard high-performance path),
-- but fallback to querying public.usuarios or fallback tenant if JWT tenant is empty.
CREATE OR REPLACE FUNCTION public.get_my_tenant_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_jwt_tenant TEXT;
  v_user_tenant UUID;
  v_uid UUID;
BEGIN
  -- 1. Try reading from JWT app_metadata
  BEGIN
    v_jwt_tenant := auth.jwt() -> 'app_metadata' ->> 'tenant_id';
    IF v_jwt_tenant IS NOT NULL AND v_jwt_tenant <> '' THEN
      RETURN v_jwt_tenant::UUID;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  -- 2. Fallback to public.usuarios for the authenticated user
  v_uid := auth.uid();
  IF v_uid IS NOT NULL THEN
    SELECT tenant_id INTO v_user_tenant
    FROM public.usuarios
    WHERE id = v_uid;

    IF v_user_tenant IS NOT NULL THEN
      RETURN v_user_tenant;
    END IF;
  END IF;

  -- 3. Fallback to default clinic tenant
  RETURN '00000000-0000-0000-0000-000000000001'::UUID;
END;
$$;

-- 3. Harden handle_new_auth_user trigger on auth.users:
-- Automatically resolve tenant_id (from metadata or fallback to default clinic tenant)
-- and inject it into both public.usuarios and auth.users raw_app_meta_data.
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id UUID;
  v_default_tenant UUID := '00000000-0000-0000-0000-000000000001'::UUID;
BEGIN
  -- Resolve tenant from app_metadata or user_metadata or default
  BEGIN
    IF NEW.raw_app_meta_data->>'tenant_id' IS NOT NULL AND NEW.raw_app_meta_data->>'tenant_id' <> '' THEN
      v_tenant_id := (NEW.raw_app_meta_data->>'tenant_id')::UUID;
    ELSIF NEW.raw_user_meta_data->>'tenant_id' IS NOT NULL AND NEW.raw_user_meta_data->>'tenant_id' <> '' THEN
      v_tenant_id := (NEW.raw_user_meta_data->>'tenant_id')::UUID;
    ELSE
      v_tenant_id := v_default_tenant;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    v_tenant_id := v_default_tenant;
  END;

  -- Ensure auth.users has raw_app_meta_data with tenant_id
  IF NEW.raw_app_meta_data->>'tenant_id' IS NULL OR NEW.raw_app_meta_data->>'tenant_id' = '' THEN
    NEW.raw_app_meta_data := COALESCE(NEW.raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('tenant_id', v_tenant_id::text);
  END IF;

  -- Idempotent upsert into public.usuarios
  INSERT INTO public.usuarios (id, email, nome, role, status, tenant_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'user',
    'ativo',
    v_tenant_id
  )
  ON CONFLICT (id) DO UPDATE
  SET tenant_id = COALESCE(public.usuarios.tenant_id, EXCLUDED.tenant_id);

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never let the trigger fail — that would cancel the auth.users INSERT
  RETURN NEW;
END;
$$;

-- Note: The trigger on auth.users is BEFORE INSERT or AFTER INSERT.
-- If BEFORE INSERT, it can modify NEW.raw_app_meta_data directly.
-- Let's make sure on_auth_user_created handles this cleanly:
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

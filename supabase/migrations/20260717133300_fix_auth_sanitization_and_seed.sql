-- =====================================================
-- 1. Fix NULL token/change columns in auth.users
--    GoTrue requires these to be '' (empty string), never NULL
-- =====================================================
UPDATE auth.users
SET
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE
  confirmation_token IS NULL
  OR recovery_token IS NULL
  OR email_change_token_new IS NULL
  OR email_change IS NULL
  OR email_change_token_current IS NULL
  OR phone_change IS NULL
  OR phone_change_token IS NULL
  OR reauthentication_token IS NULL;

-- Ensure phone is NULL (not '') for users without a phone number
-- to avoid unique constraint violations on users_phone_key
UPDATE auth.users
SET phone = NULL
WHERE phone = '';

-- =====================================================
-- 2. Ensure a default tenant exists
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.tenants LIMIT 1) THEN
    INSERT INTO public.tenants (id, slug, nome, status, plano)
    VALUES (
      '00000000-0000-0000-0000-000000000001'::uuid,
      'nuvia-odontologia',
      'NUVIA PRO',
      'ativo',
      'pro'
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- =====================================================
-- 3. Seed the admin user in auth.users and public.usuarios
-- =====================================================
DO $$
DECLARE
  v_user_id uuid;
  v_tenant_id uuid;
BEGIN
  -- Get the first available tenant
  SELECT id INTO v_tenant_id FROM public.tenants ORDER BY criado_em LIMIT 1;
  IF v_tenant_id IS NULL THEN
    v_tenant_id := '00000000-0000-0000-0000-000000000001'::uuid;
  END IF;

  -- Check if the admin user already exists in auth.users
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'drleandrolinhares@gmail.com' LIMIT 1;

  IF v_user_id IS NULL THEN
    -- Create the auth user
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'drleandrolinhares@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"], "is_super_admin": true}'::jsonb,
      '{"name": "Dr. Leandro Linhares"}'::jsonb,
      true, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  ELSE
    -- Update existing user: ensure correct password, super_admin flag, and clean tokens
    UPDATE auth.users
    SET
      encrypted_password = crypt('Skip@Pass', gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      is_super_admin = true,
      raw_app_meta_data = CASE
        WHEN raw_app_meta_data IS NULL THEN '{"provider": "email", "providers": ["email"], "is_super_admin": true}'::jsonb
        ELSE raw_app_meta_data || '{"is_super_admin": true}'::jsonb
      END,
      confirmation_token = COALESCE(confirmation_token, ''),
      recovery_token = COALESCE(recovery_token, ''),
      email_change_token_new = COALESCE(email_change_token_new, ''),
      email_change = COALESCE(email_change, ''),
      email_change_token_current = COALESCE(email_change_token_current, ''),
      phone = NULL,
      phone_change = COALESCE(phone_change, ''),
      phone_change_token = COALESCE(phone_change_token, ''),
      reauthentication_token = COALESCE(reauthentication_token, '')
    WHERE id = v_user_id;
  END IF;

  -- Ensure the public.usuarios record exists and is correctly linked
  INSERT INTO public.usuarios (
    id, email, nome, role, status, tenant_id, possui_carteira
  ) VALUES (
    v_user_id,
    'drleandrolinhares@gmail.com',
    'Dr. Leandro Linhares',
    'admin',
    'ativo',
    v_tenant_id,
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = 'drleandrolinhares@gmail.com',
    nome = 'Dr. Leandro Linhares',
    role = 'admin',
    status = 'ativo',
    tenant_id = v_tenant_id;
END $$;

-- =====================================================
-- 4. RLS Policies on public.usuarios
--    Ensure authenticated users can always SELECT and UPDATE
--    their own record (id = auth.uid())
-- =====================================================

-- Enable RLS (safe if already enabled)
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Drop existing self-access policies if they exist (idempotent)
DROP POLICY IF EXISTS "usuarios_select_own" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_update_own" ON public.usuarios;

-- Allow authenticated users to SELECT their own record
CREATE POLICY "usuarios_select_own" ON public.usuarios
  FOR SELECT TO authenticated
  USING (id = auth.uid());

-- Allow authenticated users to UPDATE their own record
CREATE POLICY "usuarios_update_own" ON public.usuarios
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- 1. Add avatar_url column to usuarios
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Create avatars bucket if missing
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true) 
ON CONFLICT (id) DO NOTHING;

-- 3. Setup Policies for storage.objects
DO $$
BEGIN
  DROP POLICY IF EXISTS "Avatar public access" ON storage.objects;
  CREATE POLICY "Avatar public access" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

  DROP POLICY IF EXISTS "Avatar upload access" ON storage.objects;
  CREATE POLICY "Avatar upload access" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

  DROP POLICY IF EXISTS "Avatar update access" ON storage.objects;
  CREATE POLICY "Avatar update access" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

  DROP POLICY IF EXISTS "Avatar delete access" ON storage.objects;
  CREATE POLICY "Avatar delete access" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');
END $$;

-- 4. Seed and Fix User Dr. Leandro Linhares
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Check if user exists in auth.users
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'drleandrolinhares@gmail.com';
  
  IF v_user_id IS NULL THEN
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
      crypt('Skip@Pass123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Dr. Leandro Linhares"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL,
      '', '', ''
    );
  END IF;

  -- Ensure user is in public.usuarios with active status and admin role
  INSERT INTO public.usuarios (id, email, nome, role, status)
  VALUES (v_user_id, 'drleandrolinhares@gmail.com', 'Dr. Leandro Linhares', 'admin', 'ativo')
  ON CONFLICT (id) DO UPDATE SET 
    role = 'admin',
    status = 'ativo';

END $$;

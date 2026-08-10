-- Fix the on_auth_user_created trigger to be idempotent and non-failing
-- Ensure all mandatory columns in public.usuarios have safe defaults

-- Ensure defaults on usuarios table for all mandatory/boolean columns
ALTER TABLE public.usuarios
  ALTER COLUMN role SET DEFAULT 'user',
  ALTER COLUMN status SET DEFAULT 'ativo',
  ALTER COLUMN criado_em SET DEFAULT now(),
  ALTER COLUMN ordem SET DEFAULT 0,
  ALTER COLUMN dias_trabalho SET DEFAULT '[1, 2, 3, 4, 5]'::jsonb,
  ALTER COLUMN obrigatorio_pp_pdm SET DEFAULT false,
  ALTER COLUMN obrigatorio_bonificacao SET DEFAULT false,
  ALTER COLUMN possui_carteira SET DEFAULT true,
  ALTER COLUMN exigir_rotina SET DEFAULT true,
  ALTER COLUMN elegivel_ferias SET DEFAULT false,
  ALTER COLUMN acesso_chat SET DEFAULT true,
  ALTER COLUMN pode_realizar_lancamento SET DEFAULT false,
  ALTER COLUMN force_password_change SET DEFAULT false;

-- Create or replace the trigger function that handles new auth users
-- This must be idempotent and never fail (which would cancel the auth.users insert)
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Idempotent insert: only insert if the user doesn't already exist in public.usuarios
  -- Use ON CONFLICT to avoid duplicate key violations
  -- Only set minimal fields; the Edge Function will update with full form data afterwards
  INSERT INTO public.usuarios (id, email, nome, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'user',
    'ativo'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never let the trigger fail — that would cancel the auth.users INSERT
  -- and cause "Database error creating new user"
  RETURN NEW;
END;
$$;

-- Drop and recreate the trigger idempotently
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

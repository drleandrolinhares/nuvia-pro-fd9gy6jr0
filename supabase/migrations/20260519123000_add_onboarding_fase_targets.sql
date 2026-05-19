ALTER TABLE public.intranet_onboarding_fases ADD COLUMN IF NOT EXISTS usuarios_alvo jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.intranet_onboarding_fases ADD COLUMN IF NOT EXISTS cargos_alvo jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.intranet_onboarding_fases ADD COLUMN IF NOT EXISTS todos_usuarios boolean DEFAULT false;

DO $$
BEGIN
  UPDATE public.intranet_onboarding_fases 
  SET todos_usuarios = true 
  WHERE cargo_id IS NULL AND (todos_usuarios IS NULL OR todos_usuarios = false);

  UPDATE public.intranet_onboarding_fases 
  SET todos_usuarios = false, cargos_alvo = jsonb_build_array(cargo_id) 
  WHERE cargo_id IS NOT NULL AND (cargos_alvo IS NULL OR jsonb_array_length(cargos_alvo) = 0);
END $$;

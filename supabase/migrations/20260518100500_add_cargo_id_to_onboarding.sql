ALTER TABLE public.intranet_onboarding_etapas ADD COLUMN IF NOT EXISTS cargo_id UUID REFERENCES public.cargos(id) ON DELETE CASCADE;

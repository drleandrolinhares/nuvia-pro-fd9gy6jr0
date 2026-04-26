ALTER TABLE public.sorriso_dos_sonhos_config ADD COLUMN IF NOT EXISTS usuarios_elegiveis jsonb DEFAULT '[]'::jsonb;

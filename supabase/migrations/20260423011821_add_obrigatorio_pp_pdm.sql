ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS obrigatorio_pp_pdm BOOLEAN NOT NULL DEFAULT false;

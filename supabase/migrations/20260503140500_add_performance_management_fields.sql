ALTER TABLE public.performance_pp_pdm 
ADD COLUMN IF NOT EXISTS status_gestao text DEFAULT 'aguardando_acao',
ADD COLUMN IF NOT EXISTS consideracoes_gestao jsonb DEFAULT '[]'::jsonb;

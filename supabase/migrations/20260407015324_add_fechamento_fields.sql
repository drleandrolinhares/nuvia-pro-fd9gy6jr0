ALTER TABLE public.avaliacoes
ADD COLUMN IF NOT EXISTS data_fechamento DATE,
ADD COLUMN IF NOT EXISTS valor_entrada NUMERIC,
ADD COLUMN IF NOT EXISTS observacoes_fechamento TEXT;

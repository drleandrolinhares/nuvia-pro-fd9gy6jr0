ALTER TABLE public.vendas_diarias
ADD COLUMN IF NOT EXISTS paciente_nome TEXT,
ADD COLUMN IF NOT EXISTS valor_tratamento NUMERIC,
ADD COLUMN IF NOT EXISTS forma_pagamento TEXT,
ADD COLUMN IF NOT EXISTS destino_pagamento TEXT,
ADD COLUMN IF NOT EXISTS destino_fiscal TEXT;

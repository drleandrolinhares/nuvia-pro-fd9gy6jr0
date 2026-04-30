ALTER TABLE public.fluxo_caixa_parceiros DROP CONSTRAINT IF EXISTS fluxo_caixa_parceiros_tipo_check;
ALTER TABLE public.fluxo_caixa_parceiros ADD COLUMN IF NOT EXISTS criterio_pagamento text;
UPDATE public.fluxo_caixa_parceiros SET tipo = 'dentista_avaliador' WHERE tipo = 'dentista';

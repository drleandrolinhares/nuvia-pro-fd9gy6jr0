ALTER TABLE public.comissoes_dentista ADD COLUMN IF NOT EXISTS status_pagamento text DEFAULT 'em_aberto';
ALTER TABLE public.comissoes_crc ADD COLUMN IF NOT EXISTS status_pagamento text DEFAULT 'em_aberto';

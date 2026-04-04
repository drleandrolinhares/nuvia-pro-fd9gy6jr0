-- Add missing columns to compras
ALTER TABLE public.compras ADD COLUMN IF NOT EXISTS sala_id UUID REFERENCES public.salas(id) ON DELETE SET NULL;

-- Add missing columns to compra_itens
ALTER TABLE public.compra_itens 
  ADD COLUMN IF NOT EXISTS estoque_adicionado INTEGER,
  ADD COLUMN IF NOT EXISTS data_validade DATE,
  ADD COLUMN IF NOT EXISTS numero_armario TEXT,
  ADD COLUMN IF NOT EXISTS observacoes TEXT;

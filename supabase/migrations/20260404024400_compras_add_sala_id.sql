-- Add data_criacao to fornecedores if needed (some schemas use criado_em)
ALTER TABLE public.fornecedores ADD COLUMN IF NOT EXISTS data_criacao TIMESTAMPTZ DEFAULT NOW();

-- Add missing sala_id to compra_itens as specified
ALTER TABLE public.compra_itens ADD COLUMN IF NOT EXISTS sala_id UUID REFERENCES public.salas(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS compra_itens_sala_id_idx ON public.compra_itens USING btree (sala_id);

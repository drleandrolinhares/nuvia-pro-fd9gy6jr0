ALTER TABLE public.pedido_itens ADD COLUMN IF NOT EXISTS descricao_item text;

DO $$
BEGIN
  ALTER TABLE public.pedido_itens ALTER COLUMN produto_id DROP NOT NULL;
EXCEPTION
  WHEN undefined_column THEN
    NULL;
END $$;

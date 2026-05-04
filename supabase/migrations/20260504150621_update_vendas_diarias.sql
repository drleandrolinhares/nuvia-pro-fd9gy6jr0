DO $$
BEGIN
  -- Drop the unique constraint on data_venda to allow multiple individual sales per day
  ALTER TABLE public.vendas_diarias DROP CONSTRAINT IF EXISTS vendas_diarias_data_venda_key;
  DROP INDEX IF EXISTS vendas_diarias_data_venda_key;
END $$;

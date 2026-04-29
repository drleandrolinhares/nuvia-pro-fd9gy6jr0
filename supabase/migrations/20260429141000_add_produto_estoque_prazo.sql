DO $$
BEGIN
  ALTER TABLE public.produtos
  ADD COLUMN IF NOT EXISTS alerta_prazo_dias integer,
  ADD COLUMN IF NOT EXISTS data_proxima_revisao date,
  ADD COLUMN IF NOT EXISTS consumo_estimado_valor numeric,
  ADD COLUMN IF NOT EXISTS consumo_estimado_frequencia text;
END $$;

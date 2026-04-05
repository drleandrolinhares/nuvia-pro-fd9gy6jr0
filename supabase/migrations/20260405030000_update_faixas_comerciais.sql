DO $$
BEGIN
  -- Drop constraint on descontos_por_prazo safely
  ALTER TABLE public.descontos_por_prazo DROP CONSTRAINT IF EXISTS descontos_por_prazo_faixa_numero_check;
  
  -- Add new constraint to support tiers 0 to 5
  ALTER TABLE public.descontos_por_prazo ADD CONSTRAINT descontos_por_prazo_faixa_numero_check CHECK (faixa_numero >= 0 AND faixa_numero <= 5);

  -- Add faixa_numero to faixas_valores_parcelas to explicitly map them
  ALTER TABLE public.faixas_valores_parcelas ADD COLUMN IF NOT EXISTS faixa_numero integer;
  
  -- Wipe old rules to ensure clean slate for the new 0-5 and 1-5 definitions
  DELETE FROM public.descontos_por_prazo;
  DELETE FROM public.faixas_valores_parcelas;

  -- Insert new Descontos
  INSERT INTO public.descontos_por_prazo (faixa_numero, percentual_desconto, descricao) VALUES
    (0, 0, 'Somente à vista'),
    (1, 0, 'Até 4 parcelas'),
    (2, 0, 'Até 8 parcelas'),
    (3, 0, 'Até 12 parcelas'),
    (4, 0, 'Até 20 parcelas'),
    (5, 0, 'Até 24 parcelas');

  -- Insert new Faixas de Valores
  INSERT INTO public.faixas_valores_parcelas (faixa_numero, valor_minimo, valor_maximo, max_parcelas) VALUES
    (1, 1000, 2999.99, 4),
    (2, 3000, 4999.99, 8),
    (3, 5000, 7999.99, 12),
    (4, 8000, 11999.99, 20),
    (5, 12000, 9999999.99, 24);

END $$;

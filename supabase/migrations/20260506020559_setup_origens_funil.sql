DO $$
BEGIN
  -- Insert or Update 8 origens
  INSERT INTO public.funil_origens (id, nome, ordem, ativo) VALUES 
    (gen_random_uuid(), 'Recorrentes', 1, true),
    (gen_random_uuid(), 'Indicações Orgânicas', 2, true),
    (gen_random_uuid(), 'Facebook', 3, true),
    (gen_random_uuid(), 'PROGRAMA SORRISO DOS SONHOS', 4, true),
    (gen_random_uuid(), 'Google', 5, true),
    (gen_random_uuid(), 'Instagram', 6, true),
    (gen_random_uuid(), 'Espontâneos/Aleatórios', 7, true),
    (gen_random_uuid(), 'Campanhas Sazonais', 8, true)
  ON CONFLICT (nome) DO UPDATE SET ativo = true;

  -- Rename old 'Programa Sorriso dos Sonhos' to upper case if exists
  UPDATE public.funil_origens SET nome = 'PROGRAMA SORRISO DOS SONHOS' WHERE nome ILIKE '%Programa Sorriso dos Sonhos%';
  
  -- Deactivate any other origin
  UPDATE public.funil_origens 
  SET ativo = false 
  WHERE nome NOT IN (
    'Recorrentes', 
    'Indicações Orgânicas', 
    'Facebook', 
    'PROGRAMA SORRISO DOS SONHOS', 
    'Google', 
    'Instagram', 
    'Espontâneos/Aleatórios', 
    'Campanhas Sazonais'
  );

  -- Add origem_id to avaliacoes to track the origin of the sale
  ALTER TABLE public.avaliacoes ADD COLUMN IF NOT EXISTS origem_id UUID REFERENCES public.funil_origens(id) ON DELETE SET NULL;
END $$;

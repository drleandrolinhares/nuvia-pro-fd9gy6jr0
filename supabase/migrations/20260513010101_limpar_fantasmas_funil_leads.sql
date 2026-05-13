DO $$
BEGIN
  -- Remover leads com status inválido (fantasmas) para não poluir o funil secundário e central de conversões
  DELETE FROM public.funil_leads
  WHERE lower(status) IN ('lixo', 'teste', 'duplicado', 'erro', 'invalido', 'rascunho');

  DELETE FROM public.avaliacoes
  WHERE lower(status) IN ('lixo', 'teste', 'duplicado', 'erro', 'invalido', 'rascunho');
END $$;

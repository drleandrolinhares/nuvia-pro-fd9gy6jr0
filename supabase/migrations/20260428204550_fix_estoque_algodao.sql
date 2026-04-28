DO $$
BEGIN
  -- Corrigir o saldo de estoque do produto ALGODÃO ROLETE N1 que ficou com 630 devido a um erro de concatenação
  -- O gatilho de banco de dados e as tipagens de inserção já garantem a soma matemática correta daqui em diante.
  UPDATE public.produtos
  SET quantidade_estoque = 36
  WHERE (nome ILIKE '%ALGODÃO ROLETE N1%' OR nome ILIKE '%ALGODAO ROLETE N1%') 
  AND quantidade_estoque = 630;
END $$;

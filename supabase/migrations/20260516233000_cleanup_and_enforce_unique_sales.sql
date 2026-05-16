DO $$
DECLARE
  dup RECORD;
BEGIN
  -- 1. Cleanup duplicates in vendas_diarias
  FOR dup IN 
    SELECT lower(TRIM(BOTH FROM paciente_nome)) as p_nome, data_venda, COALESCE(origem_id, '00000000-0000-0000-0000-000000000000'::uuid) as o_id, COUNT(*)
    FROM public.vendas_diarias
    GROUP BY lower(TRIM(BOTH FROM paciente_nome)), data_venda, COALESCE(origem_id, '00000000-0000-0000-0000-000000000000'::uuid)
    HAVING COUNT(*) > 1
  LOOP
    -- Keep the most recently updated one, delete the rest
    DELETE FROM public.vendas_diarias
    WHERE id IN (
      SELECT id FROM public.vendas_diarias
      WHERE lower(TRIM(BOTH FROM paciente_nome)) = dup.p_nome
        AND data_venda = dup.data_venda
        AND COALESCE(origem_id, '00000000-0000-0000-0000-000000000000'::uuid) = dup.o_id
      ORDER BY criado_em DESC
      OFFSET 1
    );
  END LOOP;

  -- 2. Cleanup duplicates in vendas_confirmadas
  FOR dup IN 
    SELECT lower(TRIM(BOTH FROM paciente_nome)) as p_nome, data_fechamento, COALESCE(origem_id, '00000000-0000-0000-0000-000000000000'::uuid) as o_id, COUNT(*)
    FROM public.vendas_confirmadas
    GROUP BY lower(TRIM(BOTH FROM paciente_nome)), data_fechamento, COALESCE(origem_id, '00000000-0000-0000-0000-000000000000'::uuid)
    HAVING COUNT(*) > 1
  LOOP
    -- Keep the most recently updated one, delete the rest
    DELETE FROM public.vendas_confirmadas
    WHERE id IN (
      SELECT id FROM public.vendas_confirmadas
      WHERE lower(TRIM(BOTH FROM paciente_nome)) = dup.p_nome
        AND data_fechamento = dup.data_fechamento
        AND COALESCE(origem_id, '00000000-0000-0000-0000-000000000000'::uuid) = dup.o_id
      ORDER BY atualizado_em DESC
      OFFSET 1
    );
  END LOOP;
END $$;

-- 3. Re-apply unique constraints
DROP INDEX IF EXISTS idx_vendas_diarias_unique_venda;
CREATE UNIQUE INDEX IF NOT EXISTS idx_vendas_diarias_unique_venda 
ON public.vendas_diarias 
USING btree (lower(TRIM(BOTH FROM paciente_nome)), data_venda, COALESCE(origem_id, '00000000-0000-0000-0000-000000000000'::uuid));

DROP INDEX IF EXISTS idx_vendas_confirmadas_unique_venda;
CREATE UNIQUE INDEX IF NOT EXISTS idx_vendas_confirmadas_unique_venda 
ON public.vendas_confirmadas 
USING btree (lower(TRIM(BOTH FROM paciente_nome)), data_fechamento, COALESCE(origem_id, '00000000-0000-0000-0000-000000000000'::uuid));

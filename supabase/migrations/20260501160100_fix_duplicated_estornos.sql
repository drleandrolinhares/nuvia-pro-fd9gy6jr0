DO $$
BEGIN
  -- Adiciona a coluna transacao_original_id se nao existir
  ALTER TABLE public.carteira_transacoes ADD COLUMN IF NOT EXISTS transacao_original_id UUID REFERENCES public.carteira_transacoes(id) ON DELETE SET NULL;
  
  -- Limpa estornos duplicados excessivos (que não tem par com uma transação original)
  WITH estornos AS (
    SELECT id,
           usuario_id, mes_referencia, valor, split_part(descricao, ' — Realizado por:', 1) as base_desc,
           ROW_NUMBER() OVER(PARTITION BY usuario_id, mes_referencia, valor, split_part(descricao, ' — Realizado por:', 1) ORDER BY criado_em ASC) as rn_estorno
    FROM public.carteira_transacoes
    WHERE descricao LIKE 'Estorno de:%'
  ),
  originais AS (
    SELECT id,
           usuario_id, mes_referencia, valor, 'Estorno de: ' || descricao as base_desc,
           ROW_NUMBER() OVER(PARTITION BY usuario_id, mes_referencia, valor, descricao ORDER BY criado_em ASC) as rn_orig
    FROM public.carteira_transacoes
    WHERE descricao NOT LIKE 'Estorno de:%'
  )
  DELETE FROM public.carteira_transacoes
  WHERE id IN (
    SELECT e.id 
    FROM estornos e
    LEFT JOIN originais o 
      ON e.usuario_id = o.usuario_id 
      AND e.mes_referencia = o.mes_referencia 
      AND e.valor = o.valor 
      AND e.base_desc = o.base_desc
      AND e.rn_estorno = o.rn_orig
    WHERE o.id IS NULL
  );

  -- Atualiza transacao_original_id para os estornos já existentes que sobraram
  UPDATE public.carteira_transacoes ct
  SET transacao_original_id = sub.orig_id
  FROM (
    SELECT e.id as estorno_id, o.id as orig_id
    FROM (
      SELECT id, usuario_id, mes_referencia, valor, 'Estorno de: ' || descricao as base_desc,
             ROW_NUMBER() OVER(PARTITION BY usuario_id, mes_referencia, valor, descricao ORDER BY criado_em ASC) as rn_orig
      FROM public.carteira_transacoes
      WHERE descricao NOT LIKE 'Estorno de:%'
    ) o
    JOIN (
      SELECT id, usuario_id, mes_referencia, valor, split_part(descricao, ' — Realizado por:', 1) as base_desc,
             ROW_NUMBER() OVER(PARTITION BY usuario_id, mes_referencia, valor, split_part(descricao, ' — Realizado por:', 1) ORDER BY criado_em ASC) as rn_estorno
      FROM public.carteira_transacoes
      WHERE descricao LIKE 'Estorno de:%'
    ) e 
    ON e.usuario_id = o.usuario_id 
    AND e.mes_referencia = o.mes_referencia 
    AND e.valor = o.valor 
    AND e.base_desc = o.base_desc
    AND e.rn_estorno = o.rn_orig
  ) sub
  WHERE ct.id = sub.estorno_id AND ct.transacao_original_id IS NULL;

END $$;

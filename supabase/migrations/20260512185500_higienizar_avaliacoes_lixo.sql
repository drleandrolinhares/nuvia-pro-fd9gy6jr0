DO $$
DECLARE
  r RECORD;
BEGIN
  -- 1. Remoção de Lixo: Avaliações marcadas como erro, rascunho ou canceladas 
  -- que não possuem vínculos com vendas.
  DELETE FROM public.avaliacoes
  WHERE status IN ('erro', 'rascunho', 'cancelado')
    AND id NOT IN (SELECT oportunidade_id FROM public.vendas_confirmadas WHERE oportunidade_id IS NOT NULL);

  -- 2. Garantir data_avaliacao preenchida para consistência
  UPDATE public.avaliacoes 
  SET data_avaliacao = criado_em::date 
  WHERE data_avaliacao IS NULL;

  -- 3. Deduplicação Inteligente: Manter apenas 1 oportunidade por paciente por mês (preferindo venda_concretizada ou maior valor)
  FOR r IN (
    SELECT 
      paciente_id, 
      to_char(data_avaliacao::date, 'YYYY-MM') as mes, 
      array_agg(id ORDER BY 
        CASE WHEN status = 'venda_concretizada' THEN 1 ELSE 2 END ASC,
        valor_orcamento DESC NULLS LAST,
        atualizado_em DESC NULLS LAST
      ) as ids
    FROM public.avaliacoes
    WHERE paciente_id IS NOT NULL
    GROUP BY paciente_id, to_char(data_avaliacao::date, 'YYYY-MM')
    HAVING count(*) > 1
  ) LOOP
    -- Redirecionar vendas vinculadas às duplicatas para a avaliação principal (índice 1)
    UPDATE public.vendas_confirmadas 
    SET oportunidade_id = r.ids[1] 
    WHERE oportunidade_id = ANY(r.ids[2:array_length(r.ids, 1)]);

    -- Redirecionar orçamentos vinculados
    UPDATE public.orcamentos
    SET avaliacao_id = r.ids[1]
    WHERE avaliacao_id = ANY(r.ids[2:array_length(r.ids, 1)]);
    
    -- Redirecionar follow ups vinculados
    UPDATE public.contatos_follow_up
    SET avaliacao_id = r.ids[1]
    WHERE avaliacao_id = ANY(r.ids[2:array_length(r.ids, 1)]);

    -- Deletar as duplicatas
    DELETE FROM public.avaliacoes 
    WHERE id = ANY(r.ids[2:array_length(r.ids, 1)]);
  END LOOP;
END $$;

-- 4. Trava técnica para impedir novas duplicidades
CREATE OR REPLACE FUNCTION public.trg_prevent_duplicate_avaliacoes()
RETURNS trigger AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.avaliacoes 
    WHERE paciente_id = NEW.paciente_id 
      AND to_char(COALESCE(data_avaliacao, criado_em, CURRENT_DATE)::date, 'YYYY-MM') = to_char(COALESCE(NEW.data_avaliacao, NEW.criado_em, CURRENT_DATE)::date, 'YYYY-MM')
      AND id != NEW.id
  ) THEN
    RAISE EXCEPTION 'Já existe uma oportunidade registrada para este paciente neste mês.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_duplicate_avaliacoes_tg ON public.avaliacoes;
CREATE TRIGGER prevent_duplicate_avaliacoes_tg
  BEFORE INSERT ON public.avaliacoes
  FOR EACH ROW EXECUTE FUNCTION public.trg_prevent_duplicate_avaliacoes();

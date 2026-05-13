-- 1. Remoção de Duplicidades usando DISTINCT
DO $$
DECLARE
  r RECORD;
BEGIN
  -- Deduplica funil_leads (mantém o mais recentemente atualizado) baseando-se no nome e mes_referencia
  FOR r IN (
    SELECT lower(trim(nome)) as n, mes_referencia, array_agg(id ORDER BY atualizado_em DESC) as ids
    FROM public.funil_leads
    GROUP BY lower(trim(nome)), mes_referencia
    HAVING count(*) > 1
  ) LOOP
    DELETE FROM public.funil_leads WHERE id = ANY(r.ids[2:array_length(r.ids, 1)]);
  END LOOP;
END $$;

-- 2. Atualiza a função atualizar_funil_dados_mensais para contar DISTINCT
CREATE OR REPLACE FUNCTION public.atualizar_funil_dados_mensais(p_origem_id uuid, p_mes_referencia text)
 RETURNS void
 LANGUAGE plpgsql
AS $$
  DECLARE
    v_total_leads INT;
    v_agendamentos INT;
    v_comparecimentos INT;
    v_fechamentos INT;
    v_faltas INT;
    v_valor_fechado NUMERIC;
  BEGIN
    -- Contagem exclusiva de Leads usando DISTINCT para evitar contagem de fantasmas
    SELECT COUNT(DISTINCT lower(trim(nome))) INTO v_total_leads FROM public.funil_leads 
    WHERE origem_id = p_origem_id 
    AND mes_referencia = p_mes_referencia
    AND status NOT IN ('venda-fechada', 'venda_concretizada', 'fechamento', 'avaliacao');
    
    -- Agendamentos
    SELECT COALESCE(SUM(COALESCE(qtd_agendamentos, 1)), 0) INTO v_agendamentos FROM public.funil_leads 
    WHERE origem_id = p_origem_id 
    AND mes_referencia = p_mes_referencia 
    AND status IN ('agendado', 'reagendado', 'atendido', 'faltou', 'negociacao', 'venda-fechada', 'venda_concretizada', 'venda-perdida', 'avaliacao', 'fechamento', 'em_follow_up');

    -- Comparecimentos
    SELECT COUNT(DISTINCT lower(trim(nome))) INTO v_comparecimentos FROM public.funil_leads 
    WHERE origem_id = p_origem_id 
    AND mes_referencia = p_mes_referencia 
    AND status IN ('atendido', 'negociacao', 'venda-fechada', 'venda_concretizada', 'venda-perdida', 'avaliacao', 'fechamento', 'em_follow_up');

    -- Fechamentos
    SELECT COUNT(DISTINCT lower(trim(nome))) INTO v_fechamentos FROM public.funil_leads 
    WHERE origem_id = p_origem_id 
    AND mes_referencia = p_mes_referencia 
    AND status IN ('fechamento', 'venda-fechada', 'venda_concretizada');
    
    -- Faltas
    SELECT COALESCE(SUM(COALESCE(qtd_faltas, 0)), 0) INTO v_faltas FROM public.funil_leads 
    WHERE origem_id = p_origem_id AND mes_referencia = p_mes_referencia;

    -- Valor Fechado
    SELECT COALESCE(SUM(valor_tratamento), 0) INTO v_valor_fechado FROM public.vendas_confirmadas
    WHERE origem_id = p_origem_id 
    AND to_char(data_fechamento::date, 'YYYY-MM') = p_mes_referencia;

    INSERT INTO public.funil_dados_mensais (
      origem_id, 
      mes_referencia, 
      leads_realizado, 
      agendamentos_realizado, 
      comparecimentos_realizado,
      fechamentos_qtde_realizado,
      fechamentos_valor_realizado,
      faltas_realizado,
      investimento,
      meta_leads,
      meta_agendamentos_qtde,
      meta_agendamentos_perc,
      meta_comparecimentos_qtde,
      meta_comparecimentos_perc,
      meta_fechamento_valor,
      ticket_medio_esperado
    )
    VALUES (
      p_origem_id, 
      p_mes_referencia, 
      v_total_leads, 
      v_agendamentos, 
      v_comparecimentos,
      v_fechamentos,
      v_valor_fechado,
      v_faltas,
      0, 0, 0, 0, 0, 0, 0, 0
    )
    ON CONFLICT (origem_id, mes_referencia) 
    DO UPDATE SET
      leads_realizado = EXCLUDED.leads_realizado,
      agendamentos_realizado = EXCLUDED.agendamentos_realizado,
      comparecimentos_realizado = EXCLUDED.comparecimentos_realizado,
      fechamentos_qtde_realizado = EXCLUDED.fechamentos_qtde_realizado,
      fechamentos_valor_realizado = EXCLUDED.fechamentos_valor_realizado,
      faltas_realizado = EXCLUDED.faltas_realizado,
      atualizado_em = NOW();
  END;
$$;

-- 3. Recalcula os dados de todas as origens/meses afetados
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT DISTINCT origem_id, mes_referencia FROM public.funil_leads LOOP
    PERFORM public.atualizar_funil_dados_mensais(r.origem_id, r.mes_referencia);
  END LOOP;
END $$;

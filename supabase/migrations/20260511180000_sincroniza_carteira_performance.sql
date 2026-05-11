DO $$
DECLARE
  v_user RECORD;
  v_mes text := '2026-05';
  v_has_pp_week1 boolean;
  v_has_pp_week2 boolean;
  v_bonificacao_id uuid;
  v_record RECORD;
BEGIN
  -- 1. Auditoria Automatizada de Maio: Semanas de 02/05 e 09/05
  FOR v_user IN SELECT * FROM public.usuarios WHERE obrigatorio_pp_pdm = true AND status = 'ativo' LOOP
    -- Verifica se enviou entre 27/04 e 02/05
    SELECT EXISTS (
      SELECT 1 FROM public.performance_pp_pdm 
      WHERE usuario_id = v_user.id 
      AND data_registro >= '2026-04-27' AND data_registro <= '2026-05-02'
    ) INTO v_has_pp_week1;
    
    -- Verifica se enviou entre 03/05 e 09/05
    SELECT EXISTS (
      SELECT 1 FROM public.performance_pp_pdm 
      WHERE usuario_id = v_user.id 
      AND data_registro >= '2026-05-03' AND data_registro <= '2026-05-09'
    ) INTO v_has_pp_week2;
    
    IF NOT v_has_pp_week1 OR NOT v_has_pp_week2 THEN
      -- Desclassifica da bonificação
      SELECT id INTO v_bonificacao_id FROM public.performance_bonificacao 
      WHERE usuario_id = v_user.id AND mes_referencia = v_mes;
      
      IF v_bonificacao_id IS NOT NULL THEN
        UPDATE public.performance_bonificacao SET atingiu_meta = false WHERE id = v_bonificacao_id;
      ELSE
        INSERT INTO public.performance_bonificacao (usuario_id, mes_referencia, itens_marcados, pontuacao_total, atingiu_meta)
        VALUES (v_user.id, v_mes, '[]'::jsonb, 0, false);
      END IF;
    END IF;
  END LOOP;
  
  -- 2. Correção Retroativa de Lote (Estornos na Carteira para quem não atingiu a meta)
  FOR v_record IN SELECT * FROM public.performance_bonificacao WHERE atingiu_meta = false LOOP
    IF NOT EXISTS (
      SELECT 1 FROM public.carteira_transacoes 
      WHERE origem_id = v_record.id AND tipo = 'debito'
    ) THEN
      -- Se a pessoa possui carteira
      IF EXISTS (SELECT 1 FROM public.usuarios WHERE id = v_record.usuario_id AND possui_carteira = true) THEN
        INSERT INTO public.carteira_transacoes (usuario_id, tipo, valor, descricao, mes_referencia, origem_id, criado_em)
        VALUES (
          v_record.usuario_id, 
          'debito', 
          350, 
          'ESTORNO DE: "Bonificação Feijão com Arroz" por nao cumprimento do objetivo proposto', 
          v_record.mes_referencia, 
          v_record.id,
          CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'
        );
      END IF;
    END IF;
  END LOOP;
END $$;

DO $$
DECLARE
  v_venda RECORD;
  v_lead_id uuid;
  v_mes_referencia text;
BEGIN
  -- Insert missing leads for existing vendas
  FOR v_venda IN SELECT * FROM public.vendas_confirmadas WHERE origem_id IS NOT NULL LOOP
    v_mes_referencia := to_char(v_venda.data_fechamento::date, 'YYYY-MM');
    
    SELECT id INTO v_lead_id FROM public.funil_leads 
    WHERE (
      (telefone IS NOT NULL AND telefone != '' AND telefone = v_venda.telefone) OR
      (lower(trim(nome)) = lower(trim(v_venda.paciente_nome)))
    )
    ORDER BY criado_em DESC LIMIT 1;

    IF v_lead_id IS NULL THEN
      INSERT INTO public.funil_leads (
        nome, telefone, origem_id, mes_referencia, status, temperatura, qtd_agendamentos, qtd_faltas, criado_em, atualizado_em
      ) VALUES (
        trim(v_venda.paciente_nome), v_venda.telefone, v_venda.origem_id, v_mes_referencia, 'venda_concretizada', 'quente', 1, 0, v_venda.criado_em, v_venda.atualizado_em
      );
    END IF;
  END LOOP;
  
  -- Recalculate funil_dados_mensais to reflect the exact truth
  FOR v_venda IN SELECT DISTINCT origem_id, to_char(data_fechamento::date, 'YYYY-MM') as mes FROM public.vendas_confirmadas WHERE origem_id IS NOT NULL LOOP
    PERFORM public.atualizar_funil_dados_mensais(v_venda.origem_id, v_venda.mes);
  END LOOP;
END $$;

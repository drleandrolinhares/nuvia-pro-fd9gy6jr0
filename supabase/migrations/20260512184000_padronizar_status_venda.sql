DO $$
DECLARE
  venda RECORD;
  novo_paciente_id uuid;
  nova_oportunidade_id uuid;
BEGIN
  -- 1. Padronizar status em avaliacoes e funil_leads
  UPDATE public.avaliacoes
  SET status = 'venda_concretizada'
  WHERE status = 'venda-fechada';

  UPDATE public.funil_leads
  SET status = 'venda_concretizada'
  WHERE status = 'venda-fechada';

  -- 2. Correção retroativa: garantir que todas as vendas tenham avaliação associada
  -- Isso corrige os casos antigos onde havia fechamento sem a etapa de avaliação/comparecimento.
  FOR venda IN SELECT * FROM public.vendas_confirmadas WHERE oportunidade_id IS NULL LOOP
    
    -- Busca paciente pelo nome, ou cria
    SELECT id INTO novo_paciente_id FROM public.pacientes WHERE nome ILIKE venda.paciente_nome LIMIT 1;
    
    IF novo_paciente_id IS NULL THEN
      novo_paciente_id := gen_random_uuid();
      INSERT INTO public.pacientes (id, nome, telefone) VALUES (novo_paciente_id, venda.paciente_nome, venda.telefone);
    END IF;
    
    -- Cria avaliação retroativa servindo de elo
    nova_oportunidade_id := gen_random_uuid();
    INSERT INTO public.avaliacoes (
      id, paciente_id, dentista_avaliador_id, crc_comercial_id, 
      data_avaliacao, data_fechamento, valor_orcamento, valor_entrada, 
      status, temperatura_lead, origem_id, destino_fiscal
    ) VALUES (
      nova_oportunidade_id, novo_paciente_id, venda.dentista_avaliador, venda.crc,
      COALESCE(venda.data_original, venda.data_fechamento), venda.data_fechamento, venda.valor_tratamento, venda.valor_entrada,
      'venda_concretizada', 'quente', venda.origem_id, venda.destino_fiscal
    );
    
    -- Atualiza a venda com o ID da nova avaliação (oportunidade)
    UPDATE public.vendas_confirmadas SET oportunidade_id = nova_oportunidade_id WHERE id = venda.id;
    
  END LOOP;
END $$;

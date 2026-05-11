CREATE OR REPLACE FUNCTION public.trg_sync_carteira_bonificacao()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $$
DECLARE
  v_possui_carteira boolean;
  v_credito_existente boolean;
  v_debito_existente boolean;
BEGIN
  -- Verifica se o usuário possui carteira
  SELECT possui_carteira INTO v_possui_carteira FROM public.usuarios WHERE id = NEW.usuario_id;
  
  IF COALESCE(v_possui_carteira, true) = false THEN
    RETURN NEW;
  END IF;

  -- Verifica se o crédito já existe
  SELECT EXISTS (
    SELECT 1 FROM public.carteira_transacoes 
    WHERE origem_id = NEW.id AND tipo = 'credito'
  ) INTO v_credito_existente;

  -- Insere o crédito apenas se não existir, evitando sobrescrever histórico
  IF NOT v_credito_existente THEN
    INSERT INTO public.carteira_transacoes (usuario_id, tipo, valor, descricao, mes_referencia, origem_id, criado_em)
    VALUES (
      NEW.usuario_id, 
      'credito', 
      350, 
      'Crédito: Bonificação Feijão com Arroz - ' || NEW.mes_referencia, 
      NEW.mes_referencia, 
      NEW.id,
      CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'
    );
  END IF;

  -- Gerencia o Débito
  IF NEW.atingiu_meta THEN
    -- Se atingiu a meta, remove qualquer débito existente (caso tenha sido gerado antes)
    DELETE FROM public.carteira_transacoes 
    WHERE origem_id = NEW.id AND tipo = 'debito';
  ELSE
    -- Adiciona o débito imediatamente
    SELECT EXISTS (
      SELECT 1 FROM public.carteira_transacoes 
      WHERE origem_id = NEW.id AND tipo = 'debito'
    ) INTO v_debito_existente;

    IF NOT v_debito_existente THEN
      INSERT INTO public.carteira_transacoes (usuario_id, tipo, valor, descricao, mes_referencia, origem_id, criado_em)
      VALUES (
        NEW.usuario_id, 
        'debito', 
        350, 
        'ESTORNO DE: "Bonificação Feijão com Arroz" por nao cumprimento do objetivo proposto', 
        NEW.mes_referencia, 
        NEW.id,
        CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DO $$
DECLARE
  v_bonificacao RECORD;
  v_debito_existente boolean;
BEGIN
  FOR v_bonificacao IN 
    SELECT * FROM public.performance_bonificacao 
    WHERE atingiu_meta = false
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM public.carteira_transacoes 
      WHERE origem_id = v_bonificacao.id AND tipo = 'debito'
    ) INTO v_debito_existente;

    IF NOT v_debito_existente THEN
      INSERT INTO public.carteira_transacoes (usuario_id, tipo, valor, descricao, mes_referencia, origem_id, criado_em)
      VALUES (
        v_bonificacao.usuario_id, 
        'debito', 
        350, 
        'ESTORNO DE: "Bonificação Feijão com Arroz" por nao cumprimento do objetivo proposto', 
        v_bonificacao.mes_referencia, 
        v_bonificacao.id,
        CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'
      );
    END IF;
  END LOOP;
END $$;

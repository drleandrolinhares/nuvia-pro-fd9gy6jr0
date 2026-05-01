-- 1. Corrige a trigger para NÃO debitar imediatamente no mês corrente
CREATE OR REPLACE FUNCTION public.trg_sync_carteira_bonificacao()
RETURNS trigger AS $func$
DECLARE
  v_possui_carteira boolean;
  v_credito_existente boolean;
  v_debito_existente boolean;
  v_mes_atual text;
BEGIN
  -- Verifica se o usuário possui carteira
  SELECT possui_carteira INTO v_possui_carteira FROM public.usuarios WHERE id = NEW.usuario_id;
  
  IF COALESCE(v_possui_carteira, true) = false THEN
    RETURN NEW;
  END IF;

  v_mes_atual := to_char((CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'), 'YYYY-MM');

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
    -- Se não atingiu a meta, APENAS adiciona o débito se já PASSOU do mês de referência
    -- Isso garante que o adiantamento fique limpo durante o mês corrente
    IF NEW.mes_referencia < v_mes_atual THEN
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
          'Débito: Desclassificação Bonificação Feijão com Arroz', 
          NEW.mes_referencia, 
          NEW.id,
          CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'
        );
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$func$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Atualiza as funções de Adiantamento para usar o fuso horário America/Sao_Paulo
CREATE OR REPLACE FUNCTION public.gerar_adiantamento_mes_google(p_mes text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
  v_user RECORD;
BEGIN
  FOR v_user IN SELECT * FROM public.usuarios WHERE possui_carteira = true AND status = 'ativo' LOOP
    IF NOT EXISTS (
      SELECT 1 FROM public.carteira_transacoes 
      WHERE usuario_id = v_user.id 
      AND mes_referencia = p_mes 
      AND descricao = 'Adiantamento Google Avaliações (Meta 5)'
    ) THEN
      INSERT INTO public.carteira_transacoes (usuario_id, tipo, valor, descricao, mes_referencia, criado_em)
      VALUES (
        v_user.id, 
        'credito', 
        100, 
        'Adiantamento Google Avaliações (Meta 5)', 
        p_mes,
        CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'
      );
    END IF;
  END LOOP;
END;
$func$;

CREATE OR REPLACE FUNCTION public.gerar_adiantamento_mes_inovacao(p_mes text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
  v_user RECORD;
BEGIN
  FOR v_user IN SELECT * FROM public.usuarios WHERE possui_carteira = true AND status = 'ativo' LOOP
    IF NOT EXISTS (
      SELECT 1 FROM public.carteira_transacoes 
      WHERE usuario_id = v_user.id 
      AND mes_referencia = p_mes 
      AND descricao = 'Adiantamento de Inovação'
    ) THEN
      INSERT INTO public.carteira_transacoes (usuario_id, tipo, valor, descricao, mes_referencia, criado_em)
      VALUES (
        v_user.id, 
        'credito', 
        100, 
        'Adiantamento de Inovação', 
        p_mes,
        CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'
      );
    END IF;
  END LOOP;
END;
$func$;

CREATE OR REPLACE FUNCTION public.gerar_adiantamento_mes_sorriso(p_mes text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
  v_user RECORD;
  v_config RECORD;
BEGIN
  SELECT * INTO v_config FROM public.sorriso_dos_sonhos_config LIMIT 1;
  
  FOR v_user IN SELECT * FROM public.usuarios WHERE possui_carteira = true AND status = 'ativo' LOOP
    IF v_config.id IS NULL OR v_config.usuarios_elegiveis IS NULL OR v_config.usuarios_elegiveis = '[]'::jsonb OR v_config.usuarios_elegiveis @> ('"' || v_user.id || '"')::jsonb THEN
      IF NOT EXISTS (
        SELECT 1 FROM public.carteira_transacoes 
        WHERE usuario_id = v_user.id 
        AND mes_referencia = p_mes 
        AND descricao = 'Adiantamento de Meta (4 indicações - Programa Sorriso dos Sonhos)'
      ) THEN
        INSERT INTO public.carteira_transacoes (usuario_id, tipo, valor, descricao, mes_referencia, criado_em)
        VALUES (
          v_user.id, 
          'credito', 
          200, 
          'Adiantamento de Meta (4 indicações - Programa Sorriso dos Sonhos)', 
          p_mes,
          CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'
        );
      END IF;
    END IF;
  END LOOP;
END;
$func$;

CREATE OR REPLACE FUNCTION public.gerar_todos_adiantamentos_mensais()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
  v_mes_atual text;
  v_data_atual date := (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')::date;
  v_user RECORD;
BEGIN
  -- Trava de segurança: Iniciar apenas a partir de 1º de Maio de 2026
  IF v_data_atual < '2026-05-01'::date THEN
    RETURN;
  END IF;

  v_mes_atual := to_char(v_data_atual, 'YYYY-MM');

  -- 1. Gerar Adiantamentos Específicos usando funções existentes
  PERFORM public.gerar_adiantamento_mes_google(v_mes_atual);
  PERFORM public.gerar_adiantamento_mes_inovacao(v_mes_atual);
  PERFORM public.gerar_adiantamento_mes_sorriso(v_mes_atual);

  -- 2. Gerar registros base de Bonificação Feijão com Arroz para acionar o trigger de adiantamento
  FOR v_user IN SELECT id FROM public.usuarios WHERE status = 'ativo' AND possui_carteira = true LOOP
    IF NOT EXISTS (
      SELECT 1 FROM public.performance_bonificacao 
      WHERE usuario_id = v_user.id AND mes_referencia = v_mes_atual
    ) THEN
      INSERT INTO public.performance_bonificacao (usuario_id, mes_referencia, itens_marcados, pontuacao_total, atingiu_meta)
      VALUES (v_user.id, v_mes_atual, '[]'::jsonb, 0, false);
    END IF;
  END LOOP;
END;
$func$;

-- 3. Função para processar o fechamento do Feijão com Arroz no fim do mês
CREATE OR REPLACE FUNCTION public.processar_fechamento_mes_feijao(p_mes text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
  v_bonificacao RECORD;
  v_debito_existente boolean;
BEGIN
  FOR v_bonificacao IN 
    SELECT * FROM public.performance_bonificacao 
    WHERE mes_referencia = p_mes AND atingiu_meta = false
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
        'Débito: Desclassificação Bonificação Feijão com Arroz', 
        p_mes, 
        v_bonificacao.id,
        CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'
      );
    END IF;
  END LOOP;
END;
$func$;

DO $DO$
BEGIN
  -- 4. Ajustar o cron para rodar às 03:00 UTC (00:00 BRT)
  IF EXISTS (
    SELECT 1
    FROM pg_extension
    WHERE extname = 'pg_cron'
  ) THEN
    BEGIN
      PERFORM cron.unschedule('job_adiantamentos_mensais');
    EXCEPTION
      WHEN OTHERS THEN NULL;
    END;
    
    PERFORM cron.schedule('job_adiantamentos_mensais', '0 3 1 * *', 'SELECT public.gerar_todos_adiantamentos_mensais();');
  END IF;

  -- 5. Limpar os débitos indevidos do Feijão com Arroz gerados precocemente em Maio (05)
  DELETE FROM public.carteira_transacoes 
  WHERE mes_referencia = '2026-05' 
    AND tipo = 'debito' 
    AND descricao = 'Débito: Desclassificação Bonificação Feijão com Arroz';

  -- 6. Corrigir Timestamps de Maio que foram erroneamente registrados em Abril (devido ao UTC da trigger/cron)
  UPDATE public.carteira_transacoes
  SET criado_em = '2026-05-01 08:00:00-03'::timestamptz
  WHERE mes_referencia = '2026-05'
    AND criado_em < '2026-05-01 00:00:00-03'::timestamptz;
END;
$DO$;

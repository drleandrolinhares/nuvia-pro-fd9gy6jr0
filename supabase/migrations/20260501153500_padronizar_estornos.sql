-- Atualiza descrições de estornos manuais e automáticos existentes

UPDATE public.carteira_transacoes
SET descricao = 'ESTORNO DE: "Bonificação Feijão com Arroz" por nao cumprimento do objetivo proposto'
WHERE descricao = 'Débito: Desclassificação Bonificação Feijão com Arroz';

UPDATE public.carteira_transacoes
SET descricao = 'ESTORNO DE: "Adiantamento Google Avaliações (Meta 5)" por nao cumprimento do objetivo proposto'
WHERE descricao = 'Ajuste de Meta Google (não atingiu 5)';

UPDATE public.carteira_transacoes
SET descricao = 'ESTORNO DE: "Adiantamento de Inovação" por nao cumprimento do objetivo proposto'
WHERE descricao IN ('Ajuste de Inovação (nenhuma validada)', 'Estorno de Adiantamento de Inovação (nenhuma validada)');

UPDATE public.carteira_transacoes
SET descricao = 'ESTORNO DE: "Adiantamento de Meta (4 indicações - Programa Sorriso dos Sonhos)" por nao cumprimento do objetivo proposto'
WHERE descricao = 'Ajuste de Meta (não atingimento das 4 indicações)';

-- Também padroniza os estornos manuais antigos que começam com "Estorno de:"
UPDATE public.carteira_transacoes
SET descricao = REGEXP_REPLACE(
    descricao, 
    '^Estorno de: (.*?) — Realizado por: (.*)$', 
    'ESTORNO DE: "\1" por nao cumprimento do objetivo proposto — Realizado por: \2'
)
WHERE descricao LIKE 'Estorno de:%' AND descricao LIKE '%— Realizado por:%';

UPDATE public.carteira_transacoes
SET descricao = REGEXP_REPLACE(
    descricao, 
    '^Estorno de: (.*)$', 
    'ESTORNO DE: "\1" por nao cumprimento do objetivo proposto'
)
WHERE descricao LIKE 'Estorno de:%' AND descricao NOT LIKE '%— Realizado por:%';

-- Remove duplicatas de estorno baseadas na transacao_original_id
DELETE FROM public.carteira_transacoes a USING (
    SELECT MIN(id) as min_id, transacao_original_id
    FROM public.carteira_transacoes
    WHERE transacao_original_id IS NOT NULL
    GROUP BY transacao_original_id
    HAVING COUNT(*) > 1
) b
WHERE a.transacao_original_id = b.transacao_original_id AND a.id <> b.min_id;

-- Cria trava de banco de dados para evitar múltiplos estornos da mesma transação original
CREATE UNIQUE INDEX IF NOT EXISTS carteira_transacoes_transacao_original_id_idx ON public.carteira_transacoes (transacao_original_id) WHERE transacao_original_id IS NOT NULL;

-- Remove duplicatas baseadas na descrição exata (quando feitas pelo sistema antigo sem transacao_original_id)
DELETE FROM public.carteira_transacoes a USING (
    SELECT MIN(id) as min_id, usuario_id, mes_referencia, tipo, valor, descricao
    FROM public.carteira_transacoes
    WHERE descricao LIKE 'ESTORNO DE:%'
    GROUP BY usuario_id, mes_referencia, tipo, valor, descricao
    HAVING COUNT(*) > 1
) b
WHERE a.usuario_id = b.usuario_id 
  AND a.mes_referencia = b.mes_referencia 
  AND a.tipo = b.tipo 
  AND a.valor = b.valor 
  AND a.descricao = b.descricao 
  AND a.id <> b.min_id;

-- Atualização das funções
CREATE OR REPLACE FUNCTION public.processar_fechamento_mes_feijao(p_mes text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
        'ESTORNO DE: "Bonificação Feijão com Arroz" por nao cumprimento do objetivo proposto', 
        p_mes, 
        v_bonificacao.id,
        CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'
      );
    END IF;
  END LOOP;
END;
$function$;

CREATE OR REPLACE FUNCTION public.processar_fechamento_mes_google(p_mes text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_user RECORD;
  v_count integer;
BEGIN
  FOR v_user IN SELECT * FROM public.usuarios WHERE possui_carteira = true AND status = 'ativo' LOOP
    IF EXISTS (
      SELECT 1 FROM public.carteira_transacoes 
      WHERE usuario_id = v_user.id 
      AND mes_referencia = p_mes 
      AND descricao = 'Adiantamento Google Avaliações (Meta 5)'
    ) THEN
      IF NOT EXISTS (
        SELECT 1 FROM public.carteira_transacoes 
        WHERE usuario_id = v_user.id 
        AND mes_referencia = p_mes 
        AND descricao = 'ESTORNO DE: "Adiantamento Google Avaliações (Meta 5)" por nao cumprimento do objetivo proposto'
      ) THEN
        SELECT COUNT(*) INTO v_count 
        FROM public.performance_google_reviews 
        WHERE usuario_id = v_user.id 
          AND status = 'validado' 
          AND mes_referencia = p_mes;
          
        IF v_count < 5 THEN
          INSERT INTO public.carteira_transacoes (usuario_id, tipo, valor, descricao, mes_referencia)
          VALUES (v_user.id, 'debito', 100, 'ESTORNO DE: "Adiantamento Google Avaliações (Meta 5)" por nao cumprimento do objetivo proposto', p_mes);
        END IF;
      END IF;
    END IF;
  END LOOP;
END;
$function$;

CREATE OR REPLACE FUNCTION public.processar_fechamento_mes_inovacao(p_mes text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_user RECORD;
  v_count integer;
BEGIN
  FOR v_user IN SELECT * FROM public.usuarios WHERE possui_carteira = true AND status = 'ativo' LOOP
    IF EXISTS (
      SELECT 1 FROM public.carteira_transacoes 
      WHERE usuario_id = v_user.id 
      AND mes_referencia = p_mes 
      AND descricao = 'Adiantamento de Inovação'
    ) THEN
      IF NOT EXISTS (
        SELECT 1 FROM public.carteira_transacoes 
        WHERE usuario_id = v_user.id 
        AND mes_referencia = p_mes 
        AND descricao = 'ESTORNO DE: "Adiantamento de Inovação" por nao cumprimento do objetivo proposto'
      ) THEN
        SELECT COUNT(*) INTO v_count 
        FROM public.performance_pp_pdm 
        WHERE usuario_id = v_user.id 
          AND inovacao_validada = true 
          AND to_char(data_registro::date, 'YYYY-MM') = p_mes;
          
        IF v_count = 0 THEN
          INSERT INTO public.carteira_transacoes (usuario_id, tipo, valor, descricao, mes_referencia)
          VALUES (v_user.id, 'debito', 100, 'ESTORNO DE: "Adiantamento de Inovação" por nao cumprimento do objetivo proposto', p_mes);
        END IF;
      END IF;
    END IF;
  END LOOP;
END;
$function$;

CREATE OR REPLACE FUNCTION public.processar_fechamento_mes_sorriso(p_mes text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_user RECORD;
  v_config RECORD;
  v_count integer;
  v_falta integer;
  v_valor_debito numeric;
  v_valor_por_indicacao numeric;
BEGIN
  SELECT * INTO v_config FROM public.sorriso_dos_sonhos_config LIMIT 1;
  v_valor_por_indicacao := COALESCE(v_config.valor_bonus, 100) / COALESCE(v_config.meta_indicacoes, 2);

  FOR v_user IN SELECT * FROM public.usuarios WHERE possui_carteira = true AND status = 'ativo' LOOP
    IF v_config.id IS NULL OR v_config.usuarios_elegiveis IS NULL OR v_config.usuarios_elegiveis = '[]'::jsonb OR v_config.usuarios_elegiveis @> ('"' || v_user.id || '"')::jsonb THEN
      IF EXISTS (
        SELECT 1 FROM public.carteira_transacoes 
        WHERE usuario_id = v_user.id 
        AND mes_referencia = p_mes 
        AND descricao = 'Adiantamento de Meta (4 indicações - Programa Sorriso dos Sonhos)'
      ) THEN
        IF NOT EXISTS (
          SELECT 1 FROM public.carteira_transacoes 
          WHERE usuario_id = v_user.id 
          AND mes_referencia = p_mes 
          AND descricao = 'ESTORNO DE: "Adiantamento de Meta (4 indicações - Programa Sorriso dos Sonhos)" por nao cumprimento do objetivo proposto'
        ) THEN
          SELECT COUNT(*) INTO v_count 
          FROM public.sorriso_dos_sonhos_indicacoes 
          WHERE colaborador_id = v_user.id 
            AND status = 'fechado' 
            AND to_char(data_fechamento::date, 'YYYY-MM') = p_mes;
            
          IF v_count < 4 THEN
            v_falta := 4 - v_count;
            v_valor_debito := v_falta * v_valor_por_indicacao;
            
            INSERT INTO public.carteira_transacoes (usuario_id, tipo, valor, descricao, mes_referencia)
            VALUES (v_user.id, 'debito', v_valor_debito, 'ESTORNO DE: "Adiantamento de Meta (4 indicações - Programa Sorriso dos Sonhos)" por nao cumprimento do objetivo proposto', p_mes);
          END IF;
        END IF;
      END IF;
    END IF;
  END LOOP;
END;
$function$;

CREATE OR REPLACE FUNCTION public.trg_sync_carteira_bonificacao()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
          'ESTORNO DE: "Bonificação Feijão com Arroz" por nao cumprimento do objetivo proposto', 
          NEW.mes_referencia, 
          NEW.id,
          CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'
        );
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

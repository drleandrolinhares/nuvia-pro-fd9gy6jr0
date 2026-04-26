-- Function to generate adiantamento
CREATE OR REPLACE FUNCTION public.gerar_adiantamento_mes_sorriso(p_mes text)
RETURNS void AS $$
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
        INSERT INTO public.carteira_transacoes (usuario_id, tipo, valor, descricao, mes_referencia)
        VALUES (v_user.id, 'credito', 200, 'Adiantamento de Meta (4 indicações - Programa Sorriso dos Sonhos)', p_mes);
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process debits at end of month
CREATE OR REPLACE FUNCTION public.processar_fechamento_mes_sorriso(p_mes text)
RETURNS void AS $$
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
          AND descricao = 'Ajuste de Meta (não atingimento das 4 indicações)'
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
            VALUES (v_user.id, 'debito', v_valor_debito, 'Ajuste de Meta (não atingimento das 4 indicações)', p_mes);
          END IF;
        END IF;
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to handle 5th+ indications
CREATE OR REPLACE FUNCTION public.trg_sorriso_fechamento()
RETURNS trigger AS $$
DECLARE
  v_count integer;
  v_mes text;
  v_config RECORD;
  v_meta integer;
  v_valor numeric;
BEGIN
  IF OLD.status IS DISTINCT FROM 'fechado' AND NEW.status = 'fechado' THEN
    IF NEW.data_fechamento IS NULL THEN
      NEW.data_fechamento := CURRENT_DATE;
    END IF;
    
    v_mes := to_char(NEW.data_fechamento::date, 'YYYY-MM');
    
    SELECT COUNT(*) INTO v_count 
    FROM public.sorriso_dos_sonhos_indicacoes 
    WHERE colaborador_id = NEW.colaborador_id 
      AND status = 'fechado' 
      AND to_char(data_fechamento::date, 'YYYY-MM') = v_mes;
      
    SELECT * INTO v_config FROM public.sorriso_dos_sonhos_config LIMIT 1;
    v_meta := COALESCE(v_config.meta_indicacoes, 2);
    v_valor := COALESCE(v_config.valor_bonus, 100);
    
    IF v_count > 4 AND MOD(v_count - 4, v_meta) = 0 THEN
      INSERT INTO public.carteira_transacoes (usuario_id, tipo, valor, descricao, mes_referencia, origem_id)
      VALUES (
        NEW.colaborador_id, 
        'credito', 
        v_valor, 
        'Bônus Adicional: ' || v_count || 'ª Indicação (Programa Sorriso dos Sonhos)', 
        v_mes, 
        NULL
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sorriso_fechamento_after ON public.sorriso_dos_sonhos_indicacoes;
CREATE TRIGGER trg_sorriso_fechamento_after
AFTER UPDATE ON public.sorriso_dos_sonhos_indicacoes
FOR EACH ROW EXECUTE FUNCTION public.trg_sorriso_fechamento();

-- Run adiantamento for the current month
DO $$
BEGIN
  PERFORM public.gerar_adiantamento_mes_sorriso(to_char(CURRENT_DATE, 'YYYY-MM'));
END $$;

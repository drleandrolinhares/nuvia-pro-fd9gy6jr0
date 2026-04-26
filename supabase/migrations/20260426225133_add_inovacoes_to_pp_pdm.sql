ALTER TABLE public.performance_pp_pdm
ADD COLUMN IF NOT EXISTS inovacoes text DEFAULT '',
ADD COLUMN IF NOT EXISTS pp_validado boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS inovacao_validada boolean DEFAULT false;

CREATE OR REPLACE FUNCTION public.gerar_adiantamento_mes_inovacao(p_mes text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
      INSERT INTO public.carteira_transacoes (usuario_id, tipo, valor, descricao, mes_referencia)
      VALUES (v_user.id, 'credito', 100, 'Adiantamento de Inovação', p_mes);
    END IF;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.processar_fechamento_mes_inovacao(p_mes text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
        AND (descricao = 'Ajuste de Inovação (nenhuma validada)' OR descricao = 'Estorno de Adiantamento de Inovação (nenhuma validada)')
      ) THEN
        SELECT COUNT(*) INTO v_count 
        FROM public.performance_pp_pdm 
        WHERE usuario_id = v_user.id 
          AND inovacao_validada = true 
          AND to_char(data_registro::date, 'YYYY-MM') = p_mes;
          
        IF v_count = 0 THEN
          INSERT INTO public.carteira_transacoes (usuario_id, tipo, valor, descricao, mes_referencia)
          VALUES (v_user.id, 'debito', 100, 'Estorno de Adiantamento de Inovação (nenhuma validada)', p_mes);
        END IF;
      END IF;
    END IF;
  END LOOP;
END;
$$;

-- Habilita a extensão do cron (se disponível)
DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_cron;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Não foi possível criar extensão pg_cron: %', SQLERRM;
END $$;

-- Função que centraliza a geração de todos os adiantamentos
CREATE OR REPLACE FUNCTION public.gerar_todos_adiantamentos_mensais()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_mes_atual text;
  v_data_atual date := CURRENT_DATE;
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
  -- O trigger trg_sync_carteira_bonificacao fará a inserção do crédito na carteira
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
$$;

-- Agendar a execução para todo dia 1º à meia-noite
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_extension
    WHERE extname = 'pg_cron'
  ) THEN
    -- Remove se já existir para garantir idempotência
    BEGIN
      PERFORM cron.unschedule('job_adiantamentos_mensais');
    EXCEPTION
      WHEN OTHERS THEN NULL;
    END;
    
    -- Agenda para as 00:00 do dia 1º de cada mês
    PERFORM cron.schedule('job_adiantamentos_mensais', '0 0 1 * *', 'SELECT public.gerar_todos_adiantamentos_mensais();');
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Não foi possível agendar o job no pg_cron: %', SQLERRM;
END $$;

DO $$
DECLARE
  v_mes text;
BEGIN
  -- Get the current month in YYYY-MM format
  v_mes := to_char(CURRENT_DATE, 'YYYY-MM');

  -- Call the existing functions to generate advances for all eligible users
  PERFORM public.gerar_adiantamento_mes_inovacao(v_mes);
  PERFORM public.gerar_adiantamento_mes_sorriso(v_mes);
END $$;

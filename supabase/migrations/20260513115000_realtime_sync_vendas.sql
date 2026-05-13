-- Flexibiliza o gatilho prevent_duplicate_avaliacoes_tg para permitir atualização de vendas
CREATE OR REPLACE FUNCTION public.trg_prevent_duplicate_avaliacoes()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.avaliacoes 
    WHERE paciente_id = NEW.paciente_id 
      AND to_char(COALESCE(data_avaliacao, criado_em, CURRENT_DATE)::date, 'YYYY-MM') = to_char(COALESCE(NEW.data_avaliacao, NEW.criado_em, CURRENT_DATE)::date, 'YYYY-MM')
      AND id != NEW.id
      AND status != 'venda_concretizada'
      AND status != 'venda-fechada'
      AND NEW.status != 'venda_concretizada'
      AND NEW.status != 'venda-fechada'
  ) THEN
    RAISE WARNING 'Já existe uma oportunidade registrada para este paciente neste mês.';
  END IF;
  RETURN NEW;
END;
$function$;

-- Gatilho para atualizar funil_dados_mensais ao alterar vendas_confirmadas
CREATE OR REPLACE FUNCTION public.trg_vendas_confirmadas_update_funil()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF OLD.valor_tratamento IS DISTINCT FROM NEW.valor_tratamento OR OLD.data_fechamento IS DISTINCT FROM NEW.data_fechamento OR OLD.origem_id IS DISTINCT FROM NEW.origem_id THEN
      IF OLD.origem_id IS NOT NULL THEN
        PERFORM public.atualizar_funil_dados_mensais(OLD.origem_id, to_char(OLD.data_fechamento::date, 'YYYY-MM'));
      END IF;
      IF NEW.origem_id IS NOT NULL THEN
        PERFORM public.atualizar_funil_dados_mensais(NEW.origem_id, to_char(NEW.data_fechamento::date, 'YYYY-MM'));
      END IF;
    END IF;
  ELSIF TG_OP = 'INSERT' THEN
    IF NEW.origem_id IS NOT NULL THEN
      PERFORM public.atualizar_funil_dados_mensais(NEW.origem_id, to_char(NEW.data_fechamento::date, 'YYYY-MM'));
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.origem_id IS NOT NULL THEN
      PERFORM public.atualizar_funil_dados_mensais(OLD.origem_id, to_char(OLD.data_fechamento::date, 'YYYY-MM'));
    END IF;
  END IF;
  RETURN NULL;
END;
$function$;

DROP TRIGGER IF EXISTS trg_vendas_confirmadas_update_funil_tg ON public.vendas_confirmadas;
CREATE TRIGGER trg_vendas_confirmadas_update_funil_tg
  AFTER INSERT OR UPDATE OR DELETE ON public.vendas_confirmadas
  FOR EACH ROW EXECUTE FUNCTION public.trg_vendas_confirmadas_update_funil();

-- Equalizar divergências de valores entre avaliacoes e vendas_confirmadas
DO $$
DECLARE
  v_rec RECORD;
BEGIN
  FOR v_rec IN 
    SELECT a.id as avaliacao_id, a.valor_orcamento, a.valor_entrada, v.id as venda_id 
    FROM public.avaliacoes a
    JOIN public.vendas_confirmadas v ON v.oportunidade_id = a.id
    WHERE (v.valor_tratamento IS DISTINCT FROM a.valor_orcamento AND a.valor_orcamento > 0)
       OR (v.valor_entrada IS DISTINCT FROM a.valor_entrada AND a.valor_entrada > 0)
  LOOP
    UPDATE public.vendas_confirmadas 
    SET valor_tratamento = v_rec.valor_orcamento,
        valor_entrada = v_rec.valor_entrada,
        percentual_entrada = CASE WHEN v_rec.valor_orcamento > 0 THEN (v_rec.valor_entrada / v_rec.valor_orcamento) * 100 ELSE 0 END
    WHERE id = v_rec.venda_id;
  END LOOP;
  
  FOR v_rec IN 
    SELECT DISTINCT origem_id, to_char(data_fechamento::date, 'YYYY-MM') as mes_referencia
    FROM public.vendas_confirmadas
    WHERE origem_id IS NOT NULL
  LOOP
    PERFORM public.atualizar_funil_dados_mensais(v_rec.origem_id, v_rec.mes_referencia);
  END LOOP;
END $$;

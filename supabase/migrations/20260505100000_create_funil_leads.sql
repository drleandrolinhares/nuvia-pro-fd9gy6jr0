-- CREATE funil_leads TABLE
CREATE TABLE IF NOT EXISTS public.funil_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    telefone TEXT,
    origem_id UUID REFERENCES public.funil_origens(id) ON DELETE CASCADE NOT NULL,
    descricao TEXT,
    temperatura TEXT DEFAULT 'frio'::text,
    status TEXT DEFAULT 'novo'::text,
    mes_referencia TEXT NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.funil_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "funil_leads_all" ON public.funil_leads;
CREATE POLICY "funil_leads_all" ON public.funil_leads
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.trg_update_funil_dados_mensais_from_leads()
RETURNS trigger AS $$
DECLARE
  v_origem_id UUID;
  v_mes_referencia TEXT;
  v_total_leads INT;
  v_agendamentos INT;
  v_comparecimentos INT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_origem_id := OLD.origem_id;
    v_mes_referencia := OLD.mes_referencia;
  ELSE
    v_origem_id := NEW.origem_id;
    v_mes_referencia := NEW.mes_referencia;
  END IF;

  SELECT COUNT(*) INTO v_total_leads FROM public.funil_leads WHERE origem_id = v_origem_id AND mes_referencia = v_mes_referencia;
  SELECT COUNT(*) INTO v_agendamentos FROM public.funil_leads WHERE origem_id = v_origem_id AND mes_referencia = v_mes_referencia AND status IN ('agendado', 'atendido', 'faltou');
  SELECT COUNT(*) INTO v_comparecimentos FROM public.funil_leads WHERE origem_id = v_origem_id AND mes_referencia = v_mes_referencia AND status = 'atendido';

  INSERT INTO public.funil_dados_mensais (
    origem_id, 
    mes_referencia, 
    leads_realizado, 
    agendamentos_realizado, 
    comparecimentos_realizado,
    investimento,
    meta_leads,
    meta_agendamentos_qtde,
    meta_agendamentos_perc,
    meta_comparecimentos_qtde,
    meta_comparecimentos_perc,
    meta_fechamento_valor,
    ticket_medio_esperado,
    fechamentos_qtde_realizado,
    fechamentos_valor_realizado
  )
  VALUES (
    v_origem_id, 
    v_mes_referencia, 
    v_total_leads, 
    v_agendamentos, 
    v_comparecimentos,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0
  )
  ON CONFLICT (origem_id, mes_referencia) 
  DO UPDATE SET
    leads_realizado = EXCLUDED.leads_realizado,
    agendamentos_realizado = EXCLUDED.agendamentos_realizado,
    comparecimentos_realizado = EXCLUDED.comparecimentos_realizado,
    atualizado_em = NOW();

  -- Se alterou a origem ou o mês, atualiza também a contagem da origem/mês antigo
  IF TG_OP = 'UPDATE' AND (NEW.origem_id != OLD.origem_id OR NEW.mes_referencia != OLD.mes_referencia) THEN
    SELECT COUNT(*) INTO v_total_leads FROM public.funil_leads WHERE origem_id = OLD.origem_id AND mes_referencia = OLD.mes_referencia;
    SELECT COUNT(*) INTO v_agendamentos FROM public.funil_leads WHERE origem_id = OLD.origem_id AND mes_referencia = OLD.mes_referencia AND status IN ('agendado', 'atendido', 'faltou');
    SELECT COUNT(*) INTO v_comparecimentos FROM public.funil_leads WHERE origem_id = OLD.origem_id AND mes_referencia = OLD.mes_referencia AND status = 'atendido';

    UPDATE public.funil_dados_mensais
    SET 
      leads_realizado = v_total_leads,
      agendamentos_realizado = v_agendamentos,
      comparecimentos_realizado = v_comparecimentos,
      atualizado_em = NOW()
    WHERE origem_id = OLD.origem_id AND mes_referencia = OLD.mes_referencia;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_funil_dados_mensais_leads ON public.funil_leads;
CREATE TRIGGER trg_update_funil_dados_mensais_leads
AFTER INSERT OR UPDATE OR DELETE ON public.funil_leads
FOR EACH ROW EXECUTE FUNCTION public.trg_update_funil_dados_mensais_from_leads();

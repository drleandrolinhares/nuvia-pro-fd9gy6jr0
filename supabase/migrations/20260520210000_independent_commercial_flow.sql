-- Add avaliacao_id to funil_leads to link directly and avoid merging based on phone/name
ALTER TABLE public.funil_leads ADD COLUMN IF NOT EXISTS avaliacao_id uuid REFERENCES public.avaliacoes(id) ON DELETE SET NULL;

-- Remove any potentially interfering unique constraints (none strictly prevent this right now, but we enforce safety)
ALTER TABLE public.vendas_confirmadas DROP CONSTRAINT IF EXISTS vendas_confirmadas_paciente_nome_data_fechamento_key;
ALTER TABLE public.vendas_diarias DROP CONSTRAINT IF EXISTS vendas_diarias_paciente_nome_data_venda_key;
ALTER TABLE public.avaliacoes DROP CONSTRAINT IF EXISTS avaliacoes_paciente_id_data_avaliacao_key;

-- Ensure RLS policies on vendas_confirmadas, compromissos, and funil_leads_historico
DROP POLICY IF EXISTS "vendas_confirmadas_all" ON public.vendas_confirmadas;
CREATE POLICY "vendas_confirmadas_all" ON public.vendas_confirmadas
  FOR ALL TO authenticated USING (tenant_id = get_my_tenant_id()) WITH CHECK (tenant_id = get_my_tenant_id());

DROP POLICY IF EXISTS "compromissos_all" ON public.compromissos;
CREATE POLICY "compromissos_all" ON public.compromissos
  FOR ALL TO authenticated USING (tenant_id = get_my_tenant_id()) WITH CHECK (tenant_id = get_my_tenant_id());

DROP POLICY IF EXISTS "funil_leads_historico_all" ON public.funil_leads_historico;
CREATE POLICY "funil_leads_historico_all" ON public.funil_leads_historico
  FOR ALL TO authenticated USING (tenant_id = get_my_tenant_id()) WITH CHECK (tenant_id = get_my_tenant_id());

-- Update the triggers to NOT force-merge data. If a sale is independent, it creates its own funnel lead.
CREATE OR REPLACE FUNCTION public.trg_avaliacoes_to_funil()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_lead_id uuid;
  v_paciente RECORD;
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.origem_id IS NOT NULL THEN
      
      SELECT nome, telefone INTO v_paciente FROM public.pacientes WHERE id = NEW.paciente_id;
      
      SELECT id INTO v_lead_id FROM public.funil_leads 
      WHERE avaliacao_id = NEW.id
      LIMIT 1;

      -- Fallback to old logic for backward compatibility if it's an update and avaliacao_id was null
      IF v_lead_id IS NULL AND TG_OP = 'UPDATE' THEN
          SELECT id INTO v_lead_id FROM public.funil_leads 
          WHERE (
            (telefone IS NOT NULL AND telefone != '' AND telefone = v_paciente.telefone) OR
            (lower(trim(nome)) = lower(trim(v_paciente.nome)))
          )
          ORDER BY criado_em DESC LIMIT 1;
      END IF;

      IF v_lead_id IS NOT NULL THEN
        UPDATE public.funil_leads 
        SET status = CASE 
              WHEN status IN ('venda_concretizada', 'fechamento', 'venda-fechada') THEN status 
              ELSE 'atendido' 
            END,
            origem_id = NEW.origem_id,
            data_avaliacao = COALESCE(NEW.data_avaliacao, data_avaliacao),
            atualizado_em = NOW(),
            avaliacao_id = NEW.id
        WHERE id = v_lead_id;
      ELSE
        INSERT INTO public.funil_leads (
          nome, telefone, origem_id, mes_referencia, status, temperatura, qtd_agendamentos, qtd_faltas, data_avaliacao, criado_em, avaliacao_id
        ) VALUES (
          trim(v_paciente.nome), v_paciente.telefone, NEW.origem_id, to_char(COALESCE(NEW.data_avaliacao, CURRENT_DATE)::date, 'YYYY-MM'), 'atendido', COALESCE(NEW.temperatura_lead, 'morno'), 1, 0, NEW.data_avaliacao, COALESCE(NEW.data_avaliacao, CURRENT_DATE), NEW.id
        );
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.trg_vendas_confirmadas_to_funil()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_mes_referencia text;
  v_data_avaliacao date;
  v_lead_id uuid;
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.origem_id IS NOT NULL THEN
      IF NEW.oportunidade_id IS NOT NULL THEN
        SELECT to_char(data_avaliacao::date, 'YYYY-MM'), data_avaliacao 
        INTO v_mes_referencia, v_data_avaliacao
        FROM public.avaliacoes 
        WHERE id = NEW.oportunidade_id;
      END IF;

      IF v_mes_referencia IS NULL THEN
        IF NEW.data_original IS NOT NULL THEN
          v_mes_referencia := to_char(NEW.data_original::date, 'YYYY-MM');
          v_data_avaliacao := NEW.data_original;
        ELSE
          v_mes_referencia := to_char(NEW.data_fechamento::date, 'YYYY-MM');
          v_data_avaliacao := NEW.data_fechamento;
        END IF;
      END IF;
      
      IF NEW.oportunidade_id IS NOT NULL THEN
          SELECT id INTO v_lead_id FROM public.funil_leads WHERE avaliacao_id = NEW.oportunidade_id LIMIT 1;
      END IF;

      IF v_lead_id IS NULL THEN
          SELECT id INTO v_lead_id FROM public.funil_leads 
          WHERE (
            (telefone IS NOT NULL AND telefone != '' AND telefone = NEW.telefone) OR
            (lower(trim(nome)) = lower(trim(NEW.paciente_nome)))
          )
          ORDER BY criado_em DESC LIMIT 1;
      END IF;

      IF v_lead_id IS NOT NULL THEN
        UPDATE public.funil_leads 
        SET status = 'venda_concretizada',
            temperatura = 'quente',
            origem_id = NEW.origem_id,
            data_avaliacao = COALESCE(data_avaliacao, v_data_avaliacao),
            atualizado_em = NOW()
        WHERE id = v_lead_id;
      ELSE
        INSERT INTO public.funil_leads (
          nome, telefone, origem_id, mes_referencia, status, temperatura, qtd_agendamentos, qtd_faltas, data_avaliacao, criado_em, avaliacao_id
        ) VALUES (
          trim(NEW.paciente_nome), NEW.telefone, NEW.origem_id, v_mes_referencia, 'venda_concretizada', 'quente', 1, 0, v_data_avaliacao, COALESCE(v_data_avaliacao, NEW.data_fechamento), NEW.oportunidade_id
        );
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.trg_garantir_avaliacao_para_venda()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_paciente_id uuid;
BEGIN
  IF NEW.oportunidade_id IS NULL THEN
    SELECT id INTO v_paciente_id FROM public.pacientes WHERE lower(trim(nome)) = lower(trim(NEW.paciente_nome)) LIMIT 1;
    
    IF v_paciente_id IS NULL THEN
      v_paciente_id := gen_random_uuid();
      INSERT INTO public.pacientes (id, nome, telefone, tenant_id) VALUES (v_paciente_id, trim(NEW.paciente_nome), NEW.telefone, NEW.tenant_id);
    END IF;
    
    NEW.oportunidade_id := gen_random_uuid();
    INSERT INTO public.avaliacoes (
      id, paciente_id, dentista_avaliador_id, crc_comercial_id, 
      data_avaliacao, data_fechamento, valor_orcamento, valor_entrada, 
      status, temperatura_lead, origem_id, destino_fiscal, tenant_id
    ) VALUES (
      NEW.oportunidade_id, v_paciente_id, NEW.dentista_avaliador, NEW.crc,
      COALESCE(NEW.data_original, NEW.data_fechamento), NEW.data_fechamento, NEW.valor_tratamento, NEW.valor_entrada,
      'venda_concretizada', 'quente', NEW.origem_id, NEW.destino_fiscal, NEW.tenant_id
    );
  END IF;
  
  NEW.paciente_nome := trim(NEW.paciente_nome);
  
  RETURN NEW;
END;
$function$;

-- Trigger for saving Partial Action Outcome History
CREATE OR REPLACE FUNCTION public.trg_historico_compromissos()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.resultado_acao IS NOT NULL AND NEW.resultado_acao <> '' AND (OLD.resultado_acao IS NULL OR NEW.resultado_acao <> OLD.resultado_acao) THEN
      IF NEW.lead_id IS NOT NULL THEN
        INSERT INTO public.funil_leads_historico (lead_id, usuario_id, acao, detalhes, tenant_id)
        VALUES (NEW.lead_id, NEW.usuario_id, 'Atualização de Desfecho', NEW.resultado_acao, NEW.tenant_id);
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_historico_compromissos_tg ON public.compromissos;
CREATE TRIGGER trg_historico_compromissos_tg
  AFTER UPDATE ON public.compromissos
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_historico_compromissos();

-- Seed data for independent transactions
DO $$
DECLARE
  v_paciente_id uuid := '11111111-1111-1111-1111-111111111111'::uuid;
  v_origem_id uuid;
  v_dentista_id uuid;
  v_crc_id uuid;
  v_avaliacao1_id uuid := '22222222-2222-2222-2222-222222222222'::uuid;
  v_avaliacao2_id uuid := '33333333-3333-3333-3333-333333333333'::uuid;
  v_venda_id uuid := '44444444-4444-4444-4444-444444444444'::uuid;
BEGIN
  SELECT id INTO v_origem_id FROM public.funil_origens LIMIT 1;
  SELECT id INTO v_dentista_id FROM public.dentistas_avaliadores LIMIT 1;
  SELECT id INTO v_crc_id FROM public.crc_comercial LIMIT 1;

  IF v_origem_id IS NOT NULL AND v_dentista_id IS NOT NULL AND v_crc_id IS NOT NULL THEN
    INSERT INTO public.pacientes (id, nome, telefone) 
    VALUES (v_paciente_id, 'Paciente Independente Teste', '11999999999')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.avaliacoes (id, paciente_id, dentista_avaliador_id, crc_comercial_id, origem_id, data_avaliacao, valor_orcamento, status)
    VALUES (v_avaliacao1_id, v_paciente_id, v_dentista_id, v_crc_id, v_origem_id, '2026-05-04', 1500, 'avaliacao_realizada')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.avaliacoes (id, paciente_id, dentista_avaliador_id, crc_comercial_id, origem_id, data_avaliacao, data_fechamento, valor_orcamento, valor_entrada, status)
    VALUES (v_avaliacao2_id, v_paciente_id, v_dentista_id, v_crc_id, v_origem_id, '2026-05-04', '2026-05-04', 3000, 3000, 'venda_concretizada')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.vendas_confirmadas (id, oportunidade_id, paciente_nome, telefone, data_fechamento, valor_tratamento, valor_entrada, percentual_entrada, dentista_avaliador, crc, origem_id)
    VALUES (v_venda_id, v_avaliacao2_id, 'Paciente Independente Teste', '11999999999', '2026-05-04', 3000, 3000, 100, v_dentista_id, v_crc_id, v_origem_id)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

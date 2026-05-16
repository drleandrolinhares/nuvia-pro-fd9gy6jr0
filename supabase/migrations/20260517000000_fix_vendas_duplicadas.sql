-- Saneamento: Remover vendas_confirmadas duplicadas
DO $$
BEGIN
  DELETE FROM public.vendas_confirmadas a USING (
    SELECT MIN(id::text)::uuid as keep_id, lower(trim(paciente_nome)) as p_nome, data_fechamento, origem_id
    FROM public.vendas_confirmadas
    GROUP BY lower(trim(paciente_nome)), data_fechamento, origem_id
    HAVING COUNT(*) > 1
  ) b
  WHERE lower(trim(a.paciente_nome)) = b.p_nome 
    AND a.data_fechamento = b.data_fechamento 
    AND COALESCE(a.origem_id, '00000000-0000-0000-0000-000000000000'::uuid) = COALESCE(b.origem_id, '00000000-0000-0000-0000-000000000000'::uuid) 
    AND a.id <> b.keep_id;
END $$;

-- Saneamento: Remover vendas_diarias duplicadas
DO $$
BEGIN
  DELETE FROM public.vendas_diarias a USING (
    SELECT MIN(id::text)::uuid as keep_id, lower(trim(paciente_nome)) as p_nome, data_venda, origem_id
    FROM public.vendas_diarias
    GROUP BY lower(trim(paciente_nome)), data_venda, origem_id
    HAVING COUNT(*) > 1
  ) b
  WHERE lower(trim(a.paciente_nome)) = b.p_nome 
    AND a.data_venda = b.data_venda 
    AND COALESCE(a.origem_id, '00000000-0000-0000-0000-000000000000'::uuid) = COALESCE(b.origem_id, '00000000-0000-0000-0000-000000000000'::uuid) 
    AND a.id <> b.keep_id;
END $$;

-- Saneamento de funil_leads duplicados (nome + origem + data)
DO $$
BEGIN
  -- Unificar nomenclatura de status
  UPDATE public.funil_leads 
  SET status = 'venda_concretizada'
  WHERE status IN ('fechamento', 'venda-fechada');

  DELETE FROM public.funil_leads a USING (
    SELECT MIN(id::text)::uuid as keep_id, lower(trim(nome)) as l_nome, origem_id, (criado_em AT TIME ZONE 'America/Sao_Paulo')::date as data_c
    FROM public.funil_leads
    GROUP BY lower(trim(nome)), origem_id, (criado_em AT TIME ZONE 'America/Sao_Paulo')::date
    HAVING COUNT(*) > 1
  ) b
  WHERE lower(trim(a.nome)) = b.l_nome 
    AND COALESCE(a.origem_id, '00000000-0000-0000-0000-000000000000'::uuid) = COALESCE(b.origem_id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND (a.criado_em AT TIME ZONE 'America/Sao_Paulo')::date = b.data_c
    AND a.id <> b.keep_id;
END $$;

-- Unificar as etapas do funil
DO $$
BEGIN
  INSERT INTO public.funil_etapas (nome, slug, cor, ordem, ativo)
  VALUES ('Venda Concretizada', 'venda_concretizada', '#10b981', 99, true)
  ON CONFLICT (slug) DO UPDATE SET ativo = true, nome = 'Venda Concretizada';

  UPDATE public.funil_etapas 
  SET ativo = false 
  WHERE slug IN ('fechamento', 'venda-fechada');
END $$;

-- Travas de Unicidade
DROP INDEX IF EXISTS idx_vendas_diarias_unique_venda;
CREATE UNIQUE INDEX idx_vendas_diarias_unique_venda ON public.vendas_diarias (lower(trim(paciente_nome)), data_venda, COALESCE(origem_id, '00000000-0000-0000-0000-000000000000'::uuid));

DROP INDEX IF EXISTS idx_vendas_confirmadas_unique_venda;
CREATE UNIQUE INDEX idx_vendas_confirmadas_unique_venda ON public.vendas_confirmadas (lower(trim(paciente_nome)), data_fechamento, COALESCE(origem_id, '00000000-0000-0000-0000-000000000000'::uuid));

-- Atualizar Trigger de Vendas Confirmadas para usar UPSERT logico em funil_leads
CREATE OR REPLACE FUNCTION public.trg_vendas_confirmadas_to_funil()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_mes_referencia text;
  v_lead_id uuid;
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.origem_id IS NOT NULL THEN
      IF NEW.oportunidade_id IS NOT NULL THEN
        SELECT to_char(data_avaliacao::date, 'YYYY-MM') INTO v_mes_referencia 
        FROM public.avaliacoes 
        WHERE id = NEW.oportunidade_id;
      END IF;

      IF v_mes_referencia IS NULL THEN
        v_mes_referencia := to_char(NEW.data_fechamento::date, 'YYYY-MM');
      END IF;
      
      -- Encontrar lead existente
      SELECT id INTO v_lead_id FROM public.funil_leads 
      WHERE (
        (telefone IS NOT NULL AND telefone != '' AND telefone = NEW.telefone) OR
        (lower(trim(nome)) = lower(trim(NEW.paciente_nome)))
      )
      ORDER BY criado_em DESC LIMIT 1;

      IF v_lead_id IS NOT NULL THEN
        UPDATE public.funil_leads 
        SET status = 'venda_concretizada',
            temperatura = 'quente',
            origem_id = NEW.origem_id,
            atualizado_em = NOW()
        WHERE id = v_lead_id;
      ELSE
        INSERT INTO public.funil_leads (
          nome, telefone, origem_id, mes_referencia, status, temperatura, qtd_agendamentos, qtd_faltas
        ) VALUES (
          trim(NEW.paciente_nome), NEW.telefone, NEW.origem_id, v_mes_referencia, 'venda_concretizada', 'quente', 1, 0
        );
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

-- Nova Trigger para Avaliações (Oportunidades) gerenciarem o funil
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
      WHERE (
        (telefone IS NOT NULL AND telefone != '' AND telefone = v_paciente.telefone) OR
        (lower(trim(nome)) = lower(trim(v_paciente.nome)))
      )
      ORDER BY criado_em DESC LIMIT 1;

      IF v_lead_id IS NOT NULL THEN
        UPDATE public.funil_leads 
        SET status = CASE 
              WHEN status IN ('venda_concretizada', 'fechamento', 'venda-fechada') THEN status 
              ELSE 'atendido' 
            END,
            origem_id = NEW.origem_id,
            atualizado_em = NOW()
        WHERE id = v_lead_id;
      ELSE
        INSERT INTO public.funil_leads (
          nome, telefone, origem_id, mes_referencia, status, temperatura, qtd_agendamentos, qtd_faltas
        ) VALUES (
          trim(v_paciente.nome), v_paciente.telefone, NEW.origem_id, to_char(COALESCE(NEW.data_avaliacao, CURRENT_DATE)::date, 'YYYY-MM'), 'atendido', COALESCE(NEW.temperatura_lead, 'morno'), 1, 0
        );
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_avaliacoes_to_funil_tg ON public.avaliacoes;
CREATE TRIGGER trg_avaliacoes_to_funil_tg AFTER INSERT OR UPDATE ON public.avaliacoes FOR EACH ROW EXECUTE FUNCTION public.trg_avaliacoes_to_funil();

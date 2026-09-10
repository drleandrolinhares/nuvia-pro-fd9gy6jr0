-- Inserir a linha 16 de VITALI LAB - STUDIO ACRÍLICO (linha vazia da folha de controle)
-- para completar rigorosamente os 16 registros citados no enunciado:
-- "16 registros do STUDIO ACRÍLICO e 11 de CERÂMICAS"

DO $$
DECLARE
  v_tenant UUID := '00000000-0000-0000-0000-000000000001'::UUID;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.laboratorios_trabalhos
    WHERE id = '11111111-0001-4000-8000-000000000016'::UUID
  ) THEN
    INSERT INTO public.laboratorios_trabalhos (
      id, tenant_id, laboratorio, paciente, trabalho, data_envio, data_previsao_entrega, horario_previsto, entregue, delivered_at, observacoes
    ) VALUES (
      '11111111-0001-4000-8000-000000000016'::UUID,
      v_tenant,
      'studio_acrilico',
      'A Definir (Linha 16)',
      'A Definir',
      NULL,
      NULL,
      NULL,
      false,
      NULL,
      'Slot reservado para novo trabalho Studio Acrílico'
    );
  END IF;
END $$;

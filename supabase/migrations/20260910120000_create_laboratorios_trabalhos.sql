-- Migration: Criar tabela laboratorios_trabalhos, RLS e carga inicial de dados reais
-- Tenant NUVIA PRO: '00000000-0000-0000-0000-000000000001'

CREATE TABLE IF NOT EXISTS public.laboratorios_trabalhos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID DEFAULT public.get_my_tenant_id() REFERENCES public.tenants(id) ON DELETE CASCADE,
  laboratorio TEXT NOT NULL, -- 'studio_acrilico' | 'ceramicas'
  paciente TEXT NOT NULL,
  trabalho TEXT NOT NULL,
  data_envio DATE,
  data_previsao_entrega DATE,
  horario_previsto TIME WITHOUT TIME ZONE DEFAULT '17:00'::TIME WITHOUT TIME ZONE,
  entregue BOOLEAN NOT NULL DEFAULT false,
  delivered_at TIMESTAMPTZ,
  confirmado_por TEXT,
  confirmado_em TIMESTAMPTZ,
  observacoes TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  criado_por UUID REFERENCES public.usuarios(id) ON DELETE SET NULL
);

-- Indexação para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_laboratorios_trabalhos_tenant ON public.laboratorios_trabalhos(tenant_id);
CREATE INDEX IF NOT EXISTS idx_laboratorios_trabalhos_lab ON public.laboratorios_trabalhos(laboratorio);
CREATE INDEX IF NOT EXISTS idx_laboratorios_trabalhos_entregue ON public.laboratorios_trabalhos(entregue);
CREATE INDEX IF NOT EXISTS idx_laboratorios_trabalhos_prev ON public.laboratorios_trabalhos(data_previsao_entrega);

-- Habilitar RLS
ALTER TABLE public.laboratorios_trabalhos ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS padrão do sistema (universal tenant-scoped)
DROP POLICY IF EXISTS "universal_select" ON public.laboratorios_trabalhos;
CREATE POLICY "universal_select" ON public.laboratorios_trabalhos
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_my_tenant_id() OR public.is_admin());

DROP POLICY IF EXISTS "universal_insert" ON public.laboratorios_trabalhos;
CREATE POLICY "universal_insert" ON public.laboratorios_trabalhos
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.get_my_tenant_id() OR public.is_admin());

DROP POLICY IF EXISTS "universal_update" ON public.laboratorios_trabalhos;
CREATE POLICY "universal_update" ON public.laboratorios_trabalhos
  FOR UPDATE TO authenticated
  USING (tenant_id = public.get_my_tenant_id() OR public.is_admin())
  WITH CHECK (tenant_id = public.get_my_tenant_id() OR public.is_admin());

DROP POLICY IF EXISTS "universal_delete" ON public.laboratorios_trabalhos;
CREATE POLICY "universal_delete" ON public.laboratorios_trabalhos
  FOR DELETE TO authenticated
  USING (tenant_id = public.get_my_tenant_id() OR public.is_admin());

-- Cadastrar a permissão "Acessar Laboratórios"
INSERT INTO public.permissoes (id, nome, slug, modulo, descricao, ordem, ativo)
VALUES (
  'e6587d15-7798-4822-b5b6-7c91ad52bfa1'::UUID,
  'Acessar Laboratórios',
  'Acessar Laboratórios',
  'Operacional',
  'Permite acessar o módulo de controle de trabalhos e prazos de laboratórios',
  11,
  true
)
ON CONFLICT (slug) DO NOTHING;

-- Vincular permissão a todos os cargos que possuem acesso à Gestão de Terceiros ou cargos administrativos
INSERT INTO public.cargo_permissoes (cargo_id, permissao_id, tenant_id)
SELECT c.id, 'e6587d15-7798-4822-b5b6-7c91ad52bfa1'::UUID, c.tenant_id
FROM public.cargos c
WHERE c.nome ILIKE '%gerente%'
   OR c.nome ILIKE '%admin%'
   OR c.nome ILIKE '%diretor%'
   OR c.nome ILIKE '%crc%'
   OR c.nome ILIKE '%recepcao%'
   OR c.nome ILIKE '%auxiliar%'
   OR c.id IN (
     SELECT cp.cargo_id FROM public.cargo_permissoes cp
     JOIN public.permissoes p ON p.id = cp.permissao_id
     WHERE p.slug = 'Acessar Gestão de Terceiros'
   )
ON CONFLICT DO NOTHING;

-- Carga inicial de dados reais para o tenant '00000000-0000-0000-0000-000000000001'
-- Tabela 1: VITALI LAB - STUDIO ACRÍLICO
-- 1. Maria Madalena de Jesus — BARRA + ACRILIZAÇÃO — 03/set — entregue
-- 2. Maria Rita Roni — ACRILIZAÇÃO PT SUP E INF — 04/set — entregue
-- 3. Maria Dalva Ferreira — BARRA + ACRILIZAÇÃO — 08/set — entregue
-- 4. Edson Alves — BARRA + MONTAGEM — 08/set
-- 5. Marilza Duarte Macedo — BARRA + ACRILIZAÇÃO — 10/set — entregue
-- 6. Marlene Wottikosky — PT IMEDIATA SUP E INF — 10/set
-- 7. Helenilda Alves — PLANO DE CERA PROTOCOLO INF — 10/set
-- 8. Dalvino Bezerra — PLANO DE CERA PROTOCOLO INF — 14/set
-- 9. João Francisco dos Reis — BARRA + MONTAGEM — 15/set
-- 10. Jesse Pinheiro — REPARO — 15/set
-- 11. Elidia Pacheco — ACRILIZAÇÃO — 21/set — entregue — observação "verificar orientação do Dr"
-- 12. Terezinha da Penha Ferração — BARRA + ACRILIZAÇÃO — 22/set
-- 13. Clebson Rozario — BARRA + ACRILIZAÇÃO — 24/set
-- 14. Antônio Ferreira — BARRA + MONTAGEM — 25/set
-- 15. Viviane Aparecida — a confirmar — data a confirmar

-- Tabela 2: VITALI - CERÂMICAS
-- 1. Isabel Dambroz — COROA 36,37,47 — 10/set
-- 2. Maria Goreti — COROA 14 — 18/set
-- 3. Jonas Roque — COROA 36 E 46 — 18/set
-- 4. Jose Geraldo Fracalossi — COROA 33,34,35,43,44,45,46,47 — 24/set
-- 5. Rubens Zucoloto — COROA 14 — 24/set
-- 6. Paulo Cezar Serra — PROVI. 27 — 28/set
-- 7. Raquel Rena Cardoso — COROA DEFINITIVA — (sem data)
-- 8. Leonardo Zozarnelli — COROA DEFINITIVA — (sem data)
-- 9. Isaias de Oliveira — PROV. — (sem data)
-- 10. Marinalda Premoli — COROA DEFINITIVA PONTE FIXA — (sem data)
-- 11. Telma Luci — COROAS DEFINITIVAS PONTE FIXA — (sem data)

DO $$
DECLARE
  v_tenant UUID := '00000000-0000-0000-0000-000000000001'::UUID;
BEGIN
  -- Verificar se já existem registros para não duplicar em re-execuções
  IF NOT EXISTS (SELECT 1 FROM public.laboratorios_trabalhos WHERE tenant_id = v_tenant) THEN

    -- STUDIO ACRÍLICO
    INSERT INTO public.laboratorios_trabalhos (
      id, tenant_id, laboratorio, paciente, trabalho, data_envio, data_previsao_entrega, horario_previsto, entregue, delivered_at, observacoes
    ) VALUES
      ('11111111-0001-4000-8000-000000000001'::UUID, v_tenant, 'studio_acrilico', 'Maria Madalena de Jesus', 'BARRA + ACRILIZAÇÃO', '2026-08-31', '2026-09-03', '17:50'::TIME, true, '2026-09-03 17:50:00+00', NULL),
      ('11111111-0001-4000-8000-000000000002'::UUID, v_tenant, 'studio_acrilico', 'Maria Rita Roni', 'ACRILIZAÇÃO PT SUP E INF', '2026-08-31', '2026-09-04', '17:00'::TIME, true, '2026-09-04 17:00:00+00', NULL),
      ('11111111-0001-4000-8000-000000000003'::UUID, v_tenant, 'studio_acrilico', 'Maria Dalva Ferreira', 'BARRA + ACRILIZAÇÃO', '2026-09-01', '2026-09-08', '17:00'::TIME, true, '2026-09-08 17:00:00+00', NULL),
      ('11111111-0001-4000-8000-000000000004'::UUID, v_tenant, 'studio_acrilico', 'Edson Alves', 'BARRA + MONTAGEM', '2026-09-01', '2026-09-08', '17:00'::TIME, false, NULL, NULL),
      ('11111111-0001-4000-8000-000000000005'::UUID, v_tenant, 'studio_acrilico', 'Marilza Duarte Macedo', 'BARRA + ACRILIZAÇÃO', '2026-09-03', '2026-09-10', '17:00'::TIME, true, '2026-09-10 17:00:00+00', NULL),
      ('11111111-0001-4000-8000-000000000006'::UUID, v_tenant, 'studio_acrilico', 'Marlene Wottikosky', 'PT IMEDIATA SUP E INF', '2026-09-03', '2026-09-10', '17:00'::TIME, false, NULL, NULL),
      ('11111111-0001-4000-8000-000000000007'::UUID, v_tenant, 'studio_acrilico', 'Helenilda Alves', 'PLANO DE CERA PROTOCOLO INF', '2026-09-03', '2026-09-10', '17:00'::TIME, false, NULL, NULL),
      ('11111111-0001-4000-8000-000000000008'::UUID, v_tenant, 'studio_acrilico', 'Dalvino Bezerra', 'PLANO DE CERA PROTOCOLO INF', '2026-09-07', '2026-09-14', '17:00'::TIME, false, NULL, NULL),
      ('11111111-0001-4000-8000-000000000009'::UUID, v_tenant, 'studio_acrilico', 'João Francisco dos Reis', 'BARRA + MONTAGEM', '2026-09-08', '2026-09-15', '17:00'::TIME, false, NULL, NULL),
      ('11111111-0001-4000-8000-000000000010'::UUID, v_tenant, 'studio_acrilico', 'Jesse Pinheiro', 'REPARO', '2026-09-08', '2026-09-15', '17:00'::TIME, false, NULL, NULL),
      ('11111111-0001-4000-8000-000000000011'::UUID, v_tenant, 'studio_acrilico', 'Elidia Pacheco', 'ACRILIZAÇÃO', '2026-09-10', '2026-09-21', '17:00'::TIME, true, '2026-09-21 17:00:00+00', 'verificar orientação do Dr'),
      ('11111111-0001-4000-8000-000000000012'::UUID, v_tenant, 'studio_acrilico', 'Terezinha da Penha Ferração', 'BARRA + ACRILIZAÇÃO', '2026-09-11', '2026-09-22', '17:00'::TIME, false, NULL, NULL),
      ('11111111-0001-4000-8000-000000000013'::UUID, v_tenant, 'studio_acrilico', 'Clebson Rozario', 'BARRA + ACRILIZAÇÃO', '2026-09-14', '2026-09-24', '17:00'::TIME, false, NULL, NULL),
      ('11111111-0001-4000-8000-000000000014'::UUID, v_tenant, 'studio_acrilico', 'Antônio Ferreira', 'BARRA + MONTAGEM', '2026-09-15', '2026-09-25', '17:00'::TIME, false, NULL, NULL),
      ('11111111-0001-4000-8000-000000000015'::UUID, v_tenant, 'studio_acrilico', 'Viviane Aparecida', 'a confirmar', NULL, NULL, NULL, false, NULL, 'Trabalho e data a confirmar');

    -- SOLUÇÕES CERÂMICAS
    INSERT INTO public.laboratorios_trabalhos (
      id, tenant_id, laboratorio, paciente, trabalho, data_envio, data_previsao_entrega, horario_previsto, entregue, delivered_at, observacoes
    ) VALUES
      ('22222222-0002-4000-8000-000000000001'::UUID, v_tenant, 'ceramicas', 'Isabel Dambroz', 'COROA 36,37,47', '2026-09-02', '2026-09-10', '17:00'::TIME, false, NULL, NULL),
      ('22222222-0002-4000-8000-000000000002'::UUID, v_tenant, 'ceramicas', 'Maria Goreti', 'COROA 14', '2026-09-08', '2026-09-18', '17:00'::TIME, false, NULL, NULL),
      ('22222222-0002-4000-8000-000000000003'::UUID, v_tenant, 'ceramicas', 'Jonas Roque', 'COROA 36 E 46', '2026-09-08', '2026-09-18', '17:00'::TIME, false, NULL, NULL),
      ('22222222-0002-4000-8000-000000000004'::UUID, v_tenant, 'ceramicas', 'Jose Geraldo Fracalossi', 'COROA 33,34,35,43,44,45,46,47', '2026-09-14', '2026-09-24', '17:00'::TIME, false, NULL, NULL),
      ('22222222-0002-4000-8000-000000000005'::UUID, v_tenant, 'ceramicas', 'Rubens Zucoloto', 'COROA 14', '2026-09-14', '2026-09-24', '17:00'::TIME, false, NULL, NULL),
      ('22222222-0002-4000-8000-000000000006'::UUID, v_tenant, 'ceramicas', 'Paulo Cezar Serra', 'PROVI. 27', '2026-09-17', '2026-09-28', '17:00'::TIME, false, NULL, NULL),
      ('22222222-0002-4000-8000-000000000007'::UUID, v_tenant, 'ceramicas', 'Raquel Rena Cardoso', 'COROA DEFINITIVA', NULL, NULL, NULL, false, NULL, 'Sem data definida'),
      ('22222222-0002-4000-8000-000000000008'::UUID, v_tenant, 'ceramicas', 'Leonardo Zozarnelli', 'COROA DEFINITIVA', NULL, NULL, NULL, false, NULL, 'Sem data definida'),
      ('22222222-0002-4000-8000-000000000009'::UUID, v_tenant, 'ceramicas', 'Isaias de Oliveira', 'PROV.', NULL, NULL, NULL, false, NULL, 'Sem data definida'),
      ('22222222-0002-4000-8000-000000000010'::UUID, v_tenant, 'ceramicas', 'Marinalda Premoli', 'COROA DEFINITIVA PONTE FIXA', NULL, NULL, NULL, false, NULL, 'Sem data definida'),
      ('22222222-0002-4000-8000-000000000011'::UUID, v_tenant, 'ceramicas', 'Telma Luci', 'COROAS DEFINITIVAS PONTE FIXA', NULL, NULL, NULL, false, NULL, 'Sem data definida');

  END IF;
END $$;

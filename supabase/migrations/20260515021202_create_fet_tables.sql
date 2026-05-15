DO $$
BEGIN
  -- Criação das tabelas
  CREATE TABLE IF NOT EXISTS public.fet_pacientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    tenant_id UUID DEFAULT public.get_my_tenant_id()
  );

  CREATE TABLE IF NOT EXISTS public.fet_procedimentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID REFERENCES public.fet_pacientes(id) ON DELETE CASCADE NOT NULL,
    procedimento TEXT NOT NULL,
    dentista_id UUID REFERENCES public.pro_agenda_dentistas(id) ON DELETE SET NULL,
    tempo_execucao TEXT,
    observacoes TEXT,
    concluido BOOLEAN NOT NULL DEFAULT FALSE,
    ordem INTEGER NOT NULL DEFAULT 0,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    tenant_id UUID DEFAULT public.get_my_tenant_id()
  );

  -- Habilita RLS
  ALTER TABLE public.fet_pacientes ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.fet_procedimentos ENABLE ROW LEVEL SECURITY;

  -- Políticas para fet_pacientes
  DROP POLICY IF EXISTS "fet_pacientes_select" ON public.fet_pacientes;
  CREATE POLICY "fet_pacientes_select" ON public.fet_pacientes FOR SELECT TO authenticated USING (tenant_id = public.get_my_tenant_id());

  DROP POLICY IF EXISTS "fet_pacientes_insert" ON public.fet_pacientes;
  CREATE POLICY "fet_pacientes_insert" ON public.fet_pacientes FOR INSERT TO authenticated WITH CHECK (tenant_id = public.get_my_tenant_id());

  DROP POLICY IF EXISTS "fet_pacientes_update" ON public.fet_pacientes;
  CREATE POLICY "fet_pacientes_update" ON public.fet_pacientes FOR UPDATE TO authenticated USING (tenant_id = public.get_my_tenant_id()) WITH CHECK (tenant_id = public.get_my_tenant_id());

  DROP POLICY IF EXISTS "fet_pacientes_delete" ON public.fet_pacientes;
  CREATE POLICY "fet_pacientes_delete" ON public.fet_pacientes FOR DELETE TO authenticated USING (tenant_id = public.get_my_tenant_id());

  -- Políticas para fet_procedimentos
  DROP POLICY IF EXISTS "fet_procedimentos_select" ON public.fet_procedimentos;
  CREATE POLICY "fet_procedimentos_select" ON public.fet_procedimentos FOR SELECT TO authenticated USING (tenant_id = public.get_my_tenant_id());

  DROP POLICY IF EXISTS "fet_procedimentos_insert" ON public.fet_procedimentos;
  CREATE POLICY "fet_procedimentos_insert" ON public.fet_procedimentos FOR INSERT TO authenticated WITH CHECK (tenant_id = public.get_my_tenant_id());

  DROP POLICY IF EXISTS "fet_procedimentos_update" ON public.fet_procedimentos;
  CREATE POLICY "fet_procedimentos_update" ON public.fet_procedimentos FOR UPDATE TO authenticated USING (tenant_id = public.get_my_tenant_id()) WITH CHECK (tenant_id = public.get_my_tenant_id());

  DROP POLICY IF EXISTS "fet_procedimentos_delete" ON public.fet_procedimentos;
  CREATE POLICY "fet_procedimentos_delete" ON public.fet_procedimentos FOR DELETE TO authenticated USING (tenant_id = public.get_my_tenant_id());

  -- Criação de permissão
  IF NOT EXISTS (SELECT 1 FROM public.permissoes WHERE nome = 'operacional_fet') THEN
    INSERT INTO public.permissoes (nome, descricao, modulo) VALUES ('operacional_fet', 'Acessar FET', 'Operacional');
  END IF;

END $$;

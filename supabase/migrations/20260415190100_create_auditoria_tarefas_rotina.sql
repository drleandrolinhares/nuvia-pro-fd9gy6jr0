CREATE TABLE IF NOT EXISTS public.auditoria_tarefas_rotina (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tarefa_id UUID NOT NULL REFERENCES public.tarefas_rotina(id) ON DELETE CASCADE,
  timestamp_cliente TIMESTAMPTZ NOT NULL,
  valido BOOLEAN NOT NULL,
  mensagem TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.auditoria_tarefas_rotina ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auditoria_tarefas_rotina_insert" ON public.auditoria_tarefas_rotina;
CREATE POLICY "auditoria_tarefas_rotina_insert" ON public.auditoria_tarefas_rotina
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auditoria_tarefas_rotina_select" ON public.auditoria_tarefas_rotina;
CREATE POLICY "auditoria_tarefas_rotina_select" ON public.auditoria_tarefas_rotina
  FOR SELECT TO authenticated USING (true);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'nivel_criticidade_enum') THEN
    CREATE TYPE public.nivel_criticidade_enum AS ENUM ('no_horario', 'tolerancia', 'critico', 'nao_concluida');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.rotinas_usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
  cargo_id UUID REFERENCES public.cargos(id) ON DELETE SET NULL,
  ativa BOOLEAN NOT NULL DEFAULT true,
  data_criacao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_atualizacao TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tarefas_rotina (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rotina_id UUID NOT NULL REFERENCES public.rotinas_usuarios(id) ON DELETE CASCADE,
  numero_sequencia INTEGER NOT NULL,
  descricao_tarefa TEXT NOT NULL,
  horario_inicio TIME NOT NULL,
  horario_fim TIME NOT NULL,
  peso_percentual NUMERIC NOT NULL DEFAULT 5,
  ativa BOOLEAN NOT NULL DEFAULT true,
  data_criacao TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.execucoes_rotina (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  data_execucao DATE NOT NULL DEFAULT CURRENT_DATE,
  tarefa_id UUID NOT NULL REFERENCES public.tarefas_rotina(id) ON DELETE CASCADE,
  concluida BOOLEAN NOT NULL DEFAULT false,
  timestamp_conclusao TIMESTAMPTZ,
  minutos_atrasado INTEGER NOT NULL DEFAULT 0,
  nivel_criticidade public.nivel_criticidade_enum,
  fechamento_confirmado BOOLEAN NOT NULL DEFAULT false,
  data_fechamento TIMESTAMPTZ,
  data_criacao TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.rotinas_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarefas_rotina ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.execucoes_rotina ENABLE ROW LEVEL SECURITY;

-- Policies for rotinas_usuarios
DROP POLICY IF EXISTS "rotinas_usuarios_read" ON public.rotinas_usuarios;
CREATE POLICY "rotinas_usuarios_read" ON public.rotinas_usuarios
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "rotinas_usuarios_all" ON public.rotinas_usuarios;
CREATE POLICY "rotinas_usuarios_all" ON public.rotinas_usuarios
  FOR ALL TO authenticated USING (is_admin() OR has_permission('configuracoes_geral'::text) OR has_permission('configuracoes_rotinas'::text));

-- Policies for tarefas_rotina
DROP POLICY IF EXISTS "tarefas_rotina_read" ON public.tarefas_rotina;
CREATE POLICY "tarefas_rotina_read" ON public.tarefas_rotina
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "tarefas_rotina_all" ON public.tarefas_rotina;
CREATE POLICY "tarefas_rotina_all" ON public.tarefas_rotina
  FOR ALL TO authenticated USING (is_admin() OR has_permission('configuracoes_geral'::text) OR has_permission('configuracoes_rotinas'::text));

-- Policies for execucoes_rotina
DROP POLICY IF EXISTS "execucoes_rotina_read" ON public.execucoes_rotina;
CREATE POLICY "execucoes_rotina_read" ON public.execucoes_rotina
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "execucoes_rotina_insert" ON public.execucoes_rotina;
CREATE POLICY "execucoes_rotina_insert" ON public.execucoes_rotina
  FOR INSERT TO authenticated WITH CHECK (usuario_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "execucoes_rotina_update" ON public.execucoes_rotina;
CREATE POLICY "execucoes_rotina_update" ON public.execucoes_rotina
  FOR UPDATE TO authenticated USING (usuario_id = auth.uid() OR is_admin()) WITH CHECK (usuario_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "execucoes_rotina_delete" ON public.execucoes_rotina;
CREATE POLICY "execucoes_rotina_delete" ON public.execucoes_rotina
  FOR DELETE TO authenticated USING (is_admin());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS rotinas_usuarios_usuario_id_idx ON public.rotinas_usuarios (usuario_id);
CREATE INDEX IF NOT EXISTS rotinas_usuarios_cargo_id_idx ON public.rotinas_usuarios (cargo_id);
CREATE INDEX IF NOT EXISTS tarefas_rotina_rotina_id_idx ON public.tarefas_rotina (rotina_id);
CREATE INDEX IF NOT EXISTS execucoes_rotina_usuario_id_idx ON public.execucoes_rotina (usuario_id);
CREATE INDEX IF NOT EXISTS execucoes_rotina_tarefa_id_idx ON public.execucoes_rotina (tarefa_id);
CREATE INDEX IF NOT EXISTS execucoes_rotina_data_execucao_idx ON public.execucoes_rotina (data_execucao);

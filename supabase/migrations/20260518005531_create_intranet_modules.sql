DO $$
DECLARE
    v_tenant_id UUID;
    v_etapa1_id UUID;
    v_etapa2_id UUID;
    v_curso_id UUID;
BEGIN
    -- Tabelas de Onboarding
    CREATE TABLE IF NOT EXISTS public.intranet_onboarding_etapas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        titulo TEXT NOT NULL,
        descricao TEXT,
        dia INTEGER NOT NULL DEFAULT 1,
        ordem INTEGER NOT NULL DEFAULT 0,
        ativo BOOLEAN NOT NULL DEFAULT true,
        tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE DEFAULT public.get_my_tenant_id(),
        criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS public.intranet_onboarding_tarefas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        etapa_id UUID REFERENCES public.intranet_onboarding_etapas(id) ON DELETE CASCADE,
        titulo TEXT NOT NULL,
        descricao TEXT,
        ordem INTEGER NOT NULL DEFAULT 0,
        tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE DEFAULT public.get_my_tenant_id(),
        criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS public.intranet_onboarding_progresso (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
        tarefa_id UUID REFERENCES public.intranet_onboarding_tarefas(id) ON DELETE CASCADE,
        concluido BOOLEAN NOT NULL DEFAULT false,
        concluido_em TIMESTAMPTZ,
        tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE DEFAULT public.get_my_tenant_id(),
        criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(usuario_id, tarefa_id)
    );

    -- Tabelas de Treinamentos
    CREATE TABLE IF NOT EXISTS public.intranet_treinamentos_cursos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        titulo TEXT NOT NULL,
        descricao TEXT,
        setor TEXT,
        ativo BOOLEAN NOT NULL DEFAULT true,
        ordem INTEGER NOT NULL DEFAULT 0,
        tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE DEFAULT public.get_my_tenant_id(),
        criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS public.intranet_treinamentos_modulos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        curso_id UUID REFERENCES public.intranet_treinamentos_cursos(id) ON DELETE CASCADE,
        titulo TEXT NOT NULL,
        descricao TEXT,
        video_url TEXT,
        nota_minima INTEGER DEFAULT 7,
        quiz_json JSONB DEFAULT '[]'::jsonb,
        ordem INTEGER NOT NULL DEFAULT 0,
        tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE DEFAULT public.get_my_tenant_id(),
        criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS public.intranet_treinamentos_progresso (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
        modulo_id UUID REFERENCES public.intranet_treinamentos_modulos(id) ON DELETE CASCADE,
        video_visto BOOLEAN NOT NULL DEFAULT false,
        nota_quiz INTEGER,
        aprovado BOOLEAN NOT NULL DEFAULT false,
        tentativas INTEGER NOT NULL DEFAULT 0,
        tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE DEFAULT public.get_my_tenant_id(),
        atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(usuario_id, modulo_id)
    );

    -- Popular dados iniciais de exemplo
    SELECT id INTO v_tenant_id FROM public.tenants LIMIT 1;
    IF v_tenant_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM public.intranet_onboarding_etapas) THEN
            INSERT INTO public.intranet_onboarding_etapas (titulo, descricao, dia, ordem, tenant_id)
            VALUES ('Boas-vindas e Configuração', 'Apresentação da clínica e configuração de acessos.', 1, 1, v_tenant_id)
            RETURNING id INTO v_etapa1_id;

            INSERT INTO public.intranet_onboarding_tarefas (etapa_id, titulo, descricao, ordem, tenant_id)
            VALUES 
            (v_etapa1_id, 'Assinar documentos de RH', 'Entregar cópia da documentação na gestão.', 1, v_tenant_id),
            (v_etapa1_id, 'Acessar e-mail corporativo', 'Fazer o primeiro acesso no e-mail.', 2, v_tenant_id);

            INSERT INTO public.intranet_onboarding_etapas (titulo, descricao, dia, ordem, tenant_id)
            VALUES ('Ferramentas de Trabalho', 'Apresentação do sistema Nuvia Pro.', 2, 2, v_tenant_id)
            RETURNING id INTO v_etapa2_id;

            INSERT INTO public.intranet_onboarding_tarefas (etapa_id, titulo, descricao, ordem, tenant_id)
            VALUES (v_etapa2_id, 'Acessar o Nuvia Pro', 'Fazer login no sistema e explorar os menus.', 1, v_tenant_id);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM public.intranet_treinamentos_cursos) THEN
            INSERT INTO public.intranet_treinamentos_cursos (titulo, descricao, setor, ordem, tenant_id)
            VALUES ('Atendimento Inicial', 'Fundamentos para a recepção de pacientes.', 'Operacional', 1, v_tenant_id)
            RETURNING id INTO v_curso_id;

            INSERT INTO public.intranet_treinamentos_modulos (curso_id, titulo, descricao, video_url, nota_minima, quiz_json, ordem, tenant_id)
            VALUES (
                v_curso_id, 
                'Acolhimento de Pacientes', 
                'Como receber bem o paciente na recepção da clínica.',
                'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 
                7, 
                '[{"pergunta": "Qual a abordagem inicial correta ao receber o paciente?", "opcoes": ["Pedir o pagamento imediato", "Sorrir e perguntar o nome", "Mandar aguardar em silêncio"], "correta": 1}]'::jsonb, 
                1, 
                v_tenant_id
            );
        END IF;
    END IF;
END $$;

-- Habilitar RLS
ALTER TABLE public.intranet_onboarding_etapas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intranet_onboarding_tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intranet_onboarding_progresso ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intranet_treinamentos_cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intranet_treinamentos_modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intranet_treinamentos_progresso ENABLE ROW LEVEL SECURITY;

-- Aplicar Policies permissivas baseadas em autenticação
DROP POLICY IF EXISTS "authenticated_all_ioe" ON public.intranet_onboarding_etapas;
CREATE POLICY "authenticated_all_ioe" ON public.intranet_onboarding_etapas FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_iot" ON public.intranet_onboarding_tarefas;
CREATE POLICY "authenticated_all_iot" ON public.intranet_onboarding_tarefas FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_iop" ON public.intranet_onboarding_progresso;
CREATE POLICY "authenticated_all_iop" ON public.intranet_onboarding_progresso FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_itc" ON public.intranet_treinamentos_cursos;
CREATE POLICY "authenticated_all_itc" ON public.intranet_treinamentos_cursos FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_itm" ON public.intranet_treinamentos_modulos;
CREATE POLICY "authenticated_all_itm" ON public.intranet_treinamentos_modulos FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_itp" ON public.intranet_treinamentos_progresso;
CREATE POLICY "authenticated_all_itp" ON public.intranet_treinamentos_progresso FOR ALL TO authenticated USING (true) WITH CHECK (true);

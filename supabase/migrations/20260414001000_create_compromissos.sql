DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_compromisso_enum') THEN
        CREATE TYPE tipo_compromisso_enum AS ENUM (
            'consulta', 
            'viagem_pessoal', 
            'viagem_trabalho', 
            'reuniao', 
            'congresso', 
            'folga_ferias', 
            'treinamento', 
            'atendimento_externo'
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'permissao_compromisso_enum') THEN
        CREATE TYPE permissao_compromisso_enum AS ENUM ('visualizar', 'editar', 'deletar');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.compromissos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    tipo_compromisso tipo_compromisso_enum NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    hora_inicio TIME,
    hora_fim TIME,
    eh_dia_inteiro BOOLEAN NOT NULL DEFAULT false,
    descricao TEXT,
    arquivado BOOLEAN NOT NULL DEFAULT false,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.usuarios_compromissos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    compromisso_id UUID NOT NULL REFERENCES public.compromissos(id) ON DELETE CASCADE,
    usuario_criador_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    usuario_destinatario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    permissao permissao_compromisso_enum NOT NULL DEFAULT 'visualizar',
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.compromissos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios_compromissos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "compromissos_all" ON public.compromissos;
CREATE POLICY "compromissos_all" ON public.compromissos 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "usuarios_compromissos_all" ON public.usuarios_compromissos;
CREATE POLICY "usuarios_compromissos_all" ON public.usuarios_compromissos 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DO $$
DECLARE
    v_admin_id UUID;
BEGIN
    SELECT id INTO v_admin_id FROM public.usuarios LIMIT 1;
    
    IF v_admin_id IS NOT NULL THEN
        -- Semeando dados iniciais
        IF NOT EXISTS (SELECT 1 FROM public.compromissos WHERE tipo_compromisso = 'reuniao' AND usuario_id = v_admin_id) THEN
            INSERT INTO public.compromissos (usuario_id, tipo_compromisso, data_inicio, data_fim, hora_inicio, hora_fim, eh_dia_inteiro, descricao, arquivado)
            VALUES 
            (v_admin_id, 'reuniao', CURRENT_DATE, CURRENT_DATE, '10:00', '11:00', false, 'Reunião de alinhamento geral com a equipe.', false),
            (v_admin_id, 'congresso', CURRENT_DATE + INTERVAL '2 days', CURRENT_DATE + INTERVAL '4 days', null, null, true, 'Congresso Internacional de Odontologia.', false),
            (v_admin_id, 'folga_ferias', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE - INTERVAL '5 days', null, null, true, 'Férias (Expirado/Arquivado).', false);
        END IF;
    END IF;
END $$;

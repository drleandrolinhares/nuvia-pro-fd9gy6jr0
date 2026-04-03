-- Criar tabelas solicitadas
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    role TEXT DEFAULT 'user'
);

CREATE TABLE IF NOT EXISTS public.especialidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS public.produtos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    marca TEXT,
    variacao TEXT,
    categoria TEXT,
    especialidade_id UUID REFERENCES public.especialidades(id) ON DELETE SET NULL,
    codigo_barras TEXT,
    embalagem TEXT,
    sala TEXT,
    validade DATE,
    lote TEXT,
    custo_unitario NUMERIC(10,2) DEFAULT 0,
    quantidade_estoque INTEGER DEFAULT 0,
    quantidade_minima INTEGER DEFAULT 0,
    data_criacao TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.especialidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para usuarios
DROP POLICY IF EXISTS "usuarios_read" ON public.usuarios;
CREATE POLICY "usuarios_read" ON public.usuarios FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "usuarios_update" ON public.usuarios;
CREATE POLICY "usuarios_update" ON public.usuarios FOR UPDATE TO authenticated USING (id = auth.uid());

-- Políticas de RLS para especialidades
DROP POLICY IF EXISTS "especialidades_read" ON public.especialidades;
CREATE POLICY "especialidades_read" ON public.especialidades FOR SELECT TO authenticated USING (true);

-- Políticas de RLS para produtos
DROP POLICY IF EXISTS "produtos_read" ON public.produtos;
CREATE POLICY "produtos_read" ON public.produtos FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "produtos_insert" ON public.produtos;
CREATE POLICY "produtos_insert" ON public.produtos FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "produtos_update" ON public.produtos;
CREATE POLICY "produtos_update" ON public.produtos FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "produtos_delete" ON public.produtos;
CREATE POLICY "produtos_delete" ON public.produtos FOR DELETE TO authenticated USING (true);

-- Popular dados iniciais (Seed)
DO $$
DECLARE
    admin_id uuid;
    esp_imp uuid := '11111111-1111-1111-1111-111111111111'::uuid;
    esp_cli uuid := '22222222-2222-2222-2222-222222222222'::uuid;
    esp_pro uuid := '33333333-3333-3333-3333-333333333333'::uuid;
BEGIN
    -- Criar usuário Admin inicial
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'drleandrolinhares@gmail.com') THEN
        admin_id := gen_random_uuid();
        INSERT INTO auth.users (
            id, instance_id, email, encrypted_password, email_confirmed_at,
            created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
            is_super_admin, role, aud,
            confirmation_token, recovery_token, email_change_token_new,
            email_change, email_change_token_current,
            phone, phone_change, phone_change_token, reauthentication_token
        ) VALUES (
            admin_id, '00000000-0000-0000-0000-000000000000', 'drleandrolinhares@gmail.com',
            crypt('Skip@Pass', gen_salt('bf')), NOW(), NOW(), NOW(),
            '{"provider": "email", "providers": ["email"]}', '{"name": "Dr. Leandro Linhares"}',
            false, 'authenticated', 'authenticated',
            '', '', '', '', '', NULL, '', '', ''
        );

        INSERT INTO public.usuarios (id, email, nome, role)
        VALUES (admin_id, 'drleandrolinhares@gmail.com', 'Dr. Leandro Linhares', 'admin')
        ON CONFLICT (id) DO NOTHING;
    END IF;

    -- Criar Especialidades
    INSERT INTO public.especialidades (id, nome) VALUES
        (esp_imp, 'Implantodontia'),
        (esp_cli, 'Clínico Geral'),
        (esp_pro, 'Prótese')
    ON CONFLICT (id) DO NOTHING;

    -- Criar Produtos iniciais
    INSERT INTO public.produtos (id, nome, marca, embalagem, sala, validade, lote, custo_unitario, quantidade_estoque, quantidade_minima, especialidade_id)
    VALUES
        ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'Implante Titânio 3.5x10mm', 'Neodent', 'Unidade', 'Sala de Cirurgia', '2026-08-08', 'ND-9923', 320.00, 5, 10, esp_imp),
        ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, 'Resina Composta A2', '3M ESPE', 'Seringa 4g', 'Almoxarifado Principal', '2025-12-12', 'L-20394', 185.50, 45, 20, esp_cli),
        ('cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, 'Luvas de Procedimento M', 'Supermax', 'Caixa 100 un.', 'Almoxarifado Secundário', '2027-05-01', 'SM-1102', 45.90, 8, 15, esp_cli),
        ('dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid, 'Anestésico Lidocaína 2%', 'DFL', 'Caixa 50 tubetes', 'Almoxarifado Principal', '2024-10-11', 'LIDO-445', 89.00, 120, 50, esp_cli),
        ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, 'Cimento Resinoso Dual', 'FGM', 'Seringa 5g', 'Prótese', '2025-03-05', 'FGM-882', 145.00, 15, 10, esp_pro)
    ON CONFLICT (id) DO NOTHING;
END $$;

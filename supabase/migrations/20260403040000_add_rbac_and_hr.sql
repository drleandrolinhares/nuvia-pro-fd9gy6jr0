-- Function to check admin status safely
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN AS $func$
DECLARE
  v_role text;
  v_email text;
BEGIN
  v_email := current_setting('request.jwt.claims', true)::jsonb ->> 'email';
  IF v_email IN ('drleandro@nuvia.com', 'drleandrolinhares@gmail.com') THEN
    RETURN true;
  END IF;

  SELECT role INTO v_role FROM public.usuarios WHERE id = auth.uid();
  RETURN v_role = 'admin';
END;
$func$ LANGUAGE plpgsql SECURITY DEFINER;


-- Create cargos table
CREATE TABLE IF NOT EXISTS public.cargos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    descricao TEXT,
    setor TEXT
);

-- Create permissoes table
CREATE TABLE IF NOT EXISTS public.permissoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    descricao TEXT,
    modulo TEXT
);

-- Create cargo_permissoes table
CREATE TABLE IF NOT EXISTS public.cargo_permissoes (
    cargo_id UUID REFERENCES public.cargos(id) ON DELETE CASCADE,
    permissao_id UUID REFERENCES public.permissoes(id) ON DELETE CASCADE,
    PRIMARY KEY (cargo_id, permissao_id)
);

-- Alter usuarios table
ALTER TABLE public.usuarios 
ADD COLUMN IF NOT EXISTS cpf TEXT,
ADD COLUMN IF NOT EXISTS data_nascimento DATE,
ADD COLUMN IF NOT EXISTS telefone TEXT,
ADD COLUMN IF NOT EXISTS endereco TEXT,
ADD COLUMN IF NOT EXISTS cargo_id UUID REFERENCES public.cargos(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS data_admissao DATE,
ADD COLUMN IF NOT EXISTS salario NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ativo',
ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ DEFAULT NOW();

-- Create usuario_permissoes table
CREATE TABLE IF NOT EXISTS public.usuario_permissoes (
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    permissao_id UUID REFERENCES public.permissoes(id) ON DELETE CASCADE,
    PRIMARY KEY (usuario_id, permissao_id)
);

-- Create colaboradores_detalhes table
CREATE TABLE IF NOT EXISTS public.colaboradores_detalhes (
    usuario_id UUID PRIMARY KEY REFERENCES public.usuarios(id) ON DELETE CASCADE,
    banco TEXT,
    agencia TEXT,
    conta TEXT,
    pix TEXT,
    ctps TEXT,
    pis TEXT,
    dependentes INTEGER DEFAULT 0,
    beneficiario_emergencia TEXT
);

-- RLS
ALTER TABLE public.cargos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cargo_permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuario_permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colaboradores_detalhes ENABLE ROW LEVEL SECURITY;

-- Policies for cargos
DROP POLICY IF EXISTS "cargos_read" ON public.cargos;
CREATE POLICY "cargos_read" ON public.cargos FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "cargos_all" ON public.cargos;
CREATE POLICY "cargos_all" ON public.cargos FOR ALL TO authenticated USING (public.is_admin());

-- Policies for permissoes
DROP POLICY IF EXISTS "permissoes_read" ON public.permissoes;
CREATE POLICY "permissoes_read" ON public.permissoes FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "permissoes_all" ON public.permissoes;
CREATE POLICY "permissoes_all" ON public.permissoes FOR ALL TO authenticated USING (public.is_admin());

-- Policies for cargo_permissoes
DROP POLICY IF EXISTS "cargo_permissoes_read" ON public.cargo_permissoes;
CREATE POLICY "cargo_permissoes_read" ON public.cargo_permissoes FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "cargo_permissoes_all" ON public.cargo_permissoes;
CREATE POLICY "cargo_permissoes_all" ON public.cargo_permissoes FOR ALL TO authenticated USING (public.is_admin());

-- Policies for usuario_permissoes
DROP POLICY IF EXISTS "usuario_permissoes_read" ON public.usuario_permissoes;
CREATE POLICY "usuario_permissoes_read" ON public.usuario_permissoes FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "usuario_permissoes_all" ON public.usuario_permissoes;
CREATE POLICY "usuario_permissoes_all" ON public.usuario_permissoes FOR ALL TO authenticated USING (public.is_admin());

-- Policies for colaboradores_detalhes
DROP POLICY IF EXISTS "colaboradores_detalhes_read" ON public.colaboradores_detalhes;
CREATE POLICY "colaboradores_detalhes_read" ON public.colaboradores_detalhes FOR SELECT TO authenticated USING (
  usuario_id = auth.uid() OR public.is_admin()
);
DROP POLICY IF EXISTS "colaboradores_detalhes_all" ON public.colaboradores_detalhes;
CREATE POLICY "colaboradores_detalhes_all" ON public.colaboradores_detalhes FOR ALL TO authenticated USING (public.is_admin());

-- Atualizar política de usuários
DROP POLICY IF EXISTS "usuarios_read" ON public.usuarios;
CREATE POLICY "usuarios_read" ON public.usuarios FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "usuarios_update" ON public.usuarios;
CREATE POLICY "usuarios_update" ON public.usuarios FOR UPDATE TO authenticated USING (
  id = auth.uid() OR public.is_admin()
);

DROP POLICY IF EXISTS "usuarios_insert" ON public.usuarios;
CREATE POLICY "usuarios_insert" ON public.usuarios FOR INSERT TO authenticated WITH CHECK (
  public.is_admin()
);

DROP POLICY IF EXISTS "usuarios_delete" ON public.usuarios;
CREATE POLICY "usuarios_delete" ON public.usuarios FOR DELETE TO authenticated USING (
  public.is_admin()
);

-- Inserir CEO e Seed data
DO $seed$
DECLARE
  ceo_id uuid;
  cargo_ceo uuid := gen_random_uuid();
  cargo_dentista uuid := gen_random_uuid();
  cargo_recepcao uuid := gen_random_uuid();
  
  perm_estoque_ver uuid := gen_random_uuid();
  perm_estoque_editar uuid := gen_random_uuid();
  perm_config_ver uuid := gen_random_uuid();
  perm_config_editar uuid := gen_random_uuid();
  perm_usuarios_ver uuid := gen_random_uuid();
  perm_usuarios_editar uuid := gen_random_uuid();
BEGIN
  -- Insert Cargos
  INSERT INTO public.cargos (id, nome, descricao, setor) VALUES
    (cargo_ceo, 'CEO', 'Diretor Executivo', 'Diretoria'),
    (cargo_dentista, 'Dentista', 'Profissional de Odontologia', 'Clínico'),
    (cargo_recepcao, 'Recepcionista', 'Atendimento ao Cliente', 'Administrativo')
  ON CONFLICT DO NOTHING;

  -- Insert Permissoes
  INSERT INTO public.permissoes (id, nome, descricao, modulo) VALUES
    (perm_estoque_ver, 'Ver Estoque', 'Visualizar itens do estoque', 'Estoque'),
    (perm_estoque_editar, 'Editar Estoque', 'Adicionar, editar e remover itens do estoque', 'Estoque'),
    (perm_config_ver, 'Ver Configurações', 'Visualizar configurações do sistema', 'Configurações'),
    (perm_config_editar, 'Editar Configurações', 'Alterar configurações do sistema', 'Configurações'),
    (perm_usuarios_ver, 'Ver Usuários', 'Visualizar lista de usuários e colaboradores', 'Usuários'),
    (perm_usuarios_editar, 'Editar Usuários', 'Gerenciar usuários, cargos e permissões', 'Usuários')
  ON CONFLICT DO NOTHING;

  -- Insert Cargo Permissoes
  INSERT INTO public.cargo_permissoes (cargo_id, permissao_id) VALUES
    (cargo_ceo, perm_estoque_ver), (cargo_ceo, perm_estoque_editar), (cargo_ceo, perm_config_ver), (cargo_ceo, perm_config_editar), (cargo_ceo, perm_usuarios_ver), (cargo_ceo, perm_usuarios_editar),
    (cargo_dentista, perm_estoque_ver),
    (cargo_recepcao, perm_estoque_ver), (cargo_recepcao, perm_estoque_editar)
  ON CONFLICT DO NOTHING;

  -- Update drleandrolinhares@gmail.com if exists to Admin
  UPDATE public.usuarios SET role = 'admin', cargo_id = cargo_ceo WHERE email = 'drleandrolinhares@gmail.com';

  -- Create CEO User drleandro@nuvia.com
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'drleandro@nuvia.com') THEN
    ceo_id := gen_random_uuid();
    INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
        is_super_admin, role, aud,
        confirmation_token, recovery_token, email_change_token_new,
        email_change, email_change_token_current,
        phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
        ceo_id, '00000000-0000-0000-0000-000000000000', 'drleandro@nuvia.com',
        crypt('Skip@Pass123!', gen_salt('bf')), NOW(), NOW(), NOW(),
        '{"provider": "email", "providers": ["email"]}', '{"name": "Dr. Leandro Nuvia"}',
        false, 'authenticated', 'authenticated',
        '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.usuarios (id, email, nome, role, cargo_id, status)
    VALUES (ceo_id, 'drleandro@nuvia.com', 'Dr. Leandro Nuvia', 'admin', cargo_ceo, 'ativo')
    ON CONFLICT (id) DO NOTHING;
    
    INSERT INTO public.colaboradores_detalhes (usuario_id, banco, agencia, conta, pix)
    VALUES (ceo_id, 'Nubank', '0001', '123456-7', 'drleandro@nuvia.com')
    ON CONFLICT (usuario_id) DO NOTHING;
  END IF;

END $seed$;

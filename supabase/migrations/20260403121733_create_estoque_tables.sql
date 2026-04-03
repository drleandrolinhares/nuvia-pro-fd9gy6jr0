-- Insert 'Gerenciar Estoque' permission
INSERT INTO public.permissoes (nome, descricao, modulo)
VALUES ('Gerenciar Estoque', 'Permite gerenciar entradas, saídas e fornecedores do estoque', 'Estoque')
ON CONFLICT (nome) DO NOTHING;

-- Table: fornecedores
CREATE TABLE IF NOT EXISTS public.fornecedores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    cnpj TEXT,
    telefone TEXT,
    email TEXT,
    endereco TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Table: entrada_produtos
CREATE TABLE IF NOT EXISTS public.entrada_produtos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
    fornecedor_id UUID REFERENCES public.fornecedores(id) ON DELETE SET NULL,
    quantidade_embalagem INTEGER,
    quantidade_comprada INTEGER NOT NULL,
    unidade_consumo TEXT,
    preco_unitario NUMERIC NOT NULL,
    preco_total NUMERIC NOT NULL,
    data_entrada TIMESTAMPTZ DEFAULT NOW(),
    observacoes TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Table: saida_produtos
CREATE TABLE IF NOT EXISTS public.saida_produtos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
    quantidade INTEGER NOT NULL,
    tipo_saida TEXT CHECK (tipo_saida IN ('definitiva', 'parcial')),
    descricao TEXT,
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    data_saida TIMESTAMPTZ DEFAULT NOW(),
    observacoes TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Table: historico_compras
CREATE TABLE IF NOT EXISTS public.historico_compras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
    fornecedor_id UUID REFERENCES public.fornecedores(id) ON DELETE SET NULL,
    preco_anterior NUMERIC NOT NULL,
    data_compra TIMESTAMPTZ DEFAULT NOW(),
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entrada_produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saida_produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_compras ENABLE ROW LEVEL SECURITY;

-- RLS Policies for fornecedores
DROP POLICY IF EXISTS "fornecedores_read" ON public.fornecedores;
CREATE POLICY "fornecedores_read" ON public.fornecedores
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "fornecedores_insert" ON public.fornecedores;
CREATE POLICY "fornecedores_insert" ON public.fornecedores
    FOR INSERT TO authenticated WITH CHECK (is_admin() OR has_permission('Gerenciar Estoque'));

DROP POLICY IF EXISTS "fornecedores_update" ON public.fornecedores;
CREATE POLICY "fornecedores_update" ON public.fornecedores
    FOR UPDATE TO authenticated USING (is_admin() OR has_permission('Gerenciar Estoque')) WITH CHECK (is_admin() OR has_permission('Gerenciar Estoque'));

DROP POLICY IF EXISTS "fornecedores_delete" ON public.fornecedores;
CREATE POLICY "fornecedores_delete" ON public.fornecedores
    FOR DELETE TO authenticated USING (is_admin() OR has_permission('Gerenciar Estoque'));

-- RLS Policies for entrada_produtos
DROP POLICY IF EXISTS "entrada_produtos_read" ON public.entrada_produtos;
CREATE POLICY "entrada_produtos_read" ON public.entrada_produtos
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "entrada_produtos_insert" ON public.entrada_produtos;
CREATE POLICY "entrada_produtos_insert" ON public.entrada_produtos
    FOR INSERT TO authenticated WITH CHECK (is_admin() OR has_permission('Gerenciar Estoque'));

DROP POLICY IF EXISTS "entrada_produtos_update" ON public.entrada_produtos;
CREATE POLICY "entrada_produtos_update" ON public.entrada_produtos
    FOR UPDATE TO authenticated USING (is_admin() OR has_permission('Gerenciar Estoque')) WITH CHECK (is_admin() OR has_permission('Gerenciar Estoque'));

DROP POLICY IF EXISTS "entrada_produtos_delete" ON public.entrada_produtos;
CREATE POLICY "entrada_produtos_delete" ON public.entrada_produtos
    FOR DELETE TO authenticated USING (is_admin() OR has_permission('Gerenciar Estoque'));

-- RLS Policies for saida_produtos
DROP POLICY IF EXISTS "saida_produtos_read" ON public.saida_produtos;
CREATE POLICY "saida_produtos_read" ON public.saida_produtos
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "saida_produtos_insert" ON public.saida_produtos;
CREATE POLICY "saida_produtos_insert" ON public.saida_produtos
    FOR INSERT TO authenticated WITH CHECK (is_admin() OR has_permission('Gerenciar Estoque'));

DROP POLICY IF EXISTS "saida_produtos_update" ON public.saida_produtos;
CREATE POLICY "saida_produtos_update" ON public.saida_produtos
    FOR UPDATE TO authenticated USING (is_admin() OR has_permission('Gerenciar Estoque')) WITH CHECK (is_admin() OR has_permission('Gerenciar Estoque'));

DROP POLICY IF EXISTS "saida_produtos_delete" ON public.saida_produtos;
CREATE POLICY "saida_produtos_delete" ON public.saida_produtos
    FOR DELETE TO authenticated USING (is_admin() OR has_permission('Gerenciar Estoque'));

-- RLS Policies for historico_compras
DROP POLICY IF EXISTS "historico_compras_read" ON public.historico_compras;
CREATE POLICY "historico_compras_read" ON public.historico_compras
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "historico_compras_insert" ON public.historico_compras;
CREATE POLICY "historico_compras_insert" ON public.historico_compras
    FOR INSERT TO authenticated WITH CHECK (is_admin() OR has_permission('Gerenciar Estoque'));

DROP POLICY IF EXISTS "historico_compras_update" ON public.historico_compras;
CREATE POLICY "historico_compras_update" ON public.historico_compras
    FOR UPDATE TO authenticated USING (is_admin() OR has_permission('Gerenciar Estoque')) WITH CHECK (is_admin() OR has_permission('Gerenciar Estoque'));

DROP POLICY IF EXISTS "historico_compras_delete" ON public.historico_compras;
CREATE POLICY "historico_compras_delete" ON public.historico_compras
    FOR DELETE TO authenticated USING (is_admin() OR has_permission('Gerenciar Estoque'));

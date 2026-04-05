-- 2. Tabela "dentistas_avaliadores"
CREATE TABLE IF NOT EXISTS public.dentistas_avaliadores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  especialidade TEXT,
  meta_mensal_criativos INTEGER DEFAULT 0,
  status TEXT DEFAULT 'ativo',
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela "crc_comercial"
CREATE TABLE IF NOT EXISTS public.crc_comercial (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  status TEXT DEFAULT 'ativo',
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela "pacientes"
CREATE TABLE IF NOT EXISTS public.pacientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  data_cadastro DATE DEFAULT CURRENT_DATE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabela "avaliacoes"
CREATE TABLE IF NOT EXISTS public.avaliacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE NOT NULL,
  dentista_avaliador_id UUID REFERENCES public.dentistas_avaliadores(id) ON DELETE SET NULL,
  crc_comercial_id UUID REFERENCES public.crc_comercial(id) ON DELETE SET NULL,
  data_avaliacao DATE DEFAULT CURRENT_DATE,
  valor_orcamento NUMERIC(10,2),
  tipo_tratamento TEXT,
  status TEXT DEFAULT 'avaliacao_realizada',
  temperatura_lead TEXT DEFAULT 'morno',
  proxima_data_contato DATE,
  observacoes TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabela "orcamentos"
CREATE TABLE IF NOT EXISTS public.orcamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  avaliacao_id UUID REFERENCES public.avaliacoes(id) ON DELETE CASCADE NOT NULL,
  valor NUMERIC(10,2) NOT NULL,
  data_orcamento DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'ativo',
  ordem INTEGER DEFAULT 1,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabela "contatos_follow_up"
CREATE TABLE IF NOT EXISTS public.contatos_follow_up (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  avaliacao_id UUID REFERENCES public.avaliacoes(id) ON DELETE CASCADE NOT NULL,
  data_contato TIMESTAMPTZ DEFAULT NOW(),
  responsavel_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  canal TEXT,
  resumo_conversa TEXT,
  resultado TEXT,
  observacoes TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Tabela "vendas_concretizadas"
CREATE TABLE IF NOT EXISTS public.vendas_concretizadas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  avaliacao_id UUID REFERENCES public.avaliacoes(id) ON DELETE CASCADE NOT NULL,
  data_concretizacao DATE DEFAULT CURRENT_DATE,
  valor_total_tratamento NUMERIC(10,2) NOT NULL,
  valor_entrada NUMERIC(10,2),
  percentual_entrada NUMERIC(5,2),
  dentista_avaliador_id UUID REFERENCES public.dentistas_avaliadores(id) ON DELETE SET NULL,
  crc_participou BOOLEAN DEFAULT false,
  crc_comercial_id UUID REFERENCES public.crc_comercial(id) ON DELETE SET NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Tabela "criativos_gerados"
CREATE TABLE IF NOT EXISTS public.criativos_gerados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dentista_avaliador_id UUID REFERENCES public.dentistas_avaliadores(id) ON DELETE CASCADE NOT NULL,
  data_criacao DATE DEFAULT CURRENT_DATE,
  descricao_video TEXT,
  mes_referencia DATE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Tabela "comissoes_dentista"
CREATE TABLE IF NOT EXISTS public.comissoes_dentista (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venda_id UUID REFERENCES public.vendas_concretizadas(id) ON DELETE CASCADE NOT NULL,
  dentista_avaliador_id UUID REFERENCES public.dentistas_avaliadores(id) ON DELETE CASCADE NOT NULL,
  percentual_faixa NUMERIC(5,2),
  valor_comissao NUMERIC(10,2),
  data_calculo DATE DEFAULT CURRENT_DATE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Tabela "comissoes_crc"
CREATE TABLE IF NOT EXISTS public.comissoes_crc (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venda_id UUID REFERENCES public.vendas_concretizadas(id) ON DELETE CASCADE NOT NULL,
  crc_comercial_id UUID REFERENCES public.crc_comercial(id) ON DELETE CASCADE NOT NULL,
  percentual_faixa NUMERIC(5,2),
  valor_comissao NUMERIC(10,2),
  data_calculo DATE DEFAULT CURRENT_DATE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Tabela "referencias_comissao_dentista"
CREATE TABLE IF NOT EXISTS public.referencias_comissao_dentista (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faixa_entrada_minima NUMERIC(5,2),
  faixa_entrada_maxima NUMERIC(5,2),
  percentual_comissao NUMERIC(5,2),
  status TEXT DEFAULT 'ativo',
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Tabela "referencias_comissao_crc"
CREATE TABLE IF NOT EXISTS public.referencias_comissao_crc (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faixa_entrada_minima NUMERIC(5,2),
  faixa_entrada_maxima NUMERIC(5,2),
  percentual_comissao NUMERIC(5,2),
  status TEXT DEFAULT 'ativo',
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Tabela "faturamento_comissoes"
CREATE TABLE IF NOT EXISTS public.faturamento_comissoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  periodo_inicio DATE,
  periodo_fim DATE,
  data_faturamento DATE DEFAULT CURRENT_DATE,
  data_pagamento_prevista DATE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Tabela "faturas_comissoes"
CREATE TABLE IF NOT EXISTS public.faturas_comissoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faturamento_id UUID REFERENCES public.faturamento_comissoes(id) ON DELETE CASCADE NOT NULL,
  profissional_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE NOT NULL,
  tipo_profissional TEXT,
  valor_total_comissao NUMERIC(10,2),
  status_pagamento TEXT DEFAULT 'em_aberto',
  data_pagamento DATE,
  forma_pagamento TEXT,
  observacao_pagamento TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.dentistas_avaliadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crc_comercial ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orcamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contatos_follow_up ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendas_concretizadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.criativos_gerados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comissoes_dentista ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comissoes_crc ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referencias_comissao_dentista ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referencias_comissao_crc ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faturamento_comissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faturas_comissoes ENABLE ROW LEVEL SECURITY;

-- Criar políticas genericas para administradores e usuarios autenticados
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN 
    SELECT unnest(ARRAY[
      'dentistas_avaliadores', 'crc_comercial', 'pacientes', 'avaliacoes',
      'orcamentos', 'contatos_follow_up', 'vendas_concretizadas', 'criativos_gerados',
      'comissoes_dentista', 'comissoes_crc', 'referencias_comissao_dentista',
      'referencias_comissao_crc', 'faturamento_comissoes', 'faturas_comissoes'
    ])
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "%I_all" ON public.%I;', t, t);
    EXECUTE format('CREATE POLICY "%I_all" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true);', t, t);
  END LOOP;
END $$;

-- Criar Índices de Busca Frequente
CREATE INDEX IF NOT EXISTS avaliacoes_paciente_id_idx ON public.avaliacoes(paciente_id);
CREATE INDEX IF NOT EXISTS avaliacoes_dentista_avaliador_id_idx ON public.avaliacoes(dentista_avaliador_id);
CREATE INDEX IF NOT EXISTS avaliacoes_crc_comercial_id_idx ON public.avaliacoes(crc_comercial_id);
CREATE INDEX IF NOT EXISTS avaliacoes_status_idx ON public.avaliacoes(status);

CREATE INDEX IF NOT EXISTS orcamentos_avaliacao_id_idx ON public.orcamentos(avaliacao_id);
CREATE INDEX IF NOT EXISTS orcamentos_status_idx ON public.orcamentos(status);

CREATE INDEX IF NOT EXISTS contatos_follow_up_avaliacao_id_idx ON public.contatos_follow_up(avaliacao_id);

CREATE INDEX IF NOT EXISTS vendas_concretizadas_avaliacao_id_idx ON public.vendas_concretizadas(avaliacao_id);
CREATE INDEX IF NOT EXISTS vendas_concretizadas_dentista_avaliador_id_idx ON public.vendas_concretizadas(dentista_avaliador_id);
CREATE INDEX IF NOT EXISTS vendas_concretizadas_crc_comercial_id_idx ON public.vendas_concretizadas(crc_comercial_id);

CREATE INDEX IF NOT EXISTS comissoes_dentista_venda_id_idx ON public.comissoes_dentista(venda_id);
CREATE INDEX IF NOT EXISTS comissoes_dentista_dentista_avaliador_id_idx ON public.comissoes_dentista(dentista_avaliador_id);

CREATE INDEX IF NOT EXISTS comissoes_crc_venda_id_idx ON public.comissoes_crc(venda_id);
CREATE INDEX IF NOT EXISTS comissoes_crc_crc_comercial_id_idx ON public.comissoes_crc(crc_comercial_id);

CREATE INDEX IF NOT EXISTS criativos_gerados_dentista_avaliador_id_idx ON public.criativos_gerados(dentista_avaliador_id);

CREATE INDEX IF NOT EXISTS faturas_comissoes_faturamento_id_idx ON public.faturas_comissoes(faturamento_id);
CREATE INDEX IF NOT EXISTS faturas_comissoes_profissional_id_idx ON public.faturas_comissoes(profissional_id);

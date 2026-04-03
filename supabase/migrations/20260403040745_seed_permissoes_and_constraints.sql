DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'permissoes_nome_key'
  ) THEN
    ALTER TABLE public.permissoes ADD CONSTRAINT permissoes_nome_key UNIQUE (nome);
  END IF;
END $$;

INSERT INTO public.permissoes (nome, descricao, modulo) VALUES
  ('Gerenciar Colaboradores', 'Permite adicionar, editar e inativar colaboradores', 'RH'),
  ('Acessar Estoque', 'Permite visualizar e movimentar o estoque', 'Estoque'),
  ('Acessar Financeiro', 'Permite visualizar relatórios e dados financeiros', 'Financeiro'),
  ('Gerar Relatórios', 'Permite gerar relatórios operacionais e gerenciais', 'Relatórios'),
  ('Configurar Sistema', 'Permite alterar configurações globais', 'Configurações')
ON CONFLICT (nome) DO NOTHING;

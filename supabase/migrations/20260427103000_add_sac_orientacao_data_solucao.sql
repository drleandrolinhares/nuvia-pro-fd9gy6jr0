ALTER TABLE public.sac_configuracoes ADD COLUMN IF NOT EXISTS orientacao_data_solucao TEXT NOT NULL DEFAULT 'Se o status do caso estiver como SENDO TRATADO, esta data representará a data prevista para a solução.
Se o status estiver como RESOLVIDO, a data significará a data da solução do caso.';

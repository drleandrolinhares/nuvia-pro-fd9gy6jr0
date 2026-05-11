DO $$
BEGIN
    ALTER TABLE public.funil_leads ADD COLUMN IF NOT EXISTS quantidade_contatos INTEGER DEFAULT 0;
    ALTER TABLE public.funil_leads ADD COLUMN IF NOT EXISTS data_agendamento TIMESTAMPTZ;
END $$;

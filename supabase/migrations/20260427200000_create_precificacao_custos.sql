CREATE TABLE IF NOT EXISTS public.precificacao_custos_fixos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  descricao TEXT NOT NULL,
  valor NUMERIC NOT NULL DEFAULT 0,
  ordem INTEGER NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.precificacao_custos_fixos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "precificacao_custos_fixos_all" ON public.precificacao_custos_fixos;
CREATE POLICY "precificacao_custos_fixos_all" ON public.precificacao_custos_fixos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DO $$
DECLARE
  items text[] := ARRAY[
    'Pró-labore',
    'Salários Funcionários | Condução | Alimentação | Cesta Básica',
    'Exames Admissional | Demissional',
    'Provisionamento férias e 13º',
    'Rescisões',
    'GPS',
    'FGTS',
    'Mensalidade',
    'Contabilidade',
    'Taxas: Licença | Lixo séptico | Publicidade',
    'Assistência Juridica',
    'CRO',
    'Sindicatos',
    'Uniforme',
    'Segurança | Alarme',
    'Aluguel | IPTU | Condominio',
    'Energia | Água',
    'Telefonia | Internet',
    'Encargos bancários',
    'Material Higiene | Limpeza',
    'Dedetização',
    'Manutenções: computadores (CPU) | Equipamentos Odontotológicos | Geral',
    'Software',
    'Brindes | kit Higiene',
    'Café e açucar (comes e bebes)',
    'Gráfica',
    'Site (dominio e hospedagem)',
    'Marketing (empresa e patrocinio)',
    'Material escritório',
    'Correios',
    'Motoboy',
    'Fundo de reserva',
    'Fundo de melhorias',
    'Dental',
    'Outros'
  ];
  i integer;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.precificacao_custos_fixos LIMIT 1) THEN
    FOR i IN 1..array_length(items, 1) LOOP
      INSERT INTO public.precificacao_custos_fixos (descricao, ordem)
      VALUES (items[i], i * 10);
    END LOOP;
  END IF;
END $$;

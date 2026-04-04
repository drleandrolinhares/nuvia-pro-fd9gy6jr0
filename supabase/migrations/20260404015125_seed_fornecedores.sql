DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.fornecedores WHERE nome = 'Straumann') THEN
    INSERT INTO public.fornecedores (nome, cnpj, telefone, email)
    VALUES ('Straumann', '11.111.111/0001-11', '(11) 99999-1111', 'contato@straumann.com');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.fornecedores WHERE nome = 'Nobel Biocare') THEN
    INSERT INTO public.fornecedores (nome, cnpj, telefone, email)
    VALUES ('Nobel Biocare', '22.222.222/0001-22', '(11) 99999-2222', 'contato@nobel.com');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.fornecedores WHERE nome = '3M Oral Care') THEN
    INSERT INTO public.fornecedores (nome, cnpj, telefone, email)
    VALUES ('3M Oral Care', '33.333.333/0001-33', '(11) 99999-3333', 'contato@3m.com');
  END IF;
END $$;

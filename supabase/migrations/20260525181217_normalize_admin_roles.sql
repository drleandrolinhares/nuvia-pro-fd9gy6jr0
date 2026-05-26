DO $$
BEGIN
  -- Normaliza todos os roles de admin para minúsculo, garantindo case-insensitivity na base
  UPDATE public.usuarios
  SET role = 'admin'
  WHERE lower(role) = 'admin';

  -- Garante que a Samara (e qualquer outro usuário chave que precise ser admin) 
  -- possua a role 'admin' configurada corretamente
  UPDATE public.usuarios
  SET role = 'admin'
  WHERE lower(nome) LIKE '%samara%';
END $$;

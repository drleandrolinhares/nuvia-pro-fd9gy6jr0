import { supabase } from '@/lib/supabase/client'

export async function getMeuPerfil(userId: string) {
  const { data, error } = await supabase
    .from('usuarios')
    .select(`
      *,
      cargo:cargos!usuarios_cargo_id_fkey(nome, setor),
      cargo_secundario:cargos!usuarios_cargo_secundario_id_fkey(nome, setor),
      detalhes:colaboradores_detalhes(*)
    `)
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function updateMeusDadosPessoais(userId: string, data: any) {
  const { error: userError } = await supabase
    .from('usuarios')
    .update({
      nome: data.nome,
      cpf: data.cpf,
      data_nascimento: data.data_nascimento || null,
      telefone: data.telefone,
      endereco: data.endereco,
    })
    .eq('id', userId)

  if (userError) throw userError

  const { error: detalhesError } = await supabase.from('colaboradores_detalhes').upsert({
    usuario_id: userId,
    banco: data.banco,
    agencia: data.agencia,
    conta: data.conta,
    pix: data.pix,
    ctps: data.ctps,
    pis: data.pis,
    beneficiario_emergencia: data.beneficiario_emergencia,
  })

  if (detalhesError) throw detalhesError
}

export async function uploadAvatar(userId: string, file: File) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}-${Math.random()}.${fileExt}`
  const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file)
  if (uploadError) throw uploadError

  const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)

  const { error: updateError } = await supabase
    .from('usuarios')
    .update({ avatar_url: data.publicUrl })
    .eq('id', userId)
  if (updateError) throw updateError

  return data.publicUrl
}

export async function updateMinhaSenha(email: string, senhaAtual: string, novaSenha: string) {
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: senhaAtual,
  })

  if (signInError) throw new Error('Senha atual incorreta.')

  const { error: updateError } = await supabase.auth.updateUser({
    password: novaSenha,
  })

  if (updateError) throw updateError
}

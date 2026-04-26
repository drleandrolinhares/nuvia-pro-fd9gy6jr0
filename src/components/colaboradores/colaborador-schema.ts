import { z } from 'zod'

export const colaboradorSchema = z
  .object({
    id: z.string().optional(),
    nome: z.string().min(1, 'Nome é obrigatório'),
    email: z.string().email('E-mail inválido'),
    password: z.string().optional(),
    cpf: z
      .string()
      .optional()
      .refine(
        (val) => !val || val.replace(/\D/g, '').length === 11,
        'CPF inválido, deve conter 11 dígitos',
      ),
    data_nascimento: z.string().optional(),
    telefone: z.string().optional(),
    endereco: z.string().optional(),
    cargo_id: z.string().min(1, 'Cargo é obrigatório'),
    cargo_secundario_id: z.string().nullable().optional(),
    data_admissao: z.string().optional(),
    salario: z.coerce.number().optional(),
    status: z.string().optional(),
    banco: z.string().optional(),
    agencia: z.string().optional(),
    conta: z.string().optional(),
    pix: z.string().optional(),
    ctps: z.string().optional(),
    pis: z.string().optional(),
    emergencia_nome: z.string().optional(),
    emergencia_telefone: z.string().optional(),
    emergencia_parentesco: z.string().optional(),

    horario_entrada: z.string().optional().nullable(),
    inicio_lanche_manha: z.string().optional().nullable(),
    fim_lanche_manha: z.string().optional().nullable(),
    saida_almoco: z.string().optional().nullable(),
    retorno_almoco: z.string().optional().nullable(),
    inicio_lanche_tarde: z.string().optional().nullable(),
    fim_lanche_tarde: z.string().optional().nullable(),
    horario_saida: z.string().optional().nullable(),
    possui_carteira: z.boolean().optional().default(true),
    dias_trabalho: z.array(z.number()).optional().default([1, 2, 3, 4, 5]),
  })
  .refine((data) => !!data.id || (data.password && data.password.length >= 6), {
    message: 'Senha obrigatória (mín. 6 caracteres) para novos usuários',
    path: ['password'],
  })

export type ColaboradorFormData = z.infer<typeof colaboradorSchema>

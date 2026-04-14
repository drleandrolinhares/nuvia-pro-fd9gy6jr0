export type TipoEvento =
  | 'Consulta'
  | 'Viagem Pessoal'
  | 'Viagem a Trabalho'
  | 'Reunião'
  | 'Congresso'
  | 'Folga/Férias'
  | 'Treinamento'
  | 'Atendimento Externo'

export interface Evento {
  id: string
  colaborador: string
  tipo: TipoEvento
  dataInicio: string
  dataFim: string
  diaInteiro: boolean
  horaInicio?: string
  horaFim?: string
  descricao: string
}

const today = new Date()
const y = today.getFullYear()
const m = today.getMonth()

export const MOCK_EVENTOS: Evento[] = [
  {
    id: '1',
    colaborador: 'Dr. Leandro Linhares',
    tipo: 'Congresso',
    dataInicio: new Date(y, m, 15).toISOString(),
    dataFim: new Date(y, m, 18).toISOString(),
    diaInteiro: true,
    descricao: 'Participação no CIOSP em São Paulo. Palestra na quinta-feira.',
  },
  {
    id: '2',
    colaborador: 'Dra. Amanda Silva',
    tipo: 'Folga/Férias',
    dataInicio: new Date(y, m, 5).toISOString(),
    dataFim: new Date(y, m, 15).toISOString(),
    diaInteiro: true,
    descricao: 'Férias regulares da primeira quinzena.',
  },
  {
    id: '3',
    colaborador: 'Carlos Eduardo (CRC)',
    tipo: 'Treinamento',
    dataInicio: new Date(y, m, 10).toISOString(),
    dataFim: new Date(y, m, 10).toISOString(),
    diaInteiro: false,
    horaInicio: '09:00',
    horaFim: '12:00',
    descricao: 'Treinamento de novas técnicas de abordagem comercial.',
  },
  {
    id: '4',
    colaborador: 'Dra. Beatriz',
    tipo: 'Reunião',
    dataInicio: new Date(y, m, today.getDate()).toISOString(),
    dataFim: new Date(y, m, today.getDate()).toISOString(),
    diaInteiro: false,
    horaInicio: '14:00',
    horaFim: '16:00',
    descricao: 'Reunião de alinhamento de metas do semestre.',
  },
  {
    id: '5',
    colaborador: 'Marcos (Financeiro)',
    tipo: 'Viagem Pessoal',
    dataInicio: new Date(y, m, 22).toISOString(),
    dataFim: new Date(y, m, 25).toISOString(),
    diaInteiro: true,
    descricao: 'Viagem para o interior com a família.',
  },
  {
    id: '6',
    colaborador: 'Dra. Juliana',
    tipo: 'Atendimento Externo',
    dataInicio: new Date(y, m, 28).toISOString(),
    dataFim: new Date(y, m, 28).toISOString(),
    diaInteiro: false,
    horaInicio: '08:00',
    horaFim: '18:00',
    descricao: 'Ação social em escola pública do bairro.',
  },
  {
    id: '7',
    colaborador: 'Dr. Leandro Linhares',
    tipo: 'Consulta',
    dataInicio: new Date(y, m, today.getDate() + 2).toISOString(),
    dataFim: new Date(y, m, today.getDate() + 2).toISOString(),
    diaInteiro: false,
    horaInicio: '10:00',
    horaFim: '11:00',
    descricao: 'Avaliação de implante complexo - Paciente João.',
  },
]
